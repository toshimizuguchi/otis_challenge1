import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract } from '../../types';
import { MetricCard } from '../common/UIComponents';
import { EmptyState } from '../common/EmptyState';
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
  Wrench,
  Inbox
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
  const { contracts = [], setActiveView } = useApp();
  const [selectedContractId, setSelectedContractId] = useState<string>(contracts[0]?.id || '');

  const activeContract: Contract | undefined = contracts.find(c => c.id === selectedContractId) || contracts[0];

  // Agregações financeiras calculadas 100% dinamicamente dos contratos reais
  const totalRevenue = contracts.reduce((acc, c) => acc + (c.monthlyRevenue || 0), 0);
  const totalPartsCost = contracts.reduce((acc, c) => acc + (c.monthlyPartsCost || 0), 0);
  const totalLaborCost = contracts.reduce((acc, c) => acc + (c.monthlyTechLaborCost || 0), 0);
  const totalTravelCost = contracts.reduce((acc, c) => acc + (c.monthlyTravelCost || 0), 0);
  const totalOtherCost = contracts.reduce((acc, c) => acc + (c.monthlyOtherCost || 0), 0);
  const totalCost = totalPartsCost + totalLaborCost + totalTravelCost + totalOtherCost;
  const overallMarginRate = totalRevenue > 0 ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1) : '0.0';
  const contractsInAlert = contracts.filter(c => c.status === 'EM_RISCO' || (c.currentMarginRate || 0) < 20);

  const costBreakdownData = [
    { name: 'Horas Técnicas', value: totalLaborCost, color: '#06b6d4' },
    { name: 'Peças & Componentes', value: totalPartsCost, color: '#f59e0b' },
    { name: 'Deslocamento & Frota', value: totalTravelCost, color: '#8b5cf6' },
    { name: 'Custos Indiretos', value: totalOtherCost, color: '#64748b' }
  ].filter(item => item.value > 0);

  const contractComparisonData = contracts.map(c => ({
    name: c.customerName.split(' ')[0],
    receita: Number(((c.monthlyRevenue || 0) / 1000).toFixed(1)),
    custo: Number((((c.monthlyPartsCost || 0) + (c.monthlyTechLaborCost || 0) + (c.monthlyTravelCost || 0) + (c.monthlyOtherCost || 0)) / 1000).toFixed(1)),
    margem: c.currentMarginRate || 0
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Unificado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Controladoria & Margens
            </span>
            <span className="text-xs text-slate-400 font-mono">DRE & Gestão de Custos Operacionais</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Gestão Financeira, Custos & Rentabilidade
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Demonstrativo financeiro integrado: receita contratual, peças, horas técnicas, deslocamento e margens operacionais.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
            Ver Contratos ({contracts.length})
          </button>
        </div>
      </div>

      {contracts.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="Nenhum dado financeiro ou contrato cadastrado"
          description="Não existem contratos na base para calcular receitas, despesas operacionais ou margens de rentabilidade."
          action={{
            label: 'Importar Base de Dados',
            onClick: () => setActiveView('import')
          }}
        />
      ) : (
        <>
          {/* Financial KPIs Calculados dos Dados Reais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Receita Mensal Contratos"
              value={`R$ ${(totalRevenue / 1000).toFixed(1)}k`}
              icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
              subtitle={`${contracts.length} contrato(s) ativo(s)`}
            />
            <MetricCard
              title="Custos Operacionais"
              value={`R$ ${(totalCost / 1000).toFixed(1)}k`}
              icon={<TrendingDown className="w-5 h-5 text-amber-400" />}
              subtitle={`Peças: R$ ${(totalPartsCost / 1000).toFixed(0)}k • Horas: R$ ${(totalLaborCost / 1000).toFixed(0)}k`}
            />
            <MetricCard
              title="Margem Média da Base"
              value={`${overallMarginRate}%`}
              isPositive={Number(overallMarginRate) >= 25}
              icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
              subtitle={`Lucro Op: R$ ${((totalRevenue - totalCost) / 1000).toFixed(1)}k`}
            />
            <MetricCard
              title="Contratos em Atenção"
              value={contractsInAlert.length}
              subtitle={contractsInAlert.length > 0 ? `${contractsInAlert.length} contrato(s) com margem crítica (< 20%)` : 'Todos os contratos operando na meta'}
              isPositive={contractsInAlert.length === 0}
              icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
              badge={contractsInAlert.length > 0 ? 'Ação Necessária' : 'Saudável'}
            />
          </div>

          {/* DRE & Diagnóstico Causal por Contrato */}
          {activeContract && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-700/40 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">DRE & Diagnóstico Financeiro do Contrato</h3>
                    <p className="text-xs text-slate-400">Detalhamento dos custos diretos e margem operacional por cliente</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Contrato:</span>
                  <select
                    value={selectedContractId}
                    onChange={(e) => setSelectedContractId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 font-medium max-w-[280px] truncate"
                  >
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName} ({c.currentMarginRate}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DRE Breakdown Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                
                {/* Tabela Financeira do Contrato */}
                <div className="md:col-span-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{activeContract.customerName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      activeContract.status === 'EM_RISCO' || (activeContract.currentMarginRate || 0) < 20 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {activeContract.status === 'EM_RISCO' || (activeContract.currentMarginRate || 0) < 20 ? 'Margem Crítica' : 'Margem Saudável'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Receita Mensal:</span>
                      <span className="font-mono font-bold text-slate-100">R$ {(activeContract.monthlyRevenue || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Peças & Reposições:</span>
                      <span className="font-mono text-amber-400">- R$ {(activeContract.monthlyPartsCost || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Horas Técnicas (Mão de Obra):</span>
                      <span className="font-mono text-cyan-400">- R$ {(activeContract.monthlyTechLaborCost || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Deslocamento & Frota:</span>
                      <span className="font-mono text-slate-300">- R$ {(activeContract.monthlyTravelCost || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    {(activeContract.monthlyOtherCost || 0) > 0 && (
                      <div className="flex justify-between text-slate-400">
                        <span>Outros Custos:</span>
                        <span className="font-mono text-slate-300">- R$ {(activeContract.monthlyOtherCost || 0).toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-100">
                      <span>Margem Operacional:</span>
                      <span className={`font-mono ${(activeContract.currentMarginRate || 0) < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {activeContract.currentMarginRate || 0}% (Meta: {activeContract.baselineMarginRate || 28}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Parecer do Contrato */}
                <div className="md:col-span-7 p-4 rounded-xl bg-slate-950/80 border border-indigo-800/40 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                      Diagnóstico Operacional do Contrato
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {activeContract.aiFinancialDiagnosis || activeContract.marginDropAlert || 'Contrato com execução financeira em conformidade com o planejado.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                      Recomendação de Gestão:
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {activeContract.status === 'EM_RISCO' || (activeContract.currentMarginRate || 0) < 20
                        ? 'Priorizar substituição de componentes de desgaste acelerado antes do próximo ciclo de falhas e auditar rotas para conter despesas de deslocamento.'
                        : 'Manter rotina de inspeção preditiva preventiva para preservar a estabilidade da margem operacional.'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Gráficos Reais: Receita vs Custos e Composição */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gráfico de Barras: Comparativo por Contrato */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Receita vs Custo Operacional por Cliente (R$ Mil)</h3>
                <p className="text-xs text-slate-400">Valores consolidados dos contratos cadastrados</p>
              </div>

              {contractComparisonData.length === 0 ? (
                <EmptyState title="Sem dados comparativos" compact />
              ) : (
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
              )}
            </div>

            {/* Gráfico de Rosca: Composição de Custos */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Composição dos Custos Operacionais</h3>
                <p className="text-xs text-slate-400">Distribuição total das despesas de campo</p>
              </div>

              {costBreakdownData.length === 0 ? (
                <EmptyState title="Sem custos registrados" compact />
              ) : (
                <>
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
                          formatter={(val: any) => `R$ ${(Number(val) / 1000).toFixed(1)}k`}
                          contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {costBreakdownData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-400 truncate">{item.name}:</span>
                        <span className="font-mono font-bold text-slate-200">R$ {(item.value / 1000).toFixed(0)}k</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
};
