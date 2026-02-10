
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PackageManagement from './components/PackageManagement';
import ResidentManagement from './components/ResidentManagement';
import SessionManager from './components/SessionManager';
import { Resident, Package, PackageStatus, PorterSession } from './types';
import { 
  getResidents, saveResidents, 
  getPackages, savePackages, 
  getSession, saveSession,
  importDataFromHD
} from './utils/storage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [session, setSession] = useState<PorterSession | null>(null);

  useEffect(() => {
    setResidents(getResidents());
    setPackages(getPackages());
    setSession(getSession());
  }, []);

  const handleStartSession = (newSession: PorterSession) => {
    setSession(newSession);
    saveSession(newSession);
  };

  const handleLogout = () => {
    if (window.confirm("Deseja realmente encerrar seu turno?")) {
      setSession(null);
      saveSession(null);
    }
  };

  const handleAddResident = (resident: Resident) => {
    const updated = [...residents, resident];
    setResidents(updated);
    saveResidents(updated);
  };

  const handleDeleteResident = (id: string) => {
    if (window.confirm("Excluir este morador? Isso não apagará as encomendas já registradas para ele.")) {
      const updated = residents.filter(r => r.id !== id);
      setResidents(updated);
      saveResidents(updated);
    }
  };

  const handleAddPackage = (pkg: Package) => {
    const pkgWithPorter = { ...pkg, porterId: session?.name || "Sistema" };
    const updated = [pkgWithPorter, ...packages];
    setPackages(updated);
    savePackages(updated);
  };

  const handleUpdatePackageStatus = (id: string, status: PackageStatus) => {
    const updated = packages.map(p => 
      p.id === id 
        ? { ...p, status, deliveredAt: status === PackageStatus.DELIVERED ? new Date().toISOString() : undefined } 
        : p
    );
    setPackages(updated);
    savePackages(updated);
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm("Tem certeza que deseja apagar este registro permanentemente?")) {
      const updated = packages.filter(p => p.id !== id);
      setPackages(updated);
      savePackages(updated);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Deseja apagar TODOS os registros entregues do sistema?")) {
      const updated = packages.filter(p => p.status === PackageStatus.PENDING);
      setPackages(updated);
      savePackages(updated);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importDataFromHD(file);
        setResidents(getResidents());
        setPackages(getPackages());
        alert("Dados restaurados com sucesso!");
      } catch (err) {
        alert("Erro ao importar backup. Verifique se o arquivo é um JSON de portaria válido.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
      {!session && <SessionManager onStartSession={handleStartSession} />}
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        session={session} 
        onLogout={handleLogout}
        packages={packages}
        residents={residents}
      />
      
      <main className="flex-1 md:ml-64 p-4 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Action Bar Mobile Responsive */}
          <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-3">
             <div className="text-xs text-slate-400 font-medium">
               {packages.length} registros no sistema
             </div>
            <label className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-sm font-bold shadow-sm">
              <i className="fas fa-file-import text-indigo-500"></i>
              Sincronizar Dados (Importar)
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          {activeTab === 'dashboard' && (
            <Dashboard packages={packages} residents={residents} />
          )}
          
          {activeTab === 'packages' && (
            <PackageManagement 
              packages={packages} 
              residents={residents} 
              onAdd={handleAddPackage} 
              onUpdateStatus={handleUpdatePackageStatus}
              onDelete={handleDeletePackage}
              onClearHistory={handleClearHistory}
            />
          )}
          
          {activeTab === 'residents' && (
            <ResidentManagement 
              residents={residents} 
              onAdd={handleAddResident} 
              onDelete={handleDeleteResident} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
