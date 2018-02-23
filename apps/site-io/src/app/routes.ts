import { ComponentApi } from './pages/component-viewer/component-api.component';
import { ComponentExamples } from './pages/component-viewer/component-examples.component';
import { ComponentOverview } from './pages/component-viewer/component-overview.component';
import { ComponentViewer } from './pages/component-viewer/component-viewer.component';
import { Homepage } from './pages/homepage';
import { ComponentList } from './pages/component-list';
import { GuideList } from './pages/guide-list';
import { Routes } from '@angular/router';

import { ComponentCategoryList } from './pages/component-category-list/component-category-list';
import { ComponentSidenav } from './pages/component-sidenav/component-sidenav';
import { GuideViewer } from './pages/guide-viewer/guide-viewer';

export const MATERIAL_DOCS_ROUTES: Routes = [
  {path: '', component: Homepage, pathMatch: 'full'},
  {
    path     : 'categories',
    component: ComponentSidenav,
    children : [
      {path: '', component: ComponentCategoryList},
      {path: ':id', component: ComponentList},
    ],
  },
  {
    path     : 'components',
    component: ComponentSidenav,
    children : [
      {path: '', component: ComponentCategoryList},
      {path: 'component/:id', redirectTo: ':id', pathMatch: 'full'},
      {path: 'category/:id', redirectTo: '/categories/:id', pathMatch: 'full'},
      {
        path     : ':id',
        component: ComponentViewer,
        children : [
          {path: '', redirectTo: 'overview', pathMatch: 'full'},
          {path: 'overview', component: ComponentOverview, pathMatch: 'full'},
          {path: 'api', component: ComponentApi, pathMatch: 'full'},
          {path: 'examples', component: ComponentExamples, pathMatch: 'full'},
          {path: '**', redirectTo: 'overview'},
        ],
      },
    ],
  },
  {path: 'guides', component: GuideList},
  {path: 'guide/:id', component: GuideViewer},
  {path: '**', redirectTo: ''},
];
