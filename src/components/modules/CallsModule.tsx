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
  User, 
  Building2, 
  Wrench, 
  Package, 
  ChevronRight, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  FileSpreadsheet,
  ArrowLeft,
  ListFilter,
  FileText,
  Phone,
  Navigation,
  Check,
  Play,
  ShieldAlert,
  SlidersHorizontal,
  Info,
  Flame,
  Users,
  Bell,
  Mail,
  Award
} from 'lucide-react';
import { 
  calculateDistanceKm, 
  getRealtimeTrafficCondition, 
  checkTechnicianEquipmentFamiliarity, 
  checkPreventiveMismatch 
} from '../../utils/geoUtils';

export const CallsModule: React.FC = () => {
  const { 
    calls, 
    equipments, 
    technicians, 
    updateCallStatus, 
    reassignTechnician, 
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
    addToast({
      type: 'success',
      title: 'Status do Chamado Atualizado',
      message: `Chamado ${activeDetailCall.callNumber} agora está: ${newStatus.replace('_', ' ')}`
    });
  };

  const criticalCallsCount = relevantCalls.filter(c => c.priority === 'CRITICO' || c.hasTrappedPassenger).length;
  const inProgressCallsCount = relevantCalls.filter(c => c.status === 'A_CAMINHO' || c.status === 'EM_ATENDIMENTO').length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {isTechnician ? 'Escala de Campo' : 'Gestão de Ocorrências'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {isTechnician ? currentUser.name : `${filteredCalls.length} registros`}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {isTechnician ? 'Minhas Ordens de Serviço' : 'Central de Chamados'}
          </h1>
        </div>

        {/* Quick KPI badges & Action */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {criticalCallsCount > 0 && (
            <span className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{criticalCallsCount} Crítico(s)</span>
            </span>
          )}
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 whitespace-nowrap">
            {filteredCalls.length} Chamados
          </span>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ring-1 ring-cyan-400/40 shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Novo Chamado</span>
          </button>
        </div>
      </div>

      {/* Modal for creating intelligent call */}
      {isCreateModalOpen && (
        <CreateCallModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Quick Category Filter Bar (Touch Friendly & Responsive) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
        <button
          onClick={() => setQuickFilter('ALL')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[40px] cursor-pointer touch-manipulation shrink-0 ${
            quickFilter === 'ALL'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span>Todos ({relevantCalls.length})</span>
        </button>

        <button
          onClick={() => setQuickFilter('CRITICO')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[40px] cursor-pointer touch-manipulation shrink-0 ${
            quickFilter === 'CRITICO'
              ? 'bg-rose-500 text-white shadow-md font-extrabold'
              : 'bg-slate-900 border border-slate-800 text-rose-300 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Críticos ({criticalCallsCount})</span>
        </button>

        <button
          onClick={() => setQuickFilter('A_CAMINHO')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[40px] cursor-pointer touch-manipulation shrink-0 ${
            quickFilter === 'A_CAMINHO'
              ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 border border-slate-800 text-sky-300 hover:bg-slate-800'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>A Caminho</span>
        </button>

        <button
          onClick={() => setQuickFilter('EM_ATENDIMENTO')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[40px] cursor-pointer touch-manipulation shrink-0 ${
            quickFilter === 'EM_ATENDIMENTO'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 border border-slate-800 text-amber-300 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Em Atendimento</span>
        </button>

        <button
          onClick={() => setQuickFilter('CONCLUIDO')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[40px] cursor-pointer touch-manipulation shrink-0 ${
            quickFilter === 'CONCLUIDO'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 border border-slate-800 text-emerald-300 hover:bg-slate-800'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Concluídos</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar chamado, cliente, cidade, defeito..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[42px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all min-h-[42px] touch-manipulation cursor-pointer ${
              showAdvancedFilters || selectedPriority !== 'TODAS' || selectedStatus !== 'TODOS' || selectedCityFilter !== 'TODAS'
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros Detalhados</span>
            {(selectedPriority !== 'TODAS' || selectedStatus !== 'TODOS' || selectedCityFilter !== 'TODAS') && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>
        </div>

        {/* Collapsible Dropdown Filters */}
        {showAdvancedFilters && (
          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in duration-150">
            {/* Priority */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Prioridade</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[40px]"
              >
                <option value="TODAS">Todas as Prioridades</option>
                <option value="CRITICO">Crítico</option>
                <option value="ALTO">Alto</option>
                <option value="MEDIO">Médio</option>
                <option value="BAIXO">Baixo</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status da Ocorrência</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[40px]"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="CRIADO">Aberto / Aguardando</option>
                <option value="A_CAMINHO">A Caminho</option>
                <option value="EM_ATENDIMENTO">Em Atendimento</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cidade / Região</label>
              <select
                value={selectedCityFilter}
                onChange={(e) => setSelectedCityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[40px]"
              >
                <option value="TODAS">Todas as Cidades</option>
                <option value="Campinas">Campinas (SP)</option>
                <option value="São Paulo">São Paulo (SP)</option>
                <option value="São Bernardo do Campo">São Bernardo do Campo (SP)</option>
                <option value="Rio de Janeiro">Rio de Janeiro (RJ)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Tab Switcher for Master-Detail (Visible on screens < lg) */}
      <div className="lg:hidden flex rounded-xl bg-slate-900 border border-slate-800 p-1">
        <button
          onClick={() => setMobileActiveView('list')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] touch-manipulation cursor-pointer ${
            mobileActiveView === 'list'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Lista de O.S. ({filteredCalls.length})</span>
        </button>
        <button
          onClick={() => setMobileActiveView('detail')}
          disabled={!activeDetailCall}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] touch-manipulation cursor-pointer disabled:opacity-50 ${
            mobileActiveView === 'detail'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Dossiê da O.S. {activeDetailCall ? `(${activeDetailCall.callNumber})` : ''}</span>
        </button>
      </div>

      {/* Main Grid: Calls Master-Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left Column: Calls List */}
        <div className={`lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-0 sm:pr-1 ${
          mobileActiveView === 'detail' ? 'hidden lg:block' : 'block'
        }`}>
          {filteredCalls.map((call) => {
            const isSelected = activeDetailCall?.id === call.id;

            return (
              <div
                key={call.id}
                onClick={() => handleSelectCall(call)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 min-h-[64px] touch-manipulation ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-md ring-1 ring-cyan-500/40'
                    : call.hasTrappedPassenger
                    ? 'bg-rose-950/20 border-rose-500/50 hover:bg-rose-950/30'
                    : 'bg-slate-900/90 border-slate-800/90 hover:bg-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1.5">
                  {/* Row 1: Number, Badges & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {call.callNumber}
                      </span>
                      <PriorityBadge priority={call.priority} />
                      {call.hasTrappedPassenger && (
                        <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold animate-pulse flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          <span>PASSAGEIRO RETIDO</span>
                        </span>
                      )}
                    </div>
                    <StatusPill status={call.status} />
                  </div>

                  {/* Row 2: Customer Name & Equipment */}
                  <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center justify-between gap-2">
                    <span className="truncate">{call.customerName}</span>
                    <span className="text-cyan-300 font-mono text-xs shrink-0 font-medium">{call.equipmentTag}</span>
                  </div>

                  {/* Row 3: Building and City */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{call.buildingName} • {call.city}</span>
                  </div>

                  {/* Geolocation, Real-time Traffic & Familiarity Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] pt-0.5">
                    <span className="text-cyan-300 font-mono font-medium flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {call.distanceKm || (call.city === 'Campinas' ? '4.8' : '6.2')} km
                    </span>
                    <span>•</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                      call.trafficCondition === 'CONGESTIONADO' || call.trafficCondition === 'INTENSO'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : call.trafficCondition === 'MODERADO'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      🚦 {call.trafficCondition || 'Trânsito Moderado'}{call.trafficDelayMinutes ? ` (+${call.trafficDelayMinutes}m)` : ''}
                    </span>
                    {call.technicianFamiliarity?.knowsEquipment && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        ⭐ Conhece Ativo
                      </span>
                    )}
                    {call.technicianFamiliarity?.preventiveTechMismatch && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        ⚠️ Descompasso Preventiva
                      </span>
                    )}
                  </div>

                  {/* Row 4: Problem snippet */}
                  <p className="text-xs text-slate-300 line-clamp-2 pt-0.5">
                    {call.problemDescription}
                  </p>
                </div>

                {/* Footer with Technician and SLA */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">
                    Técnico: <strong className="text-slate-200">{call.technicianName || 'Pendente'}</strong>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-slate-300 shrink-0">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>SLA: {call.slaMaxHours}h</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCalls.length === 0 && (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
              <Info className="w-6 h-6 text-slate-500 mx-auto" />
              <p>Nenhum chamado encontrado para os filtros selecionados.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPriority('TODAS');
                  setSelectedStatus('TODOS');
                  setQuickFilter('ALL');
                  setSelectedCityFilter('TODAS');
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Active Call Detailed Dossier & Timeline */}
        {activeDetailCall ? (
          <div className={`lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 sm:space-y-6 ${
            mobileActiveView === 'list' ? 'hidden lg:block' : 'block'
          }`}>
            
            {/* Dossier Header & Top Primary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg space-y-4">
              
              {/* Header Top Bar with Mobile Back */}
              <div className="space-y-3 pb-3 border-b border-slate-800">
                
                {/* Mobile Back Button (Top) */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setMobileActiveView('list')}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg min-h-[38px] touch-manipulation cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-cyan-400" />
                    <span>Voltar à lista de chamados</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-mono font-bold text-cyan-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                        {activeDetailCall.callNumber}
                      </span>
                      <PriorityBadge priority={activeDetailCall.priority} />
                      <StatusPill status={activeDetailCall.status} />
                      {activeDetailCall.hasTrappedPassenger && (
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-500 text-white text-[11px] font-bold animate-pulse flex items-center gap-1 shadow-md shadow-rose-900/50">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>PASSAGEIRO RETIDO</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
                      {activeDetailCall.customerName}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right shrink-0 space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Contrato</span>
                    <span className="text-xs font-mono font-bold text-cyan-300">{activeDetailCall.contractNumber}</span>
                  </div>
                </div>

                {/* Quick Touch Actions: Ligar, Abrir GPS */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <a
                    href={`tel:${activeDetailCall.customerPhone || '1999887766'}`}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 min-h-[40px] touch-manipulation transition-all border border-emerald-500/30 whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ligar Portaria/Cliente</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activeDetailCall.address}, ${activeDetailCall.city} - ${activeDetailCall.state}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 text-sky-200 text-xs font-bold flex items-center justify-center gap-2 min-h-[40px] touch-manipulation cursor-pointer border border-sky-500/40 transition-all whitespace-nowrap"
                  >
                    <Navigation className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Abrir no GPS</span>
                  </a>
                </div>
              </div>

              {/* Grid with the 4 Essential Primary Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                
                {/* Block 1: Endereço */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Endereço & Edifício</span>
                  </div>
                  <div className="text-xs font-bold text-slate-100 line-clamp-1">
                    {activeDetailCall.buildingName}
                  </div>
                  <div className="text-[11px] text-slate-300 line-clamp-2">
                    {activeDetailCall.address}, {activeDetailCall.city}/{activeDetailCall.state}
                  </div>
                </div>

                {/* Block 2: Modelo do Serviço */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Modelo do Serviço</span>
                  </div>
                  <div className="text-xs font-bold text-slate-100">
                    {activeDetailCall.equipmentType === 'ELEVADOR_PASSAGEIROS' ? 'Elevador de Passageiros' : activeDetailCall.equipmentType === 'ESCADA_ROLANTE' ? 'Escada Rolante' : 'Elevador'}
                  </div>
                  <div className="text-[11px] text-cyan-300 font-mono font-medium">
                    {activeDetailCall.equipmentModel} • {activeDetailCall.equipmentTag}
                  </div>
                </div>

                {/* Block 3: Quantos Tem */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Quantos Tem no Local</span>
                  </div>
                  <div className="text-xs font-bold text-slate-100">
                    {equipments.filter(e => e.buildingName === activeDetailCall.buildingName || e.customerId === activeDetailCall.customerId).length || 4} Elevadores no Edifício
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>1 Parado • {(equipments.filter(e => e.buildingName === activeDetailCall.buildingName || e.customerId === activeDetailCall.customerId).length || 4) - 1} Operacionais</span>
                  </div>
                </div>

                {/* Block 4: Horário que Parou */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Horário que Parou</span>
                  </div>
                  <div className="text-xs font-bold text-rose-300 font-mono">
                    {activeDetailCall.createdAt ? `${activeDetailCall.createdAt.split('T')[1]?.substring(0, 5) || '10:15'}` : '10:15'}
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    SLA Limite: <strong className="text-white">{activeDetailCall.slaMaxHours}h</strong>
                  </div>
                </div>

              </div>

            </div>

            {/* Technical Breakdown & Staff */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classificação Técnica & Local</div>
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <span>{activeDetailCall.equipmentTag} — {activeDetailCall.equipmentModel}</span>
                  {activeDetailCall.equipmentBrand && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-cyan-300 border border-slate-700">
                      {activeDetailCall.equipmentBrand}
                    </span>
                  )}
                </div>
                <div className="text-slate-400">Tipo de Local: <strong className="text-slate-200">{activeDetailCall.buildingType || 'Prédio Comercial'}</strong></div>
                <div className="text-slate-400">Componente: <strong className="text-slate-200">{activeDetailCall.mainComponent}</strong></div>
                <div className="text-slate-400">Subcomponente: <strong className="text-slate-200">{activeDetailCall.subComponent}</strong></div>
                <div className="text-slate-400">Falha: <strong className="text-slate-200">{activeDetailCall.defectType}</strong></div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Equipe Técnica Designada</span>
                  {activeDetailCall.assignedTechnicians && activeDetailCall.assignedTechnicians.length > 1 && (
                    <span className="text-amber-400 font-bold">{activeDetailCall.assignedTechnicians.length} Técnicos</span>
                  )}
                </div>
                
                {/* List all assigned technicians (Lead + Support) */}
                <div className="space-y-1.5">
                  {(activeDetailCall.assignedTechnicians && activeDetailCall.assignedTechnicians.length > 0
                    ? activeDetailCall.assignedTechnicians
                    : [{
                        id: activeDetailCall.technicianId || 'tech-1',
                        name: activeDetailCall.technicianName || 'Técnico Responsável',
                        phone: '(19) 98822-1010',
                        role: 'LEAD',
                        specialties: ['Sistemas de Tração', 'Portas AT120']
                      }]
                  ).map((tech, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                            tech.role === 'LEAD' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {tech.role === 'LEAD' ? '⭐ Líder' : '🤝 Apoio'}
                          </span>
                          <strong className="text-white text-xs">{tech.name}</strong>
                        </div>
                        {tech.specialties && tech.specialties.length > 0 && (
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            Skills: {tech.specialties.join(', ')}
                          </div>
                        )}
                      </div>
                      <a
                        href={`tel:${tech.phone || '19988221010'}`}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[10px] flex items-center gap-1 shrink-0"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>Ligar</span>
                      </a>
                    </div>
                  ))}
                </div>

                {activeDetailCall.notificationMethod && (
                  <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-2 flex-wrap border-t border-slate-800/60">
                    <span className="text-slate-500 font-bold">Despacho:</span>
                    {activeDetailCall.notificationMethod.appPush && (
                      <span className="text-cyan-300">✓ Push Mobile</span>
                    )}
                    {activeDetailCall.notificationMethod.phoneCall && (
                      <span className="text-emerald-300">✓ Ligação de Voz</span>
                    )}
                    {activeDetailCall.notificationMethod.urgentAlertEmail && (
                      <span className="text-rose-300">✓ E-mail Registro SLA</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Operational Intelligence Card: Traffic, Familiarity, Preventive Mismatch & Address Pinning */}
            {(() => {
              const activeEquipment = equipments.find(e => e.id === activeDetailCall.equipmentId);
              const assignedTech = technicians.find(t => t.id === activeDetailCall.technicianId || t.name === activeDetailCall.technicianName);
              const isPreventiveMismatch = activeEquipment?.preventiveTechnicianName && 
                assignedTech && 
                activeEquipment.preventiveTechnicianName.toLowerCase() !== assignedTech.name.toLowerCase();
              const knowsEq = assignedTech && activeEquipment ? checkTechnicianEquipmentFamiliarity(assignedTech, activeEquipment).knowsEquipment : false;
              const isAddressFixed = Boolean(fixedAddressTechnicians[activeDetailCall.address]?.technicianId === activeDetailCall.technicianId);

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/30 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Logística em Tempo Real & Alinhamento Técnico
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Telemetria Inteligente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* Traffic & Distance */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Distância & Trânsito</div>
                      <div className="text-cyan-300 font-mono font-bold text-sm">
                        {activeDetailCall.distanceKm || '4.8'} km
                      </div>
                      <div className="text-[11px] text-slate-300">
                        🚦 {activeDetailCall.trafficCondition || 'Trânsito Moderado'} (+{activeDetailCall.trafficDelayMinutes || 4} min TA)
                      </div>
                    </div>

                    {/* Equipment Knowledge */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Familiaridade com o Ativo</div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        {knowsEq ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Já Conhece o Ativo</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">
                            Primeiro Atendimento
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {knowsEq ? 'Histórico de folgas e manutenções anteriores dominado' : 'Equipamento padrão linha Otis'}
                      </div>
                    </div>

                    {/* Address Fixation Status */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Técnico Residente por Endereço</div>
                      <div className="text-sm font-bold">
                        {isAddressFixed ? (
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            <span>Fixado no Local</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">
                            Despacho Rotativo
                          </span>
                        )}
                      </div>
                      <div className="pt-0.5">
                        {isAddressFixed ? (
                          <button
                            type="button"
                            onClick={() => unfixTechnicianFromAddress(activeDetailCall.address)}
                            className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                          >
                            Desafixar deste endereço
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (assignedTech) {
                                fixTechnicianToAddress(
                                  activeDetailCall.address,
                                  activeDetailCall.buildingName,
                                  assignedTech.id,
                                  assignedTech.name
                                );
                              }
                            }}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                          >
                            + Fixar como residente
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preventive vs Emergency Mismatch Banner */}
                  {isPreventiveMismatch && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>⚠️ Descompasso de Equipe (Preventiva ≠ Emergência):</strong>
                        <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                          O técnico titular da manutenção preventiva deste elevador é <strong>{activeEquipment?.preventiveTechnicianName}</strong>, mas a ordem emergencial foi atribuída a <strong>{activeDetailCall.technicianName}</strong>. Recomenda-se briefing rápido do relatório de desgastes e folgas da última preventiva.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Problem Description */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Descrição Detalhada da Ocorrência</div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {activeDetailCall.problemDescription}
              </p>
              {activeDetailCall.hasTrappedPassenger && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>OCORRÊNCIA CRÍTICA: Passageiro no interior da cabina. Resgate prioritário de segurança.</span>
                </div>
              )}
            </div>

            {/* AI Recommendation & Intelligence Block */}
            {activeDetailCall.aiRecommendation && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-700/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Diagnóstico do SmartFlow AI Copilot
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">{activeDetailCall.aiRecommendation.confidence}% confiança</span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeDetailCall.aiRecommendation.matchReason}
                </p>

                {activeDetailCall.aiRecommendation.historicalPatternFound && (
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-amber-300">
                    <strong>Padrão Histórico Identificado:</strong> {activeDetailCall.aiRecommendation.historicalPatternFound}
                  </div>
                )}
              </div>
            )}

            {/* Quick Status Workflow Progress Buttons (Touch Friendly) */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Avanço Rápido do Chamado
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickStatusChange('A_CAMINHO', 'Técnico iniciou deslocamento via app mobile')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] touch-manipulation ${
                    activeDetailCall.status === 'A_CAMINHO'
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-sky-500/40 hover:text-sky-300'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  <span>1. A Caminho</span>
                </button>

                <button
                  onClick={() => handleQuickStatusChange('EM_ATENDIMENTO', 'Técnico chegou ao local e iniciou análise')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] touch-manipulation ${
                    activeDetailCall.status === 'EM_ATENDIMENTO'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-amber-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>2. Cheguei</span>
                </button>

                <button
                  onClick={() => handleQuickStatusChange('CONCLUIDO', 'Chamado concluído com sucesso e equipamento liberado')}
                  className={`col-span-2 sm:col-span-1 p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] touch-manipulation ${
                    activeDetailCall.status === 'CONCLUIDO'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>3. Concluir</span>
                </button>
              </div>
            </div>

            {/* Interactive Timeline */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Linha do Tempo do Atendimento (Auditoria de SLA)
              </div>
              <div className="space-y-3 pl-2 border-l-2 border-slate-800">
                {activeDetailCall.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-4">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-100">{event.step}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{event.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Por: {event.author}</span>
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
