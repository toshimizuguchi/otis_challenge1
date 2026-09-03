import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract } from '../../types';
import { MetricCard } from '../common/UIComponents';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  PieChart as PieIcon, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Wrench
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const FinancialDashboard: React.FC = () => {
  const { contracts, equipments, setActiveView } = useApp();
  const [selectedContractId, setSelectedContractId] = useState<string>(contracts[0]?.id || '');

  const activeContract: Contract = contracts.find(c => c.id === selectedContractId) || contracts[0] || {
    id: 'default',
    contractNumber: 'CTR-000',
    customerId: 'cust-default',
    customerName: 'Cliente Corporativo',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    monthlyValue: 15000,
    slaRequiredRate: 98,
    type: 'PREMIUM_ALL_INCLUSIVE' as const,
    equipmentsCount: 4,
    monthlyRevenue: 15000,
    monthlyPartsCost: 1200,
    monthlyTechLaborCost: 2000,
    monthlyTravelCost: 400,
    monthlyOtherCost: 300,
    baselineMarginRate: 35,
    currentMarginRate: 35,
    status: 'ATIVO' as const,
    aiFinancialDiagnosis: 'Operação financeira normalizada.'
  };

  // Financial aggregates
  const totalRevenue = contracts.reduce((acc, c) => acc + (c.monthlyRevenue || 0), 0);
  const totalPartsCost = contracts.reduce((acc, c) => acc + (c.monthlyPartsCost || 0), 0);
  const totalLaborCost = contracts.reduce((acc, c) => acc + (c.monthlyTechLaborCost || 0), 0);
  const totalTravelCost = contracts.reduce((acc, c) => acc + (c.monthlyTravelCost || 0), 0);
  const totalOtherCost = contracts.reduce((acc, c) => acc + (c.monthlyOtherCost || 0), 0);
  const totalCost = totalPartsCost + totalLaborCost + totalTravelCost + totalOtherCost;
  const overallMarginRate = totalRevenue > 0 ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1) : '0.0';

  const costBreakdownData = [
    { name: 'Horas Técnicas', value: totalLaborCost, color: '#06b6d4' },
    { name: 'Peças & Componentes', value: totalPartsCost, color: '#f59e0b' },
    { name: 'Deslocamento & Frota', value: totalTravelCost, color: '#8b5cf6' },
    { name: 'Custos Indiretos', value: totalOtherCost, color: '#64748b' }
  ];

  const contractComparisonData = contracts.map(c => ({
    name: c.customerName.split(' ')[0],
    receita: c.monthlyRevenue / 1000,
    custo: (c.monthlyPartsCost + c.monthlyTechLaborCost + c.monthlyTravelCost + c.monthlyOtherCost) / 1000,
    margem: c.currentMarginRate
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Controladoria & Rentabilidade de Contratos
            </span>
            <span className="text-xs text-slate-400 font-mono">DRE Operacional em Tempo Real</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Gestão Financeira & Análise de Margens
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Cruzamento entre horas técnicas, consumo de peças, deslocamento e rentabilidade contratual.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('employees')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Folha & Bônus de Funcionários</span>
          </button>
          <button
            onClick={() => setActiveView('contracts')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Ver Todos os Contratos ({contracts.length})
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita Mensal Contratos"
          value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`}
          change="+3.8% vs trimestre"
          isPositive={true}
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          subtitle="5 grandes contas ativas"
        />
        <MetricCard
          title="Custos Operacionais"
          value={`R$ ${(totalCost / 1000).toFixed(0)}k`}
          change="Peças: R$ 133k"
          isPositive={false}
          icon={<TrendingDown className="w-5 h-5 text-amber-400" />}
          subtitle="Horas Técnicas: R$ 212k"
        />
        <MetricCard
          title="Margem Média da Base"
          value={`${overallMarginRate}%`}
          change="Meta corporativa: > 28.0%"
          isPositive={true}
          icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
          subtitle={`Lucro Op: R$ ${((totalRevenue - totalCost) / 1000).toFixed(0)}k`}
        />
        <MetricCard
          title="Contratos em Atenção"
          value={contracts.filter(c => c.status === 'EM_RISCO').length}
          subtitle="Queda > 5 p.p. na margem"
          isPositive={false}
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          badge="Ação da IA"
        />
      </div>

      {/* Contract Deep-Dive & AI Root Cause Diagnosis */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-700/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">SmartFlow AI — Diagnóstico Causal de Queda de Margem</h3>
              <p className="text-xs text-slate-400">A IA identifica o motivo exato pelo qual o contrato está perdendo rentabilidade</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Selecione o Contrato:</span>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 font-medium"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerName} ({c.currentMarginRate}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
          
          <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{activeContract.customerName}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                activeContract.status === 'EM_RISCO' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {activeContract.status === 'EM_RISCO' ? 'Margem Crítica' : 'Margem Saudável'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-slate-300">
                <span>Receita Mensal:</span>
                <span className="font-mono font-bold text-slate-100">R$ {(activeContract.monthlyRevenue ?? 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Peças & Reposições:</span>
                <span className="font-mono text-amber-400">- R$ {(activeContract.monthlyPartsCost ?? 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Horas Técnicas (Mão de Obra):</span>
                <span className="font-mono text-cyan-400">- R$ {(activeContract.monthlyTechLaborCost ?? 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Deslocamento & Combustível:</span>
                <span className="font-mono text-slate-300">- R$ {(activeContract.monthlyTravelCost ?? 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Outros Custos:</span>
                <span className="font-mono text-slate-300">- R$ {(activeContract.monthlyOtherCost ?? 0).toLocaleString('pt-BR')}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-100">
                <span>Margem Operacional Atual:</span>
                <span className={`font-mono ${(activeContract.currentMarginRate ?? 0) < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {activeContract.currentMarginRate ?? 0}% (Meta: {activeContract.baselineMarginRate ?? 0}%)
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 p-4 rounded-xl bg-slate-950/80 border border-indigo-800/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Diagnóstico Prescritivo da IA
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {activeContract.aiFinancialDiagnosis || activeContract.marginDropAlert || 'Contrato operando dentro dos parâmetros de rentabilidade planejados.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                Ação Corretiva Recomendada:
              </span>
              <p className="text-[11px] text-slate-400">
                {activeContract.status === 'EM_RISCO'
                  ? 'Substituir componentes de desgaste antes do próximo ciclo corretivo e otimizar despacho de técnicos para estancar custos de deslocamento redundante.'
                  : 'Manter rotina de inspeção preditiva via telemetria ReGen para preservar rentabilidade de 40%+.'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Visual Analytics: Cost Breakdown Pie + Comparison Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Revenue vs Cost Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Receita vs Custo Operacional por Cliente (R$ Mil)</h3>
              <p className="text-xs text-slate-400">Comparativo das 5 maiores contas corporativas</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="receita" name="Receita (R$k)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custo" name="Custo Total (R$k)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Cost Structure Doughnut */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Composição dos Custos Operacionais</h3>
              <p className="text-xs text-slate-400">Distribuição total das despesas de campo</p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => `R$ ${(val / 1000).toFixed(1)}k`}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {costBreakdownData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 truncate">{item.name}:</span>
                <span className="font-mono font-bold text-slate-200">R$ {(item.value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
