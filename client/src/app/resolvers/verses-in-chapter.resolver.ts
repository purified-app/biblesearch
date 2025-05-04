import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Verse } from '../interfaces';

export const versesInChapterResolver: ResolveFn<Verse[]> = (route) => {
  const { chapter, bookUsfm, translation } = route.params;
  return inject(ApiService).getVerses(translation, bookUsfm, chapter);
};
