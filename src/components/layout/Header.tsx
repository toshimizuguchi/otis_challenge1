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
    <header style={{
      height: 52,
      backgroundColor: '#161a22',
      borderBottom: '1px solid #2a303c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      gap: 12,
    }}>
      {/* LEFT — logo + mobile trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {onToggleMobileMenu && (
          <button
            className="md:hidden"
            onClick={onToggleMobileMenu}
            style={{ padding: '6px', color: '#9ba3b4', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Logo mark */}
        <div style={{
          width: 30, height: 30,
          backgroundColor: '#1d4ed8',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 11, letterSpacing: '-0.05em' }}>OT</span>
        </div>

        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e4e8f0', letterSpacing: '-0.02em' }}>
            OTIS SmartFlow
          </div>
          <div className="hidden md:block" style={{ fontSize: 10, color: '#5a6375', fontWeight: 500 }}>
            Gestão de Elevadores & Contratos
          </div>
        </div>
      </div>

      {/* CENTER — status discreto */}
      <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 6, fontSize: 11, color: '#5a6375' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          backgroundColor: '#0f1117',
          border: '1px solid #2a303c',
          borderRadius: 4,
          padding: '3px 10px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a', flexShrink: 0 }} />
          <span style={{ color: '#9ba3b4', fontWeight: 500 }}>
            {currentUser.role === 'ATENDENTE' ? 'Central de Atendimento Ativa' : 'Sistema Operacional'}
          </span>
        </span>
      </div>

      {/* RIGHT — ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

        {/* Switcher de perfil */}
        <div ref={roleRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setRoleDropdownOpen(v => !v); setUserMenuOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px',
              backgroundColor: '#0f1117',
              border: '1px solid #2a303c',
              borderRadius: 5,
              cursor: 'pointer',
              color: '#9ba3b4',
              fontSize: 12,
              fontWeight: 500,
              transition: 'border-color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a303c')}
          >
            <span style={{ fontSize: 10, color: '#5a6375' }}>Perfil:</span>
            <span style={{ fontWeight: 600, color: '#93bbf5' }}>{ROLE_LABELS[currentUser.role] || currentUser.role}</span>
            <ChevronDown size={13} style={{ color: '#5a6375' }} />
          </button>

          {roleDropdownOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              width: 240,
              backgroundColor: '#161a22',
              border: '1px solid #2a303c',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              zIndex: 100,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #2a303c' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#5a6375', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Simular Perfil de Acesso
                </span>
              </div>
              {rolesList.map(item => {
                const isActive = currentUser.role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => { switchRole(item.role); setRoleDropdownOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px', border: 'none', background: 'none',
                      cursor: 'pointer', textAlign: 'left',
                      backgroundColor: isActive ? '#1a2e4a' : 'transparent',
                      borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#232830'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#93bbf5' : '#c8d0de' }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: '#5a6375', marginTop: 1 }}>{item.desc}</div>
                    </div>
                    {isActive && <ShieldCheck size={13} style={{ color: '#3b82f6', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Assistente IA */}
        {currentUser.role !== 'TECNICO' && currentUser.role !== 'ATENDENTE' && (
          <button
            onClick={onOpenAIChat}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 11px',
              backgroundColor: '#1a2e4a',
              border: '1px solid #2563eb40',
              borderRadius: 5,
              cursor: 'pointer',
              color: '#93bbf5',
              fontSize: 12, fontWeight: 600,
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e3a5f')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a2e4a')}
          >
            <MessageSquare size={13} />
            <span className="hidden sm:inline">Assistente</span>
          </button>
        )}

        {/* Sino */}
        {isViewAllowedForRole(currentUser.role, 'alerts') && (
          <button
            onClick={() => setActiveView('alerts')}
            style={{
              position: 'relative',
              padding: '5px 7px',
              backgroundColor: '#0f1117',
              border: '1px solid #2a303c',
              borderRadius: 5,
              cursor: 'pointer',
              color: '#9ba3b4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a4255')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a303c')}
            title="Alertas"
          >
            <Bell size={15} />
            {unreadAlertsCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                minWidth: 15, height: 15, borderRadius: '50%',
                backgroundColor: '#dc2626', color: 'white',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1, padding: '0 2px',
              }}>
                {unreadAlertsCount}
              </span>
            )}
          </button>
        )}

        {/* Perfil */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setUserMenuOpen(v => !v); setRoleDropdownOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '4px 8px 4px 4px',
              border: '1px solid #2a303c',
              borderRadius: 5,
              cursor: 'pointer',
              background: 'none',
              transition: 'border-color 0.12s, background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#232830'; e.currentTarget.style.borderColor = '#3a4255'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#2a303c'; }}
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                backgroundColor: '#1a2e4a', color: '#93bbf5',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #2563eb30',
              }}>
                {initials}
              </div>
            )}
            <div className="hidden sm:block" style={{ textAlign: 'left', lineHeight: 1.3 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#c8d0de', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: 10, color: '#5a6375' }}>
                {ROLE_LABELS[currentUser.role] || currentUser.role}
              </div>
            </div>
            <ChevronDown size={12} style={{ color: '#5a6375' }} />
          </button>

          {userMenuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              width: 200,
              backgroundColor: '#161a22',
              border: '1px solid #2a303c',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              zIndex: 100,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #2a303c' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e4e8f0' }}>{currentUser.name}</div>
                <div style={{ fontSize: 10, color: '#93bbf5', marginTop: 1 }}>{ROLE_LABELS[currentUser.role]}</div>
                <div style={{ fontSize: 10, color: '#5a6375', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</div>
              </div>
              {isViewAllowedForRole(currentUser.role, 'settings') && (
                <button
                  onClick={() => { setActiveView('settings'); setUserMenuOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ba3b4', fontSize: 12 }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#232830')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <SlidersHorizontal size={13} style={{ color: '#5a6375' }} />
                  Configurações
                </button>
              )}
              <button
                onClick={() => { logout(); setUserMenuOpen(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 12 }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2d1414')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={13} />
                Sair do Sistema
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
