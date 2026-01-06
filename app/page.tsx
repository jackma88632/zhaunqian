
"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Truck, Package, 
  ClipboardCheck, BarChart3, Scan, ArrowRight,
  Database, ShieldCheck
} from 'lucide-react';

export default function Home() {
  const routes = [
    { 
      title: '厂家决策看板', 
      desc: '实时穿透全国库存，查看省份下钻数据与销量趋势', 
      icon: <LayoutDashboard className="w-8 h-8" />, 
      href: '/dashboard', 
      color: 'bg-blue-600',
      badge: '领导专供'
    },
    { 
      title: '一网业务后台', 
      desc: '管理在途发货单，并将库存通过 FIFO 划拨给二网经销商', 
      icon: <Truck className="w-8 h-8" />, 
      href: '/l1/transfers', 
      color: 'bg-indigo-600',
      badge: '大经销商'
    },
    { 
      title: '二网销量报数', 
      desc: '模拟二网经销商通过手机免登录 Token 上报今日实销', 
      icon: <Scan className="w-8 h-8" />, 
      href: '/report/demo-token', 
      color: 'bg-emerald-600',
      badge: '免登录'
    },
    { 
      title: '系统档案管理', 
      desc: '维护 SKU、经销商分级架构及用户权限', 
      icon: <Users className="w-8 h-8" />, 
      href: '/admin/records', 
      color: 'bg-gray-800',
      badge: '系统管理'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Hero Section */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Package size={20} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 italic">E-TRIKE <span className="text-blue-600">CMS</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm font-semibold text-gray-500">
            <span className="flex items-center text-green-600"><Database size={14} className="mr-1" /> FIFO 引擎就绪</span>
            <span className="flex items-center"><ShieldCheck size={14} className="mr-1" /> 多级权限已启用</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              让每一台车的流向 <br />
              <span className="text-blue-600">清晰可见</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              国内领先的电动三轮车 B2B 实时补货系统。
              基于 FIFO 算法自动核算各级仓库，杜绝人为库存造假。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {routes.map((r, i) => (
              <Link 
                key={r.href} 
                to={r.href}
                className="group relative bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-blue-100 shadow-xl shadow-gray-200/50 transition-all duration-300 hover:-translate-y-2"
              >
                {r.badge && (
                  <span className="absolute top-6 right-6 px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {r.badge}
                  </span>
                )}
                <div className={`w-16 h-16 ${r.color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-${r.color.split('-')[1]}-200 transition-transform group-hover:rotate-6 duration-500`}>
                  {r.icon}
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3 flex items-center">
                  {r.title}
                  <ArrowRight className="ml-2 w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  {r.desc}
                </p>
              </Link>
            ))}
          </div>

          {/* Workflow Summary */}
          <div className="mt-20 bg-blue-600 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-6 flex items-center">
                  <ClipboardCheck className="mr-3 w-10 h-10" /> 核心业务流程
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start group">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black mr-4 group-hover:bg-white group-hover:text-blue-600 transition">1</div>
                    <div>
                      <h4 className="font-bold text-lg">厂家发货</h4>
                      <p className="text-blue-100 text-sm">工厂生产后直接按批次发往一级经销商库房。</p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black mr-4 group-hover:bg-white group-hover:text-blue-600 transition">2</div>
                    <div>
                      <h4 className="font-bold text-lg">下级转货</h4>
                      <p className="text-blue-100 text-sm">一网经销商通过 FIFO 自动分摊，将货权划转至二级网点。</p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black mr-4 group-hover:bg-white group-hover:text-blue-600 transition">3</div>
                    <div>
                      <h4 className="font-bold text-lg">终端实销</h4>
                      <p className="text-blue-100 text-sm">二网每日通过扫码上报，系统自动扣减库存并推送到老板看板。</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 w-full md:w-80">
                <BarChart3 className="w-12 h-12 mb-4" />
                <p className="font-bold text-xl mb-2">实时数据汇总</p>
                <p className="text-blue-100 text-sm leading-relaxed">
                  消除传统周报/月报带来的库存滞后。每一台三轮车的生命周期都在系统闭环内。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 text-center text-gray-400 text-sm font-medium">
        <p>© 2024 电动三轮车智慧渠道管理平台 · 工业级 MVP</p>
      </footer>
    </div>
  );
}
