import React, { useState } from 'react';
import { Bot, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AIAssistantProps {
  landIdentityId: string;
  initialExplanation?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ landIdentityId, initialExplanation }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: initialExplanation || "Hello! I am your BhoomiShield AI Land Record Assistant. Ask me anything about this land parcel's ownership, mutation timeline, record inconsistencies, or risk reasons."
    }
  ]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userText = question.trim();
    setQuestion('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ land_identity_id: landIdentityId, question: userText })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: 'ai', text: data.answer || "No response received." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: "Error connecting to BhoomiShield AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Why is this parcel marked medium risk?",
    "Who is the recorded owner in Register-II?",
    "Is there any active court dispute or stay order?",
    "Check mutation application history"
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[520px]">
      {/* AI Assistant Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-lg text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">BhoomiShield AI Assistant</h3>
              <span className="flex items-center space-x-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                <span>Grounded Evidence AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Trained on Jharbhoomi digitized records & risk engine snapshot</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/90 text-xs leading-relaxed">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-3 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 rounded-xl p-3 border border-slate-700 text-xs flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></div>
              <span>Synthesizing verified land record context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-slate-950/80 px-3 py-2 border-t border-slate-800 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => {
              setQuestion(prompt);
            }}
            className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleAsk} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask AI about land records, mutation, or risk details..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg transition-colors font-medium text-xs flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
