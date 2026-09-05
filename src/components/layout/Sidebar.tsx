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
  TrendingUp,
  Cpu,
  X
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

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { activeView, setActiveView, calls, alerts, currentUser, employees, logout } = useApp();
  const [isTimeClockOpen, setIsTimeClockOpen] = useState(false);
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    return () => clearInterval(t);
  }, []);

  const activeCalls = calls.filter(c => c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO').length;
  const criticalAlerts = alerts.filter(a => !a.read && (a.severity === 'CRITICA' || a.category === 'CRITICO')).length;
  const currentEmp = employees.find(e => e.id === currentUser.id);
  const punchStatus = currentEmp?.currentPunchStatus || 'FORA_DE_TURNO';

  const punchLabel = punchStatus === 'EM_JORNADA' ? 'Em Jornada' : punchStatus === 'EM_INTERVALO' ? 'Em Intervalo' : 'Fora de Turno';
  const punchBadgeClass = punchStatus === 'EM_JORNADA' 
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
    : punchStatus === 'EM_INTERVALO' 
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
    : 'bg-slate-800 text-slate-400 border-slate-700';

  const getDashLabel = () => {
    const map: Record<string, string> = {
      TECNICO: 'Meu Painel', 
      SUPERVISOR: 'Painel do Polo',
      GERENTE: 'Painel Gerencial', 
      ATENDENTE: 'Central de Chamados',
      FINANCEIRO: 'Financeiro', 
      PRESIDENTE: 'Painel Executivo', 
      ADMINISTRADOR: 'Painel Executivo',
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
      { id: 'predictive' as ActiveView, label: 'Predição Andar & Uso', icon: TrendingUp },
      { id: 'future_iot' as ActiveView, label: 'OTIS ONE & SCADA', icon: Cpu },
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

  const go = (id: ActiveView) => { 
    setActiveView(id); 
    onCloseMobile?.(); 
  };

  const initials = currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const body = (
    <div className="flex flex-col h-full overflow-y-auto text-slate-300">
      
      {/* User Card */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          {currentUser.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700 shrink-0" 
            />
          ) : (
            <div className="w-9 h-9 rounded-xl shrink-0 bg-cyan-500/10 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {currentUser.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[10px] text-slate-400 truncate">
                {currentUser.region || currentUser.city || 'Online'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ponto Eletrônico */}
      <div className="p-3 border-b border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Ponto Eletrônico</span>
          </div>
          <span className="font-mono text-xs font-bold text-cyan-400 tracking-tight">
            {time}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/90 text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Status:</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${punchBadgeClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {punchLabel}
          </span>
        </div>

        <button
          onClick={() => { setIsTimeClockOpen(true); onCloseMobile?.(); }}
          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/80 transition-all cursor-pointer shadow-sm"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Registrar Ponto</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 p-2 space-y-3">
        {filtered.map((section, si) => (
          <div key={si} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>

            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = activeView === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.count !== undefined && item.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 ${
                        item.countType === 'red'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout & Footer */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <button
          onClick={() => { logout(); onCloseMobile?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Sair do Sistema</span>
        </button>
        <div className="px-3 pt-1 text-[10px] text-slate-400 font-mono leading-tight">
          OTIS SmartFlow v2.6 · FIAP Challenge
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 bg-slate-900/95 border-r border-slate-800/90 h-[calc(100vh-52px)] sticky top-[52px] overflow-y-auto select-none shadow-sm">
        {body}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />
          <div className="relative z-10 w-[82%] max-w-[280px] bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl safe-top safe-bottom">
            <div className="h-[52px] px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs">
                  OT
                </div>
                <span className="text-xs font-bold text-white">OTIS SmartFlow</span>
              </div>
              <button 
                onClick={onCloseMobile} 
                aria-label="Fechar menu lateral"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{body}</div>
          </div>
        </div>
      )}

      <TimeClockModal isOpen={isTimeClockOpen} onClose={() => setIsTimeClockOpen(false)} />
    </>
  );
};
