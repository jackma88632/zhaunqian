
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Send, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

const DEMO_SKUS = [
  { id: 'sku-1', model: '雷霆 3000', color: '亮红色', powerConfig: '60V/2000W' },
  { id: 'sku-2', model: '闪电 500', color: '珠光蓝', powerConfig: '48V/1000W' },
  { id: 'sku-3', model: '巨力 1000', color: '哑光黑', powerConfig: '72V/3000W' },
];

const DEMO_DEALER = {
  name: '测试演示二网店',
  province: '模拟大区'
};

export default function L2ReportPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dealer, setDealer] = useState<any>(null);
  const [skus, setSkus] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const [formData, setFormData] = useState({
    skuId: '',
    qty: 1,
    soldDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function fetchInfo() {
      try {
        if (!token || token === 'demo-token') throw new Error('Demo mode');
        const res = await fetch(`/api/report/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid token');
        setDealer(data.dealer);
        setSkus(data.skus);
      } catch (err: any) {
        console.log("Token invalid or demo mode, using sample data for L2 Report");
        setDealer(DEMO_DEALER);
        setSkus(DEMO_SKUS);
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      setSubmitting(true);
      setTimeout(() => {
        setSuccess(true);
        setSubmitting(false);
      }, 800);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/report/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md w-full border-2 border-green-50">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">上报成功</h1>
        <p className="text-gray-500 mb-8 font-medium">销售数据已实时同步。系统已根据 FIFO 自动扣减您的库存批次。</p>
        <button 
          onClick={() => setSuccess(false)}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition"
        >
          继续上报下一笔
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      <header className="bg-white border-b px-6 py-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">终端实销上报</h1>
            <div className="flex items-center text-blue-600 text-sm font-bold mt-1">
              <Package size={14} className="mr-1" /> {dealer?.name}
            </div>
          </div>
          <div className="bg-gray-100 p-3 rounded-2xl">
            <Scan size={24} className="text-gray-400" />
          </div>
        </div>
      </header>

      {isDemo && (
        <div className="max-w-md mx-auto mt-4 px-4">
          <div className="bg-blue-600 text-white p-4 rounded-2xl flex items-center shadow-lg shadow-blue-100">
            <Info size={18} className="mr-3 flex-shrink-0" />
            <p className="text-xs font-bold leading-relaxed">演示模式：此为免登录上报页面。在实际业务中，二网经销商只需扫描厂家发放的专属二维码即可进入。</p>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto mt-6 px-4">
        <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">1. 选择车型 (SKU)</label>
              <select 
                required
                className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
                value={formData.skuId}
                onChange={e => setFormData({ ...formData, skuId: e.target.value })}
              >
                <option value="">点击选择成交型号...</option>
                {skus.map(s => (
                  <option key={s.id} value={s.id}>{s.model} - {s.color || ''}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">2. 数量</label>
                <div className="relative">
                  <input 
                    type="number"
                    required
                    min="1"
                    className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-black text-xl text-center"
                    value={formData.qty}
                    onChange={e => setFormData({ ...formData, qty: parseInt(e.target.value) || 1 })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs pointer-events-none">台</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">3. 日期</label>
                <input 
                  type="date"
                  required
                  className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  value={formData.soldDate}
                  onChange={e => setFormData({ ...formData, soldDate: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center">
                <AlertCircle className="w-5 h-5 mr-3" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-lg flex items-center justify-center shadow-2xl shadow-blue-200 active:scale-[0.97] transition-all"
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>
                <Send className="w-5 h-5 mr-3" /> 确认上报数据
              </>}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-gray-300">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">E-Trike Intelligent Supply Chain</p>
          <p className="text-xs font-medium">数据将直接同步至厂家 FIFO 库存结算系统</p>
        </div>
      </main>
    </div>
  );
}

// Simple internal icon for scan
function Scan({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}
