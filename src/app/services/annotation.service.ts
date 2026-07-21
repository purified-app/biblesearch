import { computed, inject, Injectable } from '@angular/core';
import {
  Annotation,
  VerseTarget,
  VerseSelection,
  BookmarkAnnotation,
  HighlightAnnotation,
  NoteAnnotation,
} from '../interfaces';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private readonly storage = inject(StorageService);

  readonly annotations = this.storage.getSignal('annotations');
  readonly highlights = computed(() =>
    this.annotations().filter(
      (annotation): annotation is HighlightAnnotation => annotation.type === 'highlight',
    ),
  );
  readonly notes = computed(() =>
    this.annotations().filter(
      (annotation): annotation is NoteAnnotation => annotation.type === 'note',
    ),
  );
  readonly bookmarks = computed(() =>
    this.annotations().filter(
      (annotation): annotation is BookmarkAnnotation => annotation.type === 'bookmark',
    ),
  );

  createNote(targets: VerseTarget[]): NoteAnnotation {
    const now = new Date();
    return {
      id: now.getTime(),
      type: 'note',
      targets,
      content: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  saveBookmark(targets: VerseTarget[]): void {
    const now = new Date();
    const bookmark: BookmarkAnnotation = {
      id: now.getTime(),
      type: 'bookmark',
      targets: targets.map((target) => ({
        translation: target.translation,
        bookNumber: target.bookNumber,
        bookUsfm: target.bookUsfm,
        bookName: target.bookName,
        chapter: target.chapter,
        verse: target.verse,
      })),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    const otherAnnotations = this.storage
      .get('annotations')
      .filter((annotation) => annotation.type !== 'bookmark');
    const bookmarks = [bookmark, ...this.bookmarks()].slice(
      0,
      this.storage.get('bookmarksLimit'),
    );
    this.storage.set('annotations', [...otherAnnotations, ...bookmarks]);
  }

  saveHighlight(selection: VerseSelection, color: string): void {
    const annotations = this.storage.get('annotations');
    const retained = annotations.filter((annotation) => {
      if (annotation.type !== 'highlight') return true;
      if (annotation.id === selection.highlightId) return false;
      return !this.haveSameTargets(annotation.targets, selection.targets);
    });

    if (!color) {
      this.storage.set('annotations', retained);
      return;
    }

    const now = new Date();
    const highlight: HighlightAnnotation = {
      id: now.getTime(),
      type: 'highlight',
      targets: selection.targets,
      color,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    this.storage.set('annotations', [...retained, highlight]);
  }

  save(annotation: Annotation): void {
    const annotations = this.storage.get('annotations');
    const updated = { ...annotation, updatedAt: new Date().toISOString() };
    this.storage.set('annotations', [
      ...annotations.filter((existing) => existing.id !== annotation.id),
      updated,
    ]);
  }

  deleteAnnotation(id: number): void {
    this.storage.set(
      'annotations',
      this.storage.get('annotations').filter((annotation) => annotation.id !== id),
    );
  }

  getHighlightColor(selection: VerseSelection): string | undefined {
    return this.highlights().find(
      (highlight) =>
        selection.highlightId === highlight.id ||
        this.haveSameTargets(highlight.targets, selection.targets),
    )?.color;
  }

  private haveSameTargets(first: VerseTarget[], second: VerseTarget[]): boolean {
    return (
      first.length === second.length &&
      first.every((target, index) => {
        const other = second[index];
        return (
          target.translation === other.translation &&
          target.bookUsfm === other.bookUsfm &&
          target.chapter === other.chapter &&
          target.verse === other.verse &&
          target.startOffset === other.startOffset &&
          target.endOffset === other.endOffset
        );
      })
    );
  }
}