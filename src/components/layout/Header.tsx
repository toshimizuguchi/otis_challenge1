import React, { useState, useRef, useEffect } from 'react';
import { useApp, isViewAllowedForRole } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  SlidersHorizontal,
  Menu,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface HeaderProps {
  onOpenAIChat: () => void;
  onToggleMobileMenu?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  PRESIDENTE:    'Presidência',
  GERENTE:       'Gerência Regional',
  SUPERVISOR:    'Supervisão de Polo',
  TECNICO:       'Técnico de Campo',
  ATENDENTE:     'Central de Atendimento',
  FINANCEIRO:    'Financeiro',
  ADMINISTRADOR: 'Administrador',
};

export const Header: React.FC<HeaderProps> = ({ onOpenAIChat, onToggleMobileMenu }) => {
  const { currentUser, switchRole, logout, alerts, setActiveView } = useApp();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'PRESIDENTE',    title: 'Presidente',    desc: 'Visão Executiva Nacional' },
    { role: 'GERENTE',       title: 'Gerente',       desc: 'Região Sudeste' },
    { role: 'SUPERVISOR',    title: 'Supervisor',    desc: 'Polo Campinas & Equipes' },
    { role: 'TECNICO',       title: 'Técnico',       desc: 'Ordens de Campo' },
    { role: 'ATENDENTE',     title: 'Atendente',     desc: 'Central 24/7' },
    { role: 'FINANCEIRO',    title: 'Financeiro',    desc: 'Contratos & Margens' },
    { role: 'ADMINISTRADOR', title: 'Administrador', desc: 'Configurações do Sistema' },
  ];

  const initials = currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="h-[52px] px-2.5 sm:px-4 safe-top bg-slate-900/95 border-b border-slate-800/90 flex items-center justify-between sticky top-0 z-30 gap-2 backdrop-blur-md">
      {/* LEFT — logo + mobile trigger */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleMobileMenu && (
          <button
            className="md:hidden p-1.5 text-slate-400 hover:text-white active:scale-95 transition-all touch-manipulation cursor-pointer rounded-lg hover:bg-slate-800"
            onClick={onToggleMobileMenu}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Logo mark */}
        <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center shrink-0 font-bold text-slate-950 text-xs shadow-sm">
          OT
        </div>

        <div className="leading-tight">
          <div className="text-[13px] font-bold text-white tracking-tight">
            OTIS <span className="hidden xs:inline text-cyan-400">SmartFlow</span>
          </div>
          <div className="hidden md:block text-[10px] text-slate-500 font-medium">
            Gestão de Elevadores & Contratos
          </div>
        </div>
      </div>

      {/* CENTER — status discreto */}
      <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800/90 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-slate-300 font-medium">
            {currentUser.role === 'ATENDENTE' ? 'Central de Atendimento Ativa' : 'Sistema Operacional'}
          </span>
        </span>
      </div>

      {/* RIGHT — ações */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Switcher de perfil */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => { setRoleDropdownOpen(v => !v); setUserMenuOpen(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-all cursor-pointer shadow-sm touch-manipulation"
            title="Trocar perfil"
          >
            <span className="hidden sm:inline text-[10px] text-slate-500 uppercase">Perfil:</span>
            <span className="truncate max-w-[84px] sm:max-w-none text-cyan-400 font-bold">
              {ROLE_LABELS[currentUser.role] || currentUser.role}
            </span>
            <ChevronDown size={12} className="text-slate-500 shrink-0" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-60 max-w-[calc(100vw-20px)] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/80">
              <div className="px-3 py-2 bg-slate-950/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Simular Perfil de Acesso
                </span>
              </div>
              <div className="p-1 space-y-0.5 max-h-72 overflow-y-auto">
                {rolesList.map(item => {
                  const isActive = currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => { switchRole(item.role); setRoleDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30' 
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{item.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      {isActive && <ShieldCheck size={14} className="text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Assistente IA */}
        {currentUser.role !== 'TECNICO' && currentUser.role !== 'ATENDENTE' && (
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <MessageSquare size={13} />
            <span className="hidden sm:inline">Assistente</span>
          </button>
        )}

        {/* Sino */}
        {isViewAllowedForRole(currentUser.role, 'alerts') && (
          <button
            onClick={() => setActiveView('alerts')}
            className="relative p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-slate-200 rounded-xl text-slate-400 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Alertas"
          >
            <Bell size={15} />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center font-mono px-1 shadow-sm">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        )}

        {/* Perfil */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserMenuOpen(v => !v); setRoleDropdownOpen(false); }}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 transition-all cursor-pointer shadow-sm"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-slate-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-300 text-[10px] font-bold flex items-center justify-center border border-cyan-500/30">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-bold text-white max-w-[110px] truncate">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-500">
                {ROLE_LABELS[currentUser.role] || currentUser.role}
              </div>
            </div>
            <ChevronDown size={12} className="text-slate-500 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-56 max-w-[calc(100vw-20px)] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/80 p-1.5 space-y-1">
              <div className="px-3 py-2 bg-slate-950/40 rounded-xl">
                <div className="text-xs font-bold text-white">{currentUser.name}</div>
                <div className="text-[10px] font-semibold text-cyan-400 mt-0.5">{ROLE_LABELS[currentUser.role]}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">{currentUser.email}</div>
              </div>
              {isViewAllowedForRole(currentUser.role, 'settings') && (
                <button
                  onClick={() => { setActiveView('settings'); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all cursor-pointer"
                >
                  <SlidersHorizontal size={13} className="text-slate-500" />
                  <span>Configurações</span>
                </button>
              )}
              {/* Botão Sair do Sistema Preenchido */}
              <button
                onClick={() => { logout(); setUserMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-950/40 border border-rose-500/50"
              >
                <LogOut size={13} />
                <span>Sair do Sistema</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
