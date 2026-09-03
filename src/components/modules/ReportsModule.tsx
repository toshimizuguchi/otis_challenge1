import React from 'react';
import { useApp } from '../../context/AppContext';
import { Download, FileText, FileSpreadsheet, CheckCircle2, Sparkles } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { addToast } = useApp();

  const handleExport = (reportName: string) => {
    addToast({
      type: 'success',
      title: 'Relatório Gerado',
      message: `Download do relatório executivo "${reportName}" iniciado em formato CSV/PDF.`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Auditoria & Prestação de Contas
            </span>
            <span className="text-xs text-slate-400 font-mono">Exportações Gerenciais</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Relatórios Operacionais & Executivos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Exporte dados consolidados de SLA, custos por contrato, consumo de peças e evidências de intervenção da IA.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Relatório Executivo Nacional (Presidência)', desc: 'Consolidado LATAM, disponibilidade 98.6%, SLA 97.2%, margens e economia acumulada.', format: 'PDF / CSV' },
          { title: 'Relatório de Cumprimento de SLA por Polo', desc: 'Desempenho dos supervisores, TA médio, horas técnicas gastas e desvios de atendimento.', format: 'CSV / Excel' },
          { title: 'Dossiê Financeiro & DRE de Contratos', desc: 'Receita vs peças vs mão de obra vs deslocamento por cliente e alertas de margem.', format: 'CSV / Excel' },
          { title: 'Inventário Preditivo & Padrões de Falha', desc: 'Score de risco dos 1.248 equipamentos, ciclos de portas e histórico de falhas.', format: 'CSV / Excel' },
          { title: 'Auditoria de Decisões: Supervisor vs IA', desc: 'Taxa de aceitação das recomendações do Copilot e justificativas registradas.', format: 'PDF / CSV' },
          { title: 'Relatório de Desgaste e Almoxarifado', desc: 'Vida útil observada vs teórica de componentes e alertas de consumo fora do padrão.', format: 'CSV / Excel' }
        ].map((rep, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {rep.format}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100">{rep.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{rep.desc}</p>
            </div>

            <button
              onClick={() => handleExport(rep.title)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Baixar Relatório</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
