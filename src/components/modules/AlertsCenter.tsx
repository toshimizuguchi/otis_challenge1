import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  Wrench, 
  Sparkles, 
  CheckCircle2, 
  Package, 
  GraduationCap,
  ChevronRight,
  Filter
} from 'lucide-react';

export const AlertsCenter: React.FC = () => {
  const { aiInsights, calls, equipments, contracts, setActiveView, addToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  const criticalCalls = calls.filter(c => c.priority === 'CRITICO');
  const highRiskEquipments = equipments.filter(e => e.predictiveRiskScore >= 70);
  const criticalContracts = contracts.filter(c => c.status === 'EM_RISCO');

  const alerts = [
    ...criticalCalls.map(c => ({
      id: `alert-call-${c.id}`,
      type: 'OPERACIONAL',
      severity: 'CRITICO',
      title: `Chamado Crítico em Aberto (${c.callNumber})`,
      description: `${c.customerName} — ${c.problemDescription}`,
      target: c.buildingName,
      time: 'Agora',
      actionView: 'calls'
    })),
    ...highRiskEquipments.map(e => ({
      id: `alert-eq-${e.id}`,
      type: 'PREDITIVO',
      severity: 'ALTO',
      title: `Risco de Falha Elevado (${e.tag})`,
      description: e.riskExplanation || 'Anomalia detectada em telemetria e ciclos de portas.',
      target: e.customerName,
      time: 'Última telemetria',
      actionView: 'equipments'
    })),
    ...criticalContracts.map(con => ({
      id: `alert-con-${con.id}`,
      type: 'FINANCEIRO',
      severity: 'ALTO',
      title: `Queda de Margem Contratual (${con.customerName})`,
      description: con.marginDropAlert || 'Margem abaixo da meta acordada.',
      target: con.contractNumber,
      time: 'Mês corrente',
      actionView: 'financial'
    }))
  ];

  const filteredAlerts = alerts.filter(a => selectedCategory === 'TODAS' || a.type === selectedCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Alertas
            </span>
            <span className="text-xs text-slate-400 font-mono">Monitoramento 24/7</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Central de Alertas
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500"
          >
            <option value="TODAS">Todas as Categorias</option>
            <option value="OPERACIONAL">Operacionais</option>
            <option value="PREDITIVO">Preditivos</option>
            <option value="FINANCEIRO">Financeiros</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl bg-slate-900/90 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              alert.severity === 'CRITICO' ? 'border-rose-500/50 shadow-md shadow-rose-950/20' : 'border-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                alert.severity === 'CRITICO' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-100">{alert.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    alert.type === 'OPERACIONAL' ? 'bg-cyan-500/20 text-cyan-300' : alert.type === 'PREDITIVO' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {alert.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{alert.description}</p>
                <div className="text-[10px] text-slate-400">Alvo: {alert.target} • {alert.time}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveView(alert.actionView as any)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Tratar Alerta</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
