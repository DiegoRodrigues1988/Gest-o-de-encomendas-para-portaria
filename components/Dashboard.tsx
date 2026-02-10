
import React from 'react';
import { Package, Resident, PackageStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  packages: Package[];
  residents: Resident[];
}

const Dashboard: React.FC<DashboardProps> = ({ packages, residents }) => {
  const totalPending = packages.filter(p => p.status === PackageStatus.PENDING).length;
  
  const today = new Date().toISOString().split('T')[0];
  const totalReceivedToday = packages.filter(p => p.receivedAt.startsWith(today)).length;
  const totalDeliveredToday = packages.filter(p => p.status === PackageStatus.DELIVERED && p.deliveredAt?.startsWith(today)).length;

  // Chart data: Encomendas por transportadora
  const carriers = Array.from(new Set(packages.map(p => p.carrier)));
  const carrierData = carriers.length > 0 
    ? carriers.map(carrier => ({
        name: carrier,
        count: packages.filter(p => p.carrier === carrier).length
      })).sort((a, b) => b.count - a.count).slice(0, 5)
    : [{ name: 'Nenhuma', count: 0 }];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel de Controle</h2>
          <p className="text-slate-500">Acompanhamento em tempo real da portaria.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-slate-600">Sistema Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon="fa-box" 
          label="Pendentes" 
          value={totalPending} 
          color="bg-indigo-500" 
          sub="Aguardando retirada"
        />
        <StatCard 
          icon="fa-truck-loading" 
          label="Recebidas Hoje" 
          value={totalReceivedToday} 
          color="bg-amber-500" 
          sub="Novas entradas"
        />
        <StatCard 
          icon="fa-hands-helping" 
          label="Entregues Hoje" 
          value={totalDeliveredToday} 
          color="bg-emerald-500" 
          sub="Entregues ao morador"
        />
        <StatCard 
          icon="fa-user-friends" 
          label="Moradores" 
          value={residents.length} 
          color="bg-slate-700" 
          sub="Cadastrados no sistema"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-bar text-indigo-500"></i>
            Top Transportadoras
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carrierData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {carrierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-bell text-amber-500"></i>
            Avisos de Segurança
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs font-bold text-indigo-900 uppercase flex items-center gap-2">
                <i className="fas fa-robot"></i>
                Inteligência Artificial
              </p>
              <p className="text-xs text-indigo-700 leading-relaxed mt-1">
                "Não esqueça de exportar o backup ao final do seu turno para garantir a segurança dos dados locais."
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
               <p className="text-xs font-bold text-slate-800 mb-1">Dica de Operação</p>
               <p className="text-[10px] text-slate-500 leading-tight">
                 Mantenha o WhatsApp do morador sempre atualizado para garantir que as notificações de entrega funcionem corretamente.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, sub }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-100`}>
      <i className={`fas ${icon} text-xl`}></i>
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <p className="text-3xl font-bold text-slate-800 my-1">{value}</p>
    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{sub}</p>
  </div>
);

export default Dashboard;
