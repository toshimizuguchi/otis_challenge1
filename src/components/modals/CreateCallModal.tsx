import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  UserPlus,
  Building2,
  Phone,
  MapPin,
  FileText,
  AlertTriangle,
  Flame,
  Zap,
  ShieldAlert,
  Wrench,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Send,
  Bell,
  PhoneCall,
  Mail,
  Navigation,
  Clock,
  Award,
  Layers,
  ArrowRight,
  ChevronRight,
  Hospital,
  ShoppingBag,
  Plane,
  Building,
  Factory,
  Hotel,
  AlertOctagon,
  Lock,
  Unlock,
  ShieldCheck,
  Info,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CallOrigin, EquipmentType, Technician, Customer } from '../../types';
import { 
  calculateDistanceKm, 
  getRealtimeTrafficCondition, 
  calculateEtaWithTraffic, 
  checkTechnicianEquipmentFamiliarity, 
  checkPreventiveMismatch, 
  getAddressFixationSuggestion 
} from '../../utils/geoUtils';

interface CreateCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEquipmentId?: string;
}

// Brand options
const BRAND_OPTIONS = [
  { id: 'OTIS', name: 'Otis', isOriginal: true, desc: 'Equipamentos e tecnologias originais Otis (Gen2, SkyRise, ReGen, 510 NPE)' },
  { id: 'SCHINDLER', name: 'Schindler', isOriginal: false, desc: 'Linhas 3300, 5500, 7000 e TX' },
  { id: 'TK_ELEVATOR', name: 'TK Elevator (Thyssen)', isOriginal: false, desc: 'Linhas Synergy, Evolution, Tugela' },
  { id: 'KONE', name: 'KONE', isOriginal: false, desc: 'Linhas MonoSpace, TranSys, TravelMaster' },
  { id: 'ATLAS', name: 'Atlas', isOriginal: false, desc: 'Elevadores convencionais e modernizados' },
  { id: 'SUR_GMV', name: 'Sur / GMV', isOriginal: false, desc: 'Sistemas hidráulicos e tração direta' },
  { id: 'OUTRAS', name: 'Outras Marcas', isOriginal: false, desc: 'Multimarcas e fabricantes independentes' }
];

// Building / Location Type options
const BUILDING_TYPES = [
  { id: 'PREDIO_RESIDENCIAL', name: 'Prédio Residencial / Condomínio', icon: Building, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { id: 'PREDIO_COMERCIAL', name: 'Prédio Comercial / Corporativo', icon: Building2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'HOSPITAL', name: 'Hospital / Clínica / Pronto-Socorro', icon: Hospital, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', alert: 'Prioridade Hospitalar & Macas' },
  { id: 'SHOPPING', name: 'Shopping Center / Mall', icon: ShoppingBag, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', alert: 'Alto Fluxo de Pedestres' },
  { id: 'AEROPORTO', name: 'Aeroporto / Terminal de Transporte', icon: Plane, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', alert: 'Operação 24/7 Crítica' },
  { id: 'INDUSTRIA', name: 'Indústria / Centro de Distribuição', icon: Factory, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'HOTEL', name: 'Hotel / Resort', icon: Hotel, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
];

// Equipment Type options
const EQUIPMENT_TYPES: { id: EquipmentType; name: string; icon: string; category: string }[] = [
  { id: 'ELEVADOR_PASSAGEIROS', name: 'Elevador de Passageiros / Social', icon: '🛗', category: 'Elevadores' },
  { id: 'ELEVADOR_CARGA', name: 'Elevador de Carga / Leito-Maca', icon: '🛏️', category: 'Elevadores' },
  { id: 'ESCADA_ROLANTE', name: 'Escada Rolante', icon: '🪜', category: 'Mobilidade Contínua' },
  { id: 'ESTEIRA_ROLANTE', name: 'Esteira Rolante', icon: '🚶‍♂️', category: 'Mobilidade Contínua' },
  { id: 'ELEVADOR_PANORAMICO', name: 'Elevador Panorâmico / Alta Velocidade', icon: '✨', category: 'Elevadores' }
];

// Severity Scale 0 - 5 (Reduzidos conforme solicitação operacional)
const SEVERITY_LEVELS = [
  {
    level: 0,
    title: 'Informativo / Dúvida',
    color: 'border-slate-700 bg-slate-800/60 text-slate-300',
    badgeColor: 'bg-slate-700 text-slate-200',
    description: 'Solicitação de esclarecimento ou dúvida operacional sem defeito detectado.',
    sla: '4 horas',
    autoNotification: { appPush: true, phoneCall: false, urgentAlertEmail: false }
  },
  {
    level: 1,
    title: 'Baixa Gravidade',
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Ruído leve, lâmpada de botão ou display apagado. Equipamento opera normalmente.',
    sla: '3 horas',
    autoNotification: { appPush: true, phoneCall: false, urgentAlertEmail: false }
  },
  {
    level: 2,
    title: 'Gravidade Média',
    color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Vibração na partida, tempo de porta lento, desnível milimétrico de cabina.',
    sla: '2 horas',
    autoNotification: { appPush: true, phoneCall: false, urgentAlertEmail: false }
  },
  {
    level: 3,
    title: 'Atenção / Parado Sem Passageiro',
    color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Elevador ou escada inoperante sem pessoas presas. Fluxo do edifício impactado.',
    sla: '1 hora',
    autoNotification: { appPush: true, phoneCall: false, urgentAlertEmail: false }
  },
  {
    level: 4,
    title: 'Alta Gravidade / Local Crítico',
    color: 'border-orange-500/50 bg-orange-950/30 text-orange-300',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    description: 'Horário de pico, local sensível (Hospital, Aeroporto, Shopping) ou múltiplos equipamentos parados.',
    sla: '30 - 45 minutos (Alta Urgência)',
    autoNotification: { appPush: true, phoneCall: true, urgentAlertEmail: true }
  },
  {
    level: 5,
    title: 'Emergência Máxima / Passageiro Preso',
    color: 'border-rose-500/80 bg-rose-950/40 text-rose-300 animate-pulse',
    badgeColor: 'bg-rose-500 text-white font-extrabold shadow-lg shadow-rose-900/50',
    description: 'Passageiro(s) preso(s) no interior, queda de energia, risco iminente ou resgate urgente.',
    sla: '15 - 20 minutos (Crítico / Resgate)',
    autoNotification: { appPush: true, phoneCall: true, urgentAlertEmail: true }
  }
];

export const CreateCallModal: React.FC<CreateCallModalProps> = ({
  isOpen,
  onClose,
  initialEquipmentId
}) => {
  const {
    customers,
    equipments,
    technicians,
    calls,
    createNewCall,
    createCustomer,
    createEquipment,
    addToast,
    fixedAddressTechnicians,
    fixTechnicianToAddress,
    unfixTechnicianFromAddress
  } = useApp();

  // Mode: existing customer search vs new customer registration vs emergency fast-track
  const [customerMode, setCustomerMode] = useState<'SEARCH' | 'REGISTER' | 'EMERGENCY'>('SEARCH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(initialEquipmentId || null);

  // New Customer Form State
  const [newCep, setNewCep] = useState('');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerDoc, setNewCustomerDoc] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newBuildingName, setNewBuildingName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Campinas');
  const [newState, setNewState] = useState('SP');

  // Equipment & Location Specs
  const [equipmentBrand, setEquipmentBrand] = useState('OTIS');
  const [buildingType, setBuildingType] = useState('PREDIO_COMERCIAL');
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('ELEVADOR_PASSAGEIROS');
  const [equipmentTag, setEquipmentTag] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('Otis Gen2 Comfort');

  // Severity (0 - 5)
  const [severityLevel, setSeverityLevel] = useState<number>(3);
  const [hasTrappedPassenger, setHasTrappedPassenger] = useState(false);
  const [isCarStopped, setIsCarStopped] = useState(true);

  // Problem description & Origin
  const [origin, setOrigin] = useState<CallOrigin>('TELEFONE');
  const [problemDescription, setProblemDescription] = useState('');
  const [mainComponent, setMainComponent] = useState('Geral / Diagnóstico no Local');

  // Assigned Technicians (supports multiple)
  const [selectedTechnicians, setSelectedTechnicians] = useState<{
    id: string;
    role: 'LEAD' | 'SUPPORT';
  }[]>([]);

  // Technician availability filter & Extreme urgency safeguard
  const [techAvailabilityFilter, setTechAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'EXTREME'>('ALL');
  const [protectExtremeUrgent, setProtectExtremeUrgent] = useState(true);
  const [confirmOverrideTech, setConfirmOverrideTech] = useState<any | null>(null);

  // Notification Options
  const [notifyApp, setNotifyApp] = useState(true);
  const [notifyCall, setNotifyCall] = useState(false);
  const [notifyUrgentEmail, setNotifyUrgentEmail] = useState(false);
  const [customEmailRecipients, setCustomEmailRecipients] = useState('supervisao@smartflow.ai, plantao@smartflow.ai');

  // Debounced address calculation state
  const [isCalculatingProximity, setIsCalculatingProximity] = useState(false);

  // If initialEquipmentId was passed, preload data
  useEffect(() => {
    if (!isOpen) return;
    if (initialEquipmentId) {
      const eq = equipments.find(e => e.id === initialEquipmentId);
      if (eq) {
        setSelectedEquipmentId(eq.id);
        setSelectedCustomerId(eq.customerId);
        setEquipmentTag(eq.tag);
        setEquipmentModel(eq.model);
        setEquipmentBrand(eq.manufacturer || 'OTIS');
        setEquipmentType(eq.type);
      }
    }
  }, [isOpen, initialEquipmentId, equipments]);

  // CEP Fast Autofill Lookup (Opcional)
  const handleCepLookup = async (rawCep: string) => {
    setNewCep(rawCep);
    const clean = rawCep.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          const streetStr = data.logradouro ? `${data.logradouro}${data.bairro ? ', ' + data.bairro : ''}` : '';
          if (streetStr) setNewAddress(streetStr);
          if (data.localidade) setNewCity(data.localidade);
          if (data.uf) setNewState(data.uf);
          addToast({
            type: 'success',
            title: 'Endereço Localizado!',
            message: `${data.logradouro || 'Rua'}, ${data.localidade || ''} - ${data.uf || ''}`
          });
        } else {
          addToast({
            type: 'warning',
            title: 'CEP Não Localizado',
            message: 'Digite o endereço e cidade manualmente para encontrar os técnicos.'
          });
        }
      } catch (err) {
        console.warn('ViaCEP offline/fallback:', err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Selected customer resolution
  const currentCustomer = useMemo(() => {
    if (customerMode === 'SEARCH' && selectedCustomerId) {
      return customers.find(c => c.id === selectedCustomerId) || null;
    }
    return null;
  }, [customerMode, selectedCustomerId, customers]);

  // Active address string to use for distance/routing
  const activeAddress = useMemo(() => {
    if (customerMode === 'SEARCH' && currentCustomer) {
      return currentCustomer.address + ', ' + currentCustomer.city;
    }
    return newAddress ? `${newAddress}, ${newCity}` : '';
  }, [customerMode, currentCustomer, newAddress, newCity]);

  // Customers filtered by query (Search by Name, CNPJ, Address, Building)
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers.slice(0, 5);
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.documentNumber && c.documentNumber.toLowerCase().includes(q)) ||
      (c.buildingName && c.buildingName.toLowerCase().includes(q)) ||
      c.address.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  // Sync severity automation
  useEffect(() => {
    if (!isOpen) return;
    const sev = SEVERITY_LEVELS[severityLevel];
    if (sev) {
      setNotifyApp(sev.autoNotification.appPush);
      setNotifyCall(sev.autoNotification.phoneCall);
      setNotifyUrgentEmail(sev.autoNotification.urgentAlertEmail);
    }
    if (severityLevel === 5) {
      setHasTrappedPassenger(true);
      setIsCarStopped(true);
    } else if (severityLevel === 0) {
      setHasTrappedPassenger(false);
      setIsCarStopped(false);
    }
  }, [isOpen, severityLevel]);

  // Fake geocoding debounce feedback when address changes
  useEffect(() => {
    if (!isOpen) return;
    if (activeAddress.trim().length > 4) {
      setIsCalculatingProximity(true);
      const t = setTimeout(() => {
        setIsCalculatingProximity(false);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [isOpen, activeAddress]);

  // Find current targeted equipment (if any selected or matched)
  const currentTargetEquipment = useMemo(() => {
    if (selectedEquipmentId) {
      return equipments.find(e => e.id === selectedEquipmentId) || null;
    }
    if (currentCustomer) {
      return equipments.find(e => e.customerId === currentCustomer.id) || null;
    }
    if (activeAddress.trim()) {
      return equipments.find(e => e.address.toLowerCase().includes(activeAddress.toLowerCase().trim())) || null;
    }
    return null;
  }, [selectedEquipmentId, currentCustomer, activeAddress, equipments]);

  // Address fixation suggestion
  const addressFixationSuggestion = useMemo(() => {
    const addressToUse = activeAddress.trim() || 'Av. Iguatemi, 777';
    const buildingToUse = currentCustomer?.buildingName || newBuildingName || 'Edifício Corporativo';
    const eqsAtAddress = equipments.filter(e => e.address.toLowerCase().includes(addressToUse.toLowerCase()));
    return getAddressFixationSuggestion(
      addressToUse,
      buildingToUse,
      eqsAtAddress,
      technicians,
      fixedAddressTechnicians
    );
  }, [activeAddress, currentCustomer, newBuildingName, equipments, technicians, fixedAddressTechnicians]);

  // Calculate Nearest and Most Skilled Technicians & Urgency of Current Calls
  const rankedTechnicians = useMemo(() => {
    return technicians.map((tech) => {
      const targetCity = (customerMode === 'SEARCH' && currentCustomer ? currentCustomer.city : newCity).toLowerCase();
      
      // 1. Real Geodesic Haversine Distance
      let baseDistance = 5.5;
      const targetLat = currentTargetEquipment?.lat || (targetCity.includes('campinas') ? -22.8930 : targetCity.includes('bernardo') ? -23.6912 : -23.5850);
      const targetLng = currentTargetEquipment?.lng || (targetCity.includes('campinas') ? -47.0255 : targetCity.includes('bernardo') ? -46.5490 : -46.6600);

      if (tech.currentLocation?.lat && tech.currentLocation?.lng) {
        baseDistance = calculateDistanceKm(tech.currentLocation.lat, tech.currentLocation.lng, targetLat, targetLng);
      } else if (targetCity === tech.city.toLowerCase()) {
        baseDistance = 4.2;
      } else {
        baseDistance = 26.0;
      }

      // 2. Real-time Traffic Calculation
      const trafficCondition = getRealtimeTrafficCondition(targetCity, baseDistance);
      const { finalEtaMin, delayMin } = calculateEtaWithTraffic(baseDistance, trafficCondition);

      // 3. Equipment Familiarity (Prioritize tech who already knows the equipment)
      const familiarity = checkTechnicianEquipmentFamiliarity(tech, currentTargetEquipment);

      // 4. Preventive vs Emergency Mismatch Detection
      const preventiveMismatch = checkPreventiveMismatch(tech.id, tech.name, currentTargetEquipment);

      // 5. Fixed Resident Technician for this address
      const isFixedResident = Boolean(
        fixedAddressTechnicians[activeAddress.trim()]?.technicianId === tech.id
      );

      // 6. Look up Active Call and its Urgency / Gravity
      const activeCall = calls.find(c =>
        (c.technicianId === tech.id || c.assignedTechnicians?.some(at => at.id === tech.id) || tech.currentCallId === c.id) &&
        c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO'
      );

      let activeCallUrgencyLevel = 0;
      let isExtremeUrgency = false;
      let isHighUrgency = false;
      let activeCallDescription = '';
      let activeCallBuilding = '';
      let activeCallNumber = '';
      let hasTrappedPassengerInCurrent = false;

      if (activeCall) {
        hasTrappedPassengerInCurrent = Boolean(activeCall.hasTrappedPassenger);
        if (activeCall.severityLevel !== undefined) {
          activeCallUrgencyLevel = activeCall.severityLevel;
        } else if (hasTrappedPassengerInCurrent || activeCall.priority === 'CRITICO') {
          activeCallUrgencyLevel = 5;
        } else if (activeCall.priority === 'ALTO') {
          activeCallUrgencyLevel = 4;
        } else if (activeCall.priority === 'MEDIO') {
          activeCallUrgencyLevel = 2;
        } else {
          activeCallUrgencyLevel = 1;
        }

        isExtremeUrgency = activeCallUrgencyLevel >= 5 || hasTrappedPassengerInCurrent || activeCall.priority === 'CRITICO';
        isHighUrgency = activeCallUrgencyLevel === 4 || activeCall.priority === 'ALTO';
        activeCallDescription = activeCall.problemDescription || 'Atendimento em andamento no local';
        activeCallBuilding = activeCall.buildingName || activeCall.customerName || 'Edifício';
        activeCallNumber = activeCall.callNumber;
      }

      // 7. Skill & Brand Matching
      let skillMatches = 0;
      const matchedSpecialties: string[] = [];

      tech.specialties.forEach(spec => {
        const specLower = spec.toLowerCase();
        // Brand check
        if (equipmentBrand === 'OTIS' && (specLower.includes('otis') || specLower.includes('gen2') || specLower.includes('skyrise') || specLower.includes('mcs'))) {
          skillMatches += 2;
          matchedSpecialties.push(spec);
        } else if (equipmentBrand === 'SCHINDLER' && (specLower.includes('schindler') || specLower.includes('3300') || specLower.includes('5500'))) {
          skillMatches += 2;
          matchedSpecialties.push(spec);
        } else if (equipmentBrand === 'TK_ELEVATOR' && (specLower.includes('tk') || specLower.includes('synergy') || specLower.includes('thyssen'))) {
          skillMatches += 2;
          matchedSpecialties.push(spec);
        } else if (equipmentBrand === 'KONE' && (specLower.includes('kone') || specLower.includes('monospace'))) {
          skillMatches += 2;
          matchedSpecialties.push(spec);
        }

        // Equipment Type check
        if ((equipmentType === 'ESCADA_ROLANTE' || equipmentType === 'ESTEIRA_ROLANTE') && (specLower.includes('escada') || specLower.includes('esteira') || specLower.includes('606n') || specLower.includes('510'))) {
          skillMatches += 3;
          matchedSpecialties.push(spec);
        }

        // Building Type check (Hospital / Aeroporto / Shopping)
        if (buildingType === 'HOSPITAL' && (specLower.includes('hospital') || specLower.includes('maca') || specLower.includes('hidráulica'))) {
          skillMatches += 2;
          matchedSpecialties.push(spec);
        }
        if (buildingType === 'AEROPORTO' && (specLower.includes('aeroporto') || specLower.includes('terminais') || specLower.includes('esteiras'))) {
          skillMatches += 2;
          matchedSpecialties.push(spec);
        }
        if (buildingType === 'SHOPPING' && (specLower.includes('shopping') || specLower.includes('escadas') || specLower.includes('portas'))) {
          skillMatches += 2;
          matchedSpecialties.push(spec);
        }

        // General component
        if (mainComponent && specLower.includes(mainComponent.toLowerCase().split(' ')[0])) {
          skillMatches += 1;
          matchedSpecialties.push(spec);
        }
      });

      // 8. Status Score & Protection Adjustments
      let statusBonus = 0;
      if (tech.status === 'DISPONIVEL' && !activeCall) statusBonus = 32;
      else if (tech.status === 'A_CAMINHO' && !isExtremeUrgency) statusBonus = 12;
      else if (activeCall && !isExtremeUrgency && !isHighUrgency) statusBonus = 5;
      else if (isHighUrgency) statusBonus = -10;
      else if (isExtremeUrgency) statusBonus = -70; // Penalize extreme urgency so available techs are prioritized

      // 9. Proximity Score (Haversine Distance weighted)
      const proximityScore = Math.max(0, 35 - baseDistance * 1.3);

      // 10. Familiarity Bonus (+30 if preventive tech, up to +25 if prior interventions, +30 if resident fixed)
      const familiarityBonus = familiarity.scoreBonus + (isFixedResident ? 30 : 0);

      // 11. Total Match Score (0 - 100)
      const totalScore = Math.max(5, Math.min(99, Math.round(
        proximityScore + statusBonus + skillMatches * 7 + familiarityBonus + (tech.slaComplianceRate ? tech.slaComplianceRate * 0.1 : 5)
      )));

      return {
        ...tech,
        calculatedDistanceKm: parseFloat(baseDistance.toFixed(1)),
        calculatedEtaMin: finalEtaMin,
        trafficDelayMin: delayMin,
        trafficCondition,
        familiarity,
        preventiveMismatch,
        isFixedResident,
        matchedSpecialties: Array.from(new Set(matchedSpecialties)),
        matchScore: totalScore,
        activeCall,
        activeCallUrgencyLevel,
        isExtremeUrgency,
        isHighUrgency,
        activeCallDescription,
        activeCallBuilding,
        activeCallNumber,
        hasTrappedPassengerInCurrent
      };
    }).sort((a, b) => {
      // Prioritize non-extreme urgency technicians over technicians in critical rescue calls
      if (a.isExtremeUrgency && !b.isExtremeUrgency) return 1;
      if (!a.isExtremeUrgency && b.isExtremeUrgency) return -1;
      return b.matchScore - a.matchScore;
    });
  }, [technicians, calls, customerMode, currentCustomer, newCity, equipmentBrand, equipmentType, buildingType, mainComponent, currentTargetEquipment, fixedAddressTechnicians, activeAddress]);

  // Filter technicians based on user selected availability tab
  const displayedTechnicians = useMemo(() => {
    return rankedTechnicians.filter(tech => {
      if (techAvailabilityFilter === 'AVAILABLE') {
        return tech.status === 'DISPONIVEL' && !tech.activeCall;
      }
      if (techAvailabilityFilter === 'OCCUPIED') {
        return Boolean(tech.activeCall) && !tech.isExtremeUrgency;
      }
      if (techAvailabilityFilter === 'EXTREME') {
        return tech.isExtremeUrgency;
      }
      return true;
    });
  }, [rankedTechnicians, techAvailabilityFilter]);

  // Pre-select top technician if none selected (preferring available over extreme urgency)
  useEffect(() => {
    if (!isOpen) return;
    if (rankedTechnicians.length > 0 && selectedTechnicians.length === 0) {
      const topSafeCandidate = rankedTechnicians.find(t => !t.isExtremeUrgency) || rankedTechnicians[0];
      if (topSafeCandidate) {
        setSelectedTechnicians([{ id: topSafeCandidate.id, role: 'LEAD' }]);
      }
    }
  }, [isOpen, rankedTechnicians, selectedTechnicians.length]);

  // Toggle or add technician with Extreme Urgency Safeguard
  const toggleTechnician = (tech: any) => {
    const exists = selectedTechnicians.find(t => t.id === tech.id);
    if (exists) {
      if (selectedTechnicians.length === 1) {
        addToast({
          type: 'warning',
          title: 'Mínimo 1 Técnico',
          message: 'É necessário manter ao menos 1 técnico responsável pelo atendimento.'
        });
        return;
      }
      setSelectedTechnicians(prev => prev.filter(t => t.id !== tech.id));
    } else {
      // If technician is currently in an extreme urgency call and protection is active -> prompt confirmation
      if (tech.isExtremeUrgency && protectExtremeUrgent) {
        setConfirmOverrideTech(tech);
        return;
      }

      const role = selectedTechnicians.length === 0 ? 'LEAD' : 'SUPPORT';
      setSelectedTechnicians(prev => [...prev, { id: tech.id, role }]);

      if (tech.isExtremeUrgency) {
        addToast({
          type: 'warning',
          title: 'Atenção: Técnico em Chamado Crítico',
          message: `${tech.name} foi adicionado sob autorização especial, mas está em chamado de Extrema Urgência (${tech.activeCallBuilding}).`
        });
      }
    }
  };

  // Confirm overriding and assigning an extreme urgency technician
  const handleConfirmOverride = () => {
    if (!confirmOverrideTech) return;
    const role = selectedTechnicians.length === 0 ? 'LEAD' : 'SUPPORT';
    setSelectedTechnicians(prev => [...prev, { id: confirmOverrideTech.id, role }]);
    addToast({
      type: 'warning',
      title: '⚠️ Sobrescrita Operacional Confirmada',
      message: `${confirmOverrideTech.name} convocado. Atenção para coordenar a transição do chamado anterior (${confirmOverrideTech.activeCallBuilding}).`
    });
    setConfirmOverrideTech(null);
  };

  // Switch role of technician
  const toggleTechRole = (techId: string) => {
    setSelectedTechnicians(prev =>
      prev.map(t => {
        if (t.id === techId) {
          return { ...t, role: t.role === 'LEAD' ? 'SUPPORT' : 'LEAD' };
        }
        return t;
      })
    );
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let customerIdToUse = selectedCustomerId;
    let customerNameToUse = currentCustomer?.name || '';
    let customerPhoneToUse = currentCustomer?.phone || '(19) 3000-0000';
    let addressToUse = currentCustomer?.address || '';
    let cityToUse = currentCustomer?.city || 'Campinas';
    let stateToUse = currentCustomer?.state || 'SP';
    let buildingNameToUse = currentCustomer?.buildingName || 'Edifício';

    // 1. If EMERGENCY Fast Track Mode
    if (customerMode === 'EMERGENCY') {
      if (!newAddress.trim()) {
        addToast({
          type: 'error',
          title: 'Endereço Obrigatório',
          message: 'Por favor preencha o Endereço ou digite o CEP da ocorrência para despachar o técnico.'
        });
        return;
      }

      const generatedName = newCustomerName.trim() || newBuildingName.trim() || `Emergência - ${newAddress.split(',')[0].trim() || 'Atendimento Rápido'}`;
      const generatedBuilding = newBuildingName.trim() || generatedName;

      const createdCust = createCustomer({
        name: generatedName,
        documentNumber: newCustomerDoc || 'CADASTRO-EXPRESSO',
        phone: newCustomerPhone || '(19) 193-EMERG',
        buildingName: generatedBuilding,
        address: newAddress,
        city: newCity || 'Campinas',
        state: newState || 'SP',
        isCorporate: buildingType !== 'PREDIO_RESIDENCIAL'
      });

      customerIdToUse = createdCust.id;
      customerNameToUse = createdCust.name;
      customerPhoneToUse = createdCust.phone;
      addressToUse = createdCust.address;
      cityToUse = createdCust.city;
      stateToUse = createdCust.state;
      buildingNameToUse = createdCust.buildingName || createdCust.name;
    }
    // 2. If Regular New Customer Registration
    else if (customerMode === 'REGISTER') {
      if (!newAddress.trim() && !newCustomerName.trim()) {
        addToast({
          type: 'error',
          title: 'Dados Incompletos',
          message: 'Por favor preencha ao menos o Endereço ou Nome do Local para continuar.'
        });
        return;
      }

      const effectiveName = newCustomerName.trim() || newBuildingName.trim() || `Cliente - ${newAddress.split(',')[0].trim() || 'Novo Cadastro'}`;
      const effectiveBuilding = newBuildingName.trim() || effectiveName;

      const createdCust = createCustomer({
        name: effectiveName,
        documentNumber: newCustomerDoc || 'CAD-NOVO',
        phone: newCustomerPhone || '(19) 3755-9000',
        buildingName: effectiveBuilding,
        address: newAddress || 'Endereço a confirmar no local',
        city: newCity || 'Campinas',
        state: newState || 'SP',
        isCorporate: buildingType !== 'PREDIO_RESIDENCIAL'
      });

      customerIdToUse = createdCust.id;
      customerNameToUse = createdCust.name;
      customerPhoneToUse = createdCust.phone;
      addressToUse = createdCust.address;
      cityToUse = createdCust.city;
      stateToUse = createdCust.state;
      buildingNameToUse = createdCust.buildingName || createdCust.name;
    } 
    // 3. Search Mode
    else {
      if (!currentCustomer) {
        addToast({
          type: 'warning',
          title: 'Selecione um Cliente',
          message: 'Busque e selecione um cliente existente ou clique em Chamado Emergencial / Cadastrar Novo Cliente.'
        });
        return;
      }
    }

    // Equipment Tag (Opcional - com fallback automático)
    const eqTagToUse = equipmentTag.trim() || (customerMode === 'EMERGENCY' 
      ? `EMERG-${Math.floor(100 + Math.random() * 900)}` 
      : `EQ-${equipmentBrand.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`);

    // Componente Principal (Opcional - com fallback)
    const effectiveComponent = mainComponent || 'Geral / Diagnóstico no Local';

    // Prepare assigned technicians payload
    const assignedTechsPayload = selectedTechnicians.map(st => {
      const fullTech = (rankedTechnicians.find(t => t.id === st.id) || technicians.find(t => t.id === st.id)) as any;
      return {
        id: st.id,
        name: fullTech?.name || 'Técnico Despachado',
        phone: fullTech?.phone || '(19) 98822-1010',
        role: st.role,
        specialties: (fullTech?.specialties as string[]) || [],
        distanceKm: typeof fullTech?.calculatedDistanceKm === 'number' ? fullTech.calculatedDistanceKm : 3.2,
        etaMinutes: typeof fullTech?.calculatedEtaMin === 'number' ? fullTech.calculatedEtaMin : 15,
        matchScore: typeof fullTech?.matchScore === 'number' ? fullTech.matchScore : 98
      };
    });

    const leadTech = assignedTechsPayload.find(t => t.role === 'LEAD') || assignedTechsPayload[0] || (rankedTechnicians[0] ? {
      id: rankedTechnicians[0].id,
      name: rankedTechnicians[0].name,
      phone: rankedTechnicians[0].phone,
      role: 'LEAD',
      specialties: rankedTechnicians[0].specialties,
      distanceKm: rankedTechnicians[0].calculatedDistanceKm,
      etaMinutes: rankedTechnicians[0].calculatedEtaMin,
      matchScore: rankedTechnicians[0].matchScore
    } : undefined);

    // Create call with SLA & Severity reduced logic
    createNewCall({
      origin,
      severityLevel,
      equipmentBrand,
      buildingType,
      equipmentType,
      customerId: customerIdToUse || undefined,
      customerName: customerNameToUse,
      customerPhone: customerPhoneToUse,
      buildingName: buildingNameToUse,
      address: addressToUse,
      city: cityToUse,
      state: stateToUse,
      equipmentTag: eqTagToUse,
      equipmentModel,
      problemDescription: problemDescription || (customerMode === 'EMERGENCY' 
        ? `CHAMADO EMERGENCIAL EXPRESSO (SLA 15-20 min) registrado no ${buildingNameToUse}.` 
        : `Ocorrência de gravidade nível ${severityLevel} registrada no ${buildingNameToUse}.`),
      mainComponent: effectiveComponent,
      hasTrappedPassenger,
      isCarStopped,
      technicianId: leadTech?.id,
      technicianName: leadTech?.name,
      assignedTechnicians: assignedTechsPayload.length > 0 ? assignedTechsPayload : (leadTech ? [leadTech as any] : []),
      notificationMethod: {
        appPush: notifyApp,
        phoneCall: notifyCall,
        urgentAlertEmail: notifyUrgentEmail,
        sentTimestamp: new Date().toISOString(),
        emailRecipients: notifyUrgentEmail ? customEmailRecipients.split(',').map(e => e.trim()) : []
      }
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Abertura Inteligente de Chamado
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SmartFlow Dispatch & Proximity Engine
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                Novo Chamado Operacional
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar flex-1">

          {/* STEP 1: CLIENT SELECTION OR REGISTRATION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center border border-cyan-500/30">
                  1
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Identificação do Cliente e Localização
                </h3>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCustomerMode('SEARCH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    customerMode === 'SEARCH'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Buscar por Nome, CNPJ ou Endereço</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('REGISTER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    customerMode === 'REGISTER'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar Novo Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('EMERGENCY');
                    setSeverityLevel(5);
                    setHasTrappedPassenger(true);
                    setIsCarStopped(true);
                    setNotifyApp(true);
                    setNotifyCall(true);
                    setNotifyUrgentEmail(true);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    customerMode === 'EMERGENCY'
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400'
                      : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-500/40'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>🚨 Chamado Emergencial</span>
                </button>
              </div>
            </div>

            {/* If EMERGENCY Fast Track Mode */}
            {customerMode === 'EMERGENCY' && (
              <div className="space-y-4 bg-gradient-to-br from-rose-950/40 via-slate-950/80 to-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-rose-500/60 shadow-xl shadow-rose-950/30 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-rose-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-black animate-pulse">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-rose-200 uppercase tracking-wide">
                        Modo Chamado Emergencial — Cadastro Rápido Expresso
                      </h4>
                      <p className="text-[11px] text-rose-300/80">
                        Basta preencher o Endereço ou CEP (opcional). O sistema cadastra e despacha imediatamente com SLA reduzido (15-20 min).
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-rose-500 text-white font-extrabold text-[11px] shadow-sm animate-pulse">
                    ⚡ SLA 15-20 MIN • ALERTA MÁXIMO
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* CEP (Opcional com busca automática) */}
                  <div>
                    <label className="block text-[11px] font-bold text-rose-200 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>CEP (Opcional)</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Autopreenchimento</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newCep}
                        onChange={e => handleCepLookup(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                      {isLoadingCep && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyan-400 animate-spin">
                          ⌛
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Endereço Completo (Rua, Número, Bairro) */}
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-bold text-rose-200 uppercase tracking-wider mb-1">
                      Endereço da Ocorrência (Rua, Número, Bairro) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                      placeholder="Ex: Av. Iguatemi, 777 - Vila Brandina ou digitar CEP ao lado"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border-2 border-rose-500/70 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-400 font-medium placeholder-slate-500"
                    />
                  </div>

                  {/* Nome do Local / Edifício (Opcional) */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Nome do Edifício / Local (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newBuildingName}
                      onChange={e => {
                        setNewBuildingName(e.target.value);
                        if (!newCustomerName) setNewCustomerName(e.target.value);
                      }}
                      placeholder="Ex: Condomínio Solar ou gerado automático"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Contato / Telefone (Opcional) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Telefone / Portaria (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newCustomerPhone}
                      onChange={e => setNewCustomerPhone(e.target.value)}
                      placeholder="(19) 99887-6543"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      placeholder="Campinas"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If SEARCH Mode */}
            {customerMode === 'SEARCH' && (
              <div className="space-y-3 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Digite o Nome do Cliente, Razão Social, CNPJ, Edifício ou Endereço..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  />
                </div>

                {/* Search Results Dropdown/List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {filteredCustomers.map(cust => {
                    const isSelected = selectedCustomerId === cust.id;
                    return (
                      <div
                        key={cust.id}
                        onClick={() => {
                          setSelectedCustomerId(cust.id);
                          // Auto fill customer's first equipment if exists
                          const custEqs = equipments.filter(e => e.customerId === cust.id);
                          if (custEqs.length > 0) {
                            setSelectedEquipmentId(custEqs[0].id);
                            setEquipmentTag(custEqs[0].tag);
                            setEquipmentModel(custEqs[0].model);
                            setEquipmentBrand(custEqs[0].manufacturer || 'OTIS');
                            setEquipmentType(custEqs[0].type);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-white text-xs sm:text-sm truncate">
                              {cust.name}
                            </div>
                            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                              {cust.buildingName || cust.groupName || 'Condomínio'}
                              {cust.documentNumber && ` • CNPJ: ${cust.documentNumber}`}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                              <span>{cust.address}, {cust.city} - {cust.state}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredCustomers.length === 0 && (
                    <div className="col-span-2 text-center py-6 text-slate-400 text-xs bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                      Nenhum cliente encontrado com estes termos.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerMode('REGISTER');
                          setNewCustomerName(searchQuery);
                        }}
                        className="text-cyan-400 underline font-bold ml-1 hover:text-cyan-300 cursor-pointer"
                      >
                        Cadastrar novo cliente
                      </button>
                      {' '}ou{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerMode('EMERGENCY');
                          setSeverityLevel(5);
                        }}
                        className="text-rose-400 underline font-bold ml-1 hover:text-rose-300 cursor-pointer"
                      >
                        Abrir Chamado Emergencial
                      </button>
                    </div>
                  )}
                </div>

                {/* Display Selected Customer Details */}
                {currentCustomer && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-slate-400">Cliente Selecionado:</span>{' '}
                        <strong className="text-white">{currentCustomer.name}</strong>
                        <span className="text-slate-500 font-mono ml-2">({currentCustomer.phone})</span>
                      </div>
                    </div>
                    <div className="text-slate-300 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{currentCustomer.address}, {currentCustomer.city} - {currentCustomer.state}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If REGISTER Mode */}
            {customerMode === 'REGISTER' && (
              <div className="space-y-4 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>Cadastrando Novo Cliente e Endereço no Sistema</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode('EMERGENCY');
                      setSeverityLevel(5);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>⚡ Modo Emergencial Rápido</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* CEP (Opcional com busca automática) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>CEP (Opcional)</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Busca Rápida</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newCep}
                        onChange={e => handleCepLookup(e.target.value)}
                        placeholder="00000-000 (Opcional)"
                        maxLength={9}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                      {isLoadingCep && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyan-400 animate-spin">
                          ⌛
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Nome / Razão Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustomerName}
                      onChange={e => setNewCustomerName(e.target.value)}
                      placeholder="Ex: Condomínio Grand Plaza"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      CNPJ / CPF (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newCustomerDoc}
                      onChange={e => setNewCustomerDoc(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Telefone de Contato / Síndico
                    </label>
                    <input
                      type="text"
                      value={newCustomerPhone}
                      onChange={e => setNewCustomerPhone(e.target.value)}
                      placeholder="(19) 99887-6543"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Endereço Completo (Rua, Número, Bairro) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                      placeholder="Ex: Av. José de Souza Campos, 1200 - Cambuí"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Nome do Edifício / Bloco
                    </label>
                    <input
                      type="text"
                      value={newBuildingName}
                      onChange={e => setNewBuildingName(e.target.value)}
                      placeholder="Ex: Torre Corporate A"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      placeholder="Campinas"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Estado (UF)
                    </label>
                    <select
                      value={newState}
                      onChange={e => setNewState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="SP">SP - São Paulo</option>
                      <option value="RJ">RJ - Rio de Janeiro</option>
                      <option value="MG">MG - Minas Gerais</option>
                      <option value="PR">PR - Paraná</option>
                      <option value="RS">RS - Rio Grande do Sul</option>
                      <option value="DF">DF - Distrito Federal</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: GRAVITY SCALE (0 to 5) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center border border-amber-500/30">
                  2
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Classificação de Gravidade da Ocorrência (Escala 0 a 5)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Gravidade Selecionada: <strong className="text-cyan-300 font-bold">Nível {severityLevel}</strong>
              </span>
            </div>

            {/* Interactive 0 - 5 Scale Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
              {SEVERITY_LEVELS.map(sev => {
                const isSelected = severityLevel === sev.level;
                return (
                  <button
                    key={sev.level}
                    type="button"
                    onClick={() => setSeverityLevel(sev.level)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all relative cursor-pointer ${
                      isSelected
                        ? `${sev.color} ring-2 ring-cyan-400 shadow-lg scale-[1.02]`
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl font-black mb-1">
                      {sev.level}
                    </div>
                    <div className="text-[11px] font-bold tracking-tight line-clamp-1">
                      {sev.title.split('/')[0]}
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5">
                      SLA: {sev.sla}
                    </div>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Severity Description Card */}
            {SEVERITY_LEVELS[severityLevel] && (
              <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 ${SEVERITY_LEVELS[severityLevel].color}`}>
                <div className="p-2 rounded-xl bg-slate-950/40 shrink-0">
                  {severityLevel >= 4 ? (
                    <Flame className="w-5 h-5 text-rose-400 animate-bounce" />
                  ) : severityLevel >= 3 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-white">
                      Nível {severityLevel} — {SEVERITY_LEVELS[severityLevel].title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${SEVERITY_LEVELS[severityLevel].badgeColor}`}>
                      SLA Máximo: {SEVERITY_LEVELS[severityLevel].sla}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">
                    {SEVERITY_LEVELS[severityLevel].description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: EQUIPMENT BRAND, BUILDING TYPE & EQUIPMENT TYPE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/30">
                3
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Especificações Técnicas: Marca, Local e Equipamento
              </h3>
            </div>

            {/* 3.1 Equipment Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Qual a marca do equipamento?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {BRAND_OPTIONS.map(brand => {
                  const isSelected = equipmentBrand === brand.id;
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setEquipmentBrand(brand.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-extrabold shadow-md ring-1 ring-cyan-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{brand.name}</div>
                      {brand.isOriginal && (
                        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-1 rounded block mt-0.5">
                          Original Otis
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3.2 Building Type / Local */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Tipo de Edificação / Local de Atendimento:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {BUILDING_TYPES.map(bt => {
                  const isSelected = buildingType === bt.id;
                  const IconComp = bt.icon;
                  return (
                    <button
                      key={bt.id}
                      type="button"
                      onClick={() => setBuildingType(bt.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? `${bt.color} ring-1 ring-current font-bold shadow-md`
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{bt.name}</div>
                        {bt.alert && (
                          <div className="text-[10px] opacity-85 font-mono">{bt.alert}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3.3 Equipment Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Tipo de Equipamento:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {EQUIPMENT_TYPES.map(eq => {
                  const isSelected = equipmentType === eq.id;
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => setEquipmentType(eq.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold ring-1 ring-cyan-500 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="text-2xl mb-1">{eq.icon}</div>
                      <div className="text-xs font-bold leading-tight">{eq.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem & Origin row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Origem do Chamado
                </label>
                <select
                  value={origin}
                  onChange={e => setOrigin(e.target.value as CallOrigin)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="TELEFONE">📞 Telefone / Central 24/7</option>
                  <option value="WHATSAPP">💬 WhatsApp Oficial</option>
                  <option value="PORTAL">🌐 Portal do Cliente</option>
                  <option value="IOT_TELEMETRIA">📡 IoT Telemetria SmartFlow</option>
                  <option value="SISTEMA">💻 Sistema Interno</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Componente Principal (Opcional)
                </label>
                <select
                  value={mainComponent}
                  onChange={e => setMainComponent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Geral / Diagnóstico no Local">Geral / Diagnóstico no Local (Padrão)</option>
                  <option value="Sistema de Portas">Portas e Operador AT120</option>
                  <option value="Quadro de Comando">Quadro de Comando & GECB</option>
                  <option value="Máquina de Tração">Máquina de Tração / ReGen</option>
                  <option value="Escadas e Esteiras">Pente / Degrau / Corrimão</option>
                  <option value="Segurança e Freios">Freio Eletromecânico & Limitador</option>
                  <option value="Cabos e Cintas">Cintas de Tração PU / Cabos</option>
                  <option value="Elétrica e Sinalização">Botoeira / Display / Iluminação</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tag / Identificador (Opcional)
                </label>
                <input
                  type="text"
                  value={equipmentTag}
                  onChange={e => setEquipmentTag(e.target.value)}
                  placeholder="Ex: ELV-01, ESC-02 (Opcional)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descrição do Problema Relatado
                </label>
                <textarea
                  rows={2}
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  placeholder="Ex: Equipamento travou entre o 3º e 4º andar com porta trancada. Alarme sonoro acionado..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: SMART MATCHING TECHNICIANS & MULTI-TECHNICIAN SELECTION WITH REAL-TIME STATUS & URGENCY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                  4
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Técnicos & Situação Operacional em Tempo Real
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {selectedTechnicians.length} técnico(s) selecionado(s) para este atendimento
              </span>
            </div>

            {/* Address Feedback & Proximity Status */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2 text-slate-300 truncate">
                <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Rota calculada para:{' '}
                  <strong className="text-white">
                    {activeAddress || 'Centro Operacional (Campinas/SP)'}
                  </strong>
                </span>
              </div>
              {isCalculatingProximity ? (
                <span className="text-cyan-400 font-mono flex items-center gap-1.5 animate-pulse text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Recalculando rotas, situação dos técnicos e compatibilidade de skills...
                </span>
              ) : (
                <span className="text-emerald-400 font-mono text-[11px] font-bold">
                  ✓ Proximidade (KM/ETA), status do chamado atual e skills analisados
                </span>
              )}
            </div>

            {/* Protection Safeguard Bar & Filter Toolbar */}
            <div className="space-y-2.5">
              {/* Extreme Urgency Safeguard Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${protectExtremeUrgent ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    {protectExtremeUrgent ? <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" /> : <ShieldCheck className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span>Proteção de Técnicos em Extrema Urgência</span>
                      {protectExtremeUrgent ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Proteção Ativa
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-800 text-slate-400">
                          Desativada
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Evita acionamento acidental de técnicos que já estejam em atendimento de Resgate de Passageiro ou Ocorrência Nível 5.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setProtectExtremeUrgent(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                    protectExtremeUrgent
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {protectExtremeUrgent ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{protectExtremeUrgent ? 'Proteção Ativada' : 'Ativar Proteção'}</span>
                </button>
              </div>

              {/* Address-based Resident Technician Suggestion Banner */}
              {addressFixationSuggestion.shouldSuggestFixation && addressFixationSuggestion.suggestedTech && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-blue-950/50 to-slate-900 border border-cyan-500/40 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                        <span>Sugestão de Fixação por Endereço</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300">Otimização TA</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                        {addressFixationSuggestion.reason}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fixTechnicianToAddress(
                      activeAddress.trim(),
                      currentCustomer?.buildingName || newBuildingName || 'Edifício',
                      addressFixationSuggestion.suggestedTech!.id,
                      addressFixationSuggestion.suggestedTech!.name
                    )}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Fixar {addressFixationSuggestion.suggestedTech.name.split(' ')[0]} como Residente</span>
                  </button>
                </div>
              )}

              {/* Address Already Fixed Notice */}
              {addressFixationSuggestion.hasFixedTech && (
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Técnico residente prioritário fixado para este endereço: <strong>{addressFixationSuggestion.fixedTech?.technicianName}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => unfixTechnicianFromAddress(activeAddress.trim())}
                    className="text-[10px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                  >
                    Desafixar Técnico
                  </button>
                </div>
              )}

              {/* Filter Tabs by Availability */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setTechAvailabilityFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    techAvailabilityFilter === 'ALL'
                      ? 'bg-slate-200 text-slate-950 shadow-sm'
                      : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({rankedTechnicians.length})
                </button>

                <button
                  type="button"
                  onClick={() => setTechAvailabilityFilter('AVAILABLE')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    techAvailabilityFilter === 'AVAILABLE'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950/70 border border-slate-800 text-emerald-400 hover:bg-emerald-950/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>🟢 Livres / Disponíveis ({rankedTechnicians.filter(t => t.status === 'DISPONIVEL' && !t.activeCall).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTechAvailabilityFilter('OCCUPIED')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    techAvailabilityFilter === 'OCCUPIED'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950/70 border border-slate-800 text-sky-400 hover:bg-sky-950/20'
                  }`}
                >
                  <Wrench className="w-3 h-3" />
                  <span>🔧 Em Atendimento Normal ({rankedTechnicians.filter(t => Boolean(t.activeCall) && !t.isExtremeUrgency).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTechAvailabilityFilter('EXTREME')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    techAvailabilityFilter === 'EXTREME'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-950/70 border border-slate-800 text-rose-400 hover:bg-rose-950/20'
                  }`}
                >
                  <AlertOctagon className="w-3 h-3 text-rose-400" />
                  <span>🚨 Em Extrema Urgência ({rankedTechnicians.filter(t => t.isExtremeUrgency).length})</span>
                </button>
              </div>
            </div>

            {/* Technicians Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedTechnicians.slice(0, 8).map((tech, index) => {
                const isSelected = selectedTechnicians.some(t => t.id === tech.id);
                const assignedRole = selectedTechnicians.find(t => t.id === tech.id)?.role;
                const isTopRanked = index === 0 && !tech.isExtremeUrgency;

                return (
                  <div
                    key={tech.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? tech.isExtremeUrgency
                          ? 'bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border-rose-500 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500'
                          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500'
                        : tech.isExtremeUrgency
                        ? 'bg-gradient-to-b from-slate-950/90 to-rose-950/20 border-rose-900/60 hover:border-rose-700/80'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Header with Avatar, Name, Distance and Match */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={tech.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={tech.name}
                            className={`w-12 h-12 rounded-xl object-cover border ${
                              tech.isExtremeUrgency ? 'border-rose-500' : 'border-slate-700'
                            }`}
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                              tech.isExtremeUrgency
                                ? 'bg-rose-500 animate-pulse'
                                : tech.status === 'DISPONIVEL' && !tech.activeCall
                                ? 'bg-emerald-400'
                                : tech.status === 'A_CAMINHO'
                                ? 'bg-cyan-400'
                                : 'bg-amber-400'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-white text-sm">{tech.name}</h4>
                            {isTopRanked && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                                <Award className="w-2.5 h-2.5" /> Mais Indicado
                              </span>
                            )}
                            {tech.isExtremeUrgency && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-500/30 text-rose-300 border border-rose-500/50 flex items-center gap-0.5">
                                <AlertOctagon className="w-2.5 h-2.5 text-rose-400" /> Resgate / Crítico
                              </span>
                            )}
                            {tech.familiarity?.knowsEquipment && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-0.5" title={tech.familiarity.reason}>
                                ⭐ Conhece o Ativo ({tech.familiarity.priorVisitsCount}x)
                              </span>
                            )}
                            {tech.isFixedResident && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-0.5">
                                📍 Residente Fixado
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-cyan-300 font-mono font-bold">
                              📍 {tech.calculatedDistanceKm} km
                            </span>
                            <span>•</span>
                            <span className="text-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              ETA: <strong>{tech.calculatedEtaMin} min</strong>
                            </span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              tech.trafficCondition.level === 'LIVRE' 
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                                : tech.trafficCondition.level === 'MODERADO'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`} title={tech.trafficCondition.description}>
                              🚦 {tech.trafficCondition.label}{tech.trafficDelayMin > 0 ? ` (+${tech.trafficDelayMin}m)` : ''}
                            </span>
                          </div>

                          {/* Preventive Mismatch Warning */}
                          {tech.preventiveMismatch?.isMismatch && (severityLevel >= 3 || hasTrappedPassenger) && (
                            <div className="mt-1.5 p-1.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[10px] text-amber-200 flex items-start gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                              <span>
                                Técnico da preventiva deste ativo: <strong>{tech.preventiveMismatch.preventiveTechName}</strong> ≠ Chamado emergencial
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="text-right shrink-0">
                        <div className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold shadow-inner ${
                          tech.isExtremeUrgency
                            ? 'bg-rose-950/80 border-rose-700/60 text-rose-300'
                            : 'bg-slate-900 border-slate-700 text-cyan-300'
                        }`}>
                          {tech.matchScore}% Match
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          SLA {tech.slaComplianceRate}%
                        </div>
                      </div>
                    </div>

                    {/* SITUAÇÃO OPERACIONAL & URGÊNCIA DO CHAMADO ATUAL */}
                    <div>
                      {tech.status === 'DISPONIVEL' && !tech.activeCall ? (
                        <div className="p-2 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Situação: Livre & Disponível</span>
                          </div>
                          <span className="text-[10px] text-emerald-400/90 font-mono">
                            ✓ Pronto para atendimento
                          </span>
                        </div>
                      ) : tech.isExtremeUrgency ? (
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-950/90 via-red-950/80 to-slate-950 border border-rose-500/80 shadow-md shadow-rose-950/40 space-y-1.5">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <div className="flex items-center gap-1.5 text-rose-300 font-black text-[11px]">
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                              <span>EM CHAMADO: EXTREMA URGÊNCIA (NÍVEL 5)</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-bold shadow-xs">
                              {tech.activeCallNumber || 'CH-CRÍTICO'}
                            </span>
                          </div>
                          <div className="text-[11px] text-rose-200">
                            <span className="font-semibold text-rose-300">🏢 Local:</span> <strong>{tech.activeCallBuilding}</strong>
                          </div>
                          <div className="text-[10px] text-rose-300/95 bg-rose-950/60 p-1.5 rounded-lg border border-rose-800/40 leading-snug">
                            <span className="font-bold text-rose-200">⚠️ Ocorrência:</span> {tech.activeCallDescription}
                          </div>
                          <div className="text-[10px] text-rose-300 flex items-center gap-1 font-bold pt-0.5">
                            <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>Não recomendável chamar (risco de interromper resgate).</span>
                          </div>
                        </div>
                      ) : tech.isHighUrgency ? (
                        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/50 space-y-1 text-xs">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Em Atendimento de Alta Urgência (Nível 4)</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-200 font-mono text-[9px]">
                              {tech.activeCallNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-amber-200/90 truncate">
                            🏢 <strong>{tech.activeCallBuilding}</strong>: {tech.activeCallDescription}
                          </div>
                        </div>
                      ) : tech.activeCall ? (
                        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300 truncate">
                            <Wrench className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="truncate text-[11px]">
                              Em Atendimento (Nível {tech.activeCallUrgencyLevel}) • <strong>{tech.activeCallBuilding}</strong>
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            Pode remanejar
                          </span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-cyan-300 text-[11px]">
                            <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Em Deslocamento (GPS Ativo)</span>
                          </div>
                          <span className="text-[10px] text-cyan-400/90 font-mono">
                            A Caminho
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Skills & Specialties Badges */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Skills & Certificações:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tech.specialties.map(spec => {
                          const isMatched = tech.matchedSpecialties.includes(spec);
                          return (
                            <span
                              key={spec}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                isMatched
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800'
                              }`}
                            >
                              {spec}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions: Add / Remove / Role Toggle */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => toggleTechRole(tech.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              assignedRole === 'LEAD'
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                                : 'bg-slate-900 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            Papel: {assignedRole === 'LEAD' ? '⭐ Técnico Líder' : '🤝 Apoio Técnico'}
                          </button>
                        )}
                        <a
                          href={`tel:${tech.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span className="font-mono">{tech.phone}</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleTechnician(tech)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                            : tech.isExtremeUrgency
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/60 hover:bg-rose-900 hover:text-white shadow-md'
                            : 'bg-cyan-500 text-slate-950 font-extrabold hover:bg-cyan-400 shadow-md'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </>
                        ) : tech.isExtremeUrgency ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                            <span>Em Resgate (Sobrescrever)</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar ao Chamado</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONFIRMATION SAFEGUARD MODAL FOR EXTREME URGENCY TECHNICIAN OVERRIDE */}
          {confirmOverrideTech && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-rose-950/60 relative overflow-hidden">
                {/* Header Hazard Banner */}
                <div className="flex items-center gap-3 text-rose-400">
                  <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 animate-pulse">
                    <AlertOctagon className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wide">
                      Alerta: Técnico em Atendimento de Extrema Urgência
                    </h3>
                    <p className="text-xs text-rose-300 font-semibold">
                      Operação de Resgate / Gravidade Nível 5 em andamento
                    </p>
                  </div>
                </div>

                {/* Details of the technician's current critical call */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-rose-900/60 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Técnico Selecionado:</span>
                    <span className="font-bold text-white text-sm">{confirmOverrideTech.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Chamado em Andamento:</span>
                    <span className="font-mono font-bold text-rose-300">{confirmOverrideTech.activeCallNumber || 'CH-CRÍTICO'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Local do Chamado:</span>
                    <span className="font-bold text-slate-200">{confirmOverrideTech.activeCallBuilding}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Ocorrência em Execução:</span>
                    <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 font-medium leading-relaxed">
                      {confirmOverrideTech.activeCallDescription}
                    </div>
                  </div>
                </div>

                {/* Impact warning message */}
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Atenção:</strong> Chamar este técnico pode interromper o salvamento de passageiros presos ou violar SLA crítico de segurança. Recomenda-se manter o técnico no resgate e selecionar outro profissional disponível.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmOverrideTech(null)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Manter no Resgate (Recomendado)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmOverride}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Sobrescrever e Despachar Mesmo Assim</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: NOTIFICATIONS & DISPATCH AUTOMATION */}
          <div className="space-y-4 bg-slate-950/70 p-4 sm:p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center border border-purple-500/30">
                  5
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Despacho & Notificações de Alerta (Automatizado por Gravidade)
                </h3>
              </div>
              <span className="text-[11px] text-purple-300 font-mono">
                Automação ativa para Gravidade Nível {severityLevel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Mobile Push */}
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  notifyApp
                    ? 'bg-cyan-950/30 border-cyan-500/60 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={notifyApp}
                  onChange={e => setNotifyApp(e.target.checked)}
                  className="mt-1 w-4 h-4 text-cyan-500 rounded bg-slate-950 border-slate-700 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Notificar no App Mobile</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Envia alerta imediato no aplicativo do técnico com rota GPS e dados do equipamento.
                  </p>
                </div>
              </label>

              {/* Option 2: Phone Call */}
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  notifyCall
                    ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={notifyCall}
                  onChange={e => setNotifyCall(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-500 rounded bg-slate-950 border-slate-700 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ligar para o Técnico</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dispara acionamento por voz direto para o celular do técnico líder selecionado.
                  </p>
                </div>
              </label>

              {/* Option 3: Urgent Push + Email Audit */}
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  notifyUrgentEmail
                    ? 'bg-rose-950/40 border-rose-500/70 text-rose-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={notifyUrgentEmail}
                  onChange={e => setNotifyUrgentEmail(e.target.checked)}
                  className="mt-1 w-4 h-4 text-rose-500 rounded bg-slate-950 border-slate-700 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-rose-400" />
                    <span>Notificar com Urgência & E-mail</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Notifica celular + dispara e-mail formal com carimbo de SLA para supervisão.
                  </p>
                </div>
              </label>
            </div>

            {notifyUrgentEmail && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs">
                <span className="text-slate-400 whitespace-nowrap">Destinatários do E-mail de Registro:</span>
                <input
                  type="text"
                  value={customEmailRecipients}
                  onChange={e => setCustomEmailRecipients(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Modal Footer / Action Buttons */}
          <div className="pt-3.5 sm:pt-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 sticky bottom-0 bg-slate-900/95 py-3 -mx-4 -mb-4 px-4 sm:-mx-6 sm:-mb-6 sm:px-6 z-10 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-center min-h-[42px] touch-manipulation"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] touch-manipulation"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Abrir Chamado & Despachar Técnico(s)</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
