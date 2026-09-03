import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskGauge } from '../common/UIComponents';
import { Equipment } from '../../types';
import { 
  Building2, 
  Search, 
  Filter, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  RotateCw, 
  Layers, 
  Calendar, 
  Clock, 
  Wrench, 
  MapPin,
  ChevronRight,
  TrendingUp,
  Cpu,
  AlertCircle,
  ArrowLeft,
  ListFilter,
  Activity
} from 'lucide-react';

export const EquipmentModule: React.FC = () => {
  const { equipments, calls, selectedCityFilter, setSelectedCityFilter, setSelectedCallId, setActiveView } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('TODOS');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(equipments[0]?.id || '');
  const [mobileActiveTab, setMobileActiveTab] = useState<'list' | 'detail'>('list');

  const filteredEquipments = equipments.filter(eq => {
    const matchesSearch = 
      eq.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'TODOS' || eq.type === selectedType;
    const matchesCity = selectedCityFilter === 'TODAS' || eq.city.toLowerCase() === selectedCityFilter.toLowerCase();
    
    let matchesRisk = true;
    if (selectedRiskTier === 'ALTO') matchesRisk = eq.predictiveRiskScore >= 70;
    else if (selectedRiskTier === 'MEDIO') matchesRisk = eq.predictiveRiskScore >= 35 && eq.predictiveRiskScore < 70;
    else if (selectedRiskTier === 'BAIXO') matchesRisk = eq.predictiveRiskScore < 35;

    return matchesSearch && matchesType && matchesCity && matchesRisk;
  });

  const activeEquipment: Equipment | undefined = 
    equipments.find(e => e.id === selectedEquipmentId) || 
    filteredEquipments[0] || 
    equipments[0];

  const relatedCalls = calls.filter(c => c.equipmentId === activeEquipment?.id);

  const handleSelectEquipment = (id: string) => {
    setSelectedEquipmentId(id);
    setMobileActiveTab('detail');
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Gestão de Frota
            </span>
            <span className="text-xs text-slate-400 font-mono">1.248 Ativos Conectados</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Inventário de Equipamentos
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
            {filteredEquipments.length} Equipamentos Filtrados
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por TAG, modelo, cliente, edifício..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 min-h-[40px]"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[40px]"
          >
            <option value="TODOS">Tipo: Todos</option>
            <option value="ELEVADOR_PASSAGEIROS">Elevador de Passageiros</option>
            <option value="ELEVADOR_CARGA">Elevador de Carga</option>
            <option value="ESCADA_ROLANTE">Escada Rolante</option>
            <option value="ESTEIRA_ROLANTE">Esteira Rolante</option>
          </select>

          <select
            value={selectedRiskTier}
            onChange={(e) => setSelectedRiskTier(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[40px]"
          >
            <option value="TODOS">Risco: Todos</option>
            <option value="ALTO">Alto Risco (Score &gt; 70)</option>
            <option value="MEDIO">Médio Risco (Score 35-70)</option>
            <option value="BAIXO">Saudável (Score &lt; 35)</option>
          </select>

          <select
            value={selectedCityFilter}
            onChange={(e) => setSelectedCityFilter(e.target.value)}
            className="col-span-2 sm:col-span-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[40px]"
          >
            <option value="TODAS">Cidade: Todas</option>
            <option value="Campinas">Campinas (SP)</option>
            <option value="São Paulo">São Paulo (SP)</option>
            <option value="São Bernardo do Campo">São Bernardo do Campo (SP)</option>
            <option value="Rio de Janeiro">Rio de Janeiro (RJ)</option>
          </select>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex rounded-xl bg-slate-900 border border-slate-800 p-1">
        <button
          onClick={() => setMobileActiveTab('list')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] touch-manipulation ${
            mobileActiveTab === 'list'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Equipamentos ({filteredEquipments.length})</span>
        </button>
        <button
          onClick={() => setMobileActiveTab('detail')}
          disabled={!activeEquipment}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] touch-manipulation disabled:opacity-50 ${
            mobileActiveTab === 'detail'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Telemetria do Ativo</span>
        </button>
      </div>

      {/* Main Grid: Master List + Active Equipment Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Equipment List */}
        <div className={`lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1 ${
          mobileActiveTab === 'detail' ? 'hidden lg:block' : 'block'
        }`}>
          {filteredEquipments.map((eq) => (
            <div
              key={eq.id}
              onClick={() => handleSelectEquipment(eq.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[60px] touch-manipulation ${
                activeEquipment?.id === eq.id
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-cyan-300">{eq.tag}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {eq.model}
                  </span>
                  {eq.hasRegenerativeDrive && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      ⚡ ReGen
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {eq.customerName}
                </div>
                <div className="text-[11px] text-slate-400">
                  {eq.buildingName} • {eq.city}
                </div>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <RiskGauge score={eq.predictiveRiskScore} />
                <span className="text-[10px] text-slate-400 block font-mono">
                  {eq.totalCallsHistoryCount} chamados hist.
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Active Equipment Dossier */}
        {activeEquipment && (
          <div className={`lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6 ${
            mobileActiveTab === 'list' ? 'hidden lg:block' : 'block'
          }`}>
            
            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1.5">
                <div className="lg:hidden mb-1">
                  <button
                    onClick={() => setMobileActiveTab('list')}
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 py-1 min-h-[36px] touch-manipulation cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar à lista de equipamentos</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-mono font-bold text-cyan-400">{activeEquipment.tag}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                    {activeEquipment.model}
                  </span>
                  {activeEquipment.hasRegenerativeDrive && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Drive Regenerativo
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-100">{activeEquipment.customerName}</h2>
                <p className="text-xs text-slate-400">{activeEquipment.buildingName} — {activeEquipment.address} ({activeEquipment.city}/{activeEquipment.state})</p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-xs font-semibold text-slate-400 mb-1">Índice de Risco Preditivo</div>
                <RiskGauge score={activeEquipment.predictiveRiskScore} />
              </div>
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-0.5">
                <span className="text-[10px] text-slate-400">Ano Instalação</span>
                <span className="font-bold font-mono text-slate-200 block text-sm">{activeEquipment.installationYear}</span>
                <span className="text-[10px] text-slate-400">{new Date().getFullYear() - activeEquipment.installationYear} anos de operação</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-0.5">
                <span className="text-[10px] text-slate-400">Ciclos de Porta</span>
                <span className="font-bold font-mono text-cyan-300 block text-sm">{(activeEquipment.doorCycles ?? 0).toLocaleString('pt-BR')}</span>
                <span className="text-[10px] text-slate-400">Total: {(activeEquipment.cyclesCount ?? 0).toLocaleString('pt-BR')}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-0.5">
                <span className="text-[10px] text-slate-400">Comando / Máquina</span>
                <span className="font-bold font-mono text-slate-200 block text-sm">{activeEquipment.machineType || 'Gearless'}</span>
                <span className="text-[10px] text-slate-400">{activeEquipment.controlType || 'MCS 220'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-0.5">
                <span className="text-[10px] text-slate-400">Telemetria IoT</span>
                <span className="font-bold font-mono text-emerald-400 block text-sm">OTIS Compass</span>
                <span className="text-[10px] text-slate-400">Status: Conectado</span>
              </div>
            </div>

            {/* SmartFlow AI Predictive Analysis Block */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Diagnóstico Preditivo SmartFlow AI
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Telemetria & Histórico</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeEquipment.riskExplanation || 'Equipamento operando dentro dos parâmetros de estabilidade sem alertas de fadiga.'}
              </p>

              {activeEquipment.predictiveRiskScore >= 70 && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" /> Prescrição de Intervenção Imediata
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Recomenda-se inclusão prioritária no lote de revisão de portas. Peça indicada: Kit Sapata AT120. Evita parada não programada estimada em 4.2 horas.
                  </p>
                </div>
              )}
            </div>

            {/* Call History for this equipment */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Histórico de Ocorrências ({relatedCalls.length} chamados registrados)
                </div>
              </div>

              <div className="space-y-2">
                {relatedCalls.map((call) => (
                  <div
                    key={call.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300">{call.callNumber}</span>
                        <span className="text-slate-400">{call.createdAt}</span>
                      </div>
                      <div className="text-slate-300">{call.problemDescription}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-bold">{call.status}</span>
                      <div className="text-[10px] text-slate-400">Por: {call.technicianName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
