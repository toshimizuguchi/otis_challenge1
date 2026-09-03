import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, GraduationCap, Award, Play, CheckCircle, Clock, BookOpen, User } from 'lucide-react';

export const AcademyModule: React.FC = () => {
  const { trainings, addToast } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Capacitação & Excelência Técnica OTIS
            </span>
            <span className="text-xs text-slate-400 font-mono">SmartFlow Academy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Treinamentos Prescritos por Inteligência Artificial
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            A IA cruza os tipos de falha de cada técnico e prescreve cursos específicos para reduzir tempo de reparo e retorno de chamados.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainings.map((training) => {
          const recTech = training.recommendedForTechnicians?.[0];
          const techName = recTech?.technicianName || 'Equipe de Campo';
          const recReason = recTech?.reason || `Especialização prática para elevadores da linha ${training.targetModel}.`;

          return (
            <div
              key={training.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">{training.category}</span>
                  <h3 className="text-base font-bold text-slate-100">{training.title}</h3>
                  <span className="text-xs text-slate-400">{training.durationHours}h de carga horária • {training.modulesCount} módulos • Modelo alvo: {training.targetModel}</span>
                </div>
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <GraduationCap className="w-5 h-5" />
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Justificativa da Prescrição pela IA:</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  {recReason}
                </p>
                <div className="text-[11px] text-slate-400">
                  Técnico Indicado: <strong className="text-slate-200">{techName}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Inscritos: <strong className="text-amber-400 font-semibold">{training.enrolledTechnicians?.length || 1} técnicos</strong></span>
                <button
                  onClick={() => {
                    addToast({
                      type: 'success',
                      title: 'Treinamento Atribuído',
                      message: `Trilha "${training.title}" enviada para o aplicativo do técnico ${techName}.`
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Atribuir Trilha</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
