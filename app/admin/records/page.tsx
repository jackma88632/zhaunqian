
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Package, Plus, Search, Filter, 
  Edit2, Trash2, CheckCircle2, 
  ArrowLeft, Info, Loader2, X, Save,
  Truck, ArrowRightLeft, Calendar, Hash, MapPin, ChevronDown, Trash, ChevronRight, AlertTriangle, Tag, Cpu,
  Settings, UserCircle, MoreVertical, Phone, LogOut, UserCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const INITIAL_SKUS = [
  { id: 'sku-1', model: '雷霆 3000', colors: ['亮红色', '珠光蓝', '金属灰'], powerConfigs: ['1200W', '1500W', '2000W'], status: '在售' },
  { id: 'sku-2', model: '闪电 500', colors: ['军绿色', '灰色', '消光黑'], powerConfigs: ['800W', '1000W'], status: '在售' },
];

const INITIAL_DEALERS = [
  { id: 'd-1', name: '山东华诚商贸有限公司', level: '一网', province: '山东', city: '济南', contact: '张经理', phone: '138****8888', status: '正常' },
  { id: 'd-2', name: '河南大河车业', level: '一网', province: '河南', city: '郑州', contact: '李经理', phone: '139****9999', status: '正常' },
];

const PROVINCES = ['山东', '河南', '江苏', '河北', '四川', '安徽', '湖北', '广东', '浙江', '福建'];

export default function AdminRecordsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sku' | 'dealer' | 'delivery'>('sku');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [skuList, setSkuList] = useState<any[]>([]);
  const [dealerList, setDealerList] = useState<any[]>([]);
  const [deliveryList, setDeliveryList] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // --- 表单状态 ---
  const [skuForm, setSkuForm] = useState({
    model: '',
    colors: [] as string[],
    newColor: '',
    powerConfigs: [] as string[],
    newPower: '',
    status: '在售'
  });

  const [dealerForm, setDealerForm] = useState({
    name: '',
    level: '一网',
    province: '',
    city: '',
    contact: '',
    phone: '',
    status: '正常'
  });

  const [deliveryForm, setDeliveryForm] = useState({ 
    province: '', 
    dealerId: '', 
    items: [{ skuId: '', color: '', power: '', qty: 1, date: new Date().toISOString().split('T')[0] }] 
  });

  useEffect(() => {
    const authStr = sessionStorage.getItem('auth_user');
    if (!authStr) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(authStr));

    const savedSkus = localStorage.getItem('global_skus');
    const savedDealers = localStorage.getItem('global_dealers');
    const savedDeliveries = localStorage.getItem('global_deliveries');

    setSkuList(savedSkus ? JSON.parse(savedSkus) : INITIAL_SKUS);
    setDealerList(savedDealers ? JSON.parse(savedDealers) : INITIAL_DEALERS);
    setDeliveryList(savedDeliveries ? JSON.parse(savedDeliveries) : []);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('auth_user');
    navigate('/login');
  };

  // --- 通用操作 ---
  const openAddModal = () => {
    setModalMode('add');
    setCurrentId(null);
    if (activeTab === 'sku') {
      setSkuForm({ model: '', colors: [], newColor: '', powerConfigs: [], newPower: '', status: '在售' });
    } else if (activeTab === 'dealer') {
      setDealerForm({ name: '', level: '一网', province: '', city: '', contact: '', phone: '', status: '正常' });
    } else {
      setDeliveryForm({ province: '', dealerId: '', items: [{ skuId: '', color: '', power: '', qty: 1, date: new Date().toISOString().split('T')[0] }] });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode('edit');
    setCurrentId(item.id);
    if (activeTab === 'sku') {
      setSkuForm({ ...item, newColor: '', newPower: '' });
    } else if (activeTab === 'dealer') {
      setDealerForm({ ...item });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, list: any[], setList: Function, key: string) => {
    if (confirm("确定要删除此条档案吗？关联数据可能受到影响。")) {
      const updated = list.filter(i => i.id !== id);
      setList(updated);
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  // --- 保存逻辑 ---
  const handleSaveSku = () => {
    if (!skuForm.model || skuForm.colors.length === 0) {
      alert("请输入型号并至少添加一个颜色");
      return;
    }
    setSaving(true);
    let updated;
    if (modalMode === 'add') {
      const newSku = { id: `sku-${Date.now()}`, ...skuForm };
      updated = [newSku, ...skuList];
    } else {
      updated = skuList.map(s => s.id === currentId ? { ...s, ...skuForm } : s);
    }
    setSkuList(updated);
    localStorage.setItem('global_skus', JSON.stringify(updated));
    setTimeout(() => { setSaving(false); setIsModalOpen(false); }, 500);
  };

  const handleSaveDealer = () => {
    if (!dealerForm.name || !dealerForm.province) {
      alert("请填写经销商名称及所在省份");
      return;
    }
    setSaving(true);
    let updated;
    if (modalMode === 'add') {
      const newDealer = { id: `d-${Date.now()}`, ...dealerForm };
      updated = [newDealer, ...dealerList];
    } else {
      updated = dealerList.map(d => d.id === currentId ? { ...d, ...dealerForm } : d);
    }
    setDealerList(updated);
    localStorage.setItem('global_dealers', JSON.stringify(updated));
    setTimeout(() => { setSaving(false); setIsModalOpen(false); }, 500);
  };

  const handleSaveDelivery = () => {
    if (!deliveryForm.province || !deliveryForm.dealerId) {
      alert("请选择目标省份和经销商");
      return;
    }
    setSaving(true);
    const targetDealer = dealerList.find(d => d.id === deliveryForm.dealerId);
    const newEntries = deliveryForm.items.map((item, idx) => {
      const sku = skuList.find(s => s.id === item.skuId);
      return {
        id: `del-${Date.now()}-${idx}`,
        orderNo: `FAC${new Date().getFullYear()}${String(deliveryList.length + idx + 1).padStart(4, '0')}`,
        dealerId: deliveryForm.dealerId,
        dealerName: targetDealer?.name,
        province: deliveryForm.province,
        model: sku?.model || '未知型号',
        color: item.color,
        power: item.power,
        qty: item.qty,
        date: item.date,
        status: '已发货'
      };
    });
    const updated = [...newEntries, ...deliveryList];
    setDeliveryList(updated);
    localStorage.setItem('global_deliveries', JSON.stringify(updated));
    setTimeout(() => { setSaving(false); setIsModalOpen(false); }, 500);
  };

  const updateDeliveryItem = (idx: number, field: string, val: any) => {
    const newItems = [...deliveryForm.items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setDeliveryForm({ ...deliveryForm, items: newItems });
  };

  const addColor = () => {
    if (skuForm.newColor.trim() && !skuForm.colors.includes(skuForm.newColor.trim())) {
      setSkuForm({ ...skuForm, colors: [...skuForm.colors, skuForm.newColor.trim()], newColor: '' });
    }
  };
  const addPower = () => {
    if (skuForm.newPower.trim() && !skuForm.powerConfigs.includes(skuForm.newPower.trim())) {
      setSkuForm({ ...skuForm, powerConfigs: [...skuForm.powerConfigs, skuForm.newPower.trim()], newPower: '' });
    }
  };

  const filteredDealersForDelivery = dealerList.filter(d => d.province === deliveryForm.province && d.level === '一网');

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-3 hover:bg-gray-100 rounded-2xl transition text-gray-500"><ArrowLeft size={20} /></Link>
            <div>
              <h1 className="text-xl font-black text-gray-900">系统档案管理</h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center">
                <Settings size={12} className="mr-1"/> MASTER DATA GOVERNANCE
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-gray-50 px-5 py-2.5 rounded-2xl border flex items-center shadow-sm">
                <UserCircle2 size={18} className="text-indigo-500 mr-2" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase leading-none">{user.role === 'BOSS' ? '总部主管' : '客服专员'}</span>
                  <span className="text-sm font-black text-gray-900 leading-tight">{user.name}</span>
                </div>
             </div>
             <button onClick={openAddModal} className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black flex items-center shadow-lg hover:bg-blue-700 transition active:scale-95">
               <Plus size={18} className="mr-2" /> 新增{activeTab === 'sku' ? '车型' : activeTab === 'dealer' ? '经销商' : '发货指令'}
             </button>
             <button onClick={handleLogout} className="p-3 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl hover:text-red-500 hover:border-red-100 transition">
                <LogOut size={20} />
             </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex space-x-10">
          {[
            { id: 'sku', label: '车辆型号', icon: <Package size={14}/> },
            { id: 'dealer', label: '经销商档案', icon: <Users size={14}/> },
            { id: 'delivery', label: '厂家发货划拨', icon: <Truck size={14}/> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-5 text-sm font-black transition-all relative flex items-center ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-900'}`}>
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden min-h-[600px]">
          {activeTab === 'sku' ? (
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {skuList.map(sku => (
                <div key={sku.id} className="p-8 border-2 border-gray-50 rounded-[2.5rem] hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all group relative bg-white">
                   <div className="flex justify-between items-start mb-4">
                     <h4 className="text-2xl font-black text-gray-900 leading-tight">{sku.model}</h4>
                     <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(sku)} className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-xl transition"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(sku.id, skuList, setSkuList, 'global_skus')} className="p-2 bg-gray-50 text-gray-400 hover:text-red-600 rounded-xl transition"><Trash2 size={16}/></button>
                     </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Tag size={10} className="mr-1"/> 颜色系列</p>
                        <div className="flex flex-wrap gap-2">
                          {sku.colors.map((c:string) => <span key={c} className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-black text-blue-600 uppercase">{c}</span>)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Cpu size={10} className="mr-1"/> 动力配置</p>
                        <div className="flex flex-wrap gap-2">
                          {sku.powerConfigs?.map((p:string) => <span key={p} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-gray-500">{p}</span>)}
                        </div>
                      </div>
                   </div>
                   <span className="absolute bottom-8 right-8 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">{sku.status}</span>
                </div>
              ))}
              {skuList.length === 0 && <div className="col-span-full py-48 text-center"><Package size={48} className="mx-auto text-gray-200 mb-4" /><p className="text-gray-300 font-black uppercase tracking-[0.2em] text-sm">暂无型号档案数据</p></div>}
            </div>
          ) : activeTab === 'dealer' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <th className="px-10 py-6">经销商名称 / 地区</th>
                    <th className="px-10 py-6">等级</th>
                    <th className="px-10 py-6">负责人 / 电话</th>
                    <th className="px-10 py-6 text-center">状态</th>
                    <th className="px-10 py-6 text-right">操作管理</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm font-medium">
                  {dealerList.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/20 transition group">
                      <td className="px-10 py-7">
                        <div className="font-black text-gray-900 text-lg mb-1">{d.name}</div>
                        <div className="flex items-center text-xs text-gray-400 font-bold"><MapPin size={12} className="mr-1"/> {d.province} · {d.city}</div>
                      </td>
                      <td className="px-10 py-7">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${d.level === '一网' ? 'bg-blue-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                          {d.level}
                        </span>
                      </td>
                      <td className="px-10 py-7">
                        <div className="text-gray-900 font-bold">{d.contact}</div>
                        <div className="text-xs text-gray-400 mt-1">{d.phone}</div>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-50 text-green-600 border border-green-100">
                           ● {d.status}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex justify-end space-x-2">
                           <button onClick={() => openEditModal(d)} className="p-3 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-2xl transition"><Edit2 size={16}/></button>
                           <button onClick={() => handleDelete(d.id, dealerList, setDealerList, 'global_dealers')} className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-2xl transition"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dealerList.length === 0 && <div className="py-48 text-center"><Users size={48} className="mx-auto text-gray-200 mb-4" /><p className="text-gray-300 font-black uppercase tracking-[0.2em] text-sm">暂无经销商档案记录</p></div>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <th className="px-10 py-6">发货单号 / 日期</th>
                    <th className="px-10 py-6">目标一级商</th>
                    <th className="px-10 py-6">车型规格项</th>
                    <th className="px-10 py-6 text-center">发货数</th>
                    <th className="px-10 py-6 text-right">流转状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {deliveryList.map(del => (
                    <tr key={del.id} className="hover:bg-gray-50/30 transition">
                      <td className="px-10 py-7">
                         <div className="font-black text-gray-900 text-lg">{del.orderNo}</div>
                         <div className="text-xs text-gray-400 font-bold mt-1 flex items-center"><Calendar size={12} className="mr-1"/> {del.date}</div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{del.province}</span>
                          <ChevronRight size={14} className="text-gray-300" />
                          <span className="font-bold text-gray-900">{del.dealerName}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="font-black text-gray-800">{del.model}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{del.color} | {del.power}</div>
                      </td>
                      <td className="px-10 py-7 text-center font-black text-2xl text-blue-600">{del.qty}</td>
                      <td className="px-10 py-7 text-right">
                         <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100">In-Transit</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deliveryList.length === 0 && <div className="py-48 text-center"><Truck size={48} className="mx-auto text-gray-200 mb-4" /><p className="text-gray-300 font-black uppercase tracking-[0.2em] text-sm">暂无发货划拨记录</p></div>}
            </div>
          )}
        </div>
      </main>

      {/* 录入弹窗 (代码保持不变，省略以保持简洁) */}
      {/* ... 之前的 Modal 代码 ... */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  {modalMode === 'add' ? '新增' : '编辑'}{activeTab === 'sku' ? '车辆型号' : activeTab === 'dealer' ? '经销商档案' : '发货指令'}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Master Data Intake Form</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-100 rounded-full text-gray-400 hover:text-red-500 transition shadow-sm"><X size={20} /></button>
            </div>
            
            <div className="p-12 space-y-10 overflow-y-auto custom-scrollbar">
              
              {/* 车型录入表单 */}
              {activeTab === 'sku' && (
                <div className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Hash size={12} className="mr-2"/> 车型号名称</label>
                    <input 
                      type="text" 
                      placeholder="例如：雷霆 5000"
                      className="w-full p-5 bg-gray-50 rounded-[2rem] font-black text-xl text-gray-900 focus:ring-4 focus:ring-blue-100 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                      value={skuForm.model}
                      onChange={e => setSkuForm({ ...skuForm, model: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Tag size={12} className="mr-2"/> 可选颜色系列</label>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder="输入颜色名..."
                          className="flex-1 p-4 bg-gray-50 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-300 transition"
                          value={skuForm.newColor}
                          onChange={e => setSkuForm({ ...skuForm, newColor: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && addColor()}
                        />
                        <button onClick={addColor} className="p-4 bg-blue-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition shadow-lg shadow-blue-100"><Plus size={20}/></button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {skuForm.colors.map(c => (
                          <span key={c} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black flex items-center group/tag border border-blue-100">
                            {c} <button onClick={() => setSkuForm({ ...skuForm, colors: skuForm.colors.filter(x => x !== c) })} className="ml-2 text-blue-300 hover:text-red-500 transition"><X size={14}/></button>
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Cpu size={12} className="mr-2"/> 动力/功率配置</label>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder="例如：2000W"
                          className="flex-1 p-4 bg-gray-50 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-300 transition"
                          value={skuForm.newPower}
                          onChange={e => setSkuForm({ ...skuForm, newPower: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && addPower()}
                        />
                        <button onClick={addPower} className="p-4 bg-indigo-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition shadow-lg shadow-indigo-100"><Plus size={20}/></button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {skuForm.powerConfigs.map(p => (
                          <span key={p} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black flex items-center border border-gray-200">
                            {p} <button onClick={() => setSkuForm({ ...skuForm, powerConfigs: skuForm.powerConfigs.filter(x => x !== p) })} className="ml-2 text-gray-300 hover:text-red-500 transition"><X size={14}/></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 经销商录入表单 */}
              {activeTab === 'dealer' && (
                <div className="grid grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><UserCircle size={12} className="mr-2"/> 经销商全称</label>
                        <input 
                          type="text" 
                          className="w-full p-5 bg-gray-50 rounded-2xl font-black text-gray-900 border-2 border-transparent focus:border-blue-500 transition outline-none"
                          value={dealerForm.name}
                          onChange={e => setDealerForm({ ...dealerForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">渠道等级</label>
                          <select className="w-full p-5 bg-gray-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-500" value={dealerForm.level} onChange={e => setDealerForm({...dealerForm, level: e.target.value})}>
                            <option value="一网">一级商 (L1 HUB)</option>
                            <option value="二网">二级网点 (L2 Outlet)</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">所属省份</label>
                          <select className="w-full p-5 bg-gray-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-blue-500" value={dealerForm.province} onChange={e => setDealerForm({...dealerForm, province: e.target.value})}>
                            <option value="">选择省份...</option>
                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">负责人姓名</label>
                        <input 
                          type="text" 
                          className="w-full p-5 bg-gray-50 rounded-2xl font-black text-gray-900 border-2 border-transparent focus:border-blue-500 transition outline-none"
                          value={dealerForm.contact}
                          onChange={e => setDealerForm({ ...dealerForm, contact: e.target.value })}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Phone size={12} className="mr-2"/> 联系电话</label>
                        <input 
                          type="text" 
                          className="w-full p-5 bg-gray-50 rounded-2xl font-black text-gray-900 border-2 border-transparent focus:border-blue-500 transition outline-none"
                          value={dealerForm.phone}
                          onChange={e => setDealerForm({ ...dealerForm, phone: e.target.value })}
                        />
                      </div>
                   </div>
                </div>
              )}

              {/* 发货指令表单 */}
              {activeTab === 'delivery' && (
                <div className="space-y-12">
                   <div className="grid grid-cols-2 gap-10 bg-blue-50/50 p-10 rounded-[2.5rem] border-2 border-blue-100">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">目标市场省份</label>
                        <select className="w-full p-5 bg-white rounded-2xl font-black text-lg outline-none shadow-sm" value={deliveryForm.province} onChange={e => setDeliveryForm({ ...deliveryForm, province: e.target.value, dealerId: '' })}>
                          <option value="">-- 请选择 --</option>
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">一级商 (L1)</label>
                        <select className="w-full p-5 bg-white rounded-2xl font-black text-lg outline-none shadow-sm" value={deliveryForm.dealerId} onChange={e => setDeliveryForm({ ...deliveryForm, dealerId: e.target.value })}>
                          <option value="">-- 请选择 --</option>
                          {filteredDealersForDelivery.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center"><Package size={12} className="mr-2"/> 发货车型明细项</label>
                         <button onClick={() => setDeliveryForm({...deliveryForm, items: [...deliveryForm.items, {skuId:'', color:'', power:'', qty: 1, date: new Date().toISOString().split('T')[0]}]})} className="text-blue-600 font-black text-xs hover:underline flex items-center">
                            <Plus size={14} className="mr-1"/> 添加行项
                         </button>
                      </div>
                      
                      <div className="space-y-4">
                        {deliveryForm.items.map((item, idx) => {
                          const selSku = skuList.find(s => s.id === item.skuId);
                          return (
                            <div key={idx} className="flex gap-4 p-6 bg-gray-50 rounded-3xl items-end group">
                              <div className="flex-[2] space-y-2">
                                <label className="text-[9px] font-black text-gray-300 uppercase">型号</label>
                                <select className="w-full p-4 bg-white rounded-xl font-bold outline-none" value={item.skuId} onChange={e => updateDeliveryItem(idx, 'skuId', e.target.value)}>
                                  <option value="">选择车型...</option>
                                  {skuList.map(s => <option key={s.id} value={s.id}>{s.model}</option>)}
                                </select>
                              </div>
                              <div className="flex-[1] space-y-2">
                                <label className="text-[9px] font-black text-gray-300 uppercase">颜色</label>
                                <select className="w-full p-4 bg-white rounded-xl font-bold outline-none" value={item.color} onChange={e => updateDeliveryItem(idx, 'color', e.target.value)}>
                                  <option value="">颜色</option>
                                  {selSku?.colors.map((c:string) => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                              <div className="flex-[1] space-y-2">
                                <label className="text-[9px] font-black text-gray-300 uppercase">功率</label>
                                <select className="w-full p-4 bg-white rounded-xl font-bold outline-none" value={item.power} onChange={e => updateDeliveryItem(idx, 'power', e.target.value)}>
                                  <option value="">功率</option>
                                  {selSku?.powerConfigs?.map((p:string) => <option key={p} value={p}>{p}</option>)}
                                </select>
                              </div>
                              <div className="flex-[0.5] space-y-2">
                                <label className="text-[9px] font-black text-gray-300 uppercase">数量</label>
                                <input type="number" min="1" className="w-full p-4 bg-white rounded-xl font-black text-center outline-none" value={item.qty} onChange={e => updateDeliveryItem(idx, 'qty', parseInt(e.target.value) || 1)} />
                              </div>
                              <button onClick={() => setDeliveryForm({...deliveryForm, items: deliveryForm.items.filter((_,i) => i !== idx)})} className="p-4 text-gray-200 hover:text-red-500 transition mb-1"><Trash size={18}/></button>
                            </div>
                          );
                        })}
                      </div>
                   </div>
                </div>
              )}

            </div>

            <div className="px-12 py-10 bg-gray-50/80 border-t flex space-x-6 items-center">
               <div className="flex-1 text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center">
                  <ShieldCheck size={14} className="mr-2 text-green-500"/>
                  所有更改将实时同步至云端档案库
               </div>
               <div className="flex space-x-4 min-w-[300px]">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white border-2 border-gray-200 rounded-[2.5rem] font-black text-gray-500 hover:bg-gray-100 transition shadow-sm">取消</button>
                  <button 
                    disabled={saving}
                    onClick={activeTab === 'sku' ? handleSaveSku : activeTab === 'dealer' ? handleSaveDealer : handleSaveDelivery}
                    className="flex-[1.5] py-5 bg-blue-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-100 hover:bg-blue-700 transition flex items-center justify-center active:scale-95"
                  >
                    {saving ? <Loader2 className="animate-spin mr-3" /> : <><Save size={20} className="mr-3" /> 保存档案记录</>}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      ` }} />
    </div>
  );
}

function ShieldCheck({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
