import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  MapPin,
  Package,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Waves,
  Wind,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// --- DATA STRUCTURES ---

interface SeismicRow {
  id: string;
  unit: string;
  client: string;
  city: string;
  sensorType: string;
  lastReading: string;
  severity: 'P1' | 'P2' | 'P3';
  status: 'PENDENTE' | 'HOMOLOGADO' | 'EM_RETROFIT';
  limitAccel: string;
}

interface PredictivePart {
  id: string;
  client: string;
  city: string;
  part: string;
  hours: number;
  risk: number;
  daysLeft: number;
  status: 'URGENTE' | 'ATENCAO' | 'NORMAL';
  action: string;
}

interface ProcurementItem {
  id: string;
  code: string;
  part: string;
  qty: number;
  unit: string;
  cities: string[];
  supplier: string;
  discount: number;
  unitPrice: number;
}

interface ScadaSensor {
  tag: string;
  name: string;
  location: string;
  currentValue: string;
  unit: string;
  normalRange: string;
  status: 'OPTIMAL' | 'WARN' | 'ALERT';
  percent: number;
}

interface ScadaLog {
  timestamp: string;
  code: string;
  severity: 'CRIT' | 'WARN' | 'INFO';
  device: string;
  message: string;
}

export const FutureIoTModule: React.FC = () => {
  const { addToast } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'seismic' | 'regen' | 'predictive' | 'contract' | 'scada'>('seismic');

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const str = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(str + ' UTC-3');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // TAB 1: CANVAS SISMÓGRAFO & GAUGE MARESIA
  // ==========================================
  const seismographCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const humidityGaugeRef = useRef<HTMLCanvasElement | null>(null);

  // Seismograph Animation
  useEffect(() => {
    if (activeTab !== 'seismic') return;
    const canvas = seismographCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let xOffset = 0;

    const renderWave = () => {
      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 0; y < h; y += 24) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      for (let x = 0; x < w; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      ctx.stroke();

      // Waveform
      ctx.strokeStyle = '#f59e0b'; // Amber Neon
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.beginPath();

      xOffset += 0.04;

      for (let x = 0; x < w; x++) {
        const freq1 = Math.sin((x * 0.03) + xOffset);
        const freq2 = Math.cos((x * 0.07) - xOffset);
        let spike = 0;

        // Wave spikes (5.2 Mw simulation)
        if ((x + Math.floor(xOffset * 15)) % 160 < 35) {
          spike = Math.sin(x * 0.35) * (h * 0.32);
        } else {
          spike = (Math.random() - 0.5) * 5;
        }

        const y = centerY + (freq1 * 6) + (freq2 * 4) + spike;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  // Humidity Gauge
  useEffect(() => {
    if (activeTab !== 'seismic') return;
    const canvas = humidityGaugeRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cX = canvas.width / 2;
    const cY = canvas.height / 2;
    const radius = 38;
    const percentage = 0.88; // 88%

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Track
    ctx.beginPath();
    ctx.arc(cX, cY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 7;
    ctx.stroke();

    // Fill Arc
    const startAngle = -0.5 * Math.PI;
    const endAngle = startAngle + (percentage * 2 * Math.PI);

    ctx.beginPath();
    ctx.arc(cX, cY, radius, startAngle, endAngle);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [activeTab]);

  // Seismic Table Filter
  const [seismicSeverityFilter, setSeismicSeverityFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3'>('ALL');
  const [seismicList, setSeismicList] = useState<SeismicRow[]>([
    { id: 'EQ-CDMX-01', unit: 'Torre Reforma Bank', client: 'Banco Santander México', city: 'Cidade do México (CDMX)', sensorType: 'Acelerômetro Triaxial MEMS P1', lastReading: '0.65 m/s² (Alarme)', severity: 'P1', status: 'PENDENTE', limitAccel: '> 0.50 m/s²' },
    { id: 'EQ-CDMX-04', unit: 'Torre Mayor Piso 45', client: 'Fibra Uno Corporate', city: 'Cidade do México (CDMX)', sensorType: 'Sensor Sísmico Magnético P1', lastReading: '0.48 m/s² (Pré-alerta)', severity: 'P1', status: 'PENDENTE', limitAccel: '> 0.50 m/s²' },
    { id: 'EQ-OAX-02', unit: 'Hospital Civil Oaxaca', client: 'Secretaría de Salud MX', city: 'Oaxaca de Juárez (OAX)', sensorType: 'Sensor Sísmico Triaxial Integrado P2', lastReading: '0.38 m/s² (Normal)', severity: 'P2', status: 'EM_RETROFIT', limitAccel: '> 0.40 m/s²' },
    { id: 'EQ-PUE-07', unit: 'Centro Financiero Angelópolis', client: 'Inmobiliaria Angelópolis', city: 'Puebla (PUE)', sensorType: 'Acelerômetro Piezoelétrico P2', lastReading: '0.22 m/s² (Estável)', severity: 'P2', status: 'HOMOLOGADO', limitAccel: '> 0.40 m/s²' },
    { id: 'EQ-SP-901', unit: 'Edifício Infinity Tower', client: 'Credit Suisse Real Estate', city: 'São Paulo (SP)', sensorType: 'Vibrometro Triaxial P3 (Vento)', lastReading: '0.08 m/s² (Estático)', severity: 'P3', status: 'HOMOLOGADO', limitAccel: '> 0.25 m/s²' },
    { id: 'EQ-STS-44', unit: 'Terminal Marítimo Concais', client: 'Autoridade Portuária Santos', city: 'Santos (SP)', sensorType: 'Sensor Inclinômetro Dinâmico P3', lastReading: '0.12 m/s² (Ondulação)', severity: 'P3', status: 'HOMOLOGADO', limitAccel: '> 0.30 m/s²' }
  ]);

  const filteredSeismicList = useMemo(() => {
    if (seismicSeverityFilter === 'ALL') return seismicList;
    return seismicList.filter(s => s.severity === seismicSeverityFilter);
  }, [seismicList, seismicSeverityFilter]);

  const handleRetrofitAction = (id: string) => {
    setSeismicList(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'PENDENTE' ? 'EM_RETROFIT' : 'HOMOLOGADO';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
    addToast('success', 'Kit de Sensor Sísmico', `Ordem de Serviço de Retrofit acionada para ${id}.`);
  };

  const [isSimulatingSeismic, setIsSimulatingSeismic] = useState(false);
  const handleSimulateSeismicStop = () => {
    setIsSimulatingSeismic(true);
    setTimeout(() => {
      setIsSimulatingSeismic(false);
      addToast(
        'info',
        'Teste Sísmico Concluído',
        'Simulação ASME A17.1 executada: 42 elevadores desaceleraram controladamente para o andar mais próximo em 4.2s com portas abertas com segurança.'
      );
    }, 1800);
  };

  // ==========================================
  // TAB 2: REGEN® TELEMETRY & MULTI-CURRENCY ROI
  // ==========================================
  type CurrencyCode = 'BRL' | 'MXN' | 'USD';
  const [currency, setCurrency] = useState<CurrencyCode>('BRL');
  const currencyConfig: Record<CurrencyCode, { symbol: string; rate: number; defaultTariff: number }> = {
    BRL: { symbol: 'R$', rate: 1.0, defaultTariff: 0.75 },
    MXN: { symbol: '$ MXN', rate: 3.2, defaultTariff: 2.30 },
    USD: { symbol: '$ USD', rate: 0.20, defaultTariff: 0.18 }
  };

  const [dailyTrips, setDailyTrips] = useState<number>(1800);
  const [tariffKwh, setTariffKwh] = useState<number>(currencyConfig.BRL.defaultTariff);

  const handleCurrencyChange = (newCurr: CurrencyCode) => {
    setCurrency(newCurr);
    setTariffKwh(currencyConfig[newCurr].defaultTariff);
  };

  // Calculations
  const regenFinancials = useMemo(() => {
    const kwhSavedPerTrip = 0.015;
    const elevatorsCount = 5; // frota média por condomínio corporativo
    const dailyKwhSaved = dailyTrips * kwhSavedPerTrip * elevatorsCount;
    const dailyMoneySaved = dailyKwhSaved * tariffKwh;
    const annualMoneySaved = dailyMoneySaved * 365;

    const rate = currencyConfig[currency].rate;
    const baseDriveCostBRL = 35000;
    const totalDrivesInvestment = baseDriveCostBRL * rate * elevatorsCount;
    const paybackMonths = ((totalDrivesInvestment / (annualMoneySaved / 12))).toFixed(1);

    const sav1 = annualMoneySaved;
    const sav5 = annualMoneySaved * 5;
    const sav10 = annualMoneySaved * 10;

    const roiChartData = [
      { ano: 'Ano 0', retornoAcumulado: 0 },
      { ano: 'Ano 1', retornoAcumulado: Math.round(sav1) },
      { ano: 'Ano 3', retornoAcumulado: Math.round(sav1 * 3) },
      { ano: 'Ano 5', retornoAcumulado: Math.round(sav5) },
      { ano: 'Ano 10', retornoAcumulado: Math.round(sav10) }
    ];

    return {
      dailyKwhSaved,
      annualMoneySaved,
      paybackMonths,
      sav1,
      sav5,
      sav10,
      roiChartData,
      symbol: currencyConfig[currency].symbol
    };
  }, [dailyTrips, tariffKwh, currency]);

  // ==========================================
  // TAB 3: GESTÃO PREDITIVA & CROSS-CITY
  // ==========================================
  const [predictiveFilter, setPredictiveFilter] = useState<'ALL' | 'URGENTE' | 'ATENCAO' | 'NORMAL'>('ALL');
  const [predictiveSearch, setPredictiveSearch] = useState<string>('');
  const [predictiveRows, setPredictiveRows] = useState<PredictivePart[]>([
    { id: 'EQ-9042', client: 'Ed. Paulista Corporate (SP)', city: 'São Paulo', part: 'Cabo de Tração Coated CS', hours: 18450, risk: 89, daysLeft: 5, status: 'URGENTE', action: 'Trocar Cabo CS Imediatamente' },
    { id: 'EQ-7721', client: 'Shopping Praiamar (Santos)', city: 'Santos', part: 'Patim de Freio Cerâmico', hours: 14100, risk: 94, daysLeft: 3, status: 'URGENTE', action: 'Substituição Imediata de Patins' },
    { id: 'EQ-4033', client: 'Porto de Santos Terminal 2', city: 'Santos', part: 'Operador de Porta Sellcom HD', hours: 16500, risk: 82, daysLeft: 8, status: 'URGENTE', action: 'Substituir Roldanas/Correia' },
    { id: 'EQ-8812', client: 'Torres de México Tower A', city: 'CDMX', part: 'Sensor Sísmico Triaxial', hours: 12300, risk: 76, daysLeft: 14, status: 'ATENCAO', action: 'Calibrar & Fixação Sísmica' },
    { id: 'EQ-5114', client: 'Ed. Faria Lima Plaza (SP)', city: 'São Paulo', part: 'Inversor VVVF Regen Drive', hours: 9800, risk: 68, daysLeft: 18, status: 'ATENCAO', action: 'Ajustar Tensão & Capacitores' },
    { id: 'EQ-3301', client: 'Empresarial Barra Trade (RJ)', city: 'Rio de Janeiro', part: 'Patim de Freio Cerâmico', hours: 11200, risk: 62, daysLeft: 22, status: 'ATENCAO', action: 'Inspeção de Espessura' },
    { id: 'EQ-6090', client: 'Hospital Moinhos de Vento', city: 'Porto Alegre', part: 'Inversor VVVF Regen Drive', hours: 22000, risk: 42, daysLeft: 65, status: 'NORMAL', action: 'Inspeção Preventiva Rotineira' },
    { id: 'EQ-1092', client: 'Centro Empresarial Capital', city: 'São Paulo', part: 'Cabo de Tração Coated CS', hours: 7400, risk: 25, daysLeft: 120, status: 'NORMAL', action: 'Monitoramento Preditivo IoT' }
  ]);

  const filteredPredictiveRows = useMemo(() => {
    return predictiveRows.filter(row => {
      const matchFilter = predictiveFilter === 'ALL' || row.status === predictiveFilter;
      const matchSearch = row.id.toLowerCase().includes(predictiveSearch.toLowerCase()) ||
        row.client.toLowerCase().includes(predictiveSearch.toLowerCase()) ||
        row.part.toLowerCase().includes(predictiveSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [predictiveRows, predictiveFilter, predictiveSearch]);

  // Environmental Life Calculator (from levy 2)
  const [calcComponent, setCalcComponent] = useState<number>(20000);
  const [calcCurrentHours, setCalcCurrentHours] = useState<number>(14500);
  const [calcDailyUse, setCalcDailyUse] = useState<number>(16);
  const [calcEnvFactor, setCalcEnvFactor] = useState<number>(1.45);

  const calcResult = useMemo(() => {
    const adjustedTotalLife = calcComponent / calcEnvFactor;
    const remainingHours = Math.max(0, adjustedTotalLife - calcCurrentHours);
    const daysLeft = Math.round(remainingHours / (calcDailyUse || 1));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysLeft);

    return {
      adjustedTotalLife: Math.round(adjustedTotalLife),
      remainingHours: Math.round(remainingHours),
      daysLeft,
      targetDateStr: targetDate.toLocaleDateString('pt-BR')
    };
  }, [calcComponent, calcCurrentHours, calcDailyUse, calcEnvFactor]);

  // Cross-City Comparison
  const [cityPartKey, setCityPartKey] = useState<'cabo' | 'vvvf' | 'freio' | 'sensor'>('cabo');
  const crossCityMap = {
    cabo: {
      name: 'Cabo de Aço Revestido / Tração',
      nominalLife: 20000,
      cities: [
        { name: 'São Paulo (SP)', factor: -10, hours: 18000, color: '#38bdf8', reason: 'Alto volume contínuo de ciclos diários (24/7 em torres corporativas na Paulista/Faria Lima).' },
        { name: 'Santos / Litoral (BR)', factor: -35, hours: 13000, color: '#ef4444', reason: 'Aceleração de corrosão por névoa salina e oxidação acelerada das tramas metálicas.' },
        { name: 'Cidade do México (MX)', factor: -25, hours: 15000, color: '#f59e0b', reason: 'Vibrações de micro-sismos tectônicos e ar rarefeito de alta altitude afetando lubrificação.' },
        { name: 'Porto Alegre (POA)', factor: -15, hours: 17000, color: '#10b981', reason: 'Amplitude térmica sazonal com estresse por expansão/contração mecânica contínua.' }
      ]
    },
    vvvf: {
      name: 'Inversor de Frequência VVVF Regen Drive',
      nominalLife: 15000,
      cities: [
        { name: 'São Paulo (SP)', factor: -5, hours: 14250, color: '#38bdf8', reason: 'Rede elétrica de alta confiabilidade; estresse focado em picos nos horários de entrada/saída.' },
        { name: 'Santos / Litoral (BR)', factor: -30, hours: 10500, color: '#ef4444', reason: 'Deposição de névoa de cloreto de sódio nos dissipadores e placas eletrônicas SMD.' },
        { name: 'Cidade do México (MX)', factor: -20, hours: 12000, color: '#f59e0b', reason: 'Menor densidade do ar em 2.240m de altitude reduz dissipação de calor dos IGBTs.' },
        { name: 'Porto Alegre (POA)', factor: -10, hours: 13500, color: '#10b981', reason: 'Condensação de vapor d’água em invernos rigorosos requer aquecedores de gabinete.' }
      ]
    },
    freio: {
      name: 'Patim de Freio Cerâmico',
      nominalLife: 12000,
      cities: [
        { name: 'São Paulo (SP)', factor: -25, hours: 9000, color: '#38bdf8', reason: 'Frequência elevadíssima de paradas por minuto em edifícios acima de 35 andares.' },
        { name: 'Santos / Litoral (BR)', factor: -20, hours: 9600, color: '#ef4444', reason: 'Partículas de sal e umidade cristalizadas acelerando atrito abrasivo no disco.' },
        { name: 'Cidade do México (MX)', factor: -15, hours: 10200, color: '#f59e0b', reason: 'Micromovimentos de acomodação de solo gerando pequenos desalinhamentos de guia.' },
        { name: 'Porto Alegre (POA)', factor: -5, hours: 11400, color: '#10b981', reason: 'Operação padrão sem agentes abrasivos externos predominantes.' }
      ]
    },
    sensor: {
      name: 'Sensor Sísmico & Acelerômetro Triaxial',
      nominalLife: 30000,
      cities: [
        { name: 'São Paulo (SP)', factor: 0, hours: 30000, color: '#38bdf8', reason: 'Zona intraplaca tectonicamente estável. Apenas vibrações estruturais do tráfego urbano.' },
        { name: 'Santos / Litoral (BR)', factor: -15, hours: 25500, color: '#ef4444', reason: 'Oxidação gradual nos contatos banhados do transdutor piezoresistivo.' },
        { name: 'Cidade do México (MX)', factor: -40, hours: 18000, color: '#f59e0b', reason: 'Constante ativação e micro-estresse por tremores diários de baixa magnitude na placa de Cocos.' },
        { name: 'Porto Alegre (POA)', factor: -5, hours: 28500, color: '#10b981', reason: 'Sem atividade sísmica, estresse puramente térmico estático.' }
      ]
    }
  };

  // Smart Batch Procurement (from levy 2 & levy31)
  const procurementList: ProcurementItem[] = [
    { id: '1', code: 'PE-CT-4092', part: 'Cabo de Aço Revestido 10mm (Coated Steel)', qty: 320, unit: 'metros', cities: ['Santos (120m)', 'São Paulo (150m)', 'CDMX (50m)'], supplier: 'OTIS Global Supply (USA)', discount: 18, unitPrice: 150 },
    { id: '2', code: 'PE-VV-8821', part: 'Inversor VVVF Regen Drive 15kW', qty: 18, unit: 'unidades', cities: ['CDMX (8)', 'Porto Alegre (6)', 'São Paulo (4)'], supplier: 'OTIS Power Sys (GER)', discount: 22, unitPrice: 8500 },
    { id: '3', code: 'PE-PF-1102', part: 'Jogo de Patins de Freio Cerâmico', qty: 85, unit: 'conjuntos', cities: ['Santos (35)', 'São Paulo (30)', 'Porto Alegre (20)'], supplier: 'OTIS Brake Tech (FRA)', discount: 15, unitPrice: 1200 },
    { id: '4', code: 'PE-SS-9901', part: 'Sensor Sísmico Triaxial Digital IoT', qty: 25, unit: 'unidades', cities: ['CDMX (20)', 'São Paulo (5)'], supplier: 'OTIS Sensor Systems (JPN)', discount: 25, unitPrice: 3400 }
  ];

  const [selectedLots, setSelectedLots] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': true,
    '4': true
  });

  const procurementTotals = useMemo(() => {
    let gross = 0;
    let net = 0;
    let items = 0;

    procurementList.forEach(item => {
      if (selectedLots[item.id]) {
        const itemGross = item.qty * item.unitPrice;
        const itemNet = itemGross * (1 - item.discount / 100);
        gross += itemGross;
        net += itemNet;
        items += item.qty;
      }
    });

    const savings = gross - net;
    const savingsPct = gross > 0 ? Math.round((savings / gross) * 100) : 0;

    return { gross, net, savings, savingsPct, items };
  }, [selectedLots]);

  const handleToggleLot = (id: string) => {
    setSelectedLots(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateGlobalPO = () => {
    addToast(
      'success',
      'Ordem Global Emitida',
      `PO de Lote Consolidado gerada com sucesso! Economia de R$ ${procurementTotals.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} aplicada junto aos fornecedores multinacionais.`
    );
  };

  // ==========================================
  // TAB 4: AUDITORIA CONTRATUAL & TERMO ADITIVO
  // ==========================================
  interface ContractAudit {
    id: string;
    unit: string;
    client: string;
    location: string;
    criticalFactor: string;
    excessWearPct: string;
    currentFee: number;
    proposedFee: number;
  }

  const contractAudits: ContractAudit[] = [
    { id: 'CA-STS-01', unit: 'ELV-04 Santos Concais', client: 'Terminal Marítimo Concais', location: 'Santos / SP', criticalFactor: 'Névoa Salina Severa (88% UR) + 4.200h uso', excessWearPct: '+38%', currentFee: 2850, proposedFee: 3288.90 },
    { id: 'CA-CDMX-09', unit: 'ELV-12 Torre Reforma', client: 'Banco Santander México', location: 'CDMX / México', criticalFactor: 'Micro-vibrações sísmicas diárias (0.65 m/s²)', excessWearPct: '+34%', currentFee: 3200, proposedFee: 3692.80 },
    { id: 'CA-POA-03', unit: 'ELV-02 Hospital Moinhos', client: 'Hospital Moinhos de Vento', location: 'Porto Alegre / RS', criticalFactor: 'Ciclos Contínuos 24/7 UTI + Amplitude Térmica', excessWearPct: '+31%', currentFee: 2600, proposedFee: 3000.40 },
    { id: 'CA-SP-88', unit: 'ELV-09 Faria Lima Plaza', client: 'Brookfield Properties', location: 'São Paulo / SP', criticalFactor: 'Picos de Sobrecarga Matutino/Noturno (> 95% cap)', excessWearPct: '+32%', currentFee: 3400, proposedFee: 3923.60 }
  ];

  const [selectedAuditForModal, setSelectedAuditForModal] = useState<ContractAudit | null>(null);

  // ==========================================
  // TAB 5: SCADA INDUSTRIAL & LOGS
  // ==========================================
  const scadaSensors: ScadaSensor[] = [
    { tag: 'ACC-3X-01', name: 'Acelerômetro Triaxial Cabina', location: 'Topo da Cabina #12', currentValue: '0.28 g RMS', unit: 'g RMS', normalRange: '< 0.35 g', status: 'OPTIMAL', percent: 45 },
    { tag: 'ENC-SPD-02', name: 'Encoder Óptico de Posicionamento', location: 'Máquina de Tração ReGen', currentValue: '2.50 m/s', unit: 'm/s', normalRange: '0.00 - 3.50 m/s', status: 'OPTIMAL', percent: 71 },
    { tag: 'THM-BRG-01', name: 'Termopar Mancais Principais', location: 'Mancal Dianteiro', currentValue: '58.4 °C', unit: '°C', normalRange: '< 75.0 °C', status: 'OPTIMAL', percent: 62 },
    { tag: 'CUR-DRV-04', name: 'Sensor de Corrente de Fases VVVF', location: 'Painel Central Indaiatuba', currentValue: '38.2 A', unit: 'A', normalRange: '< 45.0 A', status: 'WARN', percent: 84 },
    { tag: 'ANM-SHA-01', name: 'Anemômetro de Caixa de Corrida', location: 'Caixa de Corrida - Andar 38', currentValue: '18.4 km/h', unit: 'km/h', normalRange: '< 25.0 km/h', status: 'OPTIMAL', percent: 55 },
    { tag: 'HUM-BRG-03', name: 'Higrômetro Digital de Fosso', location: 'Fosso Inferior - Santos', currentValue: '88.2 %', unit: '%', normalRange: '< 70.0 %', status: 'ALERT', percent: 88 }
  ];

  const scadaLogs: ScadaLog[] = [
    { timestamp: '11:42:01', code: 'LOG-4091', severity: 'WARN', device: 'ACC-3X-01', message: 'Vibração lateral de 0.31g detectada no piso 24 da Torre Paulista.' },
    { timestamp: '11:38:15', code: 'LOG-4090', severity: 'INFO', device: 'REGEN-DRV', message: 'Injeção de 4.8 kWh regenerada devolvida à rede do edifício.' },
    { timestamp: '11:30:44', code: 'LOG-4089', severity: 'CRIT', device: 'HUM-BRG-03', message: 'Limite de umidade no fosso ultrapassou 85% em Santos. Verniz ativado.' },
    { timestamp: '11:22:10', code: 'LOG-4088', severity: 'INFO', device: 'SEISMIC-01', message: 'Handshake sísmico com rede sismológica de Oaxaca concluído (latência 18ms).' },
    { timestamp: '11:15:32', code: 'LOG-4087', severity: 'WARN', device: 'CUR-DRV-04', message: 'Pico de partida de 41.5A durante aceleração máxima com lotação de 100%.' }
  ];

  const handleExportScadaLogs = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['Timestamp,Código,Severidade,Dispositivo,Mensagem']
        .concat(scadaLogs.map(l => `${l.timestamp},${l.code},${l.severity},${l.device},"${l.message}"`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scada_otis_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Relatório Exportado', 'Histórico SCADA baixado com sucesso em CSV.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800 shadow-md">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              OTIS ONE™ Enterprise IoT & SCADA
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {currentTime || '2026-09-04 11:45:00 UTC-3'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
            Centro de Monitoramento Industrial & Resiliência
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
            Supervisão SCADA em tempo real para frotas industriais: telemetria sísmica para o México, monitoramento preditivo regional de maresia e frio, economia com drives regenerativos ReGen® e gestão unificada de contratos.
          </p>
        </div>

        {/* Global Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Alerta Sísmico Oaxaca (5.2 Mw)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
            <Waves className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Maresia Santos: 88% UR</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('seismic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'seismic'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          Alertas Regionais & Sísmicos
        </button>

        <button
          onClick={() => setActiveTab('regen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'regen'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          Telemetria ReGen® & ROI
        </button>

        <button
          onClick={() => setActiveTab('predictive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'predictive'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          Gestão Preditiva & Cross-City
        </button>

        <button
          onClick={() => setActiveTab('contract')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'contract'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          Desgaste Contratual & Aditivo
        </button>

        <button
          onClick={() => setActiveTab('scada')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'scada'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4 text-blue-400" />
          SCADA Industrial & Sensores
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALERTAS REGIONAIS & SÍSMICOS */}
      {/* ========================================================================= */}
      {activeTab === 'seismic' && (
        <div className="space-y-6">
          {/* Seismograph & Regional Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Oaxaca Live Seismograph Card (2 Cols) */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Sismógrafo IoT em Tempo Real
                    </span>
                    <span className="text-xs text-slate-400">Epicentro: Oaxaca / México</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Oscilação Estrutural de Aceleração Dinâmica (5.2 Mw)
                  </h3>
                </div>

                <button
                  onClick={handleSimulateSeismicStop}
                  disabled={isSimulatingSeismic}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-all shrink-0"
                >
                  <Activity className={`w-3.5 h-3.5 ${isSimulatingSeismic ? 'animate-spin' : ''}`} />
                  {isSimulatingSeismic ? 'Executando Parada Sísmica...' : 'Simular Parada Sísmica'}
                </button>
              </div>

              {/* Native HTML5 Canvas Seismograph */}
              <div className="relative w-full h-44 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <canvas
                  ref={seismographCanvasRef}
                  width={600}
                  height={176}
                  className="w-full h-full block"
                />
                <div className="absolute top-2 right-3 text-[11px] font-mono text-amber-400 bg-slate-900/80 px-2 py-1 rounded border border-amber-500/30">
                  Peak Accel: 0.65 m/s²
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded">
                  Freq: 1.8 Hz • Modo ASME A17.1 Safe Landing
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Magnitude</div>
                  <div className="text-sm font-bold text-amber-400 font-mono">5.2 Mw</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Aceleração</div>
                  <div className="text-sm font-bold text-rose-400 font-mono">0.65 m/s²</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Elevadores Alvo</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">42 Unidades</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Tempo de Parada</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">4.2 s</div>
                </div>
              </div>
            </div>

            {/* Regional Weather & Humidity Alerts (1 Col) */}
            <div className="space-y-4">
              {/* Santos Salinity Card with Canvas Gauge */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Waves className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Santos / Litoral Paulista</h4>
                      <p className="text-[11px] text-slate-400">Maresia & Corrosão Crítica</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    88% UR
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 py-1">
                  <canvas ref={humidityGaugeRef} width={90} height={90} className="w-[90px] h-[90px]" />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-rose-400">+35% Desgaste Acelerado</div>
                    <div className="text-[11px] text-slate-300 leading-snug">
                      Névoa salina no fosso e cabos. Verniz conformal ativado nas placas eletrônicas.
                    </div>
                  </div>
                </div>
              </div>

              {/* Cold Warning Card (Sul) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Região Sul (Curitiba / POA)</h4>
                      <p className="text-[11px] text-slate-400">Frio Extremo Sazonal</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    4°C
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Alta viscosidade do óleo hidráulico ISO VG 68 detectada. Sistema de pré-aquecimento de cabina e recirculação acionados automaticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Seismic Sensor Retrofit Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Plano de Retrofit & Upgrade de Sensores Sísmicos
                </h3>
                <p className="text-xs text-slate-400">
                  Classificação por criticidade sísmica e normas ASME A17.1 / NMX-ES-001.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5">
                {(['ALL', 'P1', 'P2', 'P3'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeismicSeverityFilter(sev)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      seismicSeverityFilter === sev
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {sev === 'ALL' ? 'Todos' : `${sev} ${sev === 'P1' ? '(Crítico)' : sev === 'P2' ? '(Alto)' : '(Preventivo)'}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Equipamento / Edifício</th>
                    <th className="py-2.5 px-3">Cidade / Região</th>
                    <th className="py-2.5 px-3">Tipo de Transdutor</th>
                    <th className="py-2.5 px-3">Última Leitura</th>
                    <th className="py-2.5 px-3">Prioridade</th>
                    <th className="py-2.5 px-3">Status Retrofit</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSeismicList.map(row => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{row.unit}</div>
                        <div className="text-[11px] text-slate-400">{row.id} • {row.client}</div>
                      </td>
                      <td className="py-3 px-3">{row.city}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300">{row.sensorType}</td>
                      <td className="py-3 px-3 font-mono">
                        <span className={row.lastReading.includes('Alarme') ? 'text-rose-400 font-bold' : row.lastReading.includes('Pré-alerta') ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                          {row.lastReading}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.severity === 'P1'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : row.severity === 'P2'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {row.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.status === 'HOMOLOGADO'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : row.status === 'EM_RETROFIT'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleRetrofitAction(row.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 text-xs rounded-lg transition-all border border-slate-700 font-medium"
                        >
                          {row.status === 'PENDENTE' ? 'Solicitar Kit' : row.status === 'EM_RETROFIT' ? 'Homologar' : 'Revisado'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TELEMETRIA REGEN® & ROI MULTI-CURRENCY */}
      {/* ========================================================================= */}
      {activeTab === 'regen' && (
        <div className="space-y-6">
          {/* Top Controls & Currency Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Calculadora Executiva de Payback & ROI ReGen® Drive
              </h3>
              <p className="text-xs text-slate-400">
                Simulação dinâmica de economia de energia e devolução de kWh para a rede predial.
              </p>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Moeda:</span>
              {(['BRL', 'MXN', 'USD'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => handleCurrencyChange(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    currency === c
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Sliders & Live KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Sliders Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Parâmetros Operacionais
              </h4>

              {/* Slider 1: Viagens Diárias */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Viagens Diárias / Elevador:</span>
                  <span className="font-bold text-cyan-400 font-mono">{dailyTrips.toLocaleString()} viagens</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={100}
                  value={dailyTrips}
                  onChange={(e) => setDailyTrips(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>500 (Residencial)</span>
                  <span>5.000 (Torre Comercial A+)</span>
                </div>
              </div>

              {/* Slider 2: Tarifa de Energia */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Tarifa Elétrica por kWh:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {regenFinancials.symbol} {tariffKwh.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={currency === 'USD' ? 0.08 : currency === 'MXN' ? 1.00 : 0.40}
                  max={currency === 'USD' ? 0.50 : currency === 'MXN' ? 5.00 : 1.60}
                  step={0.01}
                  value={tariffKwh}
                  onChange={(e) => setTariffKwh(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Mínimo Regional</span>
                  <span>Pico Horário de Ponta</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
                <div className="text-slate-400">Geração Limpa Diária (5 Elevadores):</div>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  {regenFinancials.dailyKwhSaved.toFixed(1)} kWh / dia
                </div>
                <div className="text-[10px] text-slate-400">Redução de CO₂ equivalente a 18 árvores/mês</div>
              </div>
            </div>

            {/* KPI Cards (2 Cols) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Payback Estimado</span>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {regenFinancials.paybackMonths} Meses
                </div>
                <div className="text-[11px] text-emerald-400">Retorno integral do investimento inicial</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Economia Ano 1</span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-400">
                  {regenFinancials.symbol} {Math.round(regenFinancials.sav1).toLocaleString('pt-BR')}
                </div>
                <div className="text-[11px] text-slate-400">Faturamento direto evitado</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Economia Ano 5</span>
                  <DollarSign className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-indigo-300">
                  {regenFinancials.symbol} {Math.round(regenFinancials.sav5).toLocaleString('pt-BR')}
                </div>
                <div className="text-[11px] text-slate-400">Margem líquida acumulada</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Economia Ano 10 (Ciclo de Vida)</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {regenFinancials.symbol} {Math.round(regenFinancials.sav10).toLocaleString('pt-BR')}
                </div>
                <div className="text-[11px] text-emerald-300">Projeção decenal consolidada</div>
              </div>
            </div>
          </div>

          {/* ROI Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Curva de Retorno Acumulado do Investimento ReGen® ({currency})
            </h4>

            <div className="h-64 w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={regenFinancials.roiChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="ano" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => {
                      const num = Number(val);
                      return isNaN(num) ? '' : `${regenFinancials.symbol} ${Math.round(num / 1000)}k`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val: any) => [`${regenFinancials.symbol} ${Number(val || 0).toLocaleString('pt-BR')}`, 'Economia Acumulada']}
                  />
                  <Area type="monotone" dataKey="retornoAcumulado" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRoi)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Unit by Unit Model Comparison Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Comparativo de Desempenho por Linha de Equipamento OTIS
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Modelo OTIS</th>
                    <th className="py-2.5 px-3">Perfil de Tráfego</th>
                    <th className="py-2.5 px-3">Consumo Convencional</th>
                    <th className="py-2.5 px-3">Consumo ReGen®</th>
                    <th className="py-2.5 px-3">% Economia</th>
                    <th className="py-2.5 px-3 text-right">Economia Anual Estimada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">Gen2® Comfort (Residencial)</td>
                    <td className="py-3 px-3">Médio (800 v/dia)</td>
                    <td className="py-3 px-3 font-mono">14.2 kWh/dia</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">8.2 kWh/dia</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">-42%</span></td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      {regenFinancials.symbol} {(2190 * tariffKwh).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">Gen2® Premier (Comercial)</td>
                    <td className="py-3 px-3">Alto (2.400 v/dia)</td>
                    <td className="py-3 px-3 font-mono">42.5 kWh/dia</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">22.1 kWh/dia</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">-48%</span></td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      {regenFinancials.symbol} {(7446 * tariffKwh).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">SkyRise® (Super High Rise)</td>
                    <td className="py-3 px-3">Intenso 24/7 (4.200 v/dia)</td>
                    <td className="py-3 px-3 font-mono">98.0 kWh/dia</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">44.1 kWh/dia</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">-55%</span></td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      {regenFinancials.symbol} {(19673 * tariffKwh).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GESTÃO PREDITIVA & CROSS-CITY */}
      {/* ========================================================================= */}
      {activeTab === 'predictive' && (
        <div className="space-y-6">
          {/* Section 1: Environmental Life Calculator (levy 2) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Modelo Preditivo Avançado
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Calculadora de Vida Útil Mecânica Ajustada por Fatores Ambientais
              </h3>
              <p className="text-xs text-slate-400">
                Ajusta o desgaste nominal considerando umidade litorânea, altitude, micro-vibrações sísmicas e ciclos severos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Componente Analisado:</label>
                <select
                  value={calcComponent}
                  onChange={(e) => setCalcComponent(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500"
                >
                  <option value={20000}>Cabo de Tração Coated (20.000h nominal)</option>
                  <option value={15000}>Inversor VVVF Regen (15.000h nominal)</option>
                  <option value={12000}>Patim de Freio Cerâmico (12.000h nominal)</option>
                  <option value={30000}>Sensor Sísmico Triaxial (30.000h nominal)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Horas Acumuladas no Ativo:</label>
                <input
                  type="number"
                  value={calcCurrentHours}
                  onChange={(e) => setCalcCurrentHours(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Uso Diário Médio (horas/dia):</label>
                <input
                  type="number"
                  value={calcDailyUse}
                  onChange={(e) => setCalcDailyUse(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Fator de Severidade Ambiental:</label>
                <select
                  value={calcEnvFactor}
                  onChange={(e) => setCalcEnvFactor(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500"
                >
                  <option value={1.00}>Padrão Nominal (1.00x - Cidade Padrão)</option>
                  <option value={1.45}>Santos / Litoral (1.45x - Maresia Severa)</option>
                  <option value={1.35}>Cidade do México (1.35x - Micro-sismos/Altitude)</option>
                  <option value={1.20}>Sul do Brasil (1.20x - Amplitude Térmica)</option>
                  <option value={1.15}>São Paulo (1.15x - Tráfego Contínuo)</option>
                </select>
              </div>
            </div>

            {/* Result Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-400">Previsão Restante Ajustada:</div>
                <div className="text-xl font-bold font-mono text-indigo-400">
                  {calcResult.daysLeft} Dias Úteis
                </div>
                <div className="text-xs text-slate-400">
                  Data Limite Est: <span className="text-white font-semibold">{calcResult.targetDateStr}</span> (Restam {calcResult.remainingHours} horas úteis)
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToast('info', 'Agendamento Preditivo', `Inspeção programada para ${calcResult.targetDateStr}.`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition-all"
                >
                  Agendar Substituição Preventiva
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Cross-City Durability Analysis */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  Análise Comparativa de Desgaste entre Polos Regionais
                </h3>
                <p className="text-xs text-slate-400">
                  Impacto das características geográficas e climáticas na vida útil de cada componente.
                </p>
              </div>

              <select
                value={cityPartKey}
                onChange={(e) => setCityPartKey(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
              >
                <option value="cabo">Cabo de Tração Coated</option>
                <option value="vvvf">Inversor VVVF Regen Drive</option>
                <option value="freio">Patim de Freio Cerâmico</option>
                <option value="sensor">Sensor Sísmico Triaxial</option>
              </select>
            </div>

            {/* City Comparative Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {crossCityMap[cityPartKey].cities.map(c => {
                const pct = Math.round((c.hours / crossCityMap[cityPartKey].nominalLife) * 100);
                return (
                  <div key={c.name} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{c.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.factor < -20 ? 'bg-rose-500/20 text-rose-300' : c.factor < -10 ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {c.factor > 0 ? `+${c.factor}%` : `${c.factor}%`}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Vida Útil Média</span>
                        <span className="font-mono text-white font-bold">{c.hours.toLocaleString()} hrs</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug border-t border-slate-800/80 pt-2">
                      {c.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Critical Parts in Risk (levy 2) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-rose-400" />
                  Monitor Preditivo de Peças Críticas em Risco
                </h3>
                <p className="text-xs text-slate-400">
                  Previsão matemática de falhas antes de paradas não programadas (OTIS FleetPulse).
                </p>
              </div>

              {/* Filter & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar peça ou edifício..."
                    value={predictiveSearch}
                    onChange={(e) => setPredictiveSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 w-48 focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {(['ALL', 'URGENTE', 'ATENCAO', 'NORMAL'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setPredictiveFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        predictiveFilter === f
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Equipamento / Cliente</th>
                    <th className="py-2.5 px-3">Componente Crítico</th>
                    <th className="py-2.5 px-3">Horas Uso</th>
                    <th className="py-2.5 px-3">Risco de Falha (%)</th>
                    <th className="py-2.5 px-3">Troca Estimada</th>
                    <th className="py-2.5 px-3">Criticidade</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPredictiveRows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{row.id}</div>
                        <div className="text-[11px] text-slate-400">{row.client}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{row.part}</td>
                      <td className="py-3 px-3 font-mono">{row.hours.toLocaleString()} h</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                row.risk >= 80 ? 'bg-rose-500' : row.risk >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${row.risk}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[11px]">{row.risk}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={`font-bold ${row.daysLeft <= 7 ? 'text-rose-400' : 'text-slate-200'}`}>
                          em ~{row.daysLeft} dias
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === 'URGENTE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : row.status === 'ATENCAO'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => addToast('info', 'Ordem de Serviço Emitida', `Substituição de ${row.part} solicitada para ${row.id}.`)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                        >
                          Solicitar Troca
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Smart Batch Procurement (levy 2 & levy31) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Economia de Escala Multinacional
                </span>
                <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  Agrupador Inteligente de Compras em Lote (Smart Batch PO)
                </h3>
                <p className="text-xs text-slate-400">
                  Consolidação automática das necessidades de Santos, São Paulo, POA e CDMX para obter descontos corporativos de 15% a 25%.
                </p>
              </div>

              <button
                onClick={handleGenerateGlobalPO}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow transition-all shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                Gerar PO Global Consolidada
              </button>
            </div>

            {/* Procurement Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Incluir</th>
                    <th className="py-2.5 px-3">Código / Peça</th>
                    <th className="py-2.5 px-3">Qtd Agrupada</th>
                    <th className="py-2.5 px-3">Destinos Consolidados</th>
                    <th className="py-2.5 px-3">Fornecedor Homologado</th>
                    <th className="py-2.5 px-3">Desconto Lote</th>
                    <th className="py-2.5 px-3 text-right">Economia Gerada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {procurementList.map(item => {
                    const itemGross = item.qty * item.unitPrice;
                    const itemNet = itemGross * (1 - item.discount / 100);
                    const itemSavings = itemGross - itemNet;
                    const isChecked = selectedLots[item.id];

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleLot(item.id)}
                            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-cyan-400 font-mono">{item.code}</div>
                          <div className="text-white font-medium">{item.part}</div>
                        </td>
                        <td className="py-3 px-3 font-bold font-mono text-white">
                          {item.qty} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {item.cities.join(', ')}
                        </td>
                        <td className="py-3 px-3 text-slate-300">{item.supplier}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            {item.discount}% OFF
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold font-mono text-emerald-400">
                          R$ {itemSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
              <div>
                <div className="text-[11px] text-slate-400">Volume Total Selecionado</div>
                <div className="text-sm font-bold text-white font-mono">{procurementTotals.items} itens</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Custo Bruto (Sem Escala)</div>
                <div className="text-sm font-bold text-slate-400 font-mono">
                  R$ {procurementTotals.gross.toLocaleString('pt-BR')}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Economia em Lote ({procurementTotals.savingsPct}%)</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  R$ {procurementTotals.savings.toLocaleString('pt-BR')}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Custo Líquido Final PO</div>
                <div className="text-sm font-bold text-cyan-400 font-mono">
                  R$ {procurementTotals.net.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DESGASTE CONTRATUAL & ADITIVO */}
      {/* ========================================================================= */}
      {activeTab === 'contract' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Auditoria de Conformidade & Reequilíbrio Econômico
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Auditoria de Desgaste por Uso Severo e Minuta de Termo Aditivo
              </h3>
              <p className="text-xs text-slate-400">
                Garante a sustentabilidade financeira dos contratos de manutenção comprovando estresse mecânico atípico através da telemetria OTIS ONE™.
              </p>
            </div>

            {/* Audits Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Unidade / Cliente</th>
                    <th className="py-2.5 px-3">Polo Geográfico</th>
                    <th className="py-2.5 px-3">Fator Ambiental Auditado</th>
                    <th className="py-2.5 px-3">Desvio de Desgaste</th>
                    <th className="py-2.5 px-3">Taxa Atual</th>
                    <th className="py-2.5 px-3">Taxa Reequilibrada (+15.4%)</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {contractAudits.map(ca => (
                    <tr key={ca.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{ca.unit}</div>
                        <div className="text-[11px] text-slate-400">{ca.client}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{ca.location}</td>
                      <td className="py-3 px-3 text-amber-300">{ca.criticalFactor}</td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-400">{ca.excessWearPct}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">R$ {ca.currentFee.toLocaleString('pt-BR')}/mês</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        R$ {ca.proposedFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedAuditForModal(ca)}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-all"
                        >
                          Gerar Minuta de Aditivo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal for Contract Additive (from levy31) */}
          {selectedAuditForModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      Aditivo Contratual — Reequilíbrio Técnico ({selectedAuditForModal.unit})
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAuditForModal(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
{`TERMO ADITIVO DE MANUTENÇÃO E TELEMETRIA DE ATIVOS — OTIS ONE™

UNIDADE REGISTRADA: ${selectedAuditForModal.unit}
LOCALIZAÇÃO: ${selectedAuditForModal.location}
CLIENTE: ${selectedAuditForModal.client}
FATOR AMBIENTAL CRÍTICO: ${selectedAuditForModal.criticalFactor}
DESVIO DE DESGASTE CONTRATUAL AUDITADO: ${selectedAuditForModal.excessWearPct} ACIMA DO LIMITE NOMINAL

CONSIDERANDO QUE:
1. Os dados de sensores IoT de aceleração, vibração e umidade comprovaram estresse mecânico atípico associado às condições regionais.
2. A Cláusula 8.2 do Contrato Principal prevê a revisão do valor de cobertura preventiva quando o uso severo ultrapassar 30% da média das tabelas normativas ISO 18738.

DELIBERAÇÃO:
- Reajuste na taxa mensal de conservação de +15.4% (de R$ ${selectedAuditForModal.currentFee.toLocaleString('pt-BR')} para R$ ${selectedAuditForModal.proposedFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).
- Inclusão de inspeção preditiva especial trimestral com ultrassom em cabos e drive sem custo adicional de mão de obra.

JUSTIFICATIVA TÉCNICA GERADA EM: ${new Date().toLocaleDateString('pt-BR')} VIA OTIS SCADA ENGINE.`}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedAuditForModal(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      addToast('success', 'Minuta Exportada', 'Termo aditivo exportado com assinatura digital OTIS ONE™.');
                      setSelectedAuditForModal(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Minuta Assinada (PDF)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SCADA INDUSTRIAL & LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'scada' && (
        <div className="space-y-6">
          {/* Sensors SCADA Cards Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SCADA Pro • Telemetria em Tempo Real
                </span>
                <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Barramento de Sensores Industriais de Campo
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Taxa de Atualização: 1.000 ms</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scadaSensors.map(s => (
                <div key={s.tag} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{s.tag}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'ALERT'
                        ? 'bg-rose-500/20 text-rose-300'
                        : s.status === 'WARN'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white">{s.name}</div>
                    <div className="text-[11px] text-slate-400">{s.location}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[10px] text-slate-500">Leitura Atual</div>
                        <div className="text-lg font-bold font-mono text-white">{s.currentValue}</div>
                      </div>
                      <div className="text-right text-[10px] text-slate-400">
                        Faixa: {s.normalRange}
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.status === 'ALERT' ? 'bg-rose-500' : s.status === 'WARN' ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SCADA Event Logs Terminal */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Terminal de Logs & Eventos SCADA
                </h3>
                <p className="text-xs text-slate-400">
                  Rastreabilidade com precisão de milissegundos para auditoria técnica.
                </p>
              </div>

              <button
                onClick={handleExportScadaLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
              {scadaLogs.map(l => (
                <div key={l.code} className="flex flex-col sm:flex-row sm:items-center gap-2 text-[11px] py-1 border-b border-slate-900 last:border-0">
                  <span className="text-slate-500 shrink-0">{l.timestamp}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                    l.severity === 'CRIT' ? 'bg-rose-500/20 text-rose-400' : l.severity === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {l.severity}
                  </span>
                  <span className="text-cyan-400 font-semibold shrink-0">{l.device}</span>
                  <span className="text-slate-300">{l.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
