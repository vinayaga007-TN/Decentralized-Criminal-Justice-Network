import {
  CaseRecord,
  EvidenceItem,
  ForensicReport,
  Chargesheet,
  CourtOrder,
  InmateCustodyRecord,
  InstitutionalIdentity,
  BlockchainBlock,
  BlockchainTx,
  AuditRecord,
  VerificationResult,
  InstitutionType
} from '../types';

export const api = {
  // Auth & Biometrics
  async verifyIdentity(identityId: string): Promise<{ success: boolean; identity: InstitutionalIdentity; error?: string }> {
    const res = await fetch('/api/auth/verify-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identityId })
    });
    return res.json();
  },

  async runBiometricLiveness(payload: {
    identityId: string;
    faceMatched: boolean;
    irisMatched: boolean;
    printMatched: boolean;
  }): Promise<{ success: boolean; sessionToken?: string; livenessScore?: number; identity?: InstitutionalIdentity; error?: string }> {
    const res = await fetch('/api/auth/biometric-liveness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Cases
  async getCases(): Promise<{ success: boolean; cases: CaseRecord[] }> {
    const res = await fetch('/api/cases');
    return res.json();
  },

  async getCaseDetails(caseId: string): Promise<{
    success: boolean;
    case: CaseRecord;
    evidence: EvidenceItem[];
    reports: ForensicReport[];
    chargesheets: Chargesheet[];
    orders: CourtOrder[];
    inmates: InmateCustodyRecord[];
    integrity: VerificationResult;
    error?: string;
  }> {
    const res = await fetch(`/api/cases/${caseId}`);
    return res.json();
  },

  async createCase(payload: Partial<CaseRecord> & { accusedName?: string; accusedAge?: number; charges?: string[] }): Promise<{
    success: boolean;
    case: CaseRecord;
    tx: BlockchainTx;
    block: BlockchainBlock;
  }> {
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Evidence
  async registerEvidence(caseId: string, payload: {
    title: string;
    type: string;
    description: string;
    storageLocation: string;
    officerName?: string;
  }): Promise<{ success: boolean; evidence: EvidenceItem; tx: BlockchainTx; block: BlockchainBlock }> {
    const res = await fetch(`/api/cases/${caseId}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async transferEvidence(evidenceId: string, payload: {
    toInstitution: InstitutionType;
    reason: string;
    officerName?: string;
  }): Promise<{ success: boolean; evidence: EvidenceItem; tx: BlockchainTx; block: BlockchainBlock }> {
    const res = await fetch(`/api/evidence/${evidenceId}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Forensics
  async submitForensicReport(payload: {
    caseId: string;
    evidenceId: string;
    methodology: string;
    findings: string;
    conclusions: string;
    examinerName?: string;
    examinerId?: string;
  }): Promise<{ success: boolean; report: ForensicReport; tx: BlockchainTx; block: BlockchainBlock }> {
    const res = await fetch('/api/forensics/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Chargesheet
  async submitChargesheet(caseId: string, payload: {
    summary: string;
    sectionsApplied: string[];
    leadProsecutor?: string;
    prosecutorBarId?: string;
  }): Promise<{ success: boolean; chargesheet: Chargesheet; tx: BlockchainTx; block: BlockchainBlock }> {
    const res = await fetch(`/api/cases/${caseId}/chargesheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Court Orders
  async issueCourtOrder(payload: {
    caseId: string;
    type: 'WARRANT' | 'REMAND' | 'FORENSIC_SUBPOENA' | 'JUDGMENT_CONVICTION' | 'BAIL_RELEASE';
    details: string;
    stipulations: string[];
    judgeId?: string;
  }): Promise<{ success: boolean; order: CourtOrder; tx: BlockchainTx; block: BlockchainBlock }> {
    const res = await fetch('/api/court/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Prison & Bail
  async admitInmate(payload: {
    caseId: string;
    fullName: string;
    wardAndCell?: string;
    securityClassification?: string;
    courtOrderRef?: string;
  }): Promise<{ success: boolean; inmate: InmateCustodyRecord; tx: BlockchainTx; block: BlockchainBlock }> {
    const res = await fetch('/api/prison/custody', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async executeBailRelease(inmateId: string): Promise<{ success: boolean; inmate: InmateCustodyRecord; message: string }> {
    const res = await fetch('/api/prison/bail-release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inmateId })
    });
    return res.json();
  },

  // Blockchain & Audit
  async getBlockchainStatus(): Promise<{
    success: boolean;
    status: string;
    consensus: string;
    validatorPeers: { id: string; institution: InstitutionType; address: string; name: string }[];
    latestBlockNumber: number;
    latestBlockHash: string;
    latestTxHash: string;
    consensusLatencyMs: number;
  }> {
    const res = await fetch('/api/blockchain/status');
    return res.json();
  },

  async getBlocks(): Promise<{ success: boolean; blocks: BlockchainBlock[] }> {
    const res = await fetch('/api/blockchain/blocks');
    return res.json();
  },

  async verifyBlockchainIntegrity(type: 'CASE' | 'EVIDENCE' | 'FORENSIC_REPORT' | 'CHARGESHEET' | 'COURT_ORDER', id: string, calculatedHash: string): Promise<{
    success: boolean;
    result: VerificationResult;
  }> {
    const res = await fetch('/api/blockchain/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, calculatedHash })
    });
    return res.json();
  },

  async getAuditTrail(caseId: string = 'all'): Promise<{ success: boolean; auditTrail: AuditRecord[] }> {
    const res = await fetch(`/api/audit/${caseId}`);
    return res.json();
  },

  // Demo Tamper & Restore
  async simulateTamper(targetType: 'CASE' | 'EVIDENCE' | 'CHARGESHEET', targetId?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/demo/tamper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId })
    });
    return res.json();
  },

  async restoreAuthentic(targetType: 'CASE' | 'EVIDENCE' | 'CHARGESHEET', targetId?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/demo/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId })
    });
    return res.json();
  },

  // DCJMN Intelligence (AI + Network Graph)
  async queryIntelligence(query: string, caseId?: string): Promise<{
    success: boolean;
    answer: string;
    source: string;
    caseId: string;
    error?: string;
  }> {
    const res = await fetch('/api/intelligence/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, caseId })
    });
    return res.json();
  }
};
