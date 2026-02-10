
import React, { useState, useRef } from 'react';
import { Package, Resident, PackageStatus } from '../types';
import { generateNotificationMessage } from '../services/geminiService';

interface PackageManagementProps {
  packages: Package[];
  residents: Resident[];
  onAdd: (pkg: Package) => void;
  onUpdateStatus: (id: string, status: PackageStatus) => void;
  onDelete: (id: string) => void;
  onClearHistory: () => void;
}

const PackageManagement: React.FC<PackageManagementProps> = ({ 
  packages, residents, onAdd, onUpdateStatus, onDelete, onClearHistory 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState<Partial<Package>>({
    carrier: '',
    description: '',
    residentId: ''
  });
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filtrar encomendas pela data selecionada no calendário
  const filteredPackages = packages.filter(p => p.receivedAt.startsWith(selectedDate));
  const pendingPackages = filteredPackages.filter(p => p.status === PackageStatus.PENDING);
  const deliveredPackages = filteredPackages.filter(p => p.status === PackageStatus.DELIVERED);

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setCameraActive(false);
      alert("Erro ao acessar a câmera. Verifique as permissões.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvasRef.current.toDataURL('image/png'));
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleNotify = async (pkg: Package) => {
    const resident = residents.find(r => r.id === pkg.residentId);
    if (!resident) return;
    setIsSending(pkg.id);
    const message = await generateNotificationMessage(pkg, resident);
    window.open(`https://wa.me/${resident.phone}?text=${encodeURIComponent(message)}`, '_blank');
    setIsSending(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.residentId && formData.carrier) {
      onAdd({
        id: crypto.randomUUID(),
        residentId: formData.residentId,
        carrier: formData.carrier,
        description: formData.description || 'Encomenda',
        receivedAt: new Date().toISOString(),
        status: PackageStatus.PENDING,
        photoUrl: capturedImage || undefined
      } as Package);
      setFormData({ carrier: '', description: '', residentId: '' });
      setCapturedImage(null);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Movimentação</h2>
          <p className="text-slate-500 text-sm">Calendário e controle de entregas</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <i className="fas fa-calendar-alt absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500"></i>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Nova Entrada</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendentes do Dia */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <i className="fas fa-clock text-amber-500"></i>
              Pendentes ({pendingPackages.length})
            </h3>
          </div>
          
          <div className="space-y-3">
            {pendingPackages.length > 0 ? pendingPackages.map(pkg => {
              const res = residents.find(r => r.id === pkg.residentId);
              return (
                <div key={pkg.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group animate-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                      {pkg.photoUrl ? <img src={pkg.photoUrl} className="w-full h-full object-cover rounded-lg" /> : <i className="fas fa-box"></i>}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{res?.name} ({res?.apartment})</h4>
                      <p className="text-[11px] text-slate-500">{pkg.carrier} • {pkg.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleNotify(pkg)} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                       <i className={isSending === pkg.id ? "fas fa-spinner fa-spin" : "fab fa-whatsapp"}></i>
                    </button>
                    <button onClick={() => onUpdateStatus(pkg.id, PackageStatus.DELIVERED)} title="Entregar" className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                       <i className="fas fa-check"></i>
                    </button>
                    <button onClick={() => onDelete(pkg.id)} title="Excluir" className="p-2 text-red-400 bg-red-50 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                       <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 py-8 rounded-2xl text-center text-slate-400 text-sm">
                Nenhum registro pendente para esta data.
              </div>
            )}
          </div>
        </div>

        {/* Entregues do Dia */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <i className="fas fa-check-double text-emerald-500"></i>
              Histórico do Dia ({deliveredPackages.length})
            </h3>
            {deliveredPackages.length > 0 && (
              <button 
                onClick={onClearHistory}
                className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider"
              >
                Limpar Tudo
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {deliveredPackages.map(pkg => {
              const res = residents.find(r => r.id === pkg.residentId);
              return (
                <div key={pkg.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity group">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-emerald-500 text-sm"></i>
                    <div className="text-xs">
                      <p className="font-bold text-slate-700">{res?.name} ({res?.apartment})</p>
                      <p className="text-slate-500">{pkg.carrier} • Entregue às {pkg.deliveredAt ? new Date(pkg.deliveredAt).toLocaleTimeString('pt-BR') : '--'}</p>
                    </div>
                  </div>
                  <button onClick={() => onDelete(pkg.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              ))}
              {deliveredPackages.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  Sem entregas finalizadas nesta data.
                </div>
              )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-800">Registrar Encomenda</h3>
               <button onClick={() => { stopCamera(); setIsModalOpen(false); }} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full">
                 <i className="fas fa-times"></i>
               </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Morador</label>
                      <select required value={formData.residentId} 
                        onChange={e => setFormData({...formData, residentId: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Selecionar...</option>
                        {residents.sort((a,b) => a.apartment.localeCompare(b.apartment)).map(r => (
                          <option key={r.id} value={r.id}>{r.apartment} - {r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Transportadora</label>
                      <input required placeholder="Ex: Amazon, Correios..." value={formData.carrier}
                        onChange={e => setFormData({...formData, carrier: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Descrição</label>
                      <input placeholder="Ex: Caixa, Envelope..." value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Foto da Etiqueta (Opcional)</label>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center h-52 relative overflow-hidden group">
                        {capturedImage ? (
                          <div className="relative w-full h-full">
                            <img src={capturedImage} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        ) : cameraActive ? (
                          <div className="relative w-full h-full">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <button type="button" onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 w-12 h-12 rounded-full shadow-xl flex items-center justify-center border-4 border-indigo-600">
                              <i className="fas fa-camera text-xl"></i>
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={startCamera} className="text-slate-400 hover:text-indigo-500 transition-colors flex flex-col items-center">
                            <i className="fas fa-camera text-4xl mb-2"></i>
                            <span className="text-xs font-bold">Abrir Câmera</span>
                          </button>
                        )}
                    </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { stopCamera(); setIsModalOpen(false); }}
                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    Finalizar Registro
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManagement;
