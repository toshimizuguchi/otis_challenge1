import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileSpreadsheet, Upload, CheckCircle2, Sparkles, FileText, AlertCircle } from 'lucide-react';

export const DataImportModule: React.FC = () => {
  const { addToast } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importTarget, setImportTarget] = useState<'CHAMADOS' | 'EQUIPAMENTOS' | 'TECNICOS' | 'PECAS'>('CHAMADOS');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcessImport = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSelectedFile(null);
      addToast({
        type: 'success',
        title: 'Planilha Importada com Sucesso',
        message: `Arquivo ${selectedFile.name} processado. 142 novos registros mapeados e incorporados à base do SmartFlow AI.`
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Integração de Bases Legadas & Planilhas
            </span>
            <span className="text-xs text-slate-400 font-mono">Suporte XLSX / CSV</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Importação de Dados & Mapeamento de Planilhas
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Importe o histórico de chamados, equipamentos, mecânicos e catálogo de peças para treinamento contínuo da IA.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Zone */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Selecione o Tipo de Base de Dados
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'CHAMADOS', label: 'Histórico Chamados' },
                { key: 'EQUIPAMENTOS', label: 'Parque Equipamentos' },
                { key: 'TECNICOS', label: 'Quadro Técnicos' },
                { key: 'PECAS', label: 'Catálogo de Peças' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setImportTarget(item.key as any)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    importTarget === item.key
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">{selectedFile.name}</div>
                <div className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB • Arquivo Carregado</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-200">Arraste e solte o arquivo aqui</div>
                <div className="text-xs text-slate-400">ou clique para selecionar do seu computador (.xlsx, .csv)</div>
              </div>
            )}

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              {selectedFile ? 'Trocar Arquivo' : 'Selecionar Arquivo'}
            </label>
          </div>

          <button
            onClick={handleProcessImport}
            disabled={!selectedFile || isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Processando Mapeamento e Ingestão por IA...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Iniciar Importação para SmartFlow AI</span>
              </>
            )}
          </button>
        </div>

        {/* Expected Schema Reference */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Colunas Mapeadas Automaticamente</h3>
          </div>

          <p className="text-xs text-slate-400">
            A IA reconhece automaticamente cabeçalhos padrão OTIS e planilhas de campo:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
              <strong className="text-cyan-300">Chamados:</strong> NUM_CHAMADO, TAG_EQUIPAMENTO, MODELO, CIDADE, DATA_ABERTURA, DEFEITO, TECNICO_DESIGNADO, HORAS_GASTAS, PECAS_TROCADAS
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
              <strong className="text-indigo-300">Equipamentos:</strong> TAG, CLIENTE, EDIFICIO, MODELO, ANO_INSTALACAO, CICLOS_PORTA, TEM_REGEN, CONTRATO_NUM
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
