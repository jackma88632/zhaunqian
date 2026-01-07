
"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, Package, ArrowRight, Loader2, AlertCircle, Zap, CheckCircle2, MapPin } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // 测试账号配置 - 包含所有核心业务角色
  const TEST_ACCOUNTS = [
    { label: '总部老板', user: 'admin', pass: '123456', role: 'BOSS', desc: '全国权限 / 战略看板', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '省区经理', user: 'sd_manager', pass: '123456', role: 'PROVINCE_MGR', desc: '省份穿透 / 区域动销', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '客服人员', user: 'cs_staff', pass: '123456', role: 'CUSTOMER_SERVICE', desc: '订单核对 / 厂家发货', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: '一网经销商', user: 'l1_test', pass: '123456', role: 'DEALER_L1', desc: '库存划拨 / 下级监控', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const quickFill = (acc: typeof TEST_ACCOUNTS[0]) => {
    setFormData({ username: acc.user, password: acc.pass });
    setError(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 模拟身份验证逻辑
    setTimeout(() => {
      let mockUser = null;
      const { username, password } = formData;

      if (password !== '123456') {
        setError('密码错误，请尝试 123456');
        setLoading(false);
        return;
      }

      // 角色自动匹配引擎
      if (username === 'admin') {
        mockUser = { id: 'u-001', name: '总办管理员', role: 'BOSS', scope: 'NATION' };
      } else if (username === 'sd_manager') {
        mockUser = { id: 'u-002', name: '山东省经理', role: 'PROVINCE_MGR', scope: '山东' };
      } else if (username === 'cs_staff') {
        mockUser = { id: 'u-003', name: '总部客服专员', role: 'CUSTOMER_SERVICE', scope: 'NATION' };
      } else if (username === 'l1_test') {
        mockUser = { id: 'd-1', name: '华诚商贸(一网)', role: 'DEALER_L1', scope: '山东', dealerId: 'd-1' };
      }

      if (mockUser) {
        sessionStorage.setItem('auth_user', JSON.stringify(mockUser));
        
        // 路由分流
        if (mockUser.role === 'DEALER_L1') {
          navigate('/l1/transfers');
        } else if (mockUser.role === 'CUSTOMER_SERVICE') {
          navigate('/admin/records');
        } else {
          // BOSS 和 PROVINCE_MGR 均进入看板
          navigate('/dashboard');
        }
      } else {
        setError('账号不匹配，请点击左侧卡片快速登录。');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* 左侧：增强型快捷登录面板 */}
        <div className="hidden md:block space-y-6">
          <h2 className="text-3xl font-black text-gray-900 leading-tight italic uppercase">
            Quick <span className="text-blue-600">Access</span>
          </h2>
          <p className="text-gray-400 font-bold text-sm">选择业务身份一键秒进：</p>
          <div className="grid grid-cols-1 gap-4">
            {TEST_ACCOUNTS.map(acc => (
              <button
                key={acc.user}
                onClick={() => quickFill(acc)}
                className="w-full p-5 bg-white border-2 border-transparent hover:border-blue-500 rounded-[1.8rem] text-left transition-all shadow-xl shadow-gray-200/40 group active:scale-95"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-gray-900 group-hover:text-blue-600 transition flex items-center">
                    {acc.label}
                    {acc.role === 'PROVINCE_MGR' && <MapPin size={14} className="ml-2 text-emerald-500" />}
                  </span>
                  <span className={`text-[9px] font-black ${acc.bg} ${acc.color} px-2 py-0.5 rounded uppercase tracking-widest`}>{acc.role}</span>
                </div>
                <div className="text-[11px] text-gray-400 font-medium">UID: {acc.user} · {acc.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 右侧：登录框 */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-gray-100 p-10 md:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-200 mx-auto mb-6">
              <Package size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 italic uppercase">E-Trike <span className="text-blue-600">Hub</span></h1>
            <p className="text-[10px] text-gray-400 font-black mt-2 tracking-[0.3em] uppercase">Enterprise Resource Gateway</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  required
                  placeholder="用户名 / 手机号"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-inner"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="password"
                  required
                  placeholder="登录密码"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-inner"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black flex items-center animate-shake border border-red-100">
                <AlertCircle size={14} className="mr-2" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center group active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>
                确认登录 <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition" />
              </>}
            </button>
          </form>

          <div className="mt-10 flex justify-center">
             <div className="px-4 py-2 bg-gray-50 rounded-full flex items-center">
                <ShieldCheck size={12} className="text-green-500 mr-2" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure AES-256 Link</span>
             </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
}
