/**
 * BaseRepository 抽象基底クラス
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/index.js';

export abstract class BaseRepository<T> {
  protected abstract dirName: string;

  protected getDataPath(): string {
    return path.join(config.storage.path, this.dirName);
  }

  protected getFilePath(filename: string): string {
    return path.join(this.getDataPath(), filename);
  }

  async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.getDataPath(), { recursive: true });
    } catch (error) {
      logger.error(`Failed to create directory: ${this.getDataPath()}`, error);
      throw error;
    }
  }

  async save(filename: string, data: T | T[]): Promise<void> {
    try {
      await this.ensureDirectoryExists();
      const filePath = this.getFilePath(filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      logger.info(`Saved data to ${filePath}`);
    } catch (error) {
      logger.error(`Failed to save data to ${filename}`, error);
      throw error;
    }
  }

  async load(filename: string): Promise<T | T[] | null> {
    try {
      const filePath = this.getFilePath(filename);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T | T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn(`File not found: ${filename}`);
        return null;
      }
      logger.error(`Failed to load data from ${filename}`, error);
      throw error;
    }
  }

  async delete(filename: string): Promise<void> {
    try {
      const filePath = this.getFilePath(filename);
      await fs.unlink(filePath);
      logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn(`File not found for deletion: ${filename}`);
        return;
      }
      logger.error(`Failed to delete file: ${filename}`, error);
      throw error;
    }
  }

  async exists(filename: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
