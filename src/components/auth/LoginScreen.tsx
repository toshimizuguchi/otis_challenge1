import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { DEMO_USERS } from '../../data/mockData';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const ROLE_COLOR: Record<string, string> = {
  PRESIDENTE:    '#1d4ed8',
  GERENTE:       '#0369a1',
  SUPERVISOR:    '#0891b2',
  TECNICO:       '#166534',
  ATENDENTE:     '#6d28d9',
  FINANCEIRO:    '#b45309',
  ADMINISTRADOR: '#374151',
};

const ROLE_LABEL: Record<string, string> = {
  PRESIDENTE:    'Presidência',
  GERENTE:       'Gerência',
  SUPERVISOR:    'Supervisão',
  TECNICO:       'Técnico',
  ATENDENTE:     'Atendimento',
  FINANCEIRO:    'Financeiro',
  ADMINISTRADOR: 'Admin',
};

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('presidente@smartflow.ai');
  const [password, setPassword] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  const handleDemoSelect = (userRole: UserRole) => {
    const matched = DEMO_USERS.find(u => u.role === userRole);
    if (matched) { setEmail(matched.email); login(matched.email, userRole); }
  };

  return (
    <div 
      className="p-3 sm:p-6 safe-top safe-bottom"
      style={{
        minHeight: '100vh', backgroundColor: '#0f1117',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, sans-serif"
      }}
    >
      <div style={{ width: '100%', maxWidth: 880, display: 'flex', borderRadius: 10, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
        
        {/* Painel esquerdo */}
        <div
          className="hidden lg:flex"
          style={{
            flex: '0 0 380px',
            backgroundColor: '#1a2e4a',
            padding: '40px 36px',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
              <div style={{ width: 36, height: 36, backgroundColor: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>OT</span>
              </div>
              <div>
                <div style={{ color: '#e4e8f0', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>OTIS SmartFlow</div>
                <div style={{ color: '#5a7ea8', fontSize: 11 }}>Sistema de Gestão Operacional</div>
              </div>
            </div>

            <h1 style={{ color: '#e4e8f0', fontSize: 24, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Gestão integrada<br />de elevadores<br />e contratos
            </h1>
            <p style={{ color: '#7ba0c8', fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
              Controle de chamados, técnicos em campo, SLA de contratos e manutenção preditiva em uma única plataforma.
            </p>

            {/* Features simples */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Central de chamados com SLA em tempo real',
                'Despacho e rastreamento de técnicos',
                'Contratos, margens e análise financeira',
                'Manutenção preditiva e alertas preventivos',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: '#2563eb20', border: '1px solid #2563eb40', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                  </div>
                  <span style={{ color: '#a8c4e0', fontSize: 12.5, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: 20, borderTop: '1px solid #2563eb20', fontSize: 11, color: '#5a7ea8' }}>
            Challenger FIAP MVP · Gestão de Elevadores OTIS
          </div>
        </div>

        {/* Formulário */}
        <div className="p-4 sm:p-8" style={{ flex: 1, backgroundColor: '#161a22' }}>
          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 30, height: 30, backgroundColor: '#2563eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 11 }}>OT</span>
            </div>
            <span style={{ color: '#e4e8f0', fontWeight: 700, fontSize: 14 }}>OTIS SmartFlow</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#e4e8f0', margin: 0, letterSpacing: '-0.02em' }}>
                Acesso ao Sistema
              </h2>
              <span style={{ fontSize: 10, fontWeight: 600, backgroundColor: '#1d2129', color: '#5a6375', border: '1px solid #2a303c', padding: '2px 8px', borderRadius: 4 }}>
                PROD v2.6
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#5a6375', margin: 0 }}>
              Informe suas credenciais corporativas ou escolha um perfil de demonstração
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleManualLogin} style={{ marginBottom: 22 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ba3b4', marginBottom: 5 }}>
                E-mail corporativo
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#5a6375' }} />
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@otis.com"
                  style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, backgroundColor: '#0f1117', border: '1px solid #2a303c', borderRadius: 6, color: '#e4e8f0', fontSize: 13, outline: 'none' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.12)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#2a303c'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#9ba3b4' }}>Senha</label>
                <button type="button" onClick={() => alert('Ambiente demo: qualquer senha ou selecione perfil abaixo.')}
                  style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Esqueci a senha
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#5a6375' }} />
                <input
                  type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, backgroundColor: '#0f1117', border: '1px solid #2a303c', borderRadius: 6, color: '#e4e8f0', fontSize: 13, outline: 'none' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.12)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#2a303c'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: '10px 16px',
                backgroundColor: '#2563eb', color: 'white',
                border: 'none', borderRadius: 6,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              Entrar
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#2a303c' }} />
            <span style={{ fontSize: 11, color: '#3a4255', fontWeight: 500, whiteSpace: 'nowrap' }}>Acesso rápido — demonstração</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#2a303c' }} />
          </div>

          {/* Demo grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 6 }}>
            {DEMO_USERS.map(user => {
              const color = ROLE_COLOR[user.role] || '#374151';
              const firstName = user.name.split(' ')[0];
              return (
                <button
                  key={user.id}
                  onClick={() => handleDemoSelect(user.role)}
                  style={{
                    padding: '9px 11px',
                    backgroundColor: '#1d2129',
                    border: '1px solid #2a303c',
                    borderRadius: 6, textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 9,
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#232830'; e.currentTarget.style.borderColor = color + '50'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1d2129'; e.currentTarget.style.borderColor = '#2a303c'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    backgroundColor: color + '20', border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: color + 'dd' }}>
                      {user.role.slice(0, 2)}
                    </span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#c8d0de', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ROLE_LABEL[user.role]}
                    </div>
                    <div style={{ fontSize: 10, color: '#5a6375', marginTop: 1 }}>{firstName}</div>
                  </div>
                  <ArrowRight size={11} style={{ color: '#3a4255', marginLeft: 'auto', flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
