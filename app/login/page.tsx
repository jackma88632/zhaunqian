
"use client";

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, User, Package, ArrowRight, Loader2, AlertCircle, Headphones } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'BOSS' // BOSS, PROVINCE_MGR, CUSTOMER_SERVICE, DEALER_L1
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 模拟身份验证逻辑
    setTimeout(() => {
      let mockUser = null;

      // 演示账号规则更新：
      // 老板：admin / 123456
      // 省理：sd_manager / 123456
      // 客服：cs_staff / 123456  <-- 新增
      // 经销商：l1_test / 123456
      
      if (formData.username === 'admin' && formData.password === '123456') {
        mockUser = { id: 'u-001', name: '总办管理员', role: 'BOSS', scope: 'NATION' };
      } else if (formData.username === 'sd_manager' && formData.password === '123456') {
        mockUser = { id: 'u-002', name: '山东省区经理', role: 'PROVINCE_MGR', scope: '山东' };
      } else if (formData.username === 'cs_staff' && formData.password === '123456') {
        mockUser = { id: 'u-003', name: '总部客服专员', role: 'CUSTOMER_SERVICE', scope: 'NATION' };
      } else if (formData.username === 'l1_test' && formData.password === '123456') {
        mockUser = { id: 'd-1', name: '华诚商贸(一网)', role: 'DEALER_L1', scope: '山东', dealerId: 'd-1' };
      }

      if (mockUser) {
        sessionStorage.setItem('auth_user', JSON.stringify(mockUser));
        // 根据角色引导到不同入口
        if (mockUser.role === 'DEALER_L1') {
          navigate('/l1/transfers');
        } else if (mockUser.role === 'CUSTOMER_SERVICE') {
          navigate('/admin/records'); // 客服直达档案管理
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('账号或密码错误，请检查输入的身份和凭据。');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* 装饰背景 */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 mx-auto mb-5 rotate-3 transition hover:rotate-0 duration-500">
            <Package size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">E-TRIKE <span className="text-blue-600">CMS</span></h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">智能渠道与库存调度系统</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                <ShieldCheck size={12} className="mr-2 text-blue-500" /> 请选择您的业务角色
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'BOSS', label: '总部管理' },
                  { id: 'PROVINCE_MGR', label: '省经理' },
                  { id: 'CUSTOMER_SERVICE', label: '客服档案' },
                  { id: 'DEALER_L1', label: '经销商' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData({...formData, role: r.id})}
                    className={`py-3.5 rounded-2xl text-xs font-black transition-all border-2 ${
                      formData.role === r.id 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                      : 'bg-gray-50 text-gray-400 border-gray-50 hover:border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  required
                  placeholder="请输入账号"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-900 transition-all"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="password"
                  required
                  placeholder="请输入密码"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-900 transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center animate-shake">
                <AlertCircle size={14} className="mr-2" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center group active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>
                验证并进入系统 <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition" />
              </>}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest leading-loose">
          厂家专属后台 · 访问受限 · 加密传输<br/>
          © 2024 E-Trike Enterprise Supply Chain
        </p>
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
