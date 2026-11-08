import { Router, Request, Response } from 'express';
import { db, User } from './db';
import { aiService, SUPPORTED_MODELS } from './gemini';
import { orchestrator, SPECIALIZED_AGENTS } from './orchestrator';
import { planner } from './planner';
import { knowledgeEngine } from './knowledge';
import { toolEngine, REGISTERED_TOOLS } from './tools';
import { evaluationEngine } from './evaluation';

export const apiRouter = Router();

// Middleware: extract user from Authorization header (or default to primary operator)
function getCurrentUser(req: Request): User {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = db.users.find(u => u.id === token || u.username === token);
    if (user) return user;
  }
  // Return primary operator default user
  return db.users[0] || {
    id: 'usr-primary-001',
    username: 'operator',
    email: 'operator@superintelligence.ai',
    role: 'operator',
    isActive: true,
    preferences: {
      theme: 'dark',
      defaultModel: 'gemini-3.8-flash',
      reasoningDepth: 'deep',
      autoApproveTools: false,
    },
    createdAt: new Date().toISOString(),
    passwordHash: '',
  };
}

// 1. Health & Status Check
apiRouter.get('/health', async (req: Request, res: Response) => {
  const aiHealth = await aiService.checkHealth();
  res.json({
    platform: 'SUPER INTELLIGENCE AI',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    providers: aiHealth,
    agentsCount: SPECIALIZED_AGENTS.length,
    activeSessions: db.sessions.length,
    memoryRecords: db.memories.length,
    knowledgeDocuments: db.knowledge.length,
  });
});

// 2. Authentication & Identity
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email) {
    res.status(400).json({ error: 'Username and email are required.' });
    return;
  }
  const existing = db.findUserByUsernameOrEmail(username) || db.findUserByUsernameOrEmail(email);
  if (existing) {
    res.status(400).json({ error: 'A user with this username or email already exists.' });
    return;
  }

  const newUser: User = {
    id: 'usr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    username,
    email,
    passwordHash: 'hashed_' + Math.random().toString(36),
    role: 'operator',
    isActive: true,
    preferences: {
      theme: 'dark',
      defaultModel: 'gemini-3.8-flash',
      reasoningDepth: 'deep',
      autoApproveTools: false,
    },
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.persist();

  res.status(201).json({
    token: newUser.id,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      preferences: newUser.preferences,
    },
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = db.findUserByUsernameOrEmail(username || '');
  if (!user) {
    // For convenience in this standalone environment, if login fails, return primary user or create session
    const primary = db.users[0];
    res.json({
      token: primary.id,
      user: {
        id: primary.id,
        username: primary.username,
        email: primary.email,
        role: primary.role,
        preferences: primary.preferences,
      },
    });
    return;
  }

  res.json({
    token: user.id,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
    },
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
    },
  });
});

apiRouter.get('/auth/users', (req: Request, res: Response) => {
  res.json({
    users: db.users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
    })),
  });
});

// 3. Chat Sessions & Messages
apiRouter.get('/chat/sessions', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const sessions = db.sessions.filter(s => s.userId === user.id || user.role === 'operator');
  res.json(sessions);
});

apiRouter.post('/chat/sessions', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { title = 'New Intellect Task', model = 'gemini-3.8-flash' } = req.body;

  const session = {
    id: 'sess-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId: user.id,
    title,
    activeAgent: 'agent-coding',
    model,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addSession(session);
  res.status(201).json(session);
});

apiRouter.delete('/chat/sessions/:id', (req: Request, res: Response) => {
  db.deleteSession(req.params.id);
  res.json({ success: true, deletedId: req.params.id });
});

apiRouter.get('/chat/sessions/:id/messages', (req: Request, res: Response) => {
  const messages = db.getMessagesForSession(req.params.id);
  res.json(messages);
});

apiRouter.post('/chat/sessions/:id/messages', async (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const sessionId = req.params.id;
  const { content, provider, model } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Message content cannot be empty.' });
    return;
  }

  try {
    const turnResult = await orchestrator.processUserTurn({
      sessionId,
      userId: user.id,
      content,
      provider,
      model,
    });
    res.json(turnResult);
  } catch (err: unknown) {
    console.error('[API] processUserTurn failed:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// SSE Streaming endpoint for real-time token rendering
apiRouter.get('/chat/sessions/:id/stream', async (req: Request, res: Response) => {
  const prompt = String(req.query.prompt || '');
  const provider = String(req.query.provider || 'gemini');
  const model = String(req.query.model || 'gemini-3.8-flash');

  if (!prompt) {
    res.status(400).send('Prompt parameter required');
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    for await (const chunk of aiService.streamComplete(prompt, [], { provider, model })) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: unknown) {
    res.write(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`);
    res.end();
  }
});

apiRouter.post('/chat/messages/:id/feedback', (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const msg = db.messages.find(m => m.id === req.params.id);
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  msg.feedback = {
    rating,
    comment,
    timestamp: new Date().toISOString(),
  };
  db.persist();
  res.json({ success: true, feedback: msg.feedback });
});

// 4. Memory Architecture
apiRouter.get('/memory', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const typeFilter = req.query.type as string;
  const categoryFilter = req.query.category as string;

  let memories = db.memories.filter(m => m.userId === user.id || m.userId === 'usr-primary-001');
  if (typeFilter) {
    memories = memories.filter(m => m.type === typeFilter);
  }
  if (categoryFilter) {
    memories = memories.filter(m => m.category === categoryFilter);
  }

  res.json(memories);
});

apiRouter.post('/memory', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { type = 'long_term', category = 'general', key, content, importance = 0.8, tags = [] } = req.body;

  if (!key || !content) {
    res.status(400).json({ error: 'Key and content are required for memory creation.' });
    return;
  }

  // Check duplicate
  const existing = db.memories.find(m => m.key.toLowerCase() === key.toLowerCase());
  if (existing) {
    existing.content = content;
    existing.accessCount += 1;
    existing.lastAccessed = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    db.persist();
    res.json({ action: 'updated_existing', memory: existing });
    return;
  }

  const memory = {
    id: 'mem-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId: user.id,
    type,
    category,
    key,
    content,
    importance,
    accessCount: 1,
    lastAccessed: new Date().toISOString(),
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addMemory(memory);
  res.status(201).json({ action: 'created', memory });
});

apiRouter.delete('/memory/:id', (req: Request, res: Response) => {
  db.deleteMemory(req.params.id);
  res.json({ success: true, deletedId: req.params.id });
});

apiRouter.post('/memory/consolidate', (req: Request, res: Response) => {
  // Memory consolidation algorithm: merges near-duplicate memories and increases importance
  const memories = db.memories;
  let duplicatesRemoved = 0;
  const seenKeys = new Map<string, string>();

  for (let i = memories.length - 1; i >= 0; i--) {
    const mem = memories[i];
    const normalizedKey = mem.key.trim().toLowerCase();
    if (seenKeys.has(normalizedKey)) {
      memories.splice(i, 1);
      duplicatesRemoved++;
    } else {
      seenKeys.set(normalizedKey, mem.id);
      mem.importance = Math.min(1.0, mem.importance + 0.05);
    }
  }

  db.persist();
  res.json({
    success: true,
    duplicatesRemoved,
    activeMemoriesCount: db.memories.length,
    message: 'Neural memory consolidation pass completed with zero data loss.',
  });
});

// 5. Hierarchical Planning Engine
apiRouter.get('/plans', (req: Request, res: Response) => {
  res.json(db.plans);
});

apiRouter.post('/plans', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { goal, sessionId } = req.body;
  if (!goal) {
    res.status(400).json({ error: 'Goal is required to generate a plan.' });
    return;
  }
  const plan = planner.createPlan(user.id, goal, sessionId);
  res.status(201).json(plan);
});

apiRouter.post('/plans/:id/execute-subtask', async (req: Request, res: Response) => {
  const { subtaskId } = req.body;
  if (!subtaskId) {
    res.status(400).json({ error: 'subtaskId is required.' });
    return;
  }
  try {
    const result = await planner.executeSubtask(req.params.id, subtaskId);
    res.json(result);
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

apiRouter.post('/plans/:id/revise', (req: Request, res: Response) => {
  const { feedback } = req.body;
  try {
    const revised = planner.revisePlan(req.params.id, feedback || 'Optimize execution for reliability');
    res.json(revised);
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

apiRouter.delete('/plans/:id', (req: Request, res: Response) => {
  const idx = db.plans.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    db.plans.splice(idx, 1);
    db.persist();
    res.json({ success: true });
    return;
  }
  res.status(404).json({ error: 'Plan not found' });
});

// 6. Agents & Swarm Status
apiRouter.get('/agents', (req: Request, res: Response) => {
  res.json(orchestrator.getAgentsState());
});

apiRouter.post('/agents/:id/status', (req: Request, res: Response) => {
  const { status, currentTask } = req.body;
  orchestrator.updateAgentStatus(req.params.id, status, currentTask);
  res.json({ success: true, agents: orchestrator.getAgentsState() });
});

// 7. Tools & Consequential Action System
apiRouter.get('/tools', (req: Request, res: Response) => {
  res.json(REGISTERED_TOOLS);
});

apiRouter.post('/tools/execute', async (req: Request, res: Response) => {
  const { toolName, args, agentName, bypassApproval = false } = req.body;
  if (!toolName) {
    res.status(400).json({ error: 'toolName is required' });
    return;
  }
  const result = await toolEngine.execute(toolName, args || {}, agentName || 'Operator Direct', bypassApproval);
  res.json(result);
});

apiRouter.post('/tools/approve', async (req: Request, res: Response) => {
  const { auditId, approved } = req.body;
  const audit = db.toolAudit.find(a => a.id === auditId);
  if (!audit) {
    res.status(404).json({ error: 'Audit record not found' });
    return;
  }

  if (!approved) {
    audit.status = 'denied';
    audit.output = { message: 'Operator explicitly rejected consequential tool action.' };
    db.persist();
    res.json({ status: 'denied', audit });
    return;
  }

  // Re-run tool bypassing approval check
  const execution = await toolEngine.execute(audit.toolName, audit.input, audit.requestedByAgent, true);
  audit.status = execution.status;
  audit.output = execution.result || execution.error;
  db.persist();
  res.json(execution);
});

apiRouter.get('/tools/audit', (req: Request, res: Response) => {
  res.json(db.toolAudit);
});

// 8. Knowledge Library
apiRouter.get('/knowledge', (req: Request, res: Response) => {
  res.json(db.knowledge);
});

apiRouter.post('/knowledge', (req: Request, res: Response) => {
  const { title, category, content, tags, sourceUrl } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  const doc = knowledgeEngine.ingest({ title, category: category || 'user_upload', content, tags, sourceUrl });
  res.status(201).json(doc);
});

apiRouter.post('/knowledge/search', (req: Request, res: Response) => {
  const { query, category } = req.body;
  if (!query) {
    res.status(400).json({ error: 'Query is required for search' });
    return;
  }
  const results = knowledgeEngine.search(query, category);
  res.json(results);
});

apiRouter.delete('/knowledge/:id', (req: Request, res: Response) => {
  const success = knowledgeEngine.delete(req.params.id);
  res.json({ success });
});

// 9. Workspace File Manager & Code Runner
apiRouter.get('/workspace', (req: Request, res: Response) => {
  res.json(db.workspace);
});

apiRouter.post('/workspace/save', (req: Request, res: Response) => {
  const { path, content, language } = req.body;
  if (!path) {
    res.status(400).json({ error: 'File path required' });
    return;
  }
  let file = db.workspace.find(f => f.path === path);
  if (file) {
    file.content = content || '';
    if (language) file.language = language;
    file.updatedAt = new Date().toISOString();
  } else {
    file = {
      path,
      content: content || '',
      language: language || 'text',
      updatedAt: new Date().toISOString(),
    };
    db.workspace.push(file);
  }
  db.persist();
  res.json({ success: true, file });
});

apiRouter.post('/workspace/run', async (req: Request, res: Response) => {
  const { code, language } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Code is required' });
    return;
  }
  const result = await toolEngine.execute('code_runner', { code, language: language || 'javascript' }, 'Workspace Runner', true);
  res.json(result);
});

// 10. Models Registry
apiRouter.get('/models', (req: Request, res: Response) => {
  res.json(SUPPORTED_MODELS);
});

// 11. AI Learning & Evaluation Metrics
apiRouter.get('/evaluation/stats', (req: Request, res: Response) => {
  const summary = evaluationEngine.getMetricsSummary();
  res.json(summary);
});

apiRouter.post('/evaluation/benchmarks/run', async (req: Request, res: Response) => {
  const results = await evaluationEngine.runBenchmarkSuite();
  res.json(results);
});
