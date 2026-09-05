import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Part, PartRequest } from '../../types';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Clock, 
  MapPin, 
  X, 
  Check, 
  SlidersHorizontal, 
  Box, 
  ShieldCheck, 
  Tag,
  Plus,
  Layers,
  Cpu,
  Zap,
  Compass
} from 'lucide-react';

export const PartsModule: React.FC = () => {
  const { parts, partRequests, createPartRequest, calls, currentUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'CATALOG' | 'REQUESTS'>('CATALOG');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'ALL' | 'CRITICO' | 'ALERTA'>('ALL');

  // Request Part Modal State
  const [selectedPartForRequest, setSelectedPartForRequest] = useState<Part | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [urgency, setUrgency] = useState<'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA'>('ALTA');
  const [deliveryType, setDeliveryType] = useState<'LOCAL_CHAMADO' | 'RETIRADA_POLO' | 'ESTOQUE_MOVEL'>('LOCAL_CHAMADO');
  const [justification, setJustification] = useState<string>('');

  // Extract all distinct categories
  const allCategories = Array.from(
    new Set(parts.map(p => p.category))
  ).filter(Boolean).sort();

  // Brand identification helper
  const getBrandInfo = (part: Part) => {
    const code = part.code.toUpperCase();
    const models = part.compatibleModels.join(' ').toUpperCase();
    if (code.startsWith('OTIS') || models.includes('OTIS')) {
      return { id: 'OTIS', name: 'Otis Original', badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30' };
    }
    if (code.startsWith('SCH') || models.includes('SCHINDLER')) {
      return { id: 'SCHINDLER', name: 'Schindler OEM', badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    }
    if (code.startsWith('TKE') || models.includes('TK') || models.includes('THYSSEN')) {
      return { id: 'TKE', name: 'TK Elevator', badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
    }
    if (code.startsWith('KONE') || models.includes('KONE')) {
      return { id: 'KONE', name: 'KONE MonoSpace', badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
    }
    return { id: 'OTHER', name: 'Multimarca', badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600' };
  };

  // Filter parts
  const filteredParts = parts.filter(p => {
    const brandInfo = getBrandInfo(p);
    const matchesSearch = 
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.compatibleModels.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategoryFilter === 'ALL' ||
      p.category === selectedCategoryFilter;

    const matchesBrand = 
      selectedBrandFilter === 'ALL' ||
      brandInfo.id === selectedBrandFilter;

    const matchesStock = 
      selectedStockFilter === 'ALL' ? true :
      selectedStockFilter === 'CRITICO' ? p.stockQuantity < 20 :
      selectedStockFilter === 'ALERTA' ? Boolean(p.abnormalConsumptionAlert) : true;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  // Calculate stats
  const totalStockItems = parts.reduce((acc, p) => acc + p.stockQuantity, 0);
  const criticalStockCount = parts.filter(p => p.stockQuantity < 20).length;

  // Open calls for technician
  const openCalls = calls.filter(c => c.status !== 'CONCLUIDO' && c.status !== 'CANCELADO');

  const handleOpenRequestModal = (part: Part) => {
    setSelectedPartForRequest(part);
    setQuantity(1);
    setUrgency('ALTA');
    setDeliveryType('LOCAL_CHAMADO');
    setJustification(`Substituição de ${part.name} em atendimento de campo.`);
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

    addToast('success', 'Pedido de Peça Enviado!', `${quantity}x ${selectedPartForRequest.name} (${selectedPartForRequest.code})`);

    setSelectedPartForRequest(null);
    setActiveTab('REQUESTS');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* 1. CLEAN COMPACT HEADER & VIEW TOGGLE (Despoluído: Sem fundos espalhafatosos e blur excessivo) */}
      <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Catálogo de Peças & Almoxarifado
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Linha Multimarcas
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Peças originais homologadas Otis, Schindler, TK Elevator e KONE.
            </p>
          </div>
        </div>

        {/* Tab Switcher & KPIs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('CATALOG')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'CATALOG'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Catálogo ({parts.length})
            </button>

            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                activeTab === 'REQUESTS'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Meus Pedidos ({partRequests.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CATALOG VIEW */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          
          {/* Unified Compact Filter & Search Toolbar (Single Row) */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código, nome da peça, modelo de elevador..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[38px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Brand Filter */}
              <select
                value={selectedBrandFilter}
                onChange={(e) => setSelectedBrandFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[38px]"
              >
                <option value="ALL">Todas as Marcas</option>
                <option value="OTIS">Otis Original</option>
                <option value="SCHINDLER">Schindler OEM</option>
                <option value="TKE">TK Elevator</option>
                <option value="KONE">KONE MonoSpace</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[38px]"
              >
                <option value="ALL">Todas as Categorias</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                value={selectedStockFilter}
                onChange={(e) => setSelectedStockFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-500 min-h-[38px]"
              >
                <option value="ALL">Qualquer Estoque</option>
                <option value="CRITICO">Estoque Baixo (&lt; 20)</option>
                <option value="ALERTA">Consumo Atípico</option>
              </select>

              {(selectedBrandFilter !== 'ALL' || selectedCategoryFilter !== 'ALL' || selectedStockFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedBrandFilter('ALL');
                    setSelectedCategoryFilter('ALL');
                    setSelectedStockFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="p-2 text-xs text-rose-400 hover:text-rose-300 font-bold"
                  title="Limpar filtros"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Clean Parts Grid (3 Columns, Clean Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredParts.map((part) => {
              const brand = getBrandInfo(part);
              const isLowStock = part.stockQuantity < 20;

              return (
                <div
                  key={part.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-2">
                    {/* Header: Code & Brand Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {part.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${brand.badgeColor}`}>
                        {brand.name}
                      </span>
                    </div>

                    {/* Part Name */}
                    <h3 className="text-sm font-bold text-white line-clamp-2">
                      {part.name}
                    </h3>

                    {/* Category & Price */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400 truncate">{part.category}</span>
                      <span className="font-mono font-bold text-white">
                        R$ {part.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Stock Status Pill */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500">Disponibilidade:</span>
                      <span className={`font-mono font-semibold px-2 py-0.5 rounded ${
                        isLowStock
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {part.stockQuantity} un {isLowStock ? '(Crítico)' : 'em estoque'}
                      </span>
                    </div>

                    {/* Compatible Models */}
                    <div className="pt-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Compatibilidade:</div>
                      <div className="flex flex-wrap gap-1">
                        {part.compatibleModels.slice(0, 3).map((m, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[10px] truncate max-w-[150px]">
                            {m}
                          </span>
                        ))}
                        {part.compatibleModels.length > 3 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{part.compatibleModels.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    onClick={() => handleOpenRequestModal(part)}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Solicitar Peça</span>
                  </button>
                </div>
              );
            })}
          </div>

          {filteredParts.length === 0 && (
            <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
              <Package className="w-6 h-6 text-slate-500 mx-auto" />
              <p>Nenhuma peça encontrada para os filtros selecionados.</p>
            </div>
          )}

        </div>
      )}

      {/* 3. REQUESTS VIEW (MEUS PEDIDOS) */}
      {activeTab === 'REQUESTS' && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-purple-400" />
              Histórico de Pedidos & Rastreamento em Campo
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {partRequests.length} solicitações ativas
            </span>
          </div>

          <div className="space-y-2.5">
            {partRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-cyan-400">{req.partCode}</span>
                    <strong className="text-white">{req.partName}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {req.quantity} unidade(s)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.urgency === 'CRITICA' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {req.urgency}
                    </span>
                  </div>

                  <div className="text-slate-400 flex items-center gap-2 flex-wrap text-[11px]">
                    {req.callNumber && (
                      <span>O.S. Vinculada: <strong className="text-slate-200">{req.callNumber}</strong></span>
                    )}
                    {req.equipmentTag && (
                      <span>• Ativo: <strong className="text-slate-200">{req.equipmentTag}</strong></span>
                    )}
                    {req.customerName && (
                      <span>• Local: {req.customerName}</span>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 space-y-1">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    req.status === 'ENTREGUE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : req.status === 'EM_TRANSITO'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}>
                    {req.status === 'PENDENTE' ? 'Em Separação' : req.status === 'EM_TRANSITO' ? 'Em Trânsito' : 'Entregue'}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Solicitado às {req.requestedAt ? req.requestedAt.split('T')[1]?.substring(0, 5) || '11:30' : '11:30'}
                  </div>
                </div>
              </div>
            ))}

            {partRequests.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                Nenhum pedido de peça registrado no momento.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL DE SOLICITAÇÃO DE PEÇA (Ergonômico & Pré-vinculado) */}
      {selectedPartForRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Solicitar Peça ao Almoxarifado</h3>
                <p className="text-[11px] text-cyan-400 font-mono">{selectedPartForRequest.code} • {selectedPartForRequest.name}</p>
              </div>
              <button
                onClick={() => setSelectedPartForRequest(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRequest} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quantidade Necessária *</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedPartForRequest.stockQuantity || 10}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nível de Urgência *</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
                  >
                    <option value="CRITICA">Crítica (Elevador Parado)</option>
                    <option value="ALTA">Alta (Atendimento Hoje)</option>
                    <option value="MEDIA">Média (Preventiva)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Vincular a uma Ordem de Serviço *</label>
                <select
                  value={selectedCallId}
                  onChange={(e) => setSelectedCallId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
                  required
                >
                  <option value="">Selecione o chamado...</option>
                  {openCalls.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.callNumber} — {c.equipmentTag} ({c.customerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tipo de Entrega / Retirada *</label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
                >
                  <option value="LOCAL_CHAMADO">Entregar no Local do Chamado (Despacho Expresso)</option>
                  <option value="RETIRADA_POLO">Retirada no Almoxarifado Central</option>
                  <option value="ESTOQUE_MOVEL">Reposição para Estoque Móvel da Viatura</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Justificativa Técnica</label>
                <input
                  type="text"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Ex: Peça danificada por desgaste mecânico..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPartForRequest(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirmar Pedido</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
