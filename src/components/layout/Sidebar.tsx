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

  const getSectionsByRole = (): NavSection[] => {
    switch (currentUser.role) {
      case 'TECNICO':
        return [
          {
            title: 'Meu Espaço',
            items: [
              { id: 'dashboard', label: 'Meu Painel', icon: Smartphone },
              { id: 'calls',     label: 'Minhas Ordens', icon: PhoneCall, count: activeCalls, countType: 'blue' },
              { id: 'parts',     label: 'Peças & Componentes', icon: Package },
              { id: 'alerts',    label: 'Alertas', icon: Bell, count: criticalAlerts, countType: 'red' },
            ]
          }
        ];

      case 'ATENDENTE':
        return [
          {
            title: 'Atendimento',
            items: [
              { id: 'dashboard',  label: 'Central de Chamados', icon: LayoutDashboard },
              { id: 'calls',      label: 'Chamados em Aberto', icon: PhoneCall, count: activeCalls, countType: 'blue' },
              { id: 'equipments', label: 'Equipamentos', icon: Building2 },
              { id: 'alerts',     label: 'Alertas Críticos', icon: Bell, count: criticalAlerts, countType: 'red' },
            ]
          }
        ];

      case 'SUPERVISOR':
        return [
          {
            title: 'Supervisão de Polo',
            items: [
              { id: 'dashboard',   label: 'Painel do Polo', icon: LayoutDashboard },
              { id: 'calls',       label: 'Chamados & Ordens', icon: PhoneCall, count: activeCalls, countType: 'blue' },
              { id: 'technicians', label: 'Técnicos & Equipes', icon: Wrench },
              { id: 'equipments',  label: 'Equipamentos', icon: Building2 },
            ]
          },
          {
            title: 'Tecnologia & IoT',
            items: [
              { id: 'future_iot',   label: 'OTIS ONE & SCADA', icon: Cpu },
              { id: 'predictive',   label: 'Predição Andar & Uso', icon: TrendingUp },
              { id: 'intelligence', label: 'SmartFlow IA', icon: BrainCircuit },
              { id: 'parts',        label: 'Peças & Estoque', icon: Package },
            ]
          },
          {
            title: 'Operação & Campo',
            items: [
              { id: 'maps',    label: 'Radar em Tempo Real', icon: MapPin },
              { id: 'reports', label: 'Relatórios do Polo', icon: FileSpreadsheet },
              { id: 'alerts',  label: 'Alertas', icon: Bell, count: criticalAlerts, countType: 'red' },
            ]
          }
        ];

      case 'GERENTE':
        return [
          {
            title: 'Gerência Regional',
            items: [
              { id: 'dashboard',   label: 'Painel Gerencial', icon: LayoutDashboard },
              { id: 'supervisors', label: 'Supervisores & Polos', icon: Award },
              { id: 'technicians', label: 'Técnicos & Rotas', icon: Wrench },
              { id: 'contracts',   label: 'Contratos & SLAs', icon: FileText },
            ]
          },
          {
            title: 'Inteligência & IoT',
            items: [
              { id: 'intelligence', label: 'Inteligência Operacional', icon: BrainCircuit },
              { id: 'predictive',   label: 'Predição Andar & Uso', icon: TrendingUp },
              { id: 'future_iot',   label: 'OTIS ONE & SCADA', icon: Cpu },
              { id: 'equipments',   label: 'Parque Instalado', icon: Building2 },
            ]
          },
          {
            title: 'Resultados & Controle',
            items: [
              { id: 'maps',      label: 'Mapa em Tempo Real', icon: MapPin },
              { id: 'financial', label: 'Financeiro & Margens', icon: DollarSign },
              { id: 'reports',   label: 'Relatórios Executivos', icon: FileSpreadsheet },
              { id: 'alerts',    label: 'Alertas Críticos', icon: Bell, count: criticalAlerts, countType: 'red' },
            ]
          }
        ];

      case 'PRESIDENTE':
        return [
          {
            title: 'Governança Executiva',
            items: [
              { id: 'dashboard', label: 'Painel Executivo', icon: LayoutDashboard },
              { id: 'regional',  label: 'Desempenho Regional', icon: Globe },
              { id: 'managers',  label: 'Gerentes Regionais', icon: Users },
              { id: 'financial', label: 'Financeiro & Margens', icon: DollarSign },
            ]
          },
          {
            title: 'Inovação & IA',
            items: [
              { id: 'intelligence', label: 'SmartFlow IA', icon: BrainCircuit },
              { id: 'predictive',   label: 'Predição Andar & Uso', icon: TrendingUp },
              { id: 'future_iot',   label: 'OTIS ONE & SCADA', icon: Cpu },
              { id: 'contracts',    label: 'Grandes Contratos', icon: FileText },
            ]
          },
          {
            title: 'Supervisão Nacional',
            items: [
              { id: 'maps',    label: 'Radar Nacional', icon: MapPin },
              { id: 'reports', label: 'Relatórios da Presidência', icon: FileSpreadsheet },
              { id: 'alerts',  label: 'Alertas Estratégicos', icon: Bell, count: criticalAlerts, countType: 'red' },
            ]
          }
        ];

      case 'FINANCEIRO':
        return [
          {
            title: 'Controladoria & Finanças',
            items: [
              { id: 'dashboard', label: 'Painel Financeiro', icon: LayoutDashboard },
              { id: 'financial', label: 'Margens & Custos', icon: DollarSign },
              { id: 'contracts', label: 'Contratos & Faturamento', icon: FileText },
            ]
          },
          {
            title: 'Governança & RH',
            items: [
              { id: 'employees', label: 'Quadro & Folha', icon: Users },
              { id: 'reports',   label: 'Relatórios Financeiros', icon: FileSpreadsheet },
            ]
          }
        ];

      case 'ADMINISTRADOR':
      default:
        return [
          {
            title: 'Administração Geral',
            items: [
              { id: 'dashboard',   label: 'Painel Executivo', icon: LayoutDashboard },
              { id: 'regional',    label: 'Desempenho Regional', icon: Globe },
              { id: 'managers',    label: 'Gerentes', icon: Users },
              { id: 'supervisors', label: 'Supervisores', icon: Award },
              { id: 'technicians', label: 'Técnicos & Rotas', icon: Wrench },
            ]
          },
          {
            title: 'Operação & IoT',
            items: [
              { id: 'calls',        label: 'Chamados', icon: PhoneCall, count: activeCalls, countType: 'blue' },
              { id: 'equipments',   label: 'Equipamentos', icon: Building2 },
              { id: 'predictive',   label: 'Predição Andar & Uso', icon: TrendingUp },
              { id: 'future_iot',   label: 'OTIS ONE & SCADA', icon: Cpu },
              { id: 'intelligence', label: 'SmartFlow IA', icon: BrainCircuit },
            ]
          },
          {
            title: 'Gestão & Sistema',
            items: [
              { id: 'maps',      label: 'Mapa em Tempo Real', icon: MapPin },
              { id: 'contracts', label: 'Contratos', icon: FileText },
              { id: 'financial', label: 'Financeiro', icon: DollarSign },
              { id: 'reports',   label: 'Relatórios', icon: FileSpreadsheet },
              { id: 'alerts',    label: 'Alertas', icon: Bell, count: criticalAlerts, countType: 'red' },
              { id: 'settings',  label: 'Configurações', icon: Settings },
            ]
          }
        ];
    }
  };

  const sections = getSectionsByRole();

  const filtered = sections
    .map(s => ({ ...s, items: s.items.filter(i => isViewAllowedForRole(currentUser.role, i.id)) }))
    .filter(s => s.items.length > 0);

  const go = (id: ActiveView) => { 
    setActiveView(id); 
    onCloseMobile?.(); 
  };

  const initials = currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const body = (
    <div className="flex flex-col h-full text-slate-300 overflow-hidden">
      
      {/* Top Section: User Card & Ponto Eletrônico (Pinned at top) */}
      <div className="shrink-0">
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
      </div>

      {/* Middle Section: Navigation Sections (Scrolls smoothly if needed) */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3">
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
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500'
                      }`} />
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                    </div>

                    {item.count !== undefined && item.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 ml-1.5 ${
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

      {/* Bottom Section: Logout & Footer (Pinned at bottom - Botão Preenchido) */}
      <div className="shrink-0 p-3 pb-4 border-t border-slate-800/80 bg-slate-900/95 space-y-2">
        <button
          onClick={() => { logout(); onCloseMobile?.(); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-rose-950/40 border border-rose-500/50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sair do Sistema</span>
        </button>
        <div className="text-center text-[10px] text-slate-500 font-mono leading-tight pb-1">
          OTIS SmartFlow v2.6 · FIAP Challenge
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 min-w-[260px] shrink-0 bg-slate-900/95 border-r border-slate-800/90 h-full select-none shadow-sm overflow-hidden">
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
