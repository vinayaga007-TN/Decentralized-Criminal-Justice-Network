export type InstitutionType = 'POLICE' | 'FORENSICS' | 'COURT' | 'PRISON';

export interface InstitutionalIdentity {
  id: string; // e.g. POL-IND-004281, FOR-IND-003914, CRT-IND-001872, PRS-IND-002641
  name: string;
  institution: InstitutionType;
  role: string;
  publicKey: string;
  credentialStatus: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
  stationOrBench: string;
  badgeNumber: string;
  sessionToken?: string;
}

export type CaseStage = 
  | 'FIR_REGISTERED'
  | 'INVESTIGATION_ACTIVE'
  | 'EVIDENCE_TRANSFERRED_TO_FORENSICS'
  | 'FORENSIC_ANALYSIS_COMPLETED'
  | 'CHARGESHEET_SUBMITTED'
  | 'COURT_ACCEPTED'
  | 'JUDGMENT_ISSUED'
  | 'PRISON_CUSTODY_CREATED'
  | 'BAIL_RELEASED';

export interface AccusedInfo {
  name: string;
  alias?: string;
  nationalId: string; // Encrypted in DB, never on chain
  age: number;
  gender: string;
  charges: string[];
  inmateNumber?: string;
  photoUrl?: string;
}

export interface CaseRecord {
  caseId: string; // CASE-2026-000127 or CASE-2026-00124
  title: string;
  creatingInstitution: 'POLICE';
  officerId: string;
  officerName: string;
  station: string;
  timestamp: string;
  stage: CaseStage;
  status: 'ACTIVE' | 'CLOSED' | 'TRANSFERRED' | 'BAIL_RELEASED';
  incidentDetails: string;
  complainant: string;
  accused: AccusedInfo;
  recordHash: string; // SHA-256 of canonical record
  txHash: string;
  blockNumber: number;
  tampered?: boolean;
  originalHash?: string;
}

export interface EvidenceItem {
  evidenceId: string; // EVD-2026-00481 or EVD-2026-9042
  caseId: string;
  title: string;
  type: 'Digital Storage' | 'Digital Log' | 'Biochemical / DNA' | 'Hardware Security' | 'Physical Ballistic' | 'Documentary';
  description: string;
  sha256Hash: string;
  currentCustodian: InstitutionType;
  previousCustodian?: InstitutionType;
  custodianOfficer: string;
  storageLocation: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  tampered?: boolean;
  originalHash?: string;
  transferHistory: {
    from: InstitutionType;
    to: InstitutionType;
    officer: string;
    timestamp: string;
    txHash: string;
    reason: string;
  }[];
}

export interface ForensicReport {
  reportId: string; // CFSL-REP-2026-0481
  caseId: string;
  evidenceId: string;
  examinerId: string;
  examinerName: string;
  labNode: string;
  methodology: string;
  findings: string;
  conclusions: string;
  reportHash: string;
  digitalSignature: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  tampered?: boolean;
  originalHash?: string;
}

export interface Chargesheet {
  chargesheetId: string; // CS-891-2026
  caseId: string;
  leadProsecutor: string;
  prosecutorBarId: string;
  sectionsApplied: string[];
  summary: string;
  admittedEvidenceCount: number;
  chargesheetHash: string;
  digitalSignature: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  courtAccepted: boolean;
  tampered?: boolean;
  originalHash?: string;
}

export interface CourtOrder {
  orderId: string; // CT-ORD-2026-00492
  caseId: string;
  type: 'WARRANT' | 'REMAND' | 'FORENSIC_SUBPOENA' | 'JUDGMENT_CONVICTION' | 'BAIL_RELEASE';
  issuingJudge: string;
  courtBench: string;
  details: string;
  stipulations: string[];
  orderHash: string;
  digitalSignature: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
}

export interface InmateCustodyRecord {
  inmateId: string; // INM-2026-00812
  caseId: string;
  fullName: string;
  wardAndCell: string;
  securityClassification: 'MIN-SEC' | 'MED-SEC' | 'MAX-SEC';
  admissionDate: string;
  remandAuthority: string;
  courtOrderRef: string;
  custodyStatus: 'REMAND_DETENTION' | 'SERVING_SENTENCE' | 'BAIL_RELEASED' | 'TRANSFERRED';
  bloodScreening: string;
  quarantineCleared: boolean;
  biometricProofRoot: string;
  txHash: string;
  blockNumber: number;
}

export interface AccessRequest {
  requestId: string;
  requesterId: string;
  requesterInstitution: InstitutionType;
  targetInstitution: InstitutionType;
  caseId: string;
  resourceId: string;
  reason: string;
  requestedAction: 'READ_EVIDENCE' | 'TRANSFER_CUSTODY' | 'READ_FORENSIC_REPORT' | 'READ_CHARGESHEET' | 'EXECUTE_PRISON_TRANSFER';
  timestamp: string;
  signature: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  txHash: string;
}

export type AuditActionType =
  | 'LOGIN'
  | 'CASE_CREATED'
  | 'CASE_UPDATED'
  | 'EVIDENCE_REGISTERED'
  | 'EVIDENCE_TRANSFERRED'
  | 'REPORT_SUBMITTED'
  | 'ACCESS_REQUESTED'
  | 'ACCESS_GRANTED'
  | 'ACCESS_DENIED'
  | 'CHARGESHEET_SUBMITTED'
  | 'COURT_ORDER_ISSUED'
  | 'PRISON_TRANSFER_CREATED'
  | 'RECORD_VERIFIED'
  | 'RECORD_INTEGRITY_FAILED';

export interface AuditRecord {
  id: string;
  timestamp: string;
  institution: InstitutionType;
  userId: string;
  action: AuditActionType;
  caseId: string;
  details: string;
  recordHash: string;
  txHash: string;
  blockNumber: number;
  status: 'SUCCESS' | 'FAILED' | 'TAMPER_ALERT';
}

export interface BlockchainBlock {
  blockNumber: number;
  blockHash: string;
  parentHash: string;
  timestamp: string;
  proposer: string;
  transactionsCount: number;
  stateRoot: string;
  transactions: BlockchainTx[];
  qbftSignatures: {
    validator: string;
    signature: string;
  }[];
}

export interface BlockchainTx {
  txHash: string;
  blockNumber: number;
  from: string;
  toContract: 'IdentityRegistry' | 'CaseRegistry' | 'EvidenceRegistry' | 'AccessControlContract' | 'AuditContract';
  action: string;
  dataHash: string;
  signature: string;
  timestamp: string;
  gasCost: 0; // Sovereign gas-free
  status: 'COMMITTED';
}

export interface VerificationResult {
  verified: boolean;
  targetType: 'CASE' | 'EVIDENCE' | 'FORENSIC_REPORT' | 'CHARGESHEET' | 'COURT_ORDER';
  targetId: string;
  currentHash: string;
  blockchainHash: string;
  blockNumber: number;
  txHash: string;
  timestamp: string;
  signerIdentity: string;
  message: string;
}
