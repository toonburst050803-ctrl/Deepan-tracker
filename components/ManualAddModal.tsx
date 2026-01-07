
import React, { useState } from 'react';
import { Category, Expense } from '../types';
import { X, Save, IndianRupee, Tag, ShoppingBag } from 'lucide-react';

interface ManualAddModalProps {
  onClose: () => void;
  onSave: (expense: Partial<Expense>) => void;
}

const ManualAddModal: React.FC<ManualAddModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString(),
    vendor: '',
    category: Category.OTHERS,
    subCategory: '',
    amount: 0,
    paymentMode: 'Cash',
    notes: ''
  });

  const handleSave = () => {
    if (!formData.vendor || !formData.amount || formData.amount <= 0) {
      alert("Please enter a vendor name and a valid amount.");
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl animate-scaleUp overflow-hidden border-4 border-slate-900 flex flex-col">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-sm bg-slate-900 flex items-center justify-center">
              <span className="text-white font-black text-2xl tracking-tighter select-none">DC</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Log Entry</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Mode: Manual Record</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                  <IndianRupee size={28} strokeWidth={3} />
                </div>
                <input 
                  type="number" 
                  autoFocus
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] pl-16 pr-8 py-6 text-4xl font-black text-slate-900 focus:border-blue-500 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paid To / Merchant</label>
                <input 
                  type="text" 
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <input 
                  type="date" 
                  value={new Date(formData.date!).toISOString().split('T')[0]}
                  onChange={(e) => setFormData({...formData, date: new Date(e.target.value).toISOString()})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:border-blue-500 appearance-none"
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
                  placeholder="UPI, Cash..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Details</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Tag size={18} /></div>
                <input 
                  type="text" 
                  value={formData.subCategory}
                  onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">Cancel</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] active:scale-95">
            <Save size={18} /> Save Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualAddModal;
