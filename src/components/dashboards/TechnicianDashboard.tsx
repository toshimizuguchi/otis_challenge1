import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusPill } from '../common/UIComponents';
import { 
  Wrench, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Navigation, 
  Package, 
  Sparkles,
  Check,
  Phone,
  ShieldAlert,
  ListTodo,
  PlayCircle,
  ClipboardCheck,
  Sliders,
  Cpu,
  UserPlus,
  Send,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Calendar,
  Layers,
  CheckSquare,
  FileText
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  status: 'PENDENTE' | 'OK' | 'PROBLEMA';
  problemType?: 'QUEBROU' | 'NECESSITA_PECA' | 'DESGASTE' | 'FOLGA' | 'ELETRICO' | 'OUTRO';
  problemNotes?: string;
  done?: boolean;
}

interface EquipmentMaintenanceTask {
  id: string;
  taskNumber: string;
  title: string;
  type: 'PREVENTIVA' | 'ROTINA_PREVENTIVA' | 'PREDITIVA';
  priority: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  status: 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  equipmentId: string;
  equipmentTag: string;
  equipmentModel: string;
  customerName: string;
  buildingName: string;
  address: string;
  city: string;
  estimatedDuration: string;
  scheduledTime: string;
  checklist: ChecklistItem[];
  recommendedParts: string[];
  recommendedTools: string[];
  technicalObservation?: string;
}

const INITIAL_EQUIPMENT_TASKS: EquipmentMaintenanceTask[] = [
  {
    id: 'maint-01',
    taskNumber: 'MAN-2026-701',
    title: 'Revisão Periódica e Alinhamento de Portas AT120',
    type: 'PREVENTIVA',
    priority: 'MEDIO',
    status: 'EM_ANDAMENTO',
    equipmentId: 'eq-101',
    equipmentTag: 'ELV-CPS-01',
    equipmentModel: 'Otis Gen2 Comfort',
    customerName: 'Centro Empresarial Iguatemi Campinas',
    buildingName: 'Torre A - Alpha',
    address: 'Av. Iguatemi, 777 - Vila Brandina',
    city: 'Campinas',
    estimatedDuration: '1h 30min',
    scheduledTime: 'Hoje, 10:00',
    checklist: [
      { id: 'c1', text: 'Inspeção de folgas e desgaste da sapata guia AT120', status: 'PROBLEMA', problemType: 'QUEBROU', problemNotes: 'Sapata guia trincada com atrito excessivo na lâmina inferior.', done: false },
      { id: 'c2', text: 'Limpeza de barramento e ajuste de tensão da correia dentada', status: 'OK', done: true },
      { id: 'c3', text: 'Teste do microrruptor de segurança e sensor 3D de cortina de luz', status: 'PENDENTE', done: false },
      { id: 'c4', text: 'Medição de corrente de partida do motor do operador', status: 'PENDENTE', done: false },
      { id: 'c5', text: 'Ciclos de teste de abertura e fechamento sem ruído anormal', status: 'PENDENTE', done: false }
    ],
    recommendedParts: ['Kit Roletes e Sapata Guia Operador AT120'],
    recommendedTools: ['Chave Dinamométrica Otis', 'Gabarito de Folga de Porta 6mm', 'Multímetro Calibrado'],
    technicalObservation: 'Revisão semestral do sistema de portas para prevenção de travamentos intermitentes.'
  },
  {
    id: 'maint-02',
    taskNumber: 'MAN-2026-702',
    title: 'Inspeção de Cintas de Tração CSB e Freio Eletromecânico',
    type: 'ROTINA_PREVENTIVA',
    priority: 'BAIXO',
    status: 'AGENDADA',
    equipmentId: 'eq-102',
    equipmentTag: 'ELV-CPS-02',
    equipmentModel: 'Otis Gen2 Comfort',
    customerName: 'Centro Empresarial Iguatemi Campinas',
    buildingName: 'Torre B - Beta',
    address: 'Av. Iguatemi, 777 - Vila Brandina',
    city: 'Campinas',
    estimatedDuration: '1h 15min',
    scheduledTime: 'Hoje, 14:00',
    checklist: [
      { id: 'c1', text: 'Inspeção óptica das 3 fitas de tração CSB revestidas de poliuretano', status: 'PENDENTE', done: false },
      { id: 'c2', text: 'Verificação de integridade dos condutores de aço com dispositivo Pulse', status: 'PENDENTE', done: false },
      { id: 'c3', text: 'Medição da folga de pastilhas do freio da máquina Gearless', status: 'PENDENTE', done: false },
      { id: 'c4', text: 'Reaperto de bornes e limpeza do quadro de comando MCS 220', status: 'PENDENTE', done: false }
    ],
    recommendedParts: ['Nenhuma substituição de peças requerida na rotina'],
    recommendedTools: ['Dispositivo Otis Pulse CSB', 'Torquímetro Digital'],
    technicalObservation: 'Rotina preventiva mensal de segurança e tração.'
  },
  {
    id: 'maint-03',
    taskNumber: 'MAN-2026-703',
    title: 'Manutenção Preditiva do Pente e Guias de Degraus',
    type: 'PREDITIVA',
    priority: 'ALTO',
    status: 'AGENDADA',
    equipmentId: 'eq-104',
    equipmentTag: 'ESC-CPS-01',
    equipmentModel: 'Otis Escalator 510 NPE',
    customerName: 'Shopping Center Iguatemi Campinas',
    buildingName: 'Praça de Alimentação - Hall Central',
    address: 'Av. Iguatemi, 777 - Vila Brandina',
    city: 'Campinas',
    estimatedDuration: '2h 00min',
    scheduledTime: 'Hoje, 16:30',
    checklist: [
      { id: 'c1', text: 'Ajuste milimétrico do pente plástico em relação aos degraus metálicos', status: 'PENDENTE', done: false },
      { id: 'c2', text: 'Inspeção dos microrruptores de segurança de desarme por impacto', status: 'PENDENTE', done: false },
      { id: 'c3', text: 'Limpeza da calha coletora e lubrificação da corrente de acionamento', status: 'PENDENTE', done: false },
      { id: 'c4', text: 'Teste de sincronismo de velocidade entre corrimão e degraus', status: 'PENDENTE', done: false }
    ],
    recommendedParts: ['Segmento de Pente Plástico Amarelo 606N'],
    recommendedTools: ['Chave Allen Estendida', 'Tacômetro Óptico Digital'],
    technicalObservation: 'Alerta preditivo de vibração acionado pelo sensor IoT na estação inferior.'
  }
];

export const TechnicianDashboard: React.FC = () => {
  const { calls, equipments, updateCallStatus, addToast, setActiveView, addTechActivityLog, currentUser } = useApp();
  
  // Tab Filter in the Left Panel: ALL | MAINTENANCE | CALLS
  const [filterType, setFilterType] = useState<'ALL' | 'MAINTENANCE' | 'CALLS'>('ALL');
  
  // Active Selected Item State
  const [selectedItemType, setSelectedItemType] = useState<'CALL' | 'MAINTENANCE'>('CALL');
  const [selectedCallId, setSelectedCallId] = useState<string>('');
  const [selectedMaintId, setSelectedMaintId] = useState<string>(INITIAL_EQUIPMENT_TASKS[0].id);
  
  // Equipment Tasks Local State
  const [maintTasks, setMaintTasks] = useState<EquipmentMaintenanceTask[]>(INITIAL_EQUIPMENT_TASKS);
  
  // Item problem editing inline state
  const [editingProblemCheckId, setEditingProblemCheckId] = useState<string | null>(null);
  const [activeProblemType, setActiveProblemType] = useState<ChecklistItem['problemType']>('QUEBROU');
  const [activeProblemNote, setActiveProblemNote] = useState<string>('');
  
  // Mobile navigation tabs: tasks list vs execution view
  const [mobileTab, setMobileTab] = useState<'tasks' | 'execution'>('tasks');

  // Active sub-tab inside the Execution Workspace: 'checklist' | 'details' | 'finish'
  const [activeWorkTab, setActiveWorkTab] = useState<'checklist' | 'details' | 'finish'>('checklist');
  
  // Resolution outcome: null | 'RESOLVED' | 'UNRESOLVED'
  const [resolutionOutcome, setResolutionOutcome] = useState<'RESOLVED' | 'UNRESOLVED' | null>(null);
  const [unresolvedReason, setUnresolvedReason] = useState<'NEED_PARTS' | 'NEED_SPECIALIST' | 'ACCESS_BLOCKED' | 'COMPLEX_DEFECT' | 'OTHER'>('NEED_PARTS');
  const [unresolvedDetail, setUnresolvedDetail] = useState('');
  const [temporaryStatus, setTemporaryStatus] = useState<'INTERMITTENT' | 'STOPPED_SAFE' | 'TOTAL_SHUTDOWN'>('STOPPED_SAFE');
  
  // Supervisor Notification modal state
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [supervisorReason, setSupervisorReason] = useState<'REALLOCATE_TECH' | 'JOIN_CALL' | 'URGENT_APPROVAL' | 'DIAGNOSTIC_HELP'>('REALLOCATE_TECH');
  const [supervisorNote, setSupervisorNote] = useState('');

  const [diagnosticText, setDiagnosticText] = useState('');
  const [usedPartInput, setUsedPartInput] = useState('');

  // Technician Corrective Calls (Campinas region / João Pedro)
  const techCalls = calls.filter(c => c.technicianName?.includes('João Pedro') || c.city === 'Campinas');
  
  const activeCall = techCalls.find(c => c.id === selectedCallId) || techCalls[0];
  const activeMaint = maintTasks.find(m => m.id === selectedMaintId) || maintTasks[0];
  
  const relatedEquipment = equipments.find(e => 
    e.id === (selectedItemType === 'CALL' ? activeCall?.equipmentId : activeMaint?.equipmentId)
  ) || equipments[0];

  // Counts for Top Compact KPI Bar
  const totalTasksCount = techCalls.length + maintTasks.length;
  const inProgressCount = techCalls.filter(c => c.status === 'EM_ATENDIMENTO' || c.status === 'A_CAMINHO').length +
                          maintTasks.filter(m => m.status === 'EM_ANDAMENTO').length;
  const criticalCallsCount = techCalls.filter(c => c.priority === 'CRITICO').length;
  const completedCount = techCalls.filter(c => c.status === 'CONCLUIDO').length +
                         maintTasks.filter(m => m.status === 'CONCLUIDA').length;

  const handleCallAction = (newStatus: any, note: string) => {
    if (!activeCall) return;
    updateCallStatus(activeCall.id, newStatus, note);

    let actionType: any = 'OS_CONCLUIDA';
    if (newStatus === 'A_CAMINHO' || newStatus === 'EM_ATENDIMENTO') actionType = 'CHECK_IN';
    else if (newStatus === 'PAUSADO') actionType = 'PAUSA_PENDENCIA';

    addTechActivityLog({
      type: actionType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `Hoje, ${new Date().toLocaleDateString('pt-BR')}`,
      title: `${newStatus === 'CONCLUIDO' ? 'OS Concluída com Sucesso' : newStatus === 'PAUSADO' ? 'OS Pausada (Pendência)' : `Status Atualizado: ${newStatus}`} - ${activeCall.callNumber}`,
      description: `${note}. Equipamento: ${activeCall.equipmentTag} (${activeCall.buildingName}).`,
      callNumber: activeCall.callNumber,
      equipmentTag: activeCall.equipmentTag,
      technicianName: currentUser.name,
      metadata: {
        customer: activeCall.customerName,
        building: activeCall.buildingName,
        status: newStatus
      }
    });
  };

  const handleSetChecklistStatus = (taskId: string, checkId: string, status: 'OK' | 'PROBLEMA' | 'PENDENTE') => {
    if (status === 'PROBLEMA') {
      const task = maintTasks.find(t => t.id === taskId);
      const item = task?.checklist.find(c => c.id === checkId);
      setEditingProblemCheckId(checkId);
      setActiveProblemType(item?.problemType || 'QUEBROU');
      setActiveProblemNote(item?.problemNotes || '');
      return;
    }

    setMaintTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        checklist: task.checklist.map(item => {
          if (item.id === checkId) {
            const nextDone = status === 'OK';
            return {
              ...item,
              status,
              done: nextDone,
              problemType: undefined,
              problemNotes: undefined
            };
          }
          return item;
        })
      };
    }));

    if (status === 'OK') {
      addToast('success', 'Item Validado', 'Procedimento técnico marcado como conforme (OK).');
    }
  };

  const handleSaveChecklistProblem = (taskId: string, checkId: string) => {
    const task = maintTasks.find(t => t.id === taskId);
    const item = task?.checklist.find(c => c.id === checkId);
    if (!item) return;

    setMaintTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        checklist: t.checklist.map(c => {
          if (c.id === checkId) {
            return {
              ...c,
              status: 'PROBLEMA',
              problemType: activeProblemType,
              problemNotes: activeProblemNote || 'Problema registrado durante inspeção técnica.',
              done: false
            };
          }
          return c;
        })
      };
    }));

    addTechActivityLog({
      type: 'CHECKLIST_PROBLEMA',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `Hoje, ${new Date().toLocaleDateString('pt-BR')}`,
      title: `Problema Detectado: ${activeProblemType === 'QUEBROU' ? 'Quebrou / Trincado' : activeProblemType === 'NECESSITA_PECA' ? 'Necessita de Peça' : 'Desgaste / Falha'}`,
      description: `Item "${item.text}" no equipamento ${activeMaint.equipmentTag} (${activeMaint.buildingName}). Observação: ${activeProblemNote || 'Necessária intervenção técnica'}.`,
      callNumber: activeMaint.taskNumber,
      equipmentTag: activeMaint.equipmentTag,
      technicianName: currentUser.name,
      metadata: {
        taskNumber: activeMaint.taskNumber,
        itemText: item.text,
        problemType: activeProblemType
      }
    });

    setEditingProblemCheckId(null);
    addToast('warning', 'Ocorrência Registrada', 'Item marcado como problema e registrado no relatório.');
  };

  const handleCompleteMaintenance = (maintId: string) => {
    const task = maintTasks.find(t => t.id === maintId);
    if (!task) return;

    setMaintTasks(prev => prev.map(t => {
      if (t.id === maintId) {
        return {
          ...t,
          status: 'CONCLUIDA',
          checklist: t.checklist.map(c => ({ ...c, done: true, status: c.status === 'PROBLEMA' ? 'PROBLEMA' : 'OK' }))
        };
      }
      return t;
    }));

    addTechActivityLog({
      type: 'MANUTENCAO_PREVENTIVA',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `Hoje, ${new Date().toLocaleDateString('pt-BR')}`,
      title: `Manutenção Concluída: ${task.title}`,
      description: `Execução finalizada com sucesso no equipamento ${task.equipmentTag} (${task.buildingName}). ${diagnosticText ? `Obs: ${diagnosticText}` : ''}`,
      callNumber: task.taskNumber,
      equipmentTag: task.equipmentTag,
      technicianName: currentUser.name,
      metadata: {
        taskNumber: task.taskNumber,
        type: task.type,
        customer: task.customerName
      }
    });

    addToast('success', 'Manutenção Concluída!', `A tarefa ${task.taskNumber} foi finalizada e registrada no histórico do ativo.`);
  };

  const handleSelectCall = (callId: string) => {
    setSelectedItemType('CALL');
    setSelectedCallId(callId);
    setMobileTab('execution');
    setActiveWorkTab('checklist');
  };

  const handleSelectMaintenance = (maintId: string) => {
    setSelectedItemType('MAINTENANCE');
    setSelectedMaintId(maintId);
    setMobileTab('execution');
    setActiveWorkTab('checklist');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* 1. COMPACT & CLEAN HEADER BAR (Despoluído: Sem cards gigantes redundantes) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Olá, {currentUser.name || 'João Pedro Santos'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GPS Ativo • Polo Campinas
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Terminal Técnico de Campo • Viatura #14 (BRA-4E29)
            </p>
          </div>
        </div>

        {/* Mini KPI Summary Strip (Horizontal & Compact) */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Total Hoje:</span>
            <span className="font-mono font-bold text-cyan-400">{totalTasksCount}</span>
          </button>

          <div className="w-px h-4 bg-slate-800" />

          <button
            onClick={() => setFilterType('MAINTENANCE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'MAINTENANCE'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Preventivas:</span>
            <span className="font-mono font-bold text-cyan-400">{maintTasks.length}</span>
          </button>

          <div className="w-px h-4 bg-slate-800" />

          <button
            onClick={() => setFilterType('CALLS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'CALLS'
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Chamados:</span>
            <span className="font-mono font-bold text-rose-400">{techCalls.length}</span>
            {criticalCallsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Chamado Crítico Ativo" />
            )}
          </button>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400">
            <span>Concluídos:</span>
            <span className="font-mono font-bold text-emerald-400">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Mobile Tab Segmented Switcher (Visible only on mobile screens) */}
      <div className="lg:hidden flex rounded-xl bg-slate-950 border border-slate-800 p-1">
        <button
          onClick={() => setMobileTab('tasks')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[40px] ${
            mobileTab === 'tasks'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Agenda ({totalTasksCount})</span>
        </button>
        <button
          onClick={() => setMobileTab('execution')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[40px] ${
            mobileTab === 'execution'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Execução em Campo</span>
        </button>
      </div>

      {/* 2. MAIN FIELD INTERFACE (Layout 2 Colunas Limpo & Despoluído) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Clean Agenda List (5 cols) */}
        <div className={`lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 ${
          mobileTab === 'execution' ? 'hidden lg:block' : 'block'
        }`}>
          
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Atividades do Dia ({totalTasksCount})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Campinas e Região
            </span>
          </div>

          {/* Cards List Container */}
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            
            {/* MANUTENÇÃO PREVENTIVA / PREDITIVA */}
            {(filterType === 'ALL' || filterType === 'MAINTENANCE') && (
              maintTasks.map((task) => {
                const completedChecks = task.checklist.filter(c => c.done || c.status === 'OK').length;
                const isSelected = selectedItemType === 'MAINTENANCE' && selectedMaintId === task.id;

                return (
                  <div
                    key={task.id}
                    onClick={() => handleSelectMaintenance(task.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-sm ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/70 border-slate-800/90 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    {/* Left Accent Stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />

                    <div className="flex items-start justify-between gap-2 pl-1.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-cyan-400">{task.taskNumber}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {task.type === 'PREVENTIVA' ? 'Preventiva' : task.type === 'PREDITIVA' ? 'Preditiva' : 'Rotina'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{task.title}</h4>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                        task.status === 'CONCLUIDA'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : task.status === 'EM_ANDAMENTO'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {task.status === 'CONCLUIDA' ? 'Concluída' : task.status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Agendada'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pl-1.5 pt-1 border-t border-slate-800/60">
                      <span className="truncate">{task.buildingName} • {task.equipmentTag}</span>
                      <span className="font-mono text-slate-300 text-[10px] shrink-0">
                        {completedChecks}/{task.checklist.length} itens OK
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* CHAMADOS CORRETIVOS / CLIENTES */}
            {(filterType === 'ALL' || filterType === 'CALLS') && (
              techCalls.map((call) => {
                const isSelected = selectedItemType === 'CALL' && selectedCallId === call.id;
                const isCritical = call.priority === 'CRITICO';

                return (
                  <div
                    key={call.id}
                    onClick={() => handleSelectCall(call.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-rose-500 shadow-sm ring-1 ring-rose-500/30'
                        : 'bg-slate-950/70 border-slate-800/90 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    {/* Left Accent Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} />

                    <div className="flex items-start justify-between gap-2 pl-1.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-rose-400">{call.callNumber}</span>
                          <PriorityBadge priority={call.priority} />
                          {call.hasTrappedPassenger && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-bold animate-pulse">
                              Passageiro Preso
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {call.equipmentTag} — {call.customerName}
                        </h4>
                      </div>

                      <StatusPill status={call.status} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pl-1.5 pt-1 border-t border-slate-800/60">
                      <span className="truncate">{call.buildingName}</span>
                      <span className="font-mono text-slate-400 text-[10px] shrink-0">
                        SLA {call.slaMaxHours}h
                      </span>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Streamlined Execution Terminal (7 cols) */}
        <div className={`lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
          mobileTab === 'tasks' ? 'hidden lg:block' : 'block'
        }`}>

          {/* ========================================================= */}
          {/* ORDEM DO TIPO: CHAMADO CORRETIVO (CALL) */}
          {/* ========================================================= */}
          {selectedItemType === 'CALL' && activeCall && (
            <div className="space-y-4">
              
              {/* Clean Active Item Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="lg:hidden pb-1">
                    <button
                      onClick={() => setMobileTab('tasks')}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Voltar para Lista</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {activeCall.callNumber}
                    </span>
                    <PriorityBadge priority={activeCall.priority} />
                    <StatusPill status={activeCall.status} />
                    {activeCall.hasTrappedPassenger && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white flex items-center gap-1 shadow-sm">
                        <ShieldAlert className="w-3 h-3" />
                        Passageiro Preso
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-bold text-white tracking-tight">
                    {activeCall.customerName}
                  </h2>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{activeCall.buildingName} • {activeCall.address}, {activeCall.city}</span>
                  </div>
                </div>

                {/* Quick 1-Click Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <a
                    href={`tel:${activeCall.customerPhone || '19988776655'}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Ligar</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activeCall.address}, ${activeCall.city} - ${activeCall.state}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>GPS</span>
                  </a>

                  <button
                    onClick={() => setShowSupervisorModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title="Pedir apoio ou notificar supervisor"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Apoio Supervisor</span>
                  </button>
                </div>
              </div>

              {/* Modern 4-Step Interactive Workflow Bar */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Etapa Atual do Atendimento:
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {activeCall.status === 'A_CAMINHO' ? 'Em Deslocamento' : activeCall.status === 'EM_ATENDIMENTO' ? 'No Local / Diagnosticando' : activeCall.status === 'CONCLUIDO' ? 'Concluído' : 'Pendente'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleCallAction('A_CAMINHO', 'Técnico iniciou deslocamento para o local')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      activeCall.status === 'A_CAMINHO'
                        ? 'bg-sky-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>1. A Caminho</span>
                  </button>

                  <button
                    onClick={() => {
                      handleCallAction('EM_ATENDIMENTO', 'Check-in no condomínio e início do reparo');
                      addToast('info', 'Check-in Confirmado', 'Chegada registrada. Atendimento em andamento.');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      activeCall.status === 'EM_ATENDIMENTO'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>2. Cheguei</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('parts');
                      addToast('info', 'Almoxarifado & Peças', 'Selecione as peças necessárias no catálogo.');
                    }}
                    className="py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-all"
                  >
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>3. Pedir Peça</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveWorkTab('finish');
                      if (!resolutionOutcome) setResolutionOutcome('RESOLVED');
                    }}
                    className="py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>4. Finalizar O.S.</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Procedimentos | Detalhes Técnicos | Finalização */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveWorkTab('checklist')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
                    activeWorkTab === 'checklist'
                      ? 'bg-slate-800 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Diagnóstico & Falha
                </button>
                <button
                  onClick={() => setActiveWorkTab('details')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
                    activeWorkTab === 'details'
                      ? 'bg-slate-800 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dados Técnicos do Ativo
                </button>
                <button
                  onClick={() => setActiveWorkTab('finish')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all ${
                    activeWorkTab === 'finish'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Conclusão & Fechamento
                </button>
              </div>

              {/* TAB 1: DIAGNÓSTICO & FALHA */}
              {activeWorkTab === 'checklist' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Defeito Relatado pelo Cliente
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400">
                        {activeCall.mainComponent} • {activeCall.subComponent}
                      </span>
                    </div>
                    <p className="text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                      {activeCall.problemDescription}
                    </p>
                    {activeCall.aiRecommendation?.matchReason && (
                      <p className="text-xs text-slate-400 italic">
                        💡 <strong>Sugestão Técnica:</strong> {activeCall.aiRecommendation.matchReason}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Anotações de Campo do Técnico
                    </label>
                    <input
                      type="text"
                      value={diagnosticText}
                      onChange={(e) => setDiagnosticText(e.target.value)}
                      placeholder="Ex: Conector frouxo ajustado no piso 4, fusível de comando substituído..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ESPECIFICAÇÕES TÉCNICAS DO ELEVADOR */}
              {activeWorkTab === 'details' && (
                <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Máquina / Tração:</span>
                      <strong className="text-white font-mono">{relatedEquipment.machineType || 'Gearless ReGen'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Controle:</span>
                      <strong className="text-white font-mono">{relatedEquipment.controlType || 'Compass 360'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Ano Instalação:</span>
                      <strong className="text-white font-mono">{relatedEquipment.installationYear || 2023}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Última Preventiva:</span>
                      <strong className="text-white font-mono">{relatedEquipment.lastMaintenanceDate || '2026-07-15'}</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Parque do Edifício:</span>
                      <span className="font-bold text-white">
                        {equipments.filter(e => e.buildingName === activeCall.buildingName).length || 1} Elevadores Instalados neste Condomínio
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Contrato: <strong className="text-cyan-400">{activeCall.contractNumber}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: CONCLUSÃO & FECHAMENTO (DESPOLUÍDO) */}
              {activeWorkTab === 'finish' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                      Resultado do Atendimento Técnico:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setResolutionOutcome('RESOLVED')}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                          resolutionOutcome === 'RESOLVED'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-300'
                        }`}
                      >
                        <CheckCircle className={`w-5 h-5 ${resolutionOutcome === 'RESOLVED' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div className="text-left">
                          <span className="block">Problema Resolvido</span>
                          <span className="text-[10px] font-normal text-slate-400">Equipamento liberado para uso</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResolutionOutcome('UNRESOLVED')}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                          resolutionOutcome === 'UNRESOLVED'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300'
                        }`}
                      >
                        <XCircle className={`w-5 h-5 ${resolutionOutcome === 'UNRESOLVED' ? 'text-rose-400' : 'text-slate-500'}`} />
                        <div className="text-left">
                          <span className="block">Não Resolvido / Pendente</span>
                          <span className="text-[10px] font-normal text-slate-400">Requer peça, guincho ou apoio</span>
                        </div>
                      </button>
                    </div>

                    {/* SE RESOLVIDO */}
                    {resolutionOutcome === 'RESOLVED' && (
                      <div className="space-y-2.5 pt-2 border-t border-slate-800 animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Diagnóstico / Solução Final *</label>
                            <input
                              type="text"
                              value={diagnosticText}
                              onChange={(e) => setDiagnosticText(e.target.value)}
                              placeholder="Ex: Regulagem da fita seletora e limpeza..."
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Peça Utilizada do Estoque Móvel</label>
                            <input
                              type="text"
                              value={usedPartInput}
                              onChange={(e) => setUsedPartInput(e.target.value)}
                              placeholder="Ex: 1x Relé térmico (opcional)"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleCallAction('CONCLUIDO', `Chamado Concluído com Sucesso! Diagnóstico: ${diagnosticText || 'Ajuste concluído'}. Peças: ${usedPartInput || 'Nenhuma'}`);
                              addToast('success', 'Chamado Finalizado', `Chamado ${activeCall.callNumber} concluído e ativo liberado.`);
                            }}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Confirmar e Concluir Chamado</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SE PENDENTE / NÃO RESOLVIDO */}
                    {resolutionOutcome === 'UNRESOLVED' && (
                      <div className="space-y-2.5 pt-2 border-t border-slate-800 animate-in fade-in duration-150 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Motivo da Pendência *</label>
                            <select
                              value={unresolvedReason}
                              onChange={(e) => setUnresolvedReason(e.target.value as any)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-rose-500"
                            >
                              <option value="NEED_PARTS">Peça Indisponível no Carro (Necessita Fábrica)</option>
                              <option value="NEED_SPECIALIST">Necessita Especialista de Eletrônica Nível 3</option>
                              <option value="ACCESS_BLOCKED">Sem Acesso à Casa de Máquinas / Síndico Ausente</option>
                              <option value="COMPLEX_DEFECT">Defeito Estrutural / Desgaste Severo</option>
                              <option value="OTHER">Outro Motivo</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Condição do Elevador *</label>
                            <select
                              value={temporaryStatus}
                              onChange={(e) => setTemporaryStatus(e.target.value as any)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-rose-500"
                            >
                              <option value="STOPPED_SAFE">Desligado com Segurança / Placa Fixada</option>
                              <option value="TOTAL_SHUTDOWN">Travado Mecanicamente / Barreira Física</option>
                              <option value="INTERMITTENT">Em Observação Técnica</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Observações para o Supervisor *</label>
                          <textarea
                            value={unresolvedDetail}
                            onChange={(e) => setUnresolvedDetail(e.target.value)}
                            rows={2}
                            placeholder="Descreva o que é necessário para a próxima equipe..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500"
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleCallAction('PAUSADO', `Chamado Não Resolvido. Motivo: ${unresolvedReason}. Detalhe: ${unresolvedDetail || 'Pendente'}`);
                              addToast('warning', 'O.S. Pausada com Segurança', `Chamado ${activeCall.callNumber} registrado como pendente.`);
                            }}
                            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Registrar Pendência & Notificar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* ORDEM DO TIPO: TAREFA DE MANUTENÇÃO (MAINTENANCE) */}
          {/* ========================================================= */}
          {selectedItemType === 'MAINTENANCE' && activeMaint && (
            <div className="space-y-4">
              
              {/* Clean Active Item Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="lg:hidden pb-1">
                    <button
                      onClick={() => setMobileTab('tasks')}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Voltar para Lista</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {activeMaint.taskNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {activeMaint.type === 'PREVENTIVA' ? 'Manutenção Preventiva' : activeMaint.type === 'PREDITIVA' ? 'Preditiva IoT' : 'Rotina'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      activeMaint.status === 'CONCLUIDA'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {activeMaint.status === 'CONCLUIDA' ? 'Concluída' : 'Em Execução'}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white tracking-tight">
                    {activeMaint.title}
                  </h2>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{activeMaint.buildingName} • {activeMaint.address}, {activeMaint.city}</span>
                  </div>
                </div>

                {/* Quick 1-Click Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activeMaint.address}, ${activeMaint.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>GPS</span>
                  </a>

                  <button
                    onClick={() => handleCompleteMaintenance(activeMaint.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                  >
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>Concluir Tarefa</span>
                  </button>
                </div>
              </div>

              {/* Equipment Summary Strip */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Ativo:</span>
                  <strong className="text-white font-mono">{activeMaint.equipmentTag}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Modelo:</span>
                  <span className="text-slate-300 font-medium">{activeMaint.equipmentModel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Duração:</span>
                  <span className="text-slate-300 font-mono">{activeMaint.estimatedDuration}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Horário:</span>
                  <span className="text-slate-300 font-mono">{activeMaint.scheduledTime}</span>
                </div>
              </div>

              {/* Checklist de Inspeção Técnica (Limpo & Organizado) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-cyan-400" />
                    Procedimentos de Manutenção ({activeMaint.checklist.filter(c => c.status === 'OK' || c.done).length}/{activeMaint.checklist.length} validados)
                  </span>
                  <span className="text-[11px] text-slate-400">Clique para marcar OK ou relatar defeito</span>
                </div>

                <div className="space-y-2">
                  {activeMaint.checklist.map((item) => {
                    const isOk = item.status === 'OK' || item.done;
                    const isProblem = item.status === 'PROBLEMA';
                    const isEditingThis = editingProblemCheckId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isOk
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : isProblem
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-start gap-2">
                            {isOk ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : isProblem ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className={`text-xs block ${isOk ? 'line-through text-slate-400' : 'text-slate-200 font-medium'}`}>
                                {item.text}
                              </span>
                              {isProblem && item.problemNotes && (
                                <span className="text-[11px] text-amber-300 font-mono block mt-0.5">
                                  ⚠️ {item.problemType === 'QUEBROU' ? 'Quebrou/Danificado' : 'Necessita de Peça'}: {item.problemNotes}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleSetChecklistStatus(activeMaint.id, item.id, isOk ? 'PENDENTE' : 'OK')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                isOk
                                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isOk ? 'OK' : 'Marcar OK'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSetChecklistStatus(activeMaint.id, item.id, 'PROBLEMA')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                isProblem
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 font-bold'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{isProblem ? 'Editar' : 'Problema'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Problem Editor */}
                        {isEditingThis && (
                          <div className="mt-2.5 p-3 rounded-lg bg-slate-900 border border-slate-700 space-y-2 animate-in fade-in duration-150">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold">Tipo do Problema</label>
                                <select
                                  value={activeProblemType}
                                  onChange={(e) => setActiveProblemType(e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                                >
                                  <option value="QUEBROU">Quebrou / Trincado / Danificado</option>
                                  <option value="NECESSITA_PECA">Necessita de Peça de Reposição</option>
                                  <option value="DESGASTE">Desgaste Excessivo / Fim de Vida</option>
                                  <option value="FOLGA">Folga Mecânica / Desalinhado</option>
                                  <option value="ELETRICO">Falha Elétrica / Curto</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold">Descrição do Defeito</label>
                                <input
                                  type="text"
                                  value={activeProblemNote}
                                  onChange={(e) => setActiveProblemNote(e.target.value)}
                                  placeholder="Ex: Sapata guia trincada..."
                                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingProblemCheckId(null)}
                                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveChecklistProblem(activeMaint.id, item.id)}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
                              >
                                Salvar Ocorrência
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tools & Parts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">
                    Ferramentas Indicadas
                  </span>
                  <ul className="text-slate-300 pl-4 list-disc space-y-0.5 text-xs">
                    {activeMaint.recommendedTools.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">
                    Peças Previstas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMaint.recommendedParts.map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800 text-xs">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MODAL DE NOTIFICAÇÃO AO SUPERVISOR (Unificado & Limpo) */}
      {showSupervisorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Notificar Supervisor de Campo</h3>
                  <p className="text-[11px] text-slate-400">Supervisor: Eng. Marcelo Albuquerque</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupervisorModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Motivo do Contato com o Supervisor:</label>
                <select
                  value={supervisorReason}
                  onChange={(e) => setSupervisorReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-purple-500"
                >
                  <option value="REALLOCATE_TECH">Realocar Outro Técnico (Estou retido / Preciso de troca)</option>
                  <option value="JOIN_CALL">Incluir Técnico de Apoio (Equipe em Dupla para Peso/Segurança)</option>
                  <option value="URGENT_APPROVAL">Aprovação Urgente de Peça Específica</option>
                  <option value="DIAGNOSTIC_HELP">Dúvida Técnica / Esquema Elétrico</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observação do Técnico:</label>
                <textarea
                  value={supervisorNote}
                  onChange={(e) => setSupervisorNote(e.target.value)}
                  rows={3}
                  placeholder="Ex: Preciso de apoio para nivelar contrapeso com 2 mecânicos..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                • Chamado: <strong className="text-slate-200">{activeCall?.callNumber || activeMaint?.taskNumber}</strong> • Edifício: {activeCall?.buildingName || activeMaint?.buildingName}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSupervisorModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSupervisorModal(false);
                  addTechActivityLog({
                    type: 'SUPERVISOR_NOTIFICADO',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: `Hoje, ${new Date().toLocaleDateString('pt-BR')}`,
                    title: `Supervisor Notificado pelo Técnico`,
                    description: `Motivo: ${supervisorReason}. Mensagem: "${supervisorNote || 'Solicitação de suporte'}".`,
                    callNumber: activeCall?.callNumber || activeMaint?.taskNumber,
                    equipmentTag: activeCall?.equipmentTag || activeMaint?.equipmentTag,
                    technicianName: currentUser.name,
                    metadata: { reason: supervisorReason }
                  });
                  addToast('success', 'Supervisor Notificado', 'Mensagem e dados do chamado despachados com sucesso.');
                }}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Notificação</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
