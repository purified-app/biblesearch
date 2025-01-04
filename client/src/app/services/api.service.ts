import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Verse } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  search(query: string): Promise<Verse[]> {
    const { apiUrl } = environment;
    const url = `${apiUrl}/search?q=${query}`;
    return fetch(url).then((res) => res.json());
  }

  getVerses(book: number, chapter: number): Promise<Verse[]> {
    const { apiUrl } = environment;
    const url = `${apiUrl}/verses?book=${book}&chapter=${chapter}`;
    return fetch(url).then((res) => res.json());
  }
}
