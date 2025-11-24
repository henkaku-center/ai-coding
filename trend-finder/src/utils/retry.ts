/**
 * リトライ処理ユーティリティ
 */

import { logger } from './logger.js';
import { sleep } from './delay.js';

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i);
      logger.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
}
