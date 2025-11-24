/**
 * コレクター関連の型定義
 */

import { Trend } from '../models/Trend.js';

export interface CollectorResult<T> {
  data: T[];
  success: boolean;
  error?: Error;
  timestamp: Date;
}

export interface CollectorPlugin {
  name: string;
  collect(): Promise<Trend[]>;
}

export type DataSource = 'twitter' | 'news' | 'calendar';
