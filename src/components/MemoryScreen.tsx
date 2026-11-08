import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Tag,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MemoryRecord } from '../types';
import { api } from '../services/api';

export const MemoryScreen: React.FC = () => {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<MemoryRecord['type']>('long_term');
  const [newCategory, setNewCategory] = useState('architecture');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const data = await api.getMemories();
      setMemories(data);
    } catch (err: unknown) {
      console.error('Failed to load memories:', err);
    }
  };

  const handleAddMemory = async () => {
    if (!newKey.trim() || !newContent.trim()) return;
    try {
      await api.addMemory({
        key: newKey.trim(),
        content: newContent.trim(),
        type: newType,
        category: newCategory,
        importance: 0.9,
        tags: [newCategory, newType],
      });
      setShowAddModal(false);
      setNewKey('');
      setNewContent('');
      loadMemories();
      setSuccessToast('Memory triple persisted successfully.');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories(memories.filter((m) => m.id !== id));
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleConsolidate = async () => {
    setIsConsolidating(true);
    try {
      const res = await api.consolidateMemories();
      loadMemories();
      setSuccessToast(`Neural consolidation complete. ${res.duplicatesRemoved} duplicates pruned, importance reinforced.`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsConsolidating(false);
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || m.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-pink-950/20 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-sm mb-1">
            <Database className="w-4 h-4" />
            <span>DEEP NEURAL MEMORY ARCHITECTURE</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Multi-tiered cognitive store: Working memory, Long-term factual triples, Episodic past task events, Semantic knowledge graph, and User preferences.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleConsolidate}
            disabled={isConsolidating}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-pink-300 border border-pink-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isConsolidating ? 'Consolidating...' : 'Neural Consolidation'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory triples, preferences, tags, or facts..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-pink-500 cursor-pointer"
          aria-label="Filter memory by cognitive tier"
        >
          <option value="all">All Cognitive Tiers</option>
          <option value="long_term">Long-Term Memory</option>
          <option value="user_preference">User Preferences</option>
          <option value="episodic">Episodic (Task Events)</option>
          <option value="semantic">Semantic (Concepts)</option>
          <option value="working">Working Memory</option>
        </select>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.map((mem) => (
          <div
            key={mem.id}
            className="flex flex-col justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-pink-950/60 text-pink-400 border border-pink-900/50">
                  {mem.type.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  Importance: {(mem.importance * 100).toFixed(0)}%
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-200">{mem.key}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mem.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>{mem.category}</span>
              </div>

              <button
                onClick={() => handleDelete(mem.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                title="Delete memory record"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Database className="w-4 h-4 text-pink-400" />
              <span>Persist Knowledge Triple</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Memory Key / Identifier</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. android_architecture_standard"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 mb-1 block">Cognitive Tier</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 outline-none"
                  >
                    <option value="long_term">Long-Term</option>
                    <option value="user_preference">User Preference</option>
                    <option value="semantic">Semantic</option>
                    <option value="episodic">Episodic</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Content / Statement</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  placeholder="Detail the factual requirement, user preference, or architectural rule..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 outline-none focus:border-pink-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                disabled={!newKey.trim() || !newContent.trim()}
                className="px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white text-xs font-semibold transition"
              >
                Persist Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
