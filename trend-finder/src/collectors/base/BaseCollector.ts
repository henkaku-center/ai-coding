/**
 * BaseCollector 抽象基底クラス
 */

import { logger } from '../../utils/logger.js';
import { retryWithBackoff } from '../../utils/retry.js';
import { sleep } from '../../utils/delay.js';
import { Trend } from '../../models/Trend.js';

export abstract class BaseCollector<T = Trend> {
  protected abstract sourceName: string;
  protected abstract minInterval: number; // ミリ秒

  abstract collect(): Promise<T[]>;

  async collectWithRetry(maxRetries: number = 3): Promise<T[]> {
    logger.info(`Starting collection from ${this.sourceName}`);
    try {
      const result = await retryWithBackoff(
        () => this.collect(),
        maxRetries,
        this.minInterval
      );
      logger.info(`Successfully collected ${result.length} items from ${this.sourceName}`);
      return result;
    } catch (error) {
      logger.error(`Failed to collect from ${this.sourceName} after ${maxRetries} retries`, error);
      throw error;
    }
  }

  protected async delay(): Promise<void> {
    await sleep(this.minInterval);
  }

  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    logger[level](`[${this.sourceName}] ${message}`);
  }
}
