import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, Sparkles, ShieldCheck, CheckCircle2, Save, RotateCcw, UploadCloud, ArrowRight } from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { addToast, setActiveView } = useApp();
  const [doorWeight, setDoorWeight] = useState('35');
  const [ageWeight, setAgeWeight] = useState('25');
  const [historyWeight, setHistoryWeight] = useState('40');
  const [autoReassignThreshold, setAutoReassignThreshold] = useState('15');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Parâmetros Salvos',
      message: 'Pesos do cálculo preditivo atualizados com sucesso.'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Configurações
            </span>
            <span className="text-xs text-slate-400 font-mono">Calibração & Ferramentas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Parâmetros do Sistema
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form onSubmit={handleSave} className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Pesos do Cálculo Preditivo (0 a 100)
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Ciclos de Porta:</span>
                <span className="font-mono font-bold text-cyan-400">{doorWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={doorWeight}
                onChange={(e) => setDoorWeight(e.target.value)}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Idade do Equipamento:</span>
                <span className="font-mono font-bold text-indigo-400">{ageWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={ageWeight}
                onChange={(e) => setAgeWeight(e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Histórico de Falhas:</span>
                <span className="font-mono font-bold text-emerald-400">{historyWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={historyWeight}
                onChange={(e) => setHistoryWeight(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>
        </form>

        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>Importador de Dados</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Carregue planilhas XLSX/CSV com inventário de elevadores, clientes ou escalas de técnicos.
            </p>
            <button
              onClick={() => setActiveView('import')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Abrir Importação XLSX</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
