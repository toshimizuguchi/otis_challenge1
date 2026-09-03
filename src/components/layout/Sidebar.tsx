import React, { useState, useEffect } from 'react';
import { useApp, ActiveView, isViewAllowedForRole } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  PhoneCall, 
  Building2, 
  Wrench, 
  Users, 
  BrainCircuit, 
  Package, 
  FileText, 
  DollarSign, 
  MapPin, 
  Bell, 
  FileSpreadsheet, 
  Settings,
  LogOut,
  Smartphone,
  Clock,
  Award,
  Globe,
  ChevronRight
} from 'lucide-react';
import { TimeClockModal } from '../modals/TimeClockModal';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  count?: number;
  countType?: 'blue' | 'red';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const COUNT_BADGE: Record<'blue' | 'red', React.CSSProperties> = {
  blue: { backgroundColor: '#1a2e4a', color: '#93bbf5', border: '1px solid #2563eb30', borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 700 },
  red:  { backgroundColor: '#2d1414', color: '#fca5a5', border: '1px solid #dc262630', borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 700 },
};

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { activeView, setActiveView, calls, alerts, currentUser, employees, logout } = useApp();
  const [isTimeClockOpen, setIsTimeClockOpen] = useState(false);
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    return () => clearInterval(t);
  }, []);

  const activeCalls   = calls.filter(c => c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO').length;
  const criticalAlerts = alerts.filter(a => !a.read && (a.severity === 'CRITICA' || a.category === 'CRITICO')).length;
  const currentEmp    = employees.find(e => e.id === currentUser.id);
  const punchStatus   = currentEmp?.currentPunchStatus || 'FORA_DE_TURNO';

  const punchColor = punchStatus === 'EM_JORNADA' ? '#16a34a' : punchStatus === 'EM_INTERVALO' ? '#d97706' : '#5a6375';
  const punchLabel = punchStatus === 'EM_JORNADA' ? 'Em Jornada' : punchStatus === 'EM_INTERVALO' ? 'Em Intervalo' : 'Fora de Turno';

  const getDashLabel = () => {
    const map: Record<string, string> = {
      TECNICO: 'Meu Painel', SUPERVISOR: 'Painel do Polo',
      GERENTE: 'Painel Gerencial', ATENDENTE: 'Central de Chamados',
      FINANCEIRO: 'Financeiro', PRESIDENTE: 'Painel Executivo', ADMINISTRADOR: 'Painel Executivo',
    };
    return map[currentUser.role] || 'Dashboard';
  };

  const sections: NavSection[] = currentUser.role === 'TECNICO' ? [
    { title: 'Meu Espaço', items: [
      { id: 'dashboard', label: 'Meu Painel', icon: Smartphone },
      { id: 'calls',     label: 'Minhas Ordens', icon: PhoneCall, count: activeCalls, countType: 'blue' },
      { id: 'parts',     label: 'Peças & Componentes', icon: Package },
      { id: 'alerts',    label: 'Alertas', icon: Bell, count: criticalAlerts, countType: 'red' },
    ]},
  ] : currentUser.role === 'ATENDENTE' ? [
    { title: 'Atendimento', items: [
      { id: 'dashboard',  label: 'Central de Chamados', icon: LayoutDashboard },
      { id: 'calls',      label: 'Chamados em Aberto', icon: PhoneCall, count: activeCalls, countType: 'blue' },
      { id: 'equipments', label: 'Equipamentos', icon: Building2 },
      { id: 'alerts',     label: 'Alertas Críticos', icon: Bell, count: criticalAlerts, countType: 'red' },
    ]},
  ] : [
    { title: currentUser.role === 'PRESIDENTE' ? 'Governança' : 'Operação', items: [
      { id: 'dashboard',    label: getDashLabel(), icon: LayoutDashboard },
      ...(currentUser.role === 'PRESIDENTE' ? [
        { id: 'regional' as ActiveView,     label: 'Desempenho Regional', icon: Globe },
        { id: 'managers' as ActiveView,     label: 'Gerentes', icon: Users },
      ] : []),
      { id: 'intelligence', label: 'Inteligência Operacional', icon: BrainCircuit },
      ...(currentUser.role === 'GERENTE' ? [
        { id: 'supervisors' as ActiveView, label: 'Supervisores & Equipes', icon: Award },
      ] : currentUser.role !== 'PRESIDENTE' ? [
        { id: 'calls' as ActiveView, label: 'Chamados', icon: PhoneCall, count: activeCalls, countType: 'blue' as const },
      ] : []),
      ...(currentUser.role !== 'PRESIDENTE' ? [
        { id: 'equipments' as ActiveView, label: 'Equipamentos', icon: Building2 },
      ] : []),
    ]},
    { title: 'Gestão', items: [
      { id: 'maps',       label: 'Mapa em Tempo Real', icon: MapPin },
      { id: 'technicians',label: 'Técnicos & Rotas', icon: Wrench },
      { id: 'contracts',  label: 'Contratos', icon: FileText },
      { id: 'financial',  label: 'Financeiro & Margens', icon: DollarSign },
      { id: 'reports',    label: 'Relatórios', icon: FileSpreadsheet },
    ]},
    { title: 'Sistema', items: [
      { id: 'alerts',   label: 'Alertas', icon: Bell, count: criticalAlerts, countType: 'red' as const },
      { id: 'settings', label: 'Configurações', icon: Settings },
    ]},
  ];

  const filtered = sections
    .map(s => ({ ...s, items: s.items.filter(i => isViewAllowedForRole(currentUser.role, i.id)) }))
    .filter(s => s.items.length > 0);

  const go = (id: ActiveView) => { setActiveView(id); onCloseMobile?.(); };
  const initials = currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      
      {/* User card */}
      <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid #1e2431' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name}
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              backgroundColor: '#1a2e4a', color: '#93bbf5',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #2563eb30'
            }}>
              {initials}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e4e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#5a6375' }}>
                {currentUser.region || currentUser.city || 'Conectado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ponto eletrônico */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #1e2431' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#9ba3b4' }}>
            <Clock size={12} style={{ color: '#5a6375' }} />
            Ponto Eletrônico
          </div>
          <span style={{ 
            fontVariantNumeric: 'tabular-nums', fontSize: 11, fontWeight: 700,
            color: '#93bbf5', letterSpacing: '-0.01em'
          }}>
            {time}
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#0f1117', border: '1px solid #1e2431', borderRadius: 5,
          padding: '5px 9px', marginBottom: 7
        }}>
          <span style={{ fontSize: 10, color: '#5a6375' }}>Status:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: punchColor }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: punchColor }} />
            {punchLabel}
          </span>
        </div>
        <button
          onClick={() => { setIsTimeClockOpen(true); onCloseMobile?.(); }}
          style={{
            width: '100%', padding: '7px', borderRadius: 5,
            backgroundColor: '#1a2e4a', color: '#93bbf5',
            border: '1px solid #2563eb30',
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e3a5f')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a2e4a')}
        >
          <Clock size={12} />
          Registrar Ponto
        </button>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '8px 8px' }}>
        {filtered.map((section, si) => (
          <div key={si}>
            {si > 0 && <div style={{ height: 1, backgroundColor: '#1e2431', margin: '6px 4px' }} />}
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: '#3a4255',
              padding: '8px 8px 4px'
            }}>
              {section.title}
            </div>
            {section.items.map(item => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 8px',
                    borderRadius: 5,
                    border: 'none',
                    borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                    paddingLeft: isActive ? 6 : 8,
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#1a2e4a' : 'transparent',
                    color: isActive ? '#93bbf5' : '#9ba3b4',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 12.5,
                    transition: 'all 0.1s',
                    marginBottom: 1,
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = '#1d2129'; e.currentTarget.style.color = '#c8d0de'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9ba3b4'; }}}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={14} style={{ color: isActive ? '#3b82f6' : '#5a6375', flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span style={COUNT_BADGE[item.countType || 'blue']}>{item.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div style={{ borderTop: '1px solid #1e2431', padding: '8px' }}>
        <button
          onClick={() => { logout(); onCloseMobile?.(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 8px', borderRadius: 5, border: 'none',
            cursor: 'pointer', backgroundColor: 'transparent',
            color: '#f87171', fontSize: 12.5,
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2d1414')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={13} />
          Sair do Sistema
        </button>
        <div style={{ padding: '6px 8px 2px', fontSize: 10, color: '#3a4255', lineHeight: 1.4 }}>
          OTIS SmartFlow v2.6 · Challenger FIAP
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden md:flex md:flex-col"
        style={{
          width: 220, flexShrink: 0,
          backgroundColor: '#161a22',
          borderRight: '1px solid #2a303c',
          height: 'calc(100vh - 52px)',
          position: 'sticky', top: 52,
          overflowY: 'auto',
          userSelect: 'none',
        }}
      >
        {body}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div
            onClick={onCloseMobile}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)' }}
          />
          <div style={{
            position: 'relative', zIndex: 10,
            width: '80%', maxWidth: 260,
            backgroundColor: '#161a22',
            borderRight: '1px solid #2a303c',
            height: '100%', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              height: 52, padding: '0 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid #2a303c'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, backgroundColor: '#1d4ed8', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: 10 }}>OT</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e4e8f0' }}>SmartFlow</span>
              </div>
              <button onClick={onCloseMobile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6375', padding: 4 }}>
                <LogOut size={15} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>{body}</div>
          </div>
        </div>
      )}

      <TimeClockModal isOpen={isTimeClockOpen} onClose={() => setIsTimeClockOpen(false)} />
    </>
  );
};
