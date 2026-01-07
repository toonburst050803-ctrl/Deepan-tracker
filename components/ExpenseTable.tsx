
import React, { useState } from 'react';
import { Expense, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Trash2, Pencil, Receipt, Download, Tag, CreditCard, Wallet, Banknote, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import EditExpenseModal from './EditExpenseModal';

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUpdate: (updated: Expense) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onDelete, onUpdate }) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Export Settings State
  const [exportRange, setExportRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [includeNotes, setIncludeNotes] = useState(true);

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPaymentIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes('upi') || m.includes('pay') || m.includes('phonepe')) return <Wallet size={12} />;
    if (m.includes('card') || m.includes('visa') || m.includes('master')) return <CreditCard size={12} />;
    return <Banknote size={12} />;
  };

  const handleExport = () => {
    const filtered = expenses.filter(exp => {
      const d = exp.date.split('T')[0];
      return d >= exportRange.start && d <= exportRange.end;
    });

    if (filtered.length === 0) {
      alert("No records found in this date range.");
      return;
    }

    const headers = ['Date', 'Day', 'Vendor', 'Category', 'Sub-Category', 'Amount (INR)', 'Payment Mode'];
    if (includeNotes) headers.push('Notes');

    const rows = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(exp => {
      const dateObj = new Date(exp.date);
      const row = [
        `"${dateObj.toISOString().split('T')[0]}"`,
        `"${dateObj.toLocaleDateString('en-IN', { weekday: 'short' })}"`,
        `"${exp.vendor.replace(/"/g, '""')}"`,
        `"${exp.category}"`,
        `"${exp.subCategory || ''}"`,
        exp.amount,
        `"${exp.paymentMode}"`
      ];
      if (includeNotes) row.push(`"${(exp.notes || '').replace(/"/g, '""')}"`);
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const fileName = `Deepan_Export_${exportRange.start}_to_${exportRange.end}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportPanelOpen(false);
  };

  const toggleDeleteConfirm = (id: string) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      // Reset after 3 seconds of inactivity
      setTimeout(() => setDeleteConfirmId(current => current === id ? null : current), 3000);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-20 text-center animate-fadeIn">
        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
          <Receipt size={48} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3">No Daily Logs</h3>
        <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">Your sequential daily history will appear here line by line.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Daily Expense Log</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Professional Record Keeping</p>
          </div>
          <button 
            onClick={() => setIsExportPanelOpen(!isExportPanelOpen)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isExportPanelOpen ? 'bg-slate-900 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'}`}
          >
            <Download size={16} /> Export Options
          </button>
        </div>

        {isExportPanelOpen && (
          <div className="bg-slate-50/50 p-8 border-b border-slate-100 animate-fadeIn grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
              <input 
                type="date"
                value={exportRange.start}
                onChange={(e) => setExportRange({...exportRange, start: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
              <input 
                type="date"
                value={exportRange.end}
                onChange={(e) => setExportRange({...exportRange, end: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-4 h-[46px]">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  onClick={() => setIncludeNotes(!includeNotes)}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${includeNotes ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${includeNotes ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Include Notes</span>
              </label>
            </div>
            <button 
              onClick={handleExport}
              className="w-full h-[46px] bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet size={16} /> Generate CSV
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Timestamp</th>
                <th className="px-10 py-6">Merchant & Method</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Amount</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedExpenses.map((expense) => {
                const dateObj = new Date(expense.date);
                const dayStr = String(dateObj.getDate()).padStart(2, '0');
                const monthStr = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

                return (
                  <tr key={expense.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-10 py-7 whitespace-nowrap">
                      <div className="flex items-center gap-5">
                        <div className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:bg-blue-600 transition-colors">
                          <span className="text-[9px] font-black leading-none mb-1 opacity-60 uppercase">Day</span>
                          <span className="text-xl font-black leading-none">{dayStr}</span>
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em]">
                            {monthStr} {dateObj.getFullYear()}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {timeStr}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="max-w-[280px]">
                        <div className="font-black text-slate-800 text-base tracking-tight mb-1 truncate uppercase">{expense.vendor}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          {expense.subCategory && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                               <Tag size={10} strokeWidth={3} />
                               <span className="text-[10px] font-black uppercase tracking-tighter">{expense.subCategory}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200">
                             {getPaymentIcon(expense.paymentMode)}
                             <span className="text-[10px] font-black uppercase tracking-tighter">{expense.paymentMode}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span 
                        className="inline-flex items-center px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm"
                        style={{ 
                          backgroundColor: CATEGORY_COLORS[expense.category] + '08',
                          color: CATEGORY_COLORS[expense.category],
                          borderColor: CATEGORY_COLORS[expense.category] + '25'
                        }}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-1.5 font-black text-slate-900 text-2xl tracking-tighter">
                         <span className="text-slate-300 text-lg font-bold">₹</span>
                         {expense.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingExpense(expense)}
                          className="text-slate-400 hover:text-blue-600 p-3 transition-all rounded-xl hover:bg-blue-50 border border-transparent"
                          title="Edit entry"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => toggleDeleteConfirm(expense.id)}
                          className={`p-3 transition-all rounded-xl border border-transparent flex items-center gap-2 ${deleteConfirmId === expense.id ? 'bg-rose-500 text-white shadow-lg px-4' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                        >
                          {deleteConfirmId === expense.id ? (
                            <>
                              <AlertTriangle size={18} className="animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Confirm?</span>
                            </>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingExpense && (
        <EditExpenseModal 
          expense={editingExpense} 
          onClose={() => setEditingExpense(null)} 
          onSave={(updated) => {
            onUpdate(updated);
            setEditingExpense(null);
          }} 
        />
      )}
    </div>
  );
};

export default ExpenseTable;
