import {
  CaseRecord,
  EvidenceItem,
  ForensicReport,
  Chargesheet,
  CourtOrder,
  InmateCustodyRecord,
  InstitutionalIdentity,
  AccessRequest,
  InstitutionType
} from '../src/types';
import { encryptSensitive, sha256 } from './crypto';
import { blockchain } from './blockchain';

/**
 * =========================================================================
 * 1. POLICE DATABASE (police_db)
 * =========================================================================
 */
export class PoliceDatabase {
  public cases: Map<string, CaseRecord> = new Map();
  public evidence: Map<string, EvidenceItem> = new Map();
  public chargesheets: Map<string, Chargesheet> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const caseId = 'CASE-2026-00124';
    const rawCase = {
      caseId,
      title: 'State of Federal District 04 vs. Ravi & Associates',
      creatingInstitution: 'POLICE' as const,
      officerId: 'POL-IND-004281',
      officerName: 'Inspector Kumar',
      station: 'Metro Central Division (#POL-MC-09)',
      timestamp: '2026-02-14T04:12:08Z',
      stage: 'PRISON_CUSTODY_CREATED' as const,
      status: 'ACTIVE' as const,
      incidentDetails: 'Sub-station 14 intercept team executed arrest following anomalous encrypted data transmission flags flagged by District Cyber Node. Suspect seized with hardware security authenticators and duplicate treasury vouchers totaling $4.2M in federal securities.',
      complainant: 'Federal Auditor General Unit 7',
      accused: {
        name: 'Ravi Kiran Sharma',
        alias: 'The Architect',
        nationalId: encryptSensitive('FED-ID: 8820-9411-9022').ciphertext, // Encrypted!
        age: 34,
        gender: 'Male',
        charges: ['Sec. 420 (Fraud)', 'Sec. 467 (Forgery)', 'Sec. 471 (Counterfeit Security)', 'Sec. 120-B (Conspiracy)'],
        inmateNumber: 'INM-2026-00812'
      }
    };

    const recordHash = sha256(rawCase);
    const { tx } = blockchain.registerCaseOnChain(
      caseId,
      'POLICE',
      recordHash,
      '0xEd25519_POLICE_OFFICER_KUMAR_SIG_04812'
    );

    this.cases.set(caseId, {
      ...rawCase,
      recordHash,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    });

    // Evidence 1
    const ev1Id = 'EVD-2026-9901';
    const ev1Hash = '0x9b2d8e41a87c9812f8a0029b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b02cf6';
    this.evidence.set(ev1Id, {
      evidenceId: ev1Id,
      caseId,
      title: 'Samsung 2TB T7 Shield SSD (Extracted Logs)',
      type: 'Digital Log',
      description: 'Physical SSD seized from suspect workstation containing decrypted session keys and automated ledger injection routines.',
      sha256Hash: ev1Hash,
      currentCustodian: 'FORENSICS',
      previousCustodian: 'POLICE',
      custodianOfficer: 'Ryan Thorne, Sr. Analyst (CFSL)',
      storageLocation: 'Central Forensic Lab Specimen Vault #03',
      timestamp: '2026-02-14T08:15:00Z',
      txHash: tx.txHash,
      blockNumber: tx.blockNumber,
      transferHistory: [
        {
          from: 'POLICE',
          to: 'FORENSICS',
          officer: 'Inspector Kumar',
          timestamp: '2026-02-14T11:20:14Z',
          txHash: '0x5d4e11bb890a2c89f1821049b81200192cc981af8921820491ba8192842aa990',
          reason: 'Expedited Forensic Analysis on encrypted partitions'
        }
      ]
    });

    blockchain.registerEvidenceOnChain(ev1Id, caseId, 'POLICE', ev1Hash, '0xSIG_POLICE_EV1');
    blockchain.transferEvidenceCustodyOnChain(
      ev1Id,
      caseId,
      'POLICE',
      'FORENSICS',
      ev1Hash,
      '0xSIG_POLICE_TRANSFER_EV1',
      'Expedited Forensic Analysis'
    );

    // Evidence 2
    const ev2Id = 'EVD-2026-9902';
    const ev2Hash = '0x4a71bf003c2bb0194821cc90184b291a00812f8a0029b3c4d5e6f7a8b9cee841';
    this.evidence.set(ev2Id, {
      evidenceId: ev2Id,
      caseId,
      title: 'Fiber Micro-Traces (Vault Breach Point)',
      type: 'Biochemical / DNA',
      description: 'Synthetic fiber swab specimens collected from the emergency server vault air-filtration vent.',
      sha256Hash: ev2Hash,
      currentCustodian: 'POLICE',
      custodianOfficer: 'Sgt. Reynolds (#POL-4182)',
      storageLocation: 'Division Evidence Locker #04',
      timestamp: '2026-02-14T08:15:00Z',
      txHash: tx.txHash,
      blockNumber: tx.blockNumber,
      transferHistory: []
    });
    blockchain.registerEvidenceOnChain(ev2Id, caseId, 'POLICE', ev2Hash, '0xSIG_POLICE_EV2');

    // Chargesheet
    const csId = 'CS-891-2026';
    const rawCs = {
      chargesheetId: csId,
      caseId,
      leadProsecutor: 'Adv. Jennifer Holt',
      prosecutorBarId: 'BAR-#48910',
      sectionsApplied: ['Sec. 420', 'Sec. 467', 'Sec. 471', 'Sec. 120-B'],
      summary: 'Prosecution submits complete chain-of-custody proofs, comprising 14 encrypted data containers, 3 forensic analysis certificates, and certified server logs. All artifacts are cryptographically bound to Root Block #48,192,842.',
      admittedEvidenceCount: 3
    };
    const csHash = sha256(rawCs);
    this.chargesheets.set(csId, {
      ...rawCs,
      chargesheetHash: csHash,
      digitalSignature: '0xEd25519_PROSECUTION_SEAL_BAR_48910',
      timestamp: '2026-02-15T10:00:00Z',
      txHash: tx.txHash,
      blockNumber: tx.blockNumber,
      courtAccepted: true
    });
    blockchain.registerChargesheetOnChain(csId, caseId, 'BAR-#48910', csHash, '0xSIG_CHARGESHEET');
  }
}

/**
 * =========================================================================
 * 2. FORENSICS DATABASE (forensics_db)
 * =========================================================================
 */
export class ForensicsDatabase {
  public evidenceReceived: Map<string, EvidenceItem> = new Map();
  public reports: Map<string, ForensicReport> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const reportId = 'CFSL-REP-2026-0481';
    const caseId = 'CASE-2026-00124';
    const evidenceId = 'EVD-2026-9901';

    const rawReport = {
      reportId,
      caseId,
      evidenceId,
      examinerId: 'CFSL-DIR-881',
      examinerName: 'Dr. Elena Rostova',
      labNode: 'CFSL Cyber & Ballistics Node #03',
      methodology: 'Sector-by-sector write-blocked bitstream acquisition using Tableau TX1, followed by SHA-256 / BLAKE3 cryptographic verification.',
      findings: 'Hardware vault bit-level clone image 100% matched against original physical hash (0x9b2d8e41a87c9812f8a...). Decrypted database files confirmed 18 spoofed state transactions injected into municipal accounts.',
      conclusions: 'Primary defendant workstation was source of unauthorized smart contract approvals. Tamper-evident seals intact with 0 record discrepancies.'
    };

    const reportHash = sha256(rawReport);
    const { tx } = blockchain.registerForensicReportOnChain(
      reportId,
      caseId,
      evidenceId,
      'CFSL-DIR-881',
      reportHash,
      '0xEd25519_ROSTOVA_DIR_881_SEAL'
    );

    this.reports.set(reportId, {
      ...rawReport,
      reportHash,
      digitalSignature: '0xEd25519_ROSTOVA_DIR_881_SEAL',
      timestamp: '2026-02-14T14:30:00Z',
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    });
  }
}

/**
 * =========================================================================
 * 3. COURT DATABASE (court_db)
 * =========================================================================
 */
export class CourtDatabase {
  public receivedCases: Map<string, CaseRecord> = new Map();
  public orders: Map<string, CourtOrder> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const caseId = 'CASE-2026-00124';
    const orderId = 'CT-ORD-BAIL-2026-00492';

    const rawOrder = {
      orderId,
      caseId,
      type: 'BAIL_RELEASE' as const,
      issuingJudge: 'Hon. Justice Sarah Vance',
      courtBench: 'High Court Sovereign Bench #04',
      details: 'Decree issued granting conditional pre-trial bail upon verified escrow deposit of $50,000 USD, mandatory 24/7 RFID geo-monitoring, and verified passport surrender.',
      stipulations: [
        'Surety Deposit: $50,000 USD Escrow (Bank Deposit Stamped)',
        'Release Condition: Surrender Passport + Ankle Geo-Tag 24/7',
        'Mandatory Attendance: Bi-weekly appearance before Magistrate Bench 04'
      ]
    };

    const orderHash = sha256(rawOrder);
    const { tx } = blockchain.registerCourtOrderOnChain(
      orderId,
      caseId,
      'JUR-US-FED-04812',
      'BAIL_RELEASE',
      orderHash,
      '0xEd25519_JUSTICE_VANCE_MAGISTRATE_SIGNATURE'
    );

    this.orders.set(orderId, {
      ...rawOrder,
      orderHash,
      digitalSignature: '0xEd25519_JUSTICE_VANCE_MAGISTRATE_SIGNATURE',
      timestamp: '2026-03-14T11:02:00Z',
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    });
  }
}

/**
 * =========================================================================
 * 4. PRISON DATABASE (prison_db)
 * =========================================================================
 */
export class PrisonDatabase {
  public inmates: Map<string, InmateCustodyRecord> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const inmateId = 'INM-2026-00812';
    const caseId = 'CASE-2026-00124';

    const rawInmate = {
      inmateId,
      caseId,
      fullName: 'Ravi Kiran Sharma',
      wardAndCell: 'B-Wing Tier 3 (Cell 308-A)',
      securityClassification: 'MAX-SEC' as const,
      admissionDate: '2026-03-12T14:22:00Z',
      remandAuthority: 'Chief Magistrate Federal Cir. #04',
      courtOrderRef: 'CT-ORD-BAIL-2026-00492',
      custodyStatus: 'REMAND_DETENTION' as const,
      bloodScreening: 'Negative (Cannabinoid/Opiate/Stimulant) - Dr. S. Nair MD',
      quarantineCleared: true,
      biometricProofRoot: '0x3c8e41da882109aa88bc019248102ffc98a10291'
    };

    const custodyHash = sha256(rawInmate);
    const { tx } = blockchain.registerPrisonCustodyOnChain(
      inmateId,
      caseId,
      custodyHash,
      '0x90ca38ef11b4028a48129cc8810284aa99011b10',
      '0xEd25519_SUPERINTENDENT_VANCE_SEAL'
    );

    this.inmates.set(inmateId, {
      ...rawInmate,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    });
  }
}

/**
 * Separate Logical Database Instances
 */
export const policeDb = new PoliceDatabase();
export const forensicsDb = new ForensicsDatabase();
export const courtDb = new CourtDatabase();
export const prisonDb = new PrisonDatabase();
export const accessRequests: AccessRequest[] = [];
