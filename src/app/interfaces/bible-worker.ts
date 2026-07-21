import { Book, Verse } from './index';
import type { TranslationLoadingEvent } from '../services/app-event-bus.service';

export interface SearchRequest {
  query: string;
  canon?: 'nt' | 'ot';
  books?: string;
  translations?: string;
  sort?: 'relevance' | 'chronological';
}

export interface SearchResult {
  count: number;
  verses: Verse[];
}

export interface BibleWorkerActions {
  GET_BOOKS: {
    payload: {
      translation: string;
    };
    result: Book[];
  };
  GET_VERSES: {
    payload: {
      translation: string;
      bookUsfm: string;
      chapter: number;
    };
    result: Verse[];
  };
  SEARCH: {
    payload: SearchRequest;
    result: SearchResult;
  };
}

export type BibleWorkerAction = keyof BibleWorkerActions;

export type BibleWorkerRequest = {
  [Action in BibleWorkerAction]: {
    id: string;
    type: Action;
    payload: BibleWorkerActions[Action]['payload'];
  };
}[BibleWorkerAction];

export type BibleWorkerResponse =
  | {
      id: string;
      success: true;
      data: unknown;
    }
  | {
      id: string;
      success: false;
      error: string;
    }
  | {
      id: string;
      loading: TranslationLoadingEvent;
    };
