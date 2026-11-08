import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Tag,
  CheckCircle2,
  FileText,
  Clock,
} from 'lucide-react';
import { KnowledgeDocument } from '../types';
import { api } from '../services/api';

export const KnowledgeScreen: React.FC = () => {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeDocument['category']>('documentation');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const data = await api.getKnowledge();
      setDocs(data);
      if (data.length > 0 && !selectedDoc) {
        setSelectedDoc(data[0]);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await api.searchKnowledge(searchQuery.trim());
      setSearchResults(results);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleAddDocument = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      const tagsArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.ingestKnowledge({
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim(),
        tags: tagsArray,
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      loadKnowledge();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteKnowledge(id);
      const remaining = docs.filter((d) => d.id !== id);
      setDocs(remaining);
      if (selectedDoc?.id === id) {
        setSelectedDoc(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 space-y-6 select-text">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/20 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-sm mb-1">
            <BookOpen className="w-4 h-4" />
            <span>KNOWLEDGE ENGINE & SEMANTIC RETRIEVER</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Document ingestion, structural chunking, TF-IDF vector cosine scoring, and source tracking for real-time agent verification.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Document</span>
        </button>
      </div>

      {/* Semantic Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Semantic search across knowledge base (e.g. Jetpack Compose, zero-trust tools)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
        >
          Search
        </button>
        {searchResults && (
          <button
            onClick={() => {
              setSearchResults(null);
              setSearchQuery('');
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search Results Alert if active */}
      {searchResults && (
        <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800 text-xs text-sky-300">
          Found {searchResults.length} matching knowledge documents with semantic relevance scores.
        </div>
      )}

      {/* Document Explorer Grid & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            Ingested Documents ({docs.length})
          </h3>
          <div className="space-y-2">
            {(searchResults ? searchResults.map((r) => r.document) : docs).map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500/40 text-slate-100'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate">{doc.title}</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {doc.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                    {doc.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Inspector */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDoc ? (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{selectedDoc.title}</h3>
                  <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span>Category: {selectedDoc.category}</span>
                    <span>•</span>
                    <span>Chunks: {selectedDoc.chunks.length}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(selectedDoc.id)}
                  className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {selectedDoc.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-sky-400 font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Full Content */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Document Text</span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {selectedDoc.content}
                </div>
              </div>

              {/* Structural Chunks */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>Semantic Ingestion Chunks ({selectedDoc.chunks.length})</span>
                </span>
                <div className="space-y-2">
                  {selectedDoc.chunks.map((chunk, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono text-slate-300"
                    >
                      <span className="text-[9px] text-sky-400 uppercase font-bold block mb-1">
                        Chunk #{cIdx + 1}
                      </span>
                      {chunk}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select or ingest a document to inspect chunks and metadata.
            </div>
          )}
        </div>
      </div>

      {/* Ingest Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Ingest Technical Document</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Jetpack Compose Navigation Architecture"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 outline-none"
                  >
                    <option value="documentation">Documentation</option>
                    <option value="android">Android</option>
                    <option value="code">Code Standards</option>
                    <option value="research">Research</option>
                    <option value="user_upload">User Upload</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="android, compose, kotlin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Content / Specification Text</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  placeholder="Paste documentation, specifications, or architectural notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 outline-none focus:border-sky-500 resize-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDocument}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-semibold transition cursor-pointer"
              >
                Ingest & Chunk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
