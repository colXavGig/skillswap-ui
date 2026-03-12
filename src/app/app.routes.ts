import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { needAuthGuard } from './guard/need-auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // `/profile/me` needs to be before `/profile/:username` since it would look for a user with me as a username
  { path: 'profile/me', component: Profile, canActivate: [needAuthGuard] }, 
  { path: 'profile/:username', component: Profile },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
