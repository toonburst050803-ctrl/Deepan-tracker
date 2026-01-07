
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Expense, Category, IncomeEntry } from './types';
import { processExpenseInput } from './services/geminiService';
import { syncService, SyncPayload } from './services/syncService';
import Dashboard from './components/Dashboard';
import ExpenseTable from './components/ExpenseTable';
import InsightsView from './components/InsightsView';
import ManualAddModal from './components/ManualAddModal';
import SyncHub from './components/SyncHub';
import { Camera, LayoutDashboard, List, Sparkles, Send, Plus, Cloud, CloudOff, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [salary, setSalary] = useState<number>(22000);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily' | 'insights'>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'scanning' | 'extracting' | 'categorizing'>('scanning');
  const [chatInput, setChatInput] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('deepan_user_email'));
  const [syncId, setSyncId] = useState<string | null>(localStorage.getItem('deepan_sync_id'));
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedExpenses = localStorage.getItem('deepan_expenses');
    const savedIncome = localStorage.getItem('deepan_income_entries');
    const savedSalary = localStorage.getItem('deepan_salary');

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedIncome) setIncomeEntries(JSON.parse(savedIncome));
    if (savedSalary) setSalary(Number(savedSalary));

    if (syncId) handlePull();
  }, []);

  useEffect(() => {
    localStorage.setItem('deepan_expenses', JSON.stringify(expenses));
    localStorage.setItem('deepan_income_entries', JSON.stringify(incomeEntries));
    localStorage.setItem('deepan_salary', salary.toString());
    
    if (syncId) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        handlePush();
      }, 1500);
    }
  }, [expenses, incomeEntries, salary, syncId]);

  const handlePush = async () => {
    if (!syncId) return;
    setSyncStatus('syncing');
    try {
      const payload: SyncPayload = { expenses, incomeEntries, salary, lastUpdated: new Date().toISOString() };
      await syncService.pushData(syncId, payload);
      setSyncStatus('idle');
    } catch (e) {
      setSyncStatus('error');
    }
  };

  const handlePull = async () => {
    if (!syncId) return;
    setSyncStatus('syncing');
    try {
      const data = await syncService.pullData(syncId);
      if (data) {
        setExpenses(data.expenses);
        setIncomeEntries(data.incomeEntries);
        setSalary(data.salary);
      }
      setSyncStatus('idle');
    } catch (e) {
      setSyncStatus('error');
    }
  };

  const handleLogin = async (email: string) => {
    const sid = syncService.getSyncId(email);
    setUserEmail(email);
    setSyncId(sid);
    localStorage.setItem('deepan_user_email', email);
    localStorage.setItem('deepan_sync_id', sid);
    
    setSyncStatus('syncing');
    try {
      const data = await syncService.pullData(sid);
      if (data) {
        setExpenses(data.expenses);
        setIncomeEntries(data.incomeEntries);
        setSalary(data.salary);
      }
      setSyncStatus('idle');
    } catch (e) {
      await syncService.initializeVault(sid, {
        expenses, incomeEntries, salary, lastUpdated: new Date().toISOString()
      });
      setSyncStatus('idle');
    }
  };

  const handleLogout = () => {
    setUserEmail(null);
    setSyncId(null);
    localStorage.removeItem('deepan_user_email');
    localStorage.removeItem('deepan_sync_id');
  };

  const addExpense = useCallback((newExpense: Partial<Expense>) => {
    let categoryValue = Category.OTHERS;
    const incomingCatRaw = String(newExpense.category || '').toUpperCase().trim().replace(/_/g, ' ');
    const validCategoryEntries = Object.values(Category) as string[];
    const matched = validCategoryEntries.find(val => val.toUpperCase().replace(/_/g, ' ') === incomingCatRaw);
    if (matched) categoryValue = matched as Category;

    const expense: Expense = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: newExpense.date ? new Date(newExpense.date).toISOString() : new Date().toISOString(),
      vendor: newExpense.vendor || 'Unknown Vendor',
      category: categoryValue,
      subCategory: newExpense.subCategory,
      amount: newExpense.amount || 0,
      paymentMode: newExpense.paymentMode || 'Cash',
      notes: newExpense.notes || ''
    };
    setExpenses(prev => {
      const updated = [...prev, expense];
      return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, []);

  // Fix: Missing updateExpense function
  const updateExpense = useCallback((updated: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
  }, []);

  // Fix: Missing deleteExpense function
  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // Fix: Missing addIncomeEntry function
  const addIncomeEntry = useCallback((source: string, amount: number) => {
    const newEntry: IncomeEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
      source,
      amount
    };
    setIncomeEntries(prev => [...prev, newEntry]);
  }, []);

  // Fix: Missing updateIncomeEntry function
  const updateIncomeEntry = useCallback((id: string, source: string, amount: number) => {
    setIncomeEntries(prev => prev.map(entry => entry.id === id ? { ...entry, source, amount } : entry));
  }, []);

  // Fix: Missing deleteIncomeEntry function
  const deleteIncomeEntry = useCallback((id: string) => {
    setIncomeEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileDateHint = file.lastModified ? new Date(file.lastModified).toISOString().split('T')[0] : '';
    const fileMetaContext = `FILE_CAPTURE_HINT: ${fileDateHint}`;

    setIsProcessing(true);
    setProcessingStatus('scanning');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setProcessingStatus('extracting');
        const base64Data = (reader.result as string).split(',')[1];
        setProcessingStatus('categorizing');
        const result = await processExpenseInput({ data: base64Data, mimeType: file.type }, `${chatInput} ${fileMetaContext}`);
        if (result.amount) {
          addExpense(result);
          setActiveTab('dashboard');
          setChatInput('');
        } else alert("Deepan couldn't detect a clear amount. Please ensure the total is visible.");
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) { 
      alert("OCR Engine Error."); 
      setIsProcessing(false);
    }
    finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setIsProcessing(true);
    try {
      const result = await processExpenseInput(chatInput);
      if (result.amount) { addExpense(result); setChatInput(''); }
      else alert("Deepan needs an amount. Example: 'Biryani 300'");
    } catch (err) { alert("Deepan Assistant Error."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-10 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative w-10 h-10 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-slate-900 flex items-center justify-center animate-pop">
              <span className="text-white font-black text-lg tracking-tighter select-none uppercase">DC</span>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">Deepan Daily</h1>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1 hidden sm:block">Professional Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSyncModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${userEmail ? 'border-blue-100 bg-blue-50/50' : 'border-slate-200 bg-white'}`}
          >
            {syncStatus === 'syncing' ? <RefreshCw size={16} className="text-blue-600 animate-spin" /> : userEmail ? <Cloud size={16} className="text-blue-600" /> : <CloudOff size={16} className="text-slate-400" />}
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-bold text-slate-800 truncate max-w-[100px]">{userEmail || 'Cloud Offline'}</p>
            </div>
          </button>

          <nav className="hidden md:flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button onClick={() => setActiveTab('daily')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'daily' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
              <List size={16} /> Daily
            </button>
            <button onClick={() => setActiveTab('insights')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'insights' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
              <Sparkles size={16} /> Insights
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-6 pb-48 md:pb-32">
        {activeTab === 'dashboard' && <Dashboard expenses={expenses} salary={salary} onUpdateSalary={setSalary} incomeEntries={incomeEntries} onAddIncome={addIncomeEntry} onUpdateIncome={updateIncomeEntry} onDeleteIncome={deleteIncomeEntry} onQuickAdd={(i) => setChatInput(`${i} `)} />}
        {activeTab === 'daily' && <ExpenseTable expenses={expenses} onDelete={deleteExpense} onUpdate={updateExpense} />}
        {activeTab === 'insights' && <InsightsView expenses={expenses} />}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
        <div className="flex md:hidden items-center justify-around border-b border-slate-100 py-3 px-2">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-black uppercase">Home</span>
          </button>
          <button onClick={() => setActiveTab('daily')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'daily' ? 'text-blue-600' : 'text-slate-400'}`}>
            <List size={20} />
            <span className="text-[10px] font-black uppercase">History</span>
          </button>
          <button onClick={() => setActiveTab('insights')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'insights' ? 'text-blue-600' : 'text-slate-400'}`}>
            <Sparkles size={20} />
            <span className="text-[10px] font-black uppercase">AI Tips</span>
          </button>
        </div>
        
        <div className="px-4 py-4 md:px-8 max-w-4xl mx-auto flex items-center gap-3">
          <form onSubmit={handleChatSubmit} className="flex-1 flex items-center gap-2 bg-slate-100/80 border border-slate-200 rounded-[2rem] px-5 py-2 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all shadow-inner">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-blue-600 rounded-full transition-all"><Camera size={20} /></button>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Biryani 350..." className="flex-1 bg-transparent border-none outline-none py-1.5 text-slate-800 font-bold placeholder:text-slate-300" disabled={isProcessing} />
            <button type="submit" disabled={!chatInput.trim() || isProcessing} className={`p-2 rounded-full transition-all ${!chatInput.trim() || isProcessing ? 'text-slate-300' : 'bg-blue-600 text-white shadow-lg'}`}>{isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} />}</button>
          </form>
          <button onClick={() => setIsAddModalOpen(true)} className="p-3.5 bg-slate-900 text-white rounded-full shadow-xl active:scale-90 transition-all"><Plus size={24} strokeWidth={3} /></button>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      {isAddModalOpen && <ManualAddModal onClose={() => setIsAddModalOpen(false)} onSave={(d) => { addExpense(d); setActiveTab('dashboard'); }} />}
      {isSyncModalOpen && <SyncHub userEmail={userEmail} onClose={() => setIsSyncModalOpen(false)} onLogin={handleLogin} onLogout={handleLogout} />}
      
      {isProcessing && (
        <div className="fixed inset-0 z-[110] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center animate-scaleUp shadow-2xl border-4 border-slate-900">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-[6px] border-blue-100 rounded-[1.5rem]"></div>
              <div className="absolute inset-0 border-[6px] border-blue-500 border-t-transparent rounded-[1.5rem] animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[1.2rem] border-2 border-slate-900 bg-slate-900">
                <span className="text-white font-black text-4xl tracking-tighter select-none uppercase">DC</span>
              </div>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-1">
              {processingStatus === 'scanning' ? 'Scanning...' : processingStatus === 'extracting' ? 'Extracting...' : 'Finalizing...'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instant Deepan AI</p>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes popLogo { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scaleUp { animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop { animation: popLogo 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
