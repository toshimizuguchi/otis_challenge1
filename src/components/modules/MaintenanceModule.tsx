import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskGauge } from '../common/UIComponents';
import { MaintenanceCampaign, Equipment } from '../../types';
import { 
  Wrench, 
  Calendar, 
  Sparkles, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RotateCw,
  Package,
  Layers,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  X,
  TrendingUp,
  DollarSign,
  Building2,
  Check,
  Trash2,
  Filter,
  Cpu,
  Zap,
  BarChart3,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';

export const MaintenanceModule: React.FC = () => {
  const { 
    equipments, 
    campaigns, 
    createMaintenanceCampaign, 
    advanceCampaignProgress,
    updateCampaignStatus,
    deleteCampaign,
    executeMassCampaign,
    addToast, 
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'PREDICTIVE' | 'CAMPAIGNS'>('CALENDAR');

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const [selectedMonth, setSelectedMonth] = useState('Agosto');

  // Campaigns filtering & state
  const [campaignSearch, setCampaignSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODAS' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PLANEJADA'>('TODAS');
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Campaign Form State
  const [newTitle, setNewTitle] = useState('');
  const [newModel, setNewModel] = useState('Otis Gen2 Comfort');
  const [newComponent, setNewComponent] = useState('Sistema de Portas (Operador AT120 / Roletes)');
  const [newTotalEquipments, setNewTotalEquipments] = useState(250);
  const [newHighRiskCount, setNewHighRiskCount] = useState(65);
  const [newRegions, setNewRegions] = useState('Campinas & Interior SP, Grande São Paulo');
  const [newEstimatedCost, setNewEstimatedCost] = useState(120000);
  const [newRiskDesc, setNewRiskDesc] = useState('Aumento de 58% em falhas de abertura de porta reportadas pela IA.');
  const [newAiHypothesis, setNewAiHypothesis] = useState('Degradação do material polimérico da sapata aos 320 mil ciclos de abertura.');

  const highRiskEquipments = equipments.filter(e => e.predictiveRiskScore >= 70);

  // Quick preset loader for new campaign modal
  const applyPreset = (presetType: 'DOORS' | 'REGEN' | 'BELTS' | 'PRS') => {
    if (presetType === 'DOORS') {
      setNewTitle('Campanha Nacional Portas Gen2 Comfort (Roletes AT120)');
      setNewModel('Otis Gen2 Comfort');
      setNewComponent('Operador de Portas AT120 (Sapatas & Roletes)');
      setNewTotalEquipments(320);
      setNewHighRiskCount(85);
      setNewEstimatedCost(142000);
      setNewRegions('Campinas, Grande São Paulo, Rio de Janeiro, Curitiba');
      setNewRiskDesc('Elevadores Gen2 Comfort entre 30 e 40 meses apresentam aumento de 64% em falhas de porta devido a desgaste na sapata.');
      setNewAiHypothesis('O material da sapata em lotes de 2023 atinge o limiar de fadiga mecânica aos 350.000 ciclos.');
    } else if (presetType === 'REGEN') {
      setNewTitle('Inspeção de Eficiência Energética e Drives ReGen');
      setNewModel('Otis SkyRise & Gen2 Life');
      setNewComponent('Inversor Regenerativo VVVF & Bancos de Capacitores');
      setNewTotalEquipments(180);
      setNewHighRiskCount(42);
      setNewEstimatedCost(78000);
      setNewRegions('São Paulo, Rio de Janeiro, Belo Horizonte');
      setNewRiskDesc('Revisão periódica para assegurar 100% de injeção de energia limpa na rede predial e prevenir aquecimento nos módulos IGBT.');
      setNewAiHypothesis('Picos sazonais de temperatura e harmônicos na rede elétrica predial geram estresse térmico secundário.');
    } else if (presetType === 'BELTS') {
      setNewTitle('Inspeção Não Destrutiva: Cintas de Tração CSB');
      setNewModel('Otis Gen2 Life');
      setNewComponent('Cintas de Aço Revestidas de Poliuretano (CSB)');
      setNewTotalEquipments(210);
      setNewHighRiskCount(35);
      setNewEstimatedCost(95000);
      setNewRegions('Campinas, Santos, São Bernardo do Campo');
      setNewRiskDesc('Monitoramento por indução de continuidade nos filamentos metálicos das cintas CSB.');
      setNewAiHypothesis('Ambientes litorâneos e de alta umidade aceleram microfissuras na camada externa de poliuretano.');
    } else if (presetType === 'PRS') {
      setNewTitle('Calibração e Limpeza de Fita Seletora PRS');
      setNewModel('Otis 2000 VF');
      setNewComponent('Fita Seletora Óptica & Sensores PRS');
      setNewTotalEquipments(140);
      setNewHighRiskCount(28);
      setNewEstimatedCost(54000);
      setNewRegions('Grande São Paulo, Campinas');
      setNewRiskDesc('Prevenção de desnivelamento milimétrico de cabina em edifícios comerciais de alto tráfego.');
      setNewAiHypothesis('Acúmulo de fuligem nos sensores infravermelhos causa jitter na leitura dos pulsos de nivelamento.');
    }
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast('warning', 'Atenção', 'Informe o título da campanha.');
      return;
    }

    createMaintenanceCampaign({
      title: newTitle,
      componentTarget: newComponent,
      modelTarget: newModel,
      riskDescription: newRiskDesc,
      totalTargetEquipments: Number(newTotalEquipments) || 100,
      highRiskEquipmentsCount: Number(newHighRiskCount) || 20,
      targetRegions: newRegions.split(',').map(r => r.trim()).filter(Boolean),
      estimatedCost: Number(newEstimatedCost) || 50000,
      aiRootCauseHypothesis: newAiHypothesis,
      status: 'EM_ANDAMENTO'
    });

    setIsNewModalOpen(false);
    setActiveTab('CAMPAIGNS');
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(campaignSearch.toLowerCase()) ||
      c.modelTarget.toLowerCase().includes(campaignSearch.toLowerCase()) ||
      c.componentTarget.toLowerCase().includes(campaignSearch.toLowerCase()) ||
      (c.targetRegions && c.targetRegions.some(r => r.toLowerCase().includes(campaignSearch.toLowerCase())));
    
    const matchesStatus = statusFilter === 'TODAS' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate high-level KPIs for Campaigns tab
  const activeCampaignsCount = campaigns.filter(c => c.status === 'EM_ANDAMENTO').length;
  const completedCampaignsCount = campaigns.filter(c => c.status === 'CONCLUIDA').length;
  const plannedCampaignsCount = campaigns.filter(c => c.status === 'PLANEJADA').length;
  const totalCoveredEquipments = campaigns.reduce((acc, c) => acc + (c.totalTargetEquipments || 0), 0);
  const totalInspectedEquipments = campaigns.reduce((acc, c) => acc + (c.inspectedEquipmentsCount || 0), 0);
  const overallProgressPercent = totalCoveredEquipments > 0 
    ? Math.min(100, Math.round((totalInspectedEquipments / totalCoveredEquipments) * 100))
    : 0;
  const totalProjectedSavings = campaigns.reduce((acc, c) => acc + (c.estimatedCost || 0), 0);

  // Helper to find equipments matching a campaign's model target
  const getMatchingEquipments = (camp: MaintenanceCampaign): Equipment[] => {
    const targetModelLower = camp.modelTarget.toLowerCase();
    return equipments.filter(eq => {
      const eqModelLower = eq.model.toLowerCase();
      // match words like gen2, skyrise, comfort, life, 2000
      const keywords = ['gen2 comfort', 'gen2 life', 'skyrise', '2000 vf', 'gen2'];
      for (const kw of keywords) {
        if (targetModelLower.includes(kw) && eqModelLower.includes(kw)) return true;
      }
      return targetModelLower.includes(eqModelLower) || eqModelLower.includes(targetModelLower);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Plano de Engenharia de Manutenção
            </span>
            <span className="text-xs text-slate-400 font-mono">Preditiva • Preventiva • Campanhas em Lote</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Gestão de Manutenção & Calendário Dinâmico
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Cronogramas inteligentes que se adaptam por modelo, desgaste de componentes, telemetria Otis ONE e campanhas nacionais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              applyPreset('DOORS');
              setIsNewModalOpen(true);
              setActiveTab('CAMPAIGNS');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer ring-1 ring-cyan-400/40"
          >
            <Plus className="w-4 h-4" />
            <span>Disparar Campanha Preventiva</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'CALENDAR' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          📅 Calendário Mensal Mês a Mês
        </button>
        <button
          onClick={() => setActiveTab('PREDICTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'PREDICTIVE' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          ⚡ Fila de Risco Preditivo ({highRiskEquipments.length})
        </button>
        <button
          onClick={() => setActiveTab('CAMPAIGNS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'CAMPAIGNS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>🎯 Campanhas de Troca em Massa</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">
            {campaigns.length}
          </span>
        </button>
      </div>

      {/* Content based on Tab */}
      {activeTab === 'CALENDAR' && (
        <div className="space-y-4">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  selectedMonth === m
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {equipments.map((eq) => (
              <div
                key={eq.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-300">{eq.tag}</span>
                    <h4 className="text-xs font-bold text-slate-100">{eq.customerName}</h4>
                  </div>
                  <RiskGauge score={eq.predictiveRiskScore} />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                  <div className="text-slate-400">Modelo: <strong className="text-slate-200">{eq.model}</strong> ({new Date().getFullYear() - eq.installationYear} anos)</div>
                  <div className="text-slate-400">Ciclos de Porta: <strong className="text-cyan-300">{(eq.doorCycles ?? 0).toLocaleString('pt-BR')}</strong></div>
                  <div className="text-slate-400">Próx. Manutenção: <strong className="text-emerald-400">{eq.nextScheduledMaintenance}</strong></div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400">Revisão em {selectedMonth}:</span>
                  <span className="font-bold text-cyan-300">Portas & Tracionamento</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'PREDICTIVE' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-700/40 text-xs space-y-1">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Priorização por Inteligência Preditiva SmartFlow
            </h3>
            <p className="text-slate-300">
              Equipamentos com pontuação de risco acima de 70% ordenados automaticamente para intervenção antecipada.
            </p>
          </div>

          <div className="space-y-3">
            {highRiskEquipments.map((eq) => (
              <div
                key={eq.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-300">{eq.tag}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase border border-rose-500/30">
                      Risco Elevado
                    </span>
                    <span className="text-xs text-slate-300 font-bold">{eq.model}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-100">{eq.customerName} ({eq.buildingName} • {eq.city})</div>
                  <p className="text-xs text-slate-300">{eq.riskExplanation || 'Inspeção preventiva recomendada por ciclos acumulados.'}</p>
                </div>

                <div className="text-right shrink-0 space-y-2">
                  <RiskGauge score={eq.predictiveRiskScore} />
                  <button
                    onClick={() => {
                      createMaintenanceCampaign({
                        title: `Intervenção Preditiva ${eq.tag}`,
                        modelTarget: eq.model,
                        componentTarget: 'Componentes Críticos Preditivos',
                        riskDescription: eq.riskExplanation || 'Análise preditiva de desgaste em componentes críticos.',
                        totalTargetEquipments: 1,
                        highRiskEquipmentsCount: 1,
                        status: 'EM_ANDAMENTO'
                      });
                      setActiveTab('CAMPAIGNS');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer shadow-md"
                  >
                    Agendar Campanha / Ordem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fully Functional CAMPAIGNS Tab */}
      {activeTab === 'CAMPAIGNS' && (
        <div className="space-y-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Campanhas Ativas</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {activeCampaignsCount} <span className="text-xs font-normal text-slate-400">ativas ({campaigns.length} total)</span>
              </div>
              <div className="text-[11px] text-cyan-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Despacho contínuo nas rotas de campo</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Ativos Cobertos em Massa</span>
                <Building2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300 tracking-tight">
                {totalCoveredEquipments.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] text-slate-400">
                Elevadores protegidos contra paradas
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Inspeções Concluídas</span>
                <span className="text-xs font-bold text-emerald-400">{overallProgressPercent}%</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">
                {totalInspectedEquipments.toLocaleString('pt-BR')}
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Economia Projetada</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 tracking-tight">
                {totalProjectedSavings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8.5 p.p. na margem contratual</span>
              </div>
            </div>

          </div>

          {/* Controls Bar: Search, Filters and "+ Nova Campanha" */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por título, modelo, componente ou região..."
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {campaignSearch && (
                <button
                  onClick={() => setCampaignSearch('')}
                  className="p-1.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {(['TODAS', 'EM_ANDAMENTO', 'CONCLUIDA', 'PLANEJADA'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st === 'TODAS' ? `Todas (${campaigns.length})` : 
                     st === 'EM_ANDAMENTO' ? `Ativas (${activeCampaignsCount})` : 
                     st === 'CONCLUIDA' ? `Concluídas (${completedCampaignsCount})` : `Planejadas (${plannedCampaignsCount})`}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer whitespace-nowrap transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Campanha</span>
              </button>
            </div>

          </div>

          {/* Dynamic Campaign Cards List */}
          {filteredCampaigns.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
              <div className="font-semibold text-sm text-slate-200">Nenhuma campanha encontrada com os filtros atuais</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tente redefinir os filtros de busca ou crie uma nova campanha preventiva com o botão acima.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((camp) => {
                const percent = camp.totalTargetEquipments > 0 
                  ? Math.min(100, Math.round((camp.inspectedEquipmentsCount / camp.totalTargetEquipments) * 100))
                  : 0;
                
                const isExpanded = expandedCampaignId === camp.id;
                const matchingEquipments = getMatchingEquipments(camp);

                return (
                  <div 
                    key={camp.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all space-y-4 shadow-sm"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 border ${
                            camp.status === 'EM_ANDAMENTO' 
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : camp.status === 'CONCLUIDA'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}>
                            {camp.status === 'EM_ANDAMENTO' && (
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            )}
                            {camp.status === 'CONCLUIDA' && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            )}
                            {camp.status.replace('_', ' ')}
                          </span>

                          <span className="text-xs font-mono text-slate-400">
                            Iniciada em: <strong className="text-slate-300">{camp.startDate}</strong>
                          </span>

                          <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
                            Modelo: {camp.modelTarget}
                          </span>

                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                            {camp.componentTarget}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white tracking-tight mt-1">
                          {camp.title}
                        </h3>
                      </div>

                      {/* Cost / Economy Badge */}
                      <div className="shrink-0 text-right">
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right inline-block">
                          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Economia / Orçamento</div>
                          <div className="text-sm font-black text-emerald-300">
                            {camp.estimatedCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Root Cause Hypothesis Card */}
                    {camp.aiRootCauseHypothesis && (
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-indigo-900/40 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Hipótese de Causa Raiz Diagnosticada pela IA SmartFlow:</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed italic">
                          "{camp.aiRootCauseHypothesis}"
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          {camp.riskDescription}
                        </p>
                      </div>
                    )}

                    {/* Progress Bar & Numerical stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">
                          Progresso de Inspeção e Troca: <strong className="text-cyan-300">{camp.inspectedEquipmentsCount.toLocaleString('pt-BR')}</strong> de <strong className="text-slate-200">{camp.totalTargetEquipments.toLocaleString('pt-BR')}</strong> equipamentos
                        </span>
                        <span className={`font-black text-sm ${percent === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                          {percent}% Concluído
                        </span>
                      </div>

                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent === 100 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-rose-400 font-medium">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {camp.highRiskEquipmentsCount} em risco crítico prioritário
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            Regiões: {(camp.targetRegions || []).join(', ') || 'Nacional'}
                          </span>
                        </div>

                        <span className="text-slate-500 text-[11px] font-mono">
                          ID: {camp.id}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => advanceCampaignProgress(camp.id, 25)}
                          disabled={camp.status === 'CONCLUIDA' || camp.inspectedEquipmentsCount >= camp.totalTargetEquipments}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                          <Zap className="w-3.5 h-3.5 text-cyan-200" />
                          <span>Executar Lote (+25 Ativos)</span>
                        </button>

                        <button
                          onClick={() => executeMassCampaign(camp.id)}
                          disabled={camp.status === 'CONCLUIDA'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer transition-all disabled:opacity-40"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Disparar Lote Geral (+50)</span>
                        </button>

                        {camp.status !== 'CONCLUIDA' ? (
                          <button
                            onClick={() => updateCampaignStatus(camp.id, 'CONCLUIDA')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Marcar como Concluída</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => updateCampaignStatus(camp.id, 'EM_ANDAMENTO')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 cursor-pointer transition-all"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Reabrir Campanha</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedCampaignId(isExpanded ? null : camp.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 cursor-pointer transition-all"
                        >
                          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Ver Ativos Elegíveis ({matchingEquipments.length})</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja realmente arquivar/excluir a campanha "${camp.title}"?`)) {
                              deleteCampaign(camp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all"
                          title="Excluir Campanha"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                    {/* Expandable Eligible Elevators Panel */}
                    {isExpanded && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                          <span className="font-bold text-slate-200 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            Elevadores da Frota Atendidos pelo Alvo: <strong className="text-cyan-300">{camp.modelTarget}</strong>
                          </span>
                          <span className="text-slate-400">
                            Mostrando {matchingEquipments.length} elevadores cadastrados
                          </span>
                        </div>

                        {matchingEquipments.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-400">
                            Nenhum elevador cadastrado na frota corresponde ao modelo específico ({camp.modelTarget}).
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                            {matchingEquipments.map((eq) => (
                              <div 
                                key={eq.id}
                                className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-2 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-cyan-300">{eq.tag}</span>
                                  <RiskGauge score={eq.predictiveRiskScore} />
                                </div>

                                <div className="font-semibold text-slate-100 truncate">{eq.buildingName}</div>
                                <div className="text-slate-400 text-[11px] truncate">{eq.customerName} • {eq.city}</div>

                                <div className="pt-1 flex items-center justify-between border-t border-slate-800 text-[11px]">
                                  <span className="text-slate-400">Ciclos de Porta:</span>
                                  <span className="font-mono text-cyan-300 font-bold">{(eq.doorCycles ?? 0).toLocaleString('pt-BR')}</span>
                                </div>

                                <button
                                  onClick={() => {
                                    advanceCampaignProgress(camp.id, 1);
                                    addToast('success', 'Ativo Inspecionado', `Elevador ${eq.tag} revisado com sucesso. Componentes preventivos instalados!`);
                                  }}
                                  className="w-full mt-1 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 font-bold text-[11px] border border-cyan-500/30 cursor-pointer transition-all"
                                >
                                  Inspecionar Individualmente
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Modal: Nova Campanha em Massa */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Engenharia de Confiabilidade Otis
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  Lançar Nova Campanha Preventiva em Massa
                </h2>
              </div>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Templates Recomendados pela IA SmartFlow:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('DOORS')}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs space-y-0.5 cursor-pointer transition-all"
                >
                  <div className="font-bold text-cyan-300">1. Portas AT120</div>
                  <div className="text-[10px] text-slate-400">Gen2 Comfort</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('REGEN')}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs space-y-0.5 cursor-pointer transition-all"
                >
                  <div className="font-bold text-emerald-300">2. Drives ReGen</div>
                  <div className="text-[10px] text-slate-400">SkyRise & Life</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('BELTS')}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs space-y-0.5 cursor-pointer transition-all"
                >
                  <div className="font-bold text-indigo-300">3. Cintas CSB</div>
                  <div className="text-[10px] text-slate-400">Gen2 Life</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('PRS')}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs space-y-0.5 cursor-pointer transition-all"
                >
                  <div className="font-bold text-amber-300">4. Sensores PRS</div>
                  <div className="text-[10px] text-slate-400">Otis 2000 VF</div>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCampaignSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Título da Campanha</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Campanha Nacional de Portas Gen2 Comfort"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Modelo Alvo</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="Ex: Otis Gen2 Comfort"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Componente Alvo</label>
                  <input
                    type="text"
                    value={newComponent}
                    onChange={(e) => setNewComponent(e.target.value)}
                    placeholder="Ex: Sistema de Portas (Operador AT120)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Total de Equipamentos</label>
                  <input
                    type="number"
                    min={1}
                    value={newTotalEquipments}
                    onChange={(e) => setNewTotalEquipments(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Equipamentos em Alto Risco</label>
                  <input
                    type="number"
                    min={0}
                    value={newHighRiskCount}
                    onChange={(e) => setNewHighRiskCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Economia / Custo Est. (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={newEstimatedCost}
                    onChange={(e) => setNewEstimatedCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Regiões Alvo (separadas por vírgula)</label>
                <input
                  type="text"
                  value={newRegions}
                  onChange={(e) => setNewRegions(e.target.value)}
                  placeholder="Campinas, Grande São Paulo, Rio de Janeiro"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Descrição do Padrão de Risco</label>
                <textarea
                  rows={2}
                  value={newRiskDesc}
                  onChange={(e) => setNewRiskDesc(e.target.value)}
                  placeholder="Explique o padrão de fadiga ou queixa detectada..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Hipótese de Causa Raiz da IA SmartFlow
                </label>
                <textarea
                  rows={2}
                  value={newAiHypothesis}
                  onChange={(e) => setNewAiHypothesis(e.target.value)}
                  placeholder="Hipótese técnica de degradação acelerada..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lançar Campanha Nacional</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
