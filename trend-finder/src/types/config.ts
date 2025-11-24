/**
 * 設定関連の型定義
 */

export interface CollectorConfig {
  enabled: boolean;
  interval: number; // ミリ秒
  apiKey?: string;
  sources?: string[];
}

export interface AnalyzerConfig {
  scoreWeights: {
    mention: number;
    velocity: number;
    freshness: number;
  };
  risingThreshold: number;
}

export interface StorageConfig {
  type: 'json' | 'sqlite';
  path: string;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  file: string;
}

export interface Config {
  collectors: {
    twitter: CollectorConfig;
    news: CollectorConfig;
    calendar: CollectorConfig;
  };
  analyzers: AnalyzerConfig;
  storage: StorageConfig;
  logging: LoggingConfig;
}
