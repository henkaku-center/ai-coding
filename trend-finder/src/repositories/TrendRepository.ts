/**
 * TrendRepository
 */

import { format } from 'date-fns';
import { BaseRepository } from './base/BaseRepository.js';
import { Trend } from '../models/Trend.js';

export class TrendRepository extends BaseRepository<Trend> {
  protected dirName = 'trends';

  async saveByDate(date: Date, trends: Trend[]): Promise<void> {
    const filename = `${format(date, 'yyyy-MM-dd')}.json`;
    await this.save(filename, trends);
  }

  async loadByDate(date: Date): Promise<Trend[] | null> {
    const filename = `${format(date, 'yyyy-MM-dd')}.json`;
    const data = await this.load(filename);
    return data as Trend[] | null;
  }

  async loadLatest(): Promise<Trend[] | null> {
    return this.loadByDate(new Date());
  }
}
