import React, { useState, useEffect } from 'react';
import { 
    LayoutGrid, Calendar, Sliders, PieChart, FileCode, History, Database, 
    Save, Plus, Trash2, Play, ChevronDown, Check, X, Search, ExternalLink, ArrowLeft, Zap, Clock 
} from 'lucide-react';
import { BackendService } from '../services/mockBackend';
import { AppConfig, LogEntry, Article, ArticleStatus } from '../types';

interface AdminPanelProps {
    onNavigateToHome: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateToHome }) => {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setConfig(BackendService.getConfig());
    setArticles(BackendService.getArticles());
    setLogs(BackendService.getLogs());

    // Poll logs
    const interval = setInterval(() => {
        setLogs(BackendService.getLogs());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    if (config) {
      setSaveStatus('saving');
      BackendService.saveConfig(config);
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 800);
    }
  };

  const handleManualCollect = async () => {
    setLoading(true);
    await BackendService.triggerCollection();
    setArticles(BackendService.getArticles());
    setLoading(false);
  };

  // Helper for input changes
  const updateConfig = (key: keyof AppConfig, value: any) => {
    if (config) setConfig({ ...config, [key]: value });
  };

  if (!config) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;

  const tabs = [
    { id: 'config', label: '採集配置', icon: LayoutGrid },
    { id: 'schedule', label: '排程設定', icon: Calendar },
    { id: 'scoring', label: '打分設定', icon: Sliders },
    { id: 'quota', label: '配額設定', icon: PieChart },
    { id: 'format', label: '格式設定', icon: FileCode },
    { id: 'logs', label: '採集日誌', icon: History },
    { id: 'articles', label: '文章列表', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <h1 className="text-xl font-bold text-slate-900">內容採集管理系統</h1>
             <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center">
                <Zap size={12} className="mr-1 text-green-500 fill-green-500"/>
                系統運行中
             </span>
          </div>
          <button 
            onClick={onNavigateToHome}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>返回前台</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mb-8 overflow-x-auto pb-2 scrollbar-hide bg-slate-100 p-1 rounded-xl w-fit">
            {tabs.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            active 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        <Icon size={16} className={active ? 'text-slate-900' : 'text-slate-400'} />
                        <span>{tab.label}</span>
                    </button>
                )
            })}
        </div>

        {/* --- TAB CONTENT START --- */}
        <div className="animate-in fade-in duration-300">
            
            {/* TAB 1: CONFIG */}
            {activeTab === 'config' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1.1 Fixed URL */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                                <ExternalLink size={20} className="text-slate-400" />
                                <h2 className="text-lg font-bold">1.1 固定網址配置</h2>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">設定需要強制採集的 RSS 訂閱源或網站 URL</p>
                            <textarea 
                                value={config.targetUrls}
                                onChange={e => updateConfig('targetUrls', e.target.value)}
                                className="w-full h-32 p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none resize-none mb-4"
                                placeholder="https://example.com/rss"
                            />
                            <div className="flex space-x-3">
                                <button className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    <Plus size={16} /> <span>新增網址</span>
                                </button>
                                <button onClick={handleSave} className="flex items-center space-x-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 ml-auto">
                                    {saveStatus === 'saved' ? <Check size={16} /> : <Save size={16} />} 
                                    <span>{saveStatus === 'saved' ? '已保存' : '保存配置'}</span>
                                </button>
                            </div>
                        </div>

                        {/* 1.2 Keywords */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                                <Search size={20} className="text-slate-400" />
                                <h2 className="text-lg font-bold">1.2 關鍵字配置</h2>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">設定用於搜尋相關文章的關鍵字與擴充詞彙</p>
                            <textarea 
                                value={config.keywords}
                                onChange={e => updateConfig('keywords', e.target.value)}
                                className="w-full h-32 p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none resize-none mb-4"
                                placeholder="AI, Machine Learning..."
                            />
                            <div className="flex space-x-3">
                                <button className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    <Plus size={16} /> <span>新增關鍵字</span>
                                </button>
                                <button onClick={handleSave} className="flex items-center space-x-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 ml-auto">
                                    {saveStatus === 'saved' ? <Check size={16} /> : <Save size={16} />} 
                                    <span>{saveStatus === 'saved' ? '已保存' : '保存配置'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Manual Trigger */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                            <Play size={20} className="text-slate-400" />
                            <h2 className="text-lg font-bold">手動立即採集</h2>
                            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">Phase 1</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">點擊按鈕立即執行一次採集任務，用於測試配置</p>
                        <button 
                            onClick={handleManualCollect}
                            disabled={loading}
                            className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 disabled:opacity-70 transition-all"
                        >
                            {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Play size={18} fill="currentColor" />}
                            <span>{loading ? '正在採集...' : '開始手動採集'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 2: SCHEDULE */}
            {activeTab === 'schedule' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-4xl">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold mb-1 flex items-center">
                                <Calendar className="mr-2" size={20}/> 發送排程設定
                            </h2>
                            <p className="text-slate-500 text-sm">設定自動採集的執行頻率與時間</p>
                        </div>
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">Phase 1</span>
                     </div>

                     <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">執行頻率</label>
                            <div className="relative">
                                <select 
                                    value={config.scheduleFrequency}
                                    onChange={e => updateConfig('scheduleFrequency', e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-slate-900 outline-none"
                                >
                                    <option value="weekly">每週</option>
                                    <option value="daily">每天</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">星期</label>
                            <div className="relative">
                                <select 
                                    value={config.scheduleDay}
                                    onChange={e => updateConfig('scheduleDay', e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-slate-900 outline-none"
                                    disabled={config.scheduleFrequency === 'daily'}
                                >
                                    <option value="Monday">星期一</option>
                                    <option value="Friday">星期五</option>
                                    <option value="Sunday">星期日</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">執行時間 - 小時</label>
                            <div className="relative">
                                <select 
                                    value={config.scheduleHour}
                                    onChange={e => updateConfig('scheduleHour', e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-slate-900 outline-none"
                                >
                                    {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => (
                                        <option key={h} value={h}>{h} 時</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">執行時間 - 分鐘</label>
                            <div className="relative">
                                <select 
                                    value={config.scheduleMinute}
                                    onChange={e => updateConfig('scheduleMinute', e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-slate-900 outline-none"
                                >
                                    <option value="00">00 分</option>
                                    <option value="30">30 分</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                     </div>

                     <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center text-slate-600 text-sm mb-8">
                        <Clock size={16} className="mr-2 text-slate-400" />
                        下次執行時間：{config.scheduleFrequency === 'weekly' ? `每週${config.scheduleDay === 'Friday' ? '五' : config.scheduleDay}` : '每天'} {config.scheduleHour}:{config.scheduleMinute}
                     </div>

                     <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                        保存排程設定
                     </button>
                </div>
            )}

            {/* TAB 3: SCORING */}
            {activeTab === 'scoring' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold mb-1">相關性分數閾值</h2>
                                <p className="text-slate-500 text-sm">設定文章相關性的最低分數 (1-5 分)</p>
                            </div>
                            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">Phase 2</span>
                        </div>
                        
                        <div className="mb-12 px-2">
                             <div className="flex justify-between mb-4 text-xs font-medium text-slate-400 uppercase">
                                <span>1 (低)</span>
                                <span>5 (高)</span>
                             </div>
                             <input 
                                type="range" 
                                min="1" max="5" step="1"
                                value={config.scoreThreshold}
                                onChange={e => updateConfig('scoreThreshold', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                            />
                            <div className="mt-6 flex justify-center">
                                <span className="text-4xl font-bold text-slate-900">{config.scoreThreshold} 分</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border border-slate-100">
                            僅保留評分 ≥ {config.scoreThreshold} 分的文章進入下一階段篩選
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold mb-1">文章類別設定</h2>
                                <p className="text-slate-500 text-sm">設定 AI 評估時使用的文章分類</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            {config.categories.map(cat => (
                                <div key={cat} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-slate-300 transition-colors group">
                                    <span className="font-medium">{cat}</span>
                                    <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex space-x-2">
                            <input 
                                type="text" 
                                placeholder="新增類別名稱"
                                className="flex-1 p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900"
                            />
                            <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                                <Plus size={20} className="text-slate-600" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                        <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                            保存打分設定
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 4: QUOTA */}
            {activeTab === 'quota' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-4xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold mb-1 flex items-center">
                                <PieChart className="mr-2" size={20}/> 類別配額設定
                            </h2>
                            <p className="text-slate-500 text-sm">設定每個類別的最低文章數量，系統會智能平衡補足</p>
                        </div>
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">Phase 2</span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-10">
                        {Object.entries(config.categoryQuotas).map(([cat, val]) => (
                            <div key={cat} className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <label className="font-bold text-slate-700">{cat}</label>
                                <div className="flex items-center space-x-3">
                                    <input 
                                        type="number"
                                        min="0"
                                        value={val}
                                        onChange={e => {
                                            const newQuotas = {...config.categoryQuotas, [cat]: parseInt(e.target.value)};
                                            setConfig({...config, categoryQuotas: newQuotas});
                                        }}
                                        className="w-20 p-2 text-center border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900 outline-none"
                                    />
                                    <span className="text-sm text-slate-400">篇 / 期</span>
                                </div>
                            </div>
                        ))}
                     </div>

                     <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                        <h3 className="font-bold text-blue-900 mb-2 text-sm">智能平衡說明</h3>
                        <p className="text-blue-700 text-sm leading-relaxed">
                            如果某類別高分文章不足配額，系統會從該類別的低分文章中智能選擇補足，確保內容多樣性。
                        </p>
                     </div>

                     <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                         <div className="text-slate-500 text-sm">
                             每期總計最低文章數量：
                             <span className="font-bold text-slate-900 ml-2 text-lg">
                                 {Object.values(config.categoryQuotas).reduce((a: number, b: number) => a+b, 0)} 篇
                             </span>
                         </div>
                         <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                            保存配額設定
                         </button>
                     </div>
                </div>
            )}

            {/* TAB 5: FORMAT */}
            {activeTab === 'format' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold mb-1 flex items-center">
                                <FileCode className="mr-2" size={20}/> 內容產製格式設定
                            </h2>
                            <p className="text-slate-500 text-sm">客製化 AI 生成摘要的 Markdown Prompt 模板</p>
                        </div>
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">Phase 2</span>
                     </div>

                     <div className="mb-6">
                        <div className="bg-slate-900 text-slate-400 text-xs px-4 py-2 rounded-t-xl border-b border-slate-700 font-mono">
                            Prompt 模板
                        </div>
                        <textarea 
                            value={config.promptTemplate}
                            onChange={e => updateConfig('promptTemplate', e.target.value)}
                            className="w-full h-96 p-6 bg-slate-50 border border-gray-200 rounded-b-xl font-mono text-sm focus:ring-2 focus:ring-slate-900 outline-none leading-relaxed text-slate-700"
                        />
                     </div>

                     <div className="flex justify-end">
                        <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                            保存格式設定
                        </button>
                     </div>
                </div>
            )}

            {/* TAB 6: LOGS */}
            {activeTab === 'logs' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold mb-1 flex items-center">
                                <History className="mr-2" size={20}/> 採集日誌
                            </h2>
                            <p className="text-slate-500 text-sm">查看採集任務的執行記錄與結果</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        {logs.length === 0 && <div className="text-center text-slate-400 py-10">暫無日誌記錄</div>}
                        {logs.map(log => (
                            <div key={log.id} className="flex items-start p-4 border border-gray-100 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                                <div className="mr-4 mt-0.5">
                                    {log.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
                                    {log.type === 'info' && <div className="w-5 h-5 rounded-full border-2 border-blue-500 text-blue-500 flex items-center justify-center text-[10px] font-bold">i</div>}
                                    {log.type === 'warning' && <AlertCircle className="text-yellow-500" size={20} />}
                                    {log.type === 'error' && <X className="text-red-500" size={20} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-sm font-bold uppercase tracking-wider ${
                                            log.type === 'success' ? 'text-green-700' :
                                            log.type === 'error' ? 'text-red-700' :
                                            log.type === 'warning' ? 'text-yellow-700' : 'text-slate-700'
                                        }`}>
                                            {log.type === 'info' ? '系統通知' : 
                                             log.type === 'success' ? '執行成功' :
                                             log.type === 'warning' ? '注意' : '錯誤'}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm">{log.message}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {/* TAB 7: ARTICLES */}
            {activeTab === 'articles' && (
                <div className="bg-white p-0 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold mb-1 flex items-center">
                                    <Database className="mr-2" size={20}/> 原始採集文章列表
                                </h2>
                                <p className="text-slate-500 text-sm">查看所有已採集的待評估文章</p>
                            </div>
                         </div>
                         
                         <div className="flex space-x-4">
                             <div className="relative flex-1">
                                 <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                 <input 
                                    type="text" 
                                    placeholder="搜尋標題或來源..." 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
                                 />
                             </div>
                             <select className="px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none text-slate-600">
                                 <option>全部類別</option>
                                 {config.categories.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                             <select className="px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none text-slate-600">
                                 <option>全部分數</option>
                                 <option value="5">5 分</option>
                                 <option value="4">4 分</option>
                             </select>
                         </div>
                    </div>

                     <div className="divide-y divide-gray-100">
                        {articles.length === 0 && <div className="text-center py-12 text-slate-400">尚無採集文章</div>}
                        {articles.map(article => (
                            <div key={article.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                        {article.title}
                                    </h3>
                                    <a href={article.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600">
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-slate-500 mb-4">
                                    <span className="font-semibold text-slate-700">{article.source}</span>
                                    <span>•</span>
                                    <span className="font-mono">{new Date(article.collectedAt).toLocaleString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    {article.aiCategory && (
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">
                                            {article.aiCategory}
                                        </span>
                                    )}
                                    {article.aiScore && (
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                            article.aiScore >= 4 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {article.aiScore} 分
                                        </span>
                                    )}
                                    {article.status === ArticleStatus.SELECTED && (
                                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold ml-auto">
                                            已選定
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}

        </div>
        {/* --- TAB CONTENT END --- */}

      </main>
    </div>
  );
};

// Helper components not exported
function CheckCircle({size, className}: any) { return <div className={className}><Check size={size}/></div> }
function AlertCircle({size, className}: any) { return <div className={className}>!</div> }

export default AdminPanel;