/**
 * CalendarCollector
 * 記念日・イベント情報を収集
 */

import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { BaseCollector } from './base/BaseCollector.js';
import { Event } from '../models/Event.js';

export class CalendarCollector extends BaseCollector<Event> {
  protected sourceName = 'Calendar Events';
  protected minInterval = 1000;

  // 年間の主要な記念日データ（サンプル）
  private readonly annualEvents: Omit<Event, 'id'>[] = [
    {
      name: '元日',
      description: '新年の始まり',
      date: '01-01',
      category: 'lifestyle',
      isRecurring: true,
    },
    {
      name: 'バレンタインデー',
      description: '愛の日',
      date: '02-14',
      category: 'lifestyle',
      isRecurring: true,
    },
    {
      name: 'ホワイトデー',
      description: 'バレンタインのお返しの日',
      date: '03-14',
      category: 'lifestyle',
      isRecurring: true,
    },
    {
      name: 'エイプリルフール',
      description: '嘘をついても許される日',
      date: '04-01',
      category: 'entertainment',
      isRecurring: true,
    },
    {
      name: 'こどもの日',
      description: '子供の健やかな成長を祝う日',
      date: '05-05',
      category: 'lifestyle',
      isRecurring: true,
    },
    {
      name: '七夕',
      description: '織姫と彦星が会う日',
      date: '07-07',
      category: 'lifestyle',
      isRecurring: true,
    },
    {
      name: 'ハロウィン',
      description: '仮装を楽しむ日',
      date: '10-31',
      category: 'entertainment',
      isRecurring: true,
    },
    {
      name: 'クリスマス',
      description: 'イエス・キリストの誕生を祝う日',
      date: '12-25',
      category: 'lifestyle',
      isRecurring: true,
    },
    {
      name: '大晦日',
      description: '年の最後の日',
      date: '12-31',
      category: 'lifestyle',
      isRecurring: true,
    },
    // 技術系
    {
      name: 'プログラマーの日',
      description: '年の256日目を祝う日（9月13日）',
      date: '09-13',
      category: 'technology',
      isRecurring: true,
    },
    // ビジネス系
    {
      name: 'ブラックフライデー',
      description: '11月第4金曜日の翌日（感謝祭の翌日）',
      date: '11-24',
      category: 'business',
      isRecurring: true,
    },
    {
      name: 'サイバーマンデー',
      description: 'ブラックフライデーの次の月曜日',
      date: '11-27',
      category: 'business',
      isRecurring: true,
    },
  ];

  async collect(): Promise<Event[]> {
    this.log('Collecting calendar events...');
    await this.delay();

    const currentYear = new Date().getFullYear();
    const events: Event[] = [];

    // 今年と来年のイベントを生成
    for (const event of this.annualEvents) {
      // 今年のイベント
      events.push({
        ...event,
        id: uuidv4(),
        date: `${currentYear}-${event.date}`,
      });

      // 来年のイベント
      events.push({
        ...event,
        id: uuidv4(),
        date: `${currentYear + 1}-${event.date}`,
      });
    }

    // 今日の日付に近いイベントを優先的に返す
    const today = format(new Date(), 'yyyy-MM-dd');
    const sortedEvents = events.sort((a, b) => {
      const diffA = Math.abs(new Date(a.date).getTime() - new Date(today).getTime());
      const diffB = Math.abs(new Date(b.date).getTime() - new Date(today).getTime());
      return diffA - diffB;
    });

    this.log(`Collected ${sortedEvents.length} calendar events`);
    return sortedEvents;
  }

  /**
   * 特定の日付のイベントを取得
   */
  async getEventsForDate(date: Date): Promise<Event[]> {
    const allEvents = await this.collect();
    const targetDate = format(date, 'yyyy-MM-dd');
    return allEvents.filter((event) => event.date === targetDate);
  }

  /**
   * 今後N日間のイベントを取得
   */
  async getUpcomingEvents(days: number = 30): Promise<Event[]> {
    const allEvents = await this.collect();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return allEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= futureDate;
    });
  }
}
