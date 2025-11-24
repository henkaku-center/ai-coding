/**
 * NewsRepository
 */

import { format } from 'date-fns';
import { BaseRepository } from './base/BaseRepository.js';
import { News } from '../models/News.js';

export class NewsRepository extends BaseRepository<News> {
  protected dirName = 'news';

  async saveByDate(date: Date, news: News[]): Promise<void> {
    const filename = `${format(date, 'yyyy-MM-dd')}.json`;
    await this.save(filename, news);
  }

  async loadByDate(date: Date): Promise<News[] | null> {
    const filename = `${format(date, 'yyyy-MM-dd')}.json`;
    const data = await this.load(filename);
    return data as News[] | null;
  }

  async loadLatest(): Promise<News[] | null> {
    return this.loadByDate(new Date());
  }
}
