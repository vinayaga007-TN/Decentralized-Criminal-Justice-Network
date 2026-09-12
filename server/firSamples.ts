import { FIRExtractedFields, FIRAISummary, FIRDocumentType } from '../src/types';

export interface SampleFIRDefinition {
  id: string;
  name: string;
  category: string;
  documentType: FIRDocumentType;
  fileName: string;
  mimeType: string;
  fileSizeFormatted: string;
  svgDataUrl: string;
  rawOcrText: string;
  extractedFields: FIRExtractedFields;
  aiSummary: FIRAISummary;
}

// 1. Realistic Handwritten FIR SVG Data URL (Ruled complaint paper, cursive/handwritten police script, stamp, signatures)
const handwrittenSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#F9F6EE;font-family:'Courier New', monospace;">
  <!-- Ruled Paper Lines -->
  <defs>
    <pattern id="ruledLines" width="100" height="28" patternUnits="userSpaceOnUse">
      <line x1="0" y1="27" x2="100" y2="27" stroke="#CBD5E1" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="1100" fill="#FCFAF2"/>
  <rect x="60" y="80" width="680" height="960" fill="url(#ruledLines)"/>
  
  <!-- Margin Red Line -->
  <line x1="130" y1="50" x2="130" y2="1060" stroke="#F87171" stroke-width="1.5" stroke-dasharray="4,2"/>
  
  <!-- Official Header / Seal -->
  <circle cx="400" cy="90" r="32" fill="none" stroke="#1E3A8A" stroke-width="2"/>
  <circle cx="400" cy="90" r="28" fill="none" stroke="#1E3A8A" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="400" y="88" text-anchor="middle" font-size="7" font-weight="bold" fill="#1E3A8A" font-family="Arial">METROPOLITAN POLICE DEPT</text>
  <text x="400" y="98" text-anchor="middle" font-size="6" fill="#1E3A8A" font-family="Arial">CYBER & ECONOMIC WING</text>
  
  <!-- Title -->
  <text x="400" y="145" text-anchor="middle" font-size="16" font-weight="bold" fill="#0F172A" text-decoration="underline">HANDWRITTEN FIRST INFORMATION REPORT (CR.P.C. 154)</text>
  <text x="400" y="165" text-anchor="middle" font-size="11" font-style="italic" fill="#475569">(Recorded by Duty Officer in Station General Diary #GD-412)</text>

  <!-- Rubber Stamp on Left -->
  <g transform="translate(80, 110) rotate(-8)">
    <rect width="110" height="42" fill="none" stroke="#991B1B" stroke-width="2" rx="4"/>
    <text x="55" y="16" text-anchor="middle" font-size="9" font-weight="bold" fill="#991B1B">RECEIVED</text>
    <text x="55" y="27" text-anchor="middle" font-size="8" fill="#991B1B">14 FEB 2026 04:12</text>
    <text x="55" y="37" text-anchor="middle" font-size="7" fill="#991B1B">METRO CENTRAL PS</text>
  </g>

  <!-- Handwritten Style Body Text (Simulated cursive handwriting with varying angles) -->
  <g fill="#1E293B" font-family="'Brush Script MT', 'Comic Sans MS', cursive, sans-serif" font-size="15" letter-spacing="0.5">
    <text x="145" y="215">FIR No: 2026 / 0491-CRIME</text>
    <text x="460" y="215">Date: 14th February 2026</text>
    
    <text x="145" y="243">Police Station: Metro Central Division (#POL-MC-09)</text>
    <text x="510" y="243">District: Metro Federal 04</text>
    
    <text x="145" y="299">To, The Station House Officer (SHO),</text>
    <text x="145" y="327">Sub: Complaint of Unauthorized Core Server Infiltration and Duplicate Treasury Bonds.</text>
    
    <text x="145" y="383">Respected Sir,</text>
    <text x="145" y="411">I, Dr. Meenakshi Sundaram, Deputy Controller, Federal Auditor General Unit 7</text>
    <text x="145" y="439">(Contact: +91 98401 23456), wish to report that on 13-02-2026 at approx 23:45 hrs,</text>
    <text x="145" y="467">our continuous automated packet monitors flagged an unauthorized exfiltration sequence</text>
    <text x="145" y="495">originating from Sub-station 14, Technopark Financial Expressway.</text>
    
    <text x="145" y="551">The suspect Ravi Kiran Sharma (alias 'The Architect', age approx 34 yrs)</text>
    <text x="145" y="579">was caught at the egress perimeter server locker possessing 2TB Samsung SSD</text>
    <text x="145" y="607">containing duplicate treasury clearance vouchers amounting to $4.2 Million.</text>
    <text x="145" y="635">Suspect was accompanied by two unidentified drivers waiting in black sedan.</text>
    
    <text x="145" y="691">Sections Violated: IPC Sec 420 (Fraud), Sec 467 (Forgery of Securities),</text>
    <text x="145" y="719">Sec 471 (Using Counterfeit Docs), and Sec 120-B (Criminal Conspiracy).</text>
    
    <text x="145" y="775">Seized Exhibits: 1x SSD (T7 Shield), 1x Cloned Hardware Keyring,</text>
    <text x="145" y="803">and ventilation shaft synthetic fiber traces.</text>
    
    <text x="145" y="859">Witnesses: Sgt. Reynolds (#POL-4182), Duty Officer N. Rao, and Guard K. Raman.</text>
    <text x="145" y="887">Please take strict legal action under criminal laws immediately.</text>
  </g>

  <!-- Handwritten Signatures -->
  <g font-family="'Brush Script MT', cursive" font-size="20" fill="#0F172A">
    <text x="145" y="970">M. Sundaram</text>
    <text x="145" y="988" font-family="Arial" font-size="9" fill="#475569">(Complainant Signature)</text>

    <text x="520" y="970">Insp. Kumar #4281</text>
    <text x="520" y="988" font-family="Arial" font-size="9" fill="#475569">Investigating Officer (IO) Signature & Seal</text>
  </g>

  <!-- Footer Verification watermark -->
  <text x="400" y="1035" text-anchor="middle" font-family="'Courier New', monospace" font-size="9" fill="#94A3B8">ORIGINAL DOCUMENT PRESERVED — SOVEREIGN CRYPTOGRAPHIC RECORD — DCJMN</text>
</svg>
`)}`;

// 2. Realistic Scanned Official FIR Form PDF/SVG (Structured tabular police form, national emblem, bilingual, barcode)
const scannedPdfSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#FFFFFF;font-family:Arial, sans-serif;">
  <rect width="800" height="1100" fill="#FFFFFF"/>
  <rect x="30" y="30" width="740" height="1040" fill="none" stroke="#0F172A" stroke-width="2"/>
  <rect x="34" y="34" width="732" height="1032" fill="none" stroke="#0F172A" stroke-width="0.5"/>

  <!-- Barcode on Top Right -->
  <g transform="translate(560, 45)">
    <rect width="180" height="35" fill="#FFFFFF"/>
    <line x1="10" y1="5" x2="10" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="15" y1="5" x2="15" y2="30" stroke="#000" stroke-width="3"/>
    <line x1="22" y1="5" x2="22" y2="30" stroke="#000" stroke-width="1"/>
    <line x1="26" y1="5" x2="26" y2="30" stroke="#000" stroke-width="4"/>
    <line x1="34" y1="5" x2="34" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="40" y1="5" x2="40" y2="30" stroke="#000" stroke-width="1"/>
    <line x1="45" y1="5" x2="45" y2="30" stroke="#000" stroke-width="3"/>
    <line x1="52" y1="5" x2="52" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="60" y1="5" x2="60" y2="30" stroke="#000" stroke-width="4"/>
    <line x1="70" y1="5" x2="70" y2="30" stroke="#000" stroke-width="1"/>
    <line x1="80" y1="5" x2="80" y2="30" stroke="#000" stroke-width="3"/>
    <line x1="90" y1="5" x2="90" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="105" y1="5" x2="105" y2="30" stroke="#000" stroke-width="4"/>
    <line x1="120" y1="5" x2="120" y2="30" stroke="#000" stroke-width="2"/>
    <line x1="135" y1="5" x2="135" y2="30" stroke="#000" stroke-width="3"/>
    <line x1="150" y1="5" x2="150" y2="30" stroke="#000" stroke-width="2"/>
    <text x="80" y="42" font-size="8" font-family="'Courier New'" text-anchor="middle">FIR-2026-00481-OFFICIAL</text>
  </g>

  <!-- Police Header -->
  <text x="400" y="65" text-anchor="middle" font-size="16" font-weight="bold" fill="#0F172A">NATIONAL POLICE SERVICE / FORM NO. II (FIR)</text>
  <text x="400" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#1E293B">FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)</text>
  <text x="400" y="102" text-anchor="middle" font-size="9" fill="#64748B">STATE CRIME RECORDS BUREAU • INTEGRATED SOVEREIGN CRIMINAL JUSTICE NETWORK</text>

  <!-- Metadata Table -->
  <g transform="translate(45, 120)">
    <!-- Header row -->
    <rect width="710" height="50" fill="#F1F5F9" stroke="#334155" stroke-width="1"/>
    <line x1="180" y1="0" x2="180" y2="50" stroke="#334155"/>
    <line x1="360" y1="0" x2="360" y2="50" stroke="#334155"/>
    <line x1="540" y1="0" x2="540" y2="50" stroke="#334155"/>
    
    <text x="10" y="20" font-size="9" font-weight="bold" fill="#475569">1. DISTRICT</text>
    <text x="10" y="38" font-size="11" font-weight="bold" fill="#0F172A">North-West Metro (04)</text>
    
    <text x="190" y="20" font-size="9" font-weight="bold" fill="#475569">POLICE STATION</text>
    <text x="190" y="38" font-size="11" font-weight="bold" fill="#0F172A">Special Operations Unit</text>
    
    <text x="370" y="20" font-size="9" font-weight="bold" fill="#475569">YEAR / FIR NO.</text>
    <text x="370" y="38" font-size="11" font-weight="bold" fill="#0F172A">2026 / FIR-00481</text>
    
    <text x="550" y="20" font-size="9" font-weight="bold" fill="#475569">DATE &amp; TIME OF FIR</text>
    <text x="550" y="38" font-size="11" font-weight="bold" fill="#0F172A">12-09-2026 08:30 IST</text>
  </g>

  <!-- Acts & Sections Box -->
  <g transform="translate(45, 185)">
    <rect width="710" height="55" fill="#FFFFFF" stroke="#334155" stroke-width="1"/>
    <text x="10" y="20" font-size="9" font-weight="bold" fill="#475569">2. ACTS &amp; SECTIONS CHARGED:</text>
    <text x="10" y="40" font-size="11" font-weight="bold" fill="#0F172A">IPC Sec 379 (Theft), Sec 454 (Lurking House-trespass), Sec 411 (Dishonestly Receiving Stolen Property)</text>
  </g>

  <!-- Occurrence of Offence -->
  <g transform="translate(45, 255)">
    <rect width="710" height="60" fill="#FFFFFF" stroke="#334155" stroke-width="1"/>
    <line x1="355" y1="0" x2="355" y2="60" stroke="#334155"/>
    <text x="10" y="20" font-size="9" font-weight="bold" fill="#475569">3. OCCURRENCE OF OFFENCE:</text>
    <text x="10" y="40" font-size="11" fill="#0F172A">Date: 11-09-2026 | Time: 21:15 to 22:30 hrs</text>
    <text x="365" y="20" font-size="9" font-weight="bold" fill="#475569">4. PLACE OF OCCURRENCE:</text>
    <text x="365" y="40" font-size="11" fill="#0F172A">Server Vault Block C, High-Tech Industrial Zone, Gate 4</text>
  </g>

  <!-- Complainant & Accused -->
  <g transform="translate(45, 330)">
    <rect width="710" height="90" fill="#FFFFFF" stroke="#334155" stroke-width="1"/>
    <line x1="355" y1="0" x2="355" y2="90" stroke="#334155"/>
    
    <text x="10" y="20" font-size="9" font-weight="bold" fill="#475569">5. COMPLAINANT / INFORMANT DETAILS:</text>
    <text x="10" y="40" font-size="11" font-weight="bold" fill="#0F172A">Chief Security Marshal Anita Sen</text>
    <text x="10" y="58" font-size="10" fill="#334155">Industrial Infrastructure Protection Bureau</text>
    <text x="10" y="75" font-size="10" fill="#334155">Contact: +91 94440 98122 / anita.sen@iipb.gov.in</text>
    
    <text x="365" y="20" font-size="9" font-weight="bold" fill="#475569">6. ACCUSED / SUSPECT PARTICULARS:</text>
    <text x="365" y="40" font-size="11" font-weight="bold" fill="#0F172A">Vikram Malhotra (alias 'Ghost Operator')</text>
    <text x="365" y="58" font-size="10" fill="#334155">Age: 29 | Gender: Male | Physical markings: Scar on left forearm</text>
    <text x="365" y="75" font-size="10" fill="#334155">Arrested on scene with intercepted optical repeater unit.</text>
  </g>

  <!-- Brief Facts of Case -->
  <g transform="translate(45, 435)">
    <rect width="710" height="340" fill="#FFFFFF" stroke="#334155" stroke-width="1"/>
    <text x="10" y="22" font-size="10" font-weight="bold" fill="#475569">7. BRIEF FACTS OF THE CASE (BRIEF NARRATION):</text>
    <text x="10" y="48" font-size="11" fill="#0F172A" font-family="'Courier New'">On 11-09-2026 at approximately 21:15 hours, night shift perimeter sensors in</text>
    <text x="10" y="68" font-size="11" fill="#0F172A" font-family="'Courier New'">Server Vault Block C recorded unauthorized magnetic door bypass alarms.</text>
    <text x="10" y="88" font-size="11" fill="#0F172A" font-family="'Courier New'">Emergency rapid patrol unit arrived within 4 minutes and apprehended the suspect</text>
    <text x="10" y="108" font-size="11" fill="#0F172A" font-family="'Courier New'">Vikram Malhotra inside the clean room terminal room.</text>
    <text x="10" y="138" font-size="11" fill="#0F172A" font-family="'Courier New'">Physical seizures executed on spot under panchnama:</text>
    <text x="10" y="158" font-size="11" fill="#0F172A" font-family="'Courier New'">1. One (1) specialized laser fiber optic wiretap tap head with USB-C adapter.</text>
    <text x="10" y="178" font-size="11" fill="#0F172A" font-family="'Courier New'">2. Encrypted SanDisk Extreme 1TB SSD containing illicit network captures.</text>
    <text x="10" y="198" font-size="11" fill="#0F172A" font-family="'Courier New'">3. Black synthetic tactical gloves matching glass casing smudges.</text>
    <text x="10" y="228" font-size="11" fill="#0F172A" font-family="'Courier New'">Suspect offered resistance but was restrained without weapons discharge.</text>
    <text x="10" y="248" font-size="11" fill="#0F172A" font-family="'Courier New'">All seized exhibits bagged and sealed with police wax seal #POL-SEAL-889.</text>
    <text x="10" y="278" font-size="11" fill="#0F172A" font-family="'Courier New'">Witnesses: Guard Officer D. Sharma (#582), Technician M. Farooq.</text>
    <text x="10" y="298" font-size="11" fill="#0F172A" font-family="'Courier New'">Investigating Officer assigned: Sub-Inspector Sarah Jenkins (#POL-IND-005129).</text>
  </g>

  <!-- Official Signatures & Seal -->
  <g transform="translate(45, 790)">
    <rect width="710" height="130" fill="#F8FAFC" stroke="#334155" stroke-width="1"/>
    
    <circle cx="100" cy="65" r="45" fill="none" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="4,2"/>
    <text x="100" y="60" text-anchor="middle" font-size="8" font-weight="bold" fill="#2563EB">OFFICIAL POLICE</text>
    <text x="100" y="72" text-anchor="middle" font-size="8" font-weight="bold" fill="#2563EB">SEAL #09</text>
    
    <text x="320" y="55" font-family="'Brush Script MT', cursive" font-size="22" fill="#0F172A">Anita Sen</text>
    <text x="320" y="80" font-size="9" fill="#475569">Complainant Signature &amp; Date</text>
    
    <text x="560" y="55" font-family="'Brush Script MT', cursive" font-size="22" fill="#0F172A">Sarah Jenkins, SI</text>
    <text x="560" y="80" font-size="9" fill="#475569">Duty Officer / Investigating Officer</text>
    <text x="560" y="95" font-size="9" fill="#64748B">PIN: #POL-IND-005129</text>
  </g>

  <!-- Footer Verification -->
  <g transform="translate(45, 935)">
    <rect width="710" height="50" fill="#0F172A" rx="4"/>
    <text x="355" y="22" text-anchor="middle" font-size="10" font-weight="bold" fill="#38BDF8">DCJMN IMMUTABLE DOCUMENT VAULT • CRYPTOGRAPHIC INTEGRITY ANCHOR</text>
    <text x="355" y="38" text-anchor="middle" font-size="8" font-family="'Courier New'" fill="#94A3B8">ORIGINAL FILE SHA-256 HASH VERIFIED • QBFT PERMISSIONED CONSENSUS VALIDATED</text>
  </g>
</svg>
`)}`;

// 3. Realistic Digital FIR Filing (Clean modern digital police complaint with official registration credentials)
const digitalPdfSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#0F172A;font-family:Arial, sans-serif;">
  <rect width="800" height="1100" fill="#090D16"/>
  <rect x="30" y="30" width="740" height="1040" fill="#0D1322" stroke="#1E293B" stroke-width="2" rx="8"/>

  <!-- Top Blue Accent Bar -->
  <rect x="30" y="30" width="740" height="10" fill="#3B82F6" rx="4"/>

  <!-- Digital Watermark -->
  <text x="400" y="100" text-anchor="middle" font-size="18" font-weight="bold" fill="#38BDF8" letter-spacing="2">GOVERNMENT DIGITAL CRIME PORTAL</text>
  <text x="400" y="125" text-anchor="middle" font-size="13" font-weight="bold" fill="#F1F5F9">ELECTRONIC FIRST INFORMATION REPORT (e-FIR)</text>
  <text x="400" y="145" text-anchor="middle" font-size="10" font-family="'Courier New'" fill="#94A3B8">SYSTEM-CERTIFIED IMMUTABLE LEGAL INSTRUMENT</text>

  <!-- Certificate Box -->
  <g transform="translate(60, 175)">
    <rect width="680" height="65" fill="#1E293B" stroke="#3B82F6" stroke-width="1" rx="6"/>
    <text x="20" y="25" font-size="10" font-weight="bold" fill="#60A5FA">e-FIR TRACKING ID: eFIR-2026-9042-FED</text>
    <text x="20" y="45" font-size="9" font-family="'Courier New'" fill="#CBD5E1">DIGITAL SIGNATURE: 0x9B812FA4...COMMITTED BY METRO DIVISION ENCLAVE</text>
    <text x="500" y="25" font-size="10" font-weight="bold" fill="#10B981">STATUS: OFFICIALLY DOCKETED</text>
    <text x="500" y="45" font-size="9" fill="#94A3B8">15-SEP-2026 11:20 UTC</text>
  </g>

  <!-- Structured Fields Grid -->
  <g transform="translate(60, 260)" fill="#CBD5E1" font-size="11">
    <rect width="680" height="280" fill="#131B2E" stroke="#1E293B" rx="6"/>
    
    <text x="20" y="30" font-weight="bold" fill="#64748B" font-size="9">INCIDENT CLASSIFICATION</text>
    <text x="20" y="50" font-weight="bold" fill="#F8FAFC" font-size="13">State vs. Offshore Cyber Laundering Ring</text>
    
    <text x="20" y="90" font-weight="bold" fill="#64748B" font-size="9">POLICE STATION &amp; JURISDICTION</text>
    <text x="20" y="110" fill="#F8FAFC">Central Cyber Crime Investigation Cell (Unit #07)</text>
    
    <text x="360" y="90" font-weight="bold" fill="#64748B" font-size="9">DATE &amp; TIME OF OCCURRENCE</text>
    <text x="360" y="110" fill="#F8FAFC">14-Sep-2026 18:40 to 19:15 UTC</text>
    
    <text x="20" y="150" font-weight="bold" fill="#64748B" font-size="9">COMPLAINANT / INSTITUTION</text>
    <text x="20" y="170" fill="#F8FAFC">National Financial Intelligence Unit (FIU-IND)</text>
    <text x="20" y="190" font-size="10" fill="#94A3B8">Officer: Director General K. V. Ramanathan</text>
    
    <text x="360" y="150" font-weight="bold" fill="#64748B" font-size="9">ACCUSED IDENTIFIED</text>
    <text x="360" y="170" fill="#F8FAFC">Tanya Deshmukh (Age 32, Female)</text>
    <text x="360" y="190" font-size="10" fill="#94A3B8">Role: Lead Treasury Node Operator (Bail Suspended)</text>

    <text x="20" y="230" font-weight="bold" fill="#64748B" font-size="9">OFFENCES CHARGED</text>
    <text x="20" y="250" fill="#F59E0B">PMLA Sec 3 (Money Laundering), IT Act Sec 66F (Cyber Terrorism), IPC Sec 420 (Fraud)</text>
  </g>

  <!-- Narrative Summary -->
  <g transform="translate(60, 560)">
    <rect width="680" height="340" fill="#131B2E" stroke="#1E293B" rx="6"/>
    <text x="20" y="30" font-size="10" font-weight="bold" fill="#38BDF8">STATEMENT OF FACTUAL COMPLAINT:</text>
    <text x="20" y="60" font-size="12" fill="#E2E8F0" font-family="'Courier New'">Automated liquidity anomaly detectors at the Central Reserve Clearinghouse</text>
    <text x="20" y="85" font-size="12" fill="#E2E8F0" font-family="'Courier New'">intercepted an unauthorized batch diversion of $8.7 Million in federal liquidity.</text>
    <text x="20" y="110" font-size="12" fill="#E2E8F0" font-family="'Courier New'">The transactions were digitally signed using compromised credentials tied to</text>
    <text x="20" y="135" font-size="12" fill="#E2E8F0" font-family="'Courier New'">terminal ID #TR-NODE-4081 located at Global Trade Tower, 18th Floor.</text>
    <text x="20" y="170" font-size="12" fill="#E2E8F0" font-family="'Courier New'">SEIZED MATERIAL EXHIBITS:</text>
    <text x="20" y="195" font-size="12" fill="#E2E8F0" font-family="'Courier New'">- 1x Encrypted MacBook Pro M3 with cold hardware security enclave</text>
    <text x="20" y="220" font-size="12" fill="#E2E8F0" font-family="'Courier New'">- 2x Ledger Nano X hardware wallets with routing seed phrases</text>
    <text x="20" y="245" font-size="12" fill="#E2E8F0" font-family="'Courier New'">- Intercepted encrypted telegram logs between accused and foreign handlers</text>
    <text x="20" y="280" font-size="12" fill="#E2E8F0" font-family="'Courier New'">PRIMARY WITNESSES: Chief Risk Officer A. K. Varma, Network Lead P. Roy.</text>
    <text x="20" y="305" font-size="12" fill="#E2E8F0" font-family="'Courier New'">INVESTIGATING OFFICER: Deputy Commissioner Marcus Vance (#POL-IND-004281).</text>
  </g>

  <!-- Bottom Stamp & Hash -->
  <g transform="translate(60, 920)">
    <rect width="680" height="90" fill="#0A0F1D" stroke="#1E293B" rx="6"/>
    <text x="20" y="30" font-size="10" font-weight="bold" fill="#10B981">✓ VERIFIED BY DCJMN DECENTRALIZED IDENTITY REGISTRY</text>
    <text x="20" y="50" font-size="9" font-family="'Courier New'" fill="#94A3B8">ORIGINAL FILE PRESERVED IMMUTABLY • SHA-256 CANONICAL LEAF CALCULATED</text>
    <text x="20" y="70" font-size="9" font-family="'Courier New'" fill="#64748B">BLOCKCHAIN CONSENSUS: QBFT PROTOCOL • 4 OF 4 VALIDATORS SIGNED</text>
  </g>
</svg>
`)}`;

export const SAMPLE_FIR_DOCUMENTS: SampleFIRDefinition[] = [
  {
    id: 'sample-handwritten-fir',
    name: 'Sample Handwritten FIR (Cyber Breach & Seizure)',
    category: 'Handwritten Document',
    documentType: 'IMAGE_HANDWRITTEN',
    fileName: 'handwritten-fir-complaint-cyber-seizure.jpg',
    mimeType: 'image/jpeg',
    fileSizeFormatted: '482 KB',
    svgDataUrl: handwrittenSvg,
    rawOcrText: `HANDWRITTEN FIRST INFORMATION REPORT (CR.P.C. 154)
Station General Diary #GD-412
FIR No: 2026 / 0491-CRIME | Date: 14th February 2026
Police Station: Metro Central Division (#POL-MC-09) | District: Metro Federal 04
To, The Station House Officer (SHO),
Sub: Complaint of Unauthorized Core Server Infiltration and Duplicate Treasury Bonds.
Respected Sir,
I, Dr. Meenakshi Sundaram, Deputy Controller, Federal Auditor General Unit 7 (Contact: +91 98401 23456), wish to report that on 13-02-2026 at approx 23:45 hrs, our continuous automated packet monitors flagged an unauthorized exfiltration sequence originating from Sub-station 14, Technopark Financial Expressway.
The suspect Ravi Kiran Sharma (alias 'The Architect', age approx 34 yrs) was caught at the egress perimeter server locker possessing 2TB Samsung SSD containing duplicate treasury clearance vouchers amounting to $4.2 Million. Suspect was accompanied by two unidentified drivers waiting in black sedan.
Sections Violated: IPC Sec 420 (Fraud), Sec 467 (Forgery of Securities), Sec 471 (Using Counterfeit Docs), and Sec 120-B (Criminal Conspiracy).
Seized Exhibits: 1x SSD (T7 Shield), 1x Cloned Hardware Keyring, and ventilation shaft synthetic fiber traces.
Witnesses: Sgt. Reynolds (#POL-4182), Duty Officer N. Rao, and Guard K. Raman.
Please take strict legal action under criminal laws immediately.
Signatures: Dr. M. Sundaram (Complainant), Insp. Kumar (#POL-IND-004281 - IO)`,
    extractedFields: {
      firNumber: 'FIR-2026/0491',
      policeStation: 'Metro Central Division (#POL-MC-09)',
      district: 'Metro Federal 04',
      date: '2026-02-14',
      time: '04:12',
      dateOfOccurrence: '2026-02-13',
      timeOfOccurrence: '23:45',
      placeOfOccurrence: 'Sub-station 14, Technopark Financial Expressway',
      complainantName: 'Dr. Meenakshi Sundaram',
      complainantContact: '+91 98401 23456 / aud-u7@cyber.gov',
      accusedName: 'Ravi Kiran Sharma',
      accusedAge: 34,
      accusedDetails: "Alias 'The Architect', Age 34, caught with unauthorized hardware authenticators",
      victimInformation: 'Federal Auditor General Unit 7 & Central Treasury Reserve',
      offences: [
        'Sec. 420 (Fraud)',
        'Sec. 467 (Forgery of Securities)',
        'Sec. 471 (Using Counterfeit Docs)',
        'Sec. 120-B (Conspiracy)'
      ],
      briefFacts: 'Automated packet monitors flagged unauthorized exfiltration sequence from Sub-station 14. Suspect was intercepted with 2TB Samsung SSD containing $4.2M in forged treasury clearance vouchers.',
      witnesses: [
        'Sgt. Reynolds (#POL-4182)',
        'Duty Officer N. Rao',
        'Guard K. Raman'
      ],
      investigatingOfficer: 'Inspector Kumar (#POL-IND-004281)',
      documentDate: '2026-02-14',
      documentReferenceNumber: 'GD-412/METRO-2026',
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
    },
    aiSummary: {
      summary: 'Handwritten police complaint formally filed under IPC 420, 467, 471, 120-B reporting unauthorized server room intrusion and exfiltration of $4.2M treasury certificates.',
      mainAllegations: [
        'Physical breach of Sub-station 14 egress server lockers',
        'Cloning and possession of unauthorized hardware security keys',
        'Attempted exfiltration of $4.2M duplicate treasury clearinghouse vouchers'
      ],
      personsMentioned: [
        'Dr. Meenakshi Sundaram (Complainant / Deputy Controller)',
        'Ravi Kiran Sharma (Accused, alias The Architect)',
        'Two unidentified sedan drivers (Accomplices / Under inquiry)',
        'Inspector Kumar (Investigating Officer)',
        'Sgt. Reynolds (Arresting Officer)'
      ],
      offencesMentioned: [
        'Sec. 420 (Fraud)',
        'Sec. 467 (Forgery of valuable security)',
        'Sec. 471 (Using forged document as genuine)',
        'Sec. 120-B (Criminal conspiracy)'
      ],
      evidenceReferenced: [
        'Samsung 2TB T7 Shield SSD with decrypted partition records',
        'Cloned hardware multi-factor authenticator keyring',
        'Synthetic fiber micro-traces from ventilation shaft'
      ],
      itemsRequiringVerification: [
        'Identity and license plate of the black getaway sedan drivers'
      ],
      timeline: [
        { time: '2026-02-13 23:45', event: 'Continuous packet monitoring alarms triggered' },
        { time: '2026-02-14 02:10', event: 'Patrol intercepts accused at server locker perimeter' },
        { time: '2026-02-14 04:12', event: 'Handwritten FIR docketed at Metro Central Station' }
      ]
    }
  },
  {
    id: 'sample-scanned-pdf',
    name: 'Sample Scanned Official FIR PDF (Vault Perimeter Breach)',
    category: 'Scanned Official PDF',
    documentType: 'IMAGE_SCANNED',
    fileName: 'scanned-fir-official-vault-breach.pdf',
    mimeType: 'application/pdf',
    fileSizeFormatted: '1.2 MB',
    svgDataUrl: scannedPdfSvg,
    rawOcrText: `NATIONAL POLICE SERVICE / FORM NO. II (FIR)
FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)
Barcode: FIR-2026-00481-OFFICIAL
1. District: North-West Metro (04) | Police Station: Special Operations Unit
Year / FIR No: 2026 / FIR-00481 | Date & Time of FIR: 12-09-2026 08:30 IST
2. Acts & Sections Charged: IPC Sec 379 (Theft), Sec 454 (Lurking House-trespass), Sec 411 (Dishonestly Receiving Stolen Property)
3. Occurrence of Offence: Date: 11-09-2026 | Time: 21:15 to 22:30 hrs
4. Place of Occurrence: Server Vault Block C, High-Tech Industrial Zone, Gate 4
5. Complainant: Chief Security Marshal Anita Sen, Industrial Infrastructure Protection Bureau (+91 94440 98122)
6. Accused: Vikram Malhotra (alias 'Ghost Operator'), Age 29, Male. Arrested on scene with optical repeater tap.
7. Brief Facts: Night shift perimeter sensors recorded unauthorized magnetic door bypass. Patrol apprehended Vikram Malhotra in clean room terminal. Seized 1x optical fiber wiretap head, 1x SanDisk 1TB SSD, tactical gloves.
Witnesses: Guard Officer D. Sharma (#582), Technician M. Farooq.
Investigating Officer: Sub-Inspector Sarah Jenkins (#POL-IND-005129)`,
    extractedFields: {
      firNumber: 'FIR-2026/0481',
      policeStation: 'Special Operations Unit',
      district: 'North-West Metro (04)',
      date: '2026-09-12',
      time: '08:30',
      dateOfOccurrence: '2026-09-11',
      timeOfOccurrence: '21:15',
      placeOfOccurrence: 'Server Vault Block C, High-Tech Industrial Zone, Gate 4',
      complainantName: 'Chief Security Marshal Anita Sen',
      complainantContact: '+91 94440 98122 / anita.sen@iipb.gov.in',
      accusedName: 'Vikram Malhotra',
      accusedAge: 29,
      accusedDetails: "Alias 'Ghost Operator', Male, Age 29, scar on left forearm, caught in server vault",
      victimInformation: 'High-Tech Industrial Zone Server Vault Infrastructure',
      offences: [
        'Sec. 379 (Theft)',
        'Sec. 454 (Lurking House-trespass)',
        'Sec. 411 (Receiving Stolen Property)'
      ],
      briefFacts: 'Night shift perimeter sensors recorded unauthorized magnetic door bypass. Patrol arrived within 4 minutes and apprehended suspect Vikram Malhotra in clean room terminal with fiber wiretap head and 1TB SSD.',
      witnesses: [
        'Guard Officer D. Sharma (#582)',
        'Technician M. Farooq'
      ],
      investigatingOfficer: 'Sub-Inspector Sarah Jenkins (#POL-IND-005129)',
      documentDate: '2026-09-12',
      documentReferenceNumber: 'FIR-2026-00481-OFFICIAL',
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
    },
    aiSummary: {
      summary: 'Scanned official FIR form recording the arrest of Vikram Malhotra inside Server Vault Block C with optical wiretap interception hardware.',
      mainAllegations: [
        'Unauthorized trespass into High-Tech Industrial Zone server vault',
        'Physical installation of laser fiber optic wiretap tap',
        'Exfiltration of unencrypted network telemetry packets'
      ],
      personsMentioned: [
        'Chief Security Marshal Anita Sen (Complainant)',
        'Vikram Malhotra (Accused, alias Ghost Operator)',
        'Sub-Inspector Sarah Jenkins (Investigating Officer)',
        'Guard Officer D. Sharma (Witness)',
        'Technician M. Farooq (Witness)'
      ],
      offencesMentioned: [
        'Sec. 379 (Theft)',
        'Sec. 454 (Lurking house-trespass by night)',
        'Sec. 411 (Dishonestly receiving stolen property)'
      ],
      evidenceReferenced: [
        'Laser fiber optic wiretap tap head with USB-C adapter',
        'SanDisk Extreme 1TB SSD with packet captures',
        'Synthetic tactical gloves with glass smudge residue'
      ],
      itemsRequiringVerification: [
        'Confirmation of whether optical tap successfully deciphered TLS sessions'
      ],
      timeline: [
        { time: '2026-09-11 21:15', event: 'Perimeter magnetic door bypass alarm triggered' },
        { time: '2026-09-11 21:19', event: 'Emergency patrol apprehends suspect in clean room' },
        { time: '2026-09-12 08:30', event: 'Formal FIR filed at Special Operations Unit' }
      ]
    }
  },
  {
    id: 'sample-digital-fir',
    name: 'Sample Digital e-FIR (Securities Fraud & Laundering)',
    category: 'Digital e-FIR',
    documentType: 'PDF',
    fileName: 'digital-efir-treasury-laundering.pdf',
    mimeType: 'application/pdf',
    fileSizeFormatted: '640 KB',
    svgDataUrl: digitalPdfSvg,
    rawOcrText: `GOVERNMENT DIGITAL CRIME PORTAL - ELECTRONIC FIRST INFORMATION REPORT (e-FIR)
e-FIR TRACKING ID: eFIR-2026-9042-FED | DOCKETED: 15-SEP-2026 11:20 UTC
Incident: State vs. Offshore Cyber Laundering Ring
Police Station: Central Cyber Crime Investigation Cell (Unit #07) | District: Federal District 04
Occurrence Date & Time: 14-Sep-2026 18:40 to 19:15 UTC
Complainant: National Financial Intelligence Unit (FIU-IND) - DG K. V. Ramanathan
Accused: Tanya Deshmukh, Age 32, Female, Lead Treasury Node Operator
Offences Charged: PMLA Sec 3 (Money Laundering), IT Act Sec 66F (Cyber Terrorism), IPC Sec 420 (Fraud)
Narrative Statement: Automated liquidity anomaly detectors at Central Reserve Clearinghouse intercepted an unauthorized batch diversion of $8.7 Million in federal liquidity. The transactions were digitally signed using compromised credentials tied to terminal ID #TR-NODE-4081 at Global Trade Tower.
Seized Material: 1x MacBook Pro M3 with cold hardware security enclave, 2x Ledger Nano X hardware wallets, encrypted communication records.
Witnesses: Chief Risk Officer A. K. Varma, Network Lead P. Roy.
Investigating Officer: Deputy Commissioner Marcus Vance (#POL-IND-004281).`,
    extractedFields: {
      firNumber: 'eFIR-2026/9042',
      policeStation: 'Central Cyber Crime Investigation Cell (Unit #07)',
      district: 'Federal District 04',
      date: '2026-09-15',
      time: '11:20',
      dateOfOccurrence: '2026-09-14',
      timeOfOccurrence: '18:40',
      placeOfOccurrence: 'Terminal ID #TR-NODE-4081, Global Trade Tower, 18th Floor',
      complainantName: 'Director General K. V. Ramanathan (FIU-IND)',
      complainantContact: '+91 98110 54321 / dg-fiu@fiu.gov.in',
      accusedName: 'Tanya Deshmukh',
      accusedAge: 32,
      accusedDetails: 'Female, Age 32, Lead Treasury Node Operator, seized with cryptographic hardware keys',
      victimInformation: 'National Financial Reserve & Central Reserve Clearinghouse',
      offences: [
        'PMLA Sec. 3 (Money Laundering)',
        'IT Act Sec. 66F (Cyber Terrorism)',
        'IPC Sec. 420 (Fraud)'
      ],
      briefFacts: 'Automated liquidity detectors intercepted an unauthorized batch diversion of $8.7 Million in federal liquidity via compromised clearinghouse credentials. Hardware authenticators and cold wallets seized on spot.',
      witnesses: [
        'Chief Risk Officer A. K. Varma',
        'Network Lead P. Roy'
      ],
      investigatingOfficer: 'Deputy Commissioner Marcus Vance (#POL-IND-004281)',
      documentDate: '2026-09-15',
      documentReferenceNumber: 'eFIR-2026-9042-FED',
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
    },
    aiSummary: {
      summary: 'Electronic FIR registered by the Financial Intelligence Unit for $8.7M automated liquidity diversion executed through high-privilege clearinghouse terminals.',
      mainAllegations: [
        'Batch unauthorized transfer of $8.7M central liquidity',
        'Use of compromised high-privilege institutional terminal credentials',
        'Cryptographic dispersal into unhosted cold wallets'
      ],
      personsMentioned: [
        'Director General K. V. Ramanathan (Complainant, FIU-IND)',
        'Tanya Deshmukh (Accused)',
        'Deputy Commissioner Marcus Vance (Investigating Officer)',
        'Chief Risk Officer A. K. Varma (Witness)',
        'Network Lead P. Roy (Witness)'
      ],
      offencesMentioned: [
        'PMLA Sec. 3 (Money Laundering)',
        'IT Act Sec. 66F (Cyber Terrorism)',
        'IPC Sec. 420 (Cheating and Dishonestly Inducing Delivery of Property)'
      ],
      evidenceReferenced: [
        'MacBook Pro M3 workstation with forensic session dump',
        'Two Ledger Nano X hardware cold storage devices',
        'Telegram coordination channels and routing table dumps'
      ],
      itemsRequiringVerification: [
        'Trace of destination wallet addresses through overseas mixing relays'
      ],
      timeline: [
        { time: '2026-09-14 18:40', event: 'Unauthorized high-value batch routing detected' },
        { time: '2026-09-14 19:15', event: 'Suspect terminal suspended and workstation seized' },
        { time: '2026-09-15 11:20', event: 'Certified e-FIR docketed on sovereign justice gateway' }
      ]
    }
  }
];
