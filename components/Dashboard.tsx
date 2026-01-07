
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Expense, Category, IncomeEntry } from '../types';
import { CATEGORY_COLORS, CATEGORY_HIERARCHY } from '../constants';
import { IndianRupee, TrendingUp, Calendar, Utensils, Home, Bike, Fuel, Smartphone, Heart, Coffee, AlertCircle, PlusCircle, Wallet, Coins, PiggyBank, ChevronDown, ChevronUp, Zap, User, Trash2, Clock, Pencil, X } from 'lucide-react';

interface DashboardProps { 
  expenses: Expense[]; 
  salary: number;
  onUpdateSalary: (val: number) => void;
  incomeEntries: IncomeEntry[];
  onAddIncome: (source: string, amount: number) => void;
  onUpdateIncome: (id: string, source: string, amount: number) => void;
  onDeleteIncome: (id: string) => void;
  onQuickAdd?: (context: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, salary, onUpdateSalary, incomeEntries, onAddIncome, onUpdateIncome, onDeleteIncome, onQuickAdd }) => {
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(null);
  const [newIncomeSource, setNewIncomeSource] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState<string>('');
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();
  const monthName = now.toLocaleString('default', { month: 'long' });

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
  }, [expenses, currentMonth, currentYear]);

  const stats = useMemo(() => {
    const total = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const categoryTotalsMap: Partial<Record<Category, number>> = {};
    
    currentMonthExpenses.forEach(e => {
      const cat = e.category as Category;
      categoryTotalsMap[cat] = (categoryTotalsMap[cat] || 0) + e.amount;
    });

    const sortedCategories = Object.entries(categoryTotalsMap)
      .map(([name, value]) => ({ name: name as Category, value: value || 0 }))
      .sort((a, b) => b.value - a.value);

    return { total, categoryTotalsMap, sortedCategories };
  }, [currentMonthExpenses]);

  const totalExtraIncome = useMemo(() => {
    return incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [incomeEntries]);

  const totalIncome = salary + totalExtraIncome;
  const balance = totalIncome - stats.total;
  const spendingPercentage = totalIncome > 0 ? Math.min(100, (stats.total / totalIncome) * 100) : 0;

  const essentialCategories = [
    { key: Category.HOUSE_EXPENSE, icon: <Home size={20} />, title: "House Expense" },
    { key: Category.BIKE_EXPENSE, icon: <Bike size={20} />, title: "Bike Expense" },
    { key: Category.BIKE_PETROL, icon: <Fuel size={20} />, title: "Petrol" },
    { key: Category.FOOD, icon: <Utensils size={20} />, title: "Food" },
    { key: Category.SNACK, icon: <Coffee size={20} />, title: "Snacks" },
    { key: Category.PHONE_DUE, icon: <Smartphone size={20} />, title: "Phone Due" },
    { key: Category.OFFERING, icon: <Heart size={20} />, title: "Offering" },
    { key: Category.PERSONAL_EXPENSE, icon: <User size={20} />, title: "Personal" },
  ];

  const toggleExpand = (cat: Category) => {
    if (expandedCategory === cat) setExpandedCategory(null);
    else setExpandedCategory(cat);
  };

  const handleAddIncome = () => {
    if (!newIncomeSource.trim() || !newIncomeAmount || Number(newIncomeAmount) <= 0) return;
    
    if (editingIncomeId) {
      onUpdateIncome(editingIncomeId, newIncomeSource.trim(), Number(newIncomeAmount));
      setEditingIncomeId(null);
    } else {
      onAddIncome(newIncomeSource.trim(), Number(newIncomeAmount));
    }
    
    setNewIncomeSource('');
    setNewIncomeAmount('');
  };

  const handleEditIncome = (entry: IncomeEntry) => {
    setEditingIncomeId(entry.id);
    setNewIncomeSource(entry.source);
    setNewIncomeAmount(entry.amount.toString());
    const container = document.getElementById('extra-income-form');
    container?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelEdit = () => {
    setEditingIncomeId(null);
    setNewIncomeSource('');
    setNewIncomeAmount('');
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-slate-900 flex items-center justify-center hidden sm:flex animate-pop">
              <span className="text-white font-black text-5xl tracking-tighter select-none">DC</span>
           </div>
           <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Monthly Statement</h2>
            <p className="text-slate-500 font-semibold flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" />
              {monthName} {currentYear} • Daily Records
            </p>
          </div>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-black flex items-center gap-3 text-slate-900 self-start md:self-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Day {currentDay} • Analysis Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="bg-emerald-500/20 p-4 rounded-3xl backdrop-blur-xl border border-emerald-500/20 text-emerald-400">
                <PiggyBank size={28} />
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Balance</p>
                <p className={`text-4xl font-black tracking-tighter ${balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                   ₹{balance.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Budget Spent</span>
                <span className={spendingPercentage > 90 ? 'text-rose-400' : 'text-emerald-400'}>
                  {Math.round(spendingPercentage)}%
                </span>
              </div>
              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                <div 
                  className={`h-full transition-all duration-1000 rounded-full ${spendingPercentage > 90 ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} 
                  style={{ width: `${spendingPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Base Salary</p>
              <p className="text-sm font-black">₹{salary.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Extra Sources</p>
              <p className="text-sm font-black text-amber-400">+₹{totalExtraIncome.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Total Spent</p>
              <p className="text-sm font-black text-rose-400">-₹{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col gap-8 transition-all hover:border-blue-100 group">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-3xl text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Coins size={28} />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-base">Monthly Salary</h3>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Update Base Salary</label>
            <div className="relative group/input">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-600 transition-colors pointer-events-none">
                <IndianRupee size={24} strokeWidth={3} />
              </div>
              <input 
                type="number" 
                value={salary || ''} 
                onChange={(e) => onUpdateSalary(Number(e.target.value))}
                placeholder="22000"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl pl-14 pr-6 py-6 text-3xl font-black text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none shadow-inner"
              />
            </div>
          </div>
        </div>

        <div id="extra-income-form" className={`bg-white p-10 rounded-[2.5rem] border-2 transition-all overflow-hidden ${editingIncomeId ? 'border-blue-500 shadow-xl shadow-blue-50' : 'border-slate-100 shadow-sm hover:border-amber-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-3xl shadow-sm transition-colors ${editingIncomeId ? 'bg-blue-600 text-white' : 'bg-amber-50 text-amber-600'}`}>
                {editingIncomeId ? <Pencil size={28} /> : <PlusCircle size={28} />}
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-base">
                {editingIncomeId ? 'Edit Entry' : 'Extra Income'}
              </h3>
            </div>
            {!editingIncomeId && (
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Extra</p>
                <p className="text-xl font-black text-amber-600">₹{totalExtraIncome.toLocaleString()}</p>
              </div>
            )}
            {editingIncomeId && (
              <button onClick={cancelEdit} className="p-2 text-slate-400 hover:text-slate-600 transition-all rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Source"
                value={newIncomeSource}
                onChange={(e) => setNewIncomeSource(e.target.value)}
                className="col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
              />
              <div className="relative col-span-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                <input 
                  type="number" 
                  placeholder="Amount"
                  value={newIncomeAmount}
                  onChange={(e) => setNewIncomeAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-6 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {editingIncomeId && (
                <button 
                  onClick={cancelEdit}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={handleAddIncome}
                disabled={!newIncomeSource.trim() || !newIncomeAmount}
                className={`flex-[2] py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 active:scale-95 ${editingIncomeId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-amber-500'}`}
              >
                {editingIncomeId ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-6 pt-4 flex-1 overflow-y-auto custom-scrollbar max-h-40">
            {incomeEntries.length > 0 ? (
              <div className="space-y-2">
                {incomeEntries.slice().reverse().map((entry) => (
                  <div key={entry.id} className={`flex items-center justify-between p-3 rounded-xl group transition-all border ${editingIncomeId === entry.id ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-transparent hover:bg-white hover:shadow-sm'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${editingIncomeId === entry.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'}`}>
                        {editingIncomeId === entry.id ? <Pencil size={12} /> : <Clock size={12} />}
                      </div>
                      <div>
                        <p className={`text-[11px] font-black uppercase leading-none mb-1 ${editingIncomeId === entry.id ? 'text-blue-700' : 'text-slate-800'}`}>{entry.source}</p>
                        <p className="text-[9px] font-bold text-slate-400">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black ${editingIncomeId === entry.id ? 'text-blue-600' : 'text-emerald-600'}`}>+₹{entry.amount.toLocaleString()}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditIncome(entry)} className="text-slate-300 hover:text-blue-600 transition-colors p-1"><Pencil size={14} /></button>
                        <button onClick={() => onDeleteIncome(entry.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 text-[10px] font-black uppercase tracking-widest py-4 gap-2">
                <Coins size={16} className="opacity-50" />
                No extra income logged
              </div>
            )}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-2.5 bg-blue-600 rounded-full shadow-lg shadow-amber-100"></div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Smart Category Hub</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Click to Expand</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {essentialCategories.map((cat) => {
            const amount = stats.categoryTotalsMap[cat.key] || 0;
            const isExpanded = expandedCategory === cat.key;
            const subItems = CATEGORY_HIERARCHY[cat.key];
            
            return (
              <div key={cat.key} className="flex flex-col gap-3">
                <button 
                  onClick={() => toggleExpand(cat.key)}
                  className={`bg-white p-6 rounded-[2.5rem] shadow-sm border-2 transition-all group flex items-center justify-between w-full text-left ${isExpanded ? 'border-blue-600 ring-4 ring-blue-500/5' : 'border-slate-100 hover:border-blue-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:scale-110" style={{ backgroundColor: CATEGORY_COLORS[cat.key] }}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{cat.title}</h4>
                      <p className="text-xl font-black text-slate-900 tracking-tighter">₹{amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-slate-300">
                    {isExpanded ? <ChevronUp size={20} strokeWidth={3} /> : <ChevronDown size={20} strokeWidth={3} />}
                  </div>
                </button>

                {isExpanded && subItems && (
                  <div className="bg-white/50 border border-slate-100 rounded-[2.5rem] p-5 grid grid-cols-2 gap-2 animate-fadeIn shadow-inner">
                    <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 px-2 flex items-center gap-2">
                       <Zap size={10} className="text-blue-500" /> Quick Add
                    </div>
                    {subItems.map(item => (
                      <button 
                        key={item}
                        onClick={() => onQuickAdd?.(item)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-wider hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95 text-center truncate"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-black mb-10 text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            Spending Analysis
          </h3>
          {stats.sortedCategories.length > 0 ? (
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.sortedCategories} cx="50%" cy="50%" innerRadius={100} outerRadius={135} paddingAngle={8} dataKey="value">
                    {stats.sortedCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#cbd5e1'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px', fontWeight: '900' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-center gap-4">
               <AlertCircle size={48} className="text-slate-100" />
               <p className="italic font-bold text-sm">No expenses logged for {monthName}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-black mb-10 text-slate-900 uppercase tracking-tight flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
             Highest Spends
          </h3>
          <div className="space-y-5">
            {stats.sortedCategories.length > 0 ? (
              stats.sortedCategories.slice(0, 5).map((cat, idx) => (
                <div key={cat.name} className="relative p-6 bg-slate-50 rounded-[2rem] overflow-hidden group border border-slate-50 transition-all hover:border-slate-200">
                  <div className="absolute top-0 left-0 bottom-0 opacity-[0.07]" style={{ width: `${(cat.value / stats.total) * 100}%`, backgroundColor: CATEGORY_COLORS[cat.name as Category] }}></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-xl font-black text-slate-300 shadow-sm border border-slate-100 group-hover:text-blue-600 transition-colors">
                         {idx + 1}
                       </div>
                       <div>
                         <p className="font-black text-slate-900 text-base tracking-tight uppercase">{cat.name}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{Math.round((cat.value / stats.total) * 100)}% of month</p>
                       </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-2xl tracking-tighter">₹{cat.value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-slate-300 text-center gap-5 border-2 border-dashed border-slate-50 rounded-[2rem]">
                 <TrendingUp size={48} />
                 <p className="font-bold text-sm uppercase tracking-widest">Awaiting First Entry</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
