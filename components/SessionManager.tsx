
import React, { useState } from 'react';
import { Shift, PorterSession } from '../types';

interface SessionManagerProps {
  onStartSession: (session: PorterSession) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ onStartSession }) => {
  const [name, setName] = useState('');
  const [shift, setShift] = useState<Shift>('Manhã');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStartSession({
        name,
        shift,
        startedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <i className="fas fa-user-shield text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold">Início de Turno</h2>
          <p className="text-indigo-100 text-sm mt-1">Identifique-se para começar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Seu Nome</label>
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Porteiro João"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Turno</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Manhã', 'Tarde', 'Noite', 'Madrugada'] as Shift[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShift(s)}
                  className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                    shift === s 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 mt-4 flex items-center justify-center gap-3"
          >
            <i className="fas fa-play"></i>
            Iniciar Turno
          </button>
        </form>
      </div>
    </div>
  );
};

export default SessionManager;
