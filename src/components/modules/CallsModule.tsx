import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusPill } from '../common/UIComponents';
import { CreateCallModal } from '../modals/CreateCallModal';
import { Call, CallPriority, CallStatus } from '../../types';
import { 
  PhoneCall, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Clock, 
  MapPin, 
  Building2, 
  Wrench, 
  Package, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  ArrowLeft, 
  Phone, 
  Navigation, 
  Check, 
  ShieldAlert, 
  SlidersHorizontal, 
  Info,
  Calendar,
  User,
  Award
} from 'lucide-react';
import { 
  checkTechnicianEquipmentFamiliarity 
} from '../../utils/geoUtils';

export const CallsModule: React.FC = () => {
  const { 
    calls, 
    equipments, 
    technicians, 
    updateCallStatus, 
    selectedCityFilter, 
    setSelectedCityFilter, 
    currentUser,
    addToast,
    fixedAddressTechnicians,
    fixTechnicianToAddress,
    unfixTechnicianFromAddress
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('TODAS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'CRITICO' | 'CRIADO' | 'A_CAMINHO' | 'EM_ATENDIMENTO' | 'CONCLUIDO'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isTechnician = currentUser.role === 'TECNICO';

  const relevantCalls = isTechnician
    ? calls.filter(c => c.technicianName?.toLowerCase().includes(currentUser.name.toLowerCase()) || c.city === currentUser.city)
    : calls;

  const [activeDetailCall, setActiveDetailCall] = useState<Call | null>(relevantCalls[0] || calls[0] || null);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'detail'>('list');

  // Filter logic
  const filteredCalls = relevantCalls.filter(c => {
    const matchesSearch = 
      c.callNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.equipmentTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.problemDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = selectedPriority === 'TODAS' || c.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'TODOS' || c.status === selectedStatus;
    const matchesCity = selectedCityFilter === 'TODAS' || c.city.toLowerCase() === selectedCityFilter.toLowerCase();

    const matchesQuickFilter = 
      quickFilter === 'ALL' ? true :
      quickFilter === 'CRITICO' ? (c.priority === 'CRITICO' || c.hasTrappedPassenger) :
      c.status === quickFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesCity && matchesQuickFilter;
  });

  const handleSelectCall = (call: Call) => {
    setActiveDetailCall(call);
    setMobileActiveView('detail');
  };

  const handleQuickStatusChange = (newStatus: CallStatus, message: string) => {
    if (!activeDetailCall) return;
    updateCallStatus(activeDetailCall.id, newStatus, message);
    setActiveDetailCall(prev => prev ? { ...prev, status: newStatus } : null);
    addToast('success', 'Status da O.S. Atualizado', `${activeDetailCall.callNumber}: ${newStatus.replace('_', ' ')}`);
  };

  const criticalCallsCount = relevantCalls.filter(c => c.priority === 'CRITICO' || c.hasTrappedPassenger).length;
  const inProgressCallsCount = relevantCalls.filter(c => c.status === 'A_CAMINHO' || c.status === 'EM_ATENDIMENTO').length;
  const completedCallsCount = relevantCalls.filter(c => c.status === 'CONCLUIDO').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* 1. UNIFIED COMPACT HEADER & SUMMARY BAR */}
      <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isTechnician ? 'Minhas Ordens de Serviço' : 'Central de Ocorrências'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {isTechnician ? 'Técnico de Campo' : 'Central 24h'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isTechnician ? `${currentUser.name} • Polo ${currentUser.city || 'Campinas'}` : 'Supervisão e despacho de chamados'}
            </p>
          </div>
        </div>

        {/* Mini KPI Bar */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setQuickFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              quickFilter === 'ALL'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Total: <span className="font-mono text-cyan-400 font-bold">{relevantCalls.length}</span>
          </button>

          <div className="w-px h-4 bg-slate-800" />

          <button
            onClick={() => setQuickFilter('CRITICO')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              quickFilter === 'CRITICO'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Críticos:</span>
            <span className="font-mono text-rose-400 font-bold">{criticalCallsCount}</span>
          </button>

          <div className="w-px h-4 bg-slate-800" />

          <button
            onClick={() => setQuickFilter('EM_ATENDIMENTO')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              quickFilter === 'EM_ATENDIMENTO'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Em Curso:</span>
            <span className="font-mono text-amber-400 font-bold">{inProgressCallsCount}</span>
          </button>

          <div className="w-px h-4 bg-slate-800" />

          <button
            onClick={() => setQuickFilter('CONCLUIDO')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              quickFilter === 'CONCLUIDO'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Concluídos:</span>
            <span className="font-mono text-emerald-400 font-bold">{completedCallsCount}</span>
          </button>

          {!isTechnician && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="ml-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal for creating intelligent call */}
      {isCreateModalOpen && (
        <CreateCallModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* 2. UNIFIED SEARCH & QUICK FILTER TOOLBAR (Single Compact Bar) */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número, cliente, elevador, defeito..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[38px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[38px]"
          >
            <option value="TODAS">Todas Prioridades</option>
            <option value="CRITICO">Crítico</option>
            <option value="ALTO">Alto</option>
            <option value="MEDIO">Médio</option>
            <option value="BAIXO">Baixo</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[38px]"
          >
            <option value="TODOS">Todos Status</option>
            <option value="CRIADO">Aberto</option>
            <option value="A_CAMINHO">A Caminho</option>
            <option value="EM_ATENDIMENTO">Em Atendimento</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>

          {(selectedPriority !== 'TODAS' || selectedStatus !== 'TODOS' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPriority('TODAS');
                setSelectedStatus('TODOS');
                setQuickFilter('ALL');
              }}
              className="p-2 text-xs text-rose-400 hover:text-rose-300 font-bold"
              title="Limpar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex rounded-xl bg-slate-950 border border-slate-800 p-1">
        <button
          onClick={() => setMobileActiveView('list')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
            mobileActiveView === 'list'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Lista ({filteredCalls.length})</span>
        </button>
        <button
          onClick={() => setMobileActiveView('detail')}
          disabled={!activeDetailCall}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 ${
            mobileActiveView === 'detail'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Dossiê {activeDetailCall ? `(${activeDetailCall.callNumber})` : ''}</span>
        </button>
      </div>

      {/* 3. MASTER-DETAIL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Clean Calls List (5 cols) */}
        <div className={`lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm space-y-2.5 max-h-[720px] overflow-y-auto ${
          mobileActiveView === 'detail' ? 'hidden lg:block' : 'block'
        }`}>
          {filteredCalls.map((call) => {
            const isSelected = activeDetailCall?.id === call.id;
            const isCritical = call.priority === 'CRITICO' || call.hasTrappedPassenger;

            return (
              <div
                key={call.id}
                onClick={() => handleSelectCall(call)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                {/* Left Priority Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isCritical ? 'bg-rose-500' : call.priority === 'ALTO' ? 'bg-amber-500' : 'bg-cyan-500'
                }`} />

                <div className="flex items-start justify-between gap-2 pl-1.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-400">{call.callNumber}</span>
                      <PriorityBadge priority={call.priority} />
                      {call.hasTrappedPassenger && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-bold animate-pulse">
                          Passageiro Preso
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {call.customerName}
                    </h4>
                  </div>

                  <StatusPill status={call.status} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pl-1.5 pt-1 border-t border-slate-800/60">
                  <span className="truncate">{call.buildingName} • {call.equipmentTag}</span>
                  <div className="flex items-center gap-2 font-mono text-slate-300 text-[10px] shrink-0">
                    <span>{call.distanceKm || '4.8'} km</span>
                    <span>•</span>
                    <span>SLA {call.slaMaxHours}h</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCalls.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs space-y-2">
              <Info className="w-5 h-5 text-slate-500 mx-auto" />
              <p>Nenhuma ordem de serviço encontrada.</p>
            </div>
          )}
        </div>

        {/* Right Column: Clean Dossier View (7 cols) */}
        {activeDetailCall ? (
          <div className={`lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
            mobileActiveView === 'list' ? 'hidden lg:block' : 'block'
          }`}>
            
            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="lg:hidden pb-1">
                  <button
                    onClick={() => setMobileActiveView('list')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Voltar à Lista</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {activeDetailCall.callNumber}
                  </span>
                  <PriorityBadge priority={activeDetailCall.priority} />
                  <StatusPill status={activeDetailCall.status} />
                  {activeDetailCall.hasTrappedPassenger && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Passageiro Preso
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-white tracking-tight">
                  {activeDetailCall.customerName}
                </h2>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{activeDetailCall.buildingName} • {activeDetailCall.address}, {activeDetailCall.city}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <a
                  href={`tel:${activeDetailCall.customerPhone || '19988776655'}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ligar</span>
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activeDetailCall.address}, ${activeDetailCall.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>GPS</span>
                </a>
              </div>
            </div>

            {/* Workflow Progress Bar */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickStatusChange('A_CAMINHO', 'Iniciado deslocamento')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeDetailCall.status === 'A_CAMINHO'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>1. A Caminho</span>
              </button>

              <button
                onClick={() => handleQuickStatusChange('EM_ATENDIMENTO', 'Chegada confirmada')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeDetailCall.status === 'EM_ATENDIMENTO'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>2. No Local</span>
              </button>

              <button
                onClick={() => handleQuickStatusChange('CONCLUIDO', 'Chamado resolvido')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeDetailCall.status === 'CONCLUIDO'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>3. Concluir</span>
              </button>
            </div>

            {/* Essential Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Equipamento:</span>
                <strong className="text-white font-mono">{activeDetailCall.equipmentTag}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Modelo:</span>
                <span className="text-slate-300">{activeDetailCall.equipmentModel}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Contrato:</span>
                <span className="text-cyan-400 font-mono">{activeDetailCall.contractNumber}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">SLA Limite:</span>
                <span className="text-slate-300 font-mono">{activeDetailCall.slaMaxHours} horas</span>
              </div>
            </div>

            {/* Problem & AI Diagnostic */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Defeito Relatado
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  {activeDetailCall.mainComponent} ({activeDetailCall.subComponent})
                </span>
              </div>
              <p className="text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                {activeDetailCall.problemDescription}
              </p>
              {activeDetailCall.aiRecommendation?.matchReason && (
                <div className="text-xs text-slate-400 italic pt-1">
                  💡 <strong>Diagnóstico Copilot:</strong> {activeDetailCall.aiRecommendation.matchReason}
                </div>
              )}
            </div>

            {/* Timeline History */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">
                Histórico de Atendimento
              </span>
              <div className="space-y-2 pl-2 border-l-2 border-slate-800">
                {activeDetailCall.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-3 space-y-0.5">
                    <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-cyan-400" />
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-xs">{event.step}</strong>
                      <span className="text-[10px] font-mono text-slate-500">{event.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : null}

      </div>

    </div>
  );
};
