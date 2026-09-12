import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationTarget } from './components/layout/Sidebar';
import { TopBar, PortalType } from './components/layout/TopBar';
import { DashboardView } from './components/views/DashboardView';
import { CasesListView } from './components/views/CasesListView';
import { CaseDetailView } from './components/views/CaseDetailView';
import { EvidenceListView } from './components/views/EvidenceListView';
import { DepartmentWorkflowView } from './components/views/DepartmentWorkflowView';
import { SecurityCenterView } from './components/views/SecurityCenterView';
import { NetworkLedgerView } from './components/views/NetworkLedgerView';
import { NetworkGraphView } from './components/views/NetworkGraphView';

// Drawers & Modals
import { EvidenceDetailDrawer } from './components/drawers/EvidenceDetailDrawer';
import { VerificationDetailDrawer } from './components/drawers/VerificationDetailDrawer';
import { CrossAgencyAccessDrawer } from './components/drawers/CrossAgencyAccessDrawer';
import { SecureAuthGateway } from './components/auth/SecureAuthGateway';
import { AccessRestrictedModal } from './components/common/AccessRestrictedModal';

import { NewFIRModal } from './components/modals/NewFIRModal';
import { AddEvidenceModal } from './components/modals/AddEvidenceModal';
import { TransferEvidenceModal } from './components/modals/TransferEvidenceModal';
import { ForensicReportModal } from './components/modals/ForensicReportModal';
import { SubmitChargesheetModal } from './components/modals/SubmitChargesheetModal';
import { IssueCourtOrderModal } from './components/modals/IssueCourtOrderModal';

import { api } from './services/api';
import {
  CaseRecord,
  EvidenceItem,
  ForensicReport,
  Chargesheet,
  CourtOrder,
  InmateCustodyRecord,
  InstitutionalIdentity,
  InstitutionType,
  VerificationResult,
  FIRDocument
} from './types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// 4. Predefined Demo Identities for Hackathon & Evaluation Switching
export const DEMO_IDENTITIES: Record<InstitutionType, InstitutionalIdentity> = {
  POLICE: {
    id: 'POL-IND-004281',
    institution: 'POLICE',
    role: 'Senior Investigating Officer',
    name: 'Inspector Kumar',
    stationOrBench: 'Metro Central Division (#POL-MC-09)',
    publicKey: '0x3B82631024Fa4A228e9c403328fE11A99011B101',
    credentialStatus: 'ACTIVE',
    badgeNumber: 'POL-004281',
    sessionToken: 'qbft-session-token-police'
  },
  FORENSICS: {
    id: 'FOR-IND-003914',
    institution: 'FORENSICS',
    role: 'Chief Forensic Examiner',
    name: 'Dr. Elena Rostova',
    stationOrBench: 'CFSL Cyber & Ballistics Lab Node #03',
    publicKey: '0x7C119842DA9d8123A492F009121c8B3392AA99D1',
    credentialStatus: 'ACTIVE',
    badgeNumber: 'CFSL-DIR-881',
    sessionToken: 'qbft-session-token-forensics'
  },
  COURT: {
    id: 'CRT-IND-001872',
    institution: 'COURT',
    role: 'Presiding Magistrate Judge',
    name: 'Hon. Justice Sarah Vance',
    stationOrBench: 'High Court Sovereign Bench #04',
    publicKey: '0xE8F9C30114002891bbCA449102A772BF88C301A2',
    credentialStatus: 'ACTIVE',
    badgeNumber: 'HC-BENCH-04',
    sessionToken: 'qbft-session-token-court'
  },
  PRISON: {
    id: 'PRS-IND-008210',
    institution: 'PRISON',
    role: 'Correctional Superintendent',
    name: 'Superintendent Marcus Vance',
    stationOrBench: 'Central Correctional Facility Node #04',
    publicKey: '0x9482A8C0B2914755102BB98F210411AB2277C091',
    credentialStatus: 'ACTIVE',
    badgeNumber: 'PRIS-DIR-91',
    sessionToken: 'qbft-session-token-prison'
  }
};

export default function App() {
  // 5. Dynamic Portal State Architecture
  const [currentPortal, setCurrentPortal] = useState<PortalType>('POLICE');
  const [currentView, setCurrentView] = useState<NavigationTarget>('DASHBOARD');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-2026-00124');
  const [searchQuery, setSearchQuery] = useState('');

  // Authenticated Identity & Permissions
  const [authenticatedUser, setAuthenticatedUser] = useState<InstitutionalIdentity>(DEMO_IDENTITIES.POLICE);
  const [currentInstitution, setCurrentInstitution] = useState<InstitutionType>('POLICE');
  const [currentRole, setCurrentRole] = useState<string>('Senior Investigating Officer');
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([
    'READ_CASE', 'CREATE_FIR', 'ADD_EVIDENCE', 'TRANSFER_EVIDENCE', 'SUBMIT_CHARGESHEET'
  ]);

  // Restricted Access Dialog State
  const [restrictedModal, setRestrictedModal] = useState<{
    isOpen: boolean;
    targetPortal: InstitutionType;
  }>({
    isOpen: false,
    targetPortal: 'COURT'
  });

  // Target institution when opening biometric auth
  const [authTargetInstitution, setAuthTargetInstitution] = useState<InstitutionType>('POLICE');

  // Domain Data State
  const [allCases, setAllCases] = useState<CaseRecord[]>([]);
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [reports, setReports] = useState<ForensicReport[]>([]);
  const [chargesheet, setChargesheet] = useState<Chargesheet | undefined>(undefined);
  const [orders, setOrders] = useState<CourtOrder[]>([]);
  const [inmates, setInmates] = useState<InmateCustodyRecord[]>([]);
  const [firDocument, setFirDocument] = useState<FIRDocument | null>(null);
  const [firIntegrity, setFirIntegrity] = useState<VerificationResult | null>(null);
  const [integrity, setIntegrity] = useState<VerificationResult>({
    verified: true,
    calculatedHash: '0x4a71bf003c2bb0194821cc90184b291a00812f8a0029b3c4d5e6f7a8b9cee841',
    blockchainHash: '0x4a71bf003c2bb0194821cc90184b291a00812f8a0029b3c4d5e6f7a8b9cee841',
    blockNumber: 48192842,
    timestamp: '2026-02-14T04:12:08Z',
    message: 'All records 100% verified against sovereign QBFT blockchain roots.'
  });

  const [tamperCount, setTamperCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'alert' } | null>(null);

  // Drawers & Auth State
  const [isSecureAuthOpen, setIsSecureAuthOpen] = useState(false);
  const [isCrossAccessOpen, setIsCrossAccessOpen] = useState(false);
  const [isVerificationDrawerOpen, setIsVerificationDrawerOpen] = useState(false);
  const [selectedEvidenceForDrawer, setSelectedEvidenceForDrawer] = useState<EvidenceItem | null>(null);

  // Workflow Action Modals State
  const [isNewFIROpen, setIsNewFIROpen] = useState(false);
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [transferTargetEvidence, setTransferTargetEvidence] = useState<EvidenceItem | null>(null);
  const [forensicTargetEvidence, setForensicTargetEvidence] = useState<EvidenceItem | null>(null);
  const [isChargesheetOpen, setIsChargesheetOpen] = useState(false);
  const [courtOrderConfig, setCourtOrderConfig] = useState<{ isOpen: boolean; defaultType: 'WARRANT' | 'REMAND' | 'FORENSIC_SUBPOENA' | 'JUDGMENT_CONVICTION' | 'BAIL_RELEASE' }>({
    isOpen: false,
    defaultType: 'BAIL_RELEASE'
  });

  // 6. Synchronize initial route from window.location.pathname
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/court')) {
      handleSelectDemoPortal('COURT');
      if (path.includes('/cases/')) {
        const parts = path.split('/cases/');
        if (parts[1]) setSelectedCaseId(parts[1]);
        setCurrentView('CASE_DETAIL');
      } else if (path.includes('/cases')) {
        setCurrentView('CASES');
      } else if (path.includes('/hearings')) {
        setCurrentView('WORKFLOW_DEPT');
      }
    } else if (path.includes('/forensics')) {
      handleSelectDemoPortal('FORENSICS');
      if (path.includes('/evidence')) setCurrentView('EVIDENCE');
      else if (path.includes('/analysis')) setCurrentView('WORKFLOW_DEPT');
    } else if (path.includes('/prison')) {
      handleSelectDemoPortal('PRISON');
      if (path.includes('/inmates') || path.includes('/custody')) setCurrentView('WORKFLOW_DEPT');
    } else if (path.includes('/network')) {
      setCurrentPortal('NETWORK_GRAPH');
      setCurrentView('NETWORK_GRAPH');
    }
  }, []);

  // Update browser URL route dynamically
  useEffect(() => {
    let routePath = '/';
    if (currentPortal === 'NETWORK_GRAPH' || currentView === 'NETWORK_GRAPH') {
      routePath = '/network';
    } else {
      const p = currentPortal.toLowerCase();
      if (currentView === 'DASHBOARD') routePath = `/${p}/dashboard`;
      else if (currentView === 'CASES') routePath = `/${p}/cases`;
      else if (currentView === 'CASE_DETAIL') routePath = `/${p}/cases/${selectedCaseId}`;
      else if (currentView === 'EVIDENCE') routePath = `/${p}/evidence`;
      else if (currentView === 'WORKFLOW_DEPT') {
        routePath = p === 'police' ? '/police/evidence' : p === 'forensics' ? '/forensics/analysis' : p === 'court' ? '/court/hearings' : '/prison/custody';
      } else if (currentView === 'SECURITY_CENTER') routePath = `/${p}/security`;
      else if (currentView === 'NETWORK_LEDGER') routePath = `/${p}/ledger`;
    }

    try {
      if (window.location.pathname !== routePath) {
        window.history.replaceState(null, '', routePath);
      }
    } catch {
      // Ignore in sandbox iframe environments
    }
  }, [currentPortal, currentView, selectedCaseId]);

  // Initial Data Load
  useEffect(() => {
    loadAllData();
  }, [selectedCaseId]);

  const loadAllData = async () => {
    try {
      const res = await api.getCaseDetails(selectedCaseId);
      if (res.success) {
        setCaseRecord(res.case);
        setEvidenceList(res.evidence || []);
        setReports(res.reports || []);
        setChargesheet(res.chargesheets && res.chargesheets[0]);
        setOrders(res.orders || []);
        setInmates(res.inmates || []);
        setFirDocument(res.firDocument || null);
        setFirIntegrity(res.firIntegrity || null);
        if (res.integrity) setIntegrity(res.integrity);

        if (res.case?.tampered || res.evidence?.some((e) => e.tampered) || (res.chargesheets && res.chargesheets[0]?.tampered)) {
          setTamperCount(1);
        } else {
          setTamperCount(0);
        }
      }

      const casesRes = await api.getCases();
      if (casesRes.success && casesRes.cases) {
        setAllCases(casesRes.cases);
      } else if (res.case) {
        setAllCases([res.case]);
      }
    } catch (e) {
      console.error('Error loading justice data:', e);
    }
  };

  const showToast = (title: string, desc: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 3. SECURE PORTAL SWITCHING (Checks RBAC authorization)
  const handleSelectPortal = (target: PortalType) => {
    if (target === 'NETWORK_GRAPH') {
      setCurrentPortal('NETWORK_GRAPH');
      setCurrentView('NETWORK_GRAPH');
      return;
    }

    // Check if the currently authenticated identity is authorized for this portal
    if (authenticatedUser.institution === target) {
      setCurrentPortal(target);
      if (currentView === 'NETWORK_GRAPH') {
        setCurrentView('DASHBOARD');
      }
    } else {
      // Not authorized with current institutional credentials: show Access Restricted dialog
      setRestrictedModal({
        isOpen: true,
        targetPortal: target
      });
    }
  };

  // 4. DEMO MODE PORTAL SWITCHING (Evaluator Fast-Path)
  const handleSelectDemoPortal = (target: PortalType) => {
    if (target === 'NETWORK_GRAPH') {
      setCurrentPortal('NETWORK_GRAPH');
      setCurrentView('NETWORK_GRAPH');
      showToast('DEMO MODE', 'Viewing shared DCJMN Network Graph.', 'success');
      return;
    }

    const demoIdentity = DEMO_IDENTITIES[target];
    setAuthenticatedUser(demoIdentity);
    setCurrentInstitution(target);
    setCurrentRole(demoIdentity.role);
    setCurrentPortal(target);
    if (currentView === 'NETWORK_GRAPH') {
      setCurrentView('DASHBOARD');
    }

    showToast(
      'DEMO MODE: SWITCHED PORTAL',
      `Simulated identity loaded: ${demoIdentity.name} (${demoIdentity.role} at ${target})`,
      'success'
    );
  };

  // Auth Handlers (Biometric Gateway)
  const handleAuthenticated = (identity: InstitutionalIdentity) => {
    setAuthenticatedUser(identity);
    setCurrentInstitution(identity.institution);
    setCurrentRole(identity.role);
    setCurrentPortal(identity.institution);
    setIsSecureAuthOpen(false);
    showToast(
      'IDENTITY ATTESTED',
      `${identity.name} authenticated into ${identity.institution} portal.`,
      'success'
    );
  };

  // Case Selection
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentView('CASE_DETAIL');
  };

  // Action Success Handlers
  const handleCaseCreated = (newCase: CaseRecord) => {
    setCaseRecord(newCase);
    setSelectedCaseId(newCase.caseId);
    setAllCases((prev) => [newCase, ...prev.filter(c => c.caseId !== newCase.caseId)]);
    setCurrentView('CASE_DETAIL');
    showToast('DIGITAL FIR COMMITTED', `FIR ${newCase.caseId} anchored in CaseRegistry.`, 'success');
    loadAllData();
  };

  const handleEvidenceCreated = (newEvidence: EvidenceItem) => {
    setEvidenceList((prev) => [newEvidence, ...prev]);
    showToast('EXHIBIT SECURED', `${newEvidence.evidenceId} write-blocked hash registered on-chain.`, 'success');
    loadAllData();
  };

  const handleEvidenceTransferred = (transferred: EvidenceItem) => {
    setEvidenceList((prev) =>
      prev.map((e) => (e.evidenceId === transferred.evidenceId ? transferred : e))
    );
    showToast('CUSTODY HANDSHAKE SEALED', `${transferred.evidenceId} custodian transferred to ${transferred.currentCustodian}.`, 'success');
    loadAllData();
  };

  const handleForensicReportCreated = (newReport: ForensicReport) => {
    setReports((prev) => [newReport, ...prev]);
    showToast('CFSL CERTIFICATE ATTESTED', `Forensic certificate ${newReport.reportId} sealed with Ed25519 signature.`, 'success');
    loadAllData();
  };

  const handleChargesheetSubmitted = (newChargesheet: Chargesheet) => {
    setChargesheet(newChargesheet);
    showToast('CHARGESHEET DOCKETED', `Chargesheet ${newChargesheet.chargesheetId} submitted to High Court Bench.`, 'success');
    loadAllData();
  };

  const handleCourtOrderIssued = (newOrder: CourtOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast('JUDICIAL DECREE SEALED', `Order ${newOrder.orderId} (${newOrder.type}) issued by Bench #04.`, 'success');
    loadAllData();
  };

  const handleExecuteBailRelease = async (inmateId: string) => {
    try {
      const res = await api.executeBailRelease(inmateId);
      if (res.success) {
        showToast('SMART BAIL EXECUTED', `Inmate ${inmateId} released under RFID geo-fence escrow.`, 'success');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compute Page Title for TopBar
  const getPageMeta = () => {
    if (currentView === 'NETWORK_GRAPH') {
      return { title: 'Network Graph', subtitle: 'Architecture & Case Flow' };
    }
    switch (currentView) {
      case 'DASHBOARD':
        return { title: 'Dashboard', subtitle: `${currentPortal} Portal` };
      case 'CASES':
        return { title: 'Cases', subtitle: 'Canonical Registry' };
      case 'CASE_DETAIL':
        return { title: selectedCaseId, subtitle: caseRecord?.title || 'Case Record' };
      case 'EVIDENCE':
        return { title: 'Evidence', subtitle: 'Exhibits & Chain of Custody' };
      case 'WORKFLOW_DEPT':
        return {
          title: currentPortal === 'POLICE' ? 'Investigation' : currentPortal === 'FORENSICS' ? 'Lab Analysis' : currentPortal === 'COURT' ? 'Judicial Decrees' : 'Correctional Custody',
          subtitle: 'Institutional Workbench'
        };
      case 'SECURITY_CENTER':
        return { title: 'Security Center', subtitle: 'Identity, Roots & Audit Logs' };
      case 'NETWORK_LEDGER':
        return { title: 'Network Ledger', subtitle: 'QBFT Consensus Consortium' };
      default:
        return { title: 'Dashboard', subtitle: `${currentPortal} Portal` };
    }
  };

  const pageMeta = getPageMeta();
  const effectiveInstitution = currentPortal === 'NETWORK_GRAPH' ? authenticatedUser.institution : (currentPortal as InstitutionType);

  return (
    <div className="min-h-screen bg-[#07090F] text-slate-100 flex overflow-x-hidden font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'NETWORK_GRAPH') {
            setCurrentPortal('NETWORK_GRAPH');
          } else if (currentPortal === 'NETWORK_GRAPH') {
            setCurrentPortal(authenticatedUser.institution);
          }
        }}
        currentIdentity={authenticatedUser}
        onSwitchInstitution={() => {
          setAuthTargetInstitution(authenticatedUser.institution);
          setIsSecureAuthOpen(true);
        }}
        onLockSession={() => {
          setAuthTargetInstitution(authenticatedUser.institution);
          setIsSecureAuthOpen(true);
        }}
        tamperCount={tamperCount}
      />

      {/* Main Command Center Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Bar with 2. Compact Institution Switcher & 4. DEMO MODE Switcher */}
        <TopBar
          currentPortal={currentPortal}
          onSelectPortal={handleSelectPortal}
          onSelectDemoPortal={handleSelectDemoPortal}
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          currentIdentity={authenticatedUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRequestAccess={() => setIsCrossAccessOpen(true)}
          tamperCount={tamperCount}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-8">
          {/* 8-20. DEDICATED NETWORK GRAPH VIEW */}
          {currentView === 'NETWORK_GRAPH' && (
            <NetworkGraphView
              caseRecord={caseRecord}
              evidenceList={evidenceList}
              reports={reports}
              chargesheet={chargesheet}
              orders={orders}
              inmates={inmates}
              onNavigateToPortal={(portal) => {
                handleSelectPortal(portal);
                setCurrentView('DASHBOARD');
              }}
            />
          )}

          {currentView === 'DASHBOARD' && (
            <DashboardView
              institution={effectiveInstitution}
              cases={allCases.length > 0 ? allCases : caseRecord ? [caseRecord] : []}
              evidenceList={evidenceList}
              reports={reports}
              chargesheet={chargesheet}
              orders={orders}
              inmates={inmates}
              onSelectCase={handleSelectCase}
              onNewFIR={() => setIsNewFIROpen(true)}
              onOpenVerificationDrawer={() => setIsVerificationDrawerOpen(true)}
            />
          )}

          {currentView === 'CASES' && (
            <CasesListView
              cases={allCases.length > 0 ? allCases : caseRecord ? [caseRecord] : []}
              onSelectCase={handleSelectCase}
              onNewFIR={() => setIsNewFIROpen(true)}
              userInstitution={effectiveInstitution}
            />
          )}

          {currentView === 'CASE_DETAIL' && caseRecord && (
            <CaseDetailView
              caseRecord={caseRecord}
              evidenceList={evidenceList}
              reports={reports}
              chargesheet={chargesheet}
              orders={orders}
              inmates={inmates}
              userInstitution={effectiveInstitution}
              firDocument={firDocument || undefined}
              firIntegrity={firIntegrity}
              onBack={() => setCurrentView('CASES')}
              onSelectEvidence={(ev) => setSelectedEvidenceForDrawer(ev)}
              onOpenVerificationDrawer={() => setIsVerificationDrawerOpen(true)}
              onOpenAddEvidence={() => setIsAddEvidenceOpen(true)}
              onOpenTransferEvidence={(ev) => setTransferTargetEvidence(ev)}
              onOpenReportModal={(ev) => setForensicTargetEvidence(ev)}
              onOpenSubmitChargesheet={() => setIsChargesheetOpen(true)}
              onOpenIssueCourtOrder={() => setCourtOrderConfig({ isOpen: true, defaultType: 'BAIL_RELEASE' })}
              onExecuteBailRelease={handleExecuteBailRelease}
            />
          )}

          {currentView === 'EVIDENCE' && (
            <EvidenceListView
              evidenceList={evidenceList}
              onSelectEvidence={(ev) => setSelectedEvidenceForDrawer(ev)}
              onRegisterEvidence={() => setIsAddEvidenceOpen(true)}
              userInstitution={effectiveInstitution}
            />
          )}

          {currentView === 'WORKFLOW_DEPT' && caseRecord && (
            <DepartmentWorkflowView
              institution={effectiveInstitution}
              caseRecord={caseRecord}
              evidenceList={evidenceList}
              reports={reports}
              chargesheet={chargesheet}
              orders={orders}
              inmates={inmates}
              onSelectEvidence={(ev) => setSelectedEvidenceForDrawer(ev)}
              onOpenReportModal={(ev) => setForensicTargetEvidence(ev)}
              onOpenIssueCourtOrder={() => setCourtOrderConfig({ isOpen: true, defaultType: 'BAIL_RELEASE' })}
              onOpenSubmitChargesheet={() => setIsChargesheetOpen(true)}
              onExecuteBailRelease={handleExecuteBailRelease}
              onSelectCase={handleSelectCase}
            />
          )}

          {currentView === 'SECURITY_CENTER' && (
            <SecurityCenterView
              currentIdentity={authenticatedUser}
              onRefreshData={loadAllData}
              tamperCount={tamperCount}
            />
          )}

          {currentView === 'NETWORK_LEDGER' && (
            <NetworkLedgerView />
          )}
        </main>
      </div>

      {/* 3. ACCESS RESTRICTED MODAL (Enforces Identity Separation) */}
      <AccessRestrictedModal
        isOpen={restrictedModal.isOpen}
        onClose={() => setRestrictedModal({ ...restrictedModal, isOpen: false })}
        targetPortal={restrictedModal.targetPortal}
        currentIdentity={authenticatedUser}
        onAuthenticateForTarget={(inst) => {
          setRestrictedModal({ ...restrictedModal, isOpen: false });
          setAuthTargetInstitution(inst);
          setIsSecureAuthOpen(true);
        }}
        onSwitchDemoMode={(inst) => {
          setRestrictedModal({ ...restrictedModal, isOpen: false });
          handleSelectDemoPortal(inst);
        }}
      />

      {/* Drawers */}
      <EvidenceDetailDrawer
        isOpen={Boolean(selectedEvidenceForDrawer)}
        evidence={selectedEvidenceForDrawer}
        onClose={() => setSelectedEvidenceForDrawer(null)}
        onTransfer={() => {
          if (selectedEvidenceForDrawer) {
            setTransferTargetEvidence(selectedEvidenceForDrawer);
            setSelectedEvidenceForDrawer(null);
          }
        }}
        onAnalyze={() => {
          if (selectedEvidenceForDrawer) {
            setForensicTargetEvidence(selectedEvidenceForDrawer);
            setSelectedEvidenceForDrawer(null);
          }
        }}
        userInstitution={effectiveInstitution}
      />

      <VerificationDetailDrawer
        isOpen={isVerificationDrawerOpen}
        onClose={() => setIsVerificationDrawerOpen(false)}
        integrity={integrity}
        recordType="CASE"
        recordId={selectedCaseId}
      />

      <CrossAgencyAccessDrawer
        isOpen={isCrossAccessOpen}
        onClose={() => setIsCrossAccessOpen(false)}
        currentIdentity={authenticatedUser}
        onAccessGranted={({ resource }) => {
          showToast('CROSS-AGENCY ACCESS AUTHORIZED', `Smart contract issued token for ${resource}`, 'success');
        }}
      />

      {/* Biometric Gateway Modal */}
      <SecureAuthGateway
        isOpen={isSecureAuthOpen}
        onClose={() => setIsSecureAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
        initialInstitution={authTargetInstitution}
      />

      {/* Workflow Action Modals */}
      <NewFIRModal
        isOpen={isNewFIROpen}
        onClose={() => setIsNewFIROpen(false)}
        onCreated={handleCaseCreated}
        officerName={authenticatedUser.name}
        officerId={authenticatedUser.badgeNumber || authenticatedUser.id}
      />

      {caseRecord && (
        <>
          <AddEvidenceModal
            isOpen={isAddEvidenceOpen}
            caseId={caseRecord.caseId}
            onClose={() => setIsAddEvidenceOpen(false)}
            onCreated={handleEvidenceCreated}
          />

          <TransferEvidenceModal
            isOpen={Boolean(transferTargetEvidence)}
            evidence={transferTargetEvidence}
            onClose={() => setTransferTargetEvidence(null)}
            onTransferred={handleEvidenceTransferred}
          />

          <ForensicReportModal
            isOpen={Boolean(forensicTargetEvidence)}
            evidence={forensicTargetEvidence}
            onClose={() => setForensicTargetEvidence(null)}
            onCreated={handleForensicReportCreated}
          />

          <SubmitChargesheetModal
            isOpen={isChargesheetOpen}
            caseId={caseRecord.caseId}
            onClose={() => setIsChargesheetOpen(false)}
            onSubmitted={handleChargesheetSubmitted}
          />

          <IssueCourtOrderModal
            isOpen={courtOrderConfig.isOpen}
            caseId={caseRecord.caseId}
            defaultType={courtOrderConfig.defaultType}
            onClose={() => setCourtOrderConfig({ isOpen: false, defaultType: 'BAIL_RELEASE' })}
            onIssued={handleCourtOrderIssued}
          />
        </>
      )}

      {/* Live Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-3">
          <div className={`p-4 rounded border shadow-2xl backdrop-blur-md flex items-start space-x-3 ${
            toastMessage.type === 'alert'
              ? 'bg-rose-950/90 border-rose-800 text-rose-100'
              : 'bg-[#0A121C]/95 border-slate-700 text-slate-100'
          }`}>
            <div className="shrink-0 mt-0.5">
              {toastMessage.type === 'alert' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-bold uppercase tracking-wider">
                {toastMessage.title}
              </div>
              <div className="text-xs text-slate-300 font-sans leading-snug">
                {toastMessage.desc}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
