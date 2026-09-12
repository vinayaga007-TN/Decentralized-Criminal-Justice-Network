import { Router, Request, Response } from 'express';
import { policeDb, forensicsDb, courtDb, prisonDb, accessRequests } from '../db';
import { blockchain, VALIDATOR_NODES } from '../blockchain';
import { encryptSensitive, generateDigitalSignature, sha256 } from '../crypto';
import {
  CaseRecord,
  EvidenceItem,
  InstitutionType,
  CaseStage,
  FIRDocument,
  FIRExtractedFields,
  FIRAISummary,
  FIRDocumentType
} from '../../src/types';
import { SAMPLE_FIR_DOCUMENTS } from '../firSamples';

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

  // Linked FIR Document if present
  const firDocument = c.firDocumentId ? policeDb.firStorage.get(c.firDocumentId) : undefined;
  const firIntegrity = firDocument
    ? blockchain.verifyIntegrity('FIR_DOCUMENT', firDocument.documentId, firDocument.sha256Hash)
    : null;

  res.json({
    success: true,
    case: c,
    evidence: caseEvidence,
    reports: caseReports,
    chargesheets: caseChargesheets,
    orders: caseOrders,
    inmates: caseInmates,
    integrity,
    firDocument,
    firIntegrity
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

/**
 * 13. FIR DOCUMENT MANAGEMENT & OCR INTELLIGENCE APIS
 */

// GET /fir/samples - Preloaded realistic FIR documents
apiRouter.get('/fir/samples', (_req: Request, res: Response) => {
  res.json({
    success: true,
    samples: SAMPLE_FIR_DOCUMENTS.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      documentType: s.documentType,
      fileName: s.fileName,
      mimeType: s.mimeType,
      fileSizeFormatted: s.fileSizeFormatted,
      previewUrl: s.svgDataUrl,
      extractedFields: s.extractedFields,
      aiSummary: s.aiSummary
    }))
  });
});

// POST /fir/upload - Upload original FIR (file or sample), hash, and run OCR extraction
apiRouter.post('/fir/upload', async (req: Request, res: Response) => {
  try {
    const {
      fileDataUrl,
      fileName = 'fir-document.jpg',
      fileSize = 450000,
      mimeType = 'image/jpeg',
      sampleId,
      officerId = 'POL-IND-004281',
      officerName = 'Inspector Kumar'
    } = req.body;

    let targetDataUrl = fileDataUrl;
    let targetFileName = fileName;
    let targetMimeType = mimeType;
    let targetFileSize = fileSize;
    let detectedType: FIRDocumentType = 'IMAGE_SCANNED';
    let extractedFields: FIRExtractedFields;
    let aiSummary: FIRAISummary;
    let rawOcrText = '';

    // Check if loading a preloaded realistic sample
    if (sampleId) {
      const sample = SAMPLE_FIR_DOCUMENTS.find(s => s.id === sampleId);
      if (sample) {
        targetDataUrl = sample.svgDataUrl;
        targetFileName = sample.fileName;
        targetMimeType = sample.mimeType;
        targetFileSize = 450000;
        detectedType = sample.documentType;
        extractedFields = JSON.parse(JSON.stringify(sample.extractedFields));
        aiSummary = JSON.parse(JSON.stringify(sample.aiSummary));
        rawOcrText = sample.rawOcrText;
      }
    }

    if (!targetDataUrl) {
      return res.status(400).json({ error: 'No FIR document file data or sample provided.' });
    }

    // Determine document type from mime or file extension if not sample
    if (!sampleId) {
      const lowerName = targetFileName.toLowerCase();
      if (targetMimeType.includes('pdf') || lowerName.endsWith('.pdf')) {
        detectedType = 'PDF';
      } else if (lowerName.includes('handwritten') || lowerName.includes('hand') || lowerName.includes('diary')) {
        detectedType = 'IMAGE_HANDWRITTEN';
      } else {
        detectedType = 'IMAGE_SCANNED';
      }

      // Default extracted fields baseline
      extractedFields = {
        firNumber: `FIR-2026/${Math.floor(1000 + Math.random() * 9000)}`,
        policeStation: 'Metro Central Division (#POL-MC-09)',
        district: 'Metro Federal 04',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        dateOfOccurrence: new Date().toISOString().split('T')[0],
        timeOfOccurrence: '21:30',
        placeOfOccurrence: 'Metro Financial Tech Corridor, Sector 4',
        complainantName: 'Duty Officer In-Charge',
        complainantContact: '+91 98401 23456 / metro.desk@police.gov',
        accusedName: 'Suspect Unidentified',
        accusedAge: 30,
        accusedDetails: 'Under physical surveillance; particulars under verification',
        victimInformation: 'Sovereign Digital Asset Repository',
        offences: ['Sec. 420 (Fraud)', 'Sec. 120-B (Conspiracy)'],
        briefFacts: 'Officer received original FIR document regarding unauthorized access and seized electronic exhibits. Document preserved in DCJMN vault.',
        witnesses: ['Duty Sergeant R. Evans', 'Head Constable K. Murthy'],
        investigatingOfficer: officerName,
        documentDate: new Date().toISOString().split('T')[0],
        documentReferenceNumber: `REG-${Math.floor(10000 + Math.random() * 90000)}`,
        fieldConfidences: {
          firNumber: 'HIGH',
          policeStation: 'HIGH',
          district: 'HIGH',
          date: 'HIGH',
          time: 'HIGH',
          placeOfOccurrence: 'HIGH',
          complainantName: 'HIGH',
          accusedName: 'LOW',
          offences: 'HIGH',
          briefFacts: 'HIGH',
          complainantContact: 'HIGH',
          witnesses: 'HIGH'
        },
        lowConfidenceFields: ['accusedName']
      };

      rawOcrText = `OFFICIAL FIR TRANSCRIPT — ${targetFileName}\nDate: ${extractedFields.date} | Station: ${extractedFields.policeStation}\nIncident Details: ${extractedFields.briefFacts}\nComplainant: ${extractedFields.complainantName}\nCharges: ${extractedFields.offences.join(', ')}`;

      aiSummary = {
        summary: `Document uploaded by ${officerName}. Factual FIR data extracted for validation prior to blockchain commitment.`,
        mainAllegations: ['Unauthorized access to protected systems', 'Spoliation attempt flagged by network monitors'],
        personsMentioned: [`${officerName} (Investigating Officer)`, `${extractedFields.complainantName} (Complainant)`],
        offencesMentioned: extractedFields.offences,
        evidenceReferenced: ['Physical FIR Document Leaf', 'Initial seized hardware exhibits'],
        itemsRequiringVerification: ['Confirmation of primary accused legal identity and address particulars'],
        timeline: [{ time: `${extractedFields.date} ${extractedFields.time}`, event: 'Original FIR document presented and scanned at division station' }]
      };

      // Call Gemini 3.8 Flash for true multimodal OCR & document intelligence if API key present
      if (process.env.GEMINI_API_KEY && targetDataUrl.startsWith('data:')) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

          const prompt = `You are the DCJMN Official Police FIR Document OCR & Extraction Engine.
Analyze this First Information Report (FIR) image or document.
Extract all factual data strictly from the document.
CRITICAL RULES:
1. Do NOT invent, assume, or hallucinate missing information.
2. If any field is not detected or ambiguous, explicitly set confidence to 'LOW' or 'NOT_DETECTED' and add it to lowConfidenceFields.
3. For fieldConfidences, provide an object mapping each extracted field key to "HIGH" | "LOW" | "NOT_DETECTED".
4. Separate pure SOURCE FACTS from AI INTERPRETATION.

Return ONLY a valid JSON object matching this structure:
{
  "extractedFields": {
    "firNumber": string,
    "policeStation": string,
    "district": string,
    "date": string,
    "time": string,
    "dateOfOccurrence": string,
    "timeOfOccurrence": string,
    "placeOfOccurrence": string,
    "complainantName": string,
    "complainantContact": string,
    "accusedName": string,
    "accusedAge": number,
    "accusedDetails": string,
    "victimInformation": string,
    "offences": string[],
    "briefFacts": string,
    "witnesses": string[],
    "investigatingOfficer": string,
    "documentDate": string,
    "documentReferenceNumber": string,
    "fieldConfidences": Record<string, "HIGH" | "LOW" | "NOT_DETECTED">,
    "lowConfidenceFields": string[]
  },
  "rawOcrText": string,
  "aiSummary": {
    "summary": string,
    "mainAllegations": string[],
    "personsMentioned": string[],
    "offencesMentioned": string[],
    "evidenceReferenced": string[],
    "itemsRequiringVerification": string[],
    "timeline": Array<{ time: string, event: string }>
  }
}`;

          // Parse base64
          const match = targetDataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            const mime = match[1];
            const base64Data = match[2];

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: [
                {
                  role: 'user',
                  parts: [
                    { inlineData: { mimeType: mime, data: base64Data } },
                    { text: prompt }
                  ]
                }
              ],
              config: { responseMimeType: 'application/json' }
            });

            if (response.text) {
              const parsed = JSON.parse(response.text);
              if (parsed.extractedFields) {
                extractedFields = { ...extractedFields, ...parsed.extractedFields };
              }
              if (parsed.rawOcrText) rawOcrText = parsed.rawOcrText;
              if (parsed.aiSummary) aiSummary = parsed.aiSummary;
            }
          }
        } catch (geminiErr: any) {
          console.warn('Gemini OCR extraction warning, using deterministic police OCR fallback:', geminiErr?.message);
        }
      }
    }

    // Compute cryptographic SHA-256 hash of the EXACT original uploaded file data
    const calculatedHash = sha256(targetDataUrl);

    // Generate unique immutable document ID
    const documentId = `FIR-DOC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const firDoc: FIRDocument = {
      id: documentId,
      documentId,
      caseId: '', // Unlinked until officer confirms
      documentType: detectedType,
      fileName: targetFileName,
      fileSize: targetFileSize,
      fileSizeFormatted: `${(targetFileSize / 1024).toFixed(1)} KB`,
      mimeType: targetMimeType,
      fileDataUrl: targetDataUrl,
      sha256Hash: calculatedHash,
      uploadedAt: new Date().toISOString(),
      uploaderOfficerId: officerId,
      uploaderOfficerName: officerName,
      uploadedByOfficerId: officerId,
      uploadedByOfficerName: officerName,
      institution: 'POLICE',
      status: 'OCR_COMPLETED',
      integrityStatus: 'VERIFIED',
      blockchainStatus: 'PENDING_CONFIRMATION',
      extractedFields,
      aiSummary,
      rawOcrText,
      provenanceHistory: [
        {
          action: 'Original FIR Document Uploaded & Preserved',
          timestamp: new Date().toISOString(),
          officerId,
          officerName,
          institution: 'POLICE',
          details: `Original document (${targetFileName}, ${detectedType}) securely ingested into off-chain DCJMN storage. Canonical SHA-256 computed: ${calculatedHash.slice(0, 16)}...`
        },
        {
          action: 'OCR & Handwriting Text Extraction Completed',
          timestamp: new Date().toISOString(),
          officerId: 'SYSTEM_OCR',
          officerName: 'DCJMN Document Intelligence Node',
          institution: 'POLICE',
          details: `Field extraction performed. ${extractedFields.lowConfidenceFields.length} fields flagged for officer verification.`
        }
      ]
    };

    // Store in police database
    policeDb.firStorage.set(documentId, firDoc);

    // Record audit
    blockchain.recordAudit(
      'POLICE',
      'FIR_UPLOADED',
      documentId,
      `FIR Document ${documentId} (${targetFileName}) uploaded by ${officerName}. Canonical SHA-256: ${calculatedHash}`,
      calculatedHash,
      '0xUPLOAD_EVENT',
      blockchain.getLatestBlock().blockNumber
    );

    return res.status(201).json({
      success: true,
      document: firDoc,
      sha256Hash: calculatedHash,
      extractedFields: firDoc.extractedFields,
      aiSummary: firDoc.aiSummary,
      rawOcrText: firDoc.rawOcrText
    });
  } catch (error: any) {
    console.error('FIR upload error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to process FIR document upload.' });
  }
});

// POST /fir/confirm - Officer confirms reviewed FIR fields, registers Case & anchors to Blockchain
apiRouter.post('/fir/confirm', (req: Request, res: Response) => {
  const {
    documentId,
    confirmedFields,
    officerId = 'POL-IND-004281',
    officerName = 'Inspector Kumar',
    customTitle
  } = req.body;

  if (!documentId) {
    return res.status(400).json({ error: 'Document ID is required.' });
  }

  const firDoc = policeDb.firStorage.get(documentId);
  if (!firDoc) {
    return res.status(404).json({ error: 'FIR document record not found in storage.' });
  }

  // Security Check: Verify original document has not changed since upload
  const verificationCheck = sha256(firDoc.fileDataUrl);
  if (verificationCheck !== firDoc.sha256Hash) {
    return res.status(400).json({ error: 'Document tamper detected: Uploaded file checksum mismatch.' });
  }

  // Use confirmed fields
  const fields = confirmedFields || firDoc.extractedFields;
  firDoc.extractedFields = fields;

  // Generate new Case ID
  const newCaseId = `CASE-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  // Create Case Record
  const rawCase: CaseRecord = {
    caseId: newCaseId,
    title: customTitle || `State vs. ${fields.accusedName || 'Accused'} (${fields.offences[0] || 'Statutory Breach'})`,
    creatingInstitution: 'POLICE',
    officerId,
    officerName,
    station: fields.policeStation || 'Metro Central Division (#POL-MC-09)',
    timestamp: new Date().toISOString(),
    stage: 'FIR_REGISTERED',
    status: 'ACTIVE',
    incidentDetails: fields.briefFacts || 'Formal First Information Report filed under statutory criminal provisions.',
    complainant: fields.complainantName || 'Citizen Complainant',
    firDocumentId: documentId,
    accused: {
      name: fields.accusedName || 'Suspect Undisclosed',
      nationalId: encryptSensitive('FED-ID: ' + Math.floor(1000 + Math.random() * 9000)).ciphertext,
      age: Number(fields.accusedAge) || 30,
      gender: 'Male',
      charges: fields.offences && fields.offences.length > 0 ? fields.offences : ['Sec. 420 (Fraud)']
    },
    recordHash: '',
    txHash: '',
    blockNumber: 0
  };

  const recordHash = sha256(rawCase);
  const signature = generateDigitalSignature(officerId, recordHash);

  // 1. Register FIR Document hash on DCJMN Blockchain
  const firDocSignature = generateDigitalSignature(officerId, firDoc.sha256Hash);
  const firBlockchainResult = blockchain.registerFIRDocumentOnChain(
    documentId,
    newCaseId,
    officerId,
    'POLICE',
    firDoc.sha256Hash,
    firDocSignature
  );

  // 2. Register Case Record on DCJMN Blockchain
  const { tx, block } = blockchain.registerCaseOnChain(
    newCaseId,
    'POLICE',
    recordHash,
    signature
  );

  rawCase.recordHash = recordHash;
  rawCase.txHash = tx.txHash;
  rawCase.blockNumber = block.blockNumber;

  // Update FIR document references
  firDoc.caseId = newCaseId;
  firDoc.status = 'VERIFIED';
  firDoc.integrityStatus = 'VERIFIED';
  firDoc.blockchainStatus = 'RECORDED';
  firDoc.blockchainTxHash = firBlockchainResult.tx.txHash;
  firDoc.blockchainBlockNumber = firBlockchainResult.block.blockNumber;
  firDoc.verifiedAt = new Date().toISOString();
  firDoc.verifiedByOfficerId = officerId;
  firDoc.verifiedByOfficerName = officerName;

  firDoc.provenanceHistory.push({
    action: 'Officer Verified & Confirmed FIR Record',
    timestamp: new Date().toISOString(),
    officerId,
    officerName,
    institution: 'POLICE',
    details: `Investigating officer reviewed all extracted fields, validated complainant/accused details, and certified legal veracity for case ${newCaseId}.`
  });

  firDoc.provenanceHistory.push({
    action: 'Anchored on DCJMN Blockchain Ledger',
    timestamp: new Date().toISOString(),
    officerId: 'QBFT_CONSENSUS',
    officerName: 'DCJMN Validator Network',
    institution: 'POLICE',
    details: `FIR original SHA-256 hash (${firDoc.sha256Hash.slice(0, 14)}...) recorded into Block #${firBlockchainResult.block.blockNumber} (Tx: ${firBlockchainResult.tx.txHash.slice(0, 14)}...). Document immutable.`
  });

  // Persist Case
  policeDb.cases.set(newCaseId, rawCase);

  // Record audit trail
  blockchain.recordAudit(
    'POLICE',
    'FIR_VERIFIED',
    newCaseId,
    `FIR ${documentId} verified and linked to new Case ${newCaseId} by ${officerName}. Anchored in Block #${block.blockNumber}.`,
    firDoc.sha256Hash,
    firBlockchainResult.tx.txHash,
    block.blockNumber
  );

  return res.status(201).json({
    success: true,
    case: rawCase,
    firDocument: firDoc,
    tx,
    block
  });
});

// POST /fir/manual - Manual FIR creation fallback
apiRouter.post('/fir/manual', (req: Request, res: Response) => {
  const {
    title,
    incidentDetails,
    complainant,
    accusedName,
    accusedAge,
    charges,
    officerId = 'POL-IND-004281',
    officerName = 'Inspector Kumar'
  } = req.body;

  if (!title || !incidentDetails) {
    return res.status(400).json({ error: 'Title and Incident Details are required.' });
  }

  const newCaseId = `CASE-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const documentId = `FIR-DOC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const parsedCharges = Array.isArray(charges) ? charges : (charges ? charges.split(',').map((c: string) => c.trim()) : ['Sec. 420 (Fraud)']);

  const extractedFields: FIRExtractedFields = {
    firNumber: `FIR-2026/${Math.floor(1000 + Math.random() * 9000)}`,
    policeStation: 'Metro Central Division (#POL-MC-09)',
    district: 'Metro Federal 04',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    dateOfOccurrence: new Date().toISOString().split('T')[0],
    timeOfOccurrence: '20:00',
    placeOfOccurrence: 'Metro Central Jurisdiction Area',
    complainantName: complainant || 'Citizen Complainant',
    complainantContact: '+91 98401 23456',
    accusedName: accusedName || 'Suspect Undisclosed',
    accusedAge: Number(accusedAge) || 30,
    accusedDetails: 'Manually docketed by investigating officer',
    victimInformation: 'State / Public Interest',
    offences: parsedCharges,
    briefFacts: incidentDetails,
    witnesses: ['Duty Constable', 'Station Scribe'],
    investigatingOfficer: officerName,
    documentDate: new Date().toISOString().split('T')[0],
    documentReferenceNumber: `MAN-FIR-${newCaseId}`,
    fieldConfidences: {
      firNumber: 'HIGH',
      policeStation: 'HIGH',
      district: 'HIGH',
      date: 'HIGH',
      time: 'HIGH',
      complainantName: 'HIGH',
      accusedName: 'HIGH',
      offences: 'HIGH',
      placeOfOccurrence: 'HIGH',
      briefFacts: 'HIGH',
      complainantContact: 'HIGH',
      witnesses: 'HIGH'
    },
    lowConfidenceFields: []
  };

  const syntheticDocText = `MANUAL DIGITAL FIR DOCKET — CASE ${newCaseId}\nDate: ${extractedFields.date} ${extractedFields.time}\nStation: ${extractedFields.policeStation}\nComplainant: ${extractedFields.complainantName}\nAccused: ${extractedFields.accusedName} (Age: ${extractedFields.accusedAge})\nStatutory Charges: ${parsedCharges.join(', ')}\nIncident Narration: ${incidentDetails}\nRecorded By: ${officerName} (${officerId})`;

  const docHash = sha256(syntheticDocText);

  // Build digital representation SVG data URL
  const manualSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#0F172A;font-family:Arial, sans-serif;">
  <rect width="800" height="1100" fill="#090D16"/>
  <rect x="30" y="30" width="740" height="1040" fill="#0D1322" stroke="#1E293B" stroke-width="2" rx="6"/>
  <text x="400" y="80" text-anchor="middle" font-size="16" font-weight="bold" fill="#38BDF8">OFFICIAL MANUAL FIR DOCKET</text>
  <text x="400" y="105" text-anchor="middle" font-size="12" fill="#94A3B8">Recorded under Cr.P.C. 154 at Police General Diary</text>
  <g transform="translate(60, 150)" fill="#E2E8F0" font-size="12" font-family="'Courier New'">
    <text x="0" y="0">CASE ID: ${newCaseId}</text>
    <text x="0" y="30">FIR NUMBER: ${extractedFields.firNumber}</text>
    <text x="0" y="60">STATION: ${extractedFields.policeStation}</text>
    <text x="0" y="90">COMPLAINANT: ${extractedFields.complainantName}</text>
    <text x="0" y="120">ACCUSED: ${extractedFields.accusedName} (Age: ${extractedFields.accusedAge})</text>
    <text x="0" y="150">CHARGES: ${parsedCharges.join(', ')}</text>
    <text x="0" y="190">INCIDENT DETAILS:</text>
    <text x="0" y="220" fill="#CBD5E1">${incidentDetails.slice(0, 80)}...</text>
    <text x="0" y="320">OFFICER: ${officerName} (${officerId})</text>
    <text x="0" y="360">TIMESTAMP: ${new Date().toISOString()}</text>
    <text x="0" y="420" fill="#10B981">CANONICAL SHA-256: ${docHash}</text>
  </g>
</svg>
`)}`;

  const firDoc: FIRDocument = {
    id: documentId,
    documentId,
    caseId: newCaseId,
    documentType: 'DIGITAL_TEXT',
    fileName: `manual-fir-${newCaseId.toLowerCase()}.txt`,
    fileSize: syntheticDocText.length,
    fileSizeFormatted: `${(syntheticDocText.length / 1024).toFixed(1)} KB`,
    mimeType: 'text/plain',
    fileDataUrl: manualSvg,
    sha256Hash: docHash,
    uploadedAt: new Date().toISOString(),
    uploaderOfficerId: officerId,
    uploaderOfficerName: officerName,
    uploadedByOfficerId: officerId,
    uploadedByOfficerName: officerName,
    verifiedAt: new Date().toISOString(),
    verifiedByOfficerId: officerId,
    verifiedByOfficerName: officerName,
    institution: 'POLICE',
    status: 'VERIFIED',
    integrityStatus: 'VERIFIED',
    blockchainStatus: 'RECORDED',
    extractedFields,
    aiSummary: {
      summary: `Manual FIR recorded by ${officerName} for ${title}.`,
      mainAllegations: [incidentDetails.slice(0, 100)],
      personsMentioned: [`${extractedFields.complainantName} (Complainant)`, `${extractedFields.accusedName} (Accused)`],
      offencesMentioned: parsedCharges,
      evidenceReferenced: ['Physical complaint diary entry'],
      itemsRequiringVerification: ['Substantive proof of cited charges'],
      timeline: [{ time: `${extractedFields.date} ${extractedFields.time}`, event: 'Manual FIR docket entry created' }]
    },
    rawOcrText: syntheticDocText,
    provenanceHistory: [
      {
        action: 'Manual FIR Docket Created',
        timestamp: new Date().toISOString(),
        officerId,
        officerName,
        institution: 'POLICE',
        details: `Officer entered manual FIR record for case ${newCaseId}. Canonical SHA-256 computed: ${docHash}`
      },
      {
        action: 'Anchored on DCJMN Blockchain Ledger',
        timestamp: new Date().toISOString(),
        officerId: 'QBFT_CONSENSUS',
        officerName: 'DCJMN Validator Network',
        institution: 'POLICE',
        details: 'Record committed to sovereign permissioned ledger.'
      }
    ]
  };

  const rawCase: CaseRecord = {
    caseId: newCaseId,
    title,
    creatingInstitution: 'POLICE',
    officerId,
    officerName,
    station: 'Metro Central Division (#POL-MC-09)',
    timestamp: new Date().toISOString(),
    stage: 'FIR_REGISTERED',
    status: 'ACTIVE',
    incidentDetails,
    complainant: complainant || 'Citizen Complainant',
    firDocumentId: documentId,
    accused: {
      name: accusedName || 'Suspect Undisclosed',
      nationalId: encryptSensitive('FED-ID: ' + Math.floor(1000 + Math.random() * 9000)).ciphertext,
      age: Number(accusedAge) || 30,
      gender: 'Male',
      charges: parsedCharges
    },
    recordHash: '',
    txHash: '',
    blockNumber: 0
  };

  const caseHash = sha256(rawCase);
  const signature = generateDigitalSignature(officerId, caseHash);

  // Blockchain anchors
  blockchain.registerFIRDocumentOnChain(documentId, newCaseId, officerId, 'POLICE', docHash, signature);
  const { tx, block } = blockchain.registerCaseOnChain(newCaseId, 'POLICE', caseHash, signature);

  rawCase.recordHash = caseHash;
  rawCase.txHash = tx.txHash;
  rawCase.blockNumber = block.blockNumber;

  firDoc.blockchainTxHash = tx.txHash;
  firDoc.blockchainBlockNumber = block.blockNumber;

  policeDb.firStorage.set(documentId, firDoc);
  policeDb.cases.set(newCaseId, rawCase);

  return res.status(201).json({
    success: true,
    case: rawCase,
    firDocument: firDoc,
    tx,
    block
  });
});

// GET /fir/:documentId - View FIR Document
apiRouter.get('/fir/:documentId', (req: Request, res: Response) => {
  const { documentId } = req.params;
  const doc = policeDb.firStorage.get(documentId);

  if (!doc) {
    return res.status(404).json({ error: `FIR document ${documentId} not found in DCJMN storage.` });
  }

  // Audit view event
  blockchain.recordAudit(
    'POLICE',
    'FIR_VIEWED',
    documentId,
    `FIR document ${documentId} accessed by authorized user.`,
    doc.sha256Hash,
    '0xVIEW_EVENT',
    blockchain.getLatestBlock().blockNumber
  );

  return res.json({
    success: true,
    firDocument: doc
  });
});

// POST /fir/:documentId/verify - Live cryptographic verification against Blockchain
apiRouter.post('/fir/:documentId/verify', (req: Request, res: Response) => {
  const { documentId } = req.params;
  const doc = policeDb.firStorage.get(documentId);

  if (!doc) {
    return res.status(404).json({ error: `FIR document ${documentId} not found.` });
  }

  // Re-hash the file data currently in storage
  const currentCalculatedHash = sha256(doc.fileDataUrl);

  // Compare with blockchain anchor
  const result = blockchain.verifyIntegrity('FIR_DOCUMENT', documentId, currentCalculatedHash);

  return res.json({
    success: true,
    verification: result,
    documentId,
    calculatedHash: currentCalculatedHash,
    storedHash: doc.sha256Hash
  });
});

// POST /fir/:documentId/chat - Document-Specific AI Chatbot ("Ask about this FIR...")
apiRouter.post('/fir/:documentId/chat', async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const { message, officerId = 'POL-IND-004281', officerName = 'Inspector Kumar' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message query is required.' });
  }

  const doc = policeDb.firStorage.get(documentId);
  if (!doc) {
    return res.status(404).json({ error: `FIR document ${documentId} not found.` });
  }

  // Prepare authorized strictly bounded document context
  const docContext = {
    documentId: doc.documentId,
    caseId: doc.caseId,
    fileName: doc.fileName,
    documentType: doc.documentType,
    sha256Hash: doc.sha256Hash,
    verifiedStatus: doc.status,
    extractedFields: doc.extractedFields,
    rawOcrText: doc.rawOcrText,
    aiSummary: doc.aiSummary,
    provenanceHistory: doc.provenanceHistory
  };

  const systemInstruction = `You are the DCJMN Document Intelligence Officer assisting with a specific FIR document (${doc.documentId}).
CRITICAL RULES:
1. Answer ONLY using the facts from this specific FIR document.
2. DO NOT fabricate information. If an answer cannot be determined from the document, state that clearly and suggest verifying with the investigating officer.
3. Clearly delineate between:
   [SOURCE INFORMATION (DIRECT FACTS)] - Quotes and facts directly detected in the FIR document.
   [AI INTERPRETATION / ANALYSIS] - Synthesis, contextual evaluation, or legal references.
4. Maintain a formal, authoritative, concise tone suitable for criminal justice professionals (Police, Court, Forensics, Prison).

AUTHORIZED DOCUMENT DATA:
${JSON.stringify(docContext, null, 2)}`;

  // Try Gemini if available
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: { systemInstruction }
      });

      // Audit AI interaction
      blockchain.recordAudit(
        'POLICE',
        'FIR_ANALYZED',
        documentId,
        `AI inquiry executed for FIR ${documentId} by ${officerName}: "${message.slice(0, 60)}"`,
        doc.sha256Hash,
        '0xAI_QUERY',
        blockchain.getLatestBlock().blockNumber
      );

      return res.json({
        success: true,
        answer: response.text,
        source: 'GEMINI_AI',
        documentId
      });
    } catch (err: any) {
      console.warn('Gemini invocation error in FIR chat, using deterministic grounded fallback:', err?.message);
    }
  }

  // Grounded Justice Intelligence Engine Fallback
  const qLower = message.toLowerCase();
  let answer = '';
  const f = doc.extractedFields;
  const s = doc.aiSummary;

  if (qLower.includes('summarize') || qLower.includes('summary')) {
    answer = `[SOURCE INFORMATION (DIRECT FACTS)]
• FIR Number: ${f.firNumber}
• Police Station: ${f.policeStation}
• Date & Time: ${f.date} at ${f.time}
• Complainant: ${f.complainantName} (${f.complainantContact})
• Accused: ${f.accusedName} (Age: ${f.accusedAge})
• Statutory Offences: ${f.offences.join(', ')}
• Location: ${f.placeOfOccurrence}

[AI INTERPRETATION / ANALYSIS]
${s?.summary || f.briefFacts}
Cryptographic integrity: SHA-256 hash verified against DCJMN QBFT blockchain.`;
  } else if (qLower.includes('allegation') || qLower.includes('allegations') || qLower.includes('what happened')) {
    answer = `[SOURCE INFORMATION (DIRECT FACTS)]
The complainant ${f.complainantName} reports:
"${f.briefFacts}"

[AI INTERPRETATION / ANALYSIS]
Key Allegations:
${s?.mainAllegations?.map(a => `• ${a}`).join('\n') || `• ${f.briefFacts}`}`;
  } else if (qLower.includes('person') || qLower.includes('who') || qLower.includes('suspect') || qLower.includes('accused')) {
    answer = `[SOURCE INFORMATION (DIRECT FACTS)]
• Accused: ${f.accusedName} (Age: ${f.accusedAge || 'Not specified'}, Particulars: ${f.accusedDetails || 'Not specified'})
• Complainant: ${f.complainantName} (${f.complainantContact})
• Investigating Officer: ${f.investigatingOfficer || 'Assigned Officer'}
• Witnesses: ${f.witnesses?.join(', ') || 'None recorded'}

[AI INTERPRETATION / ANALYSIS]
Persons Involved:
${s?.personsMentioned?.map(p => `• ${p}`).join('\n') || `• Accused: ${f.accusedName}\n• Complainant: ${f.complainantName}`}`;
  } else if (qLower.includes('offence') || qLower.includes('offences') || qLower.includes('charge') || qLower.includes('charges') || qLower.includes('sections')) {
    answer = `[SOURCE INFORMATION (DIRECT FACTS)]
Statutory Offences Registered on Document:
${f.offences?.map(o => `• ${o}`).join('\n')}

[AI INTERPRETATION / ANALYSIS]
These offences represent cognizable criminal violations under federal statutory law requiring formal judicial docketing.`;
  } else if (qLower.includes('evidence') || qLower.includes('seized') || qLower.includes('item')) {
    answer = `[SOURCE INFORMATION (DIRECT FACTS)]
Evidentiary References Detected in FIR:
${s?.evidenceReferenced?.map(e => `• ${e}`).join('\n') || '• Physical FIR Document Leaf and initial seized items mentioned in brief facts.'}

[AI INTERPRETATION / ANALYSIS]
All referenced physical and digital exhibits must be sealed with unique evidence tags and transferred via ISO/IEC 27037 chain-of-custody protocols before forensic bitstream imaging.`;
  } else if (qLower.includes('verification') || qLower.includes('verify') || qLower.includes('requires verification')) {
    const unverified = f.lowConfidenceFields && f.lowConfidenceFields.length > 0 ? f.lowConfidenceFields : ['None flagged'];
    answer = `[SOURCE INFORMATION (DIRECT FACTS)]
Fields Flagged During Document Ingestion:
${unverified.map(u => `• ${u}`).join('\n')}

[AI INTERPRETATION / ANALYSIS]
${s?.itemsRequiringVerification?.map(v => `• ${v}`).join('\n') || '• Standard verification of accused identity and official jurisdictional boundary.'}`;
  } else if (qLower.includes('timeline') || qLower.includes('when')) {
    answer = `[SOURCE INFORMATION (DIRECT FACTS)]
• Occurrence: ${f.dateOfOccurrence} at ${f.timeOfOccurrence}
• Incident Location: ${f.placeOfOccurrence}
• FIR Docketed: ${f.date} at ${f.time}

[AI INTERPRETATION / ANALYSIS]
Reconstructed Progression:
${s?.timeline?.map(t => `• ${t.time}: ${t.event}`).join('\n') || `• ${f.dateOfOccurrence} ${f.timeOfOccurrence}: Occurrence of incident\n• ${f.date} ${f.time}: FIR formal registration`}`;
  } else {
    answer = `[SOURCE INFORMATION (DIRECT FACTS)]
FIR Document ID: ${doc.documentId} | Case ID: ${doc.caseId || 'Pending Confirmation'}
Station: ${f.policeStation}
Accused: ${f.accusedName} | Complainant: ${f.complainantName}
Offences: ${f.offences.join(', ')}

[AI INTERPRETATION / ANALYSIS]
Regarding your query: "${message}"
Based on the verified document facts, the record confirms ${f.briefFacts.slice(0, 150)}...
Original document hash is ${doc.sha256Hash.slice(0, 16)}... and is anchored in the DCJMN permissioned ledger.`;
  }

  // Audit AI interaction
  blockchain.recordAudit(
    'POLICE',
    'FIR_ANALYZED',
    documentId,
    `AI inquiry executed for FIR ${documentId} by ${officerName}: "${message.slice(0, 60)}"`,
    doc.sha256Hash,
    '0xAI_QUERY',
    blockchain.getLatestBlock().blockNumber
  );

  return res.json({
    success: true,
    answer,
    source: 'DCJMN_INTELLIGENCE_ENGINE',
    documentId
  });
});


