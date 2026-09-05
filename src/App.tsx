import React, { useState } from 'react';
import { AppProvider, useApp, isViewAllowedForRole } from './context/AppContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { AIChatDrawer } from './components/ai/AIChatDrawer';
import { ToastContainer } from './components/common/UIComponents';

// Dashboards
import { PresidentDashboard } from './components/dashboards/PresidentDashboard';
import { ManagerDashboard } from './components/dashboards/ManagerDashboard';
import { SupervisorDashboard } from './components/dashboards/SupervisorDashboard';
import { TechnicianDashboard } from './components/dashboards/TechnicianDashboard';
import { AttendantDashboard } from './components/dashboards/AttendantDashboard';
import { FinancialDashboard } from './components/dashboards/FinancialDashboard';

// Modules
import { SmartFlowIntelligence } from './components/modules/SmartFlowIntelligence';
import { CallsModule } from './components/modules/CallsModule';
import { EquipmentModule } from './components/modules/EquipmentModule';
import { TechniciansModule } from './components/modules/TechniciansModule';
import { SupervisorsModule } from './components/modules/SupervisorsModule';
import { MaintenanceModule } from './components/modules/MaintenanceModule';
import { PartsModule } from './components/modules/PartsModule';
import { ContractsModule } from './components/modules/ContractsModule';
import { AcademyModule } from './components/modules/AcademyModule';
import { MapsModule } from './components/modules/MapsModule';
import { AlertsCenter } from './components/modules/AlertsCenter';
import { DataImportModule } from './components/modules/DataImportModule';
import { FutureIoTModule } from './components/modules/FutureIoTModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { TechHistoryModule } from './components/modules/TechHistoryModule';
import { EmployeesModule } from './components/modules/EmployeesModule';
import { RegionalPerformanceModule } from './components/modules/RegionalPerformanceModule';
import { ManagersPerformanceModule } from './components/modules/ManagersPerformanceModule';
import { PredictiveAnalyticsModule } from './components/modules/PredictiveAnalyticsModule';

const MainLayout: React.FC = () => {
  const { currentUser, isLoggedIn, activeView, toasts, removeToast, theme } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  if (!isLoggedIn || !currentUser) {
    return <LoginScreen />;
  }

  const renderDashboardByRole = () => {
    switch (currentUser.role) {
      case 'PRESIDENTE':
      case 'ADMINISTRADOR':
        return <PresidentDashboard />;
      case 'GERENTE':
        return <ManagerDashboard />;
      case 'SUPERVISOR':
        return <SupervisorDashboard />;
      case 'TECNICO':
        return <TechnicianDashboard />;
      case 'ATENDENTE':
        return <AttendantDashboard />;
      case 'FINANCEIRO':
        return <FinancialDashboard />;
      default:
        return <PresidentDashboard />;
    }
  };

  const renderViewContent = () => {
    // Check if the current view is permitted for user role
    const isAllowed = isViewAllowedForRole(currentUser.role, activeView);
    if (!isAllowed) {
      return renderDashboardByRole();
    }

    switch (activeView) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'regional':
        return <RegionalPerformanceModule />;
      case 'intelligence':
        return <SmartFlowIntelligence />;
      case 'calls':
        if (currentUser.role === 'GERENTE') {
          return <SupervisorsModule />;
        }
        return <CallsModule />;
      case 'equipments':
        return <EquipmentModule />;
      case 'technicians':
        return <TechniciansModule />;
      case 'supervisors':
        return <SupervisorsModule />;
      case 'managers':
        if (currentUser.role === 'PRESIDENTE' || currentUser.role === 'ADMINISTRADOR') {
          return <ManagersPerformanceModule />;
        }
        return <ManagerDashboard />;
      case 'maintenance':
        return <MaintenanceModule />;
      case 'parts':
        return <PartsModule />;
      case 'history':
        return <TechHistoryModule />;
      case 'contracts':
        return <ContractsModule />;
      case 'financial':
        return <FinancialDashboard />;
      case 'employees':
        return <EmployeesModule />;
      case 'training':
        return <AcademyModule />;
      case 'maps':
        return <MapsModule />;
      case 'alerts':
        return <AlertsCenter />;
      case 'import':
        return <DataImportModule />;
      case 'future_iot':
        return <FutureIoTModule />;
      case 'predictive':
        return <PredictiveAnalyticsModule />;
      case 'settings':
        return <SettingsModule />;
      case 'reports':
        return <ReportsModule />;
      default:
        return renderDashboardByRole();
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#0f1117', color: '#e4e8f0', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Top Header */}
      <Header 
        onOpenAIChat={() => setIsAIChatOpen(true)} 
        onToggleMobileMenu={() => setIsMobileDrawerOpen(prev => !prev)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
          collapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6 px-3 py-3.5 sm:px-4 sm:py-4 md:px-6 md:py-5" style={{ backgroundColor: '#0f1117' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {renderViewContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation 
        onToggleMobileMenu={() => setIsMobileDrawerOpen(prev => !prev)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
      />

      {/* AI Chat Drawer */}
      <AIChatDrawer 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
      />

      {/* Notifications Toast */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
