
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, LabelList 
} from 'recharts';
import { 
  ArrowLeft, MapPin, TrendingUp, Package, ShoppingCart, Users, Activity, 
  ChevronRight, ArrowRight, Zap, Filter, Truck, Calendar, BarChart3, 
  LogOut, ShieldCheck, UserCircle2
} from 'lucide-react';

const STATIC_PROVINCES = [
  { name: '山东', inventory: 3200, sales: 850, salesToday: 42 },
  { name: '河南', inventory: 2800, sales: 720, salesToday: 35 },
  { name: '江苏', inventory: 2500, sales: 690, salesToday: 31 },
  { name: '浙江', inventory: 2100, sales: 610, salesToday: 28 },
  { name: '安徽', inventory: 1550, sales: 420, salesToday: 15 },
  { name: '河北', inventory: 1800, sales: 540, salesToday: 19 },
  { name: '湖北', inventory: 1650, sales: 480, salesToday: 18 },
  { name: '四川', inventory: 1850, sales: 510, salesToday: 22 },
];

export default function BossDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const authStr = sessionStorage.getItem('auth_user');
    if (!authStr) { navigate('/login'); return; }
    const currUser = JSON.parse(authStr);
    setUser(currUser);

    if (currUser.role === 'PROVINCE_MGR') {
      setSelectedProvince(currUser.scope);
    }

    // 关键点：每次加载组件都重新读取最新数据源
    const loadGlobalData = () => {
      const savedDeliveries = localStorage.getItem('global_deliveries');
      setDeliveries(savedDeliveries ? JSON.parse(savedDeliveries) : []);
    };
    
    loadGlobalData();
    setLoading(false);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('auth_user');
    navigate('/login');
  };

  // 数据实时聚合逻辑
  const provinceData = useMemo(() => {
    return STATIC_PROVINCES.map(p => {
      // 聚合发往该省份的所有资产划拨记录
      const extraIntake = deliveries
        .filter(d => d.province === p.name)
        .reduce((sum, d) => sum + (Number(d.qty) || 0), 0);
        
      return { 
        ...p, 
        inventory: p.inventory + extraIntake,
        monthlyIntake: extraIntake 
      };
    }).sort((a, b) => b.inventory - a.inventory);
  }, [deliveries]);

  const totalStats = useMemo(() => {
    const data = user?.role === 'PROVINCE_MGR' ? provinceData.filter(p => p.name === user.scope) : provinceData;
    return {
      inventory: data.reduce((s, p) => s + p.inventory, 0),
      salesMonth: data.reduce((s, p) => s + p.sales, 0),
      salesToday: data.reduce((s, p) => s + p.salesToday, 0),
      totalIntake: data.reduce((s, p) => s + p.monthlyIntake, 0)
    };
  }, [provinceData, user]);

  if (loading || !user) return null;

  // --- 省级/深度穿透视图 ---
  if (selectedProvince) {
    const provinceStats = provinceData.find(p => p.name === selectedProvince);
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen font-sans">
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            {user.role === 'BOSS' && (
              <button onClick={() => setSelectedProvince(null)} className="p-4 bg-white border-2 border-gray-100 rounded-[1.5rem] hover:bg-gray-50 transition shadow-sm group">
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition" />
              </button>
            )}
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase">{selectedProvince} <span className="text-blue-600">Region</span></h1>
              <p className="text-xs font-black text-gray-400 mt-1 uppercase tracking-widest flex items-center">
                <ShieldCheck size={12} className="mr-1 text-green-500" /> 区域资产实时分布看板
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-white px-6 py-3 rounded-2xl border flex items-center shadow-sm">
                <UserCircle2 size={18} className="text-blue-500 mr-2" />
                <span className="text-sm font-black text-gray-900">{user.name}</span>
             </div>
             <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition shadow-sm">
                <LogOut size={20} />
             </button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm transition-all hover:border-blue-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Package size={14} className="mr-2 text-blue-500" /> 省内渠道总库</p>
            <div className="text-4xl font-black text-gray-900">{provinceStats?.inventory.toLocaleString()} <span className="text-sm font-bold text-gray-400">台</span></div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm transition-all hover:border-green-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Zap size={14} className="mr-2 text-green-500" /> 今日实销上报</p>
            <div className="text-4xl font-black text-green-600">+{provinceStats?.salesToday} <span className="text-sm font-bold text-gray-400">台</span></div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm transition-all hover:border-emerald-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><ShoppingCart size={14} className="mr-2 text-emerald-500" /> 当月终端实销</p>
            <div className="text-4xl font-black text-emerald-600">{provinceStats?.sales.toLocaleString()} <span className="text-sm font-bold text-gray-400">台</span></div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm transition-all hover:border-indigo-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Truck size={14} className="mr-2 text-indigo-500" /> 厂家当月发货</p>
            <div className="text-4xl font-black text-indigo-600">+{provinceStats?.monthlyIntake.toLocaleString()} <span className="text-sm font-bold text-gray-400">台</span></div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[4rem] border shadow-sm text-center">
            <p className="text-gray-400 font-bold">此处应显示该省内经销商详情列表，详见业务数据表...</p>
        </div>
      </div>
    );
  }

  // --- 总部全局视图 ---
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 bg-[#F8FAFC] min-h-screen font-sans">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-gray-900 leading-tight tracking-tight italic uppercase">Nationwide <span className="text-blue-600">Hub</span></h1>
          <p className="text-gray-500 font-black mt-1 uppercase text-xs tracking-[0.2em] flex items-center">
             <Activity size={14} className="mr-2 text-blue-500" /> 厂家资产下拨与终端动销实时汇总
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-6 py-4 rounded-3xl border flex items-center shadow-sm">
             <UserCircle2 size={24} className="text-indigo-500 mr-3" />
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated</span>
               <span className="text-sm font-black text-gray-900">{user.name}</span>
             </div>
          </div>
          <button onClick={handleLogout} className="p-4 bg-white text-gray-400 border rounded-3xl hover:text-red-500 transition shadow-sm">
             <LogOut size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[4rem] border shadow-xl shadow-blue-900/5 group hover:border-blue-100 transition-all">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center"><Zap size={16} className="mr-2 text-blue-500" /> 全国当日实销</p>
           <div className="text-6xl font-black text-gray-900">{totalStats.salesToday.toLocaleString()} <span className="text-lg font-bold text-gray-300">台</span></div>
        </div>
        <div className="bg-white p-10 rounded-[4rem] border shadow-xl shadow-emerald-900/5 group hover:border-emerald-100 transition-all">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center"><ShoppingCart size={16} className="mr-2 text-emerald-500" /> 全国当月累销</p>
           <div className="text-6xl font-black text-emerald-600">{totalStats.salesMonth.toLocaleString()} <span className="text-lg font-bold text-gray-300">台</span></div>
        </div>
        <div className="bg-white p-10 rounded-[4rem] border shadow-xl shadow-indigo-900/5 group hover:border-indigo-100 transition-all">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center"><Package size={16} className="mr-2 text-indigo-500" /> 全国渠道总库存</p>
           <div className="text-6xl font-black text-indigo-600">{totalStats.inventory.toLocaleString()} <span className="text-lg font-bold text-gray-300">台</span></div>
           <div className="mt-8 text-[10px] font-black text-indigo-300 uppercase tracking-widest">包含厂家已发货在途及终端库存</div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[5rem] border shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-20"></div>
        <div className="flex justify-between items-center mb-12 px-2">
           <div>
             <h3 className="text-3xl font-black text-gray-900 italic">各省库存分布 (包含客服下拨)</h3>
             <p className="text-sm font-bold text-gray-400 mt-2 tracking-tight">点击柱状图查看具体省份的下钻数据</p>
           </div>
           <div className="bg-gray-50 px-6 py-3 rounded-2xl border text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
              <BarChart3 size={14} className="mr-2 text-blue-500" /> LIVE DATA SYNC
           </div>
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={provinceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 900, fill: '#64748b'}} dy={10} />
              <YAxis hide />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}} />
              <Bar dataKey="inventory" radius={[10, 10, 0, 0]} barSize={40} onClick={(data) => setSelectedProvince(data.name)}>
                {provinceData.map((e, i) => (
                  <Cell key={i} fill="#e2e8f0" className="hover:fill-blue-600 cursor-pointer transition-all" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
