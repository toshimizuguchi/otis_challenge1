import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, UserRole } from '../../types';
import { 
  Users, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Calendar, 
  Briefcase, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  FileText, 
  Download, 
  Sparkles, 
  Plus, 
  Info,
  Check,
  Building2,
  MapPin,
  AlertCircle,
  Wrench,
  Send,
  MessageSquare,
  Bell,
  Eye,
  X
} from 'lucide-react';
import { TimeClockModal } from '../modals/TimeClockModal';

interface SupervisorActionState {
  isOpen: boolean;
  employee: Employee | null;
  type: 'BONUS' | 'HORA_EXTRA';
  action: 'APPROVE' | 'REJECT' | 'REJECT_AND_NOTIFY';
  notes: string;
  supervisorMessage: string;
  notifySupervisorChecked: boolean;
}

export const EmployeesModule: React.FC = () => {
  const { 
    currentUser, 
    employees, 
    timePunches, 
    approveBonus, 
    approveOvertime,
    notifySupervisor,
    addToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [bonusFilter, setBonusFilter] = useState<string>('ALL');
  const [overtimeFilter, setOvertimeFilter] = useState<string>('ALL');
  
  // Selected employee for the complete details modal
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState<Employee | null>(null);
  
  // Time clock modal
  const [isTimeClockOpen, setIsTimeClockOpen] = useState(false);

  // Modal for approval / rejection / supervisor notification
  const [actionModal, setActionModal] = useState<SupervisorActionState>({
    isOpen: false,
    employee: null,
    type: 'BONUS',
    action: 'APPROVE',
    notes: '',
    supervisorMessage: '',
    notifySupervisorChecked: true
  });

  // Calculate aggregates
  const totalEmployees = employees.length;
  const totalBaseSalary = employees.reduce((acc, e) => acc + (e.baseSalary || 0), 0);
  const totalBonusApproved = employees
    .filter(e => e.bonusStatus === 'APROVADO')
    .reduce((acc, e) => acc + (e.bonusAmount || 0), 0);
  const totalBonusPending = employees
    .filter(e => e.bonusStatus === 'PENDENTE' && e.isBonusEligible)
    .reduce((acc, e) => acc + (e.bonusSuggested || e.bonusAmount || 0), 0);
  const totalOvertimeHours = employees.reduce((acc, e) => acc + (e.overtimeHours || 0), 0);
  const totalOvertimeAmount = employees.reduce((acc, e) => acc + (e.overtimeTotalAmount || 0), 0);
  const totalPayrollCost = totalBaseSalary + totalBonusApproved + totalOvertimeAmount;

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const specialtyText = emp.specialty || '';
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialtyText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.unit.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;

    let matchesBonus = true;
    if (bonusFilter === 'ELIGIBLE') matchesBonus = emp.isBonusEligible;
    if (bonusFilter === 'NOT_ELIGIBLE') matchesBonus = !emp.isBonusEligible;
    if (bonusFilter === 'PENDING') matchesBonus = emp.bonusStatus === 'PENDENTE';
    if (bonusFilter === 'APPROVED') matchesBonus = emp.bonusStatus === 'APROVADO';
    if (bonusFilter === 'REJECTED') matchesBonus = emp.bonusStatus === 'REPROVADO';

    let matchesOvertime = true;
    if (overtimeFilter === 'HAS_OVERTIME') matchesOvertime = (emp.overtimeHours || 0) > 0;
    if (overtimeFilter === 'PENDING') matchesOvertime = emp.overtimeStatus === 'PENDENTE';
    if (overtimeFilter === 'APPROVED') matchesOvertime = emp.overtimeStatus === 'APROVADO';
    if (overtimeFilter === 'REJECTED') matchesOvertime = emp.overtimeStatus === 'REPROVADO';

    return matchesSearch && matchesRole && matchesBonus && matchesOvertime;
  });

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Open modal for Bonus action
  const handleOpenBonusAction = (employee: Employee, actionType: 'APPROVE' | 'REJECT' | 'REJECT_AND_NOTIFY') => {
    const supName = employee.supervisorName || 'Supervisor Responsável';
    let defaultNotes = '';
    let defaultSupMessage = '';

    if (actionType === 'APPROVE') {
      defaultNotes = `Bônus homologado por ${currentUser.name} (${currentUser.role}). Meta de produtividade e assiduidade cumpridas.`;
    } else {
      defaultNotes = `Bônus não aprovado após auditoria de métricas de fechamento.`;
      defaultSupMessage = `Prezado(a) ${supName}, informamos que o bônus de ${employee.name} (${formatCurrency(employee.bonusSuggested || employee.bonusAmount)}) não foi aprovado pelo Financeiro devido a inconformidades no fechamento de metas/assiduidade. Favor revisar.`;
    }

    setActionModal({
      isOpen: true,
      employee,
      type: 'BONUS',
      action: actionType,
      notes: defaultNotes,
      supervisorMessage: defaultSupMessage,
      notifySupervisorChecked: actionType === 'REJECT_AND_NOTIFY' || actionType === 'REJECT'
    });
  };

  // Open modal for Overtime action
  const handleOpenOvertimeAction = (employee: Employee, actionType: 'APPROVE' | 'REJECT' | 'REJECT_AND_NOTIFY') => {
    const supName = employee.supervisorName || 'Supervisor Responsável';
    let defaultNotes = '';
    let defaultSupMessage = '';

    if (actionType === 'APPROVE') {
      defaultNotes = `Horas extras (${employee.overtimeHours}h - ${formatCurrency(employee.overtimeTotalAmount)}) homologadas para pagamento na folha.`;
    } else {
      defaultNotes = `Horas extras (${employee.overtimeHours}h) não aprovadas na auditoria de apontamento.`;
      defaultSupMessage = `Prezado(a) ${supName}, as horas extras de ${employee.name} (${employee.overtimeHours}h - ${formatCurrency(employee.overtimeTotalAmount)}) foram recusadas pelo setor Financeiro por falta de OS comprobatória ou divergência de apontamento. Solicitamos justificativa formal.`;
    }

    setActionModal({
      isOpen: true,
      employee,
      type: 'HORA_EXTRA',
      action: actionType,
      notes: defaultNotes,
      supervisorMessage: defaultSupMessage,
      notifySupervisorChecked: actionType === 'REJECT_AND_NOTIFY' || actionType === 'REJECT'
    });
  };

  // Confirm action in modal
  const handleConfirmActionModal = () => {
    if (!actionModal.employee) return;
    const emp = actionModal.employee;
    const isApprove = actionModal.action === 'APPROVE';
    const shouldNotify = !isApprove && actionModal.notifySupervisorChecked && !!actionModal.supervisorMessage.trim();

    if (actionModal.type === 'BONUS') {
      approveBonus(
        emp.id, 
        isApprove, 
        actionModal.notes, 
        shouldNotify, 
        shouldNotify ? actionModal.supervisorMessage : undefined
      );
    } else {
      approveOvertime(
        emp.id, 
        isApprove, 
        actionModal.notes, 
        shouldNotify, 
        shouldNotify ? actionModal.supervisorMessage : undefined
      );
    }

    setActionModal(prev => ({ ...prev, isOpen: false, employee: null }));
  };

  // Quick direct approve bonus
  const handleQuickApproveBonus = (emp: Employee) => {
    approveBonus(emp.id, true, `Bônus homologado por ${currentUser.name} (${currentUser.role}).`);
  };

  // Quick direct approve overtime
  const handleQuickApproveOvertime = (emp: Employee) => {
    approveOvertime(emp.id, true, `Horas extras homologadas por ${currentUser.name} (${currentUser.role}).`);
  };

  // Batch approve all eligible bonus
  const handleApproveAllEligibleBonus = () => {
    const eligiblePending = employees.filter(e => e.isBonusEligible && e.bonusStatus === 'PENDENTE');
    if (eligiblePending.length === 0) {
      addToast({
        type: 'info',
        title: 'Sem Bônus Pendentes',
        message: 'Todos os colaboradores elegíveis já foram aprovados ou processados.'
      });
      return;
    }

    eligiblePending.forEach(emp => {
      approveBonus(emp.id, true, `Aprovação em lote homologada por ${currentUser.name} (${currentUser.role}).`);
    });

    addToast({
      type: 'success',
      title: 'Aprovação em Lote Concluída',
      message: `${eligiblePending.length} bônus foram aprovados com sucesso.`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Controladoria & Folha Financeira
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Folha, Bônus & Horas Extras Auditadas
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Quadro de Funcionários & Fechamento de Folha
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Visualização simplificada para o Financeiro: Nome, Especialidade, Salário Base, Bônus e Horas Extras. Detalhes completos via espelho.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsTimeClockOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Bater Ponto Eletrônico</span>
          </button>

          {(currentUser.role === 'FINANCEIRO' || currentUser.role === 'PRESIDENTE' || currentUser.role === 'GERENTE' || currentUser.role === 'ADMINISTRADOR') && (
            <button
              onClick={handleApproveAllEligibleBonus}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Aprova todos os bônus que cumpriram 100% dos requisitos"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Aprovar Todos Elegíveis</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Colaboradores</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {totalEmployees}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Equipe Ativa em Folha
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Salário Base Total</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {formatCurrency(totalBaseSalary)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Folha Fixa Mensal
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-medium">Bônus Aprovados</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-300 tracking-tight font-mono">
            {formatCurrency(totalBonusApproved)}
          </div>
          <p className="text-[11px] text-amber-300 mt-1">
            {formatCurrency(totalBonusPending)} pendente de homologação
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-xs font-medium">Horas Extras</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {totalOvertimeHours.toFixed(1)}h
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {formatCurrency(totalOvertimeAmount)} acumulados
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 shadow-sm col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-300 mb-1">
            <span className="text-xs font-medium">Custo Total da Folha</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {formatCurrency(totalPayrollCost)}
          </div>
          <p className="text-[11px] text-emerald-200/70 mt-1">
            Salário + Bônus + H.E.
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, especialidade, polo ou cidade..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Cargo filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todos os Cargos</option>
              <option value="TECNICO">Técnicos de Campo</option>
              <option value="ATENDENTE">Atendentes 24/7</option>
              <option value="SUPERVISOR">Supervisores</option>
              <option value="GERENTE">Gerentes</option>
              <option value="FINANCEIRO">Financeiro & Controladoria</option>
            </select>

            {/* Bonus filter */}
            <select
              value={bonusFilter}
              onChange={(e) => setBonusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Filtro de Bônus</option>
              <option value="PENDING">⏳ Bônus Pendentes</option>
              <option value="APPROVED">✅ Bônus Aprovados</option>
              <option value="REJECTED">❌ Bônus Reprovados</option>
              <option value="ELIGIBLE">🟢 Elegíveis pela IA</option>
              <option value="NOT_ELIGIBLE">🔴 Não Elegíveis</option>
            </select>

            {/* Overtime filter */}
            <select
              value={overtimeFilter}
              onChange={(e) => setOvertimeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Filtro de Horas Extras</option>
              <option value="HAS_OVERTIME">⚡ Com Horas Extras</option>
              <option value="PENDING">⏳ H.E. Pendentes</option>
              <option value="APPROVED">✅ H.E. Aprovadas</option>
              <option value="REJECTED">❌ H.E. Não Aprovadas</option>
            </select>

          </div>
        </div>
      </div>

      {/* Clean Employee List for Financial view: Nome, Especialidade, Salário, Bônus, Hora Extra */}
      <div className="space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Nenhum funcionário encontrado com os filtros selecionados.</p>
            <p className="text-xs text-slate-500 mt-1">Tente ajustar a busca ou os seletores de filtro.</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const overtimeStatus = emp.overtimeStatus || 'PENDENTE';
            const bonusStatus = emp.bonusStatus || 'PENDENTE';
            const specialty = emp.specialty || emp.roleTitle;

            return (
              <div 
                key={emp.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4"
              >
                {/* 1. Nome & Avatar & Status */}
                <div className="flex items-center gap-3.5 min-w-[260px] max-w-[320px]">
                  {emp.avatar ? (
                    <img 
                      src={emp.avatar} 
                      alt={emp.name} 
                      className="w-12 h-12 rounded-2xl border border-slate-700 object-cover shrink-0 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                      {emp.name.substring(0, 2)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight truncate" title={emp.name}>
                        {emp.name}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                        emp.currentPunchStatus === 'EM_JORNADA'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : emp.currentPunchStatus === 'EM_INTERVALO'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {emp.currentPunchStatus === 'EM_JORNADA' ? '🟢 Jornada' : emp.currentPunchStatus === 'EM_INTERVALO' ? '☕ Intervalo' : '⚪ Fora'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {emp.roleTitle} • <span className="text-slate-500">{emp.unit}</span>
                    </p>
                  </div>
                </div>

                {/* 2. Especialidade */}
                <div className="min-w-[200px] max-w-[280px]">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Especialidade</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2" title={specialty}>
                    {specialty}
                  </p>
                  {emp.supervisorName && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Supervisor: <span className="text-cyan-300 font-medium">{emp.supervisorName}</span>
                    </p>
                  )}
                </div>

                {/* 3. Salário Base */}
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left sm:text-right shrink-0 min-w-[130px]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Salário Base</span>
                  <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                    {formatCurrency(emp.baseSalary)}
                  </span>
                </div>

                {/* 4. Bônus com Aprovação / Não Aprovação & Notificação */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1.5 shrink-0 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bônus</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      bonusStatus === 'APROVADO'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : bonusStatus === 'REPROVADO'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {bonusStatus === 'APROVADO' ? '✓ Aprovado' : bonusStatus === 'REPROVADO' ? '✕ Não Aprovado' : '⏳ Pendente'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-emerald-300 font-mono">
                      {formatCurrency(emp.bonusSuggested || emp.bonusAmount || 0)}
                    </span>

                    {/* Botões de Ação para Bônus */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickApproveBonus(emp)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          bonusStatus === 'APROVADO'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                        }`}
                        title="Aprovar Bônus"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenBonusAction(emp, 'REJECT')}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          bonusStatus === 'REPROVADO'
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30'
                        }`}
                        title="Não Aprovar Bônus"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenBonusAction(emp, 'REJECT_AND_NOTIFY')}
                        className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Não Aprovar e Notificar Supervisor"
                      >
                        <Send className="w-3 h-3" />
                        <span className="hidden sm:inline">Notificar</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Hora Extra com Aprovação / Não Aprovação & Notificação */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1.5 shrink-0 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hora Extra</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      overtimeStatus === 'APROVADO'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : overtimeStatus === 'REPROVADO'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {overtimeStatus === 'APROVADO' ? '✓ Aprovada' : overtimeStatus === 'REPROVADO' ? '✕ Não Aprovada' : '⏳ Pendente'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-left">
                      <span className="text-sm font-bold text-purple-300 font-mono">
                        {emp.overtimeHours.toFixed(1)}h
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1 font-mono">
                        ({formatCurrency(emp.overtimeTotalAmount)})
                      </span>
                    </div>

                    {/* Botões de Ação para Hora Extra */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickApproveOvertime(emp)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          overtimeStatus === 'APROVADO'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                        }`}
                        title="Aprovar Horas Extras"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenOvertimeAction(emp, 'REJECT')}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          overtimeStatus === 'REPROVADO'
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30'
                        }`}
                        title="Não Aprovar Horas Extras"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenOvertimeAction(emp, 'REJECT_AND_NOTIFY')}
                        className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Não Aprovar e Notificar Supervisor"
                      >
                        <Send className="w-3 h-3" />
                        <span className="hidden sm:inline">Notificar</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6. Botão "Mais Detalhes" */}
                <div className="shrink-0 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedEmployeeForDetails(emp)}
                    className="px-3.5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer group"
                    title="Ver espelho completo com tarefas, urgências, faltas, atrasos e histórico de ponto"
                  >
                    <Eye className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>Mais Detalhes</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Detailed Modal: "Mais Detalhes" (Tarefas, Urgências, Faltas, Atrasos, Ponto, Elegibilidade) */}
      {selectedEmployeeForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                {selectedEmployeeForDetails.avatar ? (
                  <img 
                    src={selectedEmployeeForDetails.avatar} 
                    alt={selectedEmployeeForDetails.name} 
                    className="w-12 h-12 rounded-2xl border border-slate-700 object-cover shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center text-sm">
                    {selectedEmployeeForDetails.name.substring(0, 2)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {selectedEmployeeForDetails.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedEmployeeForDetails.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedEmployeeForDetails.specialty || selectedEmployeeForDetails.roleTitle} • <span className="text-slate-300">{selectedEmployeeForDetails.unit} ({selectedEmployeeForDetails.city})</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployeeForDetails(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              
              {/* Resumo Financeiro no Topo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Salário Base</span>
                  <strong className="text-sm sm:text-base text-white font-mono">{formatCurrency(selectedEmployeeForDetails.baseSalary)}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bônus Mensal</span>
                  <strong className="text-sm sm:text-base text-emerald-300 font-mono">
                    {formatCurrency(selectedEmployeeForDetails.bonusAmount || selectedEmployeeForDetails.bonusSuggested || 0)}
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                    Status: {selectedEmployeeForDetails.bonusStatus}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Horas Extras</span>
                  <strong className="text-sm sm:text-base text-purple-300 font-mono">
                    {selectedEmployeeForDetails.overtimeHours.toFixed(1)}h
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                    {formatCurrency(selectedEmployeeForDetails.overtimeTotalAmount)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pontualidade</span>
                  <strong className="text-sm sm:text-base text-cyan-300 font-mono">{selectedEmployeeForDetails.punctualityRate}%</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {selectedEmployeeForDetails.lateArrivalsCount === 0 ? '0 atrasos' : `${selectedEmployeeForDetails.lateArrivalsCount} atraso(s)`}
                  </span>
                </div>
              </div>

              {/* Seção 1: Produtividade & Chamados de Urgência */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Desempenho de Tarefas */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Tarefas & Metas de Manutenção
                    </span>
                    <span className="font-mono font-bold text-cyan-400">
                      {Math.round((selectedEmployeeForDetails.tasksCompleted / (selectedEmployeeForDetails.tasksTarget || 30)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-cyan-500"
                      style={{ width: `${Math.min(100, Math.round((selectedEmployeeForDetails.tasksCompleted / (selectedEmployeeForDetails.tasksTarget || 30)) * 100))}%` }}
                    />
                  </div>
                  <p className="text-slate-300">
                    Concluiu <strong className="text-white font-mono">{selectedEmployeeForDetails.tasksCompleted}</strong> de <strong className="text-white font-mono">{selectedEmployeeForDetails.tasksTarget}</strong> tarefas preventivas e corretivas atribuídas.
                  </p>
                </div>

                {/* Chamados de Urgência & SLAs */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Chamados de Urgência & SLA
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedEmployeeForDetails.slaComplianceRate}% SLA
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {selectedEmployeeForDetails.urgentCallsHandled} urgências atendidas no período
                  </div>
                  <p className="text-slate-300">
                    <strong className="text-emerald-400 font-mono">{selectedEmployeeForDetails.urgentCallsSlaMet}</strong> atendimentos realizados dentro da janela máxima de SLA contratual.
                  </p>
                </div>

              </div>

              {/* Seção 2: Assiduidade, Faltas e Atrasos em Minutos */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Assiduidade, Faltas & Atrasos na Escala
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedEmployeeForDetails.absencesCount === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {selectedEmployeeForDetails.absencesCount === 0 ? '0 faltas' : `${selectedEmployeeForDetails.absencesCount} falta(s)`}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedEmployeeForDetails.lateArrivalsCount === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {selectedEmployeeForDetails.lateTotalMinutes === 0 ? '0 min de atraso' : `${selectedEmployeeForDetails.lateTotalMinutes} min acumulados`}
                    </span>
                  </div>
                </div>

                {selectedEmployeeForDetails.absenceDetails && selectedEmployeeForDetails.absenceDetails.length > 0 ? (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-200 space-y-1">
                    <p className="font-semibold text-[11px] text-rose-300">Detalhamento das Ausências:</p>
                    {selectedEmployeeForDetails.absenceDetails.map((abs, idx) => (
                      <p key={idx} className="text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{abs}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    Nenhuma ausência não justificada registrada nos últimos 30 dias.
                  </p>
                )}
              </div>

              {/* Seção 3: Auditoria de Elegibilidade ao Bônus & Parecer */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Critérios de Capacitação / Elegibilidade ao Bônus
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedEmployeeForDetails.isBonusEligible
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {selectedEmployeeForDetails.isBonusEligible ? '🟢 Capacitado pela IA' : '🔴 Não Elegível'}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {selectedEmployeeForDetails.bonusEligibilityReason}
                </p>

                {selectedEmployeeForDetails.bonusNotes && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Parecer Registrado pelo Financeiro:</span>
                    <p className="italic">{selectedEmployeeForDetails.bonusNotes}</p>
                    {selectedEmployeeForDetails.bonusApprovedBy && (
                      <p className="text-[10px] text-slate-400 mt-1">Homologado por: {selectedEmployeeForDetails.bonusApprovedBy}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Seção 4: Espelho de Batidas de Ponto Eletrônico */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Registros de Batidas de Ponto do Colaborador
                </h4>

                {selectedEmployeeForDetails.recentPunches && selectedEmployeeForDetails.recentPunches.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEmployeeForDetails.recentPunches.map((punch) => (
                      <div 
                        key={punch.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="text-white font-mono text-xs">{punch.formattedTime}</strong>
                            <span className="text-slate-400">({punch.formattedDate})</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {punch.type.replace('_', ' ')}
                            </span>
                            {punch.isLate && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Atraso: {punch.lateMinutes} min
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" /> {punch.location}
                          </p>
                        </div>

                        {punch.notes && (
                          <span className="text-[11px] text-slate-400 italic max-w-[200px] text-right truncate">
                            {punch.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-800">
                    Nenhuma batida de ponto adicional registrada no período.
                  </p>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Supervisor: <strong className="text-cyan-300">{selectedEmployeeForDetails.supervisorName || 'Roberto Viana'}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenBonusAction(selectedEmployeeForDetails, 'REJECT_AND_NOTIFY');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Notificar Supervisor</span>
                </button>

                <button
                  onClick={() => setSelectedEmployeeForDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal for Approval / Rejection and Notifying Supervisor */}
      {actionModal.isOpen && actionModal.employee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                actionModal.action === 'APPROVE' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {actionModal.action === 'APPROVE' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {actionModal.action === 'APPROVE' 
                    ? `Aprovar ${actionModal.type === 'BONUS' ? 'Bônus' : 'Horas Extras'}`
                    : `Não Aprovar & Notificar Supervisor`
                  }
                </h3>
                <p className="text-xs text-slate-400">
                  Colaborador: <strong className="text-slate-200">{actionModal.employee.name}</strong> • {actionModal.type === 'BONUS' ? formatCurrency(actionModal.employee.bonusSuggested || actionModal.employee.bonusAmount) : `${actionModal.employee.overtimeHours}h (${formatCurrency(actionModal.employee.overtimeTotalAmount)})`}
                </p>
              </div>
            </div>

            {/* Parecer do Financeiro */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Parecer / Observação da Controladoria Financeira:
              </label>
              <textarea
                value={actionModal.notes}
                onChange={(e) => setActionModal(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="Insira a justificativa financeira..."
              />
            </div>

            {/* Seção de Notificação ao Supervisor */}
            {actionModal.action !== 'APPROVE' && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={actionModal.notifySupervisorChecked}
                      onChange={(e) => setActionModal(prev => ({ ...prev, notifySupervisorChecked: e.target.checked }))}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Send className="w-3.5 h-3.5" />
                      Notificar Supervisor Imediatamente
                    </span>
                  </label>

                  <span className="text-[11px] text-slate-400">
                    Destinatário: <strong className="text-cyan-300">{actionModal.employee.supervisorName || 'Roberto Viana'}</strong>
                  </span>
                </div>

                {actionModal.notifySupervisorChecked && (
                  <div>
                    <span className="text-[11px] text-amber-200 block mb-1">
                      Mensagem oficial a ser enviada ao supervisor:
                    </span>
                    <textarea
                      value={actionModal.supervisorMessage}
                      onChange={(e) => setActionModal(prev => ({ ...prev, supervisorMessage: e.target.value }))}
                      rows={3}
                      className="w-full p-2.5 bg-slate-950 border border-amber-700/60 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="Descreva a contestação ou motivo para alinhamento com o supervisor..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Botões do Modal */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(prev => ({ ...prev, isOpen: false, employee: null }))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmActionModal}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                  actionModal.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
                }`}
              >
                {actionModal.action === 'APPROVE' 
                  ? 'Confirmar Aprovação' 
                  : actionModal.notifySupervisorChecked 
                  ? 'Não Aprovar & Notificar' 
                  : 'Confirmar Não Aprovação'
                }
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Time Clock Modal */}
      <TimeClockModal 
        isOpen={isTimeClockOpen} 
        onClose={() => setIsTimeClockOpen(false)} 
      />

    </div>
  );
};
