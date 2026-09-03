import { Call, Equipment, Technician, Contract, Part, AIInsight } from '../types';

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: string;
    payload?: any;
  };
  metrics?: {
    label: string;
    value: string;
    trend?: string;
  }[];
}

// Deterministic AI Rules and Generative Responses based on live system state
export function analyzeCallWithAI(
  problemDescription: string,
  equipment: Equipment,
  hasTrappedPassenger: boolean,
  isCarStopped: boolean,
  technicians: Technician[]
): NonNullable<Call['aiRecommendation']> {
  const isCritical = hasTrappedPassenger || isCarStopped || problemDescription.toLowerCase().includes('preso') || problemDescription.toLowerCase().includes('parado') || problemDescription.toLowerCase().includes('emergência');
  const isDoorProblem = problemDescription.toLowerCase().includes('porta') || problemDescription.toLowerCase().includes('fech') || problemDescription.toLowerCase().includes('at120') || problemDescription.toLowerCase().includes('trinco');
  const isEscalator = equipment.type === 'ESCADA_ROLANTE' || equipment.type === 'ESTEIRA_ROLANTE';

  let suggestedPriority: Call['priority'] = 'MEDIO';
  if (isCritical) suggestedPriority = 'CRITICO';
  else if (isDoorProblem || problemDescription.toLowerCase().includes('barulho') || problemDescription.toLowerCase().includes('vibra')) suggestedPriority = 'ALTO';

  // Match technician based on specialty and proximity in same city
  let matchedTech = technicians.find(t => t.city === equipment.city && t.status === 'DISPONIVEL' && t.specialties.some(s => isDoorProblem ? s.includes('Portas') : true));
  if (!matchedTech) {
    matchedTech = technicians.find(t => t.city === equipment.city && t.status === 'DISPONIVEL');
  }
  if (!matchedTech) {
    matchedTech = technicians.find(t => t.city === equipment.city) || technicians[0];
  }

  const recommendedParts: string[] = [];
  const recommendedTools: string[] = [];

  if (isDoorProblem) {
    recommendedParts.push('Kit Roletes & Sapata AT120 (OTIS-AT120-SK)', 'Micro-switch de Segurança 24V');
    recommendedTools.push('Gabarito de Folga de Porta 6mm', 'Chave Dinamométrica Otis', 'Multímetro Calibrado CAT III');
  } else if (isEscalator) {
    recommendedParts.push('Segmento de Pente Plástico Amarelo 606N', 'Sensor Indutivo PNP');
    recommendedTools.push('Kit de Calibração de Pente Otis', 'Chave Allen 8mm');
  } else {
    recommendedTools.push('Ferramentas específicas ainda não determinadas. Realizar diagnóstico preliminar.');
  }

  let historicalPattern = 'Sem anomalia histórica detectada para este lote.';
  if (isDoorProblem && equipment.model.includes('Gen2')) {
    historicalPattern = `O equipamento ${equipment.tag} em ${equipment.city} apresenta comportamento análogo a outros elevadores do modelo ${equipment.model} que tiveram aumento de falhas no sistema de portas após ~3 anos de operação contínua. Risco elevado.`;
  }

  return {
    suggestedPriority,
    suggestedTechnicianId: matchedTech.id,
    suggestedTechnicianName: matchedTech.name,
    matchReason: `${matchedTech.name} está em ${matchedTech.city}, possui especialidade [${matchedTech.specialties.join(', ')}] e SLA histórico de ${matchedTech.slaComplianceRate}%.`,
    estimatedTimeMin: isDoorProblem ? 22 : 35,
    recommendedParts,
    recommendedTools,
    confidence: isDoorProblem ? 94.8 : 88.5,
    historicalPatternFound: historicalPattern
  };
}

export function querySmartFlowAI(
  prompt: string,
  contextData: {
    equipments: Equipment[];
    calls: Call[];
    technicians: Technician[];
    contracts: Contract[];
    parts: Part[];
  }
): { text: string; metrics?: { label: string; value: string; trend?: string }[]; suggestedAction?: { label: string; actionType: string; payload?: any } } {
  const p = prompt.toLowerCase();

  if (p.includes('cidade') || p.includes('região') || p.includes('taxa de chamado') || p.includes('maior taxa')) {
    return {
      text: `Análise Regional de Taxa de Chamados:\n\n1. **São Bernardo do Campo (SP)**: Apresenta a maior taxa de falhas por equipamento (2.8 chamados/eq/mês), com 59% das ocorrências concentradas no polo hospitalar.\n2. **Campinas (SP)**: Taxa de 2.1 chamados/eq/mês, com forte concentração no sistema de portas do modelo Gen2 Comfort (64% dos chamados).\n3. **São Paulo Capital**: Menor taxa relativa (1.6 chamados/eq/mês) devido à alta densidade de técnicos e ampla telemetria IoT preventiva.`,
      metrics: [
        { label: 'Pior Taxa (SBC)', value: '2.8 /eq/mês', trend: '+14% no trimestre' },
        { label: 'Campinas (Portas)', value: '64% das falhas', trend: 'Padrão recorrente' },
        { label: 'Média Brasil', value: '1.9 /eq/mês', trend: 'Estável' }
      ],
      suggestedAction: {
        label: 'Ver Mapa Regional & Cidades',
        actionType: 'NAVIGATE_MAPS'
      }
    };
  }

  if (p.includes('equipamento') && (p.includes('risco') || p.includes('quebr') || p.includes('prediti'))) {
    const highRiskEqs = contextData.equipments.filter(e => e.predictiveRiskScore > 70);
    return {
      text: `Foram identificados **${highRiskEqs.length} equipamentos com Risco Elevado** na frota nacional:\n\n` +
        highRiskEqs.map(e => `• **${e.tag} (${e.model})** em ${e.city} - Risco **${e.predictiveRiskScore}/100** (${e.riskLevel})\n  *Motivo*: ${e.riskExplanation || 'Degradação estatística acelerada'}`).join('\n\n') +
        `\n\n**Recomendação Estratégica**: Acionar ordens de serviço preventivas antes do próximo ciclo de falha. Peça crítica: Kit Sapata AT120.`,
      metrics: [
        { label: 'Equipamentos em Risco', value: `${highRiskEqs.length}`, trend: 'Atenção Imediata' },
        { label: 'Score Máximo', value: '92/100 (Viracopos)', trend: 'Crítico' }
      ],
      suggestedAction: {
        label: 'Ver Módulo de Manutenção Preditiva',
        actionType: 'NAVIGATE_PREDICTIVE'
      }
    };
  }

  if (p.includes('técnico') || p.includes('tecnico') || p.includes('tempo') || p.includes('demorando') || p.includes('produtividade')) {
    const delayed = contextData.technicians.filter(t => t.overdueAlert || t.status === 'ATRASADO');
    return {
      text: `Status Operacional dos Técnicos:\n\n` +
        (delayed.length > 0 
          ? `⚠️ **Técnicos com desvio de tempo histórico detectado**:\n` +
            delayed.map(t => `• **${t.name}** (${t.city}): Atendimento em andamento há **${t.activeCallElapsedMinutes || 47} min** (média histórica: **${t.expectedCallDurationMinutes || 22} min**). Causa provável: necessidade de peça sobressalente ou complexidade no alinhamento de trincos.`).join('\n')
          : `Todos os técnicos estão operando dentro da janela de SLA esperada no momento.`) +
        `\n\n**Sugestão de Ação**: O supervisor pode acionar suporte técnico ou redistribuir chamados secundários para mecânicos livres na mesma rota.`,
      metrics: [
        { label: 'Técnicos com Alerta', value: `${delayed.length}`, trend: 'Requer Contato' },
        { label: 'SLA Médio Equipe', value: '97.6%', trend: 'Meta > 98%' }
      ],
      suggestedAction: {
        label: 'Abrir Painel do Supervisor',
        actionType: 'NAVIGATE_SUPERVISOR'
      }
    };
  }

  if (p.includes('contrato') || p.includes('margem') || p.includes('financeiro') || p.includes('custo') || p.includes('perda')) {
    const riskContracts = contextData.contracts.filter(c => c.status === 'EM_RISCO');
    return {
      text: `Diagnóstico Financeiro de Contratos:\n\n` +
        riskContracts.map(c => `• **${c.customerName}** (${c.contractNumber})\n  - Margem Atual: **${c.currentMarginRate}%** (Meta: ${c.baselineMarginRate}%)\n  - Diagnóstico da IA: ${c.aiFinancialDiagnosis || c.marginDropAlert}`).join('\n\n') +
        `\n\n**Conclusão**: A redução de margem é impulsionada primariamente pela reincidência de falhas em modelos específicos (Gen2 Comfort), gerando horas extras e consumo desregulado de peças. A campanha preventiva reverte a margem em até +8.5 p.p.`,
      metrics: [
        { label: 'Contratos em Risco', value: `${riskContracts.length}`, trend: 'Queda de Margem' },
        { label: 'Margem Média da Base', value: '28.0%', trend: 'Estável' }
      ],
      suggestedAction: {
        label: 'Ver Detalhamento Financeiro',
        actionType: 'NAVIGATE_FINANCIAL'
      }
    };
  }

  if (p.includes('peça') || p.includes('peca') || p.includes('estoque') || p.includes('consumo')) {
    return {
      text: `Análise de Consumo de Peças & Componentes:\n\n• **Kit Roletes & Sapata AT120 (OTIS-AT120-SK)**: Apresenta **consumo 44% acima da média histórica** nos últimos 60 dias (318 unidades trocadas).\n  - **Causa Raiz Identificada pela IA**: Lotes de 2023 sofrendo fadiga precoce aos 350 mil ciclos sob alta umidade/uso intenso em Campinas e ABC Paulista.\n  - **Ação**: Inclusão na Campanha Preventiva Nacional em lote com desconto de suprimentos corporativo.`,
      metrics: [
        { label: 'Peça Mais Crítica', value: 'Kit AT120', trend: '+44% consumo' },
        { label: 'Estoque Restante', value: '142 un', trend: 'Reabastecer em 15d' }
      ],
      suggestedAction: {
        label: 'Ver Gestão de Peças',
        actionType: 'NAVIGATE_PARTS'
      }
    };
  }

  // General Enterprise Overview
  return {
    text: `Olá! Sou o **SmartFlow AI Copilot**, o núcleo de inteligência preditiva e operacional da OTIS.\n\n` +
      `Estou monitorando ativamente:\n` +
      `• **${contextData.equipments.length} equipamentos** distribuídos no Brasil e América Latina.\n` +
      `• **${contextData.calls.filter(c => c.status !== 'CONCLUIDO').length} chamados ativos** em tempo real.\n` +
      `• **${contextData.technicians.length} técnicos** em campo com telemetria GPS e controle de SLA.\n` +
      `• **Padrão Crítico Detectado**: Correlação estatística no sistema de portas do modelo *Otis Gen2 Comfort* aos ~3 anos de uso.\n\n` +
      `Como posso auxiliá-lo na tomada de decisão hoje?`,
    metrics: [
      { label: 'Disponibilidade Frota', value: '98.6%', trend: '+1.4% vs meta' },
      { label: 'SLA Global', value: '97.2%', trend: 'Excelente' },
      { label: 'Score Preditivo', value: '95.4%', trend: 'Alta Confiabilidade' }
    ]
  };
}
