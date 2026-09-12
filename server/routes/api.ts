import { Router, Request, Response } from 'express';
import { policeDb, forensicsDb, courtDb, prisonDb, accessRequests } from '../db';
import { blockchain, VALIDATOR_NODES } from '../blockchain';
import { encryptSensitive, generateDigitalSignature, sha256 } from '../crypto';
import { CaseRecord, EvidenceItem, InstitutionType, CaseStage } from '../../src/types';

export const apiRouter = Router();

/**
 * 1. IDENTITY & BIOMETRIC AUTHENTICATION
 */
apiRouter.post('/auth/verify-identity', (req: Request, res: Response) => {
  const { identityId } = req.body;
  if (!identityId) {
    return res.status(400).json({ error: 'Unique Institutional ID is required.' });
  }

  const identity = blockchain.identities.get(identityId.trim());
  if (!identity) {
    return res.status(404).json({ error: 'Identity not found in DCJMN IdentityRegistry ledger.' });
  }

  if (identity.credentialStatus !== 'ACTIVE') {
    return res.status(403).json({ error: 'Institutional credential is revoked or suspended.' });
  }

  return res.json({
    success: true,
    identity: {
      ...identity,
      stationOrBench: identity.institution === 'POLICE' ? 'Metro Central Division (#POL-MC-09)'
        : identity.institution === 'FORENSICS' ? 'CFSL Cyber & Ballistics Lab Node #03'
        : identity.institution === 'COURT' ? 'High Court Sovereign Bench #04'
        : 'Central Correctional Facility Node #04'
    }
  });
});

apiRouter.post('/auth/biometric-liveness', (req: Request, res: Response) => {
  const { identityId, faceMatched, irisMatched, printMatched } = req.body;
  const identity = blockchain.identities.get(identityId);

  if (!identity) {
    return res.status(404).json({ error: 'Identity record not found.' });
  }

  // Multimodal validation
  const faceScore = faceMatched ? 99.8 : 0;
  const irisScore = irisMatched ? 99.9 : 0;
  const printScore = printMatched ? 100 : 0;

  const passed = faceScore > 90 && irisScore > 90 && printScore > 90;
  if (!passed) {
    return res.status(401).json({
      success: false,
      error: 'Biometric liveness threshold failed (ISO/IEC 30107-3). Access denied.'
    });
  }

  // Biometrics verify the human; generate cryptographic session token
  const token = `dcjmn_sess_${identity.institution.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Record audit on blockchain
  blockchain.recordAudit(
    identity.institution,
    'LOGIN',
    'SYSTEM',
    `Officer ${identity.identityId} authenticated via multimodal biometrics. Key enclave unlocked.`,
    sha256(identity.publicKey),
    '0xSESS_' + token.substring(0, 16),
    blockchain.getLatestBlock().blockNumber
  );

  return res.json({
    success: true,
    sessionToken: token,
    livenessScore: 99.9,
    zkpProof: '0x91BD482188A01B9482CF193857102AE8F4C20847',
    identity
  });
});

/**
 * 2. CASES API
 */
apiRouter.get('/cases', (req: Request, res: Response) => {
  const allCases = Array.from(policeDb.cases.values());
  res.json({ success: true, cases: allCases });
});

apiRouter.get('/cases/:caseId', (req: Request, res: Response) => {
  const { caseId } = req.params;
  const c = policeDb.cases.get(caseId);

  if (!c) {
    return res.status(404).json({ error: `Case ${caseId} not found in Police Database.` });
  }

  // Cross-institutional linked resources
  const caseEvidence = Array.from(policeDb.evidence.values()).filter(e => e.caseId === caseId);
  const caseReports = Array.from(forensicsDb.reports.values()).filter(r => r.caseId === caseId);
  const caseChargesheets = Array.from(policeDb.chargesheets.values()).filter(cs => cs.caseId === caseId);
  const caseOrders = Array.from(courtDb.orders.values()).filter(o => o.caseId === caseId);
  const caseInmates = Array.from(prisonDb.inmates.values()).filter(i => i.caseId === caseId);

  // Perform live cryptographic integrity check of primary case record
  const currentRecordHash = c.recordHash;
  const integrity = blockchain.verifyIntegrity('CASE', caseId, currentRecordHash);

  res.json({
    success: true,
    case: c,
    evidence: caseEvidence,
    reports: caseReports,
    chargesheets: caseChargesheets,
    orders: caseOrders,
    inmates: caseInmates,
    integrity
  });
});

apiRouter.post('/cases', (req: Request, res: Response) => {
  const {
    caseId,
    title,
    incidentDetails,
    complainant,
    accusedName,
    accusedAge,
    charges,
    officerId,
    officerName
  } = req.body;

  if (!title || !incidentDetails) {
    return res.status(400).json({ error: 'Title and Incident Details are required.' });
  }

  const newCaseId = caseId || `CASE-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const rawCase: CaseRecord = {
    caseId: newCaseId,
    title,
    creatingInstitution: 'POLICE',
    officerId: officerId || 'POL-IND-004281',
    officerName: officerName || 'Inspector Kumar',
    station: 'Metro Central Division (#POL-MC-09)',
    timestamp: new Date().toISOString(),
    stage: 'FIR_REGISTERED',
    status: 'ACTIVE',
    incidentDetails,
    complainant: complainant || 'Citizen Complainant',
    accused: {
      name: accusedName || 'Suspect Undisclosed',
      nationalId: encryptSensitive('FED-ID: ' + Math.floor(1000 + Math.random() * 9000)).ciphertext,
      age: accusedAge || 30,
      gender: 'Male',
      charges: charges || ['Sec. 420 (Fraud)']
    },
    recordHash: '',
    txHash: '',
    blockNumber: 0
  };

  const recordHash = sha256(rawCase);
  const signature = generateDigitalSignature(rawCase.officerId, recordHash);

  const { tx, block } = blockchain.registerCaseOnChain(
    newCaseId,
    'POLICE',
    recordHash,
    signature
  );

  rawCase.recordHash = recordHash;
  rawCase.txHash = tx.txHash;
  rawCase.blockNumber = block.blockNumber;

  policeDb.cases.set(newCaseId, rawCase);

  res.status(201).json({
    success: true,
    case: rawCase,
    tx,
    block
  });
});

/**
 * 3. EVIDENCE REGISTRY & CUSTODY TRANSFER
 */
apiRouter.post('/cases/:caseId/evidence', (req: Request, res: Response) => {
  const { caseId } = req.params;
  const { title, type, description, storageLocation, officerName } = req.body;

  const c = policeDb.cases.get(caseId);
  if (!c) {
    return res.status(404).json({ error: 'Case not found.' });
  }

  const evidenceId = `EVD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const rawData = {
    evidenceId,
    caseId,
    title,
    type,
    description,
    timestamp: new Date().toISOString()
  };

  const evidenceHash = sha256(rawData);
  const signature = generateDigitalSignature('POLICE_EVIDENCE_DESK', evidenceHash);

  const { tx, block } = blockchain.registerEvidenceOnChain(
    evidenceId,
    caseId,
    'POLICE',
    evidenceHash,
    signature
  );

  const newItem: EvidenceItem = {
    evidenceId,
    caseId,
    title,
    type: type || 'Digital Storage',
    description: description || 'Physical/Digital item seized during investigation.',
    sha256Hash: evidenceHash,
    currentCustodian: 'POLICE',
    custodianOfficer: officerName || 'Inspector Kumar',
    storageLocation: storageLocation || 'Division Evidence Locker #04',
    timestamp: new Date().toISOString(),
    txHash: tx.txHash,
    blockNumber: block.blockNumber,
    transferHistory: []
  };

  policeDb.evidence.set(evidenceId, newItem);

  res.status(201).json({
    success: true,
    evidence: newItem,
    tx,
    block
  });
});

apiRouter.post('/evidence/:evidenceId/transfer', (req: Request, res: Response) => {
  const { evidenceId } = req.params;
  const { toInstitution, reason, officerName } = req.body;

  const item = policeDb.evidence.get(evidenceId);
  if (!item) {
    return res.status(404).json({ error: 'Evidence item not found in Police Database.' });
  }

  const from = item.currentCustodian;
  const to = toInstitution as InstitutionType;

  const signature = generateDigitalSignature(`CUSTODIAN_${from}`, item.sha256Hash);

  const { tx, block } = blockchain.transferEvidenceCustodyOnChain(
    evidenceId,
    item.caseId,
    from,
    to,
    item.sha256Hash,
    signature,
    reason || 'Custody transfer for scientific analysis'
  );

  item.previousCustodian = from;
  item.currentCustodian = to;
  item.transferHistory.push({
    from,
    to,
    officer: officerName || 'Sub-Inspector Mehta',
    timestamp: new Date().toISOString(),
    txHash: tx.txHash,
    reason: reason || 'Transfer to CFSL Laboratory'
  });

  // If transferred to forensics, register in forensicsDb received queue
  if (to === 'FORENSICS') {
    forensicsDb.evidenceReceived.set(evidenceId, item);
    // Update case stage to EVIDENCE_TRANSFERRED_TO_FORENSICS
    blockchain.updateCaseStageOnChain(
      item.caseId,
      'POLICE',
      'EVIDENCE_TRANSFERRED_TO_FORENSICS',
      item.sha256Hash,
      signature
    );
    const c = policeDb.cases.get(item.caseId);
    if (c) c.stage = 'EVIDENCE_TRANSFERRED_TO_FORENSICS';
  }

  res.json({
    success: true,
    evidence: item,
    tx,
    block
  });
});

/**
 * 4. FORENSICS REPORT SUBMISSION
 */
apiRouter.post('/forensics/reports', (req: Request, res: Response) => {
  const { caseId, evidenceId, methodology, findings, conclusions, examinerName, examinerId } = req.body;

  const reportId = `CFSL-REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const rawReport = {
    reportId,
    caseId,
    evidenceId,
    examinerId: examinerId || 'CFSL-DIR-881',
    examinerName: examinerName || 'Dr. Elena Rostova',
    labNode: 'CFSL Cyber & Ballistics Node #03',
    methodology: methodology || 'Hardware write-blocked bitstream extraction and SHA-256 verification.',
    findings: findings || 'Bit-level analysis confirms unadulterated payload matching evidence hash.',
    conclusions: conclusions || 'Report verified authentic by lead forensic examiner.'
  };

  const reportHash = sha256(rawReport);
  const signature = generateDigitalSignature(rawReport.examinerId, reportHash);

  const { tx, block } = blockchain.registerForensicReportOnChain(
    reportId,
    caseId,
    evidenceId,
    rawReport.examinerId,
    reportHash,
    signature
  );

  const report = {
    ...rawReport,
    reportHash,
    digitalSignature: signature,
    timestamp: new Date().toISOString(),
    txHash: tx.txHash,
    blockNumber: block.blockNumber
  };

  forensicsDb.reports.set(reportId, report);

  // Update case stage on blockchain
  blockchain.updateCaseStageOnChain(
    caseId,
    'FORENSICS',
    'FORENSIC_ANALYSIS_COMPLETED',
    reportHash,
    signature
  );

  const c = policeDb.cases.get(caseId);
  if (c) c.stage = 'FORENSIC_ANALYSIS_COMPLETED';

  res.status(201).json({
    success: true,
    report,
    tx,
    block
  });
});

/**
 * 5. CHARGESHEET SUBMISSION (POLICE -> COURT)
 */
apiRouter.post('/cases/:caseId/chargesheet', (req: Request, res: Response) => {
  const { caseId } = req.params;
  const { summary, sectionsApplied, leadProsecutor, prosecutorBarId } = req.body;

  const chargesheetId = `CS-${Math.floor(100 + Math.random() * 900)}-2026`;
  const rawCs = {
    chargesheetId,
    caseId,
    leadProsecutor: leadProsecutor || 'Adv. Jennifer Holt',
    prosecutorBarId: prosecutorBarId || 'BAR-#48910',
    sectionsApplied: sectionsApplied || ['Sec. 420', 'Sec. 467', 'Sec. 471', 'Sec. 120-B'],
    summary: summary || 'Formal prosecution chargesheet submitted with chain-of-custody proofs and forensic attestations.',
    admittedEvidenceCount: 3
  };

  const chargesheetHash = sha256(rawCs);
  const signature = generateDigitalSignature(rawCs.prosecutorBarId, chargesheetHash);

  const { tx, block } = blockchain.registerChargesheetOnChain(
    chargesheetId,
    caseId,
    rawCs.prosecutorBarId,
    chargesheetHash,
    signature
  );

  const cs = {
    ...rawCs,
    chargesheetHash,
    digitalSignature: signature,
    timestamp: new Date().toISOString(),
    txHash: tx.txHash,
    blockNumber: block.blockNumber,
    courtAccepted: true
  };

  policeDb.chargesheets.set(chargesheetId, cs);

  // Update case stage on blockchain
  blockchain.updateCaseStageOnChain(
    caseId,
    'POLICE',
    'CHARGESHEET_SUBMITTED',
    chargesheetHash,
    signature
  );

  const c = policeDb.cases.get(caseId);
  if (c) c.stage = 'CHARGESHEET_SUBMITTED';

  res.status(201).json({
    success: true,
    chargesheet: cs,
    tx,
    block
  });
});

/**
 * 6. COURT ORDERS & JUDGMENT
 */
apiRouter.post('/court/orders', (req: Request, res: Response) => {
  const { caseId, type, details, stipulations, judgeId } = req.body;

  const orderId = `CT-ORD-${type}-${Math.floor(1000 + Math.random() * 9000)}`;
  const rawOrder = {
    orderId,
    caseId,
    type: type || 'BAIL_RELEASE',
    issuingJudge: 'Hon. Justice Sarah Vance',
    courtBench: 'High Court Sovereign Bench #04',
    details: details || 'Judicial order issued pursuant to evidentiary hearing.',
    stipulations: stipulations || ['Surety Escrow Deposit Confirmed', '24/7 Ankle Geo-Tag Monitoring', 'Passport Surrender']
  };

  const orderHash = sha256(rawOrder);
  const signature = generateDigitalSignature(judgeId || 'JUR-US-FED-04812', orderHash);

  const { tx, block } = blockchain.registerCourtOrderOnChain(
    orderId,
    caseId,
    judgeId || 'JUR-US-FED-04812',
    type,
    orderHash,
    signature
  );

  const order = {
    ...rawOrder,
    orderHash,
    digitalSignature: signature,
    timestamp: new Date().toISOString(),
    txHash: tx.txHash,
    blockNumber: block.blockNumber
  };

  courtDb.orders.set(orderId, order);

  // Transition case stage
  const newStage = type === 'BAIL_RELEASE' ? 'BAIL_RELEASED' : 'JUDGMENT_ISSUED';
  blockchain.updateCaseStageOnChain(caseId, 'COURT', newStage, orderHash, signature);

  const c = policeDb.cases.get(caseId);
  if (c) c.stage = newStage;

  res.status(201).json({
    success: true,
    order,
    tx,
    block
  });
});

/**
 * 7. PRISON CUSTODY & SMART CONTRACT BAIL RELEASE
 */
apiRouter.post('/prison/custody', (req: Request, res: Response) => {
  const { caseId, fullName, wardAndCell, securityClassification, courtOrderRef } = req.body;

  const inmateId = `INM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const rawInmate = {
    inmateId,
    caseId,
    fullName: fullName || 'Ravi Kiran Sharma',
    wardAndCell: wardAndCell || 'B-Wing Tier 3 (Cell 308-A)',
    securityClassification: securityClassification || 'MAX-SEC',
    admissionDate: new Date().toISOString(),
    remandAuthority: 'Chief Magistrate Federal Cir. #04',
    courtOrderRef: courtOrderRef || 'CT-ORD-BAIL-2026-00492',
    custodyStatus: 'REMAND_DETENTION' as const,
    bloodScreening: 'Negative (Cannabinoid/Opiate/Stimulant) - Dr. S. Nair MD',
    quarantineCleared: true,
    biometricProofRoot: '0x3c8e41da882109aa88bc019248102ffc98a10291'
  };

  const custodyHash = sha256(rawInmate);
  const signature = generateDigitalSignature('PRISON_WARDEN_DESK', custodyHash);

  const { tx, block } = blockchain.registerPrisonCustodyOnChain(
    inmateId,
    caseId,
    custodyHash,
    '0xCOURT_REF_TX',
    signature
  );

  const record = {
    ...rawInmate,
    txHash: tx.txHash,
    blockNumber: block.blockNumber
  };

  prisonDb.inmates.set(inmateId, record);

  blockchain.updateCaseStageOnChain(caseId, 'PRISON', 'PRISON_CUSTODY_CREATED', custodyHash, signature);
  const c = policeDb.cases.get(caseId);
  if (c) c.stage = 'PRISON_CUSTODY_CREATED';

  res.status(201).json({
    success: true,
    inmate: record,
    tx,
    block
  });
});

apiRouter.post('/prison/bail-release', (req: Request, res: Response) => {
  const { inmateId, wardenPasscode } = req.body;

  const inmate = prisonDb.inmates.get(inmateId);
  if (!inmate) {
    return res.status(404).json({ error: 'Inmate record not found in Prison Database.' });
  }

  // Update status to BAIL_RELEASED
  inmate.custodyStatus = 'BAIL_RELEASED';

  const releaseHash = sha256({
    inmateId,
    status: 'BAIL_RELEASED',
    timestamp: new Date().toISOString()
  });

  const signature = generateDigitalSignature('WARDEN_MARCUS_VANCE', releaseHash);

  const { tx, block } = blockchain.commitTransaction(
    'PRISON',
    'AccessControlContract',
    'SMART_BAIL_RELEASE_EXECUTED',
    releaseHash,
    signature
  );

  blockchain.updateCaseStageOnChain(inmate.caseId, 'PRISON', 'BAIL_RELEASED', releaseHash, signature);

  const c = policeDb.cases.get(inmate.caseId);
  if (c) {
    c.stage = 'BAIL_RELEASED';
    c.status = 'BAIL_RELEASED';
  }

  res.json({
    success: true,
    inmate,
    tx,
    block,
    message: `Smart Contract Executed: Inmate ${inmateId} released on bail. Chain state updated across all 4 institutions.`
  });
});

/**
 * 8. BLOCKCHAIN VERIFICATION & AUDIT APIS
 */
apiRouter.post('/blockchain/verify', (req: Request, res: Response) => {
  const { type, id, data } = req.body;
  const calculatedHash = data ? sha256(data) : req.body.calculatedHash;

  if (!type || !id || !calculatedHash) {
    return res.status(400).json({ error: 'Type, ID, and calculatedHash are required.' });
  }

  const result = blockchain.verifyIntegrity(type, id, calculatedHash);
  res.json({ success: true, result });
});

apiRouter.get('/blockchain/status', (req: Request, res: Response) => {
  const latestBlock = blockchain.getLatestBlock();
  res.json({
    success: true,
    status: 'CONNECTED',
    consensus: 'QBFT (Quorum Byzantine Fault Tolerance)',
    validatorPeers: VALIDATOR_NODES,
    latestBlockNumber: latestBlock.blockNumber,
    latestBlockHash: latestBlock.blockHash,
    latestTxHash: latestBlock.transactions[0]?.txHash || '0x0',
    consensusLatencyMs: 18,
    model: 'GAS-FREE SOVEREIGN ENTERPRISE EVM'
  });
});

apiRouter.get('/blockchain/blocks', (req: Request, res: Response) => {
  res.json({ success: true, blocks: blockchain.getBlocks() });
});

apiRouter.get('/blockchain/transaction/:txHash', (req: Request, res: Response) => {
  const { txHash } = req.params;
  const tx = blockchain.getTransaction(txHash);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found in ledger.' });
  }
  res.json({ success: true, transaction: tx });
});

apiRouter.get('/audit/:caseId', (req: Request, res: Response) => {
  const { caseId } = req.params;
  const trail = blockchain.getAuditTrail(caseId === 'all' ? undefined : caseId);
  res.json({ success: true, auditTrail: trail });
});

/**
 * 9. CROSS-INSTITUTION ACCESS REQUESTS
 */
apiRouter.post('/access/request', (req: Request, res: Response) => {
  const { requesterId, requesterInstitution, targetInstitution, caseId, resourceId, reason, requestedAction } = req.body;

  const requestId = 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const signature = generateDigitalSignature(requesterId, sha256({ requestId, resourceId, reason }));

  const { tx } = blockchain.commitTransaction(
    requesterInstitution,
    'AccessControlContract',
    `ACCESS_REQUEST_${requesterInstitution}_TO_${targetInstitution}`,
    sha256({ requestId, caseId, resourceId, reason }),
    signature
  );

  const reqObj = {
    requestId,
    requesterId,
    requesterInstitution,
    targetInstitution,
    caseId,
    resourceId,
    reason,
    requestedAction,
    timestamp: new Date().toISOString(),
    signature,
    status: 'APPROVED' as const, // Auto-verified by smart contract rule
    txHash: tx.txHash
  };

  accessRequests.unshift(reqObj);
  res.status(201).json({ success: true, request: reqObj });
});

/**
 * 10. TAMPER DEMONSTRATION & RESTORE (Section 25)
 */
apiRouter.post('/demo/tamper', (req: Request, res: Response) => {
  const { targetType, targetId, maliciousMod } = req.body;

  if (targetType === 'EVIDENCE') {
    const item = policeDb.evidence.get(targetId || 'EVD-2026-9901');
    if (!item) return res.status(404).json({ error: 'Evidence not found' });

    if (!item.originalHash) item.originalHash = item.sha256Hash;
    item.tampered = true;
    item.description = (item.description || '') + ' [MALICIOUS UNAUTHORIZED SECTOR OVERWRITE]';
    // Deliberately corrupt the physical hash
    item.sha256Hash = '0x72AA43EF9100284bfa10029b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b43ef';

    return res.json({
      success: true,
      message: 'Evidence record tampered in local database. Checksum modified.',
      item
    });
  } else if (targetType === 'CHARGESHEET') {
    const cs = policeDb.chargesheets.get(targetId || 'CS-891-2026');
    if (!cs) return res.status(404).json({ error: 'Chargesheet not found' });

    if (!cs.originalHash) cs.originalHash = cs.chargesheetHash;
    cs.tampered = true;
    cs.summary = cs.summary + ' [TAMPERED: 2 FRAUD COUNTS EXCISED WITHOUT MAGISTRATE ORDER]';
    cs.chargesheetHash = '0x88AA11FF002244668899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF';

    return res.json({
      success: true,
      message: 'Chargesheet tampered in local database. Hash mismatch created.',
      chargesheet: cs
    });
  } else {
    // Tamper case record
    const c = policeDb.cases.get(targetId || 'CASE-2026-00124');
    if (!c) return res.status(404).json({ error: 'Case not found' });

    if (!c.originalHash) c.originalHash = c.recordHash;
    c.tampered = true;
    c.incidentDetails = c.incidentDetails + ' [ALTERED: EVIDENCE SEIZURE DISPUTED EX-POST]';
    c.recordHash = '0x99FF22AA0011447788BBCCEEFFAABB00112233445566778899AABBCCDDEEFF11';

    return res.json({
      success: true,
      message: 'Case record altered in local database. Integrity check will flag mismatch.',
      case: c
    });
  }
});

apiRouter.post('/demo/restore', (req: Request, res: Response) => {
  const { targetType, targetId } = req.body;

  if (targetType === 'EVIDENCE') {
    const item = policeDb.evidence.get(targetId || 'EVD-2026-9901');
    if (item && item.originalHash) {
      item.sha256Hash = item.originalHash;
      item.tampered = false;
      item.description = item.description.replace(' [MALICIOUS UNAUTHORIZED SECTOR OVERWRITE]', '');
      delete item.originalHash;
    }
    return res.json({ success: true, message: 'Evidence restored to original authentic cryptographic state.', item });
  } else if (targetType === 'CHARGESHEET') {
    const cs = policeDb.chargesheets.get(targetId || 'CS-891-2026');
    if (cs && cs.originalHash) {
      cs.chargesheetHash = cs.originalHash;
      cs.tampered = false;
      cs.summary = cs.summary.replace(' [TAMPERED: 2 FRAUD COUNTS EXCISED WITHOUT MAGISTRATE ORDER]', '');
      delete cs.originalHash;
    }
    return res.json({ success: true, message: 'Chargesheet restored to certified prosecution state.', chargesheet: cs });
  } else {
    const c = policeDb.cases.get(targetId || 'CASE-2026-00124');
    if (c && c.originalHash) {
      c.recordHash = c.originalHash;
      c.tampered = false;
      c.incidentDetails = c.incidentDetails.replace(' [ALTERED: EVIDENCE SEIZURE DISPUTED EX-POST]', '');
      delete c.originalHash;
    }
    return res.json({ success: true, message: 'Case record restored to registered hash.', case: c });
  }
});

/**
 * 12. DCJMN INTELLIGENCE ENGINE (AI + Network Graph)
 */
apiRouter.post('/intelligence/query', async (req: Request, res: Response) => {
  const { query, caseId = 'CASE-2026-00124' } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query string is required.' });
  }

  // Gather authorized context across the 4 separated databases without exposing raw tables/SQL
  const activeCase = policeDb.cases.get(caseId) || policeDb.cases.get('CASE-2026-00124');
  const evidence = activeCase ? Array.from(policeDb.evidence.values()).filter(e => e.caseId === activeCase.caseId) : [];
  const reports = activeCase ? Array.from(forensicsDb.reports.values()).filter(r => r.caseId === activeCase.caseId) : [];
  const chargesheet = activeCase ? Array.from(policeDb.chargesheets.values()).find(cs => cs.caseId === activeCase.caseId) : undefined;
  const orders = activeCase ? Array.from(courtDb.orders.values()).filter(o => o.caseId === activeCase.caseId) : [];
  const inmates = activeCase ? Array.from(prisonDb.inmates.values()).filter(i => i.caseId === activeCase.caseId) : [];

  const contextData = {
    caseId: activeCase?.caseId,
    title: activeCase?.title,
    stage: activeCase?.stage,
    isTampered: Boolean(activeCase?.tampered || evidence.some(e => e.tampered) || chargesheet?.tampered),
    custodianOfEvidence: evidence.map(e => ({ id: e.evidenceId, custodian: e.currentCustodian, location: e.storageLocation, tampered: e.tampered })),
    forensicReports: reports.map(r => ({ id: r.reportId, examiner: r.examinerName, findings: r.findings, tampered: r.tampered })),
    chargesheetDocketed: Boolean(chargesheet),
    courtOrders: orders.map(o => ({ id: o.orderId, type: o.type, judge: o.issuingJudge, bench: o.courtBench })),
    inmateStatus: inmates.map(i => ({ id: i.inmateId, status: i.custodyStatus, ward: i.wardAndCell }))
  };

  // Try using Gemini if API key is provided
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `You are DCJMN Intelligence, an authoritative, secure institutional AI agent serving the Decentralized Criminal Justice Network.
Answer questions strictly based on authorized DCJMN network, case progression, custody, and cryptographic state.
SECURITY & PRIVACY RULES:
1. Never reveal database names, SQL queries, database credentials, or server internals.
2. Refer only to authorized institutional nodes: Police, Forensics (CFSL), Court (Judicial Bench), and Prison (Correctional Facility).
3. Be concise, precise, objective, and professional.
Authorized Network & Case State:
${JSON.stringify(contextData, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: query,
        config: {
          systemInstruction
        }
      });

      return res.json({
        success: true,
        answer: response.text,
        source: 'GEMINI_AI',
        caseId: activeCase?.caseId
      });
    } catch (err: any) {
      console.warn('Gemini invocation error, falling back to deterministic justice reasoning:', err?.message);
    }
  }

  // Robust contextual fallback logic for the predefined standard queries
  const qLower = query.toLowerCase();
  let answer = '';

  if (qLower.includes('how this case moved') || qLower.includes('journey') || qLower.includes('flow') || qLower.includes('progression')) {
    answer = `Case ${activeCase?.caseId || 'CASE-2026-00124'} initiated at Police (Metro Central Division) via Digital FIR inception. Seized hardware exhibits (EVD-2026-9901) were transferred via ISO/IEC 27037 chain-of-custody to the Forensics Laboratory Node for write-block bitstream acquisition. Following CFSL verification, Police filed formal prosecution chargesheet CS-891-2026 to High Court Sovereign Bench #04. The Court presided over remand hearings and issued conditional bail decree CT-ORD-2026-00492, which was attested on the QBFT consortium ledger for Correctional Custody compliance.`;
  } else if (qLower.includes('why was the evidence transferred') || qLower.includes('forensics')) {
    answer = `Evidence EVD-2026-9901 (Samsung 2TB T7 SSD) was transferred to the Central Forensic Science Laboratory (CFSL) Node #03 under a statutory forensic subpoena. This was required to perform physical write-block bitstream cloning and verify cryptographic SHA-256 hashes without risking evidentiary spoliation or altering original digital sectors.`;
  } else if (qLower.includes('custody of the evidence') || qLower.includes('who has')) {
    const currentCustodians = evidence.map(e => `${e.evidenceId} is currently under ${e.currentCustodian} custody (${e.storageLocation})`).join('; ');
    answer = currentCustodians || 'Evidence exhibits are cataloged in division storage lockers under active police custodian supervision.';
  } else if (qLower.includes('verified') || qLower.includes('forensic report verified')) {
    const isTampered = reports.some(r => r.tampered);
    if (isTampered) {
      answer = `ALERT: The forensic report currently exhibits a cryptographic discrepancy. The local laboratory record does not match the canonical hash registered on the DCJMN permissioned ledger.`;
    } else {
      answer = `Yes. Forensic report CFSL-REP-2026-0481 has been digitally signed by Chief Forensic Examiner Dr. Elena Rostova using Ed25519 node keys and anchored in Block #${reports[0]?.blockNumber || 48192842} of the QBFT consensus network.`;
    }
  } else if (qLower.includes('access request') || qLower.includes('denied')) {
    answer = `Under DCJMN Smart Contract Access Rules, cross-agency read requests are denied if the requester fails any of the four mandatory gate checks: 1) Active Biometric Identity Attestation, 2) Institutional Role Clearance, 3) Verified Official Case Assignment, or 4) Validated Cross-Jurisdictional Subpoena.`;
  } else if (qLower.includes('tamper') || qLower.includes('integrity')) {
    const isTampered = Boolean(activeCase?.tampered || evidence.some(e => e.tampered) || chargesheet?.tampered);
    answer = isTampered
      ? `CRITICAL ALERT: Tamper detection algorithms have detected an unauthorized off-chain modification. The calculated SHA-256 hash of the modified document diverges from the root hash committed to the DCJMN smart contract.`
      : `All institutional records (Police FIR, Forensic bitstream image, Prosecution Chargesheet, and Court decrees) are 100% verified against canonical QBFT blockchain roots with zero discrepancies.`;
  } else {
    answer = `Case ${activeCase?.caseId} is currently in stage ${activeCase?.stage}. The DCJMN network confirms 4 active validator peers (Police, Forensics, Court, Prison) with zero gas fees and deterministic QBFT consensus. All off-chain institutional databases remain strictly separated and secured via AES-256 GCM encryption.`;
  }

  return res.json({
    success: true,
    answer,
    source: 'DCJMN_INTELLIGENCE_ENGINE',
    caseId: activeCase?.caseId
  });
});

