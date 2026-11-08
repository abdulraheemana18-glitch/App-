export type ActiveScreen =
  | 'chat'
  | 'history'
  | 'planner'
  | 'agents'
  | 'memory'
  | 'knowledge'
  | 'workspace'
  | 'tools'
  | 'models'
  | 'evaluation'
  | 'android'
  | 'settings'
  | 'onboarding'
  | 'auth';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'operator' | 'admin' | 'researcher';
  preferences: {
    theme: 'dark' | 'light';
    defaultModel: string;
    reasoningDepth: 'standard' | 'deep' | 'exhaustive';
    autoApproveTools: boolean;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  activeAgent: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReasoningStep {
  step: number;
  type: 'decomposition' | 'hypothesis' | 'agent_action' | 'evidence_eval' | 'verification' | 'confidence';
  agent: string;
  description: string;
  details?: string;
  confidence?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
}

export interface ToolCallRecord {
  tool: string;
  args: Record<string, unknown>;
  output?: string;
  status: 'pending_approval' | 'executed' | 'rejected' | 'failed';
  requiresApproval?: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  sequence: number;
  provider: string;
  model: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs?: number;
  agentId?: string;
  reasoningSteps?: ReasoningStep[];
  toolsUsed?: ToolCallRecord[];
  confidenceScore?: number;
  feedback?: {
    rating: 'thumbs_up' | 'thumbs_down';
    comment?: string;
    timestamp: string;
  };
  createdAt: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  avatarIcon: string;
  color: string;
  status: 'idle' | 'thinking' | 'working' | 'reviewing';
  currentTask?: string;
  tasksCompleted: number;
  accuracyRating: number;
}

export interface MemoryRecord {
  id: string;
  userId: string;
  type: 'working' | 'conversation' | 'long_term' | 'episodic' | 'semantic' | 'user_preference';
  category: string;
  key: string;
  content: string;
  importance: number;
  accessCount: number;
  lastAccessed: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanSubtask {
  id: string;
  title: string;
  description: string;
  agent: string;
  prerequisites: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  result?: string;
  confidence?: number;
}

export interface PlanRecord {
  id: string;
  userId: string;
  sessionId?: string;
  goal: string;
  subtasks: PlanSubtask[];
  status: 'draft' | 'executing' | 'completed' | 'failed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'documentation' | 'android' | 'code' | 'research' | 'user_upload';
  content: string;
  summary: string;
  tags: string[];
  chunks: string[];
  metadata: Record<string, unknown>;
  sourceUrl?: string;
  createdAt: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  isConsequential: boolean;
}

export interface ToolAuditEntry {
  id: string;
  toolName: string;
  requestedByAgent: string;
  input: Record<string, unknown>;
  output: unknown;
  status: 'success' | 'failed' | 'awaiting_approval' | 'denied';
  executionTimeMs: number;
  consequential: boolean;
  timestamp: string;
}

export interface WorkspaceFile {
  path: string;
  content: string;
  language: string;
  updatedAt: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  isDefault: boolean;
  contextWindow: string;
  latencyRating: string;
  recommendedFor: string[];
}

export interface EvaluationStats {
  totalInferences: number;
  averageBenchmarkScore: number;
  userSatisfactionRate: number;
  benchmarksRun: number;
  activeGuardrailsPassed: string;
  feedbackBreakdown: {
    totalFeedback: number;
    positive: number;
    negative: number;
  };
}

export interface BenchmarkResult {
  benchmarkId: string;
  name: string;
  category: 'logic' | 'coding' | 'planning' | 'memory' | 'latency';
  score: number;
  maxScore: number;
  status: 'passed' | 'marginal' | 'failed';
  metrics: {
    latencyMs: number;
    tokensEvaluated: number;
    assertionsChecked: number;
    assertionsPassed: number;
  };
  details: string;
}
