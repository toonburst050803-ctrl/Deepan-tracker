
import React, { useState } from 'react';
import { Expense, Category } from '../types';
import { X, Save, IndianRupee, Tag, Pencil } from 'lucide-react';

interface EditExpenseModalProps {
  expense: Expense;
  onClose: () => void;
  onSave: (updated: Expense) => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ expense, onClose, onSave }) => {
  const [formData, setFormData] = useState<Expense>({ ...expense });

  const handleSave = () => {
    if (!formData.vendor || !formData.amount || formData.amount <= 0) {
      alert("Please enter a valid vendor and amount.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-8">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-[2.5rem] shadow-2xl animate-scaleUp overflow-hidden border-4 border-slate-900 flex flex-col">
        <div className="flex-shrink-0 px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-sm bg-slate-900 flex items-center justify-center">
              <span className="text-white font-black text-2xl tracking-tighter select-none">DC</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Edit Entry</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Protocol: Review & Refine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Amount (INR)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                  <IndianRupee size={28} strokeWidth={3} />
                </div>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  className="w-full bg-white border-2 border-slate-200 rounded-[1.5rem] pl-16 pr-8 py-5 text-3xl font-black text-slate-900 focus:border-blue-600 outline-none transition-all shadow-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant / Vendor</label>
              <input 
                type="text" 
                value={formData.vendor}
                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Date</label>
              <input 
                type="date" 
                value={new Date(formData.date).toISOString().split('T')[0]}
                onChange={(e) => setFormData({...formData, date: new Date(e.target.value).toISOString()})}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Group</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:border-blue-500 outline-none appearance-none"
              >
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
              <input 
                type="text" 
                value={formData.paymentMode}
                onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Details</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Tag size={18} /></div>
              <input 
                type="text" 
                value={formData.subCategory || ''}
                onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold text-slate-900 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
            <textarea 
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium text-slate-700 outline-none resize-none"
              placeholder="Extra context..."
            />
          </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <button onClick={onClose} className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700">Discard</button>
          <button onClick={handleSave} className="flex-1 max-w-[300px] flex items-center justify-center gap-3 px-8 py-4.5 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95">
            <Save size={18} /> Update Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
