import React from 'react';
import { SmartFlowIntelligence } from './SmartFlowIntelligence';

/**
 * Alertas e SmartFlow IA são uma única funcionalidade unificada.
 * Este componente redireciona transparentemente para a Central Unificada SmartFlow IA.
 */
export const AlertsCenter: React.FC = () => {
  return <SmartFlowIntelligence />;
};
