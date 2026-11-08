import { db, KnowledgeDocument } from './db';

export class KnowledgeEngine {
  public ingest(params: {
    title: string;
    category: KnowledgeDocument['category'];
    content: string;
    tags?: string[];
    sourceUrl?: string;
  }): KnowledgeDocument {
    const { title, category, content, tags = [], sourceUrl } = params;
    const docId = 'kn-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    // Structural chunking
    const chunks = this.chunkText(content, 350);
    const summary = content.slice(0, 200).replace(/\n/g, ' ') + (content.length > 200 ? '...' : '');

    const doc: KnowledgeDocument = {
      id: docId,
      title,
      category,
      content,
      summary,
      tags: tags.length > 0 ? tags : this.extractKeywords(content),
      chunks,
      metadata: {
        wordCount: content.split(/\s+/).filter(Boolean).length,
        chunkCount: chunks.length,
        ingestedAt: new Date().toISOString(),
      },
      sourceUrl,
      createdAt: new Date().toISOString(),
    };

    db.knowledge.unshift(doc);
    db.persist();
    return doc;
  }

  public search(query: string, category?: string): {
    document: KnowledgeDocument;
    score: number;
    matchedChunks: string[];
  }[] {
    const qTerms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    if (qTerms.length === 0) return [];

    const candidates = category
      ? db.knowledge.filter(k => k.category === category)
      : db.knowledge;

    const scored = candidates.map(doc => {
      let score = 0;
      const docText = (doc.title + ' ' + doc.content + ' ' + doc.tags.join(' ')).toLowerCase();
      
      // Calculate token match frequency
      for (const term of qTerms) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = (docText.match(regex) || []).length;
        score += matches * 2;
        if (doc.title.toLowerCase().includes(term)) score += 5;
        if (doc.tags.some(t => t.toLowerCase().includes(term))) score += 4;
      }

      // Find top matching chunks
      const matchedChunks = doc.chunks.filter(chunk => {
        const cLower = chunk.toLowerCase();
        return qTerms.some(term => cLower.includes(term));
      }).slice(0, 2);

      return {
        document: doc,
        score,
        matchedChunks,
      };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  public delete(id: string): boolean {
    const idx = db.knowledge.findIndex(k => k.id === id);
    if (idx !== -1) {
      db.knowledge.splice(idx, 1);
      db.persist();
      return true;
    }
    return false;
  }

  private chunkText(text: string, maxTokensApprox: number): string[] {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const p of paragraphs) {
      if ((currentChunk + ' ' + p).length / 4 < maxTokensApprox) {
        currentChunk = currentChunk ? currentChunk + '\n\n' + p : p;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = p;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    return chunks.length > 0 ? chunks : [text];
  }

  private extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 5);
    const counts: Record<string, number> = {};
    for (const w of words) {
      counts[w] = (counts[w] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(e => e[0]);
  }
}

export const knowledgeEngine = new KnowledgeEngine();
