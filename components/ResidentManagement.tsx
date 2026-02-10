
import React, { useState } from 'react';
import { Resident } from '../types';

interface ResidentManagementProps {
  residents: Resident[];
  onAdd: (resident: Resident) => void;
  onDelete: (id: string) => void;
}

const ResidentManagement: React.FC<ResidentManagementProps> = ({ residents, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResident, setNewResident] = useState<Partial<Resident>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.apartment.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResident.name && newResident.apartment && newResident.phone) {
      onAdd({
        id: crypto.randomUUID(),
        name: newResident.name,
        apartment: newResident.apartment,
        phone: newResident.phone.replace(/\D/g, ''),
      } as Resident);
      setNewResident({});
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Moradores</h2>
          <p className="text-slate-500">Cadastre e gerencie os contatos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-plus"></i>
          Novo Morador
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Buscar por nome ou apartamento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <th className="px-6 py-4">Morador</th>
              <th className="px-6 py-4">Apartamento</th>
              <th className="px-6 py-4">WhatsApp</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredResidents.length > 0 ? filteredResidents.map(resident => (
              <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{resident.name}</td>
                <td className="px-6 py-4 text-slate-700">{resident.apartment}</td>
                <td className="px-6 py-4 text-emerald-600 font-medium">
                  <i className="fab fa-whatsapp mr-2"></i>{resident.phone}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onDelete(resident.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum morador encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white text-slate-800">
              <div>
                <h3 className="text-xl font-bold">Cadastrar Morador</h3>
                <p className="text-slate-500 text-xs">Adicione um novo residente ao sistema</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    required 
                    type="text" 
                    value={newResident.name || ''}
                    onChange={e => setNewResident({...newResident, name: e.target.value})}
                    placeholder="Nome do morador"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Apartamento</label>
                  <div className="relative">
                    <i className="fas fa-door-open absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      required 
                      type="text" 
                      value={newResident.apartment || ''}
                      onChange={e => setNewResident({...newResident, apartment: e.target.value})}
                      placeholder="Ex: 101"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp</label>
                  <div className="relative">
                    <i className="fab fa-whatsapp absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      required 
                      type="tel" 
                      value={newResident.phone || ''}
                      onChange={e => setNewResident({...newResident, phone: e.target.value})}
                      placeholder="DDD + Número"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-100"
                >
                  Salvar Morador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentManagement;
