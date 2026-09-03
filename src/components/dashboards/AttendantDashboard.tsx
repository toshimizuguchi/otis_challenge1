import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusPill } from '../common/UIComponents';
import { CreateCallModal } from '../modals/CreateCallModal';
import { 
  PhoneCall, 
  PlusCircle, 
  Search, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Users, 
  MapPin, 
  FileText, 
  Headphones, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  Radio
} from 'lucide-react';

export const AttendantDashboard: React.FC = () => {
  const { calls, setSelectedCallId, setActiveView, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingCall, setIsCreatingCall] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'OPEN' | 'IN_SERVICE' | 'CRITICAL' | 'COMPLETED'>('ALL');

  // Stats calculation
  const totalCallsCount = calls.length;
  const openCallsCount = calls.filter(c => c.status === 'CRIADO' || c.status === 'ACEITO' || c.status === 'A_CAMINHO').length;
  const inServiceCallsCount = calls.filter(c => c.status === 'EM_ATENDIMENTO').length;
  const criticalCallsCount = calls.filter(c => c.priority === 'CRITICO' || c.hasTrappedPassenger || (c.severityLevel ?? 0) >= 4).length;
  const completedCallsCount = calls.filter(c => c.status === 'CONCLUIDO').length;

  const filteredCalls = calls.filter(c => {
    const matchesSearch = 
      c.callNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.equipmentTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.technicianName && c.technicianName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTab = 
      selectedTab === 'ALL' ? true :
      selectedTab === 'OPEN' ? (c.status === 'CRIADO' || c.status === 'ACEITO' || c.status === 'A_CAMINHO') :
      selectedTab === 'IN_SERVICE' ? (c.status === 'EM_ATENDIMENTO') :
      selectedTab === 'CRITICAL' ? (c.priority === 'CRITICO' || c.hasTrappedPassenger || (c.severityLevel ?? 0) >= 4) :
      selectedTab === 'COMPLETED' ? (c.status === 'CONCLUIDO') : true;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Operator Greeting & Attendant Profile Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/10" 
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 text-cyan-400 font-black text-xl flex items-center justify-center ring-2 ring-cyan-500/30">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Headphones className="w-3 h-3 text-cyan-400" />
                Atendente Conectada
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentUser.region || currentUser.city || 'Central de Atendimento 24/7'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Olá, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Recepção, triagem e despacho de ordens de serviço e chamados emergenciais.
            </p>
          </div>
        </div>

        {/* Quick Primary Actions */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setActiveView('history')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm hover:text-white"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Consultar Histórico</span>
          </button>

          <button
            onClick={() => setIsCreatingCall(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-600/30 transition-all cursor-pointer ring-1 ring-cyan-400/50 hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Abrir Novo Chamado</span>
          </button>
        </div>
      </div>

      {/* KPI Counters for Attendant */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => setSelectedTab('OPEN')}
          className={`p-4 rounded-2xl bg-slate-900/90 border transition-all cursor-pointer space-y-1 ${
            selectedTab === 'OPEN' ? 'border-cyan-500/60 bg-cyan-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> Em Aberto</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">{openCallsCount}</div>
          <div className="text-[11px] text-slate-400">Aguardando atendimento</div>
        </div>

        <div 
          onClick={() => setSelectedTab('IN_SERVICE')}
          className={`p-4 rounded-2xl bg-slate-900/90 border transition-all cursor-pointer space-y-1 ${
            selectedTab === 'IN_SERVICE' ? 'border-blue-500/60 bg-blue-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /> Em Execução</span>
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-200 font-mono">{inServiceCallsCount}</div>
          <div className="text-[11px] text-blue-400/80">Técnicos em campo</div>
        </div>

        <div 
          onClick={() => setSelectedTab('CRITICAL')}
          className={`p-4 rounded-2xl bg-slate-900/90 border transition-all cursor-pointer space-y-1 ${
            selectedTab === 'CRITICAL' ? 'border-rose-500/60 bg-rose-950/20' : 'border-rose-500/30 hover:border-rose-500/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-rose-400" /> Urgências</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-200 font-mono">{criticalCallsCount}</div>
          <div className="text-[11px] text-rose-400/80">Nível 4 a 5 / Resgate</div>
        </div>

        <div 
          onClick={() => setSelectedTab('COMPLETED')}
          className={`p-4 rounded-2xl bg-slate-900/90 border transition-all cursor-pointer space-y-1 ${
            selectedTab === 'COMPLETED' ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Concluídos</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-200 font-mono">{completedCallsCount}</div>
          <div className="text-[11px] text-emerald-400/80">Atendimentos finalizados</div>
        </div>
      </div>

      {/* Modal for Creating Call */}
      {isCreatingCall && (
        <CreateCallModal
          isOpen={isCreatingCall}
          onClose={() => setIsCreatingCall(false)}
        />
      )}

      {/* Calls Queue / List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              Fila de Chamados e Ocorrências ({filteredCalls.length})
            </h3>
            <p className="text-xs text-slate-400">
              Operador logado: <strong className="text-slate-200">{currentUser.name}</strong> • Pesquise por cliente, endereço, chamado ou técnico
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente, endereço, tag, OS..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setActiveView('history')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Acessar Histórico Completo"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Histórico</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'Todos os Chamados', count: totalCallsCount },
            { id: 'OPEN', label: 'Em Aberto', count: openCallsCount },
            { id: 'IN_SERVICE', label: 'Em Atendimento', count: inServiceCallsCount },
            { id: 'CRITICAL', label: 'Urgentes (Nível 4-5)', count: criticalCallsCount },
            { id: 'COMPLETED', label: 'Concluídos', count: completedCallsCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                selectedTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* List of Calls */}
        <div className="space-y-3 pt-1">
          {filteredCalls.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-2">
              <PhoneCall className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs">Nenhum chamado encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            filteredCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => {
                  setSelectedCallId(call.id);
                  setActiveView('calls');
                }}
                className="p-4 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-cyan-300">{call.callNumber}</span>
                    <PriorityBadge priority={call.priority} />
                    <StatusPill status={call.status} />
                    {call.severityLevel !== undefined && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 ${
                        call.severityLevel >= 5
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : call.severityLevel >= 4
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : call.severityLevel >= 3
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        <Flame className="w-3 h-3" />
                        Gravidade {call.severityLevel}/5
                      </span>
                    )}
                    {call.equipmentBrand && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {call.equipmentBrand}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">{call.origin}</span>
                  </div>

                  <div className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                    {call.customerName} • {call.equipmentTag} ({call.equipmentModel})
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{call.address} — {call.buildingName} ({call.city}/{call.state})</span>
                  </div>

                  <div className="text-xs text-slate-300 line-clamp-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    {call.problemDescription}
                  </div>
                </div>

                <div className="shrink-0 space-y-1.5 md:border-l md:border-slate-800 md:pl-4 flex flex-col md:items-end justify-center">
                  <div className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      Técnico: <strong className="text-cyan-300">{call.technicianName || 'Em triagem'}</strong>
                      {call.assignedTechnicians && call.assignedTechnicians.length > 1 && (
                        <span className="text-[10px] text-amber-300 font-mono ml-1">
                          (+{call.assignedTechnicians.length - 1} apoio)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supervisor: {call.supervisorName}
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400">
                    SLA Máximo: {call.slaMaxHours}h
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

