
import React, { useState } from 'react';
import { PorterSession, Package, Resident } from '../types';
import { exportDataToHD } from '../utils/storage';
import { generatePackageReport } from '../utils/pdfGenerator';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  session: PorterSession | null;
  onLogout: () => void;
  packages: Package[];
  residents: Resident[];
  onInstall: () => void;
  showInstallBtn: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, session, onLogout, packages, residents, onInstall }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-500 w-8 h-8 rounded-lg flex items-center justify-center"><i className="fas fa-building text-sm"></i></div>
           <span className="font-bold">Portaria Smart</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-xl p-2 w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg">
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      <div className={`fixed left-0 top-0 h-full w-64 bg-slate-900 text-white z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <i className="fas fa-building text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Portaria</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Digital Connect</p>
          </div>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', icon: 'fa-chart-line', label: 'Início' },
            { id: 'packages', icon: 'fa-box', label: 'Encomendas' },
            { id: 'residents', icon: 'fa-users', label: 'Moradores' },
          ].map((item) => (
            <button key={item.id} onClick={() => handleTabClick(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <i className={`fas ${item.icon} w-5`}></i>
              <span className="font-bold">{item.label}</span>
            </button>
          ))}

          <div className="pt-6 mt-6 border-t border-slate-800 space-y-4">
             <button onClick={onInstall} className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-amber-500 text-slate-900 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 font-black text-sm uppercase">
                <i className="fas fa-cloud-download-alt text-lg"></i>
                Baixar Aplicativo
             </button>

             <div className="grid grid-cols-1 gap-2">
                <button onClick={() => { generatePackageReport(packages, residents); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white text-xs font-bold transition-all">
                  <i className="fas fa-file-pdf w-4"></i> PDF de Encomendas
                </button>
                <button onClick={() => { exportDataToHD(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white text-xs font-bold transition-all">
                  <i className="fas fa-hdd w-4"></i> Salvar Tudo (Backup)
                </button>
             </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          {session ? (
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-left">
              <p className="text-xs font-bold text-white mb-1">{session.name}</p>
              <button onClick={onLogout} className="text-[10px] text-red-400 font-bold uppercase hover:text-red-300">
                Encerrar Turno
              </button>
            </div>
          ) : (
             <div className="text-center text-[10px] text-slate-500 font-bold uppercase py-2">Pronto para Login</div>
          )}
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
