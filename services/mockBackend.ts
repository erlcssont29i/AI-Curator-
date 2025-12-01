import { v4 as uuidv4 } from 'uuid';
import { Article, ArticleStatus, AppConfig, LogEntry, Report, ReportStatus } from '../types';
import { MOCK_ARTICLES_POOL, DEFAULT_CONFIG } from '../constants';
import { scoreArticle, generateWeeklyReport } from './geminiService';

// --- Local Storage Keys ---
const STORE_KEY_CONFIG = 'ac_config_v2';
const STORE_KEY_ARTICLES = 'ac_articles_v2';
const STORE_KEY_LOGS = 'ac_logs_v2';
const STORE_KEY_REPORTS = 'ac_reports_v2';

// --- Helpers ---
const loadFromStorage = <T>(key: string, defaultVal: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultVal;
};

const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const BackendService = {
  getConfig: (): AppConfig => {
    return loadFromStorage<AppConfig>(STORE_KEY_CONFIG, DEFAULT_CONFIG);
  },

  saveConfig: (config: AppConfig) => {
    saveToStorage(STORE_KEY_CONFIG, config);
  },

  getLogs: (): LogEntry[] => {
    return loadFromStorage<LogEntry[]>(STORE_KEY_LOGS, []);
  },

  addLog: (message: string, type: 'info' | 'success' | 'error' | 'warning') => {
    const logs = loadFromStorage<LogEntry[]>(STORE_KEY_LOGS, []);
    const newLog = { id: uuidv4(), timestamp: new Date().toISOString(), message, type };
    saveToStorage(STORE_KEY_LOGS, [newLog, ...logs].slice(0, 100));
  },

  getArticles: (): Article[] => {
    return loadFromStorage<Article[]>(STORE_KEY_ARTICLES, []);
  },

  triggerCollection: async (): Promise<number> => {
    BackendService.addLog('開始採集任務 (Phase 1)...', 'info');
    
    await new Promise(r => setTimeout(r, 1000));

    const newArticles: Article[] = MOCK_ARTICLES_POOL.sort(() => 0.5 - Math.random()).slice(0, 3).map(mock => ({
      id: uuidv4(),
      title: mock.title,
      url: `https://example.com/article/${Math.floor(Math.random() * 1000)}`,
      content: mock.content,
      source: mock.source,
      collectedAt: new Date().toISOString(),
      status: ArticleStatus.RAW
    }));

    const currentArticles = BackendService.getArticles();
    const updatedArticles = [...newArticles, ...currentArticles];
    
    saveToStorage(STORE_KEY_ARTICLES, updatedArticles);
    BackendService.addLog(`採集完成，新增 ${newArticles.length} 篇文章`, 'success');
    return newArticles.length;
  },

  triggerAIProcessing: async (): Promise<void> => {
    const config = BackendService.getConfig();
    const articles = BackendService.getArticles();
    const rawArticles = articles.filter(a => a.status === ArticleStatus.RAW);

    if (rawArticles.length === 0) {
      BackendService.addLog('沒有待處理的原始文章', 'warning');
      return;
    }

    BackendService.addLog(`開始 AI 智能篩選，共 ${rawArticles.length} 篇 (Phase 2)...`, 'info');

    const processedArticles = [...articles];

    for (const article of rawArticles) {
        // Use Mock Score mostly to avoid API cost in demo, but interface supports real call
        // const assessment = await scoreArticle(article, config.categories);
        
        // Mocking logic for speed in demo
        const mockScore = Math.floor(Math.random() * 3) + 3; // 3 to 5
        const mockCategory = config.categories[Math.floor(Math.random() * config.categories.length)];

        const index = processedArticles.findIndex(a => a.id === article.id);
        if (index !== -1) {
            processedArticles[index] = {
                ...processedArticles[index],
                aiScore: mockScore,
                aiCategory: mockCategory,
                aiReasoning: "根據內容相關性分析判定",
                status: ArticleStatus.SCORED
            };
        }
    }

    BackendService.addLog(`執行閾值篩選 (>= ${config.scoreThreshold} 分)...`, 'info');
    let acceptedCount = 0;
    
    processedArticles.forEach((article, idx) => {
        if (article.status === ArticleStatus.SCORED) {
             if ((article.aiScore || 0) >= config.scoreThreshold) {
                 processedArticles[idx].status = ArticleStatus.SELECTED;
                 acceptedCount++;
             } else {
                 processedArticles[idx].status = ArticleStatus.ARCHIVED;
             }
        }
    });

    // Quota Balancing Logic (Mock)
    if (acceptedCount < 3) {
         BackendService.addLog('符合閾值文章不足，啟動智能配額平衡機制...', 'warning');
         const archived = processedArticles.filter(a => a.status === ArticleStatus.ARCHIVED).sort((a,b) => (b.aiScore || 0) - (a.aiScore || 0));
         if(archived.length > 0) {
             const rescued = archived[0];
             const index = processedArticles.findIndex(a => a.id === rescued.id);
             processedArticles[index].status = ArticleStatus.SELECTED;
             BackendService.addLog(`智能補足：收錄 "${rescued.title}" 以滿足配額`, 'success');
         }
    }

    saveToStorage(STORE_KEY_ARTICLES, processedArticles);
    BackendService.addLog('AI 處理與篩選完成', 'success');
  },

  triggerReportGeneration: async (): Promise<Report | null> => {
    const articles = BackendService.getArticles();
    const selectedArticles = articles.filter(a => a.status === ArticleStatus.SELECTED);
    const config = BackendService.getConfig();

    if (selectedArticles.length === 0) {
      BackendService.addLog('無法生成週報：沒有「已選定」的文章', 'error');
      return null;
    }

    BackendService.addLog(`正在生成週報摘要，包含 ${selectedArticles.length} 篇文章...`, 'info');

    // Call Real/Mock Gemini
    // const markdown = await generateWeeklyReport(selectedArticles, config.promptTemplate);
    const markdown = `# AI 週報 #${Math.floor(Math.random() * 100)}\n\n本週精選 ${selectedArticles.length} 篇關於 AI 的重要進展。\n\n` + selectedArticles.map(a => `### ${a.title}\n- **來源**: ${a.source}\n- **摘要**: ${a.content.substring(0, 50)}...`).join('\n\n');

    const newReport: Report = {
      id: uuidv4(),
      generatedAt: new Date().toISOString(),
      title: `AI 週報 #${Math.floor(Math.random() * 100) + 40}`,
      markdownContent: markdown,
      status: ReportStatus.PENDING_REVIEW,
      includedArticleIds: selectedArticles.map(a => a.id),
      tags: ['AI技術', '產業應用']
    };

    const reports = loadFromStorage<Report[]>(STORE_KEY_REPORTS, []);
    saveToStorage(STORE_KEY_REPORTS, [newReport, ...reports]);
    
    BackendService.addLog('週報草稿生成完畢，等待審核', 'success');
    return newReport;
  },

  getReports: (): Report[] => {
    // Initial Seed
    const saved = loadFromStorage<Report[]>(STORE_KEY_REPORTS, []);
    if (saved.length === 0) {
        const seed = [
            { id: '1', generatedAt: '2024-11-29', title: 'AI 週報 #41', markdownContent: '', status: ReportStatus.PUBLISHED, includedArticleIds: ['1','2'], tags: ['AI技術', '政策法規'] },
            { id: '2', generatedAt: '2024-11-22', title: 'AI 週報 #40', markdownContent: '', status: ReportStatus.PUBLISHED, includedArticleIds: ['3','4'], tags: ['市場趨勢'] },
        ];
        saveToStorage(STORE_KEY_REPORTS, seed);
        return seed as Report[];
    }
    return saved;
  },

  publishReport: async (reportId: string, finalContent: string): Promise<void> => {
    BackendService.addLog(`正在發布週報 ${reportId} 至 Substack...`, 'info');
    await new Promise(r => setTimeout(r, 1500));

    const reports = loadFromStorage<Report[]>(STORE_KEY_REPORTS, []);
    const updatedReports = reports.map(r => {
      if (r.id === reportId) {
        return { ...r, markdownContent: finalContent, status: ReportStatus.PUBLISHED };
      }
      return r;
    });
    
    saveToStorage(STORE_KEY_REPORTS, updatedReports);
    BackendService.addLog('週報發布成功！', 'success');
  }
};