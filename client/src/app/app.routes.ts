import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { SearchPage } from './pages/search/search.page';
import { BooksPage } from './pages/read/books/books.page';
import { ChaptersPage } from './pages/read/chapters/chapters.page';
import { VersesPage } from './pages/read/verses/verses.page';
import { SettingsPage } from './pages/settings/settings.page';
import { NotesPage } from './pages/notes/notes.page';
import { LocalStorage } from './constants/localStorage';
import { inject } from '@angular/core';
import { BookmarkService } from './services/bookmark.service';
import { LayoutComponent } from './components/layout/layout.component';
import { books } from './constants/books-chapters';

export const routes: Routes = [
  {
    path: '',
    redirectTo: () => {
      const bookmarkService = inject(BookmarkService);
      const startPage = localStorage.getItem(LocalStorage.StartPage);
      switch (startPage) {
        case 'search':
          return 'search';
        case 'read':
          return 'read';
        case 'recentRead':
          const recentRead = bookmarkService.recentRead();
          if (!recentRead) return 'search';
          const { book, chapter } = recentRead;
          return `read/${book}/${chapter}`;
        default:
          return 'search';
      }
    },
    pathMatch: 'full',
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'search',
        component: SearchPage,
        data: { title: 'Search' },
      },
      {
        path: 'read',
        pathMatch: 'full',
        component: BooksPage,
        data: { title: 'Books' },
      },
      {
        path: 'read/:book',
        pathMatch: 'full',
        component: ChaptersPage,
        data: { title: 'Chapters' },
      },
      {
        path: 'read/:book/:chapter',
        pathMatch: 'full',
        component: VersesPage,
        resolve: {
          title: (route: ActivatedRouteSnapshot) => {
            const { book, chapter } = route.params;
            const bookName = books.find((b) => b.id === Number(book))?.name;
            return `${bookName} ${chapter}`;
          },
        },
      },
      {
        path: 'settings',
        component: SettingsPage,
        data: { title: 'Settings' },
      },
      {
        path: 'notes',
        component: NotesPage,
        data: { title: 'Notes' },
      },
    ],
  },
];
