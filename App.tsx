
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showEasyInstall, setShowEasyInstall] = useState(false);

  useEffect(() => {
    setResidents(getResidents());
    setPackages(getPackages());
    setSession(getSession());

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Sistema pronto para instalar!');
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowEasyInstall(false);
      }
    } else {
      setShowEasyInstall(true);
    }
  };

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
    if (window.confirm("Excluir este morador?")) {
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
    if (window.confirm("Apagar permanentemente?")) {
      const updated = packages.filter(p => p.id !== id);
      setPackages(updated);
      savePackages(updated);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Apagar histórico de entregas?")) {
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
        alert("Sincronizado com sucesso!");
      } catch (err) {
        alert("Erro no arquivo de backup.");
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
        onInstall={handleInstallClick}
        showInstallBtn={true}
      />
      
      <main className="flex-1 md:ml-64 p-4 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-3">
             <div className="text-[10px] text-slate-400 font-bold bg-white px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">
               {packages.length} Encomendas
             </div>
            <label className="w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-sm font-bold shadow-sm">
              <i className="fas fa-sync text-indigo-500"></i>
              Importar Backup
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          {activeTab === 'dashboard' && <Dashboard packages={packages} residents={residents} />}
          {activeTab === 'packages' && <PackageManagement packages={packages} residents={residents} onAdd={handleAddPackage} onUpdateStatus={handleUpdatePackageStatus} onDelete={handleDeletePackage} onClearHistory={handleClearHistory} />}
          {activeTab === 'residents' && <ResidentManagement residents={residents} onAdd={handleAddResident} onDelete={handleDeleteResident} />}
        </div>
      </main>

      {/* GUIA DE INSTALAÇÃO INFALÍVEL (PLANO B) */}
      {showEasyInstall && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center z-[200] p-4 text-white">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="pulse">
               <i className="fas fa-arrow-up text-6xl text-amber-400 mb-2"></i>
            </div>
            <h2 className="text-3xl font-black leading-tight">Instalar Aplicativo</h2>
            <p className="text-slate-300 text-lg">Se a opção <span className="text-white font-bold">"Instalar"</span> não aparecer nos 3 pontinhos, siga este atalho:</p>
            
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-left space-y-5">
               <div className="flex gap-4 items-start">
                  <div className="bg-amber-400 text-slate-900 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black">1</div>
                  <p className="text-sm">Vá nos <i className="fas fa-ellipsis-v mx-1"></i> (3 pontinhos) e selecione <span className="font-bold text-amber-400">"Salvar e Compartilhar"</span> ou <span className="font-bold text-amber-400">"Mais Ferramentas"</span>.</p>
               </div>
               <div className="flex gap-4 items-start">
                  <div className="bg-amber-400 text-slate-900 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black">2</div>
                  <p className="text-sm">Clique em <span className="font-bold text-amber-400">"Criar Atalho"</span> ou <span className="font-bold text-amber-400">"Instalar Aplicativo"</span>.</p>
               </div>
               <div className="flex gap-4 items-start">
                  <div className="bg-amber-400 text-slate-900 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black">3</div>
                  <p className="text-sm">Marque a caixinha <span className="font-bold text-emerald-400">"Abrir como janela"</span> e clique em Criar.</p>
               </div>
            </div>

            <div className="bg-indigo-600/30 p-4 rounded-2xl border border-indigo-500/50">
                <p className="text-xs italic text-indigo-200">
                    <i className="fas fa-info-circle mr-2"></i>
                    Isso criará o ícone na sua área de trabalho e o app funcionará como um programa profissional.
                </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
               <button onClick={() => setShowEasyInstall(false)} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xl shadow-2xl hover:bg-slate-100 transition-all">
                 PRONTO, VOU FAZER
               </button>
               <button onClick={() => setShowEasyInstall(false)} className="text-slate-400 text-sm underline">
                 Fechar aviso
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
