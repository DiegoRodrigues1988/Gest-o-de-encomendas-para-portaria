
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
  const [showInstallModal, setShowInstallModal] = useState<'desktop' | 'mobile' | null>(null);

  useEffect(() => {
    setResidents(getResidents());
    setPackages(getPackages());
    setSession(getSession());

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('PWA: Prompt de instalação pronto.');
    });
  }, []);

  const handleInstallAction = async (type: 'desktop' | 'mobile') => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallModal(null);
      }
    } else {
      // Se não houver prompt automático (comum em abertura de arquivo local), mostra o guia manual
      setShowInstallModal(type);
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
        onInstall={handleInstallAction}
        showInstallBtn={!!deferredPrompt}
      />
      
      <main className="flex-1 md:ml-64 p-4 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-3">
             <div className="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
               <i className="fas fa-database mr-2 text-indigo-400"></i>
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

      {/* MODAL DE INSTALAÇÃO MANUAL */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
               <h3 className="text-xl font-bold flex items-center gap-3">
                 <i className={`fas ${showInstallModal === 'desktop' ? 'fa-desktop' : 'fa-mobile-alt'}`}></i>
                 Instalar Portaria Smart
               </h3>
               <button onClick={() => setShowInstallModal(null)} className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                 <i className="fas fa-times"></i>
               </button>
            </div>
            <div className="p-8 space-y-6">
               <p className="text-slate-600 leading-relaxed">
                 Como o navegador bloqueia a instalação automática em pastas locais, siga este passo a passo para ter o ícone no seu {showInstallModal === 'desktop' ? 'Computador' : 'Celular'}:
               </p>

               {showInstallModal === 'mobile' ? (
                 <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                       <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold">1</div>
                       <p className="text-sm text-slate-700">Abra este app no <b>Google Chrome</b> do seu celular.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                       <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold">2</div>
                       <p className="text-sm text-slate-700">Toque nos <b>três pontinhos (⋮)</b> no canto superior direito.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                       <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold">3</div>
                       <p className="text-sm text-slate-700">Selecione <b>"Instalar Aplicativo"</b> ou "Adicionar à tela de início".</p>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                       <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold">1</div>
                       <p className="text-sm text-slate-700">Na barra de endereços do <b>Edge ou Chrome</b>, procure um ícone pequeno de "Monitor com uma seta" no final da barra.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                       <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold">2</div>
                       <p className="text-sm text-slate-700">Clique nele e confirme em <b>"Instalar"</b>.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                       <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold">3</div>
                       <p className="text-sm text-slate-700">O app abrirá em tela cheia e criará um atalho na sua área de trabalho.</p>
                    </div>
                 </div>
               )}

               <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <p className="text-[11px] text-amber-800 flex items-center gap-2 font-bold uppercase mb-1">
                    <i className="fas fa-lightbulb"></i>
                    Dica Profissional
                  </p>
                  <p className="text-[11px] text-amber-700">Para a instalação ser 100% automática, hospede esta pasta gratuitamente no site <b>Netlify.com</b>. É só arrastar a pasta lá!</p>
               </div>

               <button 
                 onClick={() => setShowInstallModal(null)}
                 className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all"
               >
                 Entendi, vou fazer isso
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
