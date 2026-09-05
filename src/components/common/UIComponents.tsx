import React from 'react';
import { CallPriority, CallStatus, Equipment } from '../../types';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

/* ============================================================
   PRIORITY BADGE — Corporativo, sem neon
   ============================================================ */
export const PriorityBadge: React.FC<{ priority: CallPriority }> = ({ priority }) => {
  const configs: Record<CallPriority, { label: string; style: React.CSSProperties; icon: React.ReactNode }> = {
    CRITICO: {
      label: 'CRÍTICO',
      style: { 
        backgroundColor: '#2d1414', color: '#f87171', 
        border: '1px solid #7f1d1d',
        padding: '2px 8px', borderRadius: '4px',
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em'
      },
      icon: <ShieldAlert style={{ width: 11, height: 11, marginRight: 4 }} />
    },
    ALTO: {
      label: 'ALTO',
      style: { 
        backgroundColor: '#2d2010', color: '#fbbf24', 
        border: '1px solid #78350f',
        padding: '2px 8px', borderRadius: '4px',
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em'
      },
      icon: <AlertTriangle style={{ width: 11, height: 11, marginRight: 4 }} />
    },
    MEDIO: {
      label: 'MÉDIO',
      style: { 
        backgroundColor: '#1a2533', color: '#60a5fa', 
        border: '1px solid #1e3a5f',
        padding: '2px 8px', borderRadius: '4px',
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em'
      },
      icon: <Clock style={{ width: 11, height: 11, marginRight: 4 }} />
    },
    BAIXO: {
      label: 'BAIXO',
      style: { 
        backgroundColor: '#1c2228', color: '#6b7a94', 
        border: '1px solid #2d3340',
        padding: '2px 8px', borderRadius: '4px',
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em'
      },
      icon: <CheckCircle style={{ width: 11, height: 11, marginRight: 4 }} />
    }
  };

  const conf = configs[priority] || configs.MEDIO;

  return (
    <span style={{ ...conf.style, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
      {conf.icon}
      {conf.label}
    </span>
  );
};

/* ============================================================
   STATUS PILL — Corporativo estilo ERP
   ============================================================ */
export const StatusPill: React.FC<{ status: CallStatus }> = ({ status }) => {
  const configs: Record<CallStatus, { label: string; style: React.CSSProperties; dotColor: string }> = {
    CRIADO:         { label: 'Aberto',         style: { backgroundColor: '#1e2128', color: '#9aa3b2', border: '1px solid #2d3340' },           dotColor: '#6b7a94' },
    CONTACTADO:     { label: 'Contactado',     style: { backgroundColor: '#1e2040', color: '#a5b4fc', border: '1px solid #3730a3' },           dotColor: '#818cf8' },
    ACEITO:         { label: 'Aceito',         style: { backgroundColor: '#1e2d3d', color: '#93c5fd', border: '1px solid #1e4178' },           dotColor: '#60a5fa' },
    A_CAMINHO:      { label: 'A Caminho',      style: { backgroundColor: '#1e2d3d', color: '#7dd3fc', border: '1px solid #0369a1' },           dotColor: '#38bdf8' },
    EM_ATENDIMENTO: { label: 'Em Atendimento', style: { backgroundColor: '#2d2010', color: '#fcd34d', border: '1px solid #78350f' },           dotColor: '#fbbf24' },
    CONCLUIDO:      { label: 'Concluído',      style: { backgroundColor: '#0f2d1e', color: '#6ee7b7', border: '1px solid #064e3b' },           dotColor: '#34d399' },
    CANCELADO:      { label: 'Cancelado',      style: { backgroundColor: '#2d1414', color: '#fca5a5', border: '1px solid #7f1d1d' },           dotColor: '#f87171' }
  };

  const conf = configs[status] || configs.CRIADO;

  return (
    <span style={{
      ...conf.style,
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 8px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap'
    }}>
      <span style={{ 
        width: 6, height: 6, borderRadius: '50%', 
        backgroundColor: conf.dotColor,
        display: 'inline-block', flexShrink: 0
      }} />
      {conf.label}
    </span>
  );
};

/* ============================================================
   TECH STATUS BADGE
   ============================================================ */
export const TechStatusBadge: React.FC<{ status: 'DISPONIVEL' | 'A_CAMINHO' | 'EM_ATENDIMENTO' | 'ATRASADO' | 'OFFLINE' }> = ({ status }) => {
  const configs = {
    DISPONIVEL:     { label: 'Disponível',      style: { backgroundColor: '#0f2d1e', color: '#6ee7b7', border: '1px solid #064e3b' }, dotColor: '#34d399' },
    A_CAMINHO:      { label: 'A Caminho',       style: { backgroundColor: '#1e2d3d', color: '#7dd3fc', border: '1px solid #0369a1' }, dotColor: '#38bdf8' },
    EM_ATENDIMENTO: { label: 'Em Atendimento',  style: { backgroundColor: '#2d2010', color: '#fcd34d', border: '1px solid #78350f' }, dotColor: '#fbbf24' },
    ATRASADO:       { label: 'Atrasado',        style: { backgroundColor: '#2d1414', color: '#fca5a5', border: '1px solid #7f1d1d' }, dotColor: '#f87171' },
    OFFLINE:        { label: 'Offline',         style: { backgroundColor: '#1c2228', color: '#6b7a94', border: '1px solid #2d3340' }, dotColor: '#4a5568' }
  };

  const conf = configs[status] || configs.DISPONIVEL;

  return (
    <span style={{
      ...conf.style,
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 8px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 600
    }}>
      <span style={{ 
        width: 6, height: 6, borderRadius: '50%', 
        backgroundColor: conf.dotColor,
        display: 'inline-block', flexShrink: 0
      }} />
      {conf.label}
    </span>
  );
};

/* ============================================================
   RISK GAUGE — Indicador de risco
   ============================================================ */
export const RiskGauge: React.FC<{ score: number; level?: Equipment['riskLevel']; size?: 'sm' | 'md' | 'lg' }> = ({ score, level, size = 'md' }) => {
  const calculatedLevel = level || (score >= 80 ? 'CRITICO' : score >= 60 ? 'ALTO' : score >= 30 ? 'MEDIO' : 'BAIXO');

  const getColor = () => {
    if (score >= 80) return '#f87171';
    if (score >= 60) return '#fbbf24';
    if (score >= 30) return '#60a5fa';
    return '#34d399';
  };

  const getBgStyle = (): React.CSSProperties => {
    if (score >= 80) return { backgroundColor: '#2d1414', color: '#f87171', border: '1px solid #7f1d1d' };
    if (score >= 60) return { backgroundColor: '#2d2010', color: '#fbbf24', border: '1px solid #78350f' };
    if (score >= 30) return { backgroundColor: '#1a2533', color: '#60a5fa', border: '1px solid #1e3a5f' };
    return { backgroundColor: '#0f2d1e', color: '#34d399', border: '1px solid #064e3b' };
  };

  if (size === 'sm') {
    return (
      <span style={{
        ...getBgStyle(),
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 4,
        fontSize: 10, fontWeight: 700
      }}>
        {score} <span style={{ opacity: 0.7 }}>({calculatedLevel})</span>
      </span>
    );
  }

  const color = getColor();
  const circumference = 2 * Math.PI * 18;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="24" cy="24" r="18" stroke="#252930" strokeWidth="4" fill="transparent" />
          <circle
            cx="24" cy="24" r="18"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * score) / 100}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span style={{ 
          position: 'absolute', fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
          color: color 
        }}>{score}</span>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#b0bac8' }}>Risco Preditivo</div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color }}>{calculatedLevel}</div>
      </div>
    </div>
  );
};

/* ============================================================
   TOAST CONTAINER — Notificações corporativas
   ============================================================ */
export const ToastContainer: React.FC<{
  toasts: Array<{ id: string; type: 'info' | 'success' | 'warning' | 'error'; title: string; message: string }>;
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  const typeConfig = {
    success: { color: '#34d399', bgBorder: '#064e3b', label: '✓' },
    error:   { color: '#f87171', bgBorder: '#7f1d1d', label: '✕' },
    warning: { color: '#fbbf24', bgBorder: '#78350f', label: '⚠' },
    info:    { color: '#60a5fa', bgBorder: '#1e4178', label: 'i' }
  };

  return (
    <div 
      className="toast-container-root"
      style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
        maxWidth: 380, width: '100%', pointerEvents: 'none',
        transition: 'bottom 0.2s ease'
      }}
    >
      {toasts.map((toast) => {
        const tc = typeConfig[toast.type];
        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#242830',
              border: `1px solid ${tc.bgBorder}`,
              borderLeft: `4px solid ${tc.color}`,
              borderRadius: 8,
              padding: '12px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'flex-start', gap: 10
            }}
          >
            <span style={{ 
              color: tc.color, fontWeight: 700, fontSize: 13, 
              lineHeight: 1, paddingTop: 2, flexShrink: 0
            }}>
              {tc.label}
            </span>
            <div style={{ flex: 1, fontSize: 12 }}>
              <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{toast.title}</div>
              <div style={{ color: '#9aa3b2', lineHeight: 1.4 }}>{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{ color: '#6b7a94', fontSize: 12, cursor: 'pointer', padding: 2, flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
   METRIC CARD — KPI Card corporativo
   ============================================================ */
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
  badge?: string;
  onClick?: () => void;
}> = ({ title, value, change, isPositive, icon, subtitle, badge, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#242830',
        border: '1px solid #2d3340',
        borderRadius: 8,
        padding: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
        } else {
          e.currentTarget.style.borderColor = '#3a4255';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#2d3340';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.25)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#6b7a94',
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              {title}
            </span>
            {badge && (
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                backgroundColor: '#2d2010', color: '#fbbf24', border: '1px solid #78350f',
                padding: '1px 6px', borderRadius: 3
              }}>
                {badge}
              </span>
            )}
          </div>
          <div style={{
            marginTop: 8, fontSize: 26, fontWeight: 700,
            color: '#e2e8f0', lineHeight: 1.2,
            fontFamily: "'Inter', sans-serif"
          }}>
            {value}
          </div>
        </div>
        <div style={{
          padding: 8, borderRadius: 6,
          backgroundColor: '#1e3a5f', color: '#60a5fa',
          border: '1px solid #1e4178'
        }}>
          {icon}
        </div>
      </div>

      {(change || subtitle) && (
        <div style={{
          marginTop: 12, paddingTop: 10, borderTop: '1px solid #252930',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11
        }}>
          {change && (
            <div style={{
              display: 'flex', alignItems: 'center', fontWeight: 600,
              color: isPositive ? '#34d399' : '#f87171'
            }}>
              {isPositive
                ? <ArrowUpRight style={{ width: 13, height: 13, marginRight: 2 }} />
                : <ArrowDownRight style={{ width: 13, height: 13, marginRight: 2 }} />
              }
              {change}
            </div>
          )}
          {subtitle && (
            <span style={{ color: '#6b7a94' }}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};
