import React from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/UIComponents';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  ChevronRight,
  Sparkles,
  Building2,
  Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ManagerDashboard: React.FC = () => {
  const { supervisors, managers, setActiveView, setSelectedCityFilter } = useApp();

  const currentManager = managers[0];

  const supervisorChartData = supervisors.map(s => ({
    name: s.name.split(' ')[0],
    sla: s.slaRate,
    margem: s.contractsMarginRate,
    chamados: s.activeCallsCount
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #2d3340' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #1e4178', padding: '2px 8px', borderRadius: 4 }}>
              Visão Gerencial Regional
            </span>
            <span style={{ fontSize: 11, color: '#6b7a94' }}>{currentManager.region}</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Painel Gerencial</h1>
          <p style={{ fontSize: 12, color: '#6b7a94', margin: '4px 0 0' }}>Ranking de supervisores, rentabilidade e produtividade regional</p>
        </div>
        <button
          onClick={() => setActiveView('supervisors')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 6, backgroundColor: '#252930', color: '#b0bac8', border: '1px solid #2d3340', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e3a5f')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#252930')}
        >
          <Award style={{ width: 14, height: 14, color: '#fbbf24' }} />
          <span>Ver Ranking Completo</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Supervisores Ativos"
          value={supervisors.length}
          subtitle={`${currentManager.techniciansTotal} técnicos no Sudeste`}
          icon={<Users className="w-5 h-5 text-cyan-400" />}
        />
        <MetricCard
          title="SLA Consolidado"
          value={`${currentManager.globalSLA}%`}
          change="+0.5% vs mês anterior"
          isPositive={true}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Receita Regional"
          value="R$ 1.48M"
          subtitle="Custo: R$ 1.06M"
          icon={<DollarSign className="w-5 h-5 text-indigo-400" />}
        />
        <MetricCard
          title="Margem Operacional"
          value={`${currentManager.marginRate}%`}
          change="Meta: > 28.0%"
          isPositive={true}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}>
        
        {/* Supervisor Performance Chart */}
        <div style={{ gridColumn: 'span 7', backgroundColor: '#242830', border: '1px solid #2d3340', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#1e2128', borderBottom: '1px solid #2d3340' }}>
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#b0bac8', margin: 0 }}>Performance por Supervisor de Polo</h3>
              <p style={{ fontSize: 11, color: '#6b7a94', margin: '3px 0 0' }}>SLA (%) vs Margem Contratual (%)</p>
            </div>
            <span style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600 }}>Polo Sudeste</span>
          </div>

          <div style={{ padding: 16, height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supervisorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3340" />
                <XAxis dataKey="name" stroke="#4a5568" tick={{ fontSize: 11, fill: '#6b7a94' }} />
                <YAxis domain={[0, 100]} stroke="#4a5568" tick={{ fontSize: 11, fill: '#6b7a94' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e2128', borderColor: '#2d3340', borderRadius: 6, fontSize: '12px', color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#9aa3b2' }} />
                <Bar dataKey="sla" name="SLA (%)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="margem" name="Margem (%)" fill="#34d399" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supervisor Ranking */}
        <div style={{ gridColumn: 'span 5', backgroundColor: '#242830', border: '1px solid #2d3340', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#1e2128', borderBottom: '1px solid #2d3340' }}>
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#b0bac8', margin: 0 }}>Ranking dos Supervisores</h3>
              <p style={{ fontSize: 11, color: '#6b7a94', margin: '3px 0 0' }}>SLA, produtividade e agilidade</p>
            </div>
            <button
              onClick={() => setActiveView('supervisors')}
              style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
            >
              Ver Todos <ChevronRight style={{ width: 12, height: 12 }} />
            </button>
          </div>

          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {supervisors.map((sup, idx) => (
              <div
                key={sup.id}
                onClick={() => setActiveView('supervisors')}
                style={{ padding: '10px 12px', backgroundColor: '#1e2128', border: '1px solid #2d3340', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#252930'; e.currentTarget.style.borderColor = '#3a4255'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1e2128'; e.currentTarget.style.borderColor = '#2d3340'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    backgroundColor: idx === 0 ? '#2d2010' : '#252930',
                    color: idx === 0 ? '#fbbf24' : '#6b7a94',
                    border: idx === 0 ? '1px solid #78350f' : '1px solid #2d3340',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{sup.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7a94' }}>{sup.city} • {sup.techniciansCount} técnicos</div>
                    {sup.recentTrendAlert && (
                      <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 2 }}>⚠ {sup.recentTrendAlert}</div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#93c5fd', fontFamily: 'monospace' }}>SLA {sup.slaRate}%</div>
                  <div style={{ fontSize: 11, color: '#34d399', fontFamily: 'monospace' }}>Margem: {sup.contractsMarginRate}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
