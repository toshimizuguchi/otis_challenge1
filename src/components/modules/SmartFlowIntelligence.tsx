import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Play
} from 'lucide-react';

export const SmartFlowIntelligence: React.FC = () => {
  const { 
    aiInsights, 
    createMaintenanceCampaign,
    addToast,
    setActiveView 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'OPERACIONAL' | 'PREDITIVO' | 'ESTRATEGICO'>('ALL');
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  const toggleInsight = (id: string) => {
    setExpandedInsights(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categoryConfig: Record<string, { order: number; label: string; numberLabel: string; icon: React.ElementType; badgeClass: string; borderClass: string; textClass: string }> = {
    OPERACIONAL: {
      order: 1,
      label: 'Operacional',
      numberLabel: '1. Operacional',
      icon: Cpu,
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      borderClass: 'border-cyan-500/40',
      textClass: 'text-cyan-400'
    },
    PREDITIVO: {
      order: 2,
      label: 'Preditiva',
      numberLabel: '2. Preditiva',
      icon: ShieldCheck,
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      borderClass: 'border-indigo-500/40',
      textClass: 'text-indigo-400'
    },
    ESTRATEGICO: {
      order: 3,
      label: 'Estratégica',
      numberLabel: '3. Estratégica',
      icon: Layers,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      borderClass: 'border-emerald-500/40',
      textClass: 'text-emerald-400'
    }
  };

  // Sort insights strictly by category order (1. Operacional, 2. Preditiva, 3. Estratégica)
  const sortedInsights = [...aiInsights].sort((a, b) => {
    const orderA = categoryConfig[a.category]?.order ?? 99;
    const orderB = categoryConfig[b.category]?.order ?? 99;
    return orderA - orderB;
  });

  const filteredInsights = sortedInsights.filter(i => {
    if (activeCategory === 'ALL') return true;
    return i.category === activeCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header with 3 Layers Badge */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-700/50 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>SmartFlow AI Core • 3 Camadas de Inteligência</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cérebro Operacional, Preditivo & Estratégico
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                createMaintenanceCampaign({
                  title: 'Campanha Nacional Portas Gen2 Comfort',
                  modelTarget: 'Gen2 Comfort',
                  riskDescription: 'Campanha integrada de substituição antecipada de componentes de alto desgaste.',
                  status: 'EM_ANDAMENTO'
                });
                addToast({
                  type: 'success',
                  title: 'Campanha em Lote Disparada',
                  message: 'Ações preventivas geradas para 320 elevadores mapeados pela IA.'
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer ring-1 ring-cyan-400/40"
            >
              <Play className="w-4 h-4" />
              <span>Disparar Campanha em Lote</span>
            </button>
          </div>
        </div>

        {/* 3 Intelligence Layers Tab Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="text-xs font-bold">Todas as Camadas</div>
            <div className="text-[10px] text-slate-400">{aiInsights.length} prescrições ativas</div>
          </button>

          <button
            onClick={() => setActiveCategory('OPERACIONAL')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeCategory === 'OPERACIONAL'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Operacional</span>
            </div>
            <div className="text-[10px] text-slate-400">Supervisor: rotas e despacho rápido</div>
          </button>

          <button
            onClick={() => setActiveCategory('PREDITIVO')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeCategory === 'PREDITIVO'
                ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>2. Preditiva</span>
            </div>
            <div className="text-[10px] text-slate-400">Equipamentos: desgastes e falhas mecânicas</div>
          </button>

          <button
            onClick={() => setActiveCategory('ESTRATEGICO')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeCategory === 'ESTRATEGICO'
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Estratégica</span>
            </div>
            <div className="text-[10px] text-slate-400">Negócio: rentabilidade de contratos</div>
          </button>
        </div>
      </div>

      {/* Accordion List of Insights: 1. Operacional, 2. Preditiva, 3. Estratégica */}
      <div className="space-y-3.5">
        {filteredInsights.map((insight) => {
          const config = categoryConfig[insight.category] || categoryConfig.OPERACIONAL;
          const Icon = config.icon;
          const isExpanded = !!expandedInsights[insight.id];

          return (
            <div
              key={insight.id}
              id={`insight-card-${insight.id}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-slate-900/95 border-cyan-500/50 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/20'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Header Button: Category, Confidence, Title and Arrow */}
              <button
                id={`insight-toggle-${insight.id}`}
                type="button"
                onClick={() => toggleInsight(insight.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3 group cursor-pointer focus:outline-none"
                aria-expanded={isExpanded}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase font-mono border flex items-center gap-1.5 ${config.badgeClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{config.numberLabel}</span>
                    </span>

                    <span className="text-xs font-bold font-mono text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {insight.confidenceScore}% confiança
                    </span>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                    {insight.title}
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <span
                    className={`p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 group-hover:border-slate-700 flex items-center justify-center transition-all ${
                      isExpanded ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'text-slate-400'
                    }`}
                    title={isExpanded ? 'Recolher detalhes' : 'Ver explicação completa'}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </span>
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200 bg-slate-950/40">
                  {/* Resumo / Explicação */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Diagnóstico Identificado
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      "{insight.summary}"
                    </p>
                  </div>

                  {/* Recomendação Prescritiva */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1.5">
                    <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Recomendação Prescritiva do SmartFlow AI</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {insight.recommendedAction}
                    </p>
                  </div>

                  {/* Evidências Observadas */}
                  {insight.evidence && insight.evidence.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Evidências Identificadas</span>
                      </div>
                      <ul className="space-y-1.5 pl-1">
                        {insight.evidence.map((ev, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                            <span className="text-cyan-400 font-mono mt-0.5">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metadados: Escopo & Impacto */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Escopo:</span>
                      <span className="font-semibold text-slate-200">{insight.scope}</span>
                    </div>
                    {insight.estimatedImpact && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px]">Impacto:</span>
                        <span className="font-bold text-emerald-400 font-mono">{insight.estimatedImpact}</span>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => {
                        if (insight.category === 'OPERACIONAL') setActiveView('supervisors');
                        else if (insight.category === 'PREDITIVO') setActiveView('maintenance');
                        else setActiveView('financial');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>Ver no Módulo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        createMaintenanceCampaign({
                          title: `Campanha IA: ${insight.title}`,
                          riskDescription: insight.recommendedAction,
                          status: 'EM_ANDAMENTO'
                        });
                        addToast({
                          type: 'success',
                          title: 'Prescrição Executada',
                          message: `Ação preventiva disparada para: ${insight.scope}`
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Executar Ação</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
