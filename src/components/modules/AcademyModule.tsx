import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  GraduationCap, 
  Award, 
  Play, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  User, 
  ShieldAlert, 
  Zap, 
  Layers, 
  Activity, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  Check
} from 'lucide-react';

export const AcademyModule: React.FC = () => {
  const { trainings, technicians, addToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>('crs-seismic');

  const filteredTrainings = trainings.filter(t => {
    if (selectedCategory === 'TODAS') return true;
    if (selectedCategory === 'CABOS') return t.trackType === 'CABOS_TRACAO' || t.category.toLowerCase().includes('cabos');
    if (selectedCategory === 'REGEN') return t.trackType === 'ENERGIA_REGENERATIVA' || t.category.toLowerCase().includes('regen') || t.category.toLowerCase().includes('energia');
    if (selectedCategory === 'SEISMIC') return t.trackType === 'RESPOSTA_SISMICA' || t.isMandatory || t.category.toLowerCase().includes('sísmic');
    return t.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Capacitação & Excelência Técnica OTIS
            </span>
            <span className="text-xs text-slate-400 font-mono">SmartFlow Academy & Certificações</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Conformidade Regional Brasil & México
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Trilhas Técnicas Especializadas & Treinamentos da IA
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Currículo técnico operacional cobrindo tecnologias essenciais Otis: Cintas PU de Tração, Inversores ReGen e Certificação Mandatória de Resposta Sísmica para equipes da filial México e zonas ativas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total de Trilhas</div>
            <div className="text-lg font-bold text-cyan-400 font-mono">{trainings.length} Ativas</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedCategory('TODAS')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === 'TODAS'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Todas as Trilhas ({trainings.length})
        </button>

        <button
          onClick={() => setSelectedCategory('CABOS')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'CABOS'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-900/90 border border-slate-800 text-cyan-400 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Trilha de Cabos e Tração</span>
        </button>

        <button
          onClick={() => setSelectedCategory('REGEN')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'REGEN'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-900/90 border border-slate-800 text-emerald-400 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Trilha de Energia Regenerativa</span>
        </button>

        <button
          onClick={() => setSelectedCategory('SEISMIC')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'SEISMIC'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900/90 border border-rose-500/40 text-rose-300 hover:bg-rose-950/20'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Resposta Sísmica (México) [Obrigatório]</span>
        </button>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTrainings.map((training) => {
          const recTech = training.recommendedForTechnicians?.[0];
          const techName = recTech?.technicianName || 'Equipe de Campo';
          const recReason = recTech?.reason || `Especialização prática para elevadores da linha ${training.targetModel}.`;
          const isExpanded = expandedCourseId === training.id;

          const isMandatory = training.isMandatory || training.trackType === 'RESPOSTA_SISMICA';

          return (
            <div
              key={training.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 shadow-sm ${
                isMandatory
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30'
                  : training.trackType === 'ENERGIA_REGENERATIVA'
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/40'
                  : training.trackType === 'CABOS_TRACAO'
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/20 border-cyan-500/40'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {training.category}
                    </span>
                    {isMandatory && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-400 animate-pulse" />
                        Obrigatório • México & LatAm
                      </span>
                    )}
                    {training.trackType === 'CABOS_TRACAO' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Cintas PU Pulse
                      </span>
                    )}
                    {training.trackType === 'ENERGIA_REGENERATIVA' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Eficiência Verde
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-100 leading-snug">
                    {training.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {training.durationHours}h
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      {training.modulesCount} módulos
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">
                      Alvo: <strong>{training.targetModel}</strong>
                    </span>
                  </div>
                </div>

                <span className={`p-2.5 rounded-xl border shrink-0 ${
                  isMandatory
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  <GraduationCap className="w-5 h-5" />
                </span>
              </div>

              {/* Mandatory Requirement Alert Box (For Seismic Track) */}
              {training.regionRequirement && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Requisito Mandatório Regional ({training.regionRequirement})</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Exigência legal conforme norma <strong>NOM-207-SCFI</strong> e <strong>ASME A17.1 Seismic Appendix</strong>. Todos os técnicos atuantes no polo México e áreas de alta atividade tectônica devem renovar este módulo a cada 12 meses.
                  </p>
                </div>
              )}

              {/* AI Justification Box */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Justificativa da Prescrição pela IA:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {recReason}
                </p>
                <div className="text-[11px] text-slate-400 pt-0.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span>Técnico Indicado: <strong className="text-slate-200">{techName}</strong></span>
                  <span className="text-amber-400 font-mono font-medium">Prioridade Alta</span>
                </div>
              </div>

              {/* Syllabus Expandable List */}
              {training.syllabus && training.syllabus.length > 0 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setExpandedCourseId(isExpanded ? null : training.id)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      Conteúdo Programático ({training.syllabus.length} tópicos técnicos)
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 animate-in fade-in duration-150">
                      {training.syllabus.map((topic, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs flex-wrap gap-2">
                <span className="text-slate-400">
                  Inscritos: <strong className="text-amber-400 font-semibold">{training.enrolledTechnicians?.length || 1} técnicos certificados</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      addToast({
                        type: 'info',
                        title: 'Ementa Baixada',
                        message: `Download da ementa completa de "${training.title}" concluído.`
                      });
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Baixar ementa em PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      addToast({
                        type: 'success',
                        title: 'Trilha Atribuída',
                        message: `Trilha "${training.title}" enviada com sucesso para o aplicativo do técnico ${techName}.`
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                      isMandatory 
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
                        : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isMandatory ? 'Atribuir Trilha Obrigatória' : 'Atribuir Trilha'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
