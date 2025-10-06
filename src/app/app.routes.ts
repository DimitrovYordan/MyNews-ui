import { Routes } from '@angular/router';

import { NewsListComponent } from './components/news-list/news-list.component';
import { SectionSelectComponent } from './components/section-select/section-select.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SettingsComponent } from './auth/settings/settings.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ContactComponent } from './components/contact/contact.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'test-page', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  { path: 'sections', component: SectionSelectComponent, canActivate: [AuthGuard] },
  { path: 'news', component: NewsListComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
