import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BrainCircuit, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  Wrench, 
  Sparkles, 
  CheckCircle2, 
  Package, 
  Users, 
  Clock, 
  ChevronRight, 
  Filter, 
  Activity,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { generateSmartFlowAlerts, SmartFlowAlert } from '../../utils/smartFlowAI';
import { EmptyState } from '../common/EmptyState';

export const SmartFlowIntelligence: React.FC = () => {
  const { 
    contracts, 
    calls, 
    equipments, 
    parts, 
    employees, 
    setActiveView 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('TODAS');

  // Geração dos alertas via motor analítico com dados 100% reais do sistema
  const alerts = useMemo(() => {
    return generateSmartFlowAlerts({
      contracts,
      calls,
      equipments,
      parts,
      employees
    });
  }, [contracts, calls, equipments, parts, employees]);

  // Contadores para KPIs no topo
  const criticalCount = alerts.filter(a => a.severity === 'CRITICO').length;
  const financialCount = alerts.filter(a => a.type === 'FINANCEIRO').length;
  const operationalCount = alerts.filter(a => a.type === 'OPERACIONAL').length;
  const predictiveCount = alerts.filter(a => a.type === 'PREDITIVO').length;

  // Filtragem da lista
  const filteredAlerts = alerts.filter(a => {
    const matchCategory = selectedCategory === 'TODAS' || a.type === selectedCategory;
    const matchSeverity = selectedSeverity === 'TODAS' || a.severity === selectedSeverity;
    return matchCategory && matchSeverity;
  });

  const getSeverityBadge = (severity: SmartFlowAlert['severity']) => {
    switch (severity) {
      case 'CRITICO':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'ALTO':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIO':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getTypeIcon = (type: SmartFlowAlert['type']) => {
    switch (type) {
      case 'FINANCEIRO':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'OPERACIONAL':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'PREDITIVO':
        return <Wrench className="w-4 h-4 text-cyan-400" />;
      case 'ESTOQUE':
        return <Package className="w-4 h-4 text-purple-400" />;
      case 'RH':
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Unificado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              SmartFlow IA & Central de Alertas
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Monitoramento Analítico em Tempo Real
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Inteligência Operacional & Gestão de Alertas
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            O SmartFlow IA inspeciona continuamente os contratos, chamados, parque instalado, peças e folha, emitindo alertas imediatos sobre desvios e oportunidades de intervenção.
          </p>
        </div>

        {/* Status de Monitoramento */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-tight">Motor Analítico</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">100% Conectado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores Consolidados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total de Alertas</span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{alerts.length}</div>
          <span className="text-[11px] text-slate-400">Identificados pelo motor da IA</span>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${
          criticalCount > 0 ? 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-950/20' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300 block">Alertas Críticos</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">{criticalCount}</div>
          <span className="text-[11px] text-slate-400">Ação imediata recomendada</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">Desvios Financeiros</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{financialCount}</div>
          <span className="text-[11px] text-slate-400">Contratos com queda de margem</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 block">Risco Preditivo / IoT</span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">{predictiveCount}</div>
          <span className="text-[11px] text-slate-400">Equipamentos em atenção</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Filtrar Alertas:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 font-medium"
          >
            <option value="TODAS">Todas as Categorias</option>
            <option value="FINANCEIRO">💰 Financeiro (Margens & Custos)</option>
            <option value="OPERACIONAL">🚨 Operacional (Chamados & SLA)</option>
            <option value="PREDITIVO">⚙️ Preditivo (Equipamentos & Falhas)</option>
            <option value="ESTOQUE">📦 Almoxarifado (Peças & Estoque)</option>
            <option value="RH">👥 Governança & RH (Horas Extras & Folha)</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 font-medium"
          >
            <option value="TODAS">Todas as Severidades</option>
            <option value="CRITICO">🔴 Crítico</option>
            <option value="ALTO">🟡 Alto</option>
            <option value="MEDIO">🔵 Médio</option>
          </select>
        </div>
      </div>

      {/* Lista de Alertas ou Empty State */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhum alerta ativo no momento"
          description={
            selectedCategory !== 'TODAS' || selectedSeverity !== 'TODAS'
              ? 'Nenhum alerta encontrado para os filtros selecionados.'
              : 'O SmartFlow IA analisou todos os contratos, chamados em aberto, equipamentos conectados, níveis de estoque e horas extras. Todos os parâmetros estão dentro das metas de conformidade.'
          }
        />
      ) : (
        <div className="space-y-3.5">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-2xl bg-slate-900/90 border transition-all shadow-sm space-y-3 ${
                alert.severity === 'CRITICO' 
                  ? 'border-rose-500/50 shadow-md shadow-rose-950/20' 
                  : alert.severity === 'ALTO'
                  ? 'border-amber-500/40'
                  : 'border-slate-800'
              }`}
            >
              {/* Header do Card de Alerta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                    {getTypeIcon(alert.type)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getSeverityBadge(alert.severity)}`}>
                    Nível: {alert.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {alert.type}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {alert.timestamp}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    🟢 Status: {alert.status}
                  </span>
                </div>
              </div>

              {/* Título do Alerta */}
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {alert.title}
              </h3>

              {/* Bloco Rastreável: Origem e Motivo Analítico */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                {/* Informação de Origem */}
                <div className="md:col-span-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                    Informação que Originou o Alerta
                  </span>
                  <div className="text-xs font-semibold text-slate-200">
                    {alert.originInfo}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Entidade: {alert.originEntity}
                  </span>
                </div>

                {/* Motivo Analítico */}
                <div className="md:col-span-8 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
                      Motivo do Alerta (Diagnóstico SmartFlow IA)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium mt-0.5">
                      {alert.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ação para Visualizar Dados Relacionados */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                <button
                  onClick={() => setActiveView(alert.actionView as any)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group active:scale-95"
                >
                  <span>{alert.actionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Painel Arquitetural de Transparência da IA */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-300">Arquitetura SmartFlow IA:</span>
          <p className="leading-relaxed">
            Os alertas acima são gerados deterministicamente pelo motor de regras analíticas a partir dos dados reais armazenados na aplicação. O sistema está preparado para expansão com modelos de inteligência artificial generativa (Google Gemini API / Vertex AI) para prognósticos preditivos profundos sem simulação de dados fictícios.
          </p>
        </div>
      </div>

    </div>
  );
};
