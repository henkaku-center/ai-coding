/**
 * BookRepository
 */

import { BaseRepository } from './base/BaseRepository.js';
import { Book } from '../models/BookPromotion.js';

export class BookRepository extends BaseRepository<Book> {
  protected dirName = 'books';
  private readonly filename = 'books.json';

  async saveAll(books: Book[]): Promise<void> {
    await this.save(this.filename, books);
  }

  async loadAll(): Promise<Book[] | null> {
    const data = await this.load(this.filename);
    return data as Book[] | null;
  }

  async add(book: Book): Promise<void> {
    const books = (await this.loadAll()) || [];
    books.push(book);
    await this.saveAll(books);
  }

  async findById(id: string): Promise<Book | null> {
    const books = await this.loadAll();
    if (!books) {
      return null;
    }
    return books.find((book) => book.id === id) || null;
  }

  async findByKeyword(keyword: string): Promise<Book[]> {
    const books = await this.loadAll();
    if (!books) {
      return [];
    }
    return books.filter((book) => book.keywords.some((kw) => kw.includes(keyword)));
  }

  async deleteById(id: string): Promise<boolean> {
    const books = await this.loadAll();
    if (!books) {
      return false;
    }
    const filtered = books.filter((book) => book.id !== id);
    if (filtered.length === books.length) {
      return false; // 削除対象が見つからなかった
    }
    await this.saveAll(filtered);
    return true;
  }
}
