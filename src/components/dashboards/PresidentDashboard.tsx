import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/UIComponents';
import { LATAM_REGIONS_DATA, REGIONAL_COMPARISON_DATA } from '../../data/mockData';
import { 
  ShieldCheck, 
  PhoneCall, 
  AlertTriangle, 
  DollarSign, 
  Globe2, 
  Sparkles, 
  TrendingUp, 
  MapPin,
  ChevronDown,
  Zap,
  ChevronRight,
  Info
} from 'lucide-react';

const panelStyle: React.CSSProperties = {
  backgroundColor: '#242830',
  border: '1px solid #2d3340',
  borderRadius: 8,
  overflow: 'hidden'
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: '#1e2128',
  borderBottom: '1px solid #2d3340'
};

export const PresidentDashboard: React.FC = () => {
  const { equipments, calls, contracts, setActiveView, setSelectedCityFilter } = useApp();
  const [selectedCountry, setSelectedCountry] = useState<string>('Brasil');
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  const toggleInsight = (id: string) => {
    setExpandedInsights(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const strategicInsights = [
    {
      id: 'campinas-sbc',
      title: 'Padrão em Campinas & SBC',
      tag: 'Portas Gen2',
      severity: 'warning' as const,
      explanation: 'Foi identificado aumento de 64% em chamados relacionados ao sistema de portas no modelo Gen2 Comfort após ~3 anos de uso contínuo.',
      recommendation: 'Campanha preventiva em lote para 320 equipamentos com economia de R$ 142k.'
    },
    {
      id: 'margem-hospitalar',
      title: 'Margem Hospitalar em Queda',
      tag: 'ABC Paulista',
      severity: 'error' as const,
      explanation: 'Contrato Hospital Brasil reduziu margem de 26% para 12.9% devido a multas por desvio de SLA.',
      recommendation: 'Aditivo técnico com barreiras ópticas 3D SafeGuard e redistribuição de rota.'
    },
    {
      id: 'sp-capital',
      title: 'Sucesso em São Paulo Capital',
      tag: 'SkyRise & ReGen',
      severity: 'success' as const,
      explanation: 'Adoção de telemetria Compass 360 gerou 43.3% de margem operacional líquida nos edifícios AAA.',
      recommendation: 'Expandir modelo All-Inclusive para Campinas e Rio.'
    }
  ];

  const severityStyle = (s: 'warning' | 'error' | 'success') => {
    if (s === 'warning') return { color: '#fbbf24', dot: '#fbbf24', bg: '#2d2010', border: '#78350f' };
    if (s === 'error')   return { color: '#f87171', dot: '#f87171', bg: '#2d1414', border: '#7f1d1d' };
    return                       { color: '#34d399', dot: '#34d399', bg: '#0f2d1e', border: '#064e3b' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Page Header */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 16, borderBottom: '1px solid #2d3340'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              backgroundColor: '#1e3a5f', color: '#60a5fa',
              border: '1px solid #1e4178', padding: '2px 8px', borderRadius: 4
            }}>
              Visão Executiva
            </span>
            <span style={{ fontSize: 11, color: '#6b7a94' }}>Consolidação LATAM</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
            Painel da Presidência
          </h1>
          <p style={{ fontSize: 12, color: '#6b7a94', margin: '4px 0 0' }}>
            Visão consolidada de operações, SLA e contratos
          </p>
        </div>

        <button
          onClick={() => setActiveView('intelligence')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 14px', borderRadius: 6,
            backgroundColor: '#1e3a5f', color: '#93c5fd',
            border: '1px solid #1e4178', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e4a7a')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1e3a5f')}
        >
          <Sparkles style={{ width: 14, height: 14, color: '#60a5fa' }} />
          <span>Inteligência Operacional</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <MetricCard
          title="Disponibilidade Frota"
          value="98.6%"
          change="+1.4% vs meta"
          isPositive={true}
          icon={<ShieldCheck style={{ width: 18, height: 18 }} />}
          subtitle="Meta: 98.0%"
        />
        <MetricCard
          title="Total de Chamados"
          value="1.248"
          change="-4.2% no mês"
          isPositive={true}
          icon={<PhoneCall style={{ width: 18, height: 18 }} />}
          subtitle="Taxa: 1.9 cham/eq"
        />
        <MetricCard
          title="SLA Médio Brasil"
          value="97.2%"
          change="+0.8 p.p."
          isPositive={true}
          icon={<Zap style={{ width: 18, height: 18 }} />}
          subtitle="TA médio: 18.2 min"
        />
        <MetricCard
          title="Equipamentos em Risco"
          value="42"
          change="320 em monitoramento"
          isPositive={false}
          icon={<AlertTriangle style={{ width: 18, height: 18 }} />}
          subtitle="Surto portas Gen2"
          badge="Atenção"
          onClick={() => setActiveView('maintenance')}
        />
        <MetricCard
          title="Margem dos Contratos"
          value="28.5%"
          change="8 contratos em atenção"
          isPositive={true}
          icon={<DollarSign style={{ width: 18, height: 18 }} />}
          subtitle="Receita: R$ 5.84M/mês"
          onClick={() => setActiveView('financial')}
        />
      </div>

      {/* Strategic Insights Panel */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles style={{ width: 14, height: 14, color: '#60a5fa' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#b0bac8' }}>
              Diagnósticos Estratégicos
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            backgroundColor: '#252930', color: '#6b7a94',
            border: '1px solid #2d3340', padding: '2px 8px', borderRadius: 4
          }}>
            Nível Presidência
          </span>
        </div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {strategicInsights.map((insight) => {
            const sty = severityStyle(insight.severity);
            const isExpanded = !!expandedInsights[insight.id];
            return (
              <div 
                key={insight.id}
                style={{ 
                  backgroundColor: '#1e2128', 
                  border: `1px solid ${isExpanded ? sty.border : '#2d3340'}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <button
                  id={`insight-toggle-${insight.id}`}
                  onClick={() => toggleInsight(insight.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', 
                    justifyContent: 'space-between', padding: '10px 12px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', gap: 8
                  }}
                  aria-expanded={isExpanded}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span style={{ 
                      width: 8, height: 8, borderRadius: '50%', 
                      backgroundColor: sty.dot, flexShrink: 0
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {insight.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: '#6b7a94' }}>{insight.tag}</span>
                    <ChevronDown style={{
                      width: 13, height: 13, color: '#6b7a94',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.15s ease'
                    }} />
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ 
                    padding: '0 12px 12px', 
                    borderTop: `1px solid #2d3340`,
                    marginTop: 0
                  }}>
                    <p style={{ fontSize: 12, color: '#9aa3b2', lineHeight: 1.5, margin: '10px 0 8px' }}>
                      {insight.explanation}
                    </p>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: sty.color,
                      backgroundColor: sty.bg, border: `1px solid ${sty.border}`,
                      borderRadius: 4, padding: '6px 10px', lineHeight: 1.4
                    }}>
                      → {insight.recommendation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Regional Comparison Panel */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin style={{ width: 14, height: 14, color: '#60a5fa' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#b0bac8' }}>
              Comparativo de Cidades & Polos
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa' }}>Drilldown</span>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
            gap: 8,
            maxHeight: 360, overflowY: 'auto' 
          }}>
            {REGIONAL_COMPARISON_DATA.map((reg) => (
              <div
                key={reg.city}
                id={`regional-card-${reg.city.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setSelectedCityFilter(reg.city);
                  setActiveView('reports');
                }}
                style={{
                  backgroundColor: '#1e2128',
                  border: '1px solid #2d3340',
                  borderRadius: 6,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#252930';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#1e2128';
                  e.currentTarget.style.borderColor = '#2d3340';
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <MapPin style={{ width: 12, height: 12, color: '#60a5fa', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                      {reg.city} ({reg.state})
                    </span>
                    {reg.failureRate > 2.5 && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                        backgroundColor: '#2d1414', color: '#f87171',
                        border: '1px solid #7f1d1d', padding: '1px 5px', borderRadius: 3
                      }}>
                        Alta Recorrência
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7a94', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reg.totalEquipments} equip. • {reg.monthlyCalls} cham./mês
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>
                    SLA {reg.slaRate}%
                  </div>
                  <div style={{ 
                    fontSize: 10, fontFamily: 'monospace',
                    color: reg.doorFailuresRate > 50 ? '#fbbf24' : '#6b7a94'
                  }}>
                    Portas: {reg.doorFailuresRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* LATAM Selector */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #252930' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7a94' }}>
                Expansão América Latina
              </span>
              <Globe2 style={{ width: 13, height: 13, color: '#60a5fa' }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {LATAM_REGIONS_DATA.map((lat) => (
                <button
                  key={lat.country}
                  id={`latam-btn-${lat.country.toLowerCase()}`}
                  onClick={() => setSelectedCountry(lat.country)}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 4,
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
                    backgroundColor: selectedCountry === lat.country ? '#1e3a5f' : '#1e2128',
                    color: selectedCountry === lat.country ? '#93c5fd' : '#6b7a94',
                    border: selectedCountry === lat.country ? '1px solid #1e4178' : '1px solid #2d3340'
                  }}
                >
                  {lat.country} ({lat.availability}%)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
