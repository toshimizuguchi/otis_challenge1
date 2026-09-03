import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Part, PartRequest } from '../../types';
import { 
  Package, 
  Search, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Truck, 
  Clock, 
  Send, 
  MapPin, 
  Building2, 
  Check, 
  X, 
  Filter,
  PhoneCall,
  User,
  ShieldAlert,
  ArrowRight,
  Zap,
  Layers,
  Cpu,
  Flame,
  Activity,
  SlidersHorizontal,
  Box,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const PartsModule: React.FC = () => {
  const { parts, partRequests, createPartRequest, calls, equipments, currentUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'CATALOG' | 'REQUESTS'>('CATALOG');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'ALL' | 'CRITICO' | 'ALERTA'>('ALL');

  // Request Part Modal State
  const [selectedPartForRequest, setSelectedPartForRequest] = useState<Part | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [urgency, setUrgency] = useState<'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA'>('ALTA');
  const [deliveryType, setDeliveryType] = useState<'LOCAL_CHAMADO' | 'RETIRADA_POLO' | 'ESTOQUE_MOVEL'>('LOCAL_CHAMADO');
  const [justification, setJustification] = useState<string>('');

  // Extract all distinct elevator models
  const allModels = Array.from(
    new Set(parts.flatMap(p => p.compatibleModels))
  ).sort();

  // Extract all distinct categories
  const allCategories = Array.from(
    new Set(parts.map(p => p.category))
  ).filter(Boolean).sort();

  // Brand identification helper
  const getBrandInfo = (part: Part) => {
    const code = part.code.toUpperCase();
    const models = part.compatibleModels.join(' ').toUpperCase();
    if (code.startsWith('OTIS') || models.includes('OTIS')) {
      return { 
        id: 'OTIS',
        name: 'Otis Genuine', 
        color: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        badge: 'bg-sky-500 text-slate-950 font-bold',
        glow: 'from-sky-500/10 via-slate-900 to-slate-950',
        tagBg: 'bg-sky-950/60 text-sky-300 border-sky-700/50'
      };
    }
    if (code.startsWith('SCH') || models.includes('SCHINDLER')) {
      return { 
        id: 'SCHINDLER',
        name: 'Schindler OEM', 
        color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        badge: 'bg-amber-500 text-slate-950 font-bold',
        glow: 'from-amber-500/10 via-slate-900 to-slate-950',
        tagBg: 'bg-amber-950/60 text-amber-300 border-amber-700/50'
      };
    }
    if (code.startsWith('TKE') || models.includes('TK') || models.includes('THYSSEN')) {
      return { 
        id: 'TKE',
        name: 'TK Elevator', 
        color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        badge: 'bg-emerald-500 text-slate-950 font-bold',
        glow: 'from-emerald-500/10 via-slate-900 to-slate-950',
        tagBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
      };
    }
    if (code.startsWith('KONE') || models.includes('KONE')) {
      return { 
        id: 'KONE',
        name: 'KONE Authentic', 
        color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        badge: 'bg-purple-500 text-white font-bold',
        glow: 'from-purple-500/10 via-slate-900 to-slate-950',
        tagBg: 'bg-purple-950/60 text-purple-300 border-purple-700/50'
      };
    }
    return { 
      id: 'OTHER',
      name: 'Certificado Multimarca', 
      color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      badge: 'bg-rose-500 text-white font-bold',
      glow: 'from-rose-500/10 via-slate-900 to-slate-950',
      tagBg: 'bg-rose-950/60 text-rose-300 border-rose-700/50'
    };
  };

  // Category styles helper with rich visual accents
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Sistema de Portas':
        return {
          icon: <Layers className="w-3.5 h-3.5" />,
          pill: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30',
          activePill: 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25',
          border: 'border-amber-500/30',
          gradient: 'from-amber-950/30 via-slate-900 to-slate-950',
          accentColor: 'text-amber-400',
          dot: 'bg-amber-400'
        };
      case 'Placas e Controladores':
        return {
          icon: <Cpu className="w-3.5 h-3.5" />,
          pill: 'bg-violet-500/20 text-violet-300 border-violet-500/40 hover:bg-violet-500/30',
          activePill: 'bg-violet-500 text-white font-black shadow-lg shadow-violet-500/25',
          border: 'border-violet-500/30',
          gradient: 'from-violet-950/30 via-slate-900 to-slate-950',
          accentColor: 'text-violet-400',
          dot: 'bg-violet-400'
        };
      case 'Acionamento e Tração':
        return {
          icon: <Zap className="w-3.5 h-3.5" />,
          pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30',
          activePill: 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25',
          border: 'border-emerald-500/30',
          gradient: 'from-emerald-950/30 via-slate-900 to-slate-950',
          accentColor: 'text-emerald-400',
          dot: 'bg-emerald-400'
        };
      case 'Cabos e Cintas de Tração':
        return {
          icon: <Compass className="w-3.5 h-3.5" />,
          pill: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30',
          activePill: 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25',
          border: 'border-cyan-500/30',
          gradient: 'from-cyan-950/30 via-slate-900 to-slate-950',
          accentColor: 'text-cyan-400',
          dot: 'bg-cyan-400'
        };
      case 'Elétrica e Sinalização':
        return {
          icon: <Flame className="w-3.5 h-3.5" />,
          pill: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30',
          activePill: 'bg-yellow-400 text-slate-950 font-black shadow-lg shadow-yellow-500/25',
          border: 'border-yellow-500/30',
          gradient: 'from-yellow-950/30 via-slate-900 to-slate-950',
          accentColor: 'text-yellow-400',
          dot: 'bg-yellow-400'
        };
      default:
        return {
          icon: <Box className="w-3.5 h-3.5" />,
          pill: 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30',
          activePill: 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/25',
          border: 'border-sky-500/30',
          gradient: 'from-sky-950/30 via-slate-900 to-slate-950',
          accentColor: 'text-sky-400',
          dot: 'bg-sky-400'
        };
    }
  };

  // Filter parts
  const filteredParts = parts.filter(p => {
    const brandInfo = getBrandInfo(p);
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.compatibleModels.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModel = 
      selectedModelFilter === 'ALL' ||
      p.compatibleModels.includes(selectedModelFilter);

    const matchesCategory = 
      selectedCategoryFilter === 'ALL' ||
      p.category === selectedCategoryFilter;

    const matchesBrand = 
      selectedBrandFilter === 'ALL' ||
      brandInfo.id === selectedBrandFilter;

    const matchesStock = 
      selectedStockFilter === 'ALL' ? true :
      selectedStockFilter === 'CRITICO' ? p.stockQuantity < 20 :
      selectedStockFilter === 'ALERTA' ? !!p.abnormalConsumptionAlert : true;

    return matchesSearch && matchesModel && matchesCategory && matchesBrand && matchesStock;
  });

  // Calculate live statistics
  const totalStockItems = parts.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalInventoryValue = parts.reduce((acc, p) => acc + (p.unitCost * p.stockQuantity), 0);
  const abnormalAlertsCount = parts.filter(p => p.abnormalConsumptionAlert).length;
  const criticalStockCount = parts.filter(p => p.stockQuantity < 20).length;

  // Open calls for technician
  const openCalls = calls.filter(c => c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO');

  const handleOpenRequestModal = (part: Part) => {
    setSelectedPartForRequest(part);
    setQuantity(1);
    setUrgency('ALTA');
    setDeliveryType('LOCAL_CHAMADO');
    setJustification(`Substituição preventiva/corretiva de ${part.name} em atendimento de campo.`);
    if (openCalls.length > 0) {
      setSelectedCallId(openCalls[0].id);
    }
  };

  const handleConfirmRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartForRequest) return;

    const linkedCall = calls.find(c => c.id === selectedCallId);

    createPartRequest({
      partId: selectedPartForRequest.id,
      partCode: selectedPartForRequest.code,
      partName: selectedPartForRequest.name,
      category: selectedPartForRequest.category,
      unitCost: selectedPartForRequest.unitCost,
      quantity: Number(quantity),
      urgency,
      deliveryType,
      justification,
      callId: linkedCall?.id,
      callNumber: linkedCall?.callNumber,
      equipmentTag: linkedCall?.equipmentTag,
      customerName: linkedCall?.customerName
    });

    addToast({
      type: 'success',
      title: 'Pedido de Peça Enviado!',
      message: `Solicitação gravada com sucesso: ${quantity}x ${selectedPartForRequest.name} (${selectedPartForRequest.code})`
    });

    setSelectedPartForRequest(null);
    setActiveTab('REQUESTS');
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      
      {/* VIBRANT MULTI-COLOR HEADER BANNER */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/60 to-purple-950/40 border border-indigo-500/30 shadow-xl shadow-indigo-950/20">
        
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md">
                ALMOXARIFADO & CATÁLOGO TÉCNICO
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Compatibilidade Inteligente OTIS • Schindler • TKE • KONE
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 tracking-tight">
              Catálogo Colorido de Peças & Despacho
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              Consulte especificações técnicas, compatibilidade por fabricante e solicite peças originais com rastreamento logístico direto para o seu chamado.
            </p>
          </div>

          {/* View Switcher Tabs with Colorful Pill Style */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-center shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('CATALOG')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer min-h-[42px] touch-manipulation ${
                activeTab === 'CATALOG'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>Catálogo Geral ({parts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REQUESTS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer min-h-[42px] touch-manipulation ${
                activeTab === 'REQUESTS'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>Meus Pedidos ({partRequests.length})</span>
            </button>
          </div>
        </div>

        {/* Top 4 Vibrant Metric Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-4 border-t border-slate-800/80">
          
          {/* Metric 1: Total SKUs */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total em Catálogo</span>
              <span className="text-lg font-black text-cyan-300 font-mono">{parts.length} Peças</span>
            </div>
          </div>

          {/* Metric 2: Inventory Value */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estoque Global</span>
              <span className="text-lg font-black text-emerald-300 font-mono">{totalStockItems} un</span>
            </div>
          </div>

          {/* Metric 3: Abnormal Consumption */}
          <div 
            onClick={() => setSelectedStockFilter(selectedStockFilter === 'ALERTA' ? 'ALL' : 'ALERTA')}
            className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
              selectedStockFilter === 'ALERTA'
                ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50'
                : 'bg-slate-950/80 border-amber-500/30 hover:border-amber-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Alertas Consumo</span>
              <span className="text-lg font-black text-amber-300 font-mono">{abnormalAlertsCount} Itens</span>
            </div>
          </div>

          {/* Metric 4: Active Requests */}
          <div 
            onClick={() => setActiveTab('REQUESTS')}
            className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 hover:border-purple-400 flex items-center gap-3 cursor-pointer transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pedidos em Campo</span>
              <span className="text-lg font-black text-purple-300 font-mono">{partRequests.length} Ativos</span>
            </div>
          </div>

        </div>

      </div>

      {/* VIEW 1: CATALOG */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-5">
          
          {/* BRAND COLORFUL QUICK-SELECTOR BAR */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
            
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Filtrar por Fabricante OEM:
              </span>
              {(selectedBrandFilter !== 'ALL' || selectedCategoryFilter !== 'ALL' || selectedModelFilter !== 'ALL' || selectedStockFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSelectedBrandFilter('ALL');
                    setSelectedCategoryFilter('ALL');
                    setSelectedModelFilter('ALL');
                    setSelectedStockFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Limpar Todos os Filtros
                </button>
              )}
            </div>

            {/* Brand Cards Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'ALL', label: 'Todas as Marcas', color: 'border-slate-700 text-slate-200 bg-slate-950 hover:bg-slate-900', active: 'bg-white text-slate-950 font-black shadow-md' },
                { id: 'OTIS', label: '🔵 Otis Original', color: 'border-sky-500/40 text-sky-300 bg-sky-950/30 hover:bg-sky-950/50', active: 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/30' },
                { id: 'SCHINDLER', label: '🟠 Schindler OEM', color: 'border-amber-500/40 text-amber-300 bg-amber-950/30 hover:bg-amber-950/50', active: 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30' },
                { id: 'TKE', label: '🟢 TK Elevator', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/30 hover:bg-emerald-950/50', active: 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30' },
                { id: 'KONE', label: '🟣 KONE MonoSpace', color: 'border-purple-500/40 text-purple-300 bg-purple-950/30 hover:bg-purple-950/50', active: 'bg-purple-500 text-white font-black shadow-lg shadow-purple-500/30' }
              ].map(brand => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrandFilter(brand.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[42px] ${
                    selectedBrandFilter === brand.id
                      ? brand.active
                      : brand.color
                  }`}
                >
                  <span>{brand.label}</span>
                </button>
              ))}
            </div>

            {/* CATEGORY CHIPS WITH THEMATIC COLORS */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
              <span className="text-[11px] font-bold uppercase text-slate-400 whitespace-nowrap shrink-0">Sub-Sistemas:</span>
              
              <button
                onClick={() => setSelectedCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[36px] shrink-0 ${
                  selectedCategoryFilter === 'ALL'
                    ? 'bg-slate-100 text-slate-950 font-black shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas Categorias ({parts.length})
              </button>

              {allCategories.map(cat => {
                const style = getCategoryStyle(cat);
                const isSelected = selectedCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(isSelected ? 'ALL' : cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] shrink-0 border ${
                      isSelected
                        ? style.activePill
                        : style.pill
                    }`}
                  >
                    {style.icon}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH & DETAILED SELECTORS */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-2.5">
              
              {/* Search input */}
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por código OTIS/SCH, nome da peça, modelo ou defeito..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 min-h-[42px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Model Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedModelFilter}
                  onChange={(e) => setSelectedModelFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400 min-h-[42px] cursor-pointer"
                >
                  <option value="ALL">Todos os Modelos de Elevador ({allModels.length})</option>
                  {allModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Stock Filter Status */}
              <div className="md:col-span-3">
                <select
                  value={selectedStockFilter}
                  onChange={(e) => setSelectedStockFilter(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400 min-h-[42px] cursor-pointer"
                >
                  <option value="ALL">Todo o Nível de Estoque</option>
                  <option value="CRITICO">⚠️ Estoque Crítico (&lt; 20 un)</option>
                  <option value="ALERTA">🚨 Com Alerta de Consumo Anormal</option>
                </select>
              </div>

            </div>

          </div>

          {/* VIBRANT & COLORFUL PARTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredParts.map((part) => {
              const brand = getBrandInfo(part);
              const catStyle = getCategoryStyle(part.category);

              const stockHealth = 
                part.stockQuantity >= 50 ? { label: 'Estoque Alto', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', bar: 'bg-emerald-500', percent: 100 } :
                part.stockQuantity >= 20 ? { label: 'Estoque Regular', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', bar: 'bg-cyan-500', percent: 65 } :
                part.stockQuantity >= 10 ? { label: 'Estoque Baixo', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', bar: 'bg-amber-500', percent: 35 } :
                { label: 'Estoque Crítico', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse', bar: 'bg-rose-500', percent: 15 };

              const lifeSpanRatio = Math.round((part.observedAverageLifeSpanMonths / part.expectedLifeSpanMonths) * 100);

              return (
                <div
                  key={part.id}
                  className={`relative overflow-hidden p-5 rounded-3xl bg-gradient-to-b ${catStyle.gradient} border ${catStyle.border} hover:border-cyan-400 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-2xl hover:shadow-cyan-950/20 group`}
                >
                  
                  {/* Top Bar with Brand Badge, Code and Stock Pill */}
                  <div className="space-y-3">
                    
                    {/* Header Row: Brand, Category and Stock */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${brand.badge}`}>
                            {brand.name}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${catStyle.pill} flex items-center gap-1`}>
                            {catStyle.icon}
                            <span>{part.category}</span>
                          </span>
                        </div>

                        {/* Part Code */}
                        <div className="text-xs font-mono font-black text-cyan-300 tracking-wider">
                          {part.code}
                        </div>
                      </div>

                      {/* Stock Badge */}
                      <div className="text-right shrink-0">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold border ${stockHealth.color} inline-block shadow-sm`}>
                          {part.stockQuantity} un
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{stockHealth.label}</span>
                      </div>
                    </div>

                    {/* Part Name & Price */}
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors leading-snug">
                        {part.name}
                      </h3>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-mono">
                          R$ {part.unitCost.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">/ unidade OEM</span>
                      </div>
                    </div>

                    {/* Technical Life Metrics & Progress Health Bar */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-2 text-xs">
                      
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" /> Vida Útil Média:
                        </span>
                        <span className="font-mono font-bold text-white">
                          {part.observedAverageLifeSpanMonths} / {part.expectedLifeSpanMonths} meses
                        </span>
                      </div>

                      {/* Health Meter Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            lifeSpanRatio >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                            lifeSpanRatio >= 70 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                            'bg-gradient-to-r from-amber-500 to-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, lifeSpanRatio)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                        <span>Trocados últimos 12 meses:</span>
                        <span className="font-mono font-bold text-cyan-300">{part.totalReplacedLast12Months} unidades</span>
                      </div>

                    </div>

                    {/* Abnormal Consumption Alert Banner */}
                    {part.abnormalConsumptionAlert && (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/60 to-amber-950/40 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2 shadow-md">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <strong className="block text-rose-300 text-[11px] uppercase tracking-wider font-bold">Consumo Atípico Detectado</strong>
                          <span className="text-[11px] leading-tight text-slate-200">
                            {part.abnormalAlertMessage || 'Taxa de substituição acima do desvio padrão histórico.'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Compatible Models Tags */}
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        Compatibilidade Certificada:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {part.compatibleModels.map((m, i) => (
                          <button 
                            key={i} 
                            onClick={() => setSelectedModelFilter(m)}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium cursor-pointer transition-all ${
                              selectedModelFilter === m
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                                : brand.tagBg
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Request Part Action Button */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleOpenRequestModal(part)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20 active:scale-[0.98] min-h-[42px] touch-manipulation"
                    >
                      <Package className="w-4 h-4 text-slate-950" />
                      <span>Pedir Peça (Vincular a Chamado)</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredParts.length === 0 && (
            <div className="p-12 text-center text-slate-400 space-y-3 bg-slate-900/90 rounded-3xl border border-slate-800">
              <Package className="w-10 h-10 text-cyan-500 mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-white">Nenhuma peça encontrada com os filtros atuais</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tente redefinir o fabricante, o modelo do elevador ou utilize termos de busca mais genéricos.
              </p>
              <button
                onClick={() => {
                  setSelectedBrandFilter('ALL');
                  setSelectedCategoryFilter('ALL');
                  setSelectedModelFilter('ALL');
                  setSelectedStockFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY PART REQUESTS (MEUS PEDIDOS) */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                Rastreamento Logístico de Peças ({partRequests.length} Solicitações)
              </h2>
              <p className="text-xs text-slate-400">
                Acompanhe o status do almoxarifado, despacho por motoboy express e entrega técnica no edifício.
              </p>
            </div>
            
            <button
              onClick={() => setActiveTab('CATALOG')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto min-h-[40px] touch-manipulation"
            >
              <Plus className="w-4 h-4" /> Solicitar Nova Peça do Catálogo
            </button>
          </div>

          <div className="space-y-3.5">
            {partRequests.map((req) => {
              const statusStyle = 
                req.status === 'ENTREGUE' ? { label: 'Entregue no Local', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> } :
                req.status === 'A_CAMINHO' ? { label: 'A Caminho (Motoboy Express)', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse', icon: <Truck className="w-4 h-4 text-sky-400" /> } :
                { label: 'Em Separação no Almoxarifado', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: <Clock className="w-4 h-4 text-amber-400" /> };

              const urgencyStyle = 
                req.urgency === 'CRITICA' ? 'bg-rose-500 text-white font-black animate-pulse shadow-md shadow-rose-900/50' :
                req.urgency === 'ALTA' ? 'bg-amber-500 text-slate-950 font-bold' :
                req.urgency === 'MEDIA' ? 'bg-cyan-500 text-slate-950 font-bold' :
                'bg-slate-700 text-slate-200 font-bold';

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all space-y-3.5 shadow-md"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs font-black">
                        {req.requestNumber}
                      </span>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${statusStyle.bg}`}>
                        {statusStyle.icon}
                        <span>{statusStyle.label}</span>
                      </span>
                      <span className={`px-2.5 py-1 rounded-xl text-xs ${urgencyStyle}`}>
                        Urgência: {req.urgency}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Solicitado em: {req.createdAt}
                    </span>
                  </div>

                  {/* 4 Detail Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Peça & Quantidade</span>
                      <strong className="text-white text-sm block mt-1">{req.quantity}x {req.partName}</strong>
                      <span className="text-xs text-cyan-300 font-mono font-semibold">{req.partCode}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Chamado Vinculado</span>
                      <strong className="text-slate-100 block mt-1">{req.callNumber || 'Estoque Móvel / Manutenção'}</strong>
                      <span className="text-xs text-slate-300 font-medium">{req.customerName || req.equipmentTag || 'Eq. Não Vinculado'}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Modalidade & Prazo</span>
                      <strong className="text-emerald-300 block mt-1">
                        {req.deliveryType === 'LOCAL_CHAMADO' ? 'Motoboy Express no Edifício' : 'Retirada no Almoxarifado'}
                      </strong>
                      <span className="text-xs text-slate-400">{req.estimatedDelivery}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Custo & Solicitante</span>
                      <strong className="text-amber-300 block mt-1 font-mono text-sm">
                        R$ {(req.unitCost * req.quantity).toFixed(2)}
                      </strong>
                      <span className="text-[11px] text-slate-400">Técnico: {req.technicianName}</span>
                    </div>

                  </div>

                  {req.justification && (
                    <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-cyan-300 font-semibold">Justificativa Técnica:</strong> {req.justification}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COLORFUL MODAL DE PEDIDO DE PEÇA VINCULADO A CHAMADO */}
      {selectedPartForRequest && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl shadow-cyan-950/50 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Solicitar Pedido de Peça OEM</h3>
                  <p className="text-xs text-cyan-300 font-mono">{selectedPartForRequest.name} ({selectedPartForRequest.code})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPartForRequest(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRequest} className="space-y-4 text-xs">
              
              {/* Vincular ao Chamado */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">
                  Vincular ao Chamado / Ordem de Serviço em Aberto *
                </label>
                <select
                  value={selectedCallId}
                  onChange={(e) => setSelectedCallId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 min-h-[42px]"
                >
                  <option value="">Nenhum chamado direto (Reposição de Estoque Móvel)</option>
                  {openCalls.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.callNumber} — {c.buildingName} ({c.equipmentTag}) - {c.priority}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantidade e Urgência */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">Quantidade Desejada *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedPartForRequest.stockQuantity || 10}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono font-bold min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5">Grau de Urgência *</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 min-h-[42px]"
                  >
                    <option value="CRITICA">🚨 Crítica (Elevador Parado / Passageiros)</option>
                    <option value="ALTA">🔥 Alta (Atendimento em Campo Hoje)</option>
                    <option value="MEDIA">⚡ Média (Preventiva Agendada)</option>
                    <option value="BAIXA">📦 Baixa (Estoque do Veículo)</option>
                  </select>
                </div>
              </div>

              {/* Modalidade de Entrega */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">Modalidade de Entrega *</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('LOCAL_CHAMADO')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      deliveryType === 'LOCAL_CHAMADO'
                        ? 'bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <strong className="block text-xs font-bold text-sky-300">🛵 Motoboy Express</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Entrega no edifício em ~45 min</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('RETIRADA_POLO')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      deliveryType === 'RETIRADA_POLO'
                        ? 'bg-purple-500/20 border-purple-400 text-white ring-2 ring-purple-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <strong className="block text-xs font-bold text-purple-300">🏢 Retirada Almoxarifado</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Polo Central pronto em 15 min</span>
                  </button>
                </div>
              </div>

              {/* Justificativa */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5">Justificativa Técnica</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={2}
                  placeholder="Ex: Sapata quebrada causando atrito e travamento no 6º pavimento..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Summary of Request */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-slate-400">Total do Pedido:</span>
                  <strong className="text-amber-300 font-mono block text-base font-black">
                    R$ {(selectedPartForRequest.unitCost * quantity).toFixed(2)}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Estoque restante:</span>
                  <strong className="text-emerald-400 block font-mono text-sm font-bold">
                    {selectedPartForRequest.stockQuantity - quantity} un
                  </strong>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPartForRequest(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25 min-h-[42px]"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>Confirmar Pedido de Peça</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
