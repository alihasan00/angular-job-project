import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { Subject, takeUntil, switchMap } from 'rxjs';

import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../../models/blog-post.model';

@Component({
    selector: 'app-post-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule, ProgressSpinnerModule, TagModule],
    template: `
        <div class="post-detail-container">
            <!-- Loading State -->
            <div *ngIf="loading" class="loading-state">
                <p-progressSpinner strokeWidth="3" animationDuration="0.5s" [style]="{ width: '60px', height: '60px' }"></p-progressSpinner>
                <h2>Loading Post...</h2>
                <p>Please wait while we fetch the blog post content</p>
            </div>

            <!-- Post Not Found -->
            <div *ngIf="!loading && !post" class="error-state">
                <i class="pi pi-exclamation-triangle"></i>
                <h2>Post Not Found</h2>
                <p>The blog post you're looking for doesn't exist or has been removed.</p>
                <p-button label="Back to Blog" icon="pi pi-arrow-left" routerLink="/blog" [outlined]="true"> </p-button>
            </div>

            <!-- Post Content -->
            <div *ngIf="!loading && post" class="post-content">
                <!-- Header Section -->
                <div class="post-header">
                    <div class="flex justify-between items-start mb-4">
                        <p-button label="Back to Blog" icon="pi pi-arrow-left" routerLink="/blog" [outlined]="true" size="small"> </p-button>
                    </div>

                    <h1>{{ post.title }}</h1>

                    <div class="post-meta">
                        <div class="meta-item">
                            <i class="pi pi-user"></i>
                            <span class="author-name">{{ post.author.firstName }} {{ post.author.lastName }}</span>
                        </div>

                        <div class="meta-item">
                            <i class="pi pi-calendar"></i>
                            <span>{{ formatDate(post.publishedDate) }}</span>
                        </div>

                        <div class="meta-item">
                            <i class="pi pi-clock"></i>
                            <span>{{ formatTime(post.publishedDate) }}</span>
                        </div>
                    </div>

                    <div class="post-status">
                        <p-tag value="Published" severity="success" [rounded]="true"> </p-tag>
                    </div>
                </div>

                <!-- Article Body -->
                <div class="post-body">
                    <p-card>
                        <div class="prose">
                            <div [innerHTML]="formatPostBody(post.body)"></div>
                        </div>
                    </p-card>
                </div>

                <!-- Footer Section -->
                <div class="post-footer">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div class="author-info">
                            <h4>About the Author</h4>
                            <p>{{ post.author.firstName }} {{ post.author.lastName }} - {{ post.author.email }}</p>
                        </div>

                        <div class="action-buttons">
                            <p-button label="Share" icon="pi pi-share-alt" [outlined]="true" size="small" (onClick)="sharePost()"> </p-button>
                            <p-button label="Print" icon="pi pi-print" [outlined]="true" size="small" (onClick)="printPost()"> </p-button>
                        </div>
                    </div>
                </div>

                <!-- Related Posts or Actions -->
                <div class="related-actions">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <p-button label="View All Posts" icon="pi pi-list" routerLink="/blog" [outlined]="true"> </p-button>
                        <p-button label="Create New Post" icon="pi pi-plus" routerLink="/blog/create"> </p-button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class PostDetailComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    post: BlogPost | null = null;
    loading = true;
    postId: number | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private blogService: BlogService
    ) {}

    ngOnInit() {
        this.route.params
            .pipe(
                takeUntil(this.destroy$),
                switchMap((params) => {
                    this.postId = Number(params['id']);
                    this.loading = true;
                    return this.blogService.getPostById(this.postId);
                })
            )
            .subscribe({
                next: (post) => {
                    this.post = post;
                    this.loading = false;

                    // Update page title if post exists
                    if (post) {
                        document.title = `${post.title} - Blog`;
                    }
                },
                error: (error) => {
                    console.error('Error loading post:', error);
                    this.loading = false;
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        // Reset page title
        document.title = 'Blog';
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(date: Date): string {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatPostBody(body: string): string {
        // Convert line breaks to HTML paragraphs
        const paragraphs = body
            .split('\n\n')
            .map((paragraph) => paragraph.trim())
            .filter((paragraph) => paragraph.length > 0)
            .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
            .join('');

        return paragraphs;
    }

    sharePost() {
        if (this.post && navigator.share) {
            navigator
                .share({
                    title: this.post.title,
                    text: this.post.excerpt,
                    url: window.location.href
                })
                .catch((err) => {
                    console.log('Error sharing:', err);
                    this.fallbackShare();
                });
        } else {
            this.fallbackShare();
        }
    }

    private fallbackShare() {
        // Fallback to copying URL to clipboard
        navigator.clipboard
            .writeText(window.location.href)
            .then(() => {
                // You could show a toast notification here
                console.log('URL copied to clipboard');
            })
            .catch((err) => {
                console.error('Failed to copy URL:', err);
            });
    }

    printPost() {
        window.print();
    }
}
