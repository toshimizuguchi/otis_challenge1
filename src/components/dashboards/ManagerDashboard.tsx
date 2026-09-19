import React from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/UIComponents';
import { EmptyState } from '../common/EmptyState';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  ChevronRight,
  Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ManagerDashboard: React.FC = () => {
  const { supervisors, managers, contracts, calls, setActiveView } = useApp();

  const currentManager = managers[0] || {
    name: 'Gerente Regional',
    region: 'Sudeste',
    techniciansTotal: 0,
    globalSLA: 100,
    marginRate: 0
  };

  // Compute real financial totals from active contracts
  const totalRevenue = contracts.reduce((acc, c) => acc + (c.contractValue || 0), 0);
  const totalCost = contracts.reduce((acc, c) => acc + ((c.contractValue || 0) * (1 - (c.marginPercent || 0) / 100)), 0);
  const calculatedMargin = totalRevenue > 0 
    ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1)
    : (currentManager.marginRate || 0).toString();

  // Compute real SLA from calls if available
  const callsWithinSLA = calls.filter(c => !c.slaBreached).length;
  const computedSLA = calls.length > 0 
    ? ((callsWithinSLA / calls.length) * 100).toFixed(1)
    : (currentManager.globalSLA || 100).toString();

  const supervisorChartData = supervisors.map(s => ({
    name: s.name.split(' ')[0],
    sla: s.slaRate,
    margem: s.contractsMarginRate,
    chamados: s.activeCallsCount
  }));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-900 px-2 py-0.5 rounded">
              Visão Gerencial Regional
            </span>
            <span className="text-xs text-slate-400 font-mono">{currentManager.region}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white m-0">Painel Gerencial</h1>
          <p className="text-xs text-slate-400 mt-1">Supervisores, rentabilidade real e produtividade regional</p>
        </div>
        <button
          onClick={() => setActiveView('supervisors')}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Ver Supervisores</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          title="Supervisores Ativos"
          value={supervisors.length}
          subtitle={`${currentManager.techniciansTotal || 0} técnicos no polo`}
          icon={<Users className="w-5 h-5 text-cyan-400" />}
        />
        <MetricCard
          title="SLA Consolidado"
          value={`${computedSLA}%`}
          change={calls.length > 0 ? `${callsWithinSLA} de ${calls.length} atendidos no prazo` : 'Sem chamados'}
          isPositive={parseFloat(computedSLA) >= 95}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Receita da Praça"
          value={totalRevenue > 0 ? `R$ ${(totalRevenue / 1000).toFixed(1)}k` : 'R$ 0'}
          subtitle={totalCost > 0 ? `Custo: R$ ${(totalCost / 1000).toFixed(1)}k` : 'Sem custos apurados'}
          icon={<DollarSign className="w-5 h-5 text-indigo-400" />}
        />
        <MetricCard
          title="Margem Operacional"
          value={`${calculatedMargin}%`}
          change={`${contracts.length} contratos vigentes`}
          isPositive={parseFloat(calculatedMargin) >= 25}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Main Grid: Responsive 1-col on mobile/tablet, 12-col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Supervisor Performance Chart */}
        <div className="lg:col-span-7 bg-[#242830] border border-[#2d3340] rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1e2128] border-b border-[#2d3340]">
            <div>
              <h3 className="text-xs font-bold text-slate-200 m-0">Performance por Supervisor de Polo</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">SLA (%) vs Margem Contratual (%)</p>
            </div>
            <span className="text-xs text-blue-400 font-semibold">{currentManager.region}</span>
          </div>

          <div className="p-4 h-64 sm:h-72">
            {supervisorChartData.length === 0 ? (
              <EmptyState
                title="Sem supervisores cadastrados"
                description="Nenhum supervisor ativo encontrado nesta regional."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supervisorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3340" vertical={false} />
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
            )}
          </div>
        </div>

        {/* Supervisor Ranking */}
        <div className="lg:col-span-5 bg-[#242830] border border-[#2d3340] rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1e2128] border-b border-[#2d3340]">
            <div>
              <h3 className="text-xs font-bold text-slate-200 m-0">Supervisores Ativos</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">SLA, produtividade e agilidade</p>
            </div>
            <button
              onClick={() => setActiveView('supervisors')}
              className="text-xs text-blue-400 font-semibold bg-transparent border-0 cursor-pointer flex items-center gap-1"
            >
              <span>Ver Todos</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3 flex flex-col gap-2 overflow-y-auto max-h-80">
            {supervisors.length === 0 ? (
              <EmptyState
                title="Sem supervisores"
                description="Nenhum registro de supervisor disponível."
              />
            ) : (
              supervisors.map((sup, idx) => (
                <div
                  key={sup.id}
                  onClick={() => setActiveView('supervisors')}
                  className="p-3 bg-[#1e2128] border border-[#2d3340] hover:border-blue-500/40 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0 
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{sup.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{sup.city} • {sup.techniciansCount} técnicos</div>
                      {sup.recentTrendAlert && (
                        <div className="text-[10px] text-amber-400 mt-0.5 truncate">⚠ {sup.recentTrendAlert}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-blue-300 font-mono">SLA {sup.slaRate}%</div>
                    <div className="text-[11px] text-emerald-400 font-mono">Margem: {sup.contractsMarginRate}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
