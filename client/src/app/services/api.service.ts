import { Injectable } from '@angular/core';
import { Verse } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  search(params: SearchReqParams): Promise<SearchResponse> {
    const { canon, query, books, translations, sort } = params;
    const searchParams = new URLSearchParams();

    if (query) searchParams.append('query', query);
    if (canon) searchParams.append('canon', canon);
    if (books) searchParams.append('books', books);
    if (translations) searchParams.append('translations', translations);
    if (sort) searchParams.append('sort', sort);

    const queryString = searchParams.toString();
    const urlString = queryString ? `/api/search?${queryString}` : '/api/search';

    return fetch(urlString).then((res) => res.json());
  }

  getVerses(translation: string, bookUsfm: string, chapter: number | string): Promise<Verse[]> {
    const searchParams = new URLSearchParams({
      translation,
      bookUsfm,
      chapter: chapter.toString(),
    });

    const url = `/api/verses?${searchParams.toString()}`;
    return fetch(url).then((res) => res.json());
  }
}

export interface SearchReqParams {
  /** Search term */
  query: string;
  /** Canon filter: 'nt' or 'ot' */
  canon?: 'nt' | 'ot';
  /** Comma-separated list of book USFM */
  books?: string;
  /** Comma-separated list of translations */
  translations?: string;
  /** Sort order: 'relevance' | 'chronological' */
  sort?: 'relevance' | 'chronological';
}

export interface SearchResponse {
  /** Total hint on search term */
  count: number;
  verses: Verse[];
}
