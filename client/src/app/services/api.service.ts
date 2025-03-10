import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Verse } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  search(query: string): Promise<SearchResponse> {
    const { apiUrl } = environment;
    const url = `${apiUrl}/search?q=${query}`;
    return fetch(url).then((res) => res.json());
  }

  getVerses(translation: string, bookUsfm: string, chapter: number | string): Promise<Verse[]> {
    const { apiUrl } = environment;
    const url = `${apiUrl}/verses?translation=${translation}&bookUsfm=${bookUsfm}&chapter=${chapter}`;
    return fetch(url).then((res) => res.json());
  }
}

export interface SearchResponse {
  /** Total hint on search term */
  count: number;
  verses: Verse[];
}
