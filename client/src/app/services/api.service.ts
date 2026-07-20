import { Injectable } from '@angular/core';
import { Book, Verse } from '../interfaces';
import {
  BibleWorkerAction,
  BibleWorkerActions,
  BibleWorkerResponse,
  SearchRequest,
  SearchResult,
} from '../interfaces/bible-worker';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private booksRequests = new Map<string, Promise<Book[]>>();

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../app.worker', import.meta.url));
      this.worker.onmessage = ({ data }: MessageEvent<BibleWorkerResponse>) => {
        const pending = this.pendingRequests.get(data.id);
        if (pending) {
          this.pendingRequests.delete(data.id);
          if (data.success) {
            pending.resolve(data.data);
          } else {
            pending.reject(new Error(data.error));
          }
        }
      };
    } else {
      console.error('Web Workers are not supported in this environment!');
    }
  }

  private runInWorker<Action extends BibleWorkerAction>(
    type: Action,
    payload: BibleWorkerActions[Action]['payload'],
  ): Promise<BibleWorkerActions[Action]['result']> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Web Worker is not initialized'));
        return;
      }
      const id = crypto.randomUUID();
      this.pendingRequests.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.worker.postMessage({ id, type, payload });
    });
  }

  search(params: SearchRequest): Promise<SearchResult> {
    return this.runInWorker('SEARCH', params);
  }

  getBooks(translation: string): Promise<Book[]> {
    const normalizedTranslation = translation.toUpperCase();
    const existing = this.booksRequests.get(normalizedTranslation);
    if (existing) return existing;

    const request = this.runInWorker('GET_BOOKS', { translation: normalizedTranslation });
    this.booksRequests.set(normalizedTranslation, request);
    return request;
  }

  getVerses(translation: string, bookUsfm: string, chapter: number | string): Promise<Verse[]> {
    return this.runInWorker('GET_VERSES', {
      translation,
      bookUsfm,
      chapter: Number(chapter),
    });
  }
}

export type SearchReqParams = SearchRequest;
export type SearchResponse = SearchResult;
