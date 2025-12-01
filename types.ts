export enum ArticleStatus {
  RAW = 'RAW',
  SCORED = 'SCORED',
  SELECTED = 'SELECTED',
  ARCHIVED = 'ARCHIVED'
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED'
}

export interface Article {
  id: string;
  title: string;
  url: string;
  content: string;
  source: string;
  collectedAt: string;
  status: ArticleStatus;
  
  // Phase 2 AI Data
  aiScore?: number;
  aiCategory?: string;
  aiReasoning?: string;
}

export interface Report {
  id: string;
  generatedAt: string;
  title: string;
  markdownContent: string;
  status: ReportStatus;
  includedArticleIds: string[];
  tags?: string[]; // New for display tags
}

export interface AppConfig {
  // Tab 1: Inputs
  targetUrls: string;
  keywords: string;
  
  // Tab 2: Schedule
  scheduleFrequency: 'weekly' | 'daily';
  scheduleDay: string; // 'Monday', etc.
  scheduleHour: string;
  scheduleMinute: string;

  // Tab 3: Scoring
  scoreThreshold: number;
  categories: string[];

  // Tab 4: Quotas
  categoryQuotas: Record<string, number>;

  // Tab 5: Output
  promptTemplate: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}