import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { querySmartFlowAI, AIChatMessage } from '../../services/geminiService';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ArrowUpRight, 
  TrendingUp, 
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const { equipments, calls, technicians, contracts, parts, setActiveView } = useApp();
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: 'Olá! Sou o **SmartFlow AI Copilot**, o cérebro operacional e preditivo da OTIS. Estou monitorando os dados em tempo real de equipamentos, técnicos, contratos e telemetria. Como posso ajudar sua tomada de decisão?',
      timestamp: 'Agora'
    }
  ]);

  const quickQuestions = [
    'Quais cidades possuem maior taxa de chamados?',
    'Quais equipamentos estão em risco preditivo?',
    'Qual técnico está acima do tempo médio?',
    'Quais contratos estão perdendo margem?',
    'Qual peça apresenta consumo anormal?'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    const userMsg: AIChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsThinking(true);

    setTimeout(() => {
      const response = querySmartFlowAI(query, {
        equipments,
        calls,
        technicians,
        contracts,
        parts
      });

      const aiMsg: AIChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metrics: response.metrics,
        suggestedAction: response.suggestedAction
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 600);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative">
        
        {/* Drawer Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/30 shrink-0">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">SmartFlow AI Copilot</h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  3 Camadas
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Inteligência Operacional • Preditiva • Estratégica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
            aria-label="Fechar Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3.5 sm:px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Perguntas Rápidas:
          </span>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 hover:text-cyan-300 text-slate-300 border border-slate-700/60 hover:border-cyan-500/40 transition-colors shrink-0 whitespace-nowrap cursor-pointer touch-manipulation min-h-[32px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-950/90 border border-slate-800/90 text-slate-200 rounded-bl-none shadow-sm'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-line">
                  {m.text}
                </div>

                {/* Optional Metrics Card inside assistant reply */}
                {m.metrics && m.metrics.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {m.metrics.map((met, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">{met.label}</div>
                        <div className="text-xs font-bold font-mono text-cyan-300 mt-0.5">{met.value}</div>
                        {met.trend && (
                          <div className="text-[9px] text-slate-400 mt-0.5">{met.trend}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Action Button */}
                {m.suggestedAction && (
                  <div className="mt-3 pt-2">
                    <button
                      onClick={() => {
                        if (m.suggestedAction?.actionType === 'NAVIGATE_MAPS') setActiveView('maps');
                        else if (m.suggestedAction?.actionType === 'NAVIGATE_PREDICTIVE') setActiveView('maintenance');
                        else if (m.suggestedAction?.actionType === 'NAVIGATE_SUPERVISOR') setActiveView('supervisors');
                        else if (m.suggestedAction?.actionType === 'NAVIGATE_FINANCIAL') setActiveView('financial');
                        else if (m.suggestedAction?.actionType === 'NAVIGATE_PARTS') setActiveView('parts');
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30 transition-colors cursor-pointer"
                    >
                      <span>{m.suggestedAction.label}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className={`text-[10px] mt-1.5 text-right ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl rounded-bl-none p-3 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                <span>SmartFlow AI processando correlações...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Pergunte ao SmartFlow AI sobre frotas, riscos, custos..."
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isThinking}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-medium shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 text-[10px] text-center text-slate-400">
            Powered by SmartFlow Reasoning Core & @google/genai
          </div>
        </div>

      </div>
    </div>
  );
};
