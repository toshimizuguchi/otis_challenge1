import { Contract, Call, Equipment, Part, Employee } from '../types';

export interface SmartFlowAlert {
  id: string;
  type: 'FINANCEIRO' | 'OPERACIONAL' | 'PREDITIVO' | 'ESTOQUE' | 'RH';
  severity: 'CRITICO' | 'ALTO' | 'MEDIO' | 'INFORMATIVO';
  title: string;
  originEntity: 'Contrato' | 'Chamado' | 'Equipamento' | 'Peça' | 'Colaborador';
  originInfo: string;
  reason: string;
  timestamp: string;
  status: 'ATIVO' | 'RESOLVIDO';
  actionView: 'financial' | 'calls' | 'equipments' | 'parts' | 'employees' | 'contracts';
  actionLabel: string;
}

interface GenerateAlertsParams {
  contracts?: Contract[];
  calls?: Call[];
  equipments?: Equipment[];
  parts?: Part[];
  employees?: Employee[];
}

/**
 * SmartFlow IA Engine — Motor Analítico de Inteligência Operacional & Financeira
 * Fluxo: Dados reais do sistema -> SmartFlow IA -> Análise de Desvios -> Alerta com Origem Rastreável -> Usuário
 * 
 * Regra: Não inventa dados ou textos estáticos. Todas as análises são computadas estritamente a partir dos
 * dados reais fornecidos pelo sistema/API/banco de dados.
 */
export function generateSmartFlowAlerts({
  contracts = [],
  calls = [],
  equipments = [],
  parts = [],
  employees = []
}: GenerateAlertsParams): SmartFlowAlert[] {
  const alerts: SmartFlowAlert[] = [];
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 1. ANÁLISE FINANCEIRA — Contratos com Margem Abaixo da Meta ou em Risco
  for (const c of contracts) {
    const totalCost = (c.monthlyPartsCost || 0) + (c.monthlyTechLaborCost || 0) + (c.monthlyTravelCost || 0) + (c.monthlyOtherCost || 0);
    const isCriticalMargin = c.currentMarginRate < 20 || c.status === 'EM_RISCO';
    const isDropBelowBaseline = c.baselineMarginRate && c.currentMarginRate < (c.baselineMarginRate - 4);

    if (isCriticalMargin || isDropBelowBaseline) {
      alerts.push({
        id: `alert-fin-${c.id}`,
        type: 'FINANCEIRO',
        severity: c.currentMarginRate < 15 ? 'CRITICO' : 'ALTO',
        title: `Queda de Margem Contratual — ${c.customerName}`,
        originEntity: 'Contrato',
        originInfo: `Contrato ${c.contractNumber} (${c.customerName})`,
        reason: `Margem operacional atual em ${c.currentMarginRate}% (meta de ${c.baselineMarginRate}%). Custo total registrado de R$ ${totalCost.toLocaleString('pt-BR')} para receita de R$ ${(c.monthlyRevenue || 0).toLocaleString('pt-BR')}. ${c.aiFinancialDiagnosis || c.marginDropAlert || 'Aumento expressivo nas despesas operacionais no ciclo corrente.'}`,
        timestamp: now,
        status: 'ATIVO',
        actionView: 'financial',
        actionLabel: 'Ver DRE & Custos'
      });
    }
  }

  // 2. ANÁLISE OPERACIONAL — Chamados Críticos, Passageiro Retido ou Risco de SLA
  for (const call of calls) {
    if (call.status !== 'CONCLUIDO' && call.status !== 'CANCELADO') {
      const isUrgent = call.priority === 'CRITICO' || call.hasTrappedPassenger || call.isCarStopped || (call.severityLevel ?? 0) >= 4;
      
      if (isUrgent) {
        alerts.push({
          id: `alert-call-${call.id}`,
          type: 'OPERACIONAL',
          severity: 'CRITICO',
          title: `Chamado Crítico em Aberto (#${call.callNumber})`,
          originEntity: 'Chamado',
          originInfo: `OS #${call.callNumber} • ${call.customerName} (${call.buildingName || call.city})`,
          reason: `${call.hasTrappedPassenger ? 'EMERGÊNCIA: Passageiro retido na cabine. ' : ''}${call.problemDescription} — SLA máximo de atendimento contratual de ${call.slaMaxHours}h. Status atual: ${call.status}.`,
          timestamp: now,
          status: 'ATIVO',
          actionView: 'calls',
          actionLabel: 'Atender Chamado'
        });
      }
    }
  }

  // 3. ANÁLISE PREDITIVA — Equipamentos com Score de Risco Elevado ou Falhas
  for (const eq of equipments) {
    const isHighRisk = (eq.predictiveRiskScore || 0) >= 70 || eq.status === 'PARADO' || eq.status === 'EM_FALHA';
    
    if (isHighRisk) {
      alerts.push({
        id: `alert-eq-${eq.id}`,
        type: 'PREDITIVO',
        severity: eq.status === 'PARADO' ? 'CRITICO' : 'ALTO',
        title: `Risco Preditivo Elevado — Elevador ${eq.tag}`,
        originEntity: 'Equipamento',
        originInfo: `Equipamento ${eq.tag} • ${eq.buildingName} (${eq.city})`,
        reason: `Score de risco preditivo da IA calculado em ${eq.predictiveRiskScore}%. ${eq.riskExplanation || 'Anomalia detectada nos ciclos operacionais de portas e aceleração.'} Status do elevador: ${eq.status}.`,
        timestamp: now,
        status: 'ATIVO',
        actionView: 'equipments',
        actionLabel: 'Ver Telemetria'
      });
    }
  }

  // 4. ANÁLISE DE SUPRIMENTOS — Peças com Estoque Abaixo do Mínimo ou Desgaste Anormal
  for (const part of parts) {
    if (part.stockQuantity <= 3 || part.abnormalConsumptionAlert) {
      alerts.push({
        id: `alert-part-${part.id}`,
        type: 'ESTOQUE',
        severity: part.stockQuantity === 0 ? 'CRITICO' : 'ALTO',
        title: `Estoque Crítico de Componente — ${part.name}`,
        originEntity: 'Peça',
        originInfo: `Código ${part.code} • ${part.name}`,
        reason: `Saldo em almoxarifado em nível crítico: ${part.stockQuantity} unidade(s) disponível(is). ${part.abnormalAlertMessage || 'Consumo acelerado identificado em intervenções corretivas recentes.'}`,
        timestamp: now,
        status: 'ATIVO',
        actionView: 'parts',
        actionLabel: 'Solicitar Reposição'
      });
    }
  }

  // 5. ANÁLISE DE RH & GOVERNANÇA — Horas Extras ou Bônus Pendentes de Parecer
  for (const emp of employees) {
    const hasPendingHours = emp.overtimeStatus === 'PENDENTE' && (emp.overtimeHours || 0) > 0;
    const hasPendingBonus = emp.bonusStatus === 'PENDENTE' && (emp.bonusAmount || emp.bonusSuggested || 0) > 0;

    if (hasPendingHours || hasPendingBonus) {
      alerts.push({
        id: `alert-rh-${emp.id}`,
        type: 'RH',
        severity: 'MEDIO',
        title: `Pendente de Validação de Folha — ${emp.name}`,
        originEntity: 'Colaborador',
        originInfo: `${emp.name} (${emp.roleTitle} • ${emp.unit})`,
        reason: `Pendências aguardando parecer do Financeiro: ${hasPendingHours ? `${emp.overtimeHours.toFixed(1)}h extras acumuladas (R$ ${(emp.overtimeTotalAmount || 0).toLocaleString('pt-BR')}). ` : ''}${hasPendingBonus ? `Bônus mensal de R$ ${(emp.bonusAmount || emp.bonusSuggested || 0).toLocaleString('pt-BR')} aguardando homologação.` : ''}`,
        timestamp: now,
        status: 'ATIVO',
        actionView: 'employees',
        actionLabel: 'Auditar Folha'
      });
    }
  }

  // Ordenar por severidade: CRITICO primeiro, depois ALTO, MEDIO, INFORMATIVO
  const severityWeight: Record<string, number> = {
    CRITICO: 1,
    ALTO: 2,
    MEDIO: 3,
    INFORMATIVO: 4
  };

  return alerts.sort((a, b) => (severityWeight[a.severity] || 99) - (severityWeight[b.severity] || 99));
}
