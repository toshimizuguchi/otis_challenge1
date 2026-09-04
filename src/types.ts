export type UserRole = 
  | 'PRESIDENTE' 
  | 'GERENTE' 
  | 'SUPERVISOR' 
  | 'TECNICO' 
  | 'ATENDENTE' 
  | 'FINANCEIRO' 
  | 'ADMINISTRADOR';

export type AppTheme = 'nordic' | 'corporate' | 'forest' | 'default';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  region?: string;
  city?: string;
  unit?: string;
}

export type CallPriority = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
export type CallStatus = 'CRIADO' | 'CONTACTADO' | 'ACEITO' | 'A_CAMINHO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO';
export type CallOrigin = 'SISTEMA' | 'TELEFONE' | 'WHATSAPP' | 'PORTAL' | 'IOT_TELEMETRIA';
export type EquipmentType = 'ELEVADOR_PASSAGEIROS' | 'ELEVADOR_CARGA' | 'ESCADA_ROLANTE' | 'ESTEIRA_ROLANTE' | 'ELEVADOR_PANORAMICO';

export interface Equipment {
  id: string;
  tag: string;
  name: string;
  model: string;
  manufacturer: string;
  type: EquipmentType;
  customerId: string;
  customerName: string;
  buildingName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  contractId: string;
  installationYear: number;
  status: 'OPERACIONAL' | 'EM_RISCO' | 'PARADO' | 'MANUTENCAO';
  machineType: string;
  driveType: string;
  hasRegenerativeDrive: boolean;
  controlType: string;
  cyclesCount: number;
  predictiveRiskScore: number; // 0 - 100
  riskLevel: 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRITICO';
  riskExplanation?: string;
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  doorCycles: number;
  totalCallsHistoryCount: number;
  totalDowntimeHours: number;
  historicalFailures: {
    date: string;
    type: string;
    component: string;
    description: string;
    technicianName: string;
  }[];
  lat?: number;
  lng?: number;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'DISPONIVEL' | 'A_CAMINHO' | 'EM_ATENDIMENTO' | 'ATRASADO' | 'OFFLINE';
  supervisorId: string;
  supervisorName: string;
  city: string;
  state: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  specialties: string[]; // e.g. ['Sistema de Portas', 'Drives Regenerativos', 'Quadro de Comando', 'Hidráulica']
  completedCallsMonth: number;
  avgArrivalTimeMin: number; // TA
  avgSolutionTimeMin: number; // TB
  slaComplianceRate: number; // e.g. 98.4%
  currentCallId?: string;
  activeCallElapsedMinutes?: number;
  expectedCallDurationMinutes?: number;
  overdueAlert?: boolean;
  assignedVehicle: string;
  trainingNeeds?: string[];
}

export interface Supervisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  state: string;
  managerId: string;
  techniciansCount: number;
  activeCallsCount: number;
  slaRate: number;
  avgSolutionTimeMin: number;
  backlogCount: number;
  criticalEquipmentsCount: number;
  monthlyCost: number;
  contractsMarginRate: number; // e.g. 24.5%
  recentTrendAlert?: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  region: string;
  country: string;
  supervisorsCount: number;
  techniciansTotal: number;
  equipmentsTotal: number;
  monthlyRevenue: number;
  monthlyCost: number;
  marginRate: number;
  globalSLA: number;
  npsScore?: number;
  targetAchievement?: number; // e.g. 104.2%
  preventiveCompliance?: number; // e.g. 98.5%
  avgResolutionHours?: number; // e.g. 1.8h
  retentionRate?: number; // e.g. 99.1%
  status?: 'EXCELENTE' | 'NO_ALVO' | 'ATENCAO';
  topStrengths?: string[];
  riskPoints?: string[];
  aiExecutiveSummary?: string;
  lastDirectiveDate?: string;
}

export interface CallTimelineEvent {
  step: string;
  timestamp: string;
  description: string;
  author: string;
}

export interface Call {
  id: string;
  callNumber: string;
  createdAt: string;
  origin: CallOrigin;
  priority: CallPriority;
  status: CallStatus;
  
  // Customer & Unit
  customerId: string;
  customerName: string;
  isVipCustomer?: boolean;
  isCorporateCustomer?: boolean;
  isCorporate?: boolean;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  buildingName: string;
  lat?: number;
  lng?: number;
  
  // Equipment
  equipmentId: string;
  equipmentTag: string;
  equipmentModel: string;
  equipmentType: EquipmentType;
  
  // Problem classification
  problemDescription: string;
  mainComponent: string; // e.g. 'Sistema de Portas', 'Máquina de Tração', 'Quadro Elétrico'
  subComponent: string; // e.g. 'Operador de Porta', 'Fita Seletora', 'Inversor VVVF'
  defectType: string;
  hasTrappedPassenger: boolean;
  isCarStopped: boolean;
  
  // Classification & Context
  severityLevel?: number; // 0 to 5
  equipmentBrand?: string; // Otis, Schindler, TK Elevator, KONE, etc.
  buildingType?: string; // PREDIO_RESIDENCIAL, PREDIO_COMERCIAL, HOSPITAL, SHOPPING, AEROPORTO, INDUSTRIA, etc.
  
  // Staff
  supervisorId: string;
  supervisorName: string;
  technicianId?: string;
  technicianName?: string;
  assignedTechnicians?: {
    id: string;
    name: string;
    phone: string;
    role: 'LEAD' | 'SUPPORT';
    specialties: string[];
    distanceKm?: number;
    etaMinutes?: number;
    matchScore?: number;
  }[];
  
  // Notification Actions
  notificationMethod?: {
    appPush: boolean;
    phoneCall: boolean;
    urgentAlertEmail: boolean;
    sentTimestamp?: string;
    emailRecipients?: string[];
  };
  
  // Contract
  contractId: string;
  contractNumber: string;
  slaMaxHours: number;
  
  // Timestamps & Metrics
  contactedAt?: string;
  acceptedAt?: string;
  arrivedAtBuildingAt?: string;
  solutionFinishedAt?: string;
  arrivalTimeMinutes?: number; // TA
  solutionTimeMinutes?: number; // TB
  
  // Parts & Work done
  usedParts?: {
    partId: string;
    partName: string;
    quantity: number;
    unitCost: number;
  }[];
  technicianNotes?: string;
  solutionDiagnostic?: string;
  
  // AI Suggestions and Copilot Log
  aiRecommendation?: {
    suggestedPriority: CallPriority;
    suggestedTechnicianId: string;
    suggestedTechnicianName: string;
    matchReason: string;
    estimatedTimeMin: number;
    recommendedParts: string[];
    recommendedTools: string[];
    confidence: number;
    historicalPatternFound?: string;
  };
  supervisorOverride?: {
    overridden: boolean;
    originalRecommendation: string;
    chosenTechnicianName: string;
    reason: string;
    timestamp: string;
  };
  
  timeline: CallTimelineEvent[];
}

export interface Customer {
  id: string;
  name: string;
  documentNumber?: string; // CNPJ / CPF
  buildingName?: string;
  groupName?: string;
  isVip: boolean;
  isCorporate: boolean;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  activeContractsCount: number;
  equipmentsCount: number;
  satisfactionScore: number; // 0 - 100
}

export interface Contract {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  slaRequiredRate: number; // e.g. 98.0
  type: 'PREMIUM_ALL_INCLUSIVE' | 'STANDARD_COM_PECAS' | 'ESSENCIAL';
  equipmentsCount: number;
  status: 'ATIVO' | 'EM_RISCO' | 'RENOVACAO_PENDENTE';
  
  // Financial breakdown
  monthlyRevenue: number;
  monthlyPartsCost: number;
  monthlyTechLaborCost: number;
  monthlyTravelCost: number;
  monthlyOtherCost: number;
  currentMarginRate: number; // e.g. 21.4%
  baselineMarginRate: number; // e.g. 28.0%
  marginDropAlert?: string;
  aiFinancialDiagnosis?: string;
}

export interface Part {
  id: string;
  code: string;
  name: string;
  category: string;
  compatibleModels: string[];
  unitCost: number;
  stockQuantity: number;
  expectedLifeSpanMonths: number;
  observedAverageLifeSpanMonths: number;
  totalReplacedLast12Months: number;
  abnormalConsumptionAlert?: boolean;
  abnormalAlertMessage?: string;
}

export interface MaintenancePlan {
  id: string;
  equipmentId: string;
  equipmentTag: string;
  equipmentModel: string;
  buildingName: string;
  city: string;
  type: 'PREVENTIVA' | 'PREDITIVA' | 'CORRETIVA';
  scheduledDate: string;
  status: 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ATRASADA';
  tasks: string[];
  recommendedParts: string[];
  assignedTechnicianName: string;
  monthCycle: string; // e.g. 'Mês 1 - Inspeção de Cabos'
}

export interface MaintenanceCampaign {
  id: string;
  title: string;
  componentTarget: string;
  modelTarget: string;
  riskDescription: string;
  totalTargetEquipments: number;
  highRiskEquipmentsCount: number;
  inspectedEquipmentsCount: number;
  targetRegions: string[];
  estimatedCost: number;
  startDate: string;
  status: 'EM_ANDAMENTO' | 'PLANEJADA' | 'CONCLUIDA';
  aiRootCauseHypothesis: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: string;
  targetModel: string;
  durationHours: number;
  modulesCount: number;
  enrolledTechnicians: string[];
  recommendedForTechnicians: {
    technicianId: string;
    technicianName: string;
    reason: string; // e.g. 'Tempo médio de resolução 40% acima no modelo Gen2 Comfort'
  }[];
}

export interface SystemAlert {
  id: string;
  category: 'CRITICO' | 'OPERACIONAL' | 'PREDITIVO' | 'FINANCEIRO' | 'SEGURANCA' | 'PECA' | 'TREINAMENTO';
  severity: 'CRITICA' | 'ALTA' | 'MEDIA' | 'INFORMATIVA';
  title: string;
  timestamp: string;
  problem: string;
  evidence: string;
  recommendation: string;
  targetEntityId?: string;
  targetEntityType?: 'EQUIPMENT' | 'CALL' | 'TECHNICIAN' | 'CONTRACT' | 'SUPERVISOR';
  actionLabel?: string;
  actionType?: 'REASSIGN' | 'CALL_TECH' | 'VIEW_EQUIPMENT' | 'ANALYZE_CONTRACT' | 'CREATE_CAMPAIGN';
  read: boolean;
}

export interface AIInsight {
  id: string;
  category: 'OPERACIONAL' | 'PREDITIVO' | 'ESTRATEGICO';
  title: string;
  scope: string; // e.g. 'Campinas & São Paulo', 'Contratos Corporativos', 'Gen2 Comfort'
  summary: string;
  evidence: string[];
  recommendedAction: string;
  estimatedImpact: string;
  confidenceScore: number;
  date: string;
}

export interface PartRequest {
  id: string;
  requestNumber: string;
  partId: string;
  partCode: string;
  partName: string;
  category: string;
  unitCost: number;
  quantity: number;
  callId?: string;
  callNumber?: string;
  equipmentTag?: string;
  customerName?: string;
  urgency: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA' | 'NORMAL';
  deliveryType: 'LOCAL_CHAMADO' | 'RETIRADA_POLO' | 'PROXIMO_TURNO' | 'ESTOQUE_MOVEL';
  technicianId: string;
  technicianName: string;
  justification: string;
  status: 'PENDENTE' | 'APROVADO' | 'EM_SEPARACAO' | 'A_CAMINHO' | 'ENTREGUE';
  createdAt: string;
  estimatedDelivery?: string;
}

export interface TimePunchRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: UserRole;
  type: 'ENTRADA' | 'ALMOCO_SAIDA' | 'ALMOCO_RETORNO' | 'SAIDA' | 'HORA_EXTRA';
  timestamp: string; // ISO string
  formattedTime: string; // e.g. '08:05'
  formattedDate: string; // e.g. '01/09/2026'
  location: string;
  isLate: boolean;
  lateMinutes?: number;
  notes?: string;
  method?: 'DIGITAL' | 'GEO_LOCALIZACAO' | 'SISTEMA';
}

export interface Employee {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleTitle: string;
  specialty?: string; // e.g. "Manutenção Preventiva & Elevadores Gen2"
  supervisorId?: string;
  supervisorName?: string;
  avatar?: string;
  region: string;
  city: string;
  unit: string;
  admissionDate: string;
  status: 'ATIVO' | 'FERIAS' | 'AFASTADO';
  
  // Finance & Compensation
  baseSalary: number; // e.g. 3800.00
  bonusSuggested: number; // e.g. 850.00
  bonusAmount: number; // e.g. 850.00
  bonusStatus: 'APROVADO' | 'PENDENTE' | 'REPROVADO';
  bonusApprovedBy?: string;
  bonusApprovedAt?: string;
  bonusNotes?: string;
  isBonusEligible: boolean;
  bonusEligibilityReason: string;
  
  // Performance & Productivity
  tasksCompleted: number; // e.g. 24
  tasksTarget: number; // e.g. 30
  urgentCallsHandled: number; // e.g. 6 chamados de urgência
  urgentCallsSlaMet: number; // e.g. 6 (100% de cumprimento de SLA em urgências)
  slaComplianceRate: number; // e.g. 98.2%
  performanceScore: number; // 0 - 100
  
  // Time Clock & Attendance
  overtimeHours: number; // e.g. 14.5
  overtimeRate: number; // valor por hora extra e.g. 35.00
  overtimeTotalAmount: number; // e.g. 507.50
  overtimeStatus?: 'APROVADO' | 'PENDENTE' | 'REPROVADO';
  overtimeApprovedBy?: string;
  overtimeApprovedAt?: string;
  overtimeNotes?: string;
  absencesCount: number; // e.g. 0
  absenceDetails?: string[];
  lateArrivalsCount: number; // e.g. 1
  lateTotalMinutes: number; // e.g. 15
  punctualityRate: number; // e.g. 96.8%
  currentPunchStatus?: 'FORA_TURNO' | 'EM_JORNADA' | 'EM_INTERVALO';
  lastPunchTime?: string;
  recentPunches: TimePunchRecord[];
}

export interface TechActivityLog {
  id: string;
  type: 'PECA_PEDIDA' | 'PECA_TROCADA' | 'SUPERVISOR_NOTIFICADO' | 'OS_CONCLUIDA' | 'PREVENTIVA_FEITA' | 'CHECKLIST_PROBLEMA' | 'CHECKLIST_OK' | 'CHECK_IN' | 'PAUSA_SEGURA';
  timestamp: string;
  date: string;
  title: string;
  description: string;
  callNumber?: string;
  equipmentTag?: string;
  buildingName?: string;
  technicianName: string;
  metadata?: {
    partName?: string;
    partQuantity?: number;
    partCost?: number;
    supervisorName?: string;
    supervisorReason?: string;
    reason?: string;
    note?: string;
    customer?: string;
    building?: string;
    itemText?: string;
    problemType?: string;
    problemNotes?: string;
    status?: string;
    solutionDuration?: string;
    statusResult?: string;
  };
}

