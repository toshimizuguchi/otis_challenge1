import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TimePunchRecord } from '../../types';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  LogIn, 
  LogOut, 
  Zap, 
  X, 
  Calendar, 
  ShieldCheck, 
  History,
  Timer
} from 'lucide-react';

interface TimeClockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeClockModal: React.FC<TimeClockModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, employees, timePunches, registerTimePunch } = useApp();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedPunchType, setSelectedPunchType] = useState<TimePunchRecord['type']>('ENTRADA');
  const [locationText, setLocationText] = useState<string>('Polo Operacional - Base Principal (GPS Ativo)');
  const [notes, setNotes] = useState<string>('');
  const [isLateChecked, setIsLateChecked] = useState<boolean>(false);
  const [lateMinutesInput, setLateMinutesInput] = useState<number>(15);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState<boolean>(false);
  const [lastRegisteredPunch, setLastRegisteredPunch] = useState<TimePunchRecord | null>(null);

  // Find employee corresponding to current user
  const currentEmployee = employees.find(
    e => e.userId === currentUser.id || e.name === currentUser.name || e.email === currentUser.email
  ) || employees[0];

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update default location according to employee's unit
  useEffect(() => {
    if (currentEmployee) {
      setLocationText(`${currentEmployee.unit || currentEmployee.city || 'Polo Operacional'} (GPS Conectado)`);
    }
  }, [currentEmployee]);

  if (!isOpen) return null;

  const formattedHours = currentTime.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const formattedDate = currentTime.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const punch = registerTimePunch({
      type: selectedPunchType,
      location: locationText,
      notes: notes.trim() || undefined,
      isLate: isLateChecked,
      lateMinutes: isLateChecked ? Number(lateMinutesInput) : 0,
      employeeId: currentEmployee?.id
    });

    setLastRegisteredPunch(punch);
    setIsSuccessAnimated(true);

    setTimeout(() => {
      setIsSuccessAnimated(false);
      onClose();
    }, 1600);
  };

  // Filter punches from current employee
  const employeePunchesToday = timePunches
    .filter(p => p.employeeId === currentEmployee?.id || p.employeeName === currentUser.name)
    .slice(0, 5);

  const getPunchTypeBadge = (type: TimePunchRecord['type']) => {
    switch (type) {
      case 'ENTRADA':
        return { label: 'Entrada Turno', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: LogIn };
      case 'ALMOCO_SAIDA':
        return { label: 'Saída Almoço', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Coffee };
      case 'ALMOCO_RETORNO':
        return { label: 'Retorno Almoço', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: Clock };
      case 'SAIDA':
        return { label: 'Fim de Expediente', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: LogOut };
      case 'HORA_EXTRA':
        return { label: 'Hora Extra / Plantão', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Zap };
      default:
        return { label: type, bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Clock };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Gradient Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Ponto Eletrônico Digital
                </span>
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Criptografado & Geolocalizado
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Registrar Ponto / Jornada
              </h2>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/50"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Digital Clock Display */}
        <div className="p-5 bg-gradient-to-b from-slate-950/60 to-slate-900/40 border-b border-slate-800/80 text-center">
          <div className="inline-block px-6 py-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-lg shadow-cyan-950/20">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-300 tracking-wider">
              {formattedHours}
            </div>
            <div className="text-xs text-slate-400 capitalize mt-0.5 flex items-center justify-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </div>
          </div>

          {/* Current User Snapshot */}
          <div className="mt-3.5 flex items-center justify-center gap-3">
            {currentEmployee?.avatar ? (
              <img 
                src={currentEmployee.avatar} 
                alt={currentEmployee.name} 
                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                {currentUser.name.substring(0, 2)}
              </div>
            )}
            <div className="text-left text-xs">
              <p className="font-semibold text-white">{currentEmployee?.name || currentUser.name}</p>
              <p className="text-slate-400 text-[11px]">{currentEmployee?.roleTitle || currentUser.role} • {currentEmployee?.unit || 'Polo Sudeste'}</p>
            </div>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              currentEmployee?.currentPunchStatus === 'EM_JORNADA' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : currentEmployee?.currentPunchStatus === 'EM_INTERVALO'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {currentEmployee?.currentPunchStatus === 'EM_JORNADA' ? '🟢 Em Jornada' : currentEmployee?.currentPunchStatus === 'EM_INTERVALO' ? '☕ Em Intervalo' : '⚪ Fora de Turno'}
            </span>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleRegister} className="p-5 sm:p-6 space-y-4">
          
          {/* Punch Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Selecione o Tipo de Batida:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              
              <button
                type="button"
                onClick={() => setSelectedPunchType('ENTRADA')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedPunchType === 'ENTRADA'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-sm shadow-emerald-950/30 scale-[1.02]'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <div>Entrada</div>
                  <div className="text-[10px] text-slate-400 font-normal">Início do turno</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPunchType('ALMOCO_SAIDA')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedPunchType === 'ALMOCO_SAIDA'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-sm shadow-amber-950/30 scale-[1.02]'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-left">
                  <div>Saída Almoço</div>
                  <div className="text-[10px] text-slate-400 font-normal">Pausa refeição</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPunchType('ALMOCO_RETORNO')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedPunchType === 'ALMOCO_RETORNO'
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-sm shadow-cyan-950/30 scale-[1.02]'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="text-left">
                  <div>Retorno Almoço</div>
                  <div className="text-[10px] text-slate-400 font-normal">Volta ao trabalho</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPunchType('SAIDA')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedPunchType === 'SAIDA'
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-200 shadow-sm shadow-rose-950/30 scale-[1.02]'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="text-left">
                  <div>Saída</div>
                  <div className="text-[10px] text-slate-400 font-normal">Fim de expediente</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPunchType('HORA_EXTRA')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all col-span-2 sm:col-span-2 ${
                  selectedPunchType === 'HORA_EXTRA'
                    ? 'bg-purple-500/20 border-purple-500/60 text-purple-200 shadow-sm shadow-purple-950/30 scale-[1.02]'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="text-left">
                  <div>Hora Extra / Atendimento Noturno</div>
                  <div className="text-[10px] text-slate-400 font-normal">Extensão de jornada autorizada</div>
                </div>
              </button>

            </div>
          </div>

          {/* Location & GPS Info */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Localização Registrada (Geolocalização):
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                placeholder="Ex: Polo Campinas, Shopping Iguatemi, etc."
                required
              />
            </div>
          </div>

          {/* Late Arrival Checkbox */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLateChecked}
                  onChange={(e) => setIsLateChecked(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Houve atraso na entrada / escala</span>
              </label>

              {isLateChecked && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Registrar</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={lateMinutesInput}
                    onChange={(e) => setLateMinutesInput(Number(e.target.value))}
                    className="w-14 px-1.5 py-0.5 bg-slate-900 border border-amber-500/40 rounded text-center text-amber-200 font-bold focus:outline-none"
                  />
                  <span>min</span>
                </div>
              )}
            </div>
          </div>

          {/* Justification / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observação / Justificativa (Opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              placeholder="Ex: Atendimento estendido no cliente, liberação de elevador urgente, etc."
            />
          </div>

          {/* Recent Punches from this employee */}
          {employeePunchesToday.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Batidas recentes de hoje:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {employeePunchesToday.map((p) => {
                  const badge = getPunchTypeBadge(p.type);
                  return (
                    <div 
                      key={p.id} 
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1.5 ${badge.bg}`}
                    >
                      <badge.icon className="w-3 h-3" />
                      <span>{badge.label}:</span>
                      <strong className="font-mono">{p.formattedTime}</strong>
                      {p.isLate && <span className="text-rose-400 font-bold">({p.lateMinutes}m atr.)</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Success Banner Animation */}
          {isSuccessAnimated && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 animate-bounce" />
              <div>
                <strong>Ponto registrado com sucesso!</strong>
                <p className="text-[11px] text-emerald-200/80">
                  {lastRegisteredPunch?.formattedTime} - {lastRegisteredPunch?.type} gravado na folha de ponto.
                </p>
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSuccessAnimated}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-900/30 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Batida ({formattedHours})</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
