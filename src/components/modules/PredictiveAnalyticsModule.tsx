import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Clock, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  RotateCcw,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { 
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

// Regressão Linear Preditiva para projeção de próximo período
function calcularPredicao(serie: number[]) {
  const n = serie.length;
  if (n < 2) return { previsao: serie[0] || 0, inclinacao: 0 };

  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = serie;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + (b * y[i]), 0);
  const sumXX = x.reduce((a, b) => a + (b * b), 0);

  const inclinacao = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercepto = (sumY - inclinacao * sumX) / n;

  const proximoPeriodo = n + 1;
  const previsao = Math.max(0, Math.round(inclinacao * proximoPeriodo + intercepto));

  return { previsao, inclinacao };
}

export const PredictiveAnalyticsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ANDAR' | 'USO' | 'BUSCA'>('ANDAR');
  const [liveDateTime, setLiveDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const agora = new Date();
      const dia = String(agora.getDate()).padStart(2, '0');
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const ano = agora.getFullYear();
      const horas = String(agora.getHours()).padStart(2, '0');
      const minutos = String(agora.getMinutes()).padStart(2, '0');
      const segundos = String(agora.getSeconds()).padStart(2, '0');
      setLiveDateTime(`${dia}/${mes}/${ano} - ${horas}:${minutos}:${segundos}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // =========================================================================
  // SUB-MÓDULO 1: ANÁLISE PREDITIVA POR ANDAR (Analise andar html)
  // =========================================================================
  const [historicoAndares, setHistoricoAndares] = useState<Record<number, number[]>>({
    1: [6, 8, 9, 11],
    2: [14, 12, 10, 7],
    3: [12, 18, 26, 35],
    4: [3, 2, 4, 3],
    5: [9, 11, 14, 18]
  });
  const [customAndarInput, setCustomAndarInput] = useState('');

  const adicionarChamadoAndar = (andar: number) => {
    setHistoricoAndares(prev => {
      const copy = { ...prev };
      if (!copy[andar]) {
        copy[andar] = [0, 0, 0, 0];
      }
      const arr = [...copy[andar]];
      arr[arr.length - 1] += 1;
      copy[andar] = arr;
      return copy;
    });
  };

  const handleCustomAndarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(customAndarInput);
    if (!isNaN(num) && num >= 0) {
      adicionarChamadoAndar(num);
      setCustomAndarInput('');
    }
  };

  // Processamento dos dados por andar
  const andaresKeys = Object.keys(historicoAndares).map(Number);
  let totalChamadosAndares = 0;
  let maxChamadosAndar = -1;
  let andarLiderNum: number | null = null;
  let maiorPrevisaoAndar = -1;
  let andarMaiorRiscoNum: number | null = null;
  let maiorInclinacaoAndar = 0;

  const relatorioAndares = andaresKeys.map(andar => {
    const serie = historicoAndares[andar];
    const atual = serie[serie.length - 1];
    totalChamadosAndares += atual;

    if (atual > maxChamadosAndar) {
      maxChamadosAndar = atual;
      andarLiderNum = andar;
    }

    const { previsao, inclinacao } = calcularPredicao(serie);
    if (previsao > maiorPrevisaoAndar) {
      maiorPrevisaoAndar = previsao;
      andarMaiorRiscoNum = andar;
      maiorInclinacaoAndar = inclinacao;
    }

    return {
      andar: `Andar ${andar}`,
      numAndar: andar,
      atual,
      previsao,
      inclinacao
    };
  }).sort((a, b) => b.atual - a.atual);

  // =========================================================================
  // SUB-MÓDULO 2: ANÁLISE DE USO DIÁRIO DO EQUIPAMENTO (Analise de uso html)
  // =========================================================================
  const [historicoEquipamentos, setHistoricoEquipamentos] = useState<Record<string, number[]>>({
    "Gerador 01": [4, 6, 8, 10],
    "Chiller 02": [12, 11, 9, 8],
    "Compressor A": [8, 12, 18, 24],
    "Bomba Hidráulica": [2, 3, 2, 4],
    "Elevador Carga": [10, 12, 14, 16]
  });
  const [customEqInput, setCustomEqInput] = useState('');

  const adicionarHoraEquipamento = (nome: string) => {
    setHistoricoEquipamentos(prev => {
      const copy = { ...prev };
      if (!copy[nome]) {
        copy[nome] = [0, 0, 0, 0];
      }
      const arr = [...copy[nome]];
      arr[arr.length - 1] += 1;
      copy[nome] = arr;
      return copy;
    });
  };

  const handleCustomEqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = customEqInput.trim();
    if (nome) {
      adicionarHoraEquipamento(nome);
      setCustomEqInput('');
    }
  };

  let totalHorasEquipamentos = 0;
  let maxHorasEq = -1;
  let eqLiderNome: string | null = null;
  let maiorPrevisaoEq = -1;
  let eqMaiorRiscoNome: string | null = null;
  let maiorInclinacaoEq = 0;

  const relatorioEquipamentos = Object.keys(historicoEquipamentos).map(nome => {
    const serie = historicoEquipamentos[nome];
    const atual = serie[serie.length - 1];
    totalHorasEquipamentos += atual;

    if (atual > maxHorasEq) {
      maxHorasEq = atual;
      eqLiderNome = nome;
    }

    const { previsao, inclinacao } = calcularPredicao(serie);
    if (previsao > maiorPrevisaoEq) {
      maiorPrevisaoEq = previsao;
      eqMaiorRiscoNome = nome;
      maiorInclinacaoEq = inclinacao;
    }

    return {
      equipamento: nome,
      atual,
      previsao,
      inclinacao
    };
  }).sort((a, b) => b.atual - a.atual);

  // =========================================================================
  // SUB-MÓDULO 3: ANÁLISE DE BUSCA DE CLIENTES POR TELEFONE (Busca cliente html)
  // =========================================================================
  const [historicoClientes, setHistoricoClientes] = useState<Record<string, number[]>>({
    "(11) 98765-4321 (Empresa Alpha)": [12, 14, 18, 22],
    "(21) 97654-3210 (Tech Brasil)": [5, 8, 12, 15],
    "(31) 98888-7777 (Distribuidora X)": [20, 18, 16, 12],
    "(41) 99999-1111 (Comércio Y)": [2, 4, 3, 5],
    "(51) 98123-4567 (Grupo Z)": [8, 10, 15, 20]
  });
  const [customTelefoneInput, setCustomTelefoneInput] = useState('');

  const adicionarBuscaCliente = (telefoneOuCliente: string) => {
    setHistoricoClientes(prev => {
      const copy = { ...prev };
      if (!copy[telefoneOuCliente]) {
        copy[telefoneOuCliente] = [0, 0, 0, 0];
      }
      const arr = [...copy[telefoneOuCliente]];
      arr[arr.length - 1] += 1;
      copy[telefoneOuCliente] = arr;
      return copy;
    });
  };

  const handleCustomTelefoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = customTelefoneInput.trim();
    if (txt) {
      adicionarBuscaCliente(txt);
      setCustomTelefoneInput('');
    }
  };

  let totalBuscasClientes = 0;
  let maxBuscas = -1;
  let clienteLiderNome: string | null = null;
  let maiorPrevisaoCliente = -1;
  let clienteMaiorRiscoNome: string | null = null;
  let maiorInclinacaoCliente = 0;

  const relatorioClientes = Object.keys(historicoClientes).map(chave => {
    const serie = historicoClientes[chave];
    const atual = serie[serie.length - 1];
    totalBuscasClientes += atual;

    if (atual > maxBuscas) {
      maxBuscas = atual;
      clienteLiderNome = chave;
    }

    const { previsao, inclinacao } = calcularPredicao(serie);
    if (previsao > maiorPrevisaoCliente) {
      maiorPrevisaoCliente = previsao;
      clienteMaiorRiscoNome = chave;
      maiorInclinacaoCliente = inclinacao;
    }

    return {
      cliente: chave,
      curto: chave.split(' ')[0],
      atual,
      previsao,
      inclinacao
    };
  }).sort((a, b) => b.atual - a.atual);

  // Evolução temporal do líder de buscas
  const serieLider = clienteLiderNome ? historicoClientes[clienteLiderNome] || [0, 0, 0, 0] : [0, 0, 0, 0];
  const evolucaoLiderData = serieLider.map((val, idx) => ({
    periodo: idx === 3 ? 'Hoje (Atual)' : `Dia -${3 - idx}`,
    buscas: val
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Corporativo com Data/Hora em Tempo Real */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Inteligência Preditiva Incremental
            </span>
            <span className="text-xs text-slate-400 font-mono">Regressão Linear & Análise Multidimensional</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Painel Analítico de Predição & Demanda
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitoramento preditivo com modelo de machine learning linear para chamados por andar, horas de uso diário e recorrência de clientes.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SISTEMA OPERACIONAL</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">{liveDateTime}</span>
        </div>
      </div>

      {/* Seletor de Sub-Módulos (Abas) */}
      <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ANDAR')}
          className={`flex-1 py-2.5 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap min-h-[42px] cursor-pointer touch-manipulation ${
            activeTab === 'ANDAR'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>1. Chamados por Andar</span>
        </button>

        <button
          onClick={() => setActiveTab('USO')}
          className={`flex-1 py-2.5 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap min-h-[42px] cursor-pointer touch-manipulation ${
            activeTab === 'USO'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>2. Uso Diário do Equipamento</span>
        </button>

        <button
          onClick={() => setActiveTab('BUSCA')}
          className={`flex-1 py-2.5 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap min-h-[42px] cursor-pointer touch-manipulation ${
            activeTab === 'BUSCA'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>3. Busca de Clientes / Telefones</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* ABA 1: ANÁLISE PREDITIVA POR ANDAR */}
      {/* ==================================================================== */}
      {activeTab === 'ANDAR' && (
        <div className="space-y-6">
          
          {/* Barra de Entrada Operacional (+1 Chamado) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Módulo de Entrada Operacional (Incremento Unitário +1)
              </h3>
              <span className="text-[11px] text-slate-400">Clique para somar +1 ocorrência</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form onSubmit={handleCustomAndarSubmit} className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  min="0"
                  value={customAndarInput}
                  onChange={(e) => setCustomAndarInput(e.target.value)}
                  placeholder="Número do andar (ex: 6)"
                  className="w-full sm:w-60 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  +1 Registrar
                </button>
              </form>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[1, 2, 3, 4, 5].map(andar => (
                  <button
                    key={andar}
                    onClick={() => adicionarChamadoAndar(andar)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                  >
                    +1 no Andar {andar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards de KPI Executivos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Maior Recorrência Atual</div>
              <div className="text-2xl font-bold font-mono text-cyan-300">Andar {andarLiderNum ?? '-'}</div>
              <div className="text-xs text-slate-400">
                {maxChamadosAndar} chamados ({totalChamadosAndares > 0 ? ((maxChamadosAndar / totalChamadosAndares) * 100).toFixed(1) : 0}%)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Volume Consolidado</div>
              <div className="text-2xl font-bold font-mono text-slate-100">{totalChamadosAndares} chamados</div>
              <div className="text-xs text-slate-400">Base histórica integrada</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projeção Preditiva Líder</div>
              <div className="text-2xl font-bold font-mono text-amber-400">Andar {andarMaiorRiscoNum ?? '-'}</div>
              <div className="text-xs text-slate-400">
                Est. {maiorPrevisaoAndar} chamados ({maiorInclinacaoAndar > 0 ? 'Alta Demanda' : 'Estável'})
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eficiência de SLA</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">96.4%</div>
              <div className="text-xs text-slate-400">Dentro das metas corporativas</div>
            </div>
          </div>

          {/* Grid Principal: Tabela de Ranking + Gráfico Comparativo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Tabela de Ranking */}
            <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100">Ranking Executivo por Recorrência</h3>
                <span className="text-xs font-mono text-cyan-400">{relatorioAndares.length} Andares</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2 font-bold">Andar</th>
                      <th className="pb-2 font-bold">Atual</th>
                      <th className="pb-2 font-bold">Participação</th>
                      <th className="pb-2 font-bold">Projeção</th>
                      <th className="pb-2 font-bold">Risco</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {relatorioAndares.map((item, idx) => {
                      const perc = totalChamadosAndares > 0 ? ((item.atual / totalChamadosAndares) * 100).toFixed(1) : '0';
                      const isCritico = item.inclinacao > 2.0;
                      const isAtencao = item.inclinacao > 0.5 && !isCritico;

                      return (
                        <tr key={item.numAndar} className="hover:bg-slate-800/40">
                          <td className="py-2.5 font-bold text-slate-200">
                            {idx + 1}º - {item.andar}
                          </td>
                          <td className="py-2.5 font-mono text-cyan-300 font-bold">{item.atual}</td>
                          <td className="py-2.5 text-slate-400 font-mono">{perc}%</td>
                          <td className="py-2.5 font-mono font-bold text-amber-300">{item.previsao}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isCritico
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : isAtencao
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {isCritico ? 'Crítico' : isAtencao ? 'Atenção' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gráfico Comparativo Recharts */}
            <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100">Volume Atual vs. Projeção Preditiva</h3>
                <span className="text-xs text-slate-400">Próximo Período Est.</span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={relatorioAndares} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="andar" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1117', borderColor: '#2a303c', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="atual" name="Volume Atual" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previsao" name="Projeção Preditiva" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 2: ANÁLISE DE USO DIÁRIO DO EQUIPAMENTO */}
      {/* ==================================================================== */}
      {activeTab === 'USO' && (
        <div className="space-y-6">
          
          {/* Barra de Registro Operacional (+1h) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Módulo de Registro Operacional (+1 Hora de Uso por Clique)
              </h3>
              <span className="text-[11px] text-slate-400">Ciclos & Horas Acumuladas</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form onSubmit={handleCustomEqSubmit} className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={customEqInput}
                  onChange={(e) => setCustomEqInput(e.target.value)}
                  placeholder="Nome do equipamento (ex: Gerador 02)"
                  className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  +1h Registrar
                </button>
              </form>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {Object.keys(historicoEquipamentos).map(nome => (
                  <button
                    key={nome}
                    onClick={() => adicionarHoraEquipamento(nome)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                  >
                    +1h {nome}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards de KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Maior Uso Diário Atual</div>
              <div className="text-2xl font-bold font-mono text-cyan-300">{eqLiderNome ?? '-'}</div>
              <div className="text-xs text-slate-400">
                {maxHorasEq}h acumuladas ({totalHorasEquipamentos > 0 ? ((maxHorasEq / totalHorasEquipamentos) * 100).toFixed(1) : 0}%)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Horas Consolidado</div>
              <div className="text-2xl font-bold font-mono text-slate-100">{totalHorasEquipamentos} horas</div>
              <div className="text-xs text-slate-400">Base diária integrada</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projeção de Sobrecarga</div>
              <div className="text-2xl font-bold font-mono text-amber-400">{eqMaiorRiscoNome ?? '-'}</div>
              <div className="text-xs text-slate-400">
                Est. {maiorPrevisaoEq}h ({maiorInclinacaoEq > 1.5 ? 'Tendência de Sobrecarga' : 'Uso Estável'})
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Índice de Saúde da Frota</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">98.2%</div>
              <div className="text-xs text-slate-400">Operação dentro dos parâmetros</div>
            </div>
          </div>

          {/* Grid: Tabela + Gráfico de Horas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100">Ranking por Horas de Uso</h3>
                <span className="text-xs font-mono text-cyan-400">{relatorioEquipamentos.length} Ativos</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2 font-bold">Equipamento</th>
                      <th className="pb-2 font-bold">Uso Atual</th>
                      <th className="pb-2 font-bold">Participação</th>
                      <th className="pb-2 font-bold">Projeção</th>
                      <th className="pb-2 font-bold">Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {relatorioEquipamentos.map((item, idx) => {
                      const perc = totalHorasEquipamentos > 0 ? ((item.atual / totalHorasEquipamentos) * 100).toFixed(1) : '0';
                      const isManutencao = item.inclinacao > 2.0;
                      const isAtencao = item.inclinacao > 0.8 && !isManutencao;

                      return (
                        <tr key={item.equipamento} className="hover:bg-slate-800/40">
                          <td className="py-2.5 font-bold text-slate-200">
                            {idx + 1}º - {item.equipamento}
                          </td>
                          <td className="py-2.5 font-mono text-cyan-300 font-bold">{item.atual} h</td>
                          <td className="py-2.5 text-slate-400 font-mono">{perc}%</td>
                          <td className="py-2.5 font-mono font-bold text-amber-300">{item.previsao} h</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isManutencao
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : isAtencao
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {isManutencao ? 'Requer Manutenção' : isAtencao ? 'Elevado' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100">Uso Atual vs. Projeção de Sobrecarga</h3>
                <span className="text-xs text-slate-400">Ciclos em Horas</span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={relatorioEquipamentos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="equipamento" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1117', borderColor: '#2a303c', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="atual" name="Uso Atual (Horas)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previsao" name="Projeção Próx. Período" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 3: BUSCA DE CLIENTES POR TELEFONE */}
      {/* ==================================================================== */}
      {activeTab === 'BUSCA' && (
        <div className="space-y-6">
          
          {/* Barra de Registro Operacional (+1 Busca) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                Módulo de Registro Operacional (+1 Busca por Clique)
              </h3>
              <span className="text-[11px] text-slate-400">Atendimento 24/7</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form onSubmit={handleCustomTelefoneSubmit} className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={customTelefoneInput}
                  onChange={(e) => setCustomTelefoneInput(e.target.value)}
                  placeholder="Telefone ou Cliente (ex: 11999998888)"
                  className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  +1 Registrar Busca
                </button>
              </form>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {Object.keys(historicoClientes).slice(0, 4).map(chave => (
                  <button
                    key={chave}
                    onClick={() => adicionarBuscaCliente(chave)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                  >
                    +1 {chave.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards de KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Telefone Mais Buscado</div>
              <div className="text-xl font-bold font-mono text-cyan-300 truncate">{clienteLiderNome?.split(' ')[0] ?? '-'}</div>
              <div className="text-xs text-slate-400">
                {maxBuscas} consultas ({totalBuscasClientes > 0 ? ((maxBuscas / totalBuscasClientes) * 100).toFixed(1) : 0}%)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Volume Total de Buscas</div>
              <div className="text-2xl font-bold font-mono text-slate-100">{totalBuscasClientes}</div>
              <div className="text-xs text-slate-400">Base de consultas integrada</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projeção Preditiva Líder</div>
              <div className="text-xl font-bold font-mono text-amber-400 truncate">{clienteMaiorRiscoNome?.split(' ')[0] ?? '-'}</div>
              <div className="text-xs text-slate-400">
                Est. {maiorPrevisaoCliente} buscas ({maiorInclinacaoCliente > 0 ? 'Frequência Alta' : 'Frequência Estável'})
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Localização</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">99.1%</div>
              <div className="text-xs text-slate-400">Dentro das metas da central</div>
            </div>
          </div>

          {/* Gráficos: Barras Duplas + Linhas da Evolução */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gráfico 1: Barras Duplas */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100">Volume de Consultas vs. Projeção Preditiva</h3>
                <span className="text-xs text-slate-400">Por Cliente / Telefone</span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={relatorioClientes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="curto" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1117', borderColor: '#2a303c', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="atual" name="Buscas Atuais" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previsao" name="Projeção Preditiva" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Evolução Temporal do Líder */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Evolução do Mais Consultado</h3>
                  <p className="text-[11px] text-slate-400 truncate">{clienteLiderNome}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Trend Diário
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoLiderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="periodo" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f1117', borderColor: '#2a303c', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="buscas" name="Consultas" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
