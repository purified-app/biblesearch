import { ActionSheetButton } from '@ionic/angular/standalone';
import { TextKey } from 'src/app/constants/text-key';

export const versesActionSheetButtons: ActionSheetButton[] = [
  {
    icon: 'bookmark-outline',
    text: TextKey.Bookmark,
    role: 'bookmark',
  },
  { icon: 'document-text-outline', text: TextKey.AddNote, role: 'notes' },
];
