import React, { useEffect, useState } from 'react';
import { Settings, Clock, FileText, Send, Edit, ExternalLink, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { BackendService } from '../services/mockBackend';
import { Report, ReportStatus, Article } from '../types';

interface DashboardProps {
    onNavigateToAdmin: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToAdmin }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = BackendService.getReports();
    setReports(data);
    // Find first pending, or just the most recent one
    const pending = data.find(r => r.status === ReportStatus.PENDING_REVIEW);
    // If no pending, show the latest published
    const latest = pending || data[0] || null;
    setLatestReport(latest);
  }, []);

  const handlePublish = async () => {
      if (!latestReport) return;
      setLoading(true);
      await BackendService.publishReport(latestReport.id, latestReport.markdownContent);
      setReports(BackendService.getReports());
      setLatestReport(prev => prev ? {...prev, status: ReportStatus.PUBLISHED} : null);
      setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                <FileText size={20} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">AI 週報系統</h1>
                <p className="text-xs text-slate-500 mt-0.5">智能內容採集與發布平台</p>
            </div>
          </div>
          <button 
            onClick={onNavigateToAdmin}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Settings size={16} />
            <span>管理後台</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        {/* Left Column: History */}
        <div className="col-span-12 md:col-span-4 space-y-6">
            <div className="flex items-center space-x-2 text-slate-800 mb-2">
                <Clock size={20} />
                <h2 className="text-xl font-bold">歷史週報</h2>
                <span className="text-xs text-slate-500 ml-auto">已發布的週報記錄</span>
            </div>

            <div className="space-y-4">
                {reports.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                        無歷史記錄
                    </div>
                )}
                {reports.map(report => (
                    <div 
                        key={report.id} 
                        onClick={() => setLatestReport(report)}
                        className={`bg-white p-5 rounded-xl border transition-all cursor-pointer group relative ${
                            latestReport?.id === report.id ? 'border-blue-500 shadow-md ring-1 ring-blue-100' : 'border-gray-200 hover:shadow-md hover:border-blue-300'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-bold transition-colors ${latestReport?.id === report.id ? 'text-blue-600' : 'text-slate-900'}`}>
                                {report.title}
                            </h3>
                            {report.status === ReportStatus.PUBLISHED && <CheckCircle size={16} className="text-green-500" />}
                            {report.status === ReportStatus.PENDING_REVIEW && <AlertCircle size={16} className="text-yellow-500" />}
                        </div>
                        <div className="text-xs text-slate-500 mb-4 font-mono">{new Date(report.generatedAt).toLocaleDateString()}</div>
                        <div className="flex items-center justify-between">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-slate-600">
                                {report.includedArticleIds.length} 篇
                            </span>
                            <ExternalLink size={16} className="text-gray-300 group-hover:text-gray-500" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Column: Latest Content */}
        <div className="col-span-12 md:col-span-8 space-y-6">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <FileText size={20} />
                    <h2 className="text-xl font-bold">最新文章</h2>
                </div>
                {latestReport?.status === ReportStatus.PENDING_REVIEW ? (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">待審核</span>
                ) : (
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">已發布</span>
                )}
             </div>

             {latestReport ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{latestReport.title}</h1>
                                <p className="text-slate-500 font-mono">{new Date(latestReport.generatedAt).toISOString().split('T')[0]}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-sm font-bold shadow-sm">
                                    {latestReport.includedArticleIds.length} 篇文章
                                </span>
                            </div>
                        </div>

                        {latestReport.tags && (
                            <div className="flex gap-2 mb-6">
                                {latestReport.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="text-slate-600 leading-relaxed mb-8">
                            本週精選 {latestReport.includedArticleIds.length} 篇 AI 領域重要文章...
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 flex items-center justify-center space-x-2 bg-white border border-gray-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                                <Edit size={18} />
                                <span>預覽 / 編輯</span>
                            </button>
                            {latestReport.status === ReportStatus.PENDING_REVIEW && (
                                <button 
                                    onClick={handlePublish}
                                    disabled={loading}
                                    className="flex-[2] flex items-center justify-center space-x-2 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>發布到 Substack</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
             ) : (
                 <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                     目前沒有可用的週報，請至管理後台生成。
                 </div>
             )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;