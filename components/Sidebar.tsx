
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
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, session, onLogout, packages, residents }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Painel Geral' },
    { id: 'packages', icon: 'fa-box', label: 'Movimentação' },
    { id: 'residents', icon: 'fa-users', label: 'Moradores' },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-500 w-8 h-8 rounded-lg flex items-center justify-center">
              <i className="fas fa-building text-sm"></i>
           </div>
           <span className="font-bold tracking-tight">Portaria Smart</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-xl p-2">
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-slate-900 text-white z-50 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex p-6 border-b border-slate-800 items-center gap-3">
          <div className="bg-indigo-500 w-10 h-10 rounded-lg flex items-center justify-center">
            <i className="fas fa-building text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Portaria</h1>
            <p className="text-xs text-slate-400">Smart Connect</p>
          </div>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
             <button
              onClick={() => { generatePackageReport(packages, residents); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-all"
            >
              <i className="fas fa-file-pdf w-5"></i>
              <span className="font-medium text-sm">Baixar PDF</span>
            </button>
             <button
              onClick={() => { exportDataToHD(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            >
              <i className="fas fa-cloud-download-alt w-5"></i>
              <span className="font-medium text-sm">Exportar (HD)</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          {session ? (
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500/20">
                  {session.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate text-white">{session.name}</p>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-tighter font-bold">{session.shift} • Online</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full py-2 text-[11px] bg-slate-700 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider"
              >
                <i className="fas fa-power-off"></i>
                Encerrar Turno
              </button>
            </div>
          ) : (
            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-center">
               <p className="text-xs text-amber-500 font-bold">Sem Sessão</p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
