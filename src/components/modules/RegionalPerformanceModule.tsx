import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Filter, 
  ArrowUpRight, 
  Building2, 
  ShieldAlert, 
  BrainCircuit, 
  ChevronRight,
  Flame,
  Award,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell 
} from 'recharts';
import { REGIONAL_COMPARISON_DATA, LATAM_REGIONS_DATA } from '../../data/mockData';

export const RegionalPerformanceModule: React.FC = () => {
  const { setSelectedCityFilter, setActiveView } = useApp();
  const [selectedMacroRegion, setSelectedMacroRegion] = useState<string>('TODAS');
  const [selectedSort, setSelectedSort] = useState<'SLA' | 'MARGEM' | 'EQUIPAMENTOS' | 'AGILIDADE'>('SLA');
  const [showExportToast, setShowExportToast] = useState<boolean>(false);

  // Filtered and enriched list of regions
  const regionalData = useMemo(() => {
    let list = REGIONAL_COMPARISON_DATA.map(item => {
      let macro = 'Sudeste';
      if (item.state === 'PR' || item.state === 'SC' || item.state === 'RS') {
        macro = 'Sul';
      } else if (item.state === 'DF' || item.state === 'GO' || item.state === 'BA' || item.state === 'PE') {
        macro = 'Centro-Oeste/Nordeste';
      }
      return {
        ...item,
        macroRegion: macro,
        totalCycleTime: item.avgTA + item.avgTB
      };
    });

    if (selectedMacroRegion !== 'TODAS' && selectedMacroRegion !== 'LATAM') {
      list = list.filter(item => item.macroRegion === selectedMacroRegion);
    }

    // Sorting
    return list.sort((a, b) => {
      if (selectedSort === 'SLA') return b.slaRate - a.slaRate;
      if (selectedSort === 'MARGEM') return b.marginRate - a.marginRate;
      if (selectedSort === 'EQUIPAMENTOS') return b.totalEquipments - a.totalEquipments;
      if (selectedSort === 'AGILIDADE') return a.totalCycleTime - b.totalCycleTime;
      return 0;
    });
  }, [selectedMacroRegion, selectedSort]);

  // Consolidations for Executive Cards
  const totalEquipments = REGIONAL_COMPARISON_DATA.reduce((acc, curr) => acc + curr.totalEquipments, 0);
  const avgSLA = (REGIONAL_COMPARISON_DATA.reduce((acc, curr) => acc + curr.slaRate, 0) / REGIONAL_COMPARISON_DATA.length).toFixed(1);
  const avgMargin = (REGIONAL_COMPARISON_DATA.reduce((acc, curr) => acc + curr.marginRate, 0) / REGIONAL_COMPARISON_DATA.length).toFixed(1);
  const avgTA = (REGIONAL_COMPARISON_DATA.reduce((acc, curr) => acc + curr.avgTA, 0) / REGIONAL_COMPARISON_DATA.length).toFixed(1);

  const handleExport = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800/90 shadow-sm relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Presidência • Governança Territorial
            </span>
            <span className="text-xs text-slate-400 font-mono">Brasil & Expansão LATAM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Desempenho Regional & Operação por Polos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Acompanhamento executivo de cumprimento de SLA contratual, rentabilidade líquida e tempo de atendimento por praça.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm min-h-[40px] touch-manipulation"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar Relatório Consolidado</span>
          </button>
        </div>
      </div>

      {/* Export feedback toast */}
      {showExportToast && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Relatório executivo territorial exportado em PDF e planilha com sucesso.</span>
          </div>
        </div>
      )}

      {/* Macro Executive KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>SLA Médio Consolidado</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-2">
            {avgSLA}%
            <span className="text-[11px] font-semibold text-emerald-400 font-sans">+0.8% vs Meta</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Meta corporativa anual: 97.0%</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Margem Operacional Média</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 flex items-baseline gap-2">
            {avgMargin}%
            <span className="text-[11px] font-semibold text-emerald-400 font-sans">+2.1% no tri</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Contratos All-Inclusive com IoT</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Frota sob Supervisão</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalEquipments.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Elevadores, escadas e esteiras</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Tempo Médio Chegada (TA)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 flex items-baseline gap-2">
            {avgTA} min
            <span className="text-[11px] font-semibold text-emerald-400 font-sans">-3.4 min</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Despacho otimizado com roteirização</p>
        </div>
      </div>

      {/* Control Filters & Ordering */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'TODAS', label: 'Todas as Praças' },
            { id: 'Sudeste', label: 'Sudeste (SP, RJ, MG)' },
            { id: 'Sul', label: 'Sul (PR, SC, RS)' },
            { id: 'LATAM', label: 'Mercosul & LATAM' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedMacroRegion(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer min-h-[34px] touch-manipulation ${
                selectedMacroRegion === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">Ordenar por:</span>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as any)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="SLA">Maior SLA (%)</option>
            <option value="MARGEM">Maior Margem (%)</option>
            <option value="EQUIPAMENTOS">Volume de Equipamentos</option>
            <option value="AGILIDADE">Mais Ágeis (Menor TA+TB)</option>
          </select>
        </div>
      </div>

      {/* Main Regional Grid / LATAM Comparison */}
      {selectedMacroRegion === 'LATAM' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 mb-1">Presença Internacional & Filiais LATAM</h3>
            <p className="text-xs text-slate-400 mb-4">Métricas consolidadas das operações ativas e planos de expansão no continente.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {LATAM_REGIONS_DATA.map((lat) => (
                <div 
                  key={lat.country}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-bold text-slate-100">{lat.country}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Disponibilidade {lat.availability}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Equipamentos</span>
                      <span className="font-mono font-bold text-slate-200">{lat.equipmentsCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">SLA Global</span>
                      <span className="font-mono font-bold text-emerald-400">{lat.slaRate}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Margem Operacional</span>
                      <span className="font-mono font-bold text-slate-200">{lat.marginRate}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Chamados Ativos</span>
                      <span className="font-mono font-bold text-cyan-400">{lat.activeCalls}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Equipamentos Críticos:</span>
                    <span className="font-mono font-bold text-rose-400">{lat.criticalEquipments} unid.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {regionalData.map((reg, idx) => {
            const isHighSLA = reg.slaRate >= 98.0;
            const isMediumSLA = reg.slaRate >= 96.0 && reg.slaRate < 98.0;
            const slaColor = isHighSLA ? 'text-emerald-400' : isMediumSLA ? 'text-cyan-400' : 'text-amber-400';

            return (
              <div
                key={reg.city}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          Polo {reg.city} ({reg.state})
                        </h4>
                        <span className="text-[11px] text-slate-400">{reg.macroRegion}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isHighSLA ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      SLA {reg.slaRate}%
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Frota Ativa</span>
                      <span className="font-mono font-bold text-slate-200">{reg.totalEquipments} unid.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Margem Contratual</span>
                      <span className="font-mono font-bold text-emerald-400">{reg.marginRate}%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Tempo Resposta (TA)</span>
                      <span className="font-mono font-bold text-amber-300">{reg.avgTA} min</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Tempo Solução (TB)</span>
                      <span className="font-mono font-bold text-slate-300">{reg.avgTB} min</span>
                    </div>
                  </div>

                  {/* Recurrence and diagnostic */}
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Chamados de Portas:</span>
                      <span className={`font-mono font-bold ${reg.doorFailuresRate > 50 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {reg.doorFailuresRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Taxa de Falha Mensal:</span>
                      <span className="font-mono font-bold text-slate-300">{reg.failureRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {reg.monthlyCalls} chamados/mês
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCityFilter(reg.city);
                      setActiveView('reports');
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Auditar Polo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Executive Analytical Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Comparativo Consolidado de SLA (%) e Margem (%)</h3>
            <p className="text-xs text-slate-400">Análise de eficiência operacional e rentabilidade líquida por polo</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              SLA (%)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Margem (%)
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={REGIONAL_COMPARISON_DATA} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="city" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#090d16', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem', 
                  fontSize: '12px', 
                  color: '#f8fafc' 
                }} 
              />
              <Bar dataKey="slaRate" name="SLA (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="marginRate" name="Margem (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
