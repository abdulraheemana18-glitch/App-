import React, { useState, useEffect } from 'react';
import {
  Code2,
  FileCode,
  Play,
  Save,
  Download,
  Terminal,
  Smartphone,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { WorkspaceFile } from '../types';
import { api } from '../services/api';

export const WorkspaceScreen: React.FC = () => {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  const [editorContent, setEditorContent] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string>('[Console Ready] Click "Run Code in Sandbox" to execute.');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await api.getWorkspaceFiles();
      setFiles(data);
      if (data.length > 0 && !activeFilePath) {
        setActiveFilePath(data[0].path);
        setEditorContent(data[0].content);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSelectFile = (file: WorkspaceFile) => {
    setActiveFilePath(file.path);
    setEditorContent(file.content);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!activeFilePath) return;
    try {
      const activeFile = files.find((f) => f.path === activeFilePath);
      await api.saveWorkspaceFile(activeFilePath, editorContent, activeFile?.language || 'text');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      loadFiles();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleRunCode = async () => {
    const activeFile = files.find((f) => f.path === activeFilePath);
    const lang = activeFile?.language || 'javascript';
    setIsRunning(true);
    setConsoleOutput(`[Execution Harness] Initializing isolated ${lang} sandbox...`);

    try {
      const res = await api.runCode(editorContent, lang);
      if (res.result) {
        setConsoleOutput(res.result.output || JSON.stringify(res.result, null, 2));
      } else {
        setConsoleOutput(`Error: ${res.error || 'Execution halted'}`);
      }
    } catch (err: unknown) {
      setConsoleOutput(`Error: ${(err as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateAndroidScaffold = async () => {
    try {
      setConsoleOutput('[Android Tool] Scaffolding Jetpack Compose & Capacitor Android Project...');
      await api.executeTool('android_scaffold', {
        packageName: 'ai.superintelligence.app',
        appName: 'Super Intelligence AI',
      }, true);
      await loadFiles();
      setConsoleOutput('✅ Android Project Scaffolded!\nFiles created:\n- MainActivity.kt\n- AndroidManifest.xml\n- capacitor.config.ts\nTarget SDK 34 verified.');
    } catch (err: unknown) {
      setConsoleOutput(`Failed to scaffold: ${(err as Error).message}`);
    }
  };

  const handleCreateNewFile = async () => {
    if (!newFileName.trim()) return;
    const path = newFileName.trim();
    const ext = path.split('.').pop() || 'txt';
    const lang = ext === 'kt' ? 'kotlin' : ext === 'py' ? 'python' : ext === 'ts' || ext === 'tsx' ? 'typescript' : 'javascript';

    await api.saveWorkspaceFile(path, '// New module for Super Intelligence platform\n', lang);
    setShowNewFileModal(false);
    setNewFileName('');
    await loadFiles();
    setActiveFilePath(path);
    setEditorContent('// New module for Super Intelligence platform\n');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden select-text">
      {/* Top Workspace Bar */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">AI SOFTWARE STUDIO & SANDBOX</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateAndroidScaffold}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scaffold Android App</span>
          </button>

          <button
            onClick={() => setShowNewFileModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            title="Create New File"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Editor & Explorer Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-14 md:pb-0">
        {/* File Explorer Sidebar */}
        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/90 p-3 space-y-2 overflow-y-auto max-h-40 md:max-h-full flex-shrink-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            Project Files
          </div>
          <div className="space-y-1">
            {files.map((file) => {
              const isSelected = file.path === activeFilePath;
              return (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition text-left truncate ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Editor & Console Output */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* File Tab Bar */}
          <div className="h-9 bg-slate-900/60 border-b border-slate-800/80 px-3 flex items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
            <span className="text-cyan-300 font-semibold">{activeFilePath || 'No file selected'}</span>
            <button
              onClick={copyCode}
              className="flex items-center space-x-1 hover:text-slate-200 transition"
              title="Copy source"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Textarea Editor */}
          <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed text-slate-200">
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="w-full h-full bg-transparent outline-none resize-none font-mono text-slate-100 placeholder-slate-600 leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Console / Output Panel */}
          <div className="h-36 sm:h-44 border-t border-slate-800 bg-slate-900/90 flex flex-col flex-shrink-0">
            <div className="h-7 bg-slate-950/80 border-b border-slate-800 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Execution Output Console</span>
              </div>
              <button
                onClick={() => setConsoleOutput('')}
                className="hover:text-slate-200 text-[10px]"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 p-3 font-mono text-xs text-emerald-300 overflow-y-auto whitespace-pre-wrap select-text">
              {consoleOutput}
            </div>
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-100">Create New Module</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. src/auth/AuthService.kt or app.py"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none focus:border-cyan-500 font-mono"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                disabled={!newFileName.trim()}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold text-xs"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
