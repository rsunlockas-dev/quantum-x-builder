/**
 * Contract Interface Definitions
 * Defines the contracts between autonomous systems and external components
 */

// System Contract
export interface ISystemContract {
  version: string;
  operatingMode: 'autonomous' | 'hybrid' | 'manual';
  governanceFramework: string;
  validationLevel: number;
  autonomyEnabled: boolean;
}

// Proposal Engine Contract (from phase-1)
export interface IProposal {
  id: string;
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  alternatives: string[];
  risks: IriskAssessment[];
  recommendations: string[];
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
}

// Risk Assessment Contract
export interface IriskAssessment {
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  probability: number;
}

// Autonomous Partner Contract
export interface IAutonomousPartner {
  id: string;
  name: string;
  role: 'architect' | 'feature' | 'validator' | 'security' | 'performance' | 'reviewer';
  status: 'ready' | 'processing' | 'idle' | 'error';
  lastUpdate: string;
}

// Confirmation Contract
export interface IConfirmation {
  proposalId: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'confirmed';
  reviewer: string;
  feedback: string;
  timestamp: string;
}

// Execution Contract
export interface IExecution {
  id: string;
  proposalId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  result?: unknown;
  error?: string;
}

// Export all contracts as a single type
export type ContractDefinitions = {
  system: ISystemContract;
  proposal: IProposal;
  risk: IriskAssessment;
  partner: IAutonomousPartner;
  confirmation: IConfirmation;
  execution: IExecution;
};
