import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cpu, Zap, Activity, Thermometer, Radio, Sparkles, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const FutureIoTModule: React.FC = () => {
  const { equipments } = useApp();
  const [selectedEqTag, setSelectedEqTag] = useState<string>(equipments[0]?.tag || 'ELV-001-CMP');

  const telemetryData = [
    { time: '10:00', vibracao: 0.12, temp: 42, energiaRegen: 3.4 },
    { time: '10:15', vibracao: 0.14, temp: 43, energiaRegen: 4.1 },
    { time: '10:30', vibracao: 0.18, temp: 45, energiaRegen: 5.2 },
    { time: '10:45', vibracao: 0.28, temp: 49, energiaRegen: 3.8 },
    { time: '11:00', vibracao: 0.32, temp: 52, energiaRegen: 4.6 },
    { time: '11:15', vibracao: 0.29, temp: 51, energiaRegen: 4.0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Próxima Geração • Telemetria Avançada
            </span>
            <span className="text-xs text-slate-400 font-mono">Compass 360 IoT Gateway</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Sensores IoT & Telemetria em Tempo Real
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitoramento de aceleração triaxial, microvibrações na cabina, temperatura da máquina de tração e regeneração energética ReGen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEqTag}
            onChange={(e) => setSelectedEqTag(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
          >
            {equipments.map(e => (
              <option key={e.id} value={e.tag}>{e.tag} — {e.customerName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Sensors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Vibração Triaxial</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">0.28 g RMS</div>
          <div className="text-[10px] text-amber-400">Pico de 0.32g registrado às 11:00</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Temperatura Motor</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">51.4 °C</div>
          <div className="text-[10px] text-slate-400">Limite térmico seguro: {'<'} 75°C</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Energia ReGen</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">4.6 kWh / h</div>
          <div className="text-[10px] text-slate-400">Economia energética acumulada: 38%</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gateway Compass</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">Conectado</div>
          <div className="text-[10px] text-emerald-400">Latência de transmissão: 24 ms</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Stream de Telemetria de Vibração e Temperatura ({selectedEqTag})</h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="temp" name="Temperatura Motor (°C)" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="energiaRegen" name="Energia ReGen (kWh)" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
