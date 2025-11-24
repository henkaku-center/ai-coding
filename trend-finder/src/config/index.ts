/**
 * 設定ファイル
 */

import { Config } from '../types/config.js';

export const config: Config = {
  collectors: {
    twitter: {
      enabled: true,
      interval: 3600000, // 1時間
      apiKey: process.env.TWITTER_API_KEY,
    },
    news: {
      enabled: true,
      interval: 21600000, // 6時間
      sources: ['yahoo', 'hatena'],
    },
    calendar: {
      enabled: true,
      interval: 604800000, // 1週間
    },
  },
  analyzers: {
    scoreWeights: {
      mention: 0.4,
      velocity: 0.4,
      freshness: 0.2,
    },
    risingThreshold: 2.0, // 前日比200%
  },
  storage: {
    type: 'json',
    path: process.env.DATA_PATH || './data',
  },
  logging: {
    level: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  },
};

export * from './categories.js';
export * from './sources.js';
