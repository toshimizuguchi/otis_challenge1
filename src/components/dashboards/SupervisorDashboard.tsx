import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard, TechStatusBadge, PriorityBadge, StatusPill } from '../common/UIComponents';
import { 
  Users, 
  PhoneCall, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  PhoneForwarded, 
  ArrowRight, 
  Layers,
  Wrench,
  ShieldAlert,
  Send,
  Navigation,
  Radio,
  Phone,
  Maximize2,
  Compass,
  Eye
} from 'lucide-react';
import { Technician } from '../../types';

export const SupervisorDashboard: React.FC = () => {
  const { 
    technicians, 
    calls, 
    reassignTechnician, 
    confirmAIRecommendation, 
    setSelectedCallId, 
    setActiveView,
    addToast
  } = useApp();

  const [selectedTechFilter, setSelectedTechFilter] = useState<string>('TODOS');
  const [techViewMode, setTechViewMode] = useState<'map' | 'list'>('map');
  const [overrideModalCallId, setOverrideModalCallId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [chosenTechId, setChosenTechId] = useState<string>(technicians[0]?.id || '');

  // Campinas Polo Supervisor: Roberto Viana
  const poloTechnicians = technicians.filter(t => 
    t.city === 'Campinas' || t.supervisorName.includes('Viana') || t.supervisorId === 'sup-1'
  );
  
  const myTechnicians = selectedTechFilter === 'TODOS'
    ? poloTechnicians
    : poloTechnicians.filter(t => t.status === selectedTechFilter);

  const [selectedMapTechId, setSelectedMapTechId] = useState<string>(
    poloTechnicians[0]?.id || technicians[0]?.id || ''
  );

  const selectedMapTech = technicians.find(t => t.id === selectedMapTechId) || poloTechnicians[0] || technicians[0];
  const myCalls = calls.filter(c => c.city === 'Campinas' || c.supervisorName.includes('Viana'));
  
  const activeCalls = myCalls.filter(c => c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO');
  const criticalCalls = activeCalls.filter(c => c.priority === 'CRITICO');

  const delayedTechs = poloTechnicians.filter(t => t.overdueAlert || t.status === 'ATRASADO');
  const availableTechs = poloTechnicians.filter(t => t.status === 'DISPONIVEL');

  const handleOpenOverride = (callId: string) => {
    setOverrideModalCallId(callId);
    setOverrideReason('Técnico mais próximo com especialidade compatível no trajeto.');
  };

  const handleConfirmOverride = () => {
    if (!overrideModalCallId) return;
    reassignTechnician(overrideModalCallId, chosenTechId, overrideReason);
    setOverrideModalCallId(null);
    setOverrideReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Welcome & Supervisor Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Centro de Comando Operacional
            </span>
            <span className="text-xs text-slate-400 font-mono">Polo Regional: Campinas & RMC</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Bom dia, Roberto Viana (Supervisor).
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Acompanhe o posicionamento dos seus técnicos, alertas de SLA em tempo real e recomendações do Copilot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('maps')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Mapa em Tempo Real</span>
          </button>
        </div>
      </div>

      {/* Supervisor Tactical KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Técnicos na Equipe"
          value={`${availableTechs.length}/${myTechnicians.length}`}
          subtitle={`${availableTechs.length} disponíveis agora`}
          icon={<Users className="w-5 h-5 text-emerald-400" />}
          badge="Tempo Real"
        />
        <MetricCard
          title="Chamados Ativos Polo"
          value={activeCalls.length}
          change={`${criticalCalls.length} em nível crítico`}
          isPositive={criticalCalls.length === 0}
          icon={<PhoneCall className="w-5 h-5 text-cyan-400" />}
          subtitle="Campinas & RMC"
        />
        <MetricCard
          title="SLA da Equipe (Mês)"
          value="97.6%"
          change="Meta: > 98.0%"
          isPositive={true}
          icon={<CheckCircle2 className="w-5 h-5 text-indigo-400" />}
          subtitle="Tempo Médio TA: 18 min"
        />
        <MetricCard
          title="Desvios de Tempo"
          value={delayedTechs.length}
          subtitle="Acima da média histórica"
          isPositive={delayedTechs.length === 0}
          icon={<Clock className="w-5 h-5 text-rose-400" />}
          badge={delayedTechs.length > 0 ? "Ação Requerida" : "Normal"}
        />
      </div>

      {/* AI Copilot Operational Prescription Panel */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-700/40 shadow-sm relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">SmartFlow AI — Recomendações em Tempo Real para o Supervisor</h3>
              <p className="text-xs text-slate-400">A IA detecta anomalias de tempo, proximidade geográfica e especialidade</p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
            Copiloto Ativo
          </span>
        </div>

        {/* Prescription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Recommendation 1: Technician Overdue */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">
                  Alerta Operacional
                </span>
                <span className="text-xs font-bold text-slate-200">João Pedro Santos</span>
              </div>
              <span className="text-xs font-mono text-rose-400 font-bold">47 min no local</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-400 font-semibold">Problema:</span> Tempo de atendimento excedendo a média histórica.
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400 font-semibold">Evidência:</span> Tempo atual: 47 min | Média histórica modelo Gen2 Comfort: 22 min.
              </div>
              <div className="text-cyan-300 font-medium">
                <span className="text-slate-400 font-semibold">Recomendação da IA:</span> Verificar necessidade de suporte técnico ou envio do Kit Sapata AT120. Carlos Mendonça está livre a 7.2 km.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  addToast({
                    type: 'info',
                    title: 'Contato com Técnico',
                    message: 'Mensagem de suporte e telemetria enviada para João Pedro no celular (19) 98822-1010.'
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Entrar em Contato
              </button>
              <button
                onClick={() => handleOpenOverride('call-1001')}
                className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reatribuir / Apoio
              </button>
              <button
                onClick={() => {
                  setSelectedCallId('call-1001');
                  setActiveView('calls');
                }}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Ver Chamado
              </button>
            </div>
          </div>

          {/* Recommendation 2: Smart Geo Batching */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  Otimização de Rota
                </span>
                <span className="text-xs font-bold text-slate-200">Viracopos & Cambuí</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">-18 km rodados</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-400 font-semibold">Problema:</span> 2 chamados abertos no mesmo corredor viário (Santos Dumont).
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400 font-semibold">Evidência:</span> Lucas Ferreira já está em deslocamento com peças compatíveis para ambos.
              </div>
              <div className="text-cyan-300 font-medium">
                <span className="text-slate-400 font-semibold">Recomendação da IA:</span> Agrupar a ordem de serviço preventiva com o chamado de Viracopos para o mesmo técnico.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  addToast({
                    type: 'success',
                    title: 'Agrupamento Concluído',
                    message: 'Ordens de serviço agrupadas na rota de Lucas Ferreira.'
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Aprovar Agrupamento
              </button>
              <button
                onClick={() => setActiveView('maps')}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Ver no Mapa
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Technicians Operational Board + Live Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Technicians Live Map & Operational Board */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-100">Mapa Operacional de Técnicos</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  Ao Vivo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Posicionamento GPS e status dos mecânicos de Campinas & RMC</p>
            </div>
            
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setTechViewMode('map')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    techViewMode === 'map'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>Mapa</span>
                </button>
                <button
                  onClick={() => setTechViewMode('list')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    techViewMode === 'list'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>Lista</span>
                </button>
              </div>

              <button
                onClick={() => setActiveView('maps')}
                title="Abrir mapa em tela cheia"
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Chips by Status */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <button
              onClick={() => setSelectedTechFilter('TODOS')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedTechFilter === 'TODOS'
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todos ({poloTechnicians.length})
            </button>
            <button
              onClick={() => setSelectedTechFilter('DISPONIVEL')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ${
                selectedTechFilter === 'DISPONIVEL'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Livres ({availableTechs.length})
            </button>
            <button
              onClick={() => setSelectedTechFilter('A_CAMINHO')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ${
                selectedTechFilter === 'A_CAMINHO'
                  ? 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Em Rota ({poloTechnicians.filter(t => t.status === 'A_CAMINHO').length})
            </button>
            <button
              onClick={() => setSelectedTechFilter('EM_ATENDIMENTO')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ${
                selectedTechFilter === 'EM_ATENDIMENTO'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Atendimento ({poloTechnicians.filter(t => t.status === 'EM_ATENDIMENTO').length})
            </button>
            {delayedTechs.length > 0 && (
              <button
                onClick={() => setSelectedTechFilter('ATRASADO')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer ${
                  selectedTechFilter === 'ATRASADO'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-950 text-rose-400 hover:text-rose-300 border border-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Atrasados ({delayedTechs.length})
              </button>
            )}
          </div>

          {techViewMode === 'map' ? (
            <div className="space-y-3">
              {/* Interactive Vector Map Canvas */}
              <div className="relative w-full h-72 sm:h-80 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner tech-grid-bg select-none">
                
                {/* Visual road arterial vectors simulating Campinas highways & avenues */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#64748b" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  {/* Rodovia Anhanguera (diagonal corridor) */}
                  <path d="M 0,220 Q 150,180 280,120 T 600,20" fill="none" stroke="url(#roadGrad)" strokeWidth="2.5" strokeDasharray="4 2" />
                  {/* Rodovia Santos Dumont (towards Viracopos south-west) */}
                  <path d="M 280,120 Q 200,210 110,290" fill="none" stroke="url(#roadGrad)" strokeWidth="3" />
                  {/* Rodovia Dom Pedro I (east ring) */}
                  <path d="M 380,20 Q 420,140 370,260" fill="none" stroke="#475569" strokeWidth="2" />
                  {/* Av. José de Souza Campos (Norte-Sul) */}
                  <path d="M 220,100 L 320,160" fill="none" stroke="#334155" strokeWidth="2" />
                  {/* Radar Circles */}
                  <circle cx="280" cy="130" r="70" fill="none" stroke="#0ea5e9" strokeOpacity="0.12" strokeWidth="1" />
                  <circle cx="280" cy="130" r="140" fill="none" stroke="#0ea5e9" strokeOpacity="0.08" strokeWidth="1" />
                </svg>

                {/* Regional Sector Badges */}
                <div className="absolute top-2.5 left-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                  Norte • Barão Geraldo
                </div>
                <div className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                  Leste • Iguatemi / RMC
                </div>
                <div className="absolute bottom-2.5 left-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                  Sul • Aeroporto Viracopos
                </div>
                <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                  Centro / Cambuí (HQ)
                </div>

                {/* Technician Pins on Map */}
                {myTechnicians.map((tech, idx) => {
                  // Coordinate placement
                  let left = '50%';
                  let top = '50%';

                  if (tech.name.includes('João Pedro')) {
                    left = '48%';
                    top = '44%';
                  } else if (tech.name.includes('Carlos')) {
                    left = '72%';
                    top = '34%';
                  } else if (tech.name.includes('Lucas')) {
                    left = '28%';
                    top = '72%';
                  } else if (tech.name.includes('Marcos')) {
                    left = '38%';
                    top = '22%';
                  } else if (tech.name.includes('Fernando')) {
                    left = '24%';
                    top = '48%';
                  } else if (tech.name.includes('Ricardo')) {
                    left = '64%';
                    top = '66%';
                  } else {
                    left = `${22 + ((idx * 24) % 62)}%`;
                    top = `${24 + ((idx * 28) % 58)}%`;
                  }

                  const isSelected = selectedMapTech?.id === tech.id;
                  const isDelayed = tech.status === 'ATRASADO' || tech.overdueAlert;
                  const isAvailable = tech.status === 'DISPONIVEL';
                  const isTraveling = tech.status === 'A_CAMINHO';

                  const statusColor = isDelayed
                    ? 'border-rose-500 bg-rose-950/80 text-rose-300 ring-rose-500/50'
                    : isAvailable
                    ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 ring-emerald-500/50'
                    : isTraveling
                    ? 'border-blue-500 bg-blue-950/80 text-blue-300 ring-blue-500/50'
                    : 'border-amber-500 bg-amber-950/80 text-amber-300 ring-amber-500/50';

                  return (
                    <div
                      key={tech.id}
                      style={{ left, top }}
                      onClick={() => setSelectedMapTechId(tech.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                    >
                      {/* Pulsing ring for active or delayed technicians */}
                      {(isTraveling || isDelayed) && (
                        <div
                          className={`absolute -inset-1.5 rounded-full animate-ping opacity-60 ${
                            isDelayed ? 'bg-rose-500' : 'bg-blue-500'
                          }`}
                        />
                      )}

                      {/* Main Pin */}
                      <div
                        className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-[11px] shadow-lg transition-transform duration-150 ${statusColor} ${
                          isSelected ? 'scale-125 ring-4 ring-cyan-400 z-30' : 'group-hover:scale-115'
                        }`}
                      >
                        {tech.avatar ? (
                          <img
                            src={tech.avatar}
                            alt={tech.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{tech.name.substring(0, 2).toUpperCase()}</span>
                        )}

                        {/* Status dot in corner */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                            isDelayed
                              ? 'bg-rose-500 animate-pulse'
                              : isAvailable
                              ? 'bg-emerald-400'
                              : isTraveling
                              ? 'bg-blue-400'
                              : 'bg-amber-400'
                          }`}
                        />
                      </div>

                      {/* Name Tag Pill */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 -top-6 px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap pointer-events-none transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold opacity-100 shadow'
                            : 'bg-slate-900/90 text-slate-300 border border-slate-800 opacity-80 group-hover:opacity-100'
                        }`}
                      >
                        {tech.name.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}

                {/* Map Compass Indicator */}
                <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-1 text-[10px] text-slate-400 pointer-events-none">
                  <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                  <span className="font-mono">Polo Campinas</span>
                </div>
              </div>

              {/* Selected Technician Real-Time Info Card */}
              {selectedMapTech && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {selectedMapTech.avatar ? (
                        <img
                          src={selectedMapTech.avatar}
                          alt={selectedMapTech.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs shrink-0">
                          {selectedMapTech.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                            {selectedMapTech.name}
                          </h4>
                          <TechStatusBadge status={selectedMapTech.status} />
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-[280px] sm:max-w-md">
                            {selectedMapTech.currentLocation.address}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => {
                          addToast({
                            type: 'info',
                            title: 'Rádio Digital / PTT',
                            message: `Canal de áudio direto conectado com ${selectedMapTech.name} (${selectedMapTech.phone}).`
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                      >
                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Rádio / Contatar</span>
                      </button>

                      {selectedMapTech.currentCallId && (
                        <button
                          onClick={() => {
                            setSelectedCallId(selectedMapTech.currentCallId!);
                            setActiveView('calls');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-cyan-500/40 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver O.S.</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Veículo / Frota:</span>
                      <span className="font-mono text-slate-200 truncate block">
                        {selectedMapTech.assignedVehicle || 'Fiorino #18'}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Conformidade SLA:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {selectedMapTech.slaComplianceRate}%
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Tempo Médio Deslocamento:</span>
                      <span className="font-mono text-cyan-300">
                        {selectedMapTech.avgArrivalTimeMin} min
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Chamados Mês:</span>
                      <span className="font-mono text-slate-200">
                        {selectedMapTech.completedCallsMonth} concluídos
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {myTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    {tech.avatar ? (
                      <img src={tech.avatar} alt={tech.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {tech.name.substring(0, 2)}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{tech.name}</span>
                        <TechStatusBadge status={tech.status} />
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{tech.currentLocation.address}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tech.specialties.map((spec, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-3 space-y-1 shrink-0">
                    <div className="text-xs font-mono font-bold text-slate-200">
                      SLA: {tech.slaComplianceRate}%
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {tech.completedCallsMonth} chamados/mês
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400">
                      TA médio: {tech.avgArrivalTimeMin} min
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Calls in Campinas & Supervisor Decision Queue */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Fila de Chamados & Despacho de Campo</h3>
              <p className="text-xs text-slate-400">Atribuições sugeridas pela IA com confirmação do supervisor</p>
            </div>
            <button
              onClick={() => setActiveView('calls')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              Ver todos ({calls.length})
            </button>
          </div>

          <div className="space-y-3">
            {activeCalls.map((call) => (
              <div
                key={call.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-300">{call.callNumber}</span>
                      <PriorityBadge priority={call.priority} />
                      <StatusPill status={call.status} />
                    </div>
                    <div className="text-xs font-bold text-slate-100 mt-1">
                      {call.equipmentTag} • {call.customerName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {call.buildingName} • {call.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400">SLA: {call.slaMaxHours}h</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-300">
                    <span className="text-slate-400 font-semibold">Problema:</span> {call.problemDescription}
                  </div>
                  {call.aiRecommendation && (
                    <div className="text-cyan-300 text-[11px] flex items-center justify-between pt-1 border-t border-slate-800">
                      <span>IA Sugere: <strong>{call.aiRecommendation.suggestedTechnicianName}</strong> ({call.aiRecommendation.estimatedTimeMin} min)</span>
                      <span className="font-mono text-slate-400">{call.aiRecommendation.confidence}% conf.</span>
                    </div>
                  )}
                  {call.supervisorOverride?.overridden && (
                    <div className="text-amber-300 text-[10px] pt-1">
                      * Decisão do supervisor registrada: {call.supervisorOverride.reason}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-400">
                    Técnico Atual: <strong className="text-slate-200">{call.technicianName || 'Não Atribuído'}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => confirmAIRecommendation(call.id)}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer"
                    >
                      Confirmar IA
                    </button>
                    <button
                      onClick={() => handleOpenOverride(call.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                    >
                      Alterar Técnico
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Override Modal */}
      {overrideModalCallId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">Decisão do Supervisor</h3>
              </div>
              <button
                onClick={() => setOverrideModalCallId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              A IA aprende com o seu conhecimento operacional. Escolha o técnico e registre o motivo da decisão.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Selecionar Técnico</label>
                <select
                  value={chosenTechId}
                  onChange={(e) => setChosenTechId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.city} • {t.status} • SLA {t.slaComplianceRate}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo da Decisão Operacional</label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={3}
                  placeholder="Ex: Técnico já estava na mesma rua abastecendo; conhecimento prévio do quadro elétrico..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setOverrideModalCallId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmOverride}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 cursor-pointer"
              >
                Salvar & Registrar na IA
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
