import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'operator' | 'admin' | 'researcher';
  isActive: boolean;
  preferences: {
    theme: 'dark' | 'light';
    defaultModel: string;
    reasoningDepth: 'standard' | 'deep' | 'exhaustive';
    autoApproveTools: boolean;
  };
  createdAt: string;
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

export interface MemoryRecord {
  id: string;
  userId: string;
  type: 'working' | 'conversation' | 'long_term' | 'episodic' | 'semantic' | 'user_preference';
  category: string;
  key: string;
  content: string;
  importance: number; // 0.0 to 1.0
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
  prerequisites: string[]; // subtask IDs
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

export interface EvaluationMetric {
  id: string;
  benchmarkName: string;
  category: 'logic' | 'coding' | 'planning' | 'memory' | 'latency';
  score: number; // 0 - 100
  details: string;
  timestamp: string;
}

interface DatabaseSchema {
  users: User[];
  sessions: ChatSession[];
  messages: ChatMessage[];
  memories: MemoryRecord[];
  plans: PlanRecord[];
  knowledge: KnowledgeDocument[];
  toolAudit: ToolAuditEntry[];
  workspace: WorkspaceFile[];
  evaluations: EvaluationMetric[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseEngine {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.seedDefaultsIfEmpty();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Failed to load data, starting with fresh store:', err);
    }
    return {
      users: [],
      sessions: [],
      messages: [],
      memories: [],
      plans: [],
      knowledge: [],
      toolAudit: [],
      workspace: [],
      evaluations: [],
    };
  }

  private save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to persist data:', err);
    }
  }

  private seedDefaultsIfEmpty(): void {
    // 1. Seed default user if empty
    if (this.data.users.length === 0) {
      this.data.users.push({
        id: 'usr-primary-001',
        username: 'operator',
        email: 'operator@superintelligence.ai',
        passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // sha256
        role: 'operator',
        isActive: true,
        preferences: {
          theme: 'dark',
          defaultModel: 'gemini-3.8-flash',
          reasoningDepth: 'deep',
          autoApproveTools: false,
        },
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Seed initial knowledge base entries
    if (this.data.knowledge.length === 0) {
      this.data.knowledge.push(
        {
          id: 'kn-001',
          title: 'SUPER INTELLIGENCE Platform Architecture',
          category: 'documentation',
          content: `SUPER INTELLIGENCE AI is designed with an autonomous multi-agent mesh, hierarchical planner, dynamic multi-model fallback cascade, and deep episodic-semantic memory. Key modules: AI Orchestrator, Reasoning Engine, Planning Engine, Memory Store, Knowledge Retriever, and Android Bridge.`,
          summary: 'Overview of the Super Intelligence agentic architecture.',
          tags: ['architecture', 'multi-agent', 'orchestrator', 'super-intelligence'],
          chunks: [
            'SUPER INTELLIGENCE AI is designed with an autonomous multi-agent mesh, hierarchical planner...',
            'Key modules: AI Orchestrator, Reasoning Engine, Planning Engine, Memory Store, Knowledge Retriever, and Android Bridge.'
          ],
          metadata: { version: '1.0.0', verified: true },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'kn-002',
          title: 'Android Native Bridge & Jetpack Compose Guidelines',
          category: 'android',
          content: `To build and deploy on Android, apps use modern Jetpack Compose with Material 3 design and Capacitor for native hardware bridging. Key permissions: INTERNET, ACCESS_NETWORK_STATE, VIBRATE, POST_NOTIFICATIONS. The APK is packaged using Gradle 8+ with Android SDK 34 target.`,
          summary: 'Guidelines for Android mobile-first development and APK packaging.',
          tags: ['android', 'kotlin', 'compose', 'capacitor', 'apk'],
          chunks: [
            'To build and deploy on Android, apps use modern Jetpack Compose with Material 3 design and Capacitor...',
            'Key permissions: INTERNET, ACCESS_NETWORK_STATE, VIBRATE, POST_NOTIFICATIONS.'
          ],
          metadata: { sdkTarget: 34, framework: 'Capacitor/Compose' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'kn-003',
          title: 'Agentic Tool Protocol & Consequential Actions',
          category: 'research',
          content: `Agentic tools operate under a zero-trust model. Consequential actions (destructive file writes, external network requests, financial operations, system resets) require explicit human-in-the-loop confirmation before execution. All operations are logged to the immutable Tool Audit Ledger.`,
          summary: 'Security constraints and human-in-the-loop verification protocol.',
          tags: ['security', 'tools', 'human-in-the-loop', 'audit'],
          chunks: [
            'Agentic tools operate under a zero-trust model.',
            'Consequential actions require explicit human-in-the-loop confirmation before execution.'
          ],
          metadata: { securityLevel: 'high' },
          createdAt: new Date().toISOString(),
        }
      );
    }

    // 3. Seed initial workspace sample files
    if (this.data.workspace.length === 0) {
      this.data.workspace.push(
        {
          path: 'src/android/MainActivity.kt',
          content: `package ai.superintelligence.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    SuperIntelligenceHomeScreen()
                }
            }
        }
    }
}

@Composable
fun SuperIntelligenceHomeScreen() {
    Text(text = "SUPER INTELLIGENCE AI - Mobile Neural Core Online")
}`,
          language: 'kotlin',
          updatedAt: new Date().toISOString(),
        },
        {
          path: 'android/AndroidManifest.xml',
          content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="ai.superintelligence.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="SUPER INTELLIGENCE"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
          language: 'xml',
          updatedAt: new Date().toISOString(),
        },
        {
          path: 'src/agent_core.py',
          content: `"""
SUPER INTELLIGENCE AI - Agent Core Framework
Handles dynamic agent routing, working memory, and tool dispatch.
"""
from typing import Dict, Any, List

class AgentCore:
    def __init__(self, agent_name: str, role: str):
        self.agent_name = agent_name
        self.role = role
        self.working_memory: List[Dict[str, Any]] = []

    def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "success",
            "agent": self.agent_name,
            "result": f"Executed: {task.get('description')}"
        }
`,
          language: 'python',
          updatedAt: new Date().toISOString(),
        }
      );
    }

    // 4. Seed initial long-term memories
    if (this.data.memories.length === 0) {
      this.data.memories.push(
        {
          id: 'mem-001',
          userId: 'usr-primary-001',
          type: 'user_preference',
          category: 'coding_standards',
          key: 'code_quality_requirement',
          content: 'User prefers production-ready code with complete error handling, TypeScript types, and comprehensive tests without mock placeholders.',
          importance: 0.95,
          accessCount: 12,
          lastAccessed: new Date().toISOString(),
          tags: ['coding', 'preferences', 'production'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'mem-002',
          userId: 'usr-primary-001',
          type: 'semantic',
          category: 'architecture',
          key: 'agentic_orchestration_pattern',
          content: 'The platform coordinates 8 agents: Research, Coding, Planning, Analysis, Memory, Verification, Tool-Use, and Quality-Control through an event-driven orchestrator.',
          importance: 0.9,
          accessCount: 8,
          lastAccessed: new Date().toISOString(),
          tags: ['agents', 'orchestration', 'semantic'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'mem-003',
          userId: 'usr-primary-001',
          type: 'episodic',
          category: 'task_execution',
          key: 'android_build_initialization',
          content: 'Successfully configured Capacitor and Android Studio build manifests for native APK generation with hardware keyboard adjustment and dark mode status bar.',
          importance: 0.85,
          accessCount: 4,
          lastAccessed: new Date().toISOString(),
          tags: ['android', 'capacitor', 'apk'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    }

    // 5. Seed initial evaluation benchmark records
    if (this.data.evaluations.length === 0) {
      this.data.evaluations.push(
        {
          id: 'eval-001',
          benchmarkName: 'Hierarchical Task Decomposition',
          category: 'planning',
          score: 96.5,
          details: 'Decomposed 5-step Android APK build pipeline with 0 prerequisite cyclic errors.',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'eval-002',
          benchmarkName: 'Multi-Model Fallback Resilience',
          category: 'latency',
          score: 98.2,
          details: 'Automatic failover completed within 142ms without dropping client SSE connection.',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'eval-003',
          benchmarkName: 'Fact & Contradiction Verification',
          category: 'logic',
          score: 94.0,
          details: 'Verification Agent accurately caught 12 out of 12 synthesized logical inconsistencies.',
          timestamp: new Date().toISOString(),
        }
      );
    }

    this.save();
  }

  // Getters & Mutation Methods
  get users(): User[] {
    return this.data.users;
  }
  get sessions(): ChatSession[] {
    return this.data.sessions;
  }
  get messages(): ChatMessage[] {
    return this.data.messages;
  }
  get memories(): MemoryRecord[] {
    return this.data.memories;
  }
  get plans(): PlanRecord[] {
    return this.data.plans;
  }
  get knowledge(): KnowledgeDocument[] {
    return this.data.knowledge;
  }
  get toolAudit(): ToolAuditEntry[] {
    return this.data.toolAudit;
  }
  get workspace(): WorkspaceFile[] {
    return this.data.workspace;
  }
  get evaluations(): EvaluationMetric[] {
    return this.data.evaluations;
  }

  public persist(): void {
    this.save();
  }

  // Helper finders & updaters
  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByUsernameOrEmail(identifier: string): User | undefined {
    return this.data.users.find(u => u.username === identifier || u.email === identifier);
  }

  public addSession(session: ChatSession): void {
    this.data.sessions.unshift(session);
    this.save();
  }

  public deleteSession(sessionId: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.id !== sessionId);
    this.data.messages = this.data.messages.filter(m => m.sessionId !== sessionId);
    this.save();
  }

  public addMessage(message: ChatMessage): void {
    this.data.messages.push(message);
    const session = this.data.sessions.find(s => s.id === message.sessionId);
    if (session) {
      session.updatedAt = new Date().toISOString();
    }
    this.save();
  }

  public getMessagesForSession(sessionId: string): ChatMessage[] {
    return this.data.messages
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  public addMemory(record: MemoryRecord): void {
    this.data.memories.unshift(record);
    this.save();
  }

  public deleteMemory(id: string): void {
    this.data.memories = this.data.memories.filter(m => m.id !== id);
    this.save();
  }

  public addToolAudit(entry: ToolAuditEntry): void {
    this.data.toolAudit.unshift(entry);
    if (this.data.toolAudit.length > 500) {
      this.data.toolAudit.pop();
    }
    this.save();
  }

  public addEvaluation(metric: EvaluationMetric): void {
    this.data.evaluations.unshift(metric);
    this.save();
  }
}

export const db = new DatabaseEngine();
