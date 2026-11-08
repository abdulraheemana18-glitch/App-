import {
  UserProfile,
  ChatSession,
  ChatMessage,
  AgentProfile,
  MemoryRecord,
  PlanRecord,
  KnowledgeDocument,
  ToolDefinition,
  ToolAuditEntry,
  WorkspaceFile,
  ModelOption,
  EvaluationStats,
  BenchmarkResult,
} from '../types';

const TOKEN_KEY = 'si_auth_token';

// Deployed HTTPS Cloud Run Backend URL for Super Intelligence AI
const PROD_BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  'https://ais-dev-bgzsd2ygh34ymvyiur6th7-401957677631.asia-northeast1.run.app';

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  // Check if running on Android Capacitor native or mobile webview
  const isCapacitorNative =
    (window as any).Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'file:' ||
    (window.location.hostname === 'localhost' && window.location.port !== '3000');

  if (isCapacitorNative) {
    return PROD_BACKEND_URL.replace(/\/+$/, '');
  }
  return '';
}

class ApiService {
  private url(endpoint: string): string {
    const base = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${cleanEndpoint}`;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem(TOKEN_KEY) || 'usr-primary-001';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  public setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string {
    return localStorage.getItem(TOKEN_KEY) || 'usr-primary-001';
  }

  public clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Health
  public async getHealth() {
    const res = await fetch(this.url('/api/health'));
    return res.json();
  }

  // Auth
  public async getMe(): Promise<{ user: UserProfile }> {
    const res = await fetch(this.url('/api/auth/me'), { headers: this.getHeaders() });
    return res.json();
  }

  public async login(username: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(this.url('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (data.token) this.setToken(data.token);
    return data;
  }

  public async register(username: string, email: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(this.url('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    if (data.token) this.setToken(data.token);
    return data;
  }

  public async getUsers(): Promise<{ users: { id: string; username: string; email: string; role: string }[] }> {
    const res = await fetch(this.url('/api/auth/users'));
    return res.json();
  }

  // Sessions
  public async getSessions(): Promise<ChatSession[]> {
    const res = await fetch(this.url('/api/chat/sessions'), { headers: this.getHeaders() });
    return res.json();
  }

  public async createSession(title: string, model?: string): Promise<ChatSession> {
    const res = await fetch(this.url('/api/chat/sessions'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, model }),
    });
    return res.json();
  }

  public async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    const res = await fetch(this.url(`/api/chat/sessions/${sessionId}`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // Messages
  public async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const res = await fetch(this.url(`/api/chat/sessions/${sessionId}/messages`), { headers: this.getHeaders() });
    return res.json();
  }

  public async sendMessage(
    sessionId: string,
    content: string,
    provider?: string,
    model?: string
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    const res = await fetch(this.url(`/api/chat/sessions/${sessionId}/messages`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ content, provider, model }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Turn processing failed' }));
      throw new Error(err.error || 'Server error occurred');
    }
    return res.json();
  }

  public async sendFeedback(messageId: string, rating: 'thumbs_up' | 'thumbs_down', comment?: string) {
    const res = await fetch(this.url(`/api/chat/messages/${messageId}/feedback`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    return res.json();
  }

  // Memories
  public async getMemories(type?: string, category?: string): Promise<MemoryRecord[]> {
    let endpoint = '/api/memory';
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const res = await fetch(this.url(endpoint), { headers: this.getHeaders() });
    return res.json();
  }

  public async addMemory(data: Partial<MemoryRecord>): Promise<MemoryRecord> {
    const res = await fetch(this.url('/api/memory'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  public async deleteMemory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(this.url(`/api/memory/${id}`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  public async consolidateMemories() {
    const res = await fetch(this.url('/api/memory/consolidate'), {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // Plans
  public async getPlans(): Promise<PlanRecord[]> {
    const res = await fetch(this.url('/api/plans'), { headers: this.getHeaders() });
    return res.json();
  }

  public async createPlan(goal: string, sessionId?: string): Promise<PlanRecord> {
    const res = await fetch(this.url('/api/plans'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ goal, sessionId }),
    });
    return res.json();
  }

  public async executeSubtask(planId: string, subtaskId: string) {
    const res = await fetch(this.url(`/api/plans/${planId}/execute-subtask`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ subtaskId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Subtask execution failed');
    }
    return res.json();
  }

  public async revisePlan(planId: string, feedback: string): Promise<PlanRecord> {
    const res = await fetch(this.url(`/api/plans/${planId}/revise`), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ feedback }),
    });
    return res.json();
  }

  public async deletePlan(planId: string): Promise<{ success: boolean }> {
    const res = await fetch(this.url(`/api/plans/${planId}`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // Agents
  public async getAgents(): Promise<AgentProfile[]> {
    const res = await fetch(this.url('/api/agents'));
    return res.json();
  }

  // Tools
  public async getTools(): Promise<ToolDefinition[]> {
    const res = await fetch(this.url('/api/tools'));
    return res.json();
  }

  public async executeTool(toolName: string, args: Record<string, unknown>, bypassApproval = false) {
    const res = await fetch(this.url('/api/tools/execute'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ toolName, args, bypassApproval }),
    });
    return res.json();
  }

  public async approveTool(auditId: string, approved: boolean) {
    const res = await fetch(this.url('/api/tools/approve'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ auditId, approved }),
    });
    return res.json();
  }

  public async getToolAudit(): Promise<ToolAuditEntry[]> {
    const res = await fetch(this.url('/api/tools/audit'), { headers: this.getHeaders() });
    return res.json();
  }

  // Knowledge
  public async getKnowledge(): Promise<KnowledgeDocument[]> {
    const res = await fetch(this.url('/api/knowledge'));
    return res.json();
  }

  public async ingestKnowledge(data: { title: string; category?: string; content: string; tags?: string[]; sourceUrl?: string }) {
    const res = await fetch(this.url('/api/knowledge'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  }

  public async searchKnowledge(query: string, category?: string) {
    const res = await fetch(this.url('/api/knowledge/search'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query, category }),
    });
    return res.json();
  }

  public async deleteKnowledge(id: string) {
    const res = await fetch(this.url(`/api/knowledge/${id}`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // Workspace
  public async getWorkspaceFiles(): Promise<WorkspaceFile[]> {
    const res = await fetch(this.url('/api/workspace'));
    return res.json();
  }

  public async saveWorkspaceFile(path: string, content: string, language?: string) {
    const res = await fetch(this.url('/api/workspace/save'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ path, content, language }),
    });
    return res.json();
  }

  public async runCode(code: string, language: string) {
    const res = await fetch(this.url('/api/workspace/run'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ code, language }),
    });
    return res.json();
  }

  // Models
  public async getModels(): Promise<ModelOption[]> {
    const res = await fetch(this.url('/api/models'));
    return res.json();
  }

  // Evaluation
  public async getEvaluationStats(): Promise<EvaluationStats> {
    const res = await fetch(this.url('/api/evaluation/stats'));
    return res.json();
  }

  public async runBenchmarkSuite(): Promise<BenchmarkResult[]> {
    const res = await fetch(this.url('/api/evaluation/benchmarks/run'), {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return res.json();
  }
}

export const api = new ApiService();
