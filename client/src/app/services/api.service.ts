import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Verse } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  search(params: SearchReqParams): Promise<SearchResponse> {
    const { canon, query, books, translations } = params;
    let urlString = '/api/search'; // Start with the base path

    const queryParams: string[] = [];

    if (query) queryParams.push(`query=${query}`);
    if (canon) queryParams.push(`canon=${canon}`);
    if (books) queryParams.push(`books=${books}`);
    if (translations) queryParams.push(`translations=${translations}`);

    if (queryParams.length > 0) {
      urlString += `?${queryParams.join('&')}`;
    }

    return fetch(urlString).then((res) => res.json());
  }

  getVerses(translation: string, bookUsfm: string, chapter: number | string): Promise<Verse[]> {
    const { apiUrl } = environment;
    const url = `${apiUrl}/verses?translation=${translation}&bookUsfm=${bookUsfm}&chapter=${chapter}`;
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
}

export interface SearchResponse {
  /** Total hint on search term */
  count: number;
  verses: Verse[];
}
