export const translations: BibleTranslation[] = [
  { lang: 'en', name: 'King James Version', usfm: 'KJV' },
  { lang: 'no', name: 'Norsk Bibel 88/07', usfm: 'NB' },
];

export interface BibleTranslation {
  lang: string;
  name: string;
  usfm: string;
}
