import { LocalStorage } from '../constants/localStorage';

export class LocalStorageUtils {
  static getDarkMode(): boolean {
    let darkModeRaw = localStorage.getItem(LocalStorage.DarkMode);
    return darkModeRaw === null ? true : Boolean(darkModeRaw);
  }
  static getFontSize(): number {
    return Number(localStorage.getItem(LocalStorage.FontSize) || 16);
  }

  static getLanguage(): string {
    return localStorage.getItem(LocalStorage.Language) || navigator.language.slice(0, 2);
  }
}
