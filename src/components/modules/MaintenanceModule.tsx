import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskGauge } from '../common/UIComponents';
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
  ChevronRight
} from 'lucide-react';

export const MaintenanceModule: React.FC = () => {
  const { equipments, createMaintenanceCampaign, addToast, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'PREDICTIVE' | 'CAMPAIGNS'>('CALENDAR');

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const [selectedMonth, setSelectedMonth] = useState('Agosto');

  const highRiskEquipments = equipments.filter(e => e.predictiveRiskScore >= 70);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Plano de Engenharia de Manutenção
            </span>
            <span className="text-xs text-slate-400 font-mono">Preditiva • Preventiva • Corretiva</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Gestão de Manutenção & Calendário Dinâmico
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Cronogramas inteligentes de manutenção que se adaptam por modelo, idade, ciclos de porta e histórico de falhas.
          </p>
        </div>

        <button
          onClick={() => {
            createMaintenanceCampaign({
              title: 'Campanha Nacional Portas Gen2 Comfort',
              modelTarget: 'Gen2 Comfort',
              riskDescription: 'Campanha preventiva de substituição de sapata e roletes dos operadores AT120.',
              status: 'EM_ANDAMENTO'
            });
            addToast({
              type: 'success',
              title: 'Campanha Preventiva Disparada',
              message: '320 elevadores incluídos na ordem de serviço antecipada com sucesso.'
            });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer ring-1 ring-cyan-400/40"
        >
          <Play className="w-4 h-4" />
          <span>Disparar Campanha Preventiva</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CALENDAR' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          📅 Calendário Mensal Mês a Mês
        </button>
        <button
          onClick={() => setActiveTab('PREDICTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PREDICTIVE' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          ⚡ Fila de Risco Preditivo ({highRiskEquipments.length})
        </button>
        <button
          onClick={() => setActiveTab('CAMPAIGNS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CAMPAIGNS' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          🎯 Campanhas de Troca em Massa
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
                        riskDescription: eq.riskExplanation || 'Análise preditiva de desgaste em componentes críticos.',
                        status: 'EM_ANDAMENTO'
                      });
                      addToast({
                        type: 'success',
                        title: 'Ordem de Manutenção Criada',
                        message: `Agendada intervenção preditiva para o elevador ${eq.tag}.`
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer shadow-md"
                  >
                    Agendar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'CAMPAIGNS' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Campanha Nacional de Portas Gen2 Comfort (Campinas, SP, SBC)</h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Economia R$ 142.000
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A IA detectou correlação direta entre o tempo de operação (3.2 anos) e a taxa de falhas na sapata e roletes dos operadores AT120. A execução antecipada em 320 elevadores evita chamados corretivos e multas contratuais.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  createMaintenanceCampaign({
                    title: 'Campanha Nacional Portas Gen2 Comfort',
                    modelTarget: 'Gen2 Comfort',
                    riskDescription: 'Substituição proativa de componentes de desgaste acelerado em portas.',
                    status: 'EM_ANDAMENTO'
                  });
                  addToast({
                    type: 'success',
                    title: 'Campanha Executada',
                    message: 'Campanha preventiva de portas despachada para 320 elevadores.'
                  });
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold shadow-md shadow-cyan-600/30 cursor-pointer"
              >
                Executar Campanha em 320 Ativos
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
