import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/UIComponents';
import { EmptyState } from '../common/EmptyState';
import { 
  ShieldCheck, 
  PhoneCall, 
  AlertTriangle, 
  DollarSign, 
  Globe2, 
  Sparkles, 
  MapPin,
  ChevronDown,
  Zap,
  CheckCircle2,
  Clock,
  TrendingDown,
  ChevronUp,
  ArrowUpRight
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
  const { equipments, calls, contracts, parts, employees, alerts, setActiveView, setSelectedCityFilter } = useApp();
  const [selectedCountry, setSelectedCountry] = useState<string>('Brasil');
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  const toggleInsight = (id: string) => {
    setExpandedInsights(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Real calculations based on active dataset
  const totalEquipments = equipments.length;
  const operationalEquipments = equipments.filter(e => e.status === 'OPERACIONAL').length;
  const availabilityPct = totalEquipments > 0 
    ? ((operationalEquipments / totalEquipments) * 100).toFixed(1) + '%'
    : '0%';

  const totalCalls = calls.length;
  const openCalls = calls.filter(c => c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO').length;
  const callsWithinSLA = calls.filter(c => c.status === 'CONCLUIDO' || c.priority !== 'CRITICO').length;
  const slaRate = totalCalls > 0 
    ? ((callsWithinSLA / totalCalls) * 100).toFixed(1) + '%'
    : '100%';

  const riskEquipments = equipments.filter(
    e => e.riskLevel === 'ALTO' || e.riskLevel === 'CRITICO' || (e.predictiveRiskScore !== undefined && e.predictiveRiskScore >= 50)
  ).length;

  const totalContractRevenue = contracts.reduce((acc, c) => acc + (c.monthlyRevenue || 0), 0);
  const weightedMargin = totalContractRevenue > 0
    ? (contracts.reduce((acc, c) => acc + ((c.monthlyRevenue || 0) * (c.currentMarginRate || 0)), 0) / totalContractRevenue).toFixed(1) + '%'
    : '0%';

  const lowMarginContractsCount = contracts.filter(c => (c.currentMarginRate || 0) < 20).length;

  // Alertas ativos do motor SmartFlow IA
  const dynamicAlerts = useMemo(() => {
    return alerts.filter(a => a.status === 'ATIVO');
  }, [alerts]);

  // Cities aggregated dynamically from real equipments and calls
  const regionalCities = useMemo(() => {
    const cityMap: Record<string, {
      city: string;
      state: string;
      totalEquipments: number;
      monthlyCalls: number;
      doorFailuresRate: number;
      slaRate: number;
      highRiskCount: number;
    }> = {};

    equipments.forEach(eq => {
      const cName = eq.city || 'Outros';
      if (!cityMap[cName]) {
        cityMap[cName] = {
          city: cName,
          state: eq.state || 'BR',
          totalEquipments: 0,
          monthlyCalls: 0,
          doorFailuresRate: 0,
          slaRate: 100,
          highRiskCount: 0
        };
      }
      cityMap[cName].totalEquipments += 1;
      if (eq.riskLevel === 'ALTO' || eq.riskLevel === 'CRITICO' || (eq.predictiveRiskScore || 0) >= 50) {
        cityMap[cName].highRiskCount += 1;
      }
    });

    calls.forEach(call => {
      const cName = call.city || 'Outros';
      if (!cityMap[cName]) {
        cityMap[cName] = {
          city: cName,
          state: 'BR',
          totalEquipments: 0,
          monthlyCalls: 0,
          doorFailuresRate: 0,
          slaRate: 100,
          highRiskCount: 0
        };
      }
      cityMap[cName].monthlyCalls += 1;
    });

    Object.values(cityMap).forEach(c => {
      const cityCalls = calls.filter(call => call.city === c.city);
      if (cityCalls.length > 0) {
        const doorCalls = cityCalls.filter(call => 
          (call.subComponent || '').toLowerCase().includes('porta') || 
          (call.problemDescription || '').toLowerCase().includes('porta')
        ).length;
        c.doorFailuresRate = Math.round((doorCalls / cityCalls.length) * 100);
        const withinSLA = cityCalls.filter(call => call.status === 'CONCLUIDO' || call.priority !== 'CRITICO').length;
        c.slaRate = parseFloat(((withinSLA / cityCalls.length) * 100).toFixed(1));
      } else {
        c.doorFailuresRate = 0;
        c.slaRate = 100;
      }
    });

    return Object.values(cityMap).sort((a, b) => b.totalEquipments - a.totalEquipments);
  }, [equipments, calls]);

  // Real countries from equipments
  const activeCountries = useMemo(() => {
    const list = Array.from(new Set(equipments.map(e => e.country || 'Brasil')));
    if (list.length === 0) return ['Brasil'];
    return list;
  }, [equipments]);

  const severityStyle = (s: string) => {
    if (s === 'CRITICO' || s === 'ALTO') {
      return { color: '#f87171', dot: '#f87171', bg: '#2d1414', border: '#7f1d1d' };
    }
    if (s === 'MEDIO') {
      return { color: '#fbbf24', dot: '#fbbf24', bg: '#2d2010', border: '#78350f' };
    }
    return { color: '#34d399', dot: '#34d399', bg: '#0f2d1e', border: '#064e3b' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Page Header */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 16, borderBottom: '1px solid #2d3340', flexWrap: 'wrap', gap: 12
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
            <span style={{ fontSize: 11, color: '#6b7a94' }}>Consolidação Corporativa Real</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
            Painel da Presidência
          </h1>
          <p style={{ fontSize: 12, color: '#6b7a94', margin: '4px 0 0' }}>
            Visão consolidada de operações, SLA e contratos com base nos dados reais do sistema
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
          <span>SmartFlow IA & Alertas ({dynamicAlerts.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <MetricCard
          title="Disponibilidade Frota"
          value={availabilityPct}
          change={totalEquipments > 0 ? `${operationalEquipments} de ${totalEquipments} operacionais` : 'Sem dados'}
          isPositive={operationalEquipments === totalEquipments}
          icon={<ShieldCheck style={{ width: 18, height: 18 }} />}
          subtitle={`${totalEquipments} equipamentos cadastrados`}
        />
        <MetricCard
          title="Total de Chamados"
          value={totalCalls.toString()}
          change={openCalls > 0 ? `${openCalls} em atendimento` : 'Nenhum pendente'}
          isPositive={openCalls === 0}
          icon={<PhoneCall style={{ width: 18, height: 18 }} />}
          subtitle={`${totalCalls} registrados`}
        />
        <MetricCard
          title="SLA Médio Real"
          value={slaRate}
          change={totalCalls > 0 ? `${callsWithinSLA} cumpridos` : 'Sem chamados'}
          isPositive={parseFloat(slaRate) >= 95}
          icon={<Zap style={{ width: 18, height: 18 }} />}
          subtitle="Taxa de cumprimento"
        />
        <MetricCard
          title="Equipamentos em Risco"
          value={riskEquipments.toString()}
          change={riskEquipments > 0 ? 'Monitoramento ativo' : 'Operação estável'}
          isPositive={riskEquipments === 0}
          icon={<AlertTriangle style={{ width: 18, height: 18 }} />}
          subtitle="Risco Alto ou Crítico"
          badge={riskEquipments > 0 ? "Atenção" : undefined}
          onClick={() => setActiveView('maintenance')}
        />
        <MetricCard
          title="Margem dos Contratos"
          value={weightedMargin}
          change={lowMarginContractsCount > 0 ? `${lowMarginContractsCount} contrato(s) < 20%` : 'Margens saudáveis'}
          isPositive={lowMarginContractsCount === 0}
          icon={<DollarSign style={{ width: 18, height: 18 }} />}
          subtitle={`Receita: R$ ${(totalContractRevenue / 1000).toFixed(1)}k/mês`}
          onClick={() => setActiveView('financial')}
        />
      </div>

      {/* Strategic Insights Panel (Integrated with SmartFlow IA Real Data) */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles style={{ width: 14, height: 14, color: '#60a5fa' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#b0bac8' }}>
              Diagnósticos Estratégicos — SmartFlow IA
            </span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            backgroundColor: '#252930', color: '#6b7a94',
            border: '1px solid #2d3340', padding: '2px 8px', borderRadius: 4
          }}>
            {dynamicAlerts.length} Diagnóstico(s) Ativo(s)
          </span>
        </div>

        <div style={{ padding: 16 }}>
          {dynamicAlerts.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nenhuma anomalia ou risco detectado"
              description="O mecanismo SmartFlow IA analisou todos os contratos, chamados e equipamentos cadastrados e não identificou inconsistências ou desvios no momento."
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
              {dynamicAlerts.slice(0, 6).map((alert) => {
                const sty = severityStyle(alert.severity);
                const isExpanded = !!expandedInsights[alert.id];
                return (
                  <div 
                    key={alert.id}
                    style={{ 
                      backgroundColor: '#1e2128', 
                      border: `1px solid ${isExpanded ? sty.border : '#2d3340'}`,
                      borderRadius: 6,
                      overflow: 'hidden',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <button
                      id={`insight-toggle-${alert.id}`}
                      onClick={() => toggleInsight(alert.id)}
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
                          {alert.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: '#6b7a94', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {alert.originInfo}
                        </span>
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
                          {alert.title}
                        </p>
                        <div style={{
                          fontSize: 11, fontWeight: 600, color: sty.color,
                          backgroundColor: sty.bg, border: `1px solid ${sty.border}`,
                          borderRadius: 4, padding: '6px 10px', lineHeight: 1.4, marginBottom: 8
                        }}>
                          → Diagnóstico IA: {alert.reason}
                        </div>
                        {alert.actionView && (
                          <button
                            onClick={() => setActiveView(alert.actionView!)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, color: '#60a5fa', background: 'none',
                              border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600
                            }}
                          >
                            <span>{alert.actionLabel || 'Acessar dados relacionados'}</span>
                            <ArrowUpRight style={{ width: 12, height: 12 }} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Regional Comparison Panel based on Real System Data */}
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin style={{ width: 14, height: 14, color: '#60a5fa' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#b0bac8' }}>
              Comparativo Real de Cidades & Polos Ativos
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa' }}>{regionalCities.length} Cidades Cadastradas</span>
        </div>

        <div style={{ padding: 16 }}>
          {regionalCities.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Sem dados territoriais disponíveis"
              description="Nenhum equipamento ou chamado georreferenciado encontrado no sistema."
            />
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
              gap: 8,
              maxHeight: 360, overflowY: 'auto' 
            }}>
              {regionalCities.map((reg) => (
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
                      {reg.highRiskCount > 0 && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                          backgroundColor: '#2d1414', color: '#f87171',
                          border: '1px solid #7f1d1d', padding: '1px 5px', borderRadius: 3
                        }}>
                          {reg.highRiskCount} em Risco
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7a94', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {reg.totalEquipments} equip. • {reg.monthlyCalls} chamados
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>
                      SLA {reg.slaRate}%
                    </div>
                    <div style={{ 
                      fontSize: 10, fontFamily: 'monospace',
                      color: reg.doorFailuresRate > 40 ? '#fbbf24' : '#6b7a94'
                    }}>
                      Portas: {reg.doorFailuresRate}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Praças de Atuação Cadastradas */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #252930' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7a94' }}>
                Praças de Operação com Equipamentos Ativos
              </span>
              <Globe2 style={{ width: 13, height: 13, color: '#60a5fa' }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {activeCountries.map((c) => (
                <button
                  key={c}
                  id={`country-btn-${c.toLowerCase()}`}
                  onClick={() => setSelectedCountry(c)}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 4,
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
                    backgroundColor: selectedCountry === c ? '#1e3a5f' : '#1e2128',
                    color: selectedCountry === c ? '#93c5fd' : '#6b7a94',
                    border: selectedCountry === c ? '1px solid #1e4178' : '1px solid #2d3340'
                  }}
                >
                  {c} ({totalEquipments} equip. ativos)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
