import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, MenuModule, ButtonModule, AvatarModule],
    template: `
        <header class="modern-topbar">
            <div class="topbar-container">
                <div class="topbar-content">
                    <!-- Logo Section -->
                    <div class="logo-section">
                        <a routerLink="/" class="logo-link">
                            <div class="logo-icon">
                                <i class="pi pi-book"></i>
                            </div>
                            <span class="logo-text">Blog</span>
                        </a>
                    </div>

                    <!-- Navigation & Actions -->
                    <div class="actions-section">
                        <!-- Dark Mode Toggle -->
                        <button class="theme-toggle" (click)="toggleDarkMode()" [attr.aria-label]="isDarkTheme() ? 'Switch to light mode' : 'Switch to dark mode'">
                            <i [class]="isDarkTheme() ? 'pi pi-sun' : 'pi pi-moon'"></i>
                        </button>

                        <!-- Authenticated User Menu -->
                        <div *ngIf="isAuthenticated" class="user-section">
                            <button class="create-post-btn" routerLink="/blog/create">
                                <i class="pi pi-plus"></i>
                                <span>Write</span>
                            </button>

                            <div class="user-menu-container">
                                <button class="user-menu-trigger" (click)="toggleUserMenu($event)">
                                    <div class="user-avatar">
                                        <span>{{ userInitials }}</span>
                                    </div>
                                    <span class="user-name">{{ userName }}</span>
                                    <i class="pi pi-chevron-down"></i>
                                </button>

                                <p-menu #userMenu [model]="userMenuItems" [popup]="true" styleClass="modern-user-menu" appendTo="body"> </p-menu>
                            </div>
                        </div>

                        <!-- Guest Menu -->
                        <div *ngIf="!isAuthenticated" class="guest-section">
                            <button class="signin-btn" routerLink="/auth/login">
                                <i class="pi pi-sign-in"></i>
                                <span>Sign In</span>
                            </button>
                            <button class="signup-btn" routerLink="/auth/signup">
                                <i class="pi pi-user-plus"></i>
                                <span>Sign Up</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    `
})
export class AppTopbar implements OnInit, OnDestroy {
    @ViewChild('userMenu') userMenu: any;

    private destroy$ = new Subject<void>();

    isAuthenticated = false;
    userName = '';
    userInitials = '';
    userMenuItems: MenuItem[] = [];

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe((isAuth) => {
            this.isAuthenticated = isAuth;
            if (isAuth) {
                this.setupUserMenu();
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    isDarkTheme() {
        return this.layoutService.layoutConfig().darkTheme;
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    toggleUserMenu(event: Event) {
        if (this.userMenu) {
            this.userMenu.toggle(event);
        }
    }

    private setupUserMenu() {
        // In a real app, you'd get this from the auth service
        this.userName = 'Current User';
        this.userInitials = 'CU';

        this.userMenuItems = [
            {
                label: 'My Posts',
                icon: 'pi pi-file-edit',
                routerLink: '/blog'
            },
            {
                label: 'Create Post',
                icon: 'pi pi-plus',
                routerLink: '/blog/create'
            },
            {
                separator: true
            },
            {
                label: 'Profile',
                icon: 'pi pi-user',
                command: () => {
                    console.log('Navigate to profile');
                }
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                command: () => {
                    console.log('Navigate to settings');
                }
            },
            {
                separator: true
            },
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: () => {
                    this.logout();
                }
            }
        ];
    }

    logout() {
        this.authService.logout();
    }
}
