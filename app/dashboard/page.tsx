
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
  { name: '广东', inventory: 2500, sales: 690, salesToday: 31 },
  { name: '江苏', inventory: 2100, sales: 610, salesToday: 28 },
  { name: '浙江', inventory: 1950, sales: 580, salesToday: 24 },
  { name: '四川', inventory: 1850, sales: 510, salesToday: 22 },
  { name: '河北', inventory: 1800, sales: 540, salesToday: 19 },
  { name: '湖北', inventory: 1650, sales: 480, salesToday: 18 },
  { name: '湖南', inventory: 1600, sales: 460, salesToday: 17 },
  { name: '安徽', inventory: 1550, sales: 420, salesToday: 15 },
  { name: '陕西', inventory: 1450, sales: 370, salesToday: 12 },
  { name: '广西', inventory: 1400, sales: 330, salesToday: 10 },
  { name: '辽宁', inventory: 1350, sales: 340, salesToday: 10 },
  { name: '福建', inventory: 1300, sales: 310, salesToday: 11 },
  { name: '云南', inventory: 1280, sales: 300, salesToday: 7 },
  { name: '江西', inventory: 1250, sales: 290, salesToday: 9 },
  { name: '山西', inventory: 1200, sales: 320, salesToday: 8 },
  { name: '贵州', inventory: 1150, sales: 270, salesToday: 6 },
  { name: '上海', inventory: 1120, sales: 340, salesToday: 18 },
  { name: '内蒙古', inventory: 1100, sales: 280, salesToday: 7 },
  { name: '黑龙江', inventory: 1050, sales: 260, salesToday: 6 },
  { name: '重庆', inventory: 980, sales: 240, salesToday: 8 },
  { name: '吉林', inventory: 950, sales: 230, salesToday: 5 },
  { name: '甘肃', inventory: 920, sales: 220, salesToday: 4 },
  { name: '北京', inventory: 850, sales: 210, salesToday: 12 },
  { name: '新疆', inventory: 880, sales: 190, salesToday: 5 },
  { name: '天津', inventory: 720, sales: 180, salesToday: 9 },
  { name: '宁夏', inventory: 550, sales: 130, salesToday: 3 },
  { name: '青海', inventory: 480, sales: 110, salesToday: 2 },
  { name: '海南', inventory: 450, sales: 90, salesToday: 2 },
  { name: '西藏', inventory: 320, sales: 60, salesToday: 1 },
];

export default function BossDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);

  useEffect(() => {
    const authStr = sessionStorage.getItem('auth_user');
    if (!authStr) {
      navigate('/login');
      return;
    }
    const currUser = JSON.parse(authStr);
    setUser(currUser);

    // 如果是省经理，强制选中其负责的省份，且不允许退回全国视图
    if (currUser.role === 'PROVINCE_MGR') {
      setSelectedProvince(currUser.scope);
    }

    const savedDeliveries = localStorage.getItem('global_deliveries');
    const savedDealers = localStorage.getItem('global_dealers');
    if (savedDeliveries) setDeliveries(JSON.parse(savedDeliveries));
    if (savedDealers) setDealers(JSON.parse(savedDealers));
    setLoading(false);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('auth_user');
    navigate('/login');
  };

  // 数据过滤逻辑
  const provinceData = useMemo(() => {
    let data = STATIC_PROVINCES.map(p => {
      const extraIntake = deliveries
        .filter(d => d.province === p.name)
        .reduce((sum, d) => sum + d.qty, 0);
      return { 
        ...p, 
        inventory: p.inventory + extraIntake,
        monthlyIntake: extraIntake 
      };
    });

    if (user?.role === 'PROVINCE_MGR') {
      data = data.filter(p => p.name === user.scope);
    }
    
    return data.sort((a, b) => b.inventory - a.inventory);
  }, [deliveries, user]);

  const totalStats = useMemo(() => ({
    inventory: provinceData.reduce((s, p) => s + p.inventory, 0),
    salesMonth: provinceData.reduce((s, p) => s + p.sales, 0),
    salesToday: provinceData.reduce((s, p) => s + p.salesToday, 0)
  }), [provinceData]);

  const regionalDealerStats = useMemo(() => {
    if (!selectedProvince) return [];
    return dealers
      .filter(d => d.province === selectedProvince)
      .map(d => {
        const intake = deliveries.filter(del => del.dealerId === d.id && del.province === selectedProvince).reduce((sum, del) => sum + del.qty, 0);
        return {
          ...d,
          realtimeInventory: (d.level === '一网' ? 120 : 30) + intake,
          dailySales: Math.floor(Math.random() * (d.level === '一网' ? 8 : 3)),
          monthlySales: (d.level === '一网' ? 65 : 15) + Math.floor(Math.random() * 15),
          monthlyIntake: intake
        };
      });
  }, [selectedProvince, dealers, deliveries]);

  if (loading) return null;

  // --- 省级/深度穿透视图 ---
  if (selectedProvince) {
    const provinceStats = provinceData.find(p => p.name === selectedProvince);
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen">
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            {user.role === 'BOSS' && (
              <button onClick={() => setSelectedProvince(null)} className="p-4 bg-white border-2 border-gray-100 rounded-[1.5rem] hover:bg-gray-50 transition shadow-sm group">
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition" />
              </button>
            )}
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{selectedProvince} <span className="text-blue-600">实时运营中心</span></h1>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center">
                <ShieldCheck size={12} className="mr-1 text-green-500" /> 已锁定【{user.name}】数据管辖范围
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-white px-6 py-3 rounded-2xl border-2 border-gray-100 flex items-center shadow-sm">
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
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Package size={14} className="mr-2 text-blue-500" /> 区域总库存</p>
            <div className="text-4xl font-black text-gray-900">{provinceStats?.inventory.toLocaleString()} <span className="text-sm font-bold text-gray-400">台</span></div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm transition-all hover:border-green-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Zap size={14} className="mr-2 text-green-500" /> 今日实销数</p>
            <div className="text-4xl font-black text-green-600">+{provinceStats?.salesToday} <span className="text-sm font-bold text-gray-400">台</span></div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm transition-all hover:border-emerald-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><ShoppingCart size={14} className="mr-2 text-emerald-500" /> 本月累销</p>
            <div className="text-4xl font-black text-emerald-600">{provinceStats?.sales.toLocaleString()} <span className="text-sm font-bold text-gray-400">台</span></div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm transition-all hover:border-indigo-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Truck size={14} className="mr-2 text-indigo-500" /> 本月进货</p>
            <div className="text-4xl font-black text-indigo-600">{provinceStats?.monthlyIntake.toLocaleString()} <span className="text-sm font-bold text-gray-400">台</span></div>
          </div>
        </div>

        <div className="bg-white rounded-[4rem] border shadow-sm overflow-hidden">
          <div className="p-10 border-b flex justify-between items-center bg-gray-50/20">
            <h3 className="text-2xl font-black text-gray-900">下级渠道网点穿透明细</h3>
            <span className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">实时链路同步中</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 uppercase text-[10px] font-black tracking-[0.2em] bg-gray-50/50 border-b">
                  <th className="px-10 py-6">经销商名称</th>
                  <th className="px-10 py-6 text-center">当前库存</th>
                  <th className="px-10 py-6 text-center">今日销量</th>
                  <th className="px-10 py-6 text-center">当月销量</th>
                  <th className="px-10 py-6 text-center">库存预警</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {regionalDealerStats.map(d => (
                  <tr key={d.id} className="hover:bg-blue-50/10 transition group">
                    <td className="px-10 py-8 font-black text-gray-900 text-lg">
                      {d.name} <span className="ml-2 text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase">{d.level}</span>
                    </td>
                    <td className="px-10 py-8 text-center font-black text-2xl text-gray-900">{d.realtimeInventory}</td>
                    <td className="px-10 py-8 text-center font-black text-lg text-green-600">+{d.dailySales}</td>
                    <td className="px-10 py-8 text-center font-black text-lg text-gray-800">{d.monthlySales}</td>
                    <td className="px-10 py-8 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${d.realtimeInventory < 15 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                         {d.realtimeInventory < 15 ? '急需补货' : '供应平稳'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- 总部全局主决策看板 ---
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 bg-[#F8FAFC] min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-gray-900 leading-tight tracking-tight">全国实时决策看板</h1>
          <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-[0.2em] flex items-center">
             <Activity size={14} className="mr-2 text-blue-500" /> NATIONWIDE SALES & INVENTORY INTELLIGENCE
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-6 py-4 rounded-3xl border-2 border-gray-100 flex items-center shadow-sm">
             <UserCircle2 size={24} className="text-indigo-500 mr-3" />
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">当前管理员</span>
               <span className="text-sm font-black text-gray-900">{user.name}</span>
             </div>
          </div>
          <button onClick={handleLogout} className="p-4 bg-white text-gray-400 border-2 rounded-3xl hover:text-red-500 hover:border-red-100 transition shadow-sm">
             <LogOut size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[4rem] border shadow-xl shadow-blue-900/5 group hover:border-blue-100 transition-all">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center"><Zap size={16} className="mr-2 text-blue-500" /> 全国当日实销</p>
           <div className="text-6xl font-black text-gray-900">{totalStats.salesToday.toLocaleString()} <span className="text-lg font-bold text-gray-300">台</span></div>
           <div className="mt-8 text-[10px] font-black text-green-500 uppercase flex items-center tracking-widest"><TrendingUp size={14} className="mr-1.5" /> 实时链路同步正常</div>
        </div>
        <div className="bg-white p-10 rounded-[4rem] border shadow-xl shadow-emerald-900/5 group hover:border-emerald-100 transition-all">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center"><ShoppingCart size={16} className="mr-2 text-emerald-500" /> 全国当月累销</p>
           <div className="text-6xl font-black text-emerald-600">{totalStats.salesMonth.toLocaleString()} <span className="text-lg font-bold text-gray-300">台</span></div>
           <div className="mt-8 text-[10px] font-black text-gray-400 uppercase flex items-center tracking-widest"><Calendar size={14} className="mr-1.5" /> 截止至今日 18:00</div>
        </div>
        <div className="bg-white p-10 rounded-[4rem] border shadow-xl shadow-indigo-900/5 group hover:border-indigo-100 transition-all">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center"><Package size={16} className="mr-2 text-indigo-500" /> 全国渠道总库存</p>
           <div className="text-6xl font-black text-indigo-600">{totalStats.inventory.toLocaleString()} <span className="text-lg font-bold text-gray-300">台</span></div>
           <div className="mt-8 text-[10px] font-black text-indigo-300 uppercase tracking-widest">全链 FIFO 批次自动结算</div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[5rem] border shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-20"></div>
        <div className="flex justify-between items-center mb-12 px-2">
           <div>
             <h3 className="text-3xl font-black text-gray-900">全国各省库存分布</h3>
             <p className="text-sm font-bold text-gray-400 mt-2 tracking-tight">您拥有最高决策权限。点击下方柱状图，实时穿透查看任意省份的业务明细。</p>
           </div>
           <div className="bg-gray-50 px-6 py-3 rounded-2xl border text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
              <BarChart3 size={14} className="mr-2 text-blue-500" /> NATIONWIDE VIEW
           </div>
        </div>
        
        <div className="h-[450px] overflow-x-auto custom-scrollbar">
          <div style={{ minWidth: '1500px', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceData} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fontWeight: 900, fill: '#64748b'}} 
                  dy={15} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}}
                  formatter={(val: number) => [`${val.toLocaleString()} 台`, '当前库存']}
                />
                <Bar dataKey="inventory" radius={[15, 15, 0, 0]} barSize={35}>
                  <LabelList 
                    dataKey="inventory" 
                    position="top" 
                    style={{fontSize: 11, fontWeight: 900, fill: '#1e293b'}} 
                    formatter={(v:any)=>v.toLocaleString()} 
                    dy={-15} 
                  />
                  {provinceData.map((e, i) => (
                    <Cell 
                      key={i} 
                      fill={selectedProvince === e.name ? '#2563eb' : '#e2e8f0'} 
                      className="transition-all hover:fill-blue-500 cursor-pointer" 
                      onClick={() => setSelectedProvince(e.name)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; border: 2px solid #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      ` }} />
    </div>
  );
}
