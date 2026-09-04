import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Equipment, 
  Technician, 
  Supervisor, 
  Manager, 
  Call, 
  CallPriority,
  Customer, 
  Contract, 
  Part, 
  PartRequest,
  TechActivityLog,
  MaintenancePlan, 
  MaintenanceCampaign, 
  TrainingCourse, 
  SystemAlert, 
  AIInsight,
  Employee,
  TimePunchRecord,
  AppTheme
} from '../types';
import { 
  DEMO_USERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_EQUIPMENTS, 
  INITIAL_TECHNICIANS, 
  INITIAL_SUPERVISORS, 
  INITIAL_MANAGERS, 
  INITIAL_CALLS, 
  INITIAL_CONTRACTS, 
  INITIAL_PARTS, 
  INITIAL_PART_REQUESTS,
  INITIAL_TECH_LOGS,
  INITIAL_MAINTENANCE_PLANS, 
  INITIAL_CAMPAIGNS, 
  INITIAL_TRAINING_COURSES, 
  INITIAL_ALERTS, 
  INITIAL_AI_INSIGHTS,
  INITIAL_EMPLOYEES,
  INITIAL_TIME_PUNCHES
} from '../data/mockData';
import { analyzeCallWithAI } from '../services/geminiService';
import { 
  calculateDistanceKm, 
  getRealtimeTrafficCondition, 
  checkTechnicianEquipmentFamiliarity, 
  checkPreventiveMismatch 
} from '../utils/geoUtils';

export type ActiveView = 
  | 'dashboard'
  | 'regional'
  | 'calls'
  | 'history'
  | 'equipments'
  | 'technicians'
  | 'supervisors'
  | 'managers'
  | 'employees'
  | 'maintenance'
  | 'predictive'
  | 'parts'
  | 'contracts'
  | 'financial'
  | 'training'
  | 'maps'
  | 'intelligence'
  | 'alerts'
  | 'reports'
  | 'import'
  | 'future_iot'
  | 'settings';

export const ROLE_ALLOWED_VIEWS: Record<UserRole, ActiveView[]> = {
  PRESIDENTE: [
    'dashboard', 'regional', 'managers', 'maps',
    'history', 'supervisors', 'employees',
    'intelligence', 'maintenance', 'parts',
    'contracts', 'financial', 'training', 'reports',
    'future_iot', 'import'
  ],
  ADMINISTRADOR: [
    'dashboard', 'regional', 'maps', 'alerts',
    'calls', 'history', 'technicians', 'supervisors', 'managers', 'employees',
    'intelligence', 'equipments', 'maintenance', 'parts',
    'contracts', 'financial', 'training', 'reports',
    'future_iot', 'import', 'settings'
  ],
  GERENTE: [
    'dashboard', 'maps', 'alerts',
    'supervisors', 'technicians', 'managers', 'employees',
    'intelligence', 'equipments', 'maintenance', 'parts',
    'contracts', 'financial', 'training', 'reports',
    'future_iot'
  ],
  SUPERVISOR: [
    'dashboard', 'maps', 'alerts',
    'calls', 'history', 'technicians',
    'intelligence', 'equipments', 'maintenance', 'parts',
    'training', 'reports',
    'future_iot'
  ],
  TECNICO: [
    'dashboard', 'calls', 'history', 'parts',
    'training', 'alerts'
  ],
  ATENDENTE: [
    'dashboard', 'calls', 'history', 'equipments', 'maps', 'alerts'
  ],
  FINANCEIRO: [
    'dashboard', 'contracts', 'financial', 'employees', 'reports'
  ]
};

export const isViewAllowedForRole = (role: UserRole, view: ActiveView): boolean => {
  const allowed = ROLE_ALLOWED_VIEWS[role];
  if (!allowed) return true;
  return allowed.includes(view);
};

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  
  // Entities
  customers: Customer[];
  equipments: Equipment[];
  technicians: Technician[];
  supervisors: Supervisor[];
  managers: Manager[];
  employees: Employee[];
  timePunches: TimePunchRecord[];
  calls: Call[];
  contracts: Contract[];
  parts: Part[];
  partRequests: PartRequest[];
  techActivityLogs: TechActivityLog[];
  maintenancePlans: MaintenancePlan[];
  campaigns: MaintenanceCampaign[];
  trainings: TrainingCourse[];
  alerts: SystemAlert[];
  aiInsights: AIInsight[];
  
  // Actions
  createNewCall: (callData: Partial<Call>) => Call;
  createCustomer: (custData: Partial<Customer>) => Customer;
  createEquipment: (eqData: Partial<Equipment>) => Equipment;
  updateCallStatus: (callId: string, status: Call['status'], note?: string) => void;
  reassignTechnician: (callId: string, newTechnicianId: string, overrideReason?: string) => void;
  confirmAIRecommendation: (callId: string) => void;
  createPartRequest: (reqData: Partial<PartRequest>) => PartRequest;
  addTechActivityLog: (log: Omit<TechActivityLog, 'id'>) => void;
  
  // Employees & Payroll & Time Clock
  approveBonus: (employeeId: string, approved: boolean, notes?: string, notifySupervisor?: boolean, supervisorMessage?: string) => void;
  approveOvertime: (employeeId: string, approved: boolean, notes?: string, notifySupervisor?: boolean, supervisorMessage?: string) => void;
  notifySupervisor: (employeeId: string, subject: string, message: string, reasonType: 'BONUS' | 'HORA_EXTRA' | 'OUTROS') => void;
  updateEmployee: (employee: Employee) => void;
  registerTimePunch: (punchData: { 
    type: TimePunchRecord['type']; 
    location?: string; 
    notes?: string; 
    isLate?: boolean; 
    lateMinutes?: number;
    employeeId?: string;
  }) => TimePunchRecord;
  
  updateEquipmentStatus: (equipmentId: string, status: Equipment['status']) => void;
  createMaintenanceCampaign: (campaign: Partial<MaintenanceCampaign>) => void;
  markAlertAsRead: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Quick Filter State
  selectedEquipmentId: string | null;
  setSelectedEquipmentId: (id: string | null) => void;
  selectedCallId: string | null;
  setSelectedCallId: (id: string | null) => void;
  selectedCityFilter: string;
  setSelectedCityFilter: (city: string) => void;
  
  // Import handler
  importDataRows: (rows: any[]) => void;

  // Fixed Resident Technicians by Address
  fixedAddressTechnicians: Record<string, { address: string; buildingName: string; technicianId: string; technicianName: string; assignedAt: string }>;
  fixTechnicianToAddress: (address: string, buildingName: string, technicianId: string, technicianName: string) => void;
  unfixTechnicianFromAddress: (address: string) => void;

  // Theme & Visual Identity
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'otis_smartflow_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'user');
    return saved ? JSON.parse(saved) : DEMO_USERS[0]; // Default: Presidente
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'isLoggedIn');
    return saved ? JSON.parse(saved) : true;
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('TODAS');

  // Theme & Visual Identity (Option 2: Nordic Minimalist Dark)
  const [theme, setThemeState] = useState<AppTheme>(() => {
    localStorage.setItem(STORAGE_PREFIX + 'theme', 'nordic');
    return 'nordic';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_PREFIX + 'theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Entities with Local Storage support
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });
  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'equipments');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENTS;
  });
  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'technicians');
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });
  const [supervisors] = useState<Supervisor[]>(INITIAL_SUPERVISORS);
  const [managers] = useState<Manager[]>(INITIAL_MANAGERS);
  const [calls, setCalls] = useState<Call[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'calls');
    return saved ? JSON.parse(saved) : INITIAL_CALLS;
  });
  const [contracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [parts, setParts] = useState<Part[]>(INITIAL_PARTS);
  const [partRequests, setPartRequests] = useState<PartRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'part_requests');
    return saved ? JSON.parse(saved) : INITIAL_PART_REQUESTS;
  });
  const [techActivityLogs, setTechActivityLogs] = useState<TechActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'tech_logs');
    return saved ? JSON.parse(saved) : INITIAL_TECH_LOGS;
  });
  const [maintenancePlans, setMaintenancePlans] = useState<MaintenancePlan[]>(INITIAL_MAINTENANCE_PLANS);
  const [campaigns, setCampaigns] = useState<MaintenanceCampaign[]>(INITIAL_CAMPAIGNS);
  const [trainings] = useState<TrainingCourse[]>(INITIAL_TRAINING_COURSES);
  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });
  const [timePunches, setTimePunches] = useState<TimePunchRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'time_punches');
    return saved ? JSON.parse(saved) : INITIAL_TIME_PUNCHES;
  });
  const [aiInsights] = useState<AIInsight[]>(INITIAL_AI_INSIGHTS);

  // Fixed resident technicians pinned to addresses
  const [fixedAddressTechnicians, setFixedAddressTechnicians] = useState<Record<string, { address: string; buildingName: string; technicianId: string; technicianName: string; assignedAt: string }>>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'fixed_addresses');
    return saved ? JSON.parse(saved) : {
      'Av. Iguatemi, 777': {
        address: 'Av. Iguatemi, 777',
        buildingName: 'Centro Empresarial Iguatemi Campinas',
        technicianId: 'tech-2',
        technicianName: 'Carlos Mendonça',
        assignedAt: '2026-08-01T08:00:00.000Z'
      }
    };
  });

  const fixTechnicianToAddress = (address: string, buildingName: string, technicianId: string, technicianName: string) => {
    setFixedAddressTechnicians(prev => {
      const updated = {
        ...prev,
        [address]: {
          address,
          buildingName,
          technicianId,
          technicianName,
          assignedAt: new Date().toISOString()
        }
      };
      localStorage.setItem(STORAGE_PREFIX + 'fixed_addresses', JSON.stringify(updated));
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Técnico Residente Fixado',
      message: `${technicianName} foi fixado como técnico prioritário para o endereço "${address}" (${buildingName}).`
    });
  };

  const unfixTechnicianFromAddress = (address: string) => {
    setFixedAddressTechnicians(prev => {
      const updated = { ...prev };
      delete updated[address];
      localStorage.setItem(STORAGE_PREFIX + 'fixed_addresses', JSON.stringify(updated));
      return updated;
    });
    addToast({
      type: 'info',
      title: 'Fixação Removida',
      message: `Endereço "${address}" liberado para o fluxo padrão de despacho.`
    });
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'user', JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_PREFIX + 'isLoggedIn', JSON.stringify(isLoggedIn));
  }, [currentUser, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'calls', JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'time_punches', JSON.stringify(timePunches));
  }, [timePunches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'equipments', JSON.stringify(equipments));
  }, [equipments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'part_requests', JSON.stringify(partRequests));
  }, [partRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'tech_logs', JSON.stringify(techActivityLogs));
  }, [techActivityLogs]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.role === role) || {
      id: 'usr-custom',
      name: `Usuário ${role}`,
      email: `${role.toLowerCase()}@smartflow.ai`,
      role
    };
    setCurrentUser(matched);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_PREFIX + 'user', JSON.stringify(matched));
    localStorage.setItem(STORAGE_PREFIX + 'isLoggedIn', JSON.stringify(true));

    if (!isViewAllowedForRole(role, activeView)) {
      setActiveView('dashboard');
    }

    addToast({
      type: 'info',
      title: 'Perfil Alterado',
      message: `Visualizando como ${matched.name} (${matched.role})`
    });
  };

  const login = (email: string, role?: UserRole) => {
    const matched = DEMO_USERS.find((u) => (role ? u.role === role : u.email.toLowerCase() === email.toLowerCase()));
    if (matched) {
      setCurrentUser(matched);
      setIsLoggedIn(true);
      localStorage.setItem(STORAGE_PREFIX + 'user', JSON.stringify(matched));
      localStorage.setItem(STORAGE_PREFIX + 'isLoggedIn', JSON.stringify(true));

      if (!isViewAllowedForRole(matched.role, activeView)) {
        setActiveView('dashboard');
      }

      addToast({
        type: 'success',
        title: 'Acesso Autorizado',
        message: `Bem-vindo ao OTIS SmartFlow AI, ${matched.name}.`
      });
      return true;
    }
    // Fallback demo login
    const fallbackRole = role || 'SUPERVISOR';
    const fallbackUser: User = {
      id: 'usr-demo',
      name: 'Operador Conectado',
      email: email || 'demo@smartflow.ai',
      role: fallbackRole
    };
    setCurrentUser(fallbackUser);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_PREFIX + 'user', JSON.stringify(fallbackUser));
    localStorage.setItem(STORAGE_PREFIX + 'isLoggedIn', JSON.stringify(true));

    if (!isViewAllowedForRole(fallbackRole, activeView)) {
      setActiveView('dashboard');
    }

    addToast({
      type: 'success',
      title: 'Sessão Iniciada',
      message: `Conectado como ${fallbackUser.role}`
    });
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem(STORAGE_PREFIX + 'isLoggedIn', JSON.stringify(false));
    addToast({
      type: 'info',
      title: 'Sessão Encerrada',
      message: 'Você saiu do sistema e retornou à tela de login.'
    });
  };

  const createCustomer = (custData: Partial<Customer>): Customer => {
    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: custData.name || 'Novo Cliente Registrado',
      documentNumber: custData.documentNumber || '',
      buildingName: custData.buildingName || '',
      groupName: custData.groupName || 'Particular / Condomínio',
      isVip: custData.isVip ?? false,
      isCorporate: custData.isCorporate ?? false,
      phone: custData.phone || '(19) 3000-0000',
      email: custData.email || 'contato@cliente.com.br',
      address: custData.address || 'Endereço Principal',
      city: custData.city || 'Campinas',
      state: custData.state || 'SP',
      country: custData.country || 'Brasil',
      activeContractsCount: 1,
      equipmentsCount: 1,
      satisfactionScore: 100
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const createEquipment = (eqData: Partial<Equipment>): Equipment => {
    const newEq: Equipment = {
      id: 'eq-' + Date.now(),
      tag: eqData.tag || `ELV-${Math.floor(100 + Math.random() * 900)}`,
      name: eqData.name || 'Equipamento Principal',
      model: eqData.model || 'Otis Gen2 Comfort',
      manufacturer: eqData.manufacturer || 'OTIS',
      type: eqData.type || 'ELEVADOR_PASSAGEIROS',
      customerId: eqData.customerId || 'cust-1',
      customerName: eqData.customerName || 'Cliente Cadastrado',
      buildingName: eqData.buildingName || 'Edifício Central',
      address: eqData.address || 'Av. Principal, 100',
      city: eqData.city || 'Campinas',
      state: eqData.state || 'SP',
      country: 'Brasil',
      contractId: eqData.contractId || 'ctr-auto',
      installationYear: eqData.installationYear || new Date().getFullYear(),
      status: eqData.status || 'OPERACIONAL',
      machineType: eqData.machineType || 'Gearless ReGen',
      driveType: eqData.driveType || 'VVVF Drive',
      hasRegenerativeDrive: eqData.hasRegenerativeDrive ?? true,
      controlType: eqData.controlType || 'Otis MCS 220',
      cyclesCount: 12000,
      predictiveRiskScore: 18,
      riskLevel: 'BAIXO',
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextScheduledMaintenance: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      doorCycles: 11000,
      totalCallsHistoryCount: 0,
      totalDowntimeHours: 0,
      historicalFailures: []
    };
    setEquipments((prev) => [newEq, ...prev]);
    return newEq;
  };

  const createNewCall = (callData: Partial<Call>): Call => {
    const callNumber = `CH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const equipment = equipments.find((e) => e.id === callData.equipmentId) || {
      id: 'eq-custom-' + Date.now(),
      tag: callData.equipmentTag || 'EQ-NOVO',
      name: callData.equipmentTag || 'Equipamento',
      model: callData.equipmentModel || 'Otis Gen2 Comfort',
      manufacturer: callData.equipmentBrand || 'OTIS',
      type: callData.equipmentType || 'ELEVADOR_PASSAGEIROS',
      customerId: callData.customerId || 'cust-novo',
      customerName: callData.customerName || 'Cliente Registrado',
      buildingName: callData.buildingName || 'Edifício Registrado',
      address: callData.address || '',
      city: callData.city || 'Campinas',
      state: callData.state || 'SP',
      country: 'Brasil',
      contractId: 'ctr-auto',
      installationYear: 2023,
      status: 'PARADO' as const,
      machineType: 'Gearless',
      driveType: 'VVVF',
      hasRegenerativeDrive: true,
      controlType: 'Smart',
      cyclesCount: 10000,
      predictiveRiskScore: 50,
      riskLevel: 'MODERADO' as const,
      lastMaintenanceDate: '2026-08-01',
      nextScheduledMaintenance: '2026-09-01',
      doorCycles: 10000,
      totalCallsHistoryCount: 1,
      totalDowntimeHours: 0,
      historicalFailures: []
    };

    // Calculate priority from severityLevel if provided
    let calculatedPriority: CallPriority = callData.priority || 'MEDIO';
    if (callData.severityLevel !== undefined) {
      if (callData.severityLevel >= 5) calculatedPriority = 'CRITICO';
      else if (callData.severityLevel >= 4) calculatedPriority = 'CRITICO';
      else if (callData.severityLevel >= 3) calculatedPriority = 'ALTO';
      else if (callData.severityLevel >= 2) calculatedPriority = 'MEDIO';
      else calculatedPriority = 'BAIXO';
    } else if (callData.hasTrappedPassenger) {
      calculatedPriority = 'CRITICO';
    } else if (callData.isCarStopped) {
      calculatedPriority = 'ALTO';
    }

    // Automatic AI Analysis
    const aiRec = analyzeCallWithAI(
      callData.problemDescription || '',
      equipment,
      callData.hasTrappedPassenger || false,
      callData.isCarStopped || false,
      technicians
    );

    // Primary technician
    const primaryTech = callData.assignedTechnicians && callData.assignedTechnicians.length > 0
      ? callData.assignedTechnicians[0]
      : null;

    const chosenTechId = callData.technicianId || primaryTech?.id || aiRec.suggestedTechnicianId;
    const chosenTechName = callData.technicianName || primaryTech?.name || aiRec.suggestedTechnicianName;

    // SLA max hours
    const slaMaxHours = 
      calculatedPriority === 'CRITICO' ? 1.0 :
      calculatedPriority === 'ALTO' ? 2.0 :
      calculatedPriority === 'MEDIO' ? 4.0 : 8.0;

    // Real-time Distance, Traffic, Equipment Familiarity & Mismatch calculations
    const chosenTech = technicians.find(t => t.id === chosenTechId);
    const techLat = chosenTech?.currentLocation?.lat;
    const techLng = chosenTech?.currentLocation?.lng;
    const eqLat = equipment.lat || -22.8930;
    const eqLng = equipment.lng || -47.0255;

    const calculatedDistanceKm = (techLat && techLng) 
      ? calculateDistanceKm(techLat, techLng, eqLat, eqLng) 
      : 5.2;

    const traffic = getRealtimeTrafficCondition(equipment.city, calculatedDistanceKm);
    const familiarity = chosenTech 
      ? checkTechnicianEquipmentFamiliarity(chosenTech, equipment) 
      : { knowsEquipment: false, priorVisitsCount: 0, reason: '', isPreventiveTechnician: false, scoreBonus: 0 };
    const mismatch = checkPreventiveMismatch(chosenTechId, chosenTechName, equipment);

    const isFixedResident = Boolean(fixedAddressTechnicians[equipment.address]?.technicianId === chosenTechId);

    const newCall: Call = {
      id: 'call-' + Date.now(),
      callNumber,
      createdAt: new Date().toISOString(),
      origin: callData.origin || 'TELEFONE',
      priority: calculatedPriority,
      status: 'CRIADO',
      severityLevel: callData.severityLevel ?? (calculatedPriority === 'CRITICO' ? 5 : calculatedPriority === 'ALTO' ? 3 : 2),
      equipmentBrand: callData.equipmentBrand || equipment.manufacturer || 'OTIS',
      buildingType: callData.buildingType || 'PREDIO_COMERCIAL',
      customerId: callData.customerId || equipment.customerId,
      customerName: callData.customerName || equipment.customerName,
      customerPhone: callData.customerPhone || '(19) 3755-9000',
      address: callData.address || equipment.address,
      city: callData.city || equipment.city,
      state: callData.state || equipment.state,
      country: equipment.country || 'Brasil',
      buildingName: callData.buildingName || equipment.buildingName,
      equipmentId: equipment.id,
      equipmentTag: callData.equipmentTag || equipment.tag,
      equipmentModel: callData.equipmentModel || equipment.model,
      equipmentType: callData.equipmentType || equipment.type,
      lat: eqLat,
      lng: eqLng,
      distanceKm: calculatedDistanceKm,
      trafficCondition: traffic.level,
      trafficDelayMinutes: traffic.delayMin,
      technicianFamiliarity: {
        knowsEquipment: familiarity.knowsEquipment,
        preventiveTechMismatch: mismatch.isMismatch,
        preventiveTechName: equipment.preventiveTechnicianName,
        previousVisitsCount: familiarity.priorVisitsCount,
        familiarityReason: familiarity.reason,
        isFixedResidentTech: isFixedResident,
        suggestedFixedTechName: fixedAddressTechnicians[equipment.address]?.technicianName
      },
      problemDescription: callData.problemDescription || 'Relato de anomalia registrado na central.',
      mainComponent: callData.mainComponent || 'Sistema de Portas',
      subComponent: callData.subComponent || 'Operador de Porta',
      defectType: callData.defectType || 'Falha de Operação',
      hasTrappedPassenger: callData.hasTrappedPassenger || false,
      isCarStopped: callData.isCarStopped ?? true,
      supervisorId: 'sup-1',
      supervisorName: 'Roberto Viana',
      technicianId: chosenTechId,
      technicianName: chosenTechName,
      assignedTechnicians: callData.assignedTechnicians || (chosenTechId ? [{
        id: chosenTechId,
        name: chosenTechName,
        phone: technicians.find(t => t.id === chosenTechId)?.phone || '(19) 98822-1010',
        role: 'LEAD',
        specialties: technicians.find(t => t.id === chosenTechId)?.specialties || ['Sistema de Portas'],
        matchScore: 98
      }] : []),
      notificationMethod: callData.notificationMethod || {
        appPush: true,
        phoneCall: (callData.severityLevel ?? 0) >= 4,
        urgentAlertEmail: (callData.severityLevel ?? 0) >= 4,
        sentTimestamp: new Date().toISOString(),
        emailRecipients: ['supervisor@smartflow.ai', 'operacoes@smartflow.ai']
      },
      contractId: equipment.contractId || 'CTR-2024',
      contractNumber: 'CTR-OTIS-2024',
      slaMaxHours,
      aiRecommendation: aiRec,
      timeline: [
        {
          step: 'Chamado Aberto',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Chamado registrado via ${callData.origin || 'TELEFONE'}. Gravidade: Nível ${callData.severityLevel ?? 3}/5.`,
          author: currentUser.name
        },
        {
          step: 'Despacho & Notificação',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Técnico(s) atribuído(s): ${chosenTechName}${callData.assignedTechnicians && callData.assignedTechnicians.length > 1 ? ` (+ ${callData.assignedTechnicians.length - 1} apoio)` : ''}. Notificações enviadas: ${callData.notificationMethod?.urgentAlertEmail ? 'Push Celular + Ligação + E-mail de Auditoria' : 'Push Mobile'}.`,
          author: 'SmartFlow Dispatch'
        }
      ]
    };

    setCalls((prev) => [newCall, ...prev]);

    // Create system alert if critical
    if (newCall.priority === 'CRITICO' || newCall.hasTrappedPassenger || (newCall.severityLevel ?? 0) >= 4) {
      const newAlert: SystemAlert = {
        id: 'alt-' + Date.now(),
        category: 'CRITICO',
        severity: 'CRITICA',
        title: `NOVO CHAMADO CRÍTICO (Gravidade ${newCall.severityLevel}/5): ${newCall.equipmentTag}`,
        timestamp: new Date().toISOString(),
        problem: `${newCall.problemDescription} (${newCall.customerName}, ${newCall.city})`,
        evidence: `Gravidade ${newCall.severityLevel}/5 registrada. ${newCall.hasTrappedPassenger ? 'Passageiro retido no interior.' : 'Equipamento inoperante.'}`,
        recommendation: `Técnico(s) despachado(s): ${chosenTechName}. Confirmar deslocamento imediato.`,
        targetEntityId: newCall.id,
        targetEntityType: 'CALL',
        actionLabel: 'Ver Chamado',
        actionType: 'VIEW_EQUIPMENT',
        read: false
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }

    addToast({
      type: 'success',
      title: 'Chamado Aberto com Sucesso!',
      message: `OS ${callNumber} gerada para ${chosenTechName}. Notificações disparadas.`
    });

    return newCall;
  };

  const updateCallStatus = (callId: string, status: Call['status'], note?: string) => {
    setCalls((prev) =>
      prev.map((c) => {
        if (c.id !== callId) return c;
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const stepLabels: Record<Call['status'], string> = {
          CRIADO: 'Aberto',
          CONTACTADO: 'Cliente Contactado',
          ACEITO: 'Aceito pelo Técnico',
          A_CAMINHO: 'Técnico a Caminho',
          EM_ATENDIMENTO: 'Em Atendimento / Diagnóstico',
          CONCLUIDO: 'Chamado Concluído',
          CANCELADO: 'Chamado Cancelado'
        };

        const updatedTimeline = [
          ...c.timeline,
          {
            step: stepLabels[status],
            timestamp: nowTime,
            description: note || `Status alterado para ${stepLabels[status]} por ${currentUser.name}.`,
            author: currentUser.name
          }
        ];

        return {
          ...c,
          status,
          timeline: updatedTimeline,
          solutionFinishedAt: status === 'CONCLUIDO' ? new Date().toISOString() : c.solutionFinishedAt
        };
      })
    );

    addToast({
      type: 'info',
      title: 'Status Atualizado',
      message: `Chamado atualizado com sucesso.`
    });
  };

  const reassignTechnician = (callId: string, newTechnicianId: string, overrideReason?: string) => {
    const tech = technicians.find((t) => t.id === newTechnicianId);
    if (!tech) return;

    setCalls((prev) =>
      prev.map((c) => {
        if (c.id !== callId) return c;
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...c,
          technicianId: tech.id,
          technicianName: tech.name,
          supervisorOverride: overrideReason
            ? {
                overridden: true,
                originalRecommendation: c.aiRecommendation?.suggestedTechnicianName || 'N/A',
                chosenTechnicianName: tech.name,
                reason: overrideReason,
                timestamp: new Date().toISOString()
              }
            : c.supervisorOverride,
          timeline: [
            ...c.timeline,
            {
              step: 'Técnico Reatribuído',
              timestamp: nowTime,
              description: `Atribuído para ${tech.name}. ${overrideReason ? `Motivo do Supervisor: "${overrideReason}"` : ''}`,
              author: currentUser.name
            }
          ]
        };
      })
    );

    addToast({
      type: 'success',
      title: 'Técnico Reatribuído',
      message: `Chamado atribuído a ${tech.name}. Decisão registrada no histórico de aprendizado da IA.`
    });
  };

  const confirmAIRecommendation = (callId: string) => {
    const targetCall = calls.find((c) => c.id === callId);
    if (!targetCall || !targetCall.aiRecommendation) return;

    reassignTechnician(callId, targetCall.aiRecommendation.suggestedTechnicianId);
    addToast({
      type: 'success',
      title: 'Recomendação Confirmada',
      message: `Designação aprovada conforme sugestão da IA.`
    });
  };

  const updateEquipmentStatus = (equipmentId: string, status: Equipment['status']) => {
    setEquipments((prev) =>
      prev.map((e) => (e.id === equipmentId ? { ...e, status } : e))
    );
    addToast({
      type: 'info',
      title: 'Equipamento Atualizado',
      message: `Status alterado para ${status}.`
    });
  };

  const createMaintenanceCampaign = (campaignData: Partial<MaintenanceCampaign>) => {
    const newCamp: MaintenanceCampaign = {
      id: 'cmp-' + Date.now(),
      title: campaignData.title || 'Campanha Preventiva SmartFlow',
      componentTarget: campaignData.componentTarget || 'Sistema de Portas',
      modelTarget: campaignData.modelTarget || 'Otis Gen2 Comfort',
      riskDescription: campaignData.riskDescription || 'Campanha preditiva baseada em padrões de fadiga.',
      totalTargetEquipments: campaignData.totalTargetEquipments || 320,
      highRiskEquipmentsCount: campaignData.highRiskEquipmentsCount || 85,
      inspectedEquipmentsCount: 0,
      targetRegions: campaignData.targetRegions || ['Campinas', 'São Paulo', 'São Bernardo'],
      estimatedCost: campaignData.estimatedCost || 45000,
      startDate: new Date().toISOString().split('T')[0],
      status: 'EM_ANDAMENTO',
      aiRootCauseHypothesis: campaignData.aiRootCauseHypothesis || 'Fadiga prematura aos 3 anos sob ciclagem contínua.'
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    addToast({
      type: 'success',
      title: 'Campanha Criada',
      message: `Campanha "${newCamp.title}" lançada para ${newCamp.totalTargetEquipments} equipamentos.`
    });
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    addToast({
      type: 'info',
      title: 'Alerta Removido',
      message: 'Alerta arquivado com sucesso.'
    });
  };

  const importDataRows = (rows: any[]) => {
    if (!rows || rows.length === 0) return;
    
    // Convert imported rows into calls and equipments if structured
    let addedCount = 0;
    const newCallsList: Call[] = [...calls];
    
    rows.forEach((row, idx) => {
      const callNum = row['Número do Chamado'] || row['Numero do Chamado'] || `IMP-${Date.now()}-${idx}`;
      const desc = row['Descricao do Problema'] || row['Problema'] || row['Defeito'] || 'Chamado importado via planilha';
      const client = row['Cliente'] || 'Cliente Importado';
      const model = row['Tipo de Unidade'] || row['Modelo'] || 'Otis Gen2 Comfort';
      const city = row['Área'] || row['Cidade'] || 'São Paulo';
      const techName = row['Tecnico'] || 'João Pedro Santos';
      const supervisor = row['Supervisor'] || 'Roberto Viana';
      const hasTrapped = String(row['Passageiro Preso']).toLowerCase() === 'sim' || String(row['Passageiro Preso']).toLowerCase() === 'true';
      const isStopped = String(row['Carro Parado']).toLowerCase() === 'sim' || String(row['Carro Parado']).toLowerCase() === 'true';

      const importedCall: Call = {
        id: 'imp-call-' + idx + '-' + Date.now(),
        callNumber: callNum,
        createdAt: row['Criado em'] || new Date().toISOString(),
        origin: 'SISTEMA',
        priority: hasTrapped ? 'CRITICO' : isStopped ? 'ALTO' : 'MEDIO',
        status: row['Status'] === 'Fechado' ? 'CONCLUIDO' : 'EM_ATENDIMENTO',
        customerId: 'cust-imp',
        customerName: client,
        customerPhone: '(11) 9999-0000',
        address: row['Endereco'] || 'Endereço Comercial',
        city: city,
        state: 'SP',
        country: row['Pais da Unidade'] || 'Brasil',
        buildingName: row['Unidade'] || client,
        equipmentId: 'eq-imp-' + idx,
        equipmentTag: row['Chamado'] || `ELV-${city.substring(0, 3).toUpperCase()}-${idx + 1}`,
        equipmentModel: model,
        equipmentType: 'ELEVADOR_PASSAGEIROS',
        problemDescription: desc,
        mainComponent: row['Componente Principal'] || 'Sistema de Portas',
        subComponent: row['Componente Sub'] || 'Operador',
        defectType: row['Falha'] || 'Desgaste Operacional',
        hasTrappedPassenger: hasTrapped,
        isCarStopped: isStopped,
        supervisorId: 'sup-1',
        supervisorName: supervisor,
        technicianName: techName,
        contractId: 'ctr-imp',
        contractNumber: row['Contrato Num'] || 'CTR-IMP-2024',
        slaMaxHours: 2.0,
        timeline: [
          {
            step: 'Importado de Planilha',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: `Importado com chave ${callNum}. TA: ${row['TA - Tempo de chegada'] || 'N/A'}, TB: ${row['TB - Tempo solução'] || 'N/A'}`,
            author: currentUser.name
          }
        ]
      };

      newCallsList.unshift(importedCall);
      addedCount++;
    });

    setCalls(newCallsList);
    addToast({
      type: 'success',
      title: 'Importação Concluída',
      message: `${addedCount} registros importados e integrados ao SmartFlow AI com sucesso!`
    });
  };

  const addTechActivityLog = (logData: Omit<TechActivityLog, 'id'>) => {
    const newLog: TechActivityLog = {
      ...logData,
      id: 'tlog-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5)
    };
    setTechActivityLogs((prev) => [newLog, ...prev]);
  };

  const createPartRequest = (reqData: Partial<PartRequest>): PartRequest => {
    const newReq: PartRequest = {
      id: 'req-' + Date.now(),
      requestNumber: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      partId: reqData.partId || 'part-01',
      partCode: reqData.partCode || 'PECA-GEN',
      partName: reqData.partName || 'Peça Solicitada',
      category: reqData.category || 'Geral',
      unitCost: reqData.unitCost || 0,
      quantity: reqData.quantity || 1,
      callId: reqData.callId,
      callNumber: reqData.callNumber,
      equipmentTag: reqData.equipmentTag,
      customerName: reqData.customerName,
      urgency: reqData.urgency || 'ALTA',
      deliveryType: reqData.deliveryType || 'LOCAL_CHAMADO',
      technicianId: currentUser.id,
      technicianName: currentUser.name,
      justification: reqData.justification || 'Solicitação para atendimento em campo.',
      status: 'EM_SEPARACAO',
      createdAt: `Hoje, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      estimatedDelivery: reqData.deliveryType === 'LOCAL_CHAMADO' ? 'Hoje, em ~45 min (via Motoboy Express)' : 'Polo Campinas (Disponível para retirada)'
    };

    setPartRequests((prev) => [newReq, ...prev]);

    // Automatically record to TechActivityLogs
    addTechActivityLog({
      type: 'PECA_PEDIDA',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `Hoje, ${new Date().toLocaleDateString('pt-BR')}`,
      title: `Pedido de Peça: ${newReq.quantity}x ${newReq.partName}`,
      description: `Requisitado ${newReq.quantity}x ${newReq.partName} (${newReq.partCode}) para ${newReq.callNumber ? `o chamado ${newReq.callNumber}` : 'estoque móvel/manutenção'}. Motivo: ${newReq.justification}`,
      callNumber: newReq.callNumber,
      equipmentTag: newReq.equipmentTag,
      technicianName: currentUser.name,
      metadata: {
        partName: newReq.partName,
        partQuantity: newReq.quantity,
        partCost: newReq.unitCost * newReq.quantity
      }
    });

    // If linked to a call, also append to the call's timeline
    if (newReq.callId) {
      setCalls((prevCalls) =>
        prevCalls.map((c) => {
          if (c.id === newReq.callId || c.callNumber === newReq.callNumber) {
            return {
              ...c,
              usedParts: [
                ...(c.usedParts || []),
                {
                  partId: newReq.partId,
                  partName: newReq.partName,
                  quantity: newReq.quantity,
                  unitCost: newReq.unitCost
                }
              ],
              timeline: [
                ...(c.timeline || []),
                {
                  step: 'Peça Requisitada',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  description: `Requisitado ${newReq.quantity}x ${newReq.partName} (${newReq.requestNumber}) com prioridade ${newReq.urgency}.`,
                  author: currentUser.name
                }
              ]
            };
          }
          return c;
        })
      );
    }

    addToast({
      type: 'success',
      title: 'Pedido de Peça Enviado!',
      message: `${newReq.requestNumber}: ${newReq.quantity}x ${newReq.partName} solicitado para o chamado ${newReq.callNumber || 'em campo'}.`
    });

    return newReq;
  };

  // Employees & Payroll Methods
  const notifySupervisor = (
    employeeId: string,
    subject: string,
    message: string,
    reasonType: 'BONUS' | 'HORA_EXTRA' | 'OUTROS'
  ) => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    const supervisorName = targetEmp?.supervisorName || 'Roberto Viana';
    const nowStr = `Hoje, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Create system alert
    const newAlert: SystemAlert = {
      id: 'alt-fin-' + Date.now(),
      category: 'FINANCEIRO',
      severity: 'ALTA',
      title: `[Financeiro] Notificação para ${supervisorName}: ${subject}`,
      timestamp: nowStr,
      problem: `Contestação/Ajuste no fechamento de folha de ${targetEmp?.name || 'Colaborador'}.`,
      evidence: message || `Auditoria do Financeiro solicitou parecer do supervisor ${supervisorName}.`,
      recommendation: `Supervisor ${supervisorName} deve revisar e responder a contestação no módulo de Supervisão.`,
      targetEntityType: 'SUPERVISOR',
      actionLabel: 'Ver Folha do Colaborador',
      actionType: 'ANALYZE_CONTRACT',
      read: false
    };

    setAlerts((prev) => [newAlert, ...prev]);

    // Record in TechActivityLogs
    addTechActivityLog({
      type: 'SUPERVISOR_NOTIFICADO',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `Hoje, ${new Date().toLocaleDateString('pt-BR')}`,
      title: `Financeiro Notificou Supervisor: ${subject}`,
      description: `Mensagem enviada a ${supervisorName} referente a ${targetEmp?.name} (${reasonType === 'BONUS' ? 'Bônus' : reasonType === 'HORA_EXTRA' ? 'Horas Extras' : 'Folha'}). Parecer: "${message}"`,
      technicianName: currentUser.name,
      metadata: {
        supervisorName,
        supervisorReason: message,
        reason: subject
      }
    });

    addToast({
      type: 'info',
      title: `Supervisor Notificado`,
      message: `Mensagem enviada com sucesso a ${supervisorName} sobre ${targetEmp?.name || 'o colaborador'}.`
    });
  };

  const approveBonus = (
    employeeId: string,
    approved: boolean,
    notes?: string,
    notifySupervisorFlag?: boolean,
    supervisorMessage?: string
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const newStatus = approved ? 'APROVADO' : 'REPROVADO';
          const newAmount = approved ? (emp.bonusSuggested || emp.bonusAmount || 850) : 0;
          return {
            ...emp,
            bonusStatus: newStatus,
            bonusAmount: newAmount,
            bonusApprovedBy: `${currentUser.name} (${currentUser.role})`,
            bonusApprovedAt: new Date().toISOString(),
            bonusNotes: notes || (approved ? 'Bônus homologado pelo setor financeiro.' : 'Bônus não aprovado na auditoria financeira.')
          };
        }
        return emp;
      })
    );

    const targetEmp = employees.find((e) => e.id === employeeId);
    if (notifySupervisorFlag && supervisorMessage) {
      notifySupervisor(
        employeeId,
        `Bônus não aprovado - ${targetEmp?.name}`,
        supervisorMessage,
        'BONUS'
      );
    }

    addToast({
      type: approved ? 'success' : 'warning',
      title: approved ? 'Bônus Aprovado!' : 'Bônus Não Aprovado',
      message: `${targetEmp?.name || 'Colaborador'}: Bônus ${approved ? 'aprovado com sucesso' : 'marcado como não aprovado'}.`
    });
  };

  const approveOvertime = (
    employeeId: string,
    approved: boolean,
    notes?: string,
    notifySupervisorFlag?: boolean,
    supervisorMessage?: string
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const newStatus = approved ? 'APROVADO' : 'REPROVADO';
          return {
            ...emp,
            overtimeStatus: newStatus,
            overtimeApprovedBy: `${currentUser.name} (${currentUser.role})`,
            overtimeApprovedAt: new Date().toISOString(),
            overtimeNotes: notes || (approved ? 'Horas extras homologadas pelo setor financeiro.' : 'Horas extras não aprovadas na auditoria financeira.')
          };
        }
        return emp;
      })
    );

    const targetEmp = employees.find((e) => e.id === employeeId);
    if (notifySupervisorFlag && supervisorMessage) {
      notifySupervisor(
        employeeId,
        `Horas Extras não aprovadas (${targetEmp?.overtimeHours || 0}h) - ${targetEmp?.name}`,
        supervisorMessage,
        'HORA_EXTRA'
      );
    }

    addToast({
      type: approved ? 'success' : 'warning',
      title: approved ? 'Horas Extras Aprovadas!' : 'Horas Extras Não Aprovadas',
      message: `${targetEmp?.name || 'Colaborador'}: Horas extras ${approved ? 'aprovadas para pagamento' : 'recusadas/bloqueadas'}.`
    });
  };

  const updateEmployee = (updated: Employee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updated.id ? updated : emp))
    );
    addToast({
      type: 'success',
      title: 'Cadastro Atualizado',
      message: `Dados do colaborador ${updated.name} foram atualizados.`
    });
  };

  // Time Clock Registration (Ponto Eletrônico)
  const registerTimePunch = (punchData: {
    type: TimePunchRecord['type'];
    location?: string;
    notes?: string;
    isLate?: boolean;
    lateMinutes?: number;
    employeeId?: string;
  }): TimePunchRecord => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = now.toLocaleDateString('pt-BR');

    // Find the associated employee
    const targetEmp = employees.find(
      (e) => (punchData.employeeId && e.id === punchData.employeeId) || e.userId === currentUser.id || e.name === currentUser.name || e.email === currentUser.email
    ) || employees[0];

    const punchId = 'punch-' + Math.random().toString(36).substring(2, 9);
    const newPunch: TimePunchRecord = {
      id: punchId,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      employeeRole: targetEmp.role,
      type: punchData.type,
      timestamp: now.toISOString(),
      formattedTime,
      formattedDate,
      location: punchData.location || `${targetEmp.unit || targetEmp.city || 'Polo Operacional'} - Check-in GPS`,
      isLate: punchData.isLate || false,
      lateMinutes: punchData.lateMinutes || 0,
      notes: punchData.notes || `Registro de ${punchData.type.replace('_', ' ')} confirmado via sistema.`,
      method: 'GEO_LOCALIZACAO'
    };

    setTimePunches((prev) => [newPunch, ...prev]);

    // Update Employee record with punch status and calculation
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === targetEmp.id) {
          let newPunchStatus = emp.currentPunchStatus;
          let overtimeIncrement = 0;
          let lateIncrement = punchData.isLate ? 1 : 0;
          let lateMinutesIncrement = punchData.lateMinutes || 0;

          if (punchData.type === 'ENTRADA') {
            newPunchStatus = 'EM_JORNADA';
          } else if (punchData.type === 'ALMOCO_SAIDA') {
            newPunchStatus = 'EM_INTERVALO';
          } else if (punchData.type === 'ALMOCO_RETORNO') {
            newPunchStatus = 'EM_JORNADA';
          } else if (punchData.type === 'SAIDA') {
            newPunchStatus = 'FORA_TURNO';
          } else if (punchData.type === 'HORA_EXTRA') {
            newPunchStatus = 'EM_JORNADA';
            overtimeIncrement = 2.0; // Adiciona 2h de hora extra
          }

          const updatedOvertime = emp.overtimeHours + overtimeIncrement;
          const updatedOvertimeTotal = Number((updatedOvertime * emp.overtimeRate).toFixed(2));
          const updatedLateCount = emp.lateArrivalsCount + lateIncrement;
          const updatedLateMins = emp.lateTotalMinutes + lateMinutesIncrement;

          return {
            ...emp,
            currentPunchStatus: newPunchStatus,
            lastPunchTime: `Hoje às ${formattedTime}`,
            overtimeHours: updatedOvertime,
            overtimeTotalAmount: updatedOvertimeTotal,
            lateArrivalsCount: updatedLateCount,
            lateTotalMinutes: updatedLateMins,
            punctualityRate: updatedLateCount > 0 ? Math.max(70, Number((100 - (updatedLateCount * 3.5)).toFixed(1))) : 100,
            recentPunches: [newPunch, ...(emp.recentPunches || []).slice(0, 9)]
          };
        }
        return emp;
      })
    );

    // Also add to TechActivityLogs if it's a technical check-in
    addTechActivityLog({
      type: punchData.type === 'ENTRADA' ? 'CHECK_IN' : 'PAUSA_SEGURA',
      timestamp: formattedTime,
      date: `Hoje, ${formattedDate}`,
      title: `Ponto Registrado: ${punchData.type.replace('_', ' ')}`,
      description: `${targetEmp.name} bateu ponto (${punchData.type}) em ${newPunch.location}${punchData.isLate ? ` [ATENÇÃO: Atraso de ${punchData.lateMinutes} min]` : ''}.`,
      technicianName: targetEmp.name,
      metadata: {
        reason: punchData.notes,
        status: newPunch.type
      }
    });

    const punchLabels: Record<string, string> = {
      ENTRADA: 'Entrada Registrada',
      ALMOCO_SAIDA: 'Saída para Intervalo',
      ALMOCO_RETORNO: 'Retorno de Intervalo',
      SAIDA: 'Saída de Turno Registrada',
      HORA_EXTRA: 'Hora Extra Registrada'
    };

    addToast({
      type: punchData.isLate ? 'warning' : 'success',
      title: punchLabels[punchData.type] || 'Ponto Eletrônico',
      message: `${formattedTime} - ${targetEmp.name} (${targetEmp.roleTitle}): Registro gravado com sucesso!`
    });

    return newPunch;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        isLoggedIn,
        login,
        logout,
        activeView,
        setActiveView,
        customers,
        equipments,
        technicians,
        supervisors,
        managers,
        employees,
        timePunches,
        calls,
        contracts,
        parts,
        partRequests,
        techActivityLogs,
        maintenancePlans,
        campaigns,
        trainings,
        alerts,
        aiInsights,
        createNewCall,
        createCustomer,
        createEquipment,
        updateCallStatus,
        reassignTechnician,
        confirmAIRecommendation,
        createPartRequest,
        addTechActivityLog,
        approveBonus,
        approveOvertime,
        notifySupervisor,
        updateEmployee,
        registerTimePunch,
        updateEquipmentStatus,
        createMaintenanceCampaign,
        markAlertAsRead,
        dismissAlert,
        toasts,
        addToast,
        removeToast,
        selectedEquipmentId,
        setSelectedEquipmentId,
        selectedCallId,
        setSelectedCallId,
        selectedCityFilter,
        setSelectedCityFilter,
        importDataRows,
        fixedAddressTechnicians,
        fixTechnicianToAddress,
        unfixTechnicianFromAddress,
        theme,
        setTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
