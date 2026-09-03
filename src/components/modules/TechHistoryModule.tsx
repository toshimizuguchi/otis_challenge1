import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TechActivityLog } from '../../types';
import { 
  FileText, 
  Package, 
  PhoneCall, 
  Wrench, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Building2, 
  Cpu, 
  Download, 
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const TechHistoryModule: React.FC = () => {
  const { techActivityLogs, currentUser, calls, partRequests, setActiveView } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');

  // Filter logs
  const filteredLogs = techActivityLogs.filter((log) => {
    const matchesSearch = 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.callNumber && log.callNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.equipmentTag && log.equipmentTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.technicianName && log.technicianName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = 
      selectedType === 'ALL' ||
      log.type === selectedType ||
      (selectedType === 'PARTS' && (log.type === 'PECA_PEDIDA' || log.type === 'PECA_TROCADA')) ||
      (selectedType === 'SUPERVISOR' && log.type === 'SUPERVISOR_NOTIFICADO') ||
      (selectedType === 'CALLS' && (log.type === 'OS_CONCLUIDA' || log.type === 'CHECK_IN' || log.type === 'PAUSA_SEGURA')) ||
      (selectedType === 'CHECKLIST' && (log.type === 'CHECKLIST_PROBLEMA' || log.type === 'CHECKLIST_OK'));

    const matchesDate = 
      selectedDateFilter === 'ALL' ||
      (selectedDateFilter === 'TODAY' && log.date?.includes('Hoje'));

    return matchesSearch && matchesType && matchesDate;
  });

  // Calculate summary counts
  const totalLogs = techActivityLogs.length;
  const partsLogsCount = techActivityLogs.filter(l => l.type === 'PECA_PEDIDA' || l.type === 'PECA_TROCADA').length;
  const supervisorLogsCount = techActivityLogs.filter(l => l.type === 'SUPERVISOR_NOTIFICADO').length;
  const osConcludedCount = techActivityLogs.filter(l => l.type === 'OS_CONCLUIDA' || l.type === 'PREVENTIVA_FEITA').length;
  const checklistDefectsCount = techActivityLogs.filter(l => l.type === 'CHECKLIST_PROBLEMA').length;

  const getLogIcon = (type: TechActivityLog['type']) => {
    switch (type) {
      case 'PECA_PEDIDA':
      case 'PECA_TROCADA':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'SUPERVISOR_NOTIFICADO':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      case 'OS_CONCLUIDA':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'PREVENTIVA_FEITA':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'CHECKLIST_PROBLEMA':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'CHECKLIST_OK':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'PAUSA_SEGURA':
        return <RotateCcw className="w-4 h-4 text-sky-400" />;
      case 'CHECK_IN':
      default:
        return <Clock className="w-4 h-4 text-sky-400" />;
    }
  };

  const getBadgeStyle = (type: TechActivityLog['type']) => {
    switch (type) {
      case 'PECA_PEDIDA':
      case 'PECA_TROCADA':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'SUPERVISOR_NOTIFICADO':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'OS_CONCLUIDA':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold';
      case 'PREVENTIVA_FEITA':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'CHECKLIST_PROBLEMA':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30 font-semibold';
      case 'CHECKLIST_OK':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PAUSA_SEGURA':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/20';
      case 'CHECK_IN':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getBadgeLabel = (type: TechActivityLog['type']) => {
    switch (type) {
      case 'PECA_PEDIDA':
        return 'Pedido de Peça';
      case 'PECA_TROCADA':
        return 'Peça Substituída';
      case 'SUPERVISOR_NOTIFICADO':
        return 'Aviso ao Supervisor';
      case 'OS_CONCLUIDA':
        return 'OS Concluída';
      case 'PREVENTIVA_FEITA':
        return 'Preventiva Realizada';
      case 'CHECKLIST_PROBLEMA':
        return 'Problema / Avaria';
      case 'CHECKLIST_OK':
        return 'Checklist Conforme';
      case 'PAUSA_SEGURA':
        return 'Pausa / Pendência';
      case 'CHECK_IN':
      default:
        return 'Deslocamento / Check-in';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-750 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              {currentUser.role === 'ATENDENTE' 
                ? 'Histórico de Chamados & Atividades de Campo' 
                : currentUser.role === 'TECNICO'
                ? 'Meu Histórico de Atividades em Campo'
                : 'Histórico & Auditoria Operacional'}
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            {currentUser.role === 'ATENDENTE'
              ? `Operador: ${currentUser.name} • Registro cronológico auditável de chamados, atendimentos concluídos, peças e ocorrências registradas.`
              : 'Registro cronológico auditável de tudo que você realizou em campo: chamados, peças requisitadas, avisos ao supervisor e checklists.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentUser.role !== 'ATENDENTE' && (
            <button
              onClick={() => setActiveView('parts')}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Package className="w-4 h-4 text-zinc-400" />
              <span>Catálogo de Peças</span>
            </button>
          )}
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            {currentUser.role === 'ATENDENTE' ? (
              <>
                <PhoneCall className="w-4 h-4 text-slate-950" />
                <span>Voltar à Recepção 24/7</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 text-slate-950" />
                <span>Voltar para Atendimentos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" /> Total de Ações
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">{totalLogs}</div>
          <div className="text-[11px] text-zinc-500">Eventos registrados</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/20 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-amber-400" /> Peças Requisitadas
          </div>
          <div className="text-2xl font-bold text-amber-200 font-mono">{partsLogsCount}</div>
          <div className="text-[11px] text-amber-400/80 font-mono">
            {partRequests.length} solicitações em fluxo
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-purple-500/20 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-purple-400" /> Chamou Supervisor
          </div>
          <div className="text-2xl font-bold text-purple-200 font-mono">{supervisorLogsCount}</div>
          <div className="text-[11px] text-purple-400/80">Avisos e pedidos de apoio</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/20 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Conclusões & Reparos
          </div>
          <div className="text-2xl font-bold text-emerald-200 font-mono">{osConcludedCount}</div>
          <div className="text-[11px] text-emerald-400/80">{checklistDefectsCount} avarias diagnosticadas</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por chamado, tag de equipamento, peça solicitada, defeito ou texto..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'Todos os Registros' },
            { id: 'PARTS', label: 'Peças Pedidas' },
            { id: 'SUPERVISOR', label: 'Avisos Supervisor' },
            { id: 'CALLS', label: 'OS & Atendimentos' },
            { id: 'CHECKLIST', label: 'Checklist / Avarias' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedType === tab.id
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Feed */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-100">Linha do Tempo de Atividades ({filteredLogs.length})</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Técnico: {currentUser.name}</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 space-y-2">
            <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs">Nenhum registro encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Timeline node circle */}
                <div className="absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-zinc-950 border-2 border-zinc-700 group-hover:border-zinc-400 flex items-center justify-center transition-colors">
                  {getLogIcon(log.type)}
                </div>

                {/* Log Card */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getBadgeStyle(log.type)}`}>
                        {getBadgeLabel(log.type)}
                      </span>
                      {log.callNumber && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-200">
                          {log.callNumber}
                        </span>
                      )}
                      {log.equipmentTag && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800">
                          {log.equipmentTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <span>{log.date}</span>
                      <span>•</span>
                      <strong className="text-zinc-200">{log.timestamp}</strong>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{log.title}</h3>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{log.description}</p>
                  </div>

                  {/* Metadata pills / details */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                      {log.metadata.partName && (
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 font-medium">
                          Peça: {log.metadata.partQuantity}x {log.metadata.partName}
                        </span>
                      )}
                      {log.metadata.supervisorName && (
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 font-medium">
                          Supervisor: {log.metadata.supervisorName}
                        </span>
                      )}
                      {log.metadata.problemType && (
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 font-medium">
                          Tipo de Falha: {log.metadata.problemType}
                        </span>
                      )}
                      {log.metadata.customer && (
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Cliente: {log.metadata.customer}
                        </span>
                      )}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
