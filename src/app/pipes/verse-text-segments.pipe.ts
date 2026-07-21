import { Pipe, PipeTransform } from '@angular/core';
import { HighlightAnnotation } from '../interfaces';
import HighlightUtils from '../utils/highlight.utils';

export interface VerseTextSegment {
  text: string;
  highlightId?: number;
  backgroundColor?: string;
  color?: string;
  searchMatch: boolean;
}

@Pipe({ name: 'verseTextSegments' })
export class VerseTextSegmentsPipe implements PipeTransform {
  transform(
    text: string,
    verse: number,
    highlights: HighlightAnnotation[],
    search: string,
  ): VerseTextSegment[] {
    const highlightIds = Array<number | undefined>(text.length).fill(undefined);
    const colors = new Map(highlights.map((highlight) => [highlight.id, highlight.color]));

    highlights.forEach((highlight) => {
      const target = highlight.targets.find((candidate) => candidate.verse === verse);
      if (!target) return;
      const start = Math.max(target.startOffset ?? 0, 0);
      const end = Math.min(target.endOffset ?? text.length, text.length);
      highlightIds.fill(highlight.id, start, end);
    });

    const searchMatches = Array<boolean>(text.length).fill(false);
    const words = search.replace(/"/g, '').split(/\s+/).filter(Boolean);
    if (words.length) {
      const escapedWords = words.map((word) => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
      const expression = new RegExp(escapedWords.join('|'), 'gi');
      for (const match of text.matchAll(expression)) {
        searchMatches.fill(true, match.index, match.index + match[0].length);
      }
    }

    const segments: VerseTextSegment[] = [];
    for (let start = 0; start < text.length; ) {
      const highlightId = highlightIds[start];
      const searchMatch = searchMatches[start];
      let end = start + 1;
      while (
        end < text.length &&
        highlightIds[end] === highlightId &&
        searchMatches[end] === searchMatch
      ) {
        end++;
      }

      const highlightColor = highlightId ? colors.get(highlightId) : undefined;
      segments.push({
        text: text.slice(start, end),
        highlightId,
        backgroundColor: HighlightUtils.getHighlightBackgroundColor(highlightColor),
        color: HighlightUtils.getHighlightTextColor(highlightColor),
        searchMatch,
      });
      start = end;
    }
    return segments;
  }
}