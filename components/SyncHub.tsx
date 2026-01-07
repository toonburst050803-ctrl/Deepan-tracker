
import React, { useState } from 'react';
import { Cloud, X, ShieldCheck, Mail, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';

interface SyncHubProps {
  userEmail: string | null;
  onClose: () => void;
  onLogin: (email: string) => void;
  onLogout: () => void;
}

const SyncHub: React.FC<SyncHubProps> = ({ userEmail, onClose, onLogin, onLogout }) => {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setError('Please enter a valid Gmail address');
      return;
    }
    onLogin(emailInput.trim().toLowerCase());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl animate-scaleUp overflow-hidden border-4 border-slate-900">
        <div className="px-8 py-10 text-center">
          <div className="w-24 h-24 bg-slate-900 border-4 border-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <span className="text-white font-black text-5xl tracking-tighter select-none">DC</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">
            {userEmail ? 'Vault Connected' : 'Deepan Cloud Hub'}
          </h3>
          <p className="text-sm text-slate-500 font-medium px-6 leading-relaxed">
            {userEmail 
              ? 'Your professional records are secured and synced across your devices.' 
              : 'Link your identity to sync your daily logs across multiple professional devices.'}
          </p>
        </div>

        <div className="px-8 pb-10 space-y-6">
          {!userEmail ? (
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-base font-bold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-inner"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-wider pl-1">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <button 
                onClick={handleLogin}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <LogIn size={20} />
                Secure My Vault
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Link</p>
                    <p className="text-sm font-black text-slate-800">{userEmail}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 leading-relaxed">
                  <ShieldCheck size={14} className="text-blue-500 flex-shrink-0" />
                  Encryption Active. Your daily records are deterministically mapped to this assistant identity.
                </p>
              </div>
              <button 
                onClick={onLogout}
                className="w-full py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all text-xs active:scale-[0.98]"
              >
                Sign Out / Disable Cloud
              </button>
            </div>
          )}
          <div className="pt-4 text-center">
            <button 
              onClick={onClose}
              className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] hover:text-slate-600 transition-all"
            >
              Close Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncHub;
