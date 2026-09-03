import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Manager } from '../../types';
import { 
  Users, 
  Award, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Building2, 
  Wrench, 
  MessageSquare, 
  FileCheck, 
  ChevronRight, 
  SlidersHorizontal,
  BrainCircuit,
  Star,
  ShieldCheck,
  Download,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export const ManagersPerformanceModule: React.FC = () => {
  const { managers, setSelectedCityFilter, setActiveView } = useApp();
  const [selectedSort, setSelectedSort] = useState<'SCORE' | 'MARGEM' | 'RECEITA' | 'SLA' | 'NPS'>('SCORE');
  const [selectedManagerForDirective, setSelectedManagerForDirective] = useState<Manager | null>(null);
  const [directiveType, setDirectiveType] = useState<'META' | 'ELOGIO' | 'ALERTA' | 'EXPANSAO'>('META');
  const [directiveText, setDirectiveText] = useState<string>('');
  const [directiveSuccessMessage, setDirectiveSuccessMessage] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<boolean>(false);

  // Calculate an overall performance score (0-100) for each manager
  const rankedManagers = useMemo(() => {
    return managers.map(mgr => {
      const marginWeight = (mgr.marginRate / 35) * 35; // max ~35 pts
      const slaWeight = ((mgr.globalSLA - 90) / 10) * 30; // max ~30 pts
      const targetWeight = ((mgr.targetAchievement || 100) / 110) * 20; // max ~20 pts
      const npsWeight = ((mgr.npsScore || 90) / 100) * 15; // max ~15 pts
      const overallScore = Math.min(100, Math.max(0, Math.round(marginWeight + slaWeight + targetWeight + npsWeight)));

      return {
        ...mgr,
        overallScore
      };
    }).sort((a, b) => {
      if (selectedSort === 'SCORE') return b.overallScore - a.overallScore;
      if (selectedSort === 'MARGEM') return b.marginRate - a.marginRate;
      if (selectedSort === 'RECEITA') return b.monthlyRevenue - a.monthlyRevenue;
      if (selectedSort === 'SLA') return b.globalSLA - a.globalSLA;
      if (selectedSort === 'NPS') return (b.npsScore || 0) - (a.npsScore || 0);
      return 0;
    });
  }, [managers, selectedSort]);

  // Aggregate Executive KPIs
  const totalRevenue = managers.reduce((acc, m) => acc + m.monthlyRevenue, 0);
  const totalCost = managers.reduce((acc, m) => acc + m.monthlyCost, 0);
  const totalMargin = (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1);
  const avgSLA = (managers.reduce((acc, m) => acc + m.globalSLA, 0) / managers.length).toFixed(1);
  const totalEquipmentsManaged = managers.reduce((acc, m) => acc + m.equipmentsTotal, 0);

  const handleSendDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManagerForDirective) return;
    
    setDirectiveSuccessMessage(`Diretriz executiva despachada com sucesso para ${selectedManagerForDirective.name}. Cópia arquivada na governança.`);
    setSelectedManagerForDirective(null);
    setDirectiveText('');
    setTimeout(() => setDirectiveSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/90 shadow-sm relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Presidência • Alta Liderança
            </span>
            <span className="text-xs text-slate-400 font-mono">Conselho Executivo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Desempenho & Governança dos Gerentes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Avaliação comparativa de metas financeiras, margem líquida, SLA e eficiência de liderança entre as gerências regionais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setExportToast(true);
              setTimeout(() => setExportToast(false), 3000);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm min-h-[40px] touch-manipulation"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar Dossiê Executivo</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {directiveSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{directiveSuccessMessage}</span>
        </div>
      )}

      {exportToast && (
        <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Dossiê comparativo dos Gerentes exportado em PDF com gráficos de aderência orçamentária.</span>
        </div>
      )}

      {/* Corporate KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Faturamento Gerencial</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            R$ {(totalRevenue / 1000000).toFixed(2)}M
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Margem média ponderada: {totalMargin}%</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>SLA Médio Consolidado</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {avgSLA}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Acima do piso contratual de 95%</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Frota Contratada</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalEquipmentsManaged.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Distribuídos em 4 gerências</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Liderança de Campo</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {managers.reduce((acc, m) => acc + m.techniciansTotal, 0)} mecânicos
          </div>
          <p className="text-[11px] text-slate-400 mt-1">11 supervisores de polo ativos</p>
        </div>
      </div>

      {/* Podium Top 3 Managers */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Pódio Executivo de Liderança Regional</span>
            </h3>
            <p className="text-xs text-slate-400">Classificação ponderada por margem financeira, cumprimento de metas e SLA corporativo</p>
          </div>
          <span className="text-[11px] font-mono text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            Trimestre Atual (Q3 2026)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rankedManagers.slice(0, 3).map((mgr, idx) => {
            const medals = [
              { label: '1º Lugar • Ouro', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300', badge: 'bg-amber-500 text-slate-950' },
              { label: '2º Lugar • Prata', color: 'border-slate-400/40 bg-slate-500/10 text-slate-200', badge: 'bg-slate-300 text-slate-950' },
              { label: '3º Lugar • Bronze', color: 'border-amber-700/40 bg-amber-800/10 text-amber-400', badge: 'bg-amber-700 text-white' }
            ];
            const medal = medals[idx];

            return (
              <div 
                key={mgr.id}
                className={`p-4 rounded-xl border ${medal.color} flex flex-col justify-between gap-3 relative`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${medal.badge}`}>
                      {medal.label}
                    </span>
                    <span className="text-sm font-mono font-bold text-amber-300">
                      Score {mgr.overallScore}/100
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-base font-bold text-white">{mgr.name}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{mgr.region}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Margem Líquida</span>
                      <span className="font-mono font-bold text-emerald-400">{mgr.marginRate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">SLA Consolidado</span>
                      <span className="font-mono font-bold text-cyan-400">{mgr.globalSLA}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Atingimento Meta</span>
                      <span className="font-mono font-bold text-slate-200">{mgr.targetAchievement}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">NPS Clientes</span>
                      <span className="font-mono font-bold text-amber-300">{mgr.npsScore} pts</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    R$ {(mgr.monthlyRevenue / 1000).toFixed(0)}k/mês
                  </span>
                  <button
                    onClick={() => setSelectedManagerForDirective(mgr)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Emitir Diretriz</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordering Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Painel Detalhado das Gerências Regionais</h3>
          <p className="text-xs text-slate-400">Auditoria completa dos dados de faturamento, equipes e satisfação de clientes</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">Ordenar por:</span>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as any)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="SCORE">Score Geral de Gestão</option>
            <option value="MARGEM">Maior Margem Operacional (%)</option>
            <option value="RECEITA">Volume de Faturamento (R$)</option>
            <option value="SLA">SLA Global (%)</option>
            <option value="NPS">Satisfação de Clientes (NPS)</option>
          </select>
        </div>
      </div>

      {/* Managers Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rankedManagers.map((mgr) => {
          const isExcellent = mgr.status === 'EXCELENTE';
          const isWarning = mgr.status === 'ATENCAO';

          return (
            <div
              key={mgr.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-indigo-950 border border-slate-700 flex items-center justify-center text-white font-bold text-base shadow-sm">
                      {mgr.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{mgr.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isExcellent ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                          isWarning ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                          'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {mgr.status || 'NO_ALVO'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{mgr.region}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{mgr.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-amber-400">
                      {mgr.overallScore}/100
                    </div>
                    <span className="text-[10px] text-slate-400">Score de Liderança</span>
                  </div>
                </div>

                {/* Financial & Operational Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
                    <span className="text-[10px] text-slate-400 block">Faturamento Mensal</span>
                    <span className="font-mono font-bold text-slate-100">
                      R$ {(mgr.monthlyRevenue / 1000).toFixed(0)}k
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">
                      Margem: {mgr.marginRate}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
                    <span className="text-[10px] text-slate-400 block">SLA Consolidado</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {mgr.globalSLA}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      NPS: {mgr.npsScore} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
                    <span className="text-[10px] text-slate-400 block">Meta do Trimestre</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {mgr.targetAchievement}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Prev: {mgr.preventiveCompliance}%
                    </span>
                  </div>
                </div>

                {/* Team & Equipment Footprint */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs py-2 px-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Supervisores</span>
                    <span className="font-mono font-bold text-slate-200">{mgr.supervisorsCount} polos</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Técnicos de Campo</span>
                    <span className="font-mono font-bold text-slate-200">{mgr.techniciansTotal} mecânicos</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Frota Ativa</span>
                    <span className="font-mono font-bold text-indigo-400">{mgr.equipmentsTotal} elevadores</span>
                  </div>
                </div>

                {/* AI Executive Summary */}
                {mgr.aiExecutiveSummary && (
                  <div className="mt-3 p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/30 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Diagnóstico da Presidência</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      "{mgr.aiExecutiveSummary}"
                    </p>
                  </div>
                )}

                {/* Strengths & Risks */}
                <div className="mt-3 space-y-2 text-xs">
                  {mgr.topStrengths && mgr.topStrengths.length > 0 && (
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-300">
                        <strong className="text-slate-200">Pontos Fortes:</strong> {mgr.topStrengths.join('; ')}
                      </span>
                    </div>
                  )}
                  {mgr.riskPoints && mgr.riskPoints.length > 0 && (
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-300">
                        <strong className="text-amber-300">Pontos de Atenção:</strong> {mgr.riskPoints.join('; ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Última Diretriz: {mgr.lastDirectiveDate || 'Não registrada'}
                </span>
                <button
                  onClick={() => setSelectedManagerForDirective(mgr)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>Emitir Diretriz Executiva</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Directive Modal for President */}
      {selectedManagerForDirective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400">Presidência Corporativa</span>
                <h3 className="text-base font-bold text-white">
                  Diretriz Executiva para {selectedManagerForDirective.name}
                </h3>
                <p className="text-xs text-slate-400">{selectedManagerForDirective.region}</p>
              </div>
              <button
                onClick={() => setSelectedManagerForDirective(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendDirective} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tipo de Instrução Executiva
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'META', label: 'Meta de Margem' },
                    { id: 'ELOGIO', label: 'Reconhecimento' },
                    { id: 'ALERTA', label: 'Alerta Operacional' },
                    { id: 'EXPANSAO', label: 'Expansão de Rota' }
                  ].map(type => (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setDirectiveType(type.id as any)}
                      className={`text-xs p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        directiveType === type.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Despacho da Presidência (Instruções, Metas e Prazos)
                </label>
                <textarea
                  rows={4}
                  required
                  value={directiveText}
                  onChange={(e) => setDirectiveText(e.target.value)}
                  placeholder={`Exemplo: Solicitamos reunião extraordinária de polo para revisar os custos de horas extras e acelerar a migração dos 120 contratos legados para o modelo All-Inclusive...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedManagerForDirective(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Emitir Despacho Oficial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
