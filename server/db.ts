import {
  CaseRecord,
  EvidenceItem,
  ForensicReport,
  Chargesheet,
  CourtOrder,
  InmateCustodyRecord,
  InstitutionalIdentity,
  AccessRequest,
  InstitutionType,
  FIRDocument
} from '../src/types';
import { encryptSensitive, sha256 } from './crypto';
import { blockchain } from './blockchain';
import { SAMPLE_FIR_DOCUMENTS } from './firSamples';

/**
 * =========================================================================
 * 1. POLICE DATABASE (police_db)
 * =========================================================================
 */
export class PoliceDatabase {
  public cases: Map<string, CaseRecord> = new Map();
  public evidence: Map<string, EvidenceItem> = new Map();
  public chargesheets: Map<string, Chargesheet> = new Map();
  public firStorage: Map<string, FIRDocument> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const caseId = 'CASE-2026-00124';
    const firDocId = 'FIR-DOC-2026-00124';
    const firHash = '0xa83f940172bbcd1902488102f99ac1082bb491a0c812ea99182aa104921ff892';

    // Seed original FIR Document with preservation and provenance
    const seededFIR: FIRDocument = {
      id: firDocId,
      documentId: firDocId,
      caseId,
      fileName: 'FIR-2026-00124-CYBER-EXFILTRATION.pdf',
      fileSize: 348210,
      fileSizeFormatted: '340 KB',
      mimeType: 'application/pdf',
      documentType: 'PDF',
      fileDataUrl: SAMPLE_FIR_DOCUMENTS[0]?.svgDataUrl || 'data:application/pdf;base64,JVBERi0xLjQ...',
      totalPages: 3,
      sha256Hash: firHash,
      status: 'VERIFIED',
      integrityStatus: 'VERIFIED',
      blockchainStatus: 'RECORDED',
      uploadedAt: '2026-02-14T04:12:08Z',
      verifiedAt: '2026-02-14T04:15:30Z',
      uploaderOfficerId: 'POL-IND-004281',
      uploaderOfficerName: 'Inspector Kumar',
      institution: 'POLICE',
      digitalSignature: '0xEd25519_POLICE_OFFICER_KUMAR_SIG_04812',
      txHash: '0x82ab719ef10082491a99bcde1920f5a0194821a8c0e11894b9812cc981af8921',
      blockNumber: 48192842,
      rawOcrText: `FIRST INFORMATION REPORT (Under Sec. 154 Cr.P.C.)
1. District: Federal Cyber District 04 | Police Station: Metro Central Division (#POL-MC-09) | Year: 2026 | FIR No: 0124
2. Acts & Sections: Sec. 420 (Fraud), Sec. 467 (Forgery), Sec. 471 (Counterfeit Security), Sec. 120-B (Conspiracy)
3. Occurrence of Offence: Day: Friday | Date: 13-02-2026 | Time: 23:45 hrs
4. Type of Information: Written / Scanned Digital Complaint
5. Place of Occurrence: Sub-station 14, Technopark Financial Expressway
6. Complainant / Informant: Federal Auditor General Unit 7, Contact: +91 98401 23456
7. Details of Known / Suspected / Unknown Accused with Full Particulars: Ravi Kiran Sharma (alias The Architect), Age 34, Male.
8. Brief Facts: Sub-station 14 intercept team executed arrest following anomalous encrypted data transmission flags flagged by District Cyber Node. Suspect seized with hardware security authenticators and duplicate treasury vouchers totaling $4.2M in federal securities.
9. Investigating Officer: Inspector Kumar (#POL-IND-004281)`,
      extractedFields: {
        firNumber: 'FIR-2026/0124',
        policeStation: 'Metro Central Division (#POL-MC-09)',
        district: 'Federal Cyber District 04',
        date: '2026-02-14',
        time: '04:12',
        dateOfOccurrence: '2026-02-13',
        timeOfOccurrence: '23:45',
        placeOfOccurrence: 'Sub-station 14, Technopark Financial Expressway',
        complainantName: 'Federal Auditor General Unit 7',
        complainantContact: '+91 98401 23456 / aud-u7@cyber.gov',
        accusedName: 'Ravi Kiran Sharma',
        accusedAge: 34,
        accusedDetails: 'Alias The Architect, Male, Seized with duplicate treasury credentials',
        victimInformation: 'Central Treasury Clearinghouse & State Financial Reserve',
        offences: ['Sec. 420 (Fraud)', 'Sec. 467 (Forgery)', 'Sec. 471 (Counterfeit Security)', 'Sec. 120-B (Conspiracy)'],
        briefFacts: 'Sub-station 14 intercept team executed arrest following anomalous encrypted data transmission flags flagged by District Cyber Node. Suspect seized with hardware security authenticators and duplicate treasury vouchers totaling $4.2M in federal securities.',
        witnesses: ['Sgt. Reynolds (#POL-4182)', 'Inspector Kumar (#POL-IND-004281)', 'Duty Officer N. Rao'],
        investigatingOfficer: 'Inspector Kumar (#POL-IND-004281)',
        documentDate: '2026-02-14',
        documentReferenceNumber: 'FIR/CRIME/2026/0124-MC',
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
          briefFacts: 'HIGH'
        },
        lowConfidenceFields: []
      },
      aiSummary: {
        summary: 'Original First Information Report filed under IPC 420, 467, 471, 120-B for unauthorized exfiltration of treasury vouchers ($4.2M) at Technopark Sub-station 14.',
        mainAllegations: [
          'Interception of high-value treasury data packets',
          'Possession of cloned hardware authenticators',
          'Fabrication of $4.2M counterfeit federal securities'
        ],
        personsMentioned: [
          'Ravi Kiran Sharma (Accused)',
          'Inspector Kumar (Investigating Officer)',
          'Sgt. Reynolds (Arresting Officer)',
          'Duty Officer N. Rao (Witness)'
        ],
        offencesMentioned: [
          'Sec. 420 (Fraud)',
          'Sec. 467 (Forgery)',
          'Sec. 471 (Counterfeit Security)',
          'Sec. 120-B (Criminal Conspiracy)'
        ],
        evidenceReferenced: [
          'Samsung 2TB T7 Shield SSD (EVD-2026-9901)',
          'Fiber micro-traces from ventilation shaft (EVD-2026-9902)',
          'Duplicate treasury payment vouchers'
        ],
        itemsRequiringVerification: [
          'Confirmation of exact timestamp of initial server egress packet'
        ],
        timeline: [
          { time: '2026-02-13 23:45', event: 'Initial anomalous encrypted transmission flagged' },
          { time: '2026-02-14 02:10', event: 'Suspect intercepted at Sub-station 14 perimeter' },
          { time: '2026-02-14 04:12', event: 'Digital FIR registered at Metro Central Division' }
        ]
      },
      provenanceHistory: [
        {
          timestamp: '2026-02-14T04:12:08Z',
          institution: 'POLICE',
          officerId: 'POL-IND-004281',
          officerName: 'Inspector Kumar',
          action: 'FIR Document Uploaded & Preserved',
          details: 'Original PDF file ingested into secure police document vault'
        },
        {
          timestamp: '2026-02-14T04:14:15Z',
          institution: 'POLICE',
          officerId: 'POL-IND-004281',
          officerName: 'Inspector Kumar',
          action: 'OCR & Intelligence Field Extraction Completed',
          details: 'AI parsed 12 structured fields with 0 validation flags'
        },
        {
          timestamp: '2026-02-14T04:15:30Z',
          institution: 'POLICE',
          officerId: 'POL-IND-004281',
          officerName: 'Inspector Kumar',
          action: 'Officer Verified & Confirmed FIR Record',
          details: 'Investigating officer verified all fields against original PDF'
        },
        {
          timestamp: '2026-02-14T04:16:02Z',
          institution: 'POLICE',
          officerId: 'POL-IND-004281',
          officerName: 'Inspector Kumar',
          action: 'Blockchain Recorded on QBFT Block #48192842',
          txHash: '0x82ab719ef10082491a99bcde1920f5a0194821a8c0e11894b9812cc981af8921',
          details: 'SHA-256 cryptographic hash anchored to immutable CaseRegistry contract'
        },
        {
          timestamp: '2026-02-14T11:20:14Z',
          institution: 'FORENSICS',
          officerId: 'FOR-IND-003914',
          officerName: 'Ryan Thorne (CFSL)',
          action: 'Forensic Lab Read Access Granted',
          details: 'FIR verified by Central Forensic Science Lab for physical exhibit alignment'
        },
        {
          timestamp: '2026-02-15T09:30:00Z',
          institution: 'COURT',
          officerId: 'CRT-IND-001872',
          officerName: 'Presiding Judge',
          action: 'Judicial Bench Integrity Attestation',
          details: 'Cryptographic hash verified before trial hearing'
        }
      ]
    };

    this.firStorage.set(firDocId, seededFIR);
    blockchain.registerFIRDocumentOnChain(
      firDocId,
      caseId,
      'POL-IND-004281',
      'POLICE',
      firHash,
      '0xEd25519_POLICE_OFFICER_KUMAR_SIG_04812'
    );

    const rawCase = {
      caseId,
      firDocumentId: firDocId,
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
