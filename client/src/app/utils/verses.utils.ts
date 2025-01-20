import { Verse } from '../interfaces';

export default class VersesUtils {
  static getVersesRef(verses: Verse[]): string {
    // TODO: change to this? => GEN:1:16-17
    // OR this? => KJV_GEN_1_16-17
    // OR this? => KJV:GEN:1:16-17
    const translation = 'KJV';
    const verseText =
      verses.length === 1
        ? verses[0].verse
        : `${verses[0].verse}-${verses[verses.length - 1].verse}`;
    return `${translation}:${verses[0].book}:${verses[0].chapter}:${verseText}`;
  }
}
