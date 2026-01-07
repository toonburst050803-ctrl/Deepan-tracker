
import React, { useState, useEffect } from 'react';
import { generateSavingsInsights } from '../services/geminiService';
import { Expense, SavingsInsight } from '../types';
import { Lightbulb, ShieldAlert, PiggyBank, Sparkles, RefreshCcw, BrainCircuit, Search, Zap, TrendingDown, Target } from 'lucide-react';

interface InsightsViewProps {
  expenses: Expense[];
}

const InsightsView: React.FC<InsightsViewProps> = ({ expenses }) => {
  const [insight, setInsight] = useState<SavingsInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Starting Intelligence...",
    "Scanning History...",
    "Analyzing Patterns...",
    "Simulating Savings...",
    "Finalizing Tips..."
  ];

  const fetchInsights = async () => {
    if (expenses.length < 3) return;
    setLoading(true);
    setLoadingStep(0);
    
    // Snappy 600ms interval for faster visual feedback
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 600);

    try {
      const data = await generateSavingsInsights(expenses);
      setInsight(data);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (expenses.length < 3) {
    return (
      <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 text-center animate-fadeIn">
        <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-inner">
          <Sparkles size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Insufficient Data</h3>
        <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
          Deepan needs at least 3 expenses to generate meaningful AI insights and professional savings projections.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-2.5 bg-amber-500 rounded-full shadow-lg shadow-amber-100"></div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            Deepan Insights
          </h2>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 shadow-blue-50'}`}
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : 'Refresh AI'}
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-16 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full -ml-32 -mb-32 blur-2xl animate-pulse"></div>

          <div className="relative w-24 h-24 mb-8">
             <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full animate-ping"></div>
             <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                {loadingStep === 0 && <BrainCircuit size={32} />}
                {loadingStep === 1 && <Search size={32} />}
                {loadingStep === 2 && <TrendingDown size={32} />}
                {loadingStep === 3 && <Target size={32} />}
                {loadingStep === 4 && <Zap size={32} />}
             </div>
          </div>

          <div className="text-center">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mb-2">
              {loadingMessages[loadingStep]}
            </h3>
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            </div>
          </div>
        </div>
      ) : insight ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:border-blue-200">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Lightbulb size={64} className="text-blue-600" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shadow-sm">
                <Lightbulb size={24} />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-base">Expert Tips</h3>
            </div>
            <ul className="space-y-4">
              {insight.suggestions.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed group/item">
                  <span className="text-blue-500 font-black mt-0.5">•</span>
                  <span className="group-hover/item:text-slate-900 transition-colors">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:border-rose-200">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldAlert size={64} className="text-rose-600" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-rose-50 p-3 rounded-2xl text-rose-600 shadow-sm">
                <ShieldAlert size={24} />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-base">Spending Leaks</h3>
            </div>
            <div className="p-5 bg-rose-50/30 rounded-2xl border border-rose-100/50">
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{insight.avoidableExpenses}"
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-500/20 p-3 rounded-2xl text-emerald-400 shadow-sm border border-emerald-500/20">
                <PiggyBank size={24} />
              </div>
              <h3 className="font-black text-white uppercase tracking-tight text-base">Savings Potential</h3>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-emerald-400 tracking-tighter">
                ₹{insight.estimatedSavings.toLocaleString()}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estimated Monthly Optimization</p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
               <div className="flex items-center gap-2 text-emerald-500/80">
                  <TrendingDown size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Projected Cost Reduction</span>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] shadow-sm border border-slate-100 text-center animate-fadeIn">
          <button 
            onClick={fetchInsights}
            className="group flex flex-col items-center gap-4 mx-auto"
          >
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all shadow-inner">
               <Sparkles size={40} className="group-hover:animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">AI Insights Available</h3>
              <p className="text-slate-400 font-medium text-sm mt-1">Tap to run deep analysis on your records</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightsView;
