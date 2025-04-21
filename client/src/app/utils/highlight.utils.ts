import { RainbowColors } from '../constants/colors';

export default class HighlightUtils {
  static getHighlightTextColor(color: string) {
    switch (color) {
      case 'gray':
      case 'red':
      case 'indigo':
      case 'violet':
        return 'rgba(255, 255, 255, 0.95)';
      case 'white':
      case 'green':
      case 'blue':
      case 'orange':
      case 'yellow':
      default:
        return '#333';
    }
  }

  static getHighlightBackgroundColor(color: string) {
    return RainbowColors[color as keyof typeof RainbowColors];
  }
}
