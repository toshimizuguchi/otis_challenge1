import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Award, 
  Trophy, 
  Medal, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  Phone, 
  Mail, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle, 
  Star, 
  Filter, 
  Building2, 
  Sparkles, 
  ThumbsUp, 
  Compass,
  MessageSquare,
  Send,
  X,
  Target,
  Wrench,
  Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Technician, Supervisor } from '../../types';

type SortCriterion = 'OVERALL' | 'RESOLVED' | 'AGILITY' | 'SLA' | 'MARGIN';

export const SupervisorsModule: React.FC = () => {
  const { supervisors, technicians, addToast, currentUser } = useApp();

  const [sortCriterion, setSortCriterion] = useState<SortCriterion>('OVERALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSupervisorId, setExpandedSupervisorId] = useState<string | null>(null);
  
  // Feedback Modal State
  const [feedbackModalSup, setFeedbackModalSup] = useState<Supervisor | null>(null);
  const [feedbackType, setFeedbackType] = useState<'ELOGIO' | 'ALERTA' | 'META'>('ELOGIO');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Compute calculated metrics for each supervisor & team
  const supervisorStats = useMemo(() => {
    return supervisors.map(sup => {
      // Find all technicians for this supervisor
      const teamTechs = technicians.filter(t => 
        t.supervisorId === sup.id || 
        t.supervisorName?.toLowerCase().includes(sup.name.split(' ')[0].toLowerCase()) ||
        (sup.city && t.city && t.city.toLowerCase() === sup.city.toLowerCase())
      );

      // Total resolved problems in month by the team
      const techCompletedSum = teamTechs.reduce((acc, t) => acc + (t.completedCallsMonth || 0), 0);
      const resolvedCallsCount = techCompletedSum > 0 
        ? techCompletedSum 
        : (sup.techniciansCount * 27);

      // Average Arrival Time (TA) in minutes
      const avgArrival = teamTechs.length > 0 
        ? Math.round(teamTechs.reduce((acc, t) => acc + (t.avgArrivalTimeMin || 18), 0) / teamTechs.length)
        : (sup.id === 'sup-2' ? 14 : sup.id === 'sup-1' ? 16 : sup.id === 'sup-4' ? 19 : 24);

      // Average Solution Time (TB)
      const avgSolution = sup.avgSolutionTimeMin || 26;
      
      // Total cycle time / Agility (TA + TB)
      const totalCycleTimeMin = avgArrival + avgSolution;

      // SLA Compliance Rate
      const slaRate = sup.slaRate;

      // First-Time Fix rate
      const firstTimeFixRate = sup.id === 'sup-2' ? 98.2 : sup.id === 'sup-1' ? 96.8 : sup.id === 'sup-4' ? 94.5 : 91.2;

      // Rating (stars / 5)
      const rating = (slaRate / 20).toFixed(1);

      // Normalized agility score (lower time = higher score)
      const agilityScore = Math.max(60, Math.min(100, 100 - (totalCycleTimeMin - 34) * 1.4));
      const slaScore = slaRate;
      const volumeScore = Math.min(100, (resolvedCallsCount / (sup.techniciansCount * 28)) * 100);
      const marginScore = Math.min(100, (sup.contractsMarginRate / 33) * 100);

      // Weighted Composite Score (0 - 100)
      // SLA: 35%, Agility: 30%, Volume: 20%, Margin: 15%
      const overallScore = Number((
        slaScore * 0.35 +
        agilityScore * 0.30 +
        volumeScore * 0.20 +
        marginScore * 0.15
      ).toFixed(1));

      return {
        ...sup,
        teamTechs,
        resolvedCallsCount,
        avgArrival,
        avgSolution,
        totalCycleTimeMin,
        firstTimeFixRate,
        overallScore,
        rating,
        agilityScore: Math.round(agilityScore),
        volumeScore: Math.round(volumeScore)
      };
    });
  }, [supervisors, technicians]);

  // Sort based on chosen criterion
  const sortedSupervisors = useMemo(() => {
    const list = [...supervisorStats];
    switch (sortCriterion) {
      case 'OVERALL':
        return list.sort((a, b) => b.overallScore - a.overallScore);
      case 'RESOLVED':
        return list.sort((a, b) => b.resolvedCallsCount - a.resolvedCallsCount);
      case 'AGILITY':
        return list.sort((a, b) => a.totalCycleTimeMin - b.totalCycleTimeMin); // smaller cycle time = faster
      case 'SLA':
        return list.sort((a, b) => b.slaRate - a.slaRate);
      case 'MARGIN':
        return list.sort((a, b) => b.contractsMarginRate - a.contractsMarginRate);
      default:
        return list;
    }
  }, [supervisorStats, sortCriterion]);

  // Filter by search term
  const filteredSupervisors = useMemo(() => {
    if (!searchTerm.trim()) return sortedSupervisors;
    const term = searchTerm.toLowerCase();
    return sortedSupervisors.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.city.toLowerCase().includes(term) ||
      s.region.toLowerCase().includes(term)
    );
  }, [sortedSupervisors, searchTerm]);

  // Key Top Leaders
  const bestOverall = useMemo(() => {
    return [...supervisorStats].sort((a, b) => b.overallScore - a.overallScore)[0];
  }, [supervisorStats]);

  const fastestTeam = useMemo(() => {
    return [...supervisorStats].sort((a, b) => a.totalCycleTimeMin - b.totalCycleTimeMin)[0];
  }, [supervisorStats]);

  const mostResolved = useMemo(() => {
    return [...supervisorStats].sort((a, b) => b.resolvedCallsCount - a.resolvedCallsCount)[0];
  }, [supervisorStats]);

  const avgRegionalSLA = useMemo(() => {
    if (supervisorStats.length === 0) return 0;
    const sum = supervisorStats.reduce((acc, s) => acc + s.slaRate, 0);
    return (sum / supervisorStats.length).toFixed(1);
  }, [supervisorStats]);

  // Chart Data
  const chartData = useMemo(() => {
    return supervisorStats.map(s => ({
      name: s.name.split(' ')[0],
      score: s.overallScore,
      sla: s.slaRate,
      tempoMin: s.totalCycleTimeMin,
      resolvidos: s.resolvedCallsCount
    }));
  }, [supervisorStats]);

  // Handle feedback submit
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalSup) return;
    
    addToast({
      type: 'success',
      title: 'Diretriz Gerencial Enviada',
      message: `Feedback enviado com sucesso para ${feedbackModalSup.name} (Polo ${feedbackModalSup.city}).`
    });

    setFeedbackModalSup(null);
    setFeedbackMessage('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner - Manager View */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              Painel Gerencial de Liderança
            </span>
            <span className="text-xs text-slate-400 font-mono">Região Sudeste</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Desempenho de Supervisores & Equipes de Campo
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Acompanhe o ranking comparativo de eficiência operacional por polo, quantidade de problemas resolvidos, agilidade de resposta (TA + TB), conformidade de SLA e produtividade das equipes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{supervisors.length} Supervisores Ativos</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SLA Médio: {avgRegionalSLA}%</span>
          </div>
        </div>
      </div>

      {/* Top 4 Performance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1st Place Overall */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              1º Lugar Geral
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {bestOverall?.overallScore} pts
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-base font-bold text-white">{bestOverall?.name}</h3>
            <p className="text-xs text-slate-400">{bestOverall?.city} • Polo {bestOverall?.region.split('-')[0]}</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span>SLA: <strong className="text-emerald-400">{bestOverall?.slaRate}%</strong></span>
            <span>Margem: <strong className="text-cyan-400">{bestOverall?.contractsMarginRate}%</strong></span>
          </div>
        </div>

        {/* Most Agile Team (Fastest Response) */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Equipe Mais Ágil
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {fastestTeam?.totalCycleTimeMin} min total
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-base font-bold text-white">{fastestTeam?.name}</h3>
            <p className="text-xs text-slate-400">Polo {fastestTeam?.city} ({fastestTeam?.techniciansCount} técnicos)</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span>Chegada (TA): <strong className="text-cyan-300">{fastestTeam?.avgArrival}m</strong></span>
            <span>Solução (TB): <strong className="text-cyan-300">{fastestTeam?.avgSolution}m</strong></span>
          </div>
        </div>

        {/* Most Problems Resolved */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Maior Volume Resolvido
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {mostResolved?.resolvedCallsCount} chamados
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-base font-bold text-white">{mostResolved?.name}</h3>
            <p className="text-xs text-slate-400">Polo {mostResolved?.city} • Mês Atual</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span>1ª Visita: <strong className="text-emerald-400">{mostResolved?.firstTimeFixRate}%</strong></span>
            <span>Média/Téc: <strong className="text-slate-200">{Math.round((mostResolved?.resolvedCallsCount || 0) / (mostResolved?.techniciansCount || 1))} un</strong></span>
          </div>
        </div>

        {/* Regional Quality Benchmark */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Conformidade Regional
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
              Meta: 95.0%
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-base font-bold text-white">{avgRegionalSLA}% SLA Médio</h3>
            <p className="text-xs text-slate-400">Consolidado de todas as 4 praças</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span>Polos em Meta: <strong className="text-emerald-400">3 de 4</strong></span>
            <span>Status: <strong className="text-emerald-400">Superavitário</strong></span>
          </div>
        </div>

      </div>

      {/* Podium: Top 3 Visual Display */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-400" />
              Pódio Regional de Desempenho
            </h3>
            <p className="text-xs text-slate-400">Os supervisores e equipes de maior destaque operacional</p>
          </div>
          <span className="text-xs font-mono text-slate-500">Mês Vigente</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          
          {/* 2º Lugar (Prata) */}
          {sortedSupervisors[1] && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between order-2 md:order-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold">
                    <Medal className="w-3.5 h-3.5 text-slate-300" />
                    <span>2º Lugar (Prata)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {sortedSupervisors[1].overallScore} pts
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{sortedSupervisors[1].name}</h4>
                  <p className="text-xs text-slate-400">Polo {sortedSupervisors[1].city} • {sortedSupervisors[1].techniciansCount} técnicos</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Resolvidos</span>
                  <span className="font-bold text-white">{sortedSupervisors[1].resolvedCallsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Agilidade</span>
                  <span className="font-bold text-cyan-300">{sortedSupervisors[1].totalCycleTimeMin}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SLA</span>
                  <span className="font-bold text-emerald-400">{sortedSupervisors[1].slaRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 1º Lugar (Ouro) - Prominent in Center */}
          {sortedSupervisors[0] && (
            <div className="p-4 rounded-xl bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 border border-amber-500/50 shadow-md flex flex-col justify-between order-1 md:order-2 ring-1 ring-amber-500/30">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce-short" />
                    <span>1º Lugar (Ouro)</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                    {sortedSupervisors[0].overallScore} pts
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {sortedSupervisors[0].name}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Líder Regional
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">Polo {sortedSupervisors[0].city} • {sortedSupervisors[0].techniciansCount} técnicos</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Resolvidos</span>
                  <span className="font-bold text-white">{sortedSupervisors[0].resolvedCallsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Agilidade</span>
                  <span className="font-bold text-cyan-300">{sortedSupervisors[0].totalCycleTimeMin}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SLA</span>
                  <span className="font-bold text-emerald-400">{sortedSupervisors[0].slaRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 3º Lugar (Bronze) */}
          {sortedSupervisors[2] && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between order-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/40 text-orange-300 border border-orange-500/30 text-xs font-bold">
                    <Medal className="w-3.5 h-3.5 text-orange-400" />
                    <span>3º Lugar (Bronze)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {sortedSupervisors[2].overallScore} pts
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{sortedSupervisors[2].name}</h4>
                  <p className="text-xs text-slate-400">Polo {sortedSupervisors[2].city} • {sortedSupervisors[2].techniciansCount} técnicos</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Resolvidos</span>
                  <span className="font-bold text-white">{sortedSupervisors[2].resolvedCallsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Agilidade</span>
                  <span className="font-bold text-cyan-300">{sortedSupervisors[2].totalCycleTimeMin}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SLA</span>
                  <span className="font-bold text-emerald-400">{sortedSupervisors[2].slaRate}%</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Comparative Analytical Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Comparativo Direto: Supervisores & Polos</h3>
            <p className="text-xs text-slate-400">Pontuação Geral, SLA (%) e Tempo Médio de Ciclo (minutos)</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">4 Polos Operacionais</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="score" name="Score Geral (pts)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sla" name="SLA Cumprido (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tempoMin" name="Tempo Total Ciclo (min)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar supervisor, polo ou cidade..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting Criteria Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <span className="text-slate-400 text-[11px] mr-1 hidden md:inline">Classificar por:</span>
          
          <button
            onClick={() => setSortCriterion('OVERALL')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              sortCriterion === 'OVERALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Trophy className="w-3 h-3" />
            <span>Desempenho Geral</span>
          </button>

          <button
            onClick={() => setSortCriterion('RESOLVED')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              sortCriterion === 'RESOLVED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Mais Resolvidos</span>
          </button>

          <button
            onClick={() => setSortCriterion('AGILITY')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              sortCriterion === 'AGILITY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Mais Ágeis (Tempo)</span>
          </button>

          <button
            onClick={() => setSortCriterion('SLA')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              sortCriterion === 'SLA'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Maior SLA</span>
          </button>

          <button
            onClick={() => setSortCriterion('MARGIN')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              sortCriterion === 'MARGIN'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Margem</span>
          </button>
        </div>

      </div>

      {/* Main Ranked Supervisors List */}
      <div className="space-y-4">
        {filteredSupervisors.map((sup, rankIndex) => {
          const isExpanded = expandedSupervisorId === sup.id;
          const isFirstPlace = rankIndex === 0 && sortCriterion === 'OVERALL';

          return (
            <div
              key={sup.id}
              className={`p-5 rounded-2xl bg-slate-900/90 border transition-all shadow-sm space-y-4 ${
                isFirstPlace 
                  ? 'border-amber-500/40 ring-1 ring-amber-500/20' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Supervisor Header Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                <div className="flex items-start gap-3.5">
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                    rankIndex === 0
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : rankIndex === 1
                      ? 'bg-slate-800 text-slate-200 border-slate-600'
                      : rankIndex === 2
                      ? 'bg-orange-950/40 text-orange-300 border-orange-500/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    #{rankIndex + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{sup.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        Polo {sup.city} ({sup.state})
                      </span>
                      {isFirstPlace && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          Líder Geral do Ranking
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                      <span>{sup.region}</span>
                      <span>•</span>
                      <span>{sup.techniciansCount} técnicos na equipe</span>
                      <span>•</span>
                      <span>{sup.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Score & Quick Actions */}
                <div className="flex items-center gap-3 self-end lg:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Score Geral</span>
                    <span className="text-lg font-mono font-bold text-amber-400">
                      {sup.overallScore} <span className="text-xs text-slate-500">/ 100</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                    <button
                      onClick={() => {
                        addToast({
                          type: 'info',
                          title: 'Canal de Rádio / PTT',
                          message: `Conectando canal de áudio privativo com Supervisor ${sup.name} (Polo ${sup.city}).`
                        });
                      }}
                      title="Chamar no rádio digital PTT"
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
                    >
                      <Radio className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setFeedbackModalSup(sup);
                        setFeedbackType('ELOGIO');
                        setFeedbackMessage(`Parabéns pelo excelente desempenho no Polo ${sup.city}!`);
                      }}
                      title="Enviar diretriz gerencial ou feedback"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Feedback</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Core Key Performance Indicators (Cards Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                
                {/* 1. Problemas Resolvidos */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Problemas Resolvidos
                  </span>
                  <div className="text-sm font-mono font-bold text-white">
                    {sup.resolvedCallsCount}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    ~{Math.round(sup.resolvedCallsCount / sup.techniciansCount)} / técnico
                  </span>
                </div>

                {/* 2. Agilidade & Tempo Médio (TA + TB) */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    Agilidade (Tempo)
                  </span>
                  <div className="text-sm font-mono font-bold text-cyan-300">
                    {sup.totalCycleTimeMin} min total
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    TA: {sup.avgArrival}m • TB: {sup.avgSolution}m
                  </span>
                </div>

                {/* 3. SLA Compliance */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    Conformidade SLA
                  </span>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    {sup.slaRate}%
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Meta: 95.0%
                  </span>
                </div>

                {/* 4. First-Time Fix */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Target className="w-3 h-3 text-amber-400" />
                    1ª Visita (FTF)
                  </span>
                  <div className="text-sm font-mono font-bold text-amber-300">
                    {sup.firstTimeFixRate}%
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Sem rechamado
                  </span>
                </div>

                {/* 5. Margem de Contratos */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    Margem Contratual
                  </span>
                  <div className="text-sm font-mono font-bold text-emerald-300">
                    {sup.contractsMarginRate}%
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Rentabilidade
                  </span>
                </div>

                {/* 6. Chamados Ativos no Momento */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-slate-400" />
                    Chamados em Aberto
                  </span>
                  <div className="text-sm font-mono font-bold text-slate-200">
                    {sup.activeCallsCount} ativos
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Backlog: {sup.backlogCount}
                  </span>
                </div>

              </div>

              {/* Trend Alert from AI (if available) */}
              {sup.recentTrendAlert && (
                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Diagnóstico da IA para este Polo:</strong> {sup.recentTrendAlert}
                  </div>
                </div>
              )}

              {/* Expand/Collapse Team Details */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setExpandedSupervisorId(isExpanded ? null : sup.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Equipe de Técnicos Sob Gestão ({sup.teamTechs.length || sup.techniciansCount} profissionais)</span>
                  </span>
                  
                  <div className="flex items-center gap-1 text-slate-400">
                    <span>{isExpanded ? 'Ocultar Equipe' : 'Ver Técnicos & Status'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Expanded Team Table */}
                {isExpanded && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pb-1 border-b border-slate-800">
                      <span>Técnico & Especialidades</span>
                      <div className="flex items-center gap-6">
                        <span>Chamados Mês</span>
                        <span>Tempo TA</span>
                        <span>SLA Individual</span>
                        <span>Status</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {sup.teamTechs.length > 0 ? (
                        sup.teamTechs.map((tech) => (
                          <div
                            key={tech.id}
                            className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              {tech.avatar ? (
                                <img src={tech.avatar} alt={tech.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                                  {tech.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-100">{tech.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {tech.assignedVehicle || 'Fiorino SmartFlow'} • {tech.specialties.slice(0, 2).join(', ')}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 self-end sm:self-auto text-right font-mono text-[11px]">
                              <div className="text-slate-200">
                                {tech.completedCallsMonth} un
                              </div>
                              <div className="text-cyan-300">
                                {tech.avgArrivalTimeMin} min
                              </div>
                              <div className="text-emerald-400 font-bold">
                                {tech.slaComplianceRate}%
                              </div>
                              <div className="w-24 text-right">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                  tech.status === 'DISPONIVEL'
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                                    : tech.status === 'A_CAMINHO'
                                    ? 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                                    : tech.status === 'EM_ATENDIMENTO'
                                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                                }`}>
                                  {tech.status === 'DISPONIVEL' ? 'Livre' : tech.status === 'A_CAMINHO' ? 'Em Rota' : tech.status === 'EM_ATENDIMENTO' ? 'Atendimento' : 'Atrasado'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-500">
                          Equipe alocada de {sup.techniciansCount} técnicos operando no polo {sup.city}.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Feedback & Managerial Directives Modal */}
      {feedbackModalSup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Diretriz Gerencial para {feedbackModalSup.name}
                </h3>
              </div>
              <button
                onClick={() => setFeedbackModalSup(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Envie um comunicado oficial, elogio de desempenho ou orientação operacional diretamente para a interface do Supervisor no Polo {feedbackModalSup.city}.
            </p>

            {/* Directive Type Selector */}
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setFeedbackType('ELOGIO');
                  setFeedbackMessage(`Parabéns pelo destaque operacional da equipe do Polo ${feedbackModalSup.city}!`);
                }}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  feedbackType === 'ELOGIO'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Elogio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedbackType('ALERTA');
                  setFeedbackMessage(`Atenção ao tempo de atendimento (TA) nas ocorrências da região central.`);
                }}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  feedbackType === 'ALERTA'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Alerta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedbackType('META');
                  setFeedbackMessage(`Meta da semana: atingir First-Time Fix superior a 97% na praça.`);
                }}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  feedbackType === 'META'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nova Meta</span>
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Mensagem para o Supervisor:
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows={4}
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder="Escreva a orientação gerencial..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFeedbackModalSup(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Diretriz</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
