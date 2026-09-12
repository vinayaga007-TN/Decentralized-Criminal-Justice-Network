import {
  AuditRecord,
  AuditActionType,
  BlockchainBlock,
  BlockchainTx,
  InstitutionType,
  InstitutionalIdentity,
  VerificationResult,
  CaseStage
} from '../src/types';
import { generateBlockHash, generateTxHash, sha256 } from './crypto';

// QBFT Consensus Validators
export const VALIDATOR_NODES = [
  { id: 'POLICE_NODE', institution: 'POLICE' as InstitutionType, address: '0x3B82631024Fa4A228e9c403328fE11A99011B101', name: 'Metro Police Node #01' },
  { id: 'FORENSIC_NODE', institution: 'FORENSICS' as InstitutionType, address: '0x7C119842DA9d8123A492F009121c8B3392AA99D1', name: 'Central Forensic Lab Node #03' },
  { id: 'COURT_NODE', institution: 'COURT' as InstitutionType, address: '0xE8F9C30114002891bbCA449102A772BF88C301A2', name: 'High Court Sovereign Bench #04' },
  { id: 'PRISON_NODE', institution: 'PRISON' as InstitutionType, address: '0x9482A8C0B2914755102BB98F210411AB2277C091', name: 'Correctional Facility Node #04' },
];

export interface IdentityContractRecord {
  identityId: string;
  institution: InstitutionType;
  role: string;
  publicKey: string;
  credentialStatus: 'ACTIVE' | 'REVOKED';
  badgeNumber: string;
}

export interface CaseContractRecord {
  caseId: string;
  creatingInstitution: InstitutionType;
  caseRecordHash: string;
  currentStage: CaseStage;
  status: 'ACTIVE' | 'CLOSED' | 'BAIL_RELEASED';
  timestamp: string;
  txHash: string;
  blockNumber: number;
  previousHash: string;
}

export interface EvidenceContractRecord {
  evidenceId: string;
  caseId: string;
  evidenceHash: string;
  currentCustodian: InstitutionType;
  previousCustodian?: InstitutionType;
  transferTx: string;
  blockNumber: number;
  timestamp: string;
  integrityStatus: 'VALID' | 'COMPROMISED';
}

export interface ReportContractRecord {
  reportId: string;
  caseId: string;
  evidenceId: string;
  reportHash: string;
  examinerId: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
}

export interface ChargesheetContractRecord {
  chargesheetId: string;
  caseId: string;
  chargesheetHash: string;
  prosecutorId: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
}

export interface OrderContractRecord {
  orderId: string;
  caseId: string;
  orderHash: string;
  judgeId: string;
  type: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
}

export interface CustodyContractRecord {
  inmateId: string;
  caseId: string;
  custodyRecordHash: string;
  status: string;
  courtOrderTx: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
}

export interface FIRDocumentContractRecord {
  documentId: string;
  caseId: string;
  documentHash: string;
  uploaderId: string;
  institution: InstitutionType;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  status: 'RECORDED' | 'VERIFIED';
}

class DCJMNBlockchain {
  private blocks: BlockchainBlock[] = [];
  private txCounter: number = 2901;
  private currentBlockNumber: number = 48192842;

  // Smart Contracts State Stores
  public identities: Map<string, IdentityContractRecord> = new Map();
  public cases: Map<string, CaseContractRecord> = new Map();
  public evidence: Map<string, EvidenceContractRecord> = new Map();
  public reports: Map<string, ReportContractRecord> = new Map();
  public chargesheets: Map<string, ChargesheetContractRecord> = new Map();
  public orders: Map<string, OrderContractRecord> = new Map();
  public custodies: Map<string, CustodyContractRecord> = new Map();
  public firDocuments: Map<string, FIRDocumentContractRecord> = new Map();
  public auditLog: AuditRecord[] = [];

  constructor() {
    this.seedIdentityRegistry();
    this.createGenesisBlock();
  }

  private seedIdentityRegistry() {
    const defaultIdentities: IdentityContractRecord[] = [
      {
        identityId: 'POL-IND-004281',
        institution: 'POLICE',
        role: 'Investigation Officer',
        publicKey: '0x02a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        credentialStatus: 'ACTIVE',
        badgeNumber: '#POL-9042'
      },
      {
        identityId: 'FOR-IND-003914',
        institution: 'FORENSICS',
        role: 'Chief Forensic Examiner',
        publicKey: '0x03f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d',
        credentialStatus: 'ACTIVE',
        badgeNumber: '#CFSL-DIR-881'
      },
      {
        identityId: 'CRT-IND-001872',
        institution: 'COURT',
        role: 'Presiding Magistrate Judge',
        publicKey: '0x02891a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
        credentialStatus: 'ACTIVE',
        badgeNumber: '#JUR-FED-04812'
      },
      {
        identityId: 'PRS-IND-002641',
        institution: 'PRISON',
        role: 'Correctional Facility Superintendent',
        publicKey: '0x037890123456789abcdef0123456789abcdef0123456789abcdef0123456789a',
        credentialStatus: 'ACTIVE',
        badgeNumber: '#PRIS-SUP-2641'
      }
    ];

    defaultIdentities.forEach(id => this.identities.set(id.identityId, id));
  }

  private createGenesisBlock() {
    const genesisTx: BlockchainTx = {
      txHash: '0x82ab719ef10082491a99bcde1920f5a0194821a8c0e11894b9812cc981af8921',
      blockNumber: this.currentBlockNumber,
      from: VALIDATOR_NODES[0].address,
      toContract: 'CaseRegistry',
      action: 'GENESIS_INITIALIZATION',
      dataHash: '0x9b2d8e41a87c9812f8a0029b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b02cf6',
      signature: '0xEd25519:77a82b99c148e9a22f4b001a48129c99182aa104921ff89',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      gasCost: 0,
      status: 'COMMITTED'
    };

    const genesisBlock: BlockchainBlock = {
      blockNumber: this.currentBlockNumber,
      blockHash: '0x0a81f9c7392e01bd9482cfa193857102ae8f4c2084728bb10248192842aa9901',
      parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: genesisTx.timestamp,
      proposer: VALIDATOR_NODES[0].name,
      transactionsCount: 1,
      stateRoot: '0x7c9812f8a0029b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b02cf69b2d8e41a',
      transactions: [genesisTx],
      qbftSignatures: VALIDATOR_NODES.map(v => ({
        validator: v.id,
        signature: `0xQBFT_ROUND_0_${v.id.substring(0, 4)}_${Date.now()}`
      }))
    };

    this.blocks.unshift(genesisBlock);
  }

  /**
   * Commit a transaction and mine a new QBFT consensus block
   */
  public commitTransaction(
    fromInstitution: InstitutionType,
    contract: 'IdentityRegistry' | 'CaseRegistry' | 'EvidenceRegistry' | 'AccessControlContract' | 'AuditContract',
    action: string,
    dataHash: string,
    digitalSignature: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    this.currentBlockNumber += 1;
    this.txCounter += 1;

    const validator = VALIDATOR_NODES.find(v => v.institution === fromInstitution) || VALIDATOR_NODES[0];
    const txHash = generateTxHash(action, validator.address, this.txCounter);
    const prevBlock = this.blocks[0];

    const tx: BlockchainTx = {
      txHash,
      blockNumber: this.currentBlockNumber,
      from: validator.address,
      toContract: contract,
      action,
      dataHash,
      signature: digitalSignature,
      timestamp: new Date().toISOString(),
      gasCost: 0,
      status: 'COMMITTED'
    };

    const blockHash = generateBlockHash(this.currentBlockNumber, prevBlock.blockHash, 1);

    // All 4 QBFT validators participate in consensus round and sign
    const qbftSignatures = VALIDATOR_NODES.map(v => ({
      validator: v.id,
      signature: `0xQBFT_ROUND_VALIDATED_${v.id}_SIG_${txHash.substring(0, 10)}`
    }));

    const newBlock: BlockchainBlock = {
      blockNumber: this.currentBlockNumber,
      blockHash,
      parentHash: prevBlock.blockHash,
      timestamp: tx.timestamp,
      proposer: validator.name,
      transactionsCount: 1,
      stateRoot: sha256(dataHash + prevBlock.blockHash),
      transactions: [tx],
      qbftSignatures
    };

    this.blocks.unshift(newBlock);
    return { tx, block: newBlock };
  }

  // --- Smart Contract Invocation Methods ---

  public registerCaseOnChain(
    caseId: string,
    institution: InstitutionType,
    caseRecordHash: string,
    signature: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    const { tx, block } = this.commitTransaction(
      institution,
      'CaseRegistry',
      'CASE_CREATED',
      caseRecordHash,
      signature
    );

    const prevCase = this.cases.get(caseId);
    this.cases.set(caseId, {
      caseId,
      creatingInstitution: institution,
      caseRecordHash,
      currentStage: 'FIR_REGISTERED',
      status: 'ACTIVE',
      timestamp: tx.timestamp,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber,
      previousHash: prevCase ? prevCase.caseRecordHash : '0x0000000000000000000000000000000000000000'
    });

    this.recordAudit(
      institution,
      'CASE_CREATED',
      caseId,
      `Case ${caseId} registered by ${institution}. Root record hash anchored to QBFT block #${block.blockNumber}`,
      caseRecordHash,
      tx.txHash,
      block.blockNumber
    );

    return { tx, block };
  }

  public updateCaseStageOnChain(
    caseId: string,
    institution: InstitutionType,
    newStage: CaseStage,
    updatedRecordHash: string,
    signature: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    const { tx, block } = this.commitTransaction(
      institution,
      'CaseRegistry',
      `CASE_STAGE_UPDATED_${newStage}`,
      updatedRecordHash,
      signature
    );

    const existing = this.cases.get(caseId);
    if (existing) {
      existing.currentStage = newStage;
      existing.previousHash = existing.caseRecordHash;
      existing.caseRecordHash = updatedRecordHash;
      existing.txHash = tx.txHash;
      existing.blockNumber = tx.blockNumber;
      if (newStage === 'BAIL_RELEASED') {
        existing.status = 'BAIL_RELEASED';
      }
    }

    this.recordAudit(
      institution,
      'CASE_UPDATED',
      caseId,
      `Case ${caseId} stage transitioned to ${newStage}`,
      updatedRecordHash,
      tx.txHash,
      block.blockNumber
    );

    return { tx, block };
  }

  public registerEvidenceOnChain(
    evidenceId: string,
    caseId: string,
    institution: InstitutionType,
    evidenceHash: string,
    signature: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    const { tx, block } = this.commitTransaction(
      institution,
      'EvidenceRegistry',
      'EVIDENCE_REGISTERED',
      evidenceHash,
      signature
    );

    this.evidence.set(evidenceId, {
      evidenceId,
      caseId,
      evidenceHash,
      currentCustodian: institution,
      transferTx: tx.txHash,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      integrityStatus: 'VALID'
    });

    this.recordAudit(
      institution,
      'EVIDENCE_REGISTERED',
      caseId,
      `Evidence item ${evidenceId} registered by ${institution}. Cryptographic fingerprint anchored on-chain.`,
      evidenceHash,
      tx.txHash,
      block.blockNumber
    );

    return { tx, block };
  }

  public transferEvidenceCustodyOnChain(
    evidenceId: string,
    caseId: string,
    from: InstitutionType,
    to: InstitutionType,
    evidenceHash: string,
    signature: string,
    reason: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    const { tx, block } = this.commitTransaction(
      from,
      'EvidenceRegistry',
      `EVIDENCE_TRANSFER_${from}_TO_${to}`,
      evidenceHash,
      signature
    );

    const record = this.evidence.get(evidenceId);
    if (record) {
      record.previousCustodian = from;
      record.currentCustodian = to;
      record.transferTx = tx.txHash;
      record.timestamp = tx.timestamp;
    }

    this.recordAudit(
      from,
      'EVIDENCE_TRANSFERRED',
      caseId,
      `Evidence ${evidenceId} custody transferred from ${from} to ${to}. Reason: ${reason}`,
      evidenceHash,
      tx.txHash,
      block.blockNumber
    );

    return { tx, block };
  }

  public registerForensicReportOnChain(
    reportId: string,
    caseId: string,
    evidenceId: string,
    examinerId: string,
    reportHash: string,
    signature: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    const { tx, block } = this.commitTransaction(
      'FORENSICS',
      'AuditContract',
      'REPORT_SUBMITTED',
      reportHash,
      signature
    );

    this.reports.set(reportId, {
      reportId,
      caseId,
      evidenceId,
      reportHash,
      examinerId,
      timestamp: tx.timestamp,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    });

    this.recordAudit(
      'FORENSICS',
      'REPORT_SUBMITTED',
      caseId,
      `Forensic Report ${reportId} digitally certified & anchored by CFSL examiner ${examinerId}`,
      reportHash,
      tx.txHash,
      block.blockNumber
    );

    return { tx, block };
  }

  public registerChargesheetOnChain(
    chargesheetId: string,
    caseId: string,
    prosecutorId: string,
    chargesheetHash: string,
    signature: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    const { tx, block } = this.commitTransaction(
      'POLICE',
      'CaseRegistry',
      'CHARGESHEET_SUBMITTED',
      chargesheetHash,
      signature
    );

    this.chargesheets.set(chargesheetId, {
      chargesheetId,
      caseId,
      chargesheetHash,
      prosecutorId,
      timestamp: tx.timestamp,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    });

    this.recordAudit(
      'POLICE',
      'CHARGESHEET_SUBMITTED',
      caseId,
      `Formal prosecution chargesheet ${chargesheetId} submitted to Judicial Bench #04`,
      chargesheetHash,
      tx.txHash,
      block.blockNumber
    );

    return { tx, block };
  }

  public registerCourtOrderOnChain(
    orderId: string,
    caseId: string,
    judgeId: string,
    type: string,
    orderHash: string,
    signature: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    const { tx, block } = this.commitTransaction(
      'COURT',
      'CaseRegistry',
      `COURT_ORDER_${type}`,
      orderHash,
      signature
    );

    this.orders.set(orderId, {
      orderId,
      caseId,
      orderHash,
      judgeId,
      type,
      timestamp: tx.timestamp,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    });

    this.recordAudit(
      'COURT',
      'COURT_ORDER_ISSUED',
      caseId,
      `Court Order ${orderId} (${type}) attested by ${judgeId}`,
      orderHash,
      tx.txHash,
      block.blockNumber
    );

    return { tx, block };
  }

  public registerPrisonCustodyOnChain(
    inmateId: string,
    caseId: string,
    custodyHash: string,
    courtOrderTx: string,
    signature: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    const { tx, block } = this.commitTransaction(
      'PRISON',
      'CaseRegistry',
      'PRISON_TRANSFER_CREATED',
      custodyHash,
      signature
    );

    this.custodies.set(inmateId, {
      inmateId,
      caseId,
      custodyRecordHash: custodyHash,
      status: 'REMAND_DETENTION',
      courtOrderTx,
      timestamp: tx.timestamp,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    });

    this.recordAudit(
      'PRISON',
      'PRISON_TRANSFER_CREATED',
      caseId,
      `Inmate ${inmateId} intake finalized in Maximum-Security Detention Enclave`,
      custodyHash,
      tx.txHash,
      block.blockNumber
    );

    return { tx, block };
  }

  public registerFIRDocumentOnChain(
    documentId: string,
    caseId: string,
    uploaderId: string,
    institution: InstitutionType,
    documentHash: string,
    signature: string
  ): { tx: BlockchainTx; block: BlockchainBlock } {
    const { tx, block } = this.commitTransaction(
      institution,
      'CaseRegistry',
      'FIR_DOCUMENT_RECORDED',
      documentHash,
      signature
    );

    this.firDocuments.set(documentId, {
      documentId,
      caseId,
      documentHash,
      uploaderId,
      institution,
      timestamp: tx.timestamp,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber,
      status: 'RECORDED'
    });

    this.recordAudit(
      institution,
      'FIR_VERIFIED',
      caseId,
      `FIR Document ${documentId} registered by ${institution} (${uploaderId}). SHA-256 hash ${documentHash.substring(0, 16)}... anchored to QBFT block #${block.blockNumber}`,
      documentHash,
      tx.txHash,
      block.blockNumber
    );

    return { tx, block };
  }

  public recordAudit(
    institution: InstitutionType,
    action: AuditActionType,
    caseId: string,
    details: string,
    recordHash: string,
    txHash: string,
    blockNumber: number,
    status: 'SUCCESS' | 'FAILED' | 'TAMPER_ALERT' = 'SUCCESS'
  ): AuditRecord {
    const record: AuditRecord = {
      id: 'AUD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      institution,
      userId: institution + '_NODE_AGENT',
      action,
      caseId,
      details,
      recordHash,
      txHash,
      blockNumber,
      status
    };
    this.auditLog.unshift(record);
    return record;
  }

  public getBlocks(): BlockchainBlock[] {
    return this.blocks;
  }

  public getTransaction(txHash: string): BlockchainTx | undefined {
    for (const block of this.blocks) {
      const found = block.transactions.find(t => t.txHash.toLowerCase() === txHash.toLowerCase());
      if (found) return found;
    }
    return undefined;
  }

  public getLatestBlock(): BlockchainBlock {
    return this.blocks[0];
  }

  public getAuditTrail(caseId?: string): AuditRecord[] {
    if (!caseId) return this.auditLog;
    return this.auditLog.filter(a => a.caseId.toLowerCase() === caseId.toLowerCase());
  }

  /**
   * Cryptographic integrity verification against immutable blockchain hash
   */
  public verifyIntegrity(
    type: 'CASE' | 'EVIDENCE' | 'FORENSIC_REPORT' | 'CHARGESHEET' | 'COURT_ORDER' | 'FIR_DOCUMENT',
    id: string,
    calculatedHash: string
  ): VerificationResult {
    let expectedHash = '';
    let blockNumber = 0;
    let txHash = '';
    let timestamp = '';
    let signer = '';

    if (type === 'CASE') {
      const c = this.cases.get(id);
      if (c) {
        expectedHash = c.caseRecordHash;
        blockNumber = c.blockNumber;
        txHash = c.txHash;
        timestamp = c.timestamp;
        signer = c.creatingInstitution + '_NODE';
      }
    } else if (type === 'FIR_DOCUMENT') {
      const doc = this.firDocuments.get(id);
      if (doc) {
        expectedHash = doc.documentHash;
        blockNumber = doc.blockNumber;
        txHash = doc.txHash;
        timestamp = doc.timestamp;
        signer = doc.institution + '_NODE (' + doc.uploaderId + ')';
      }
    } else if (type === 'EVIDENCE') {
      const e = this.evidence.get(id);
      if (e) {
        expectedHash = e.evidenceHash;
        blockNumber = e.blockNumber;
        txHash = e.transferTx;
        timestamp = e.timestamp;
        signer = e.currentCustodian + '_NODE';
      }
    } else if (type === 'FORENSIC_REPORT') {
      const r = this.reports.get(id);
      if (r) {
        expectedHash = r.reportHash;
        blockNumber = r.blockNumber;
        txHash = r.txHash;
        timestamp = r.timestamp;
        signer = 'FORENSICS_NODE (' + r.examinerId + ')';
      }
    } else if (type === 'CHARGESHEET') {
      const cs = this.chargesheets.get(id);
      if (cs) {
        expectedHash = cs.chargesheetHash;
        blockNumber = cs.blockNumber;
        txHash = cs.txHash;
        timestamp = cs.timestamp;
        signer = 'POLICE_LEAD_PROSECUTOR (' + cs.prosecutorId + ')';
      }
    } else if (type === 'COURT_ORDER') {
      const o = this.orders.get(id);
      if (o) {
        expectedHash = o.orderHash;
        blockNumber = o.blockNumber;
        txHash = o.txHash;
        timestamp = o.timestamp;
        signer = 'JUDICIAL_BENCH_MAGISTRATE (' + o.judgeId + ')';
      }
    }

    const normCalculated = calculatedHash.toLowerCase();
    const normExpected = expectedHash.toLowerCase();
    const match = Boolean(normExpected && normCalculated === normExpected);

    // If mismatch, record an audit event for integrity failure
    if (!match && expectedHash) {
      this.recordAudit(
        'COURT',
        'RECORD_INTEGRITY_FAILED',
        id,
        `Integrity failure detected on ${type} ${id}. Calculated hash (${calculatedHash.substring(0, 14)}...) differs from ledger anchor (${expectedHash.substring(0, 14)}...). ACCESS SUSPENDED.`,
        calculatedHash,
        txHash,
        blockNumber,
        'TAMPER_ALERT'
      );
    } else if (match) {
      this.recordAudit(
        'COURT',
        'RECORD_VERIFIED',
        id,
        `Cryptographic integrity verified for ${type} ${id} in QBFT block #${blockNumber}`,
        calculatedHash,
        txHash,
        blockNumber,
        'SUCCESS'
      );
    }

    return {
      verified: match,
      targetType: type,
      targetId: id,
      currentHash: calculatedHash,
      blockchainHash: expectedHash || 'NO_ANCHOR_RECORD_FOUND',
      blockNumber,
      txHash: txHash || '0x0000000000000000',
      timestamp: timestamp || new Date().toISOString(),
      signerIdentity: signer,
      message: match
        ? '✓ RECORD VERIFIED: Zero bit discrepancies detected across institutional database payload and blockchain root.'
        : '⚠ INTEGRITY FAILURE: The retrieved record does not match the blockchain-registered hash. Off-chain data may have been altered!'
    };
  }
}

export const blockchain = new DCJMNBlockchain();
