import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Navigation, Users, ShieldAlert, PhoneCall, CheckCircle, Info } from 'lucide-react';

export const MapsModule: React.FC = () => {
  const { technicians, equipments, calls, selectedCityFilter, setSelectedCityFilter } = useApp();
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const filteredTechs = technicians.filter(t => selectedCityFilter === 'TODAS' || t.city.toLowerCase() === selectedCityFilter.toLowerCase());
  const filteredEquipments = equipments.filter(e => selectedCityFilter === 'TODAS' || e.city.toLowerCase() === selectedCityFilter.toLowerCase());

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Rastreamento & Logística de Campo
            </span>
            <span className="text-xs text-slate-400 font-mono">Geolocalização Telemetrizada</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Mapa Operacional em Tempo Real
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Visualize o posicionamento dos mecânicos, chamados ativos e ativos preditivos em risco no mapa da região.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCityFilter}
            onChange={(e) => setSelectedCityFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[42px]"
          >
            <option value="TODAS">Ver Todas as Regiões</option>
            <option value="Campinas">Campinas & RMC</option>
            <option value="São Paulo">São Paulo (Capital)</option>
            <option value="São Bernardo do Campo">São Bernardo do Campo (ABC)</option>
            <option value="Rio de Janeiro">Rio de Janeiro</option>
          </select>
        </div>
      </div>

      {/* Map Stage Simulator (SVG + Canvas Vector Map Representation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vector Map Canvas */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden min-h-[380px] sm:min-h-[480px] flex flex-col justify-between shadow-2xl tech-grid-bg">
          
          {/* Map Controls / Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 z-10 bg-slate-900/90 backdrop-blur p-2.5 sm:p-3 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Técnico Livre
              </span>
              <span className="flex items-center gap-1 text-blue-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> Deslocamento
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /> Atendimento
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" /> Risco / O.S.
              </span>
            </div>

            <span className="text-[10px] font-mono text-cyan-400">
              Região: {selectedCityFilter === 'TODAS' ? 'Brasil Geral' : selectedCityFilter}
            </span>
          </div>

          {/* Interactive Simulation Pins */}
          <div className="relative w-full h-72 sm:h-80 my-4 touch-manipulation">
            
            {/* Tech Pins */}
            {filteredTechs.map((tech, idx) => {
              const xPos = 18 + ((idx * 27) % 68);
              const yPos = 22 + ((idx * 33) % 58);

              return (
                <button
                  key={tech.id}
                  onClick={() => setSelectedPin({ type: 'TECH', data: tech })}
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 p-1 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ring-2 ring-slate-950 transition-transform group-hover:scale-125 ${
                    tech.status === 'DISPONIVEL' ? 'bg-emerald-500' :
                    tech.status === 'A_CAMINHO' ? 'bg-blue-500' :
                    tech.status === 'EM_ATENDIMENTO' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}>
                    <Navigation className="w-4 h-4" />
                  </div>
                  <span className="absolute left-1/2 -translate-x-1/2 top-10 px-2 py-0.5 rounded bg-slate-900/95 text-[10px] font-mono text-slate-200 border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                    {tech.name.split(' ')[0]} ({tech.status})
                  </span>
                </button>
              );
            })}

            {/* Equipment Pins */}
            {filteredEquipments.map((eq, idx) => {
              const xPos = 15 + ((idx * 31) % 70);
              const yPos = 18 + ((idx * 29) % 65);

              return (
                <button
                  key={eq.id}
                  onClick={() => setSelectedPin({ type: 'EQUIPMENT', data: eq })}
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 p-1 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md ring-1 ring-slate-900 transition-transform group-hover:scale-125 ${
                    eq.predictiveRiskScore >= 70 ? 'bg-rose-600 animate-bounce' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="absolute left-1/2 -translate-x-1/2 top-9 px-2 py-0.5 rounded bg-slate-900/95 text-[10px] font-mono text-slate-200 border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                    {eq.tag} ({eq.predictiveRiskScore}% risco)
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 text-center font-mono">
            Toque ou clique em qualquer marcador para ver os detalhes
          </div>
        </div>

        {/* Sidebar Dossier for clicked pin */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Detalhes do Ponto Selecionado</h3>

          {selectedPin ? (
            <div className="space-y-3">
              {selectedPin.type === 'TECH' ? (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-100 text-sm">{selectedPin.data.name}</div>
                  <div className="text-slate-400">{selectedPin.data.currentLocation.address}</div>
                  <div className="text-cyan-300 font-mono">SLA: {selectedPin.data.slaComplianceRate}% • TA: {selectedPin.data.avgArrivalTimeMin} min</div>
                  <div className="text-slate-400">Supervisor: {selectedPin.data.supervisorName}</div>
                  <div className="text-slate-400">Status Atual: <strong className="text-emerald-400">{selectedPin.data.status}</strong></div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-100 text-sm">{selectedPin.data.tag} — {selectedPin.data.model}</div>
                  <div className="text-slate-400">{selectedPin.data.customerName} ({selectedPin.data.buildingName})</div>
                  <div className="text-slate-400">{selectedPin.data.address} • {selectedPin.data.city}</div>
                  <div className="text-rose-400 font-bold font-mono">Score de Risco: {selectedPin.data.predictiveRiskScore}%</div>
                  <p className="text-slate-300 text-[11px] pt-1">{selectedPin.data.aiPredictiveDiagnosis}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
              Nenhum marcador selecionado. Toque em um técnico ou equipamento no mapa.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
