import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, PaginationChangedEvent, ModuleRegistry, AllCommunityModule, themeQuartz, colorSchemeLight, colorSchemeDark } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Subject, takeUntil } from 'rxjs';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

import { BlogService } from '../../services/blog.service';
import { BlogPost, BlogPostsResponse } from '../../models/blog-post.model';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-blog-home',
    standalone: true,
    imports: [CommonModule, RouterModule, AgGridAngular, ButtonModule, CardModule, ProgressSpinnerModule],
    template: `
        <div class="modern-blog-container">
            <!-- Header Section -->
            <div class="header-section">
                <div class="header-content">
                    <div class="title-group">
                        <h1 class="main-title">
                            <i class="pi pi-book mr-3"></i>
                            Blog Posts
                        </h1>
                        <p class="subtitle">Discover the latest insights and tutorials</p>
                        <div class="stats-badge">
                            <span class="stats-text">{{ totalPosts }} total posts</span>
                        </div>
                    </div>
                    <div class="action-group">
                        <p-button *ngIf="isAuthenticated" label="Create Post" icon="pi pi-plus" routerLink="/blog/create" [raised]="true" severity="primary" class="create-btn"> </p-button>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="loading-container">
                <div class="loading-content">
                    <p-progressSpinner strokeWidth="3" animationDuration="0.5s" [style]="{ width: '60px', height: '60px' }"></p-progressSpinner>
                    <p class="loading-text">Loading amazing content...</p>
                </div>
            </div>

            <!-- Grid Container -->
            <div *ngIf="!loading" class="grid-wrapper">
                <div class="grid-header">
                    <h3 class="grid-title">Latest Posts</h3>
                    <div class="grid-meta">
                        <span class="current-page">Page {{ currentPage }}</span>
                    </div>
                </div>

                <div class="modern-grid-container">
                    <ag-grid-angular
                        #agGrid
                        [theme]="theme"
                        [style.height.px]="650"
                        [columnDefs]="columnDefs"
                        [rowData]="posts"
                        [pagination]="true"
                        [paginationPageSize]="pageSize"
                        [paginationPageSizeSelector]="false"
                        [suppressPaginationPanel]="false"
                        [domLayout]="'normal'"
                        [rowHeight]="90"
                        [headerHeight]="60"
                        [suppressRowHoverHighlight]="false"
                        [rowSelection]="'single'"
                        [animateRows]="true"
                        (gridReady)="onGridReady($event)"
                        (paginationChanged)="onPaginationChanged($event)"
                        (rowClicked)="onRowClicked($event)"
                    >
                    </ag-grid-angular>
                </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading && posts.length === 0" class="empty-state">
                <div class="empty-content">
                    <div class="empty-icon">
                        <i class="pi pi-file-edit"></i>
                    </div>
                    <h3 class="empty-title">No posts found</h3>
                    <p class="empty-description">Be the first to create a blog post and share your knowledge!</p>
                    <p-button *ngIf="isAuthenticated" label="Create First Post" icon="pi pi-plus" routerLink="/blog/create" severity="primary" [raised]="true" class="empty-btn"> </p-button>
                </div>
            </div>
        </div>
    `
})
export class BlogHomeComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    posts: BlogPost[] = [];
    loading = true;
    currentPage = 1;
    pageSize = 5;
    totalPosts = 0;
    isAuthenticated = false;

    // AG Grid theme configuration
    theme = themeQuartz.withPart(colorSchemeLight).withParams({
        backgroundColor: 'var(--surface-card)',
        foregroundColor: 'var(--text-color)',
        accentColor: 'var(--primary-color)',
        borderColor: 'var(--surface-border)',
        chromeBackgroundColor: 'var(--surface-100)',
        headerBackgroundColor: 'var(--surface-100)',
        headerTextColor: 'var(--text-color)',
        oddRowBackgroundColor: 'var(--surface-50)'
    });

    // Check for dark mode preference
    private isDarkMode(): boolean {
        // Check PrimeNG theme mode or system preference
        const body = document.body;
        const html = document.documentElement;

        // Check for PrimeNG dark theme classes or data attributes
        return body.classList.contains('dark') || html.getAttribute('data-theme') === 'dark' || html.getAttribute('data-p-theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    private updateTheme(): void {
        if (this.isDarkMode()) {
            this.theme = themeQuartz.withPart(colorSchemeDark).withParams({
                backgroundColor: 'var(--surface-card)',
                foregroundColor: 'var(--text-color)',
                accentColor: 'var(--primary-color)',
                borderColor: 'var(--surface-border)',
                chromeBackgroundColor: 'var(--surface-100)',
                headerBackgroundColor: 'var(--surface-100)',
                headerTextColor: 'var(--text-color)',
                oddRowBackgroundColor: 'var(--surface-50)'
            });
        } else {
            this.theme = themeQuartz.withPart(colorSchemeLight).withParams({
                backgroundColor: 'var(--surface-card)',
                foregroundColor: 'var(--text-color)',
                accentColor: 'var(--primary-color)',
                borderColor: 'var(--surface-border)',
                chromeBackgroundColor: 'var(--surface-100)',
                headerBackgroundColor: 'var(--surface-100)',
                headerTextColor: 'var(--text-color)',
                oddRowBackgroundColor: 'var(--surface-50)'
            });
        }
    }

    columnDefs: ColDef[] = [
        {
            headerName: 'Title & Excerpt',
            field: 'title',
            flex: 3,
            cellRenderer: (params: any) => {
                return `
                    <div class="flex flex-col py-2 w-full">
                        <span class="post-title" onclick="window.navigateToPost(${params.data.id})">
                            ${params.value}
                        </span>
                        <span class="post-excerpt">
                            ${params.data.excerpt}
                        </span>
                    </div>
                `;
            },
            sortable: true,
            resizable: true
        },
        {
            headerName: 'Author',
            field: 'author',
            flex: 1.5,
            cellRenderer: (params: any) => {
                const firstNameInitial = params.data.author.firstName.charAt(0).toUpperCase();
                const lastNameInitial = params.data.author.lastName.charAt(0).toUpperCase();
                return `
                    <div class="flex items-center py-2 w-full">
                        <div class="author-avatar">
                            ${firstNameInitial}${lastNameInitial}
                        </div>
                        <div class="flex flex-col">
                            <span class="author-name">
                                ${params.data.author.firstName} ${params.data.author.lastName}
                            </span>
                            <span>
                                ${params.data.author.email}
                            </span>
                        </div>
                    </div>
                `;
            },
            sortable: true,
            resizable: true,
            comparator: (valueA: any, valueB: any) => {
                const nameA = `${valueA.firstName} ${valueA.lastName}`;
                const nameB = `${valueB.firstName} ${valueB.lastName}`;
                return nameA.localeCompare(nameB);
            }
        },
        {
            headerName: 'Published Date',
            field: 'publishedDate',
            flex: 1,
            cellRenderer: (params: any) => {
                const date = new Date(params.value);
                return `
                    <div class="flex flex-col py-2 w-full">
                        <span class="date-primary">
                            ${date.toLocaleDateString()}
                        </span>
                        <span class="date-secondary">
                            ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                `;
            },
            sortable: true,
            resizable: true,
            sort: 'desc' // Default sort by newest first
        }
    ];

    constructor(
        private blogService: BlogService,
        private authService: AuthService,
        private router: Router
    ) {
        // Make navigation function globally available for cell renderer
        (window as any).navigateToPost = (id: number) => {
            this.router.navigate(['/blog/post', id]);
        };
    }

    ngOnInit() {
        console.log('BlogHomeComponent initialized');

        // Initialize theme based on current mode
        this.updateTheme();

        // Monitor for theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            this.updateTheme();
        });

        // Monitor for manual theme changes in PrimeNG
        const observer = new MutationObserver(() => {
            this.updateTheme();
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'data-theme', 'data-p-theme']
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme', 'data-p-theme']
        });

        this.checkAuthStatus();
        this.loadPosts();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        // Clean up global function
        delete (window as any).navigateToPost;
    }

    private checkAuthStatus() {
        this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe((isAuth) => {
            this.isAuthenticated = isAuth;
        });
    }

    private loadPosts() {
        this.loading = true;
        console.log('Loading posts - page:', this.currentPage, 'pageSize:', this.pageSize);

        this.blogService
            .getPosts(this.currentPage, this.pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: BlogPostsResponse) => {
                    console.log('Posts loaded successfully:', response);
                    this.posts = response.posts;
                    this.totalPosts = response.total;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading posts:', error);
                    this.loading = false;
                }
            });
    }

    onGridReady(params: GridReadyEvent) {
        params.api.sizeColumnsToFit();
    }

    onPaginationChanged(event: PaginationChangedEvent) {
        const currentPageFromGrid = event.api.paginationGetCurrentPage() + 1;
        if (currentPageFromGrid !== this.currentPage) {
            this.currentPage = currentPageFromGrid;
            this.loadPosts();
        }
    }

    onRowClicked(event: any) {
        const postId = event.data.id;
        this.router.navigate(['/blog/post', postId]);
    }
}
