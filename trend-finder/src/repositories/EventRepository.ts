/**
 * EventRepository
 */

import { BaseRepository } from './base/BaseRepository.js';
import { Event } from '../models/Event.js';

export class EventRepository extends BaseRepository<Event> {
  protected dirName = 'events';
  private readonly filename = 'calendar.json';

  async saveAll(events: Event[]): Promise<void> {
    await this.save(this.filename, events);
  }

  async loadAll(): Promise<Event[] | null> {
    const data = await this.load(this.filename);
    return data as Event[] | null;
  }

  async findByDate(date: string): Promise<Event[]> {
    const events = await this.loadAll();
    if (!events) {
      return [];
    }
    return events.filter((event) => event.date === date);
  }
}
