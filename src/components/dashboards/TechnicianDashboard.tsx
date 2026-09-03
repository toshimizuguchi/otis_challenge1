import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard, PriorityBadge, StatusPill, RiskGauge } from '../common/UIComponents';
import { 
  Wrench, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Navigation, 
  Package, 
  FileText, 
  Sparkles,
  Play,
  Check,
  Phone,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  ListTodo,
  PlayCircle,
  ClipboardCheck,
  AlertCircle,
  Sliders,
  CheckSquare,
  Square,
  Cpu,
  Layers,
  UserPlus,
  Send,
  HelpCircle,
  XCircle,
  RotateCcw,
  ArrowLeft
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
  
  // Equipment Tasks Local State (for interactive checklist)
  const [maintTasks, setMaintTasks] = useState<EquipmentMaintenanceTask[]>(INITIAL_EQUIPMENT_TASKS);
  
  // Item problem editing modal/inline state
  const [editingProblemCheckId, setEditingProblemCheckId] = useState<string | null>(null);
  const [activeProblemType, setActiveProblemType] = useState<ChecklistItem['problemType']>('QUEBROU');
  const [activeProblemNote, setActiveProblemNote] = useState<string>('');
  
  const [mobileTab, setMobileTab] = useState<'tasks' | 'execution'>('tasks');
  const [showLearnMore, setShowLearnMore] = useState(false);
  
  // Resolution outcome: null (unselected) | 'RESOLVED' | 'UNRESOLVED'
  const [resolutionOutcome, setResolutionOutcome] = useState<'RESOLVED' | 'UNRESOLVED' | null>(null);
  const [unresolvedReason, setUnresolvedReason] = useState<'NEED_PARTS' | 'NEED_SPECIALIST' | 'ACCESS_BLOCKED' | 'COMPLEX_DEFECT' | 'OTHER'>('NEED_PARTS');
  const [unresolvedDetail, setUnresolvedDetail] = useState('');
  const [temporaryStatus, setTemporaryStatus] = useState<'INTERMITTENT' | 'STOPPED_SAFE' | 'TOTAL_SHUTDOWN'>('STOPPED_SAFE');
  
  // Supervisor Notification state
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [supervisorReason, setSupervisorReason] = useState<'REALLOCATE_TECH' | 'JOIN_CALL' | 'URGENT_APPROVAL' | 'DIAGNOSTIC_HELP'>('REALLOCATE_TECH');
  const [supervisorNote, setSupervisorNote] = useState('');
  const [supervisorSent, setSupervisorSent] = useState(false);

  const [diagnosticText, setDiagnosticText] = useState('');
  const [usedPartInput, setUsedPartInput] = useState('');

  // Technician Corrective Calls: João Pedro Santos
  const techCalls = calls.filter(c => c.technicianName?.includes('João Pedro') || c.city === 'Campinas');
  
  const activeCall = techCalls.find(c => c.id === selectedCallId) || techCalls[0];
  const activeMaint = maintTasks.find(m => m.id === selectedMaintId) || maintTasks[0];
  
  const relatedEquipment = equipments.find(e => 
    e.id === (selectedItemType === 'CALL' ? activeCall?.equipmentId : activeMaint?.equipmentId)
  ) || equipments[0];

  const handleCallAction = (newStatus: any, note: string) => {
    if (!activeCall) return;
    updateCallStatus(activeCall.id, newStatus, note);

    // Record to TechActivityLogs
    let actionType: any = 'OS_CONCLUIDA';
    if (newStatus === 'EM_DESLOCAMENTO') actionType = 'CHECK_IN';
    else if (newStatus === 'EM_ANDAMENTO') actionType = 'CHECK_IN';
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
      addToast({
        type: 'success',
        title: 'Item Validado',
        message: 'Procedimento técnico marcado como conforme (OK).'
      });
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

    // Record activity log
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
        itemText: item.text,
        problemType: activeProblemType,
        problemNotes: activeProblemNote
      }
    });

    addToast({
      type: 'warning',
      title: 'Problema Registrado no Histórico',
      message: `Item gravado como "${activeProblemType === 'QUEBROU' ? 'Quebrou' : activeProblemType === 'NECESSITA_PECA' ? 'Necessita de Peça' : 'Falha'}". Você pode solicitar a peça no catálogo.`
    });

    setEditingProblemCheckId(null);
  };

  const handleCompleteMaintenance = (taskId: string) => {
    setMaintTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'CONCLUIDA' } : t
    ));

    addTechActivityLog({
      type: 'PREVENTIVA_FEITA',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `Hoje, ${new Date().toLocaleDateString('pt-BR')}`,
      title: `Preventiva Concluída: ${activeMaint.taskNumber}`,
      description: `Manutenção ${activeMaint.title} finalizada no equipamento ${activeMaint.equipmentTag} (${activeMaint.buildingName}).`,
      callNumber: activeMaint.taskNumber,
      equipmentTag: activeMaint.equipmentTag,
      technicianName: currentUser.name
    });

    addToast({
      type: 'success',
      title: 'Manutenção Concluída!',
      message: `Tarefa ${activeMaint.taskNumber} no equipamento ${activeMaint.equipmentTag} finalizada com sucesso.`
    });
  };

  const handleSelectCall = (callId: string) => {
    setSelectedItemType('CALL');
    setSelectedCallId(callId);
    setMobileTab('execution');
  };

  const handleSelectMaintenance = (maintId: string) => {
    setSelectedItemType('MAINTENANCE');
    setSelectedMaintId(maintId);
    setMobileTab('execution');
  };

  const criticalCallsCount = techCalls.filter(c => c.priority === 'CRITICO').length;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      {/* Technician Welcome Header - Refined Dark with Subtle Cyan & Emerald Accents */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-slate-900 border border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
              Terminal Técnico de Campo
            </span>
            <span className="text-xs text-zinc-400 font-mono">Unidade Móvel #14 • BRA-4E29</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Olá, João Pedro Santos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Painel de atendimentos em campo, manutenções preventivas e requisição de peças.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-zinc-950/90 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span>GPS ATIVO • POLO CAMPINAS</span>
          </div>
        </div>
      </div>

      {/* Separated Metric Summary Cards - Elegant with Color Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        
        {/* Card 1: Emergency & Corrective Calls */}
        <div 
          onClick={() => setFilterType('CALLS')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            filterType === 'CALLS'
              ? 'bg-rose-950/20 border-rose-500/60 ring-1 ring-rose-500/30 shadow-md shadow-rose-950/40'
              : 'bg-zinc-900/90 border-zinc-800 hover:border-rose-500/40 hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Chamados Corretivos
                </span>
                <span className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono">
                  {techCalls.length} <span className="text-sm font-normal text-zinc-400 font-sans">Chamado{techCalls.length === 1 ? '' : 's'}</span>
                </span>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
              criticalCallsCount > 0
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}>
              {criticalCallsCount > 0 ? `${criticalCallsCount} Crítico` : 'Atendimento Imediato'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Ocorrências de clientes, falhas operacionais e desarmes de segurança.
          </p>
        </div>

        {/* Card 2: Equipment Maintenance & Repair Tasks */}
        <div 
          onClick={() => setFilterType('MAINTENANCE')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            filterType === 'MAINTENANCE'
              ? 'bg-cyan-950/20 border-cyan-500/60 ring-1 ring-cyan-500/30 shadow-md shadow-cyan-950/40'
              : 'bg-zinc-900/90 border-zinc-800 hover:border-cyan-500/40 hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Wrench className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Tarefas nos Equipamentos
                </span>
                <span className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono">
                  {maintTasks.length} <span className="text-sm font-normal text-zinc-400 font-sans">Manutenç{maintTasks.length === 1 ? 'ão' : 'ões'}</span>
                </span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30">
              Preventivas & Rotinas
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Revisões programadas, ajustes técnicos de portas e testes de segurança.
          </p>
        </div>

      </div>

      {/* Mobile Tab Segmented Switcher (Visible only on mobile) */}
      <div className="lg:hidden flex rounded-xl bg-zinc-950 border border-zinc-800 p-1">
        <button
          onClick={() => setMobileTab('tasks')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] touch-manipulation ${
            mobileTab === 'tasks'
              ? 'bg-zinc-100 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Agenda do Dia ({techCalls.length + maintTasks.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('execution')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] touch-manipulation ${
            mobileTab === 'execution'
              ? 'bg-zinc-100 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Execução em Campo</span>
        </button>
      </div>

      {/* Main Field Interface: Separated Agenda + Execution Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Separated Agenda of the Day */}
        <div className={`lg:col-span-5 bg-zinc-900/90 border border-zinc-700/70 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${
          mobileTab === 'execution' ? 'hidden lg:block' : 'block'
        }`}>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Atividades de Hoje</h3>
              <p className="text-xs text-zinc-400">Selecione para abrir o terminal de execução</p>
            </div>
            <span className="text-xs font-mono text-zinc-300 font-semibold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
              {techCalls.length + maintTasks.length} Totais
            </span>
          </div>

          {/* Filter Pills in Silver / Titanium */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                filterType === 'ALL'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todas ({techCalls.length + maintTasks.length})
            </button>
            <button
              onClick={() => setFilterType('MAINTENANCE')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                filterType === 'MAINTENANCE'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span>Manutenção ({maintTasks.length})</span>
            </button>
            <button
              onClick={() => setFilterType('CALLS')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                filterType === 'CALLS'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Chamados ({techCalls.length})</span>
            </button>
          </div>

          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
            
            {/* SECTION 1: TAREFAS DE MANUTENÇÃO NOS EQUIPAMENTOS */}
            {(filterType === 'ALL' || filterType === 'MAINTENANCE') && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-zinc-400" /> Tarefas nos Equipamentos ({maintTasks.length})
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Preventivas & Rotinas</span>
                </div>

                {maintTasks.map((task) => {
                  const completedChecks = task.checklist.filter(c => c.done).length;
                  const isSelected = selectedItemType === 'MAINTENANCE' && selectedMaintId === task.id;

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleSelectMaintenance(task.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 min-h-[58px] touch-manipulation ${
                        isSelected
                          ? 'bg-zinc-800/90 border-zinc-300 ring-1 ring-zinc-300/40 shadow-sm'
                          : 'bg-zinc-950/80 border-zinc-800/90 hover:bg-zinc-800/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                              {task.taskNumber}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/70 text-zinc-300 border border-zinc-700/50">
                              {task.type === 'PREVENTIVA' ? 'Preventiva' : task.type === 'PREDITIVA' ? 'Preditiva IoT' : 'Rotina'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-zinc-100">{task.title}</h4>
                          <div className="text-[11px] text-zinc-300 font-medium">
                            {task.equipmentTag} ({task.equipmentModel})
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            task.status === 'CONCLUIDA'
                              ? 'bg-zinc-800 text-zinc-200 border-zinc-600'
                              : task.status === 'EM_ANDAMENTO'
                              ? 'bg-zinc-800 text-zinc-100 border-zinc-500 font-bold'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}>
                            {task.status === 'CONCLUIDA' ? 'Concluída' : task.status === 'EM_ANDAMENTO' ? 'Em Execução' : 'Agendada'}
                          </span>
                          <div className="text-[10px] text-zinc-400 font-mono mt-1">
                            {task.estimatedDuration}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                        <span className="truncate">{task.buildingName}</span>
                        <span className="text-zinc-300 font-mono text-[10px] shrink-0 font-medium">
                          {completedChecks}/{task.checklist.length} itens validados
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SECTION 2: CHAMADOS CORRETIVOS */}
            {(filterType === 'ALL' || filterType === 'CALLS') && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" /> Chamados de Clientes ({techCalls.length})
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">O.S. Corretivas</span>
                </div>

                {techCalls.map((call) => {
                  const isSelected = selectedItemType === 'CALL' && selectedCallId === call.id;

                  return (
                    <div
                      key={call.id}
                      onClick={() => handleSelectCall(call.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 min-h-[58px] touch-manipulation ${
                        isSelected
                          ? 'bg-zinc-800/90 border-zinc-300 ring-1 ring-zinc-300/40 shadow-sm'
                          : 'bg-zinc-950/80 border-zinc-800/90 hover:bg-zinc-800/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-zinc-100">{call.callNumber}</span>
                          <PriorityBadge priority={call.priority} />
                          {call.hasTrappedPassenger && (
                            <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-950 text-[9px] font-bold">
                              PASSAGEIRO PRESO
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-zinc-100">
                          {call.equipmentTag} ({call.equipmentModel})
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate">{call.buildingName} • {call.city}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <StatusPill status={call.status} />
                        <div className="text-[10px] text-zinc-400 font-mono">
                          SLA {call.slaMaxHours}h
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Execution Workspace according to Selected Item Type */}
        <div className={`lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5 ${
          mobileTab === 'tasks' ? 'hidden lg:block' : 'block'
        }`}>

          {/* VIEW A: TAREFA DE MANUTENÇÃO NO EQUIPAMENTO (ARRUMAR EQUIPAMENTO) */}
          {selectedItemType === 'MAINTENANCE' && activeMaint && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div className="space-y-1">
                  <div className="lg:hidden pb-1">
                    <button
                      onClick={() => setMobileTab('tasks')}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-lg min-h-[38px] touch-manipulation cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Voltar para a Agenda</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-zinc-800 text-zinc-100 border border-zinc-700">
                      {activeMaint.taskNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-zinc-800/80 text-zinc-300 border border-zinc-700">
                      {activeMaint.type === 'PREVENTIVA' ? 'Manutenção Preventiva' : activeMaint.type === 'PREDITIVA' ? 'Preditiva IoT' : 'Rotina'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      activeMaint.status === 'CONCLUIDA'
                        ? 'bg-zinc-800 text-zinc-200 border-zinc-600'
                        : 'bg-zinc-800 text-zinc-100 border-zinc-500 font-bold'
                    }`}>
                      {activeMaint.status === 'CONCLUIDA' ? 'Concluída' : 'Em Execução'}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-100">{activeMaint.title}</h2>
                  <p className="text-xs text-zinc-400">{activeMaint.buildingName} — {activeMaint.address}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activeMaint.address}, ${activeMaint.city || 'Campinas'}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 text-sky-200 text-xs font-semibold flex items-center gap-1.5 min-h-[40px] touch-manipulation cursor-pointer border border-sky-500/40 transition-all"
                  >
                    <Navigation className="w-4 h-4 text-sky-400" />
                    <span>Abrir GPS</span>
                  </a>
                  <button
                    onClick={() => handleCompleteMaintenance(activeMaint.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 min-h-[40px] touch-manipulation cursor-pointer shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Concluir Tarefa</span>
                  </button>
                </div>
              </div>

              {/* Equipment Technical Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Ativo em Manutenção:</span>
                    <strong className="text-zinc-200 font-mono">{activeMaint.equipmentTag} • {activeMaint.equipmentModel}</strong>
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Tempo Estimado:</span>
                  <span className="text-zinc-200 font-mono font-medium">{activeMaint.estimatedDuration}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Horário Agendado:</span>
                  <span className="text-zinc-200 font-mono font-medium">{activeMaint.scheduledTime}</span>
                </div>
              </div>

              {/* Interactive Inspection Checklist */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-zinc-400" /> Checklist de Procedimentos Técnicos
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Marque como Conforme (OK) ou registre problemas/avarias como quebrou ou falta de peça.
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-200 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                    {activeMaint.checklist.filter(c => c.status === 'OK' || c.done).length} de {activeMaint.checklist.length} concluídos
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeMaint.checklist.map((item) => {
                    const isOk = item.status === 'OK' || item.done;
                    const isProblem = item.status === 'PROBLEMA';
                    const isEditingThis = editingProblemCheckId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                          isOk
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                            : isProblem
                            ? 'bg-amber-950/20 border-amber-500/40 text-amber-100'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">
                              {isOk ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : isProblem ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border-2 border-zinc-600 inline-block" />
                              )}
                            </div>
                            <div>
                              <span className={`text-xs block ${isOk ? 'line-through text-zinc-400' : 'text-zinc-200 font-medium'}`}>
                                {item.text}
                              </span>
                              {isProblem && item.problemNotes && (
                                <span className="text-[11px] text-amber-300 font-mono block mt-1">
                                  ⚠️ <strong>{item.problemType === 'QUEBROU' ? 'Quebrou' : item.problemType === 'NECESSITA_PECA' ? 'Necessita de Peça' : 'Falha Identificada'}:</strong> {item.problemNotes}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Action Buttons: Conforme (OK) vs Problema */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleSetChecklistStatus(activeMaint.id, item.id, isOk ? 'PENDENTE' : 'OK')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                                isOk
                                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                                  : 'bg-zinc-800 hover:bg-emerald-950/40 hover:text-emerald-300 hover:border-emerald-500/40 text-zinc-300 border border-zinc-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isOk ? 'Conforme (OK)' : 'Marcar OK'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSetChecklistStatus(activeMaint.id, item.id, 'PROBLEMA')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                                isProblem
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 font-bold shadow-sm'
                                  : 'bg-zinc-800 hover:bg-amber-950/40 hover:text-amber-300 hover:border-amber-500/40 text-zinc-300 border border-zinc-700'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{isProblem ? 'Problema (Editar)' : 'Relatar Problema'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Problem Editor */}
                        {isEditingThis && (
                          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-700 space-y-2.5 animate-in fade-in duration-150">
                            <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                              <span>Registrar Problema / Ocorrência no Item</span>
                              <span className="text-zinc-400 font-normal">Gera histórico no sistema</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-zinc-400 mb-1 uppercase font-semibold">Tipo do Problema</label>
                                <select
                                  value={activeProblemType}
                                  onChange={(e) => setActiveProblemType(e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-400"
                                >
                                  <option value="QUEBROU">Quebrou / Trincado / Danificado</option>
                                  <option value="NECESSITA_PECA">Necessita de Peça Nova / Reposição</option>
                                  <option value="DESGASTE">Desgaste Excessivo / Fim de Vida Útil</option>
                                  <option value="FOLGA">Folga Mecânica / Desalinhamento</option>
                                  <option value="ELETRICO">Falso Contato / Queima de Componente</option>
                                  <option value="OUTRO">Outro Problema Técnico</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] text-zinc-400 mb-1 uppercase font-semibold">Descrição do Defeito</label>
                                <input
                                  type="text"
                                  value={activeProblemNote}
                                  onChange={(e) => setActiveProblemNote(e.target.value)}
                                  placeholder="Ex: Sapata guia quebrada por impacto..."
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  handleSaveChecklistProblem(activeMaint.id, item.id);
                                  setActiveView('parts');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Package className="w-3.5 h-3.5 text-zinc-300" />
                                <span>Salvar & Pedir Peça no Catálogo</span>
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingProblemCheckId(null)}
                                  className="px-2.5 py-1 rounded-lg text-xs text-zinc-400 hover:text-white"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveChecklistProblem(activeMaint.id, item.id)}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold shadow-sm"
                                >
                                  Salvar Problema
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tools & Parts for this Equipment Maintenance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-zinc-400" /> Ferramentas e Gabaritos
                  </div>
                  <ul className="space-y-1 text-zinc-300 pl-4 list-disc text-xs">
                    {activeMaint.recommendedTools.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-zinc-400" /> Peças e Insumos Previstos
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMaint.recommendedParts.map((p, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technician Notes for this Equipment Maintenance */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Observações Técnicas do Equipamento
                </label>
                <input
                  type="text"
                  value={diagnosticText}
                  onChange={(e) => setDiagnosticText(e.target.value)}
                  placeholder="Ex: Folga da porta ajustada para 5.8mm, lubrificação de barramento concluída..."
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 min-h-[42px]"
                />
              </div>

            </div>
          )}

          {/* VIEW B: CHAMADO CORRETIVO / EMERGÊNCIA DO CLIENTE */}
          {selectedItemType === 'CALL' && activeCall && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              
              {/* TOP PRIMARY HIGHLIGHT CARD - Silver & Titanium High-Contrast */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/95 border border-zinc-700/80 shadow-md space-y-4">
                
                {/* 1. Header with Call ID, Status, Priority, Trapped Alert & Actions */}
                <div className="space-y-3 pb-3 border-b border-zinc-800">
                  
                  {/* Mobile Back Button */}
                  <div className="lg:hidden">
                    <button
                      onClick={() => setMobileTab('tasks')}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-lg min-h-[38px] touch-manipulation cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Voltar para a Agenda</span>
                    </button>
                  </div>

                  {/* Line 1: Call Tags & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-mono font-bold text-zinc-100 whitespace-nowrap px-2.5 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700">
                        {activeCall.callNumber}
                      </span>
                      <PriorityBadge priority={activeCall.priority} />
                      <StatusPill status={activeCall.status} />
                      {activeCall.hasTrappedPassenger && (
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-rose-900/50 whitespace-nowrap animate-pulse">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>PASSAGEIRO RETIDO</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Ligar Portaria, Navegar GPS e Notificar Supervisor */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <a
                        href={`tel:${activeCall.customerPhone}`}
                        className="px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 min-h-[40px] touch-manipulation transition-all border border-emerald-500/30 whitespace-nowrap"
                      >
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span>Ligar Portaria</span>
                      </a>
                      
                      {/* O botão de Notificar Supervisor só aparece quando clicar em "Cheguei" (status EM_ATENDIMENTO) */}
                      {activeCall.status === 'EM_ATENDIMENTO' && (
                        <button
                          onClick={() => setShowSupervisorModal(true)}
                          className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 min-h-[40px] touch-manipulation cursor-pointer transition-all shadow-sm whitespace-nowrap animate-in fade-in"
                          title="Notificar supervisor para realocar técnico ou prestar suporte"
                        >
                          <UserPlus className="w-4 h-4 text-purple-400" />
                          <span>Notificar Supervisor</span>
                        </button>
                      )}

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activeCall.address}, ${activeCall.city} - ${activeCall.state}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 text-sky-200 text-xs font-bold flex items-center gap-1.5 min-h-[40px] touch-manipulation cursor-pointer border border-sky-500/40 transition-all whitespace-nowrap"
                      >
                        <Navigation className="w-4 h-4 text-sky-400" />
                        <span>Abrir no GPS</span>
                      </a>
                    </div>
                  </div>

                  {/* Line 2: Customer Name and Distance / ETA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                      {activeCall.customerName}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap shrink-0 shadow-sm w-fit font-mono">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>5km • ~15 minutos de você</span>
                    </span>
                  </div>

                </div>

                {/* 2. Grid with THE PRINCIPAL ESSENTIALS: Endereço & Modelo do Serviço */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* PRINCIPAL 1: Endereço */}
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>Endereço Completo</span>
                    </div>
                    <div className="text-xs font-bold text-zinc-100 line-clamp-1">
                      {activeCall.buildingName}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {activeCall.address}, {activeCall.city} - {activeCall.state}
                    </div>
                  </div>

                  {/* PRINCIPAL 2: Modelo do Serviço */}
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>Modelo do Serviço</span>
                    </div>
                    <div className="text-xs font-bold text-zinc-100">
                      {activeCall.equipmentType === 'ELEVADOR_PASSAGEIROS' ? 'Elevador de Passageiros' : activeCall.equipmentType === 'ESCADA_ROLANTE' ? 'Escada Rolante' : 'Elevador'}
                    </div>
                    <div className="text-xs text-zinc-300 font-mono font-medium">
                      {activeCall.equipmentModel} • Tag: {activeCall.equipmentTag}
                    </div>
                  </div>

                </div>

                {/* PRINCIPAL 3: Etapa do Atendimento em Campo */}
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-200">
                      <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                      Etapa do Atendimento em Campo
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Atualize conforme avança</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleCallAction('A_CAMINHO', 'Técnico iniciou deslocamento')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] touch-manipulation ${
                        activeCall.status === 'A_CAMINHO'
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md shadow-sky-900/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-sky-500/40 hover:text-sky-300 active:scale-95'
                      }`}
                    >
                      <Navigation className={`w-4 h-4 shrink-0 ${activeCall.status === 'A_CAMINHO' ? 'text-slate-950' : 'text-sky-400'}`} />
                      <span className="whitespace-nowrap">1. A Caminho</span>
                    </button>

                    <button
                      onClick={() => {
                        handleCallAction('EM_ATENDIMENTO', 'Check-in no edifício / Iniciado diagnóstico');
                        addToast({
                          type: 'info',
                          title: 'Chegada Confirmada',
                          message: 'Atendimento iniciado no local. A opção de notificar o supervisor agora está disponível.'
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] touch-manipulation ${
                        activeCall.status === 'EM_ATENDIMENTO'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-900/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 active:scale-95'
                      }`}
                    >
                      <Clock className={`w-4 h-4 shrink-0 ${activeCall.status === 'EM_ATENDIMENTO' ? 'text-slate-950' : 'text-amber-400'}`} />
                      <span className="whitespace-nowrap">2. Cheguei</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('parts');
                        addToast({
                          type: 'info',
                          title: 'Catálogo de Peças',
                          message: 'Selecione as peças necessárias e vincule a este chamado.'
                        });
                      }}
                      className="p-2.5 rounded-xl border bg-amber-950/20 border-amber-500/30 text-amber-300 hover:bg-amber-950/40 hover:border-amber-500/60 active:scale-95 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer min-h-[46px] touch-manipulation transition-all"
                    >
                      <Package className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="whitespace-nowrap">3. Pedir Peça</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!resolutionOutcome) {
                          setResolutionOutcome('RESOLVED');
                        }
                      }}
                      className="p-2.5 rounded-xl border bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer min-h-[46px] touch-manipulation active:scale-95 transition-all shadow-sm"
                    >
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="whitespace-nowrap">4. Concluir O.S.</span>
                    </button>
                  </div>

                  {/* Banner de Notificar Supervisor quando o técnico estiver no local ("Cheguei") */}
                  {activeCall.status === 'EM_ATENDIMENTO' && (
                    <div className="mt-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-600 flex items-center justify-center shrink-0">
                          <UserPlus className="w-3.5 h-3.5 text-zinc-200" />
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-zinc-200 block">Técnico no local ({activeCall.buildingName})</span>
                          <span className="text-zinc-400 text-[11px]">Precisa realocar, chamar apoio em dupla ou notificar o supervisor?</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSupervisorModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-100 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Notificar Supervisor</span>
                      </button>
                    </div>
                  )}

                </div>

              </div>

              {/* BOTÃO "SAIBA MAIS" PARA DETALHES TÉCNICOS ADICIONAIS */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                <button
                  onClick={() => setShowLearnMore(!showLearnMore)}
                  className="w-full px-4 py-3 bg-zinc-900/80 hover:bg-zinc-900 text-zinc-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer min-h-[44px] touch-manipulation"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-zinc-400" />
                    <span>Saiba mais sobre este chamado e equipamento</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-normal">
                      {showLearnMore ? 'Ocultar detalhes' : 'Ver quantidade, horário que parou, especificações'}
                    </span>
                  </div>
                  {showLearnMore ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {/* Conteúdo Expansível do Saiba Mais */}
                {showLearnMore && (
                  <div className="p-4 border-t border-zinc-800 space-y-4 bg-zinc-950 animate-in fade-in duration-150">
                    
                    {/* Grid com Quantidade no Local e Horário que Parou */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Quantos Tem no Local */}
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>Quantos Tem no Local</span>
                        </div>
                        <div className="text-xs font-bold text-zinc-100">
                          {equipments.filter(e => e.buildingName === activeCall.buildingName || e.customerId === activeCall.customerId).length || 1} Equipamentos no Edifício
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
                          <span>1 Parado • {(equipments.filter(e => e.buildingName === activeCall.buildingName || e.customerId === activeCall.customerId).length || 1) - 1} Operacionais</span>
                        </div>
                      </div>

                      {/* Horário que Parou */}
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>Horário que Parou</span>
                        </div>
                        <div className="text-xs font-bold text-zinc-200 font-mono">
                          {activeCall.createdAt ? `${activeCall.createdAt.split('T')[1]?.substring(0, 5) || '14:45'}` : '14:45'} (há ~35 min)
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          SLA Máx: <strong className="text-zinc-200">{activeCall.slaMaxHours || 1}h</strong> • Contrato: {activeCall.contractNumber}
                        </div>
                      </div>

                    </div>

                    {/* Especificações Técnicas do Ativo */}
                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                      <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                        Especificações Técnicas do Ativo
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block uppercase">Máquina / Tração:</span>
                          <strong className="text-zinc-200 font-mono">{relatedEquipment.machineType || 'Gearless ReGen'}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block uppercase">Quadro / Controle:</span>
                          <strong className="text-zinc-200 font-mono">{relatedEquipment.controlType || 'Compass 360 Destination Dispatch'}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block uppercase">Ano Instalação:</span>
                          <strong className="text-zinc-200 font-mono">{relatedEquipment.installationYear || 2023}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block uppercase">Última Preventiva:</span>
                          <strong className="text-zinc-200 font-mono">{relatedEquipment.lastMaintenanceDate || '2026-07-15'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Diagnóstico Técnico & Defeito Relatado */}
                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                          Diagnóstico & Recomendações Técnicas
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">Componente: {activeCall.mainComponent} ({activeCall.subComponent})</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                        <strong className="text-zinc-200">Problema Relatado:</strong> {activeCall.problemDescription}
                      </div>
                      {activeCall.aiRecommendation?.matchReason && (
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          {activeCall.aiRecommendation.matchReason}
                        </p>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* REGISTRO DE CONCLUSÃO TÉCNICA (DEU PARA RESOLVER OU NÃO DEU) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-700/80 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-zinc-400" />
                      Registro de Conclusão Técnica
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Indique se a falha foi solucionada em campo ou se exige nova ação
                    </p>
                  </div>
                </div>

                {/* Pergunta Central: Deu para resolver ou não? */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    O problema foi solucionado neste atendimento?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* OPÇÃO 1: DEU PARA RESOLVER */}
                    <button
                      type="button"
                      onClick={() => setResolutionOutcome('RESOLVED')}
                      className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-3 transition-all cursor-pointer min-h-[50px] touch-manipulation ${
                        resolutionOutcome === 'RESOLVED'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-300'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        resolutionOutcome === 'RESOLVED' ? 'bg-emerald-500 text-slate-950' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        <Check className="w-4 h-4 font-bold" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm">Sim, Deu para Resolver</span>
                        <span className="text-[11px] font-normal text-zinc-400 block">Equipamento liberado e em operação normal</span>
                      </div>
                    </button>

                    {/* OPÇÃO 2: NÃO DEU PARA RESOLVER */}
                    <button
                      type="button"
                      onClick={() => setResolutionOutcome('UNRESOLVED')}
                      className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-3 transition-all cursor-pointer min-h-[50px] touch-manipulation ${
                        resolutionOutcome === 'UNRESOLVED'
                          ? 'bg-rose-950/40 border-rose-500 text-rose-100 shadow-md ring-1 ring-rose-500/40'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-rose-500/40 hover:text-rose-300'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        resolutionOutcome === 'UNRESOLVED' ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        <XCircle className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm">Não Deu para Resolver</span>
                        <span className="text-[11px] font-normal text-zinc-400 block">Necessita peça especial, apoio ou reagendamento</span>
                      </div>
                    </button>

                  </div>
                </div>

                {/* SE DEU PARA RESOLVER -> CAMPOS DE SUCESSO */}
                {resolutionOutcome === 'RESOLVED' && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Dados do Reparo Concluído
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-300 mb-1 font-medium">Diagnóstico e Solução Aplicada *</label>
                        <input
                          type="text"
                          value={diagnosticText}
                          onChange={(e) => setDiagnosticText(e.target.value)}
                          placeholder="Ex: Regulagem da fita seletora e limpeza dos contatos..."
                          className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 min-h-[42px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-300 mb-1 font-medium">Peças Utilizadas do Estoque Móvel</label>
                        <input
                          type="text"
                          value={usedPartInput}
                          onChange={(e) => setUsedPartInput(e.target.value)}
                          placeholder="Ex: 1x Sensor Magnético Reed Switch (opcional)"
                          className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 min-h-[42px]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          handleCallAction('CONCLUIDO', `Chamado Concluído com Sucesso! Diagnóstico: ${diagnosticText || 'Ajuste e teste funcional realizados'}. Peças: ${usedPartInput || 'Nenhuma'}`);
                          addToast({
                            type: 'success',
                            title: 'Chamado Concluído!',
                            message: `O chamado ${activeCall.callNumber} foi finalizado e o equipamento ${activeCall.equipmentTag} voltou a operar.`
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/50 transition-all"
                      >
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Finalizar e Liberar Equipamento</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SE NÃO DEU PARA RESOLVER -> CAMPOS DE PENDÊNCIA */}
                {resolutionOutcome === 'UNRESOLVED' && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-rose-500/30 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Motivo da Não Resolução Imediata
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                        Aviso será enviado ao Supervisor
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-300 mb-1 font-medium">Motivo Principal *</label>
                        <select
                          value={unresolvedReason}
                          onChange={(e) => setUnresolvedReason(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-zinc-400 min-h-[42px]"
                        >
                          <option value="NEED_PARTS">Peça Indisponível no Carro (Necessita Fábrica/Almoxarifado)</option>
                          <option value="NEED_SPECIALIST">Necessita Especialista de Eletrônica / Suporte Nível 3</option>
                          <option value="ACCESS_BLOCKED">Sem Acesso à Casa de Máquinas / Síndico Ausente</option>
                          <option value="COMPLEX_DEFECT">Defeito Estrutural / Desgaste Severo de Cabos</option>
                          <option value="OTHER">Outro Motivo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-300 mb-1 font-medium">Condição em que o Elevador Ficou *</label>
                        <select
                          value={temporaryStatus}
                          onChange={(e) => setTemporaryStatus(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-zinc-400 min-h-[42px]"
                        >
                          <option value="STOPPED_SAFE">Desligado com Segurança / Placa de Manutenção Fixada</option>
                          <option value="TOTAL_SHUTDOWN">Travado Mecanicamente / Barreira Física Colocada</option>
                          <option value="INTERMITTENT">Em Observação Técnica (Apenas técnicos no local)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-300 mb-1 font-medium">Descrição Detalhada do que Falta para Resolver *</label>
                      <textarea
                        value={unresolvedDetail}
                        onChange={(e) => setUnresolvedDetail(e.target.value)}
                        rows={2}
                        placeholder="Ex: Identificado curto no enrolamento do motor de tração. Necessário guincho e envio de equipe pesada..."
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                      />
                    </div>

                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          setSupervisorReason('REALLOCATE_TECH');
                          setShowSupervisorModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 min-h-[40px] cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Solicitar Realocação ou Apoio Técnico</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleCallAction('PAUSADO', `Chamado Não Resolvido no Local. Motivo: ${unresolvedReason}. Condição: ${temporaryStatus}. Detalhes: ${unresolvedDetail || 'Aguardando peças/apoio'}`);
                          addToast({
                            type: 'warning',
                            title: 'Chamado Registrado como Pendente',
                            message: `O chamado ${activeCall.callNumber} foi pausado com segurança e o supervisor foi notificado para novo agendamento.`
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-500 text-zinc-100 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                      >
                        <RotateCcw className="w-4 h-4 text-zinc-300" />
                        <span>Registrar Pendência & Manter Desligado</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* MODAL DE NOTIFICAÇÃO AO SUPERVISOR */}
              {showSupervisorModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
                    
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-600 flex items-center justify-center">
                          <UserPlus className="w-4 h-4 text-zinc-200" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-100">Notificar Supervisor de Campo</h3>
                          <p className="text-[11px] text-zinc-400">Supervisor: {activeCall.supervisorName || 'Eng. Marcelo Albuquerque'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSupervisorModal(false)}
                        className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-1">Qual o objetivo do contato com o supervisor?</label>
                        <select
                          value={supervisorReason}
                          onChange={(e) => setSupervisorReason(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-zinc-400 min-h-[42px]"
                        >
                          <option value="REALLOCATE_TECH">Realocar Outro Técnico (Estou retido / Preciso de troca)</option>
                          <option value="JOIN_CALL">Incluir Outro Técnico no Chamado (Equipe Dupla para Peso/Segurança)</option>
                          <option value="URGENT_APPROVAL">Aprovação Urgente de Compra de Peça</option>
                          <option value="DIAGNOSTIC_HELP">Dúvida Técnica Complexa / Esquema Elétrico</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-medium mb-1">Mensagem ou Observação ao Supervisor</label>
                        <textarea
                          value={supervisorNote}
                          onChange={(e) => setSupervisorNote(e.target.value)}
                          rows={3}
                          placeholder="Ex: Preciso que envie o Carlos com a chave de cabo de aço pois a carga do contrapeso precisa ser nivelada com 2 mecânicos..."
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                        <strong className="text-zinc-200">Informações que serão anexadas automaticamente:</strong>
                        <div className="text-zinc-400 text-[10px]">
                          • Chamado: {activeCall.callNumber} • Edifício: {activeCall.buildingName} • Equipamento: {activeCall.equipmentTag} ({activeCall.equipmentModel}) • Localização atual: 5km (15 min)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowSupervisorModal(false)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer border border-zinc-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSupervisorModal(false);
                          setSupervisorSent(true);

                          const reasonMap: Record<string, string> = {
                            REALLOCATE_TECH: 'Solicitou Realocação de Técnico',
                            JOIN_CALL: 'Solicitou Inclusão de Técnico de Apoio',
                            URGENT_APPROVAL: 'Solicitou Aprovação Urgente de Peça',
                            DIAGNOSTIC_HELP: 'Solicitou Suporte Técnico / Esquema Elétrico'
                          };

                          addTechActivityLog({
                            type: 'SUPERVISOR_NOTIFICADO',
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            date: `Hoje, ${new Date().toLocaleDateString('pt-BR')}`,
                            title: `Supervisor Notificado: ${reasonMap[supervisorReason] || supervisorReason}`,
                            description: `Notificado ${activeCall.supervisorName || 'Supervisor de Plantão'}. Mensagem: "${supervisorNote || 'Solicitação de suporte imediato em campo'}". Chamado: ${activeCall.callNumber}.`,
                            callNumber: activeCall.callNumber,
                            equipmentTag: activeCall.equipmentTag,
                            technicianName: currentUser.name,
                            metadata: {
                              supervisorName: activeCall.supervisorName,
                              reason: supervisorReason,
                              note: supervisorNote
                            }
                          });

                          addToast({
                            type: 'success',
                            title: 'Supervisor Notificado!',
                            message: `Mensagem enviada com sucesso ao supervisor ${activeCall.supervisorName || 'de plantão'}. Protocolo de despacho gravado no histórico.`
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5 text-zinc-950" />
                        <span>Enviar Notificação Imediata</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

