import React, { useState } from 'react';
import { ERM_TOPICS, NoteTopic, QuizQuestion } from '../data/ermNotesData';
import { X, BookOpen, Sparkles, Layers, Cpu, ShoppingCart, Calculator, Plus, Loader2, Check } from 'lucide-react';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomQuestions: (questions: QuizQuestion[]) => void;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onClose,
  onAddCustomQuestions,
}) => {
  const [activeTab, setActiveTab] = useState<'study' | 'ai-generator'>('study');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('topic1');
  const [customText, setCustomText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Topic 1: ERM Foundations');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationMsg, setGenerationMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTopic = ERM_TOPICS.find(t => t.id === selectedTopicId) || ERM_TOPICS[0];

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setGenerationMsg(null);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesContent: customText || currentTopic.summary + ' ' + currentTopic.keyPoints.join(' '),
          topic: selectedCategory,
          count: 4,
        }),
      });

      const data = await response.json();
      if (data.success && data.questions?.length > 0) {
        const formatted: QuizQuestion[] = data.questions.map((q: any, i: number) => ({
          id: `custom-${Date.now()}-${i}`,
          topicId: (currentTopic.id as any) || 'topic1',
          topicTitle: q.topic || selectedCategory,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          sourceNote: 'Custom Generated / Student Note',
          difficulty: q.difficulty || 'normal',
        }));

        onAddCustomQuestions(formatted);
        setGenerationMsg(`Successfully created ${formatted.length} new question blocks for your adventure!`);
        setTimeout(() => setGenerationMsg(null), 4000);
      } else {
        setGenerationMsg(data.error || 'Failed to generate questions. Please try again.');
      }
    } catch (err: any) {
      setGenerationMsg(err.message || 'Error communicating with question generator server.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-amber-300">
                ERM COURSE STUDY GUIDE & AI GENERATOR
              </h2>
              <p className="text-xs text-slate-400">
                Enterprise Resource Management (BBT2004) Student Lecture Notes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-5 pt-3 bg-slate-900/50 gap-4">
          <button
            onClick={() => setActiveTab('study')}
            className={`pb-3 font-pixel text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'study'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>LECTURE NOTES</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-generator')}
            className={`pb-3 font-pixel text-xs flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'ai-generator'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>GENERATE FROM NOTES (AI)</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'study' ? (
            <div>
              {/* Topic Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {ERM_TOPICS.map(topic => {
                  const isSelected = topic.id === selectedTopicId;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-pixel text-[10px] text-amber-400 mb-1">{topic.code}</div>
                      <div className="text-xs font-semibold truncate">{topic.title}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Topic Content */}
              <div className="space-y-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                <div>
                  <div className="font-pixel text-[11px] text-amber-400 mb-1">{currentTopic.code}</div>
                  <h3 className="text-lg font-bold text-slate-100">{currentTopic.title}</h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {currentTopic.summary}
                  </p>
                </div>

                {/* Key Concepts from Notes */}
                <div>
                  <h4 className="font-pixel text-xs text-blue-400 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    CORE LECTURE TAKEAWAYS
                  </h4>
                  <ul className="space-y-2.5">
                    {currentTopic.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Formulas Section if present */}
                {currentTopic.formulas && currentTopic.formulas.length > 0 && (
                  <div>
                    <h4 className="font-pixel text-xs text-emerald-400 mb-3 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      KEY INVENTORY & SCHEDULING FORMULAS
                    </h4>
                    <div className="space-y-3">
                      {currentTopic.formulas.map((f, i) => (
                        <div key={i} className="p-3.5 bg-slate-900 rounded-xl border border-emerald-500/30">
                          <div className="font-bold text-xs text-emerald-300 mb-1">{f.label}</div>
                          <div className="font-mono text-sm bg-black/50 p-2 rounded text-amber-300 font-bold tracking-wide">
                            {f.formula}
                          </div>
                          <p className="text-xs text-slate-400 mt-2">{f.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* AI Question Generator Tab */
            <div className="space-y-5">
              <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-xl text-blue-200 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-blue-300">Custom Quiz Generator:</span> Paste any notes, summary bullet points, or lecture slides below. Gemini 3.8 Flash will generate interactive Mario '?' Question Blocks from your notes!
              </div>

              <div>
                <label className="block text-xs font-pixel text-slate-300 mb-2">
                  TARGET ERM TOPIC
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Topic 1: ERM Foundations & 3 Flows">Topic 1: ERM Foundations & 3 Flows</option>
                  <option value="Topic 2: AI, ML, IoT & Process Maps">Topic 2: AI, ML, IoT & Process Maps</option>
                  <option value="Topic 3: Sales Order Process & Fulfilment">Topic 3: Sales Order Process & Fulfilment</option>
                  <option value="Topic 4 & 6: Inventory, MRP, EOQ & Scheduling">Topic 4 & 6: Inventory, MRP, EOQ & Scheduling</option>
                  <option value="General Supply Chain Management">General Supply Chain Management</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-pixel text-slate-300 mb-2">
                  CUSTOM NOTES / SLIDES CONTENT (OPTIONAL)
                </label>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  rows={6}
                  placeholder="Paste your lecture notes, formula explanations, or key concepts here... (Leave blank to use the built-in BBT2004 notes)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-400 font-mono resize-none"
                />
              </div>

              {generationMsg && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{generationMsg}</span>
                </div>
              )}

              <button
                disabled={isGenerating}
                onClick={handleGenerateQuestions}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-pixel text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>GENERATING WITH GEMINI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>GENERATE NEW MARIO QUESTION BLOCKS</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
