import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { needAuthGuard } from './guard/need-auth-guard';
import { JobSearchResult } from './pages/job-search-result/job-search-result';
import { JobSearchForm } from './pages/job-search-form/job-search-form';
import { JobCreateComponent } from './pages/job/job-create/job-create';
import { JobDetailComponent } from './pages/job/job-detail/job-detail';
import { MyPostingsComponent } from './pages/job/my-postings/my-postings';
import { MyBidsComponent } from './pages/proposals/my-bids/my-bids';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // `/profile/me` needs to be before `/profile/:username` since it would look for a user with me as a username
  { path: 'profile/me', component: Profile, canActivate: [needAuthGuard] }, 
  { path: 'profile/:username', component: Profile },
  { path: 'jobs/search-result', component: JobSearchResult },
  { path: 'jobs/search', component: JobSearchForm },
  { path: 'jobs/create', component: JobCreateComponent, canActivate: [needAuthGuard] },
  { path: 'jobs/my-postings', component: MyPostingsComponent, canActivate: [needAuthGuard] },
  { path: 'jobs/:id', component: JobDetailComponent, canActivate: [needAuthGuard] },
  { path: 'proposals/my-bids', component: MyBidsComponent, canActivate: [needAuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
