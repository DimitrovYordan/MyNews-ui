import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';

import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';
import { LoaderComponent } from './components/loader/loader.component';
import { GlobeService } from './services/globe.service';

export class MyTranslateLoader implements TranslateLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, LoaderComponent, TranslateModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected readonly title = signal('My News');
  private loadingService = inject(LoadingService);
  isLoading = this.loadingService.isLoading;

  isLoggedIn: boolean = false;
  isMenuOpen: boolean = false;
  hasSelectedSections: boolean = false;
  showWelcomeText: boolean = true;
  userFirstName: string = '';
  userLastName: string = '';

  public hasSelectedSections$ = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService,
    private globeService: GlobeService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;

      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.userFirstName = currentUser.firstName;
        this.userLastName = currentUser.lastName;
      } else {
        this.userFirstName = '';
        this.userLastName = '';
      }
    });

    this.authService.isMenuOpen$.subscribe(open => {
      this.isMenuOpen = open;
    });

    this.authService.hasSelectedSections$.subscribe(selected => {
      this.hasSelectedSections = selected;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const hiddenRoutes = ['/settings', '/news', '/contact'];
      this.showWelcomeText = !hiddenRoutes.includes(event.urlAfterRedirects);

      this.authService.closeMenu();
    });
  }

  ngOnInit(): void {
    this.globeService.preload();

    const browserLang = this.translate.getBrowserLang() || 'en';
    this.translate.setFallbackLang('en');
    this.translate.use(browserLang);

    const user = this.authService.getCurrentUser();
    if (user) {
      this.userFirstName = user.firstName;
      this.userLastName = user.lastName;
      this.isLoggedIn = true;
    }

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userFirstName = user.firstName;
        this.userLastName = user.lastName;
      }
    });

    this.authService.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
  }

  openLogin() {
    this.router.navigate(['/login']);
  }

  openSignup() {
    this.router.navigate(['signup']);
  }

  openForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userFirstName = '';
    this.userLastName = '';
    this.isMenuOpen = false;
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.authService.toggleMenu();
  }

  goToProfile() {
    this.router.navigate(['/settings']);
    this.isMenuOpen = false;
  }

  goToSections() {
    this.router.navigate(['/sections']);
  }

  goToNews() {
    this.router.navigate(['/news']);
    this.isMenuOpen = false;
  }

  goToContact() {
    this.router.navigate(['/contact']);
    this.isMenuOpen = false;
  }

  getInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.authService.isMenuOpen$.value) return;
    this.authService.closeMenu();
  }
}
