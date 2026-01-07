
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Package, Plus, Search, Filter, 
  Edit2, Trash2, CheckCircle2, 
  ArrowLeft, Info, Loader2, X, Save,
  Truck, ArrowRightLeft, Calendar, Hash, MapPin, ChevronDown, Trash, ChevronRight, AlertTriangle, Tag, Cpu,
  Settings, UserCircle, MoreVertical, Phone, LogOut, UserCircle2, ShoppingCart, CreditCard, ClipboardList, Map, ShieldCheck,
  Send, Zap, CheckCircle, ListPlus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const INITIAL_SKUS = [
  { id: 'sku-1', model: '雷霆 3000', colors: ['亮红色', '珠光蓝', '金属灰'], powerConfigs: ['1200W', '1500W', '2000W'], status: '在售' },
  { id: 'sku-2', model: '闪电 500', colors: ['军绿色', '灰色', '消光黑'], powerConfigs: ['800W', '1000W'], status: '在售' },
];

const INITIAL_DEALERS = [
  { id: 'd-1', name: '山东华诚商贸有限公司', level: '一网', province: '山东', city: '济南', contact: '张经理', phone: '138****8888', status: '正常' },
];

const INITIAL_ORDERS = [
  { 
    id: 'ord-1', 
    orderNo: 'ORD20240520001', 
    customerName: '山东区域预配单', 
    phone: '13800001111', 
    province: '山东',
    address: '山东省济南市',
    items: [
      { model: '雷霆 3000', color: '亮红色', power: '2000W', qty: 20 },
      { model: '闪电 500', color: '消光黑', power: '1000W', qty: 15 }
    ],
    status: '待核对', 
    date: '2024-05-20'
  }
];

export default function AdminRecordsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'delivery' | 'sku' | 'dealer'>('orders');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [skuList, setSkuList] = useState<any[]>([]);
  const [dealerList, setDealerList] = useState<any[]>([]);
  const [orderList, setOrderList] = useState<any[]>([]);
  const [deliveryList, setDeliveryList] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 表单状态
  const [orderForm, setOrderForm] = useState({ 
    customerName: '', phone: '', address: '', province: '山东', 
    items: [{ model: '雷霆 3000', color: '亮红色', power: '2000W', qty: 1 }],
    status: '待核对', date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    const authStr = sessionStorage.getItem('auth_user');
    if (!authStr) { navigate('/login'); return; }
    setUser(JSON.parse(authStr));

    // 从 LocalStorage 加载数据流
    const sSkus = JSON.parse(localStorage.getItem('global_skus') || JSON.stringify(INITIAL_SKUS));
    const sDealers = JSON.parse(localStorage.getItem('global_dealers') || JSON.stringify(INITIAL_DEALERS));
    const sOrders = JSON.parse(localStorage.getItem('global_orders') || JSON.stringify(INITIAL_ORDERS));
    const sDeliveries = JSON.parse(localStorage.getItem('global_deliveries') || '[]');

    setSkuList(sSkus);
    setDealerList(sDealers);
    setOrderList(sOrders);
    setDeliveryList(sDeliveries);
    setLoading(false);
  }, []);

  // --- 关键修复：发货处理逻辑 ---
  const handleFinalVerifyAndDispatch = (order: any) => {
    if (order.status === '已下达发货') return;

    if (!window.confirm(`【确认厂家资产划拨指令】\n\n订单号：${order.orderNo}\n客户：${order.customerName}\n发往省份：${order.province}\n\n执行后将从厂家库房扣减，资产实时划入对应省份渠道。是否继续？`)) {
      return;
    }

    setSaving(true);

    setTimeout(() => {
      try {
        const timestamp = Date.now();
        const orderItems = Array.isArray(order.items) ? order.items : [];
        
        // 1. 构造发货流水 (看板的核心数据源)
        const newShipments = orderItems.map((item: any, idx: number) => ({
          id: `SHIP-${timestamp}-${idx}`,
          orderNo: `ALLOC-${order.orderNo}-${idx + 1}`,
          dealerName: `厂家下拨: ${order.customerName}`,
          province: order.province || '山东', // 确保 province 字段存在，否则看板无法统计
          model: item.model || '标准车型',
          color: item.color || '默认',
          power: item.power || '标准',
          qty: Number(item.qty) || 0, // 强制数值化
          date: new Date().toISOString().split('T')[0],
          status: '已划拨',
          isDirect: true
        }));

        // 2. 更新订单列表状态
        const nextOrders = orderList.map(o => o.id === order.id ? { ...o, status: '已下达发货' } : o);
        setOrderList(nextOrders);
        localStorage.setItem('global_orders', JSON.stringify(nextOrders));

        // 3. 更新划拨看板列表 (使用函数式更新防止状态丢失)
        setDeliveryList(prev => {
          const updated = [...newShipments, ...prev];
          localStorage.setItem('global_deliveries', JSON.stringify(updated));
          return updated;
        });

        alert("✅ 发货指令成功下达！货权已同步至全国运营看板。");
        setActiveTab('delivery'); // 自动跳转到看板标签页查看
      } catch (err) {
        console.error("Dispatch Error:", err);
        alert("操作过程中出现异常，请检查数据完整性。");
      } finally {
        setSaving(false);
      }
    }, 600);
  };

  const openModal = (mode: 'add' | 'edit', item?: any) => {
    setModalMode(mode);
    setCurrentId(item?.id || null);
    if (activeTab === 'orders') {
      setOrderForm(item ? JSON.parse(JSON.stringify(item)) : { 
        customerName: '', phone: '', address: '', province: '山东', 
        items: [{ model: '雷霆 3000', color: '亮红色', power: '2000W', qty: 1 }],
        status: '待核对', date: new Date().toISOString().split('T')[0] 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (activeTab === 'orders' && !orderForm.customerName) { alert("客户姓名/单位必填"); return; }
    setSaving(true);
    setTimeout(() => {
      let upOrders = [...orderList];
      if (modalMode === 'add') {
        const newOrd = { id: `ord-${Date.now()}`, orderNo: `ORD${Date.now().toString().slice(-6)}`, ...orderForm };
        upOrders = [newOrd, ...upOrders];
      } else {
        upOrders = upOrders.map(o => o.id === currentId ? { ...o, ...orderForm } : o);
      }
      setOrderList(upOrders);
      localStorage.setItem('global_orders', JSON.stringify(upOrders));
      setSaving(false);
      setIsModalOpen(false);
    }, 300);
  };

  const addOrderItem = () => setOrderForm({ ...orderForm, items: [...orderForm.items, { model: '雷霆 3000', color: '亮红色', power: '2000W', qty: 1 }] });
  
  const updateOrderItem = (idx: number, f: string, v: any) => {
    const ni = [...orderForm.items];
    ni[idx] = { ...ni[idx], [f]: v };
    setOrderForm({ ...orderForm, items: ni });
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-3 hover:bg-gray-100 rounded-2xl transition text-gray-400"><ArrowLeft size={20} /></Link>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none italic uppercase">Supply <span className="text-blue-600">Chain</span></h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center">
                <ShieldCheck size={12} className="mr-1 text-blue-500"/> 厂家订单管理中心
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-gray-50 px-5 py-2.5 rounded-2xl border flex items-center shadow-sm">
                <UserCircle2 size={18} className="text-indigo-500 mr-2" />
                <span className="text-sm font-black text-gray-900">{user.name}</span>
             </div>
             <button onClick={() => openModal('add')} className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black flex items-center shadow-lg hover:bg-blue-700 transition active:scale-95">
               <Plus size={18} className="mr-2" /> 录入新订单
             </button>
             <button onClick={() => { sessionStorage.removeItem('auth_user'); navigate('/login'); }} className="p-3 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 transition shadow-sm">
                <LogOut size={20} />
             </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex space-x-8">
          {[
            { id: 'orders', label: '待核对订单', icon: <ClipboardList size={14}/> },
            { id: 'delivery', label: '划拨流转看板', icon: <Truck size={14}/> },
            { id: 'sku', label: '车型型号库', icon: <Package size={14}/> },
            { id: 'dealer', label: '经销商档案', icon: <Users size={14}/> },
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
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <th className="px-10 py-6">订单号</th>
                    <th className="px-10 py-6">收货人信息</th>
                    <th className="px-10 py-6">车型配置</th>
                    <th className="px-10 py-6 text-center">状态</th>
                    <th className="px-10 py-6 text-right">核对指令</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm font-medium">
                  {orderList.map(ord => (
                    <tr key={ord.id} className="hover:bg-indigo-50/10 transition group">
                      <td className="px-10 py-7">
                        <div className="font-black text-gray-900 text-base uppercase">{ord.orderNo}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase italic tracking-wider">{ord.date}</div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="font-black text-gray-900 text-lg leading-none mb-1">{ord.customerName}</div>
                        <div className="text-xs text-gray-400 font-bold flex items-center">
                          <MapPin size={10} className="mr-1 text-blue-500" /> {ord.province} · {ord.phone}
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex flex-col space-y-1.5">
                           {ord.items?.map((item: any, idx: number) => (
                             <div key={idx} className="flex items-center text-[11px] font-black">
                               <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded mr-2 border border-indigo-100">{item.model}</div>
                               <span className="text-gray-400">{item.color} | <span className="text-gray-900">x{item.qty}</span></span>
                             </div>
                           ))}
                        </div>
                      </td>
                      <td className="px-10 py-7 text-center">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                           ord.status === '已下达发货' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                         }`}>
                           {ord.status}
                         </span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex justify-end space-x-2">
                           {ord.status !== '已下达发货' && (
                             <button 
                               onClick={() => handleFinalVerifyAndDispatch(ord)} 
                               disabled={saving}
                               className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center shadow-lg hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50"
                             >
                               {saving ? <Loader2 size={12} className="animate-spin mr-2" /> : <Send size={12} className="mr-2" />}
                               核对无误并发货
                             </button>
                           )}
                           <button onClick={() => openModal('edit', ord)} className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-2xl transition border shadow-sm"><Edit2 size={16}/></button>
                           <button onClick={() => { if(confirm("确定删除记录？")) { const up = orderList.filter(o => o.id !== ord.id); setOrderList(up); localStorage.setItem('global_orders', JSON.stringify(up)); }}} className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 rounded-2xl transition border shadow-sm"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'delivery' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                      <th className="px-10 py-6">划拨号</th>
                      <th className="px-10 py-6">资产流向</th>
                      <th className="px-10 py-6">规格规格</th>
                      <th className="px-10 py-6 text-center">台数</th>
                      <th className="px-10 py-6 text-right">资产状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm font-medium">
                    {deliveryList.map(del => (
                      <tr key={del.id} className="hover:bg-gray-50/20 transition group">
                        <td className="px-10 py-7 font-black text-gray-900 uppercase tracking-tighter text-xs">{del.orderNo}</td>
                        <td className="px-10 py-7">
                           <div className="flex items-center text-gray-900 font-black text-base italic"><Zap size={14} className="text-orange-500 mr-2" /><span>{del.dealerName}</span></div>
                           <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase italic tracking-wider flex items-center"><MapPin size={10} className="mr-1 text-blue-400" /> {del.province} 区域资产划拨</div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="font-black text-gray-800 text-xs flex items-center uppercase italic"><Package size={12} className="mr-1.5 text-blue-400" /> {del.model} | {del.color}</div>
                        </td>
                        <td className="px-10 py-7 text-center font-black text-2xl text-blue-600 tabular-nums">{del.qty}</td>
                        <td className="px-10 py-7 text-right">
                           <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-end w-fit ml-auto border-2 border-white">
                             <CheckCircle size={10} className="mr-1.5" /> 已入库
                           </span>
                        </td>
                      </tr>
                    ))}
                    {deliveryList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-10 py-20 text-center text-gray-300 font-black uppercase italic tracking-widest">
                          暂无划拨流水记录，请在“待核对订单”中执行发货
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          )}

          {/* SKU 和 Dealer 标签页逻辑保持一致 */}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-10 py-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-2xl font-black text-gray-900 italic">录入订单资产清单</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-red-500 transition border shadow-sm border-gray-100"><X size={20} /></button>
            </div>
            
            <div className="p-10 overflow-y-auto custom-scrollbar flex-1 bg-white">
                <div className="space-y-10">
                   <div className="grid grid-cols-2 gap-8 p-8 bg-gray-50 rounded-[2.5rem] border shadow-inner">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">客户/经销商名称</label>
                        <input type="text" className="w-full p-5 bg-white rounded-2xl font-black text-gray-900 border-none shadow-sm outline-none" value={orderForm.customerName} onChange={e => setOrderForm({ ...orderForm, customerName: e.target.value })} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">目标省份</label>
                        <select className="w-full p-5 bg-white rounded-2xl font-black text-gray-900 border-none shadow-sm outline-none" value={orderForm.province} onChange={e => setOrderForm({ ...orderForm, province: e.target.value })}>
                          {['山东', '河南', '江苏', '浙江', '安徽', '湖北', '河北', '四川'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                        <h4 className="text-xl font-black text-gray-900 flex items-center uppercase italic">车型清单</h4>
                        <button onClick={addOrderItem} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl text-[11px] font-black border border-indigo-100 flex items-center"><Plus size={14} className="mr-2" /> 增行</button>
                      </div>
                      <div className="space-y-4">
                        {orderForm.items?.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-5 p-8 bg-white border-2 border-gray-50 rounded-[2.5rem] items-end relative shadow-sm hover:border-blue-100 transition">
                            <div className="col-span-5 space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase italic">型号</label>
                              <select className="w-full p-4 bg-gray-50 rounded-2xl font-black outline-none border-none" value={item.model} onChange={e => updateOrderItem(idx, 'model', e.target.value)}>
                                {skuList.map(s => <option key={s.id} value={s.model}>{s.model}</option>)}
                              </select>
                            </div>
                            <div className="col-span-4 space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase italic">颜色</label>
                              <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl font-black text-sm outline-none border-none" value={item.color} onChange={e => updateOrderItem(idx, 'color', e.target.value)} />
                            </div>
                            <div className="col-span-3 space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase italic">数量</label>
                              <input type="number" min="1" className="w-full p-4 bg-gray-50 rounded-2xl font-black text-center text-indigo-600 outline-none border-none" value={item.qty} onChange={e => updateOrderItem(idx, 'qty', parseInt(e.target.value) || 1)} />
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
            </div>

            <div className="px-12 py-10 bg-gray-50 border-t flex space-x-6 items-center">
               <div className="flex-1 text-gray-400 text-[10px] font-black uppercase tracking-widest italic flex items-center"><ShieldCheck size={14} className="mr-2 text-green-500"/> Authenticated Secure Processing</div>
               <div className="flex space-x-4 min-w-[320px]">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white border-2 rounded-[2rem] font-black text-gray-500">取消</button>
                  <button onClick={handleSave} className="flex-[2] py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-xl hover:bg-blue-700 transition flex items-center justify-center active:scale-95 disabled:opacity-50">{saving ? <Loader2 className="animate-spin mr-3" /> : <><Save size={20} className="mr-3" /> 保存核准单</>}</button>
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
