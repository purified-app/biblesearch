import { Routes } from '@angular/router';
import { SearchPage } from './pages/search/search.page';
import { BooksPage } from './pages/read/books/books.page';
import { ChaptersPage } from './pages/read/chapters/chapters.page';
import { VersesPage } from './pages/read/verses/verses.page';
import { SettingsPage } from './pages/settings/settings.page';
import { NotesPage } from './pages/notes/notes.page';
import { LayoutComponent } from './components/layout/layout.component';
import RouteUtils from './utils/route.utils';
import { TextKey } from './constants/text-key';

export const routes: Routes = [
  {
    path: '',
    redirectTo: RouteUtils.redirectPathRoot,
    pathMatch: 'full',
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'search',
        component: SearchPage,
        data: { title: TextKey.Search },
      },
      {
        path: 'read',
        pathMatch: 'full',
        redirectTo: RouteUtils.redirectPathRead,
      },
      {
        path: 'read/:translation',
        pathMatch: 'full',
        component: BooksPage,
        data: { title: TextKey.Books },
      },
      {
        path: 'read/:translation/:bookUsfm',
        pathMatch: 'full',
        component: ChaptersPage,
        data: { title: TextKey.Chapters },
      },
      {
        path: 'read/:translation/:bookUsfm/:chapter',
        pathMatch: 'full',
        component: VersesPage,
        resolve: {
          title: RouteUtils.getVersePageTitle,
        },
      },
      {
        path: 'settings',
        component: SettingsPage,
        data: { title: TextKey.Settings },
      },
      {
        path: 'notes',
        component: NotesPage,
        data: { title: TextKey.Notes },
      },
    ],
  },
];
