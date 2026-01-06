
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, Plus, Trash2, Loader2, AlertCircle, 
  Package, ChevronRight, Search, MapPin, BarChart3,
  X, Send, ArrowRightLeft, Calendar, History, ArrowLeft, Filter,
  Edit3, UserPlus, Phone, UserCircle2, Save, ArrowRight, Zap, ShieldAlert, CheckCircle2, ChevronDown, Trash, LogOut,
  ShieldCheck
} from 'lucide-react';

const INITIAL_L1_BATCHES = [
  { id: 'b1', model: '雷霆 3000', color: '亮红色', power: '2000W', prodDate: '2023-10-15', qty: 145 },
  { id: 'b2', model: '雷霆 3000', color: '金属灰', power: '2000W', prodDate: '2023-11-20', qty: 88 },
  { id: 'b3', model: '闪电 500', color: '珠光蓝', power: '1000W', prodDate: '2024-01-05', qty: 56 },
];

const INITIAL_L2_STATS = [
  { id: 'l2-1', name: '任城区雷驰二网店', city: '济宁', contact: '王老板', inventory: 42, salesToday: 3, salesMonth: 85, health: 'normal', province: '山东' },
  { id: 'l2-2', name: '兖州兴旺三轮专卖', city: '济宁', contact: '刘大姐', inventory: 12, salesToday: 1, salesMonth: 45, health: 'warning', province: '山东' },
  { id: 'l2-3', name: '曲阜圣城车行', city: '曲阜', contact: '孔经理', inventory: 85, salesToday: 0, salesMonth: 20, health: 'danger', province: '山东' },
  { id: 'l2-4', name: '微山湖畔动力店', city: '济宁', contact: '张老板', inventory: 28, salesToday: 5, salesMonth: 110, health: 'good', province: '山东' },
];

export default function L1TransferPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [l1Batches, setL1Batches] = useState<any[]>([]);
  const [l2Stats, setL2Stats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // 调拨表单状态
  const [transferForm, setTransferForm] = useState({
    targetL2Id: '',
    items: [{ batchId: '', qty: 1 }]
  });

  useEffect(() => {
    const authStr = sessionStorage.getItem('auth_user');
    if (!authStr) {
      navigate('/login');
      return;
    }
    const currUser = JSON.parse(authStr);
    setUser(currUser);

    const savedL1Batches = localStorage.getItem('l1_batches');
    const savedL2Stats = localStorage.getItem('l2_stats');
    
    setL1Batches(savedL1Batches ? JSON.parse(savedL1Batches) : INITIAL_L1_BATCHES);
    setL2Stats(savedL2Stats ? JSON.parse(savedL2Stats) : INITIAL_L2_STATS);

    setLoading(false);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('auth_user');
    navigate('/login');
  };

  const l1TotalInventory = useMemo(() => l1Batches.reduce((acc, b) => acc + b.qty, 0), [l1Batches]);

  const openTransferModal = (l2Id?: string) => {
    setTransferForm({
      targetL2Id: l2Id || '',
      items: [{ batchId: '', qty: 1 }]
    });
    setIsTransferModalOpen(true);
  };

  const addTransferItem = () => {
    setTransferForm({
      ...transferForm,
      items: [...transferForm.items, { batchId: '', qty: 1 }]
    });
  };

  const removeTransferItem = (index: number) => {
    const newItems = transferForm.items.filter((_, i) => i !== index);
    setTransferForm({ ...transferForm, items: newItems });
  };

  const updateTransferItem = (index: number, field: string, value: any) => {
    const newItems = [...transferForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setTransferForm({ ...transferForm, items: newItems });
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.targetL2Id) { alert("请选择接收货物的二网网点"); return; }
    
    setSaving(true);
    
    setTimeout(() => {
      let nextL1Batches = [...l1Batches];
      let nextL2Stats = [...l2Stats];
      let totalQtyInThisOrder = 0;

      // 模拟 FIFO 逻辑更新
      transferForm.items.forEach(item => {
        const idx = nextL1Batches.findIndex(b => b.id === item.batchId);
        if (idx > -1) {
          const deduct = Math.min(nextL1Batches[idx].qty, item.qty);
          nextL1Batches[idx].qty -= deduct;
          totalQtyInThisOrder += deduct;
        }
      });

      const l2Idx = nextL2Stats.findIndex(l => l.id === transferForm.targetL2Id);
      if (l2Idx > -1) {
        nextL2Stats[l2Idx].inventory += totalQtyInThisOrder;
      }

      setL1Batches(nextL1Batches);
      setL2Stats(nextL2Stats);
      localStorage.setItem('l1_batches', JSON.stringify(nextL1Batches));
      localStorage.setItem('l2_stats', JSON.stringify(nextL2Stats));

      setSaving(false);
      setIsTransferModalOpen(false);
      alert(`下拨成功！已成功向网点划转 ${totalQtyInThisOrder} 台车辆。`);
    }, 800);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b px-8 h-24 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-100 rotate-2"><Truck size={28} /></div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{user.name} <span className="text-indigo-600">业务管理</span></h1>
            <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mt-1 flex items-center">
              <ShieldCheck size={12} className="mr-1 text-green-500" /> 经销商 ID: {user.id} · 负责区域: {user.scope}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <button onClick={() => openTransferModal()} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black flex items-center shadow-lg hover:scale-105 active:scale-95 transition-all">
             <ArrowRightLeft size={18} className="mr-2" /> 下拨调货
           </button>
           <button onClick={handleLogout} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-red-500 transition border-2 border-transparent hover:border-red-100">
             <LogOut size={20} />
           </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10 space-y-10">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex items-center justify-between group hover:border-blue-100 transition cursor-default">
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">辖区今日销量</p>
               <p className="text-4xl font-black text-gray-900">28 <span className="text-sm font-bold text-gray-400">台</span></p>
             </div>
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center"><Zap size={28} /></div>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex items-center justify-between group hover:border-green-100 transition cursor-default">
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">本月累计销量</p>
               <p className="text-4xl font-black text-gray-900">503 <span className="text-sm font-bold text-gray-400">台</span></p>
             </div>
             <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center"><BarChart3 size={28} /></div>
          </div>
          <div className="bg-gray-900 p-10 rounded-[3rem] text-white text-left shadow-2xl shadow-gray-200 group transition flex items-center justify-between">
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">我的实物总库存</p>
               <p className="text-4xl font-black">{l1TotalInventory} <span className="text-sm font-bold text-gray-400">台</span></p>
             </div>
             <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center"><Package size={28} /></div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <div>
               <h2 className="text-3xl font-black text-gray-900">下级网点动销监控</h2>
               <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Secondary Dealer Performance</p>
             </div>
          </div>

          <div className="bg-white rounded-[4rem] border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <th className="px-10 py-7">网点名称 / 地区</th>
                  <th className="px-10 py-7 text-center">实物库存</th>
                  <th className="px-10 py-7 text-center">今日销量</th>
                  <th className="px-10 py-7 text-center">状态</th>
                  <th className="px-10 py-7 text-right">快速操作</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm font-medium">
                {l2Stats.map(l2 => (
                  <tr key={l2.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-10 py-8">
                      <div className="font-black text-gray-900 text-lg">{l2.name}</div>
                      <div className="text-[10px] font-bold text-gray-400 flex items-center mt-1">
                        <MapPin size={10} className="mr-1" /> {l2.city} · {l2.contact}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center font-black text-2xl">{l2.inventory}</td>
                    <td className="px-10 py-8 text-center font-bold text-indigo-600">+{l2.salesToday}</td>
                    <td className="px-10 py-8 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${l2.inventory < 15 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                         {l2.inventory < 15 ? '急需补货' : '供应正常'}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button onClick={() => openTransferModal(l2.id)} className="px-6 py-3 bg-gray-50 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition">发起调货</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 下拨调货弹窗 (Modal) */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsTransferModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center italic">
                  <ArrowRightLeft className="mr-3 text-indigo-600" /> 下拨调货指令
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Inventory Transfer Order</p>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-100 rounded-full text-gray-400 hover:text-red-500 transition shadow-sm"><X size={20} /></button>
            </div>

            <form onSubmit={handleTransferSubmit} className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><MapPin size={12} className="mr-2 text-indigo-500"/> 接收二网网点</label>
                <select 
                  required
                  className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl font-black text-gray-900 outline-none transition"
                  value={transferForm.targetL2Id}
                  onChange={e => setTransferForm({ ...transferForm, targetL2Id: e.target.value })}
                >
                  <option value="">点击选择目标网点...</option>
                  {l2Stats.map(l2 => (
                    <option key={l2.id} value={l2.id}>{l2.name} ({l2.city})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Package size={12} className="mr-2 text-indigo-500"/> 调拨车型明细 (基于 FIFO 批次)</label>
                  <button type="button" onClick={addTransferItem} className="text-[10px] font-black text-indigo-600 flex items-center hover:underline">
                    <Plus size={14} className="mr-1" /> 添加行项
                  </button>
                </div>
                
                <div className="space-y-3">
                  {transferForm.items.map((item, idx) => (
                    <div key={idx} className="flex items-end gap-3 p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-indigo-100 transition group">
                      <div className="flex-1 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">选择批次库存</label>
                        <select 
                          required
                          className="w-full p-4 bg-white rounded-2xl font-bold text-sm outline-none border border-gray-100"
                          value={item.batchId}
                          onChange={e => updateTransferItem(idx, 'batchId', e.target.value)}
                        >
                          <option value="">选择可用库存...</option>
                          {l1Batches.filter(b => b.qty > 0).map(b => (
                            <option key={b.id} value={b.id}>
                              {b.model} - {b.color} (余{b.qty}台 / {b.prodDate})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24 space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase text-center block">数量</label>
                        <input 
                          type="number"
                          min="1"
                          required
                          className="w-full p-4 bg-white rounded-2xl font-black text-center text-indigo-600 border border-gray-100 outline-none"
                          value={item.qty}
                          onChange={e => updateTransferItem(idx, 'qty', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeTransferItem(idx)}
                        disabled={transferForm.items.length === 1}
                        className="p-4 text-gray-300 hover:text-red-500 disabled:opacity-0 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-10 bg-gray-50/80 border-t flex items-center space-x-4">
              <button onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-5 bg-white border-2 border-gray-200 rounded-[2rem] font-black text-gray-500 transition">
                取消
              </button>
              <button 
                onClick={handleTransferSubmit}
                disabled={saving}
                className="flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" /> : <><Send size={20} className="mr-3" /> 确认划转货权</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
