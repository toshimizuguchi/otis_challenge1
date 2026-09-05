import React from 'react';
import { useApp, ActiveView } from '../../context/AppContext';
import { 
  Smartphone, 
  MapPin, 
  PhoneCall, 
  Bell, 
  BrainCircuit, 
  Package, 
  Menu, 
  LayoutDashboard, 
  Sparkles,
  DollarSign,
  FileText,
  Building2,
  GraduationCap,
  Award,
  Globe,
  Users
} from 'lucide-react';

interface BottomNavigationProps {
  onToggleMobileMenu: () => void;
  onOpenAIChat: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  onToggleMobileMenu, 
  onOpenAIChat 
}) => {
  const { activeView, setActiveView, currentUser, calls, alerts } = useApp();

  const activeCallsCount = calls.filter(c => c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO').length;
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'TECNICO':
        return [
          {
            id: 'dashboard' as ActiveView,
            label: 'Minhas O.S.',
            icon: <Smartphone className="w-5 h-5 text-cyan-400" />,
            badge: activeCallsCount > 0 ? activeCallsCount : undefined,
            badgeColor: 'bg-rose-500 text-white font-bold'
          },
          {
            id: 'calls' as ActiveView,
            label: 'Semana',
            icon: <PhoneCall className="w-5 h-5 text-sky-400" />
          },
          {
            id: 'history' as ActiveView,
            label: 'Histórico',
            icon: <FileText className="w-5 h-5 text-emerald-400" />
          },
          {
            id: 'parts' as ActiveView,
            label: 'Peças',
            icon: <Package className="w-5 h-5 text-amber-400" />
          }
        ];

      case 'ATENDENTE':
        return [
          {
            id: 'dashboard' as ActiveView,
            label: 'Central',
            icon: <LayoutDashboard className="w-5 h-5" />
          },
          {
            id: 'calls' as ActiveView,
            label: 'Chamados',
            icon: <PhoneCall className="w-5 h-5" />,
            badge: activeCallsCount > 0 ? activeCallsCount : undefined,
            badgeColor: 'bg-cyan-500 text-slate-950 font-bold'
          },
          {
            id: 'history' as ActiveView,
            label: 'Histórico',
            icon: <FileText className="w-5 h-5 text-emerald-400" />
          },
          {
            id: 'equipments' as ActiveView,
            label: 'Elevadores',
            icon: <Building2 className="w-5 h-5" />
          }
        ];

      case 'FINANCEIRO':
        return [
          {
            id: 'financial' as ActiveView,
            label: 'Financeiro',
            icon: <DollarSign className="w-5 h-5" />
          },
          {
            id: 'contracts' as ActiveView,
            label: 'Contratos',
            icon: <FileText className="w-5 h-5" />
          },
          {
            id: 'intelligence' as ActiveView,
            label: 'SmartFlow',
            icon: <BrainCircuit className="w-5 h-5 text-cyan-400" />
          },
          {
            id: 'alerts' as ActiveView,
            label: 'Alertas',
            icon: <Bell className="w-5 h-5" />,
            badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
            badgeColor: 'bg-rose-500 text-white'
          }
        ];

      case 'GERENTE':
        return [
          {
            id: 'dashboard' as ActiveView,
            label: 'Painel',
            icon: <LayoutDashboard className="w-5 h-5" />
          },
          {
            id: 'supervisors' as ActiveView,
            label: 'Supervisores',
            icon: <Award className="w-5 h-5 text-amber-400" />,
            badge: 'Ranking',
            badgeColor: 'bg-amber-500 text-slate-950 font-bold'
          },
          {
            id: 'maps' as ActiveView,
            label: 'Radar/Frota',
            icon: <MapPin className="w-5 h-5" />
          },
          {
            id: 'intelligence' as ActiveView,
            label: 'SmartFlow',
            icon: <BrainCircuit className="w-5 h-5 text-cyan-400" />
          }
        ];

      case 'PRESIDENTE':
        return [
          {
            id: 'dashboard' as ActiveView,
            label: 'Executivo',
            icon: <LayoutDashboard className="w-5 h-5" />
          },
          {
            id: 'regional' as ActiveView,
            label: 'Regional',
            icon: <Globe className="w-5 h-5 text-cyan-400" />
          },
          {
            id: 'managers' as ActiveView,
            label: 'Gerentes',
            icon: <Users className="w-5 h-5 text-amber-400" />
          },
          {
            id: 'financial' as ActiveView,
            label: 'Financeiro',
            icon: <DollarSign className="w-5 h-5 text-emerald-400" />
          },
          {
            id: 'intelligence' as ActiveView,
            label: 'SmartFlow',
            icon: <BrainCircuit className="w-5 h-5 text-purple-400" />
          }
        ];

      case 'SUPERVISOR':
      case 'ADMINISTRADOR':
      default:
        return [
          {
            id: 'dashboard' as ActiveView,
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />
          },
          {
            id: 'calls' as ActiveView,
            label: 'Chamados',
            icon: <PhoneCall className="w-5 h-5" />,
            badge: activeCallsCount > 0 ? activeCallsCount : undefined,
            badgeColor: 'bg-cyan-500 text-slate-950 font-bold'
          },
          {
            id: 'maps' as ActiveView,
            label: 'Radar/Frota',
            icon: <MapPin className="w-5 h-5" />
          },
          {
            id: 'intelligence' as ActiveView,
            label: 'SmartFlow',
            icon: <BrainCircuit className="w-5 h-5 text-cyan-400" />
          }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161a22]/95 backdrop-blur-md border-t border-[#2a303c] shadow-[0_-8px_24px_rgba(0,0,0,0.6)] px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative min-h-[48px] touch-manipulation cursor-pointer ${
                isActive
                  ? 'text-[#93bbf5] font-bold bg-[#1a2e4a] border border-[#2563eb]/40 shadow-inner'
                  : 'text-[#8a94a6] hover:text-[#e4e8f0] active:scale-95'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-mono flex items-center justify-center shadow-md ${item.badgeColor || 'bg-rose-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[68px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute bottom-0.5 shadow-sm shadow-blue-400/50" />
              )}
            </button>
          );
        })}

        {/* Menu Hamburger Trigger for Drawer */}
        <button
          onClick={onToggleMobileMenu}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[#8a94a6] hover:text-[#e4e8f0] active:scale-95 transition-all min-h-[48px] touch-manipulation cursor-pointer"
        >
          <Menu className="w-5 h-5 text-[#8a94a6]" />
          <span className="text-[10px] mt-0.5 tracking-tight text-[#8a94a6]">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
