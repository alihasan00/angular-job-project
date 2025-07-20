import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { CreateBlogPostRequest } from '../../models/blog-post.model';

@Component({
    selector: 'app-create-post',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, ButtonModule, CardModule, InputTextModule, InputTextarea, MessageModule, ProgressSpinnerModule, ToolbarModule, DialogModule, DropdownModule],
    template: `
        <div class="create-post-container">
            <div class="create-post-header mb-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">Create New Post</h1>
                        <p class="text-muted-color">Share your thoughts and ideas with the community</p>
                    </div>
                    <p-button label="Cancel" icon="pi pi-times" routerLink="/blog" [outlined]="true" severity="secondary"> </p-button>
                </div>
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage" class="mb-4">
                <p-message severity="success" [text]="successMessage"></p-message>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mb-4">
                <p-message severity="error" [text]="errorMessage"></p-message>
            </div>

            <p-card>
                <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
                    <!-- Title Field -->
                    <div class="form-field mb-6">
                        <label for="title" class="block text-surface-900 dark:text-surface-0 font-medium mb-2"> Title * </label>
                        <input pInputText id="title" type="text" placeholder="Enter your post title..." class="w-full" formControlName="title" [class.ng-invalid]="postForm.get('title')?.invalid && postForm.get('title')?.touched" maxlength="200" />

                        <small class="text-muted-color"> {{ postForm.get('title')?.value?.length || 0 }}/200 characters </small>

                        <div *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched" class="text-red-500 text-sm mt-1">
                            <div *ngIf="postForm.get('title')?.errors?.['required']">Title is required</div>
                            <div *ngIf="postForm.get('title')?.errors?.['minlength']">Title must be at least 5 characters long</div>
                            <div *ngIf="postForm.get('title')?.errors?.['maxlength']">Title cannot exceed 200 characters</div>
                        </div>
                    </div>

                    <!-- Body Field -->
                    <div class="form-field mb-6">
                        <label for="body" class="block text-surface-900 dark:text-surface-0 font-medium mb-2"> Content * </label>
                        <textarea
                            pInputTextarea
                            id="body"
                            placeholder="Write your post content here..."
                            class="w-full"
                            formControlName="body"
                            [class.ng-invalid]="postForm.get('body')?.invalid && postForm.get('body')?.touched"
                            [rows]="12"
                            autoResize="true"
                            maxlength="10000"
                        >
                        </textarea>

                        <small class="text-muted-color"> {{ postForm.get('body')?.value?.length || 0 }}/10,000 characters </small>

                        <div *ngIf="postForm.get('body')?.invalid && postForm.get('body')?.touched" class="text-red-500 text-sm mt-1">
                            <div *ngIf="postForm.get('body')?.errors?.['required']">Content is required</div>
                            <div *ngIf="postForm.get('body')?.errors?.['minlength']">Content must be at least 50 characters long</div>
                            <div *ngIf="postForm.get('body')?.errors?.['maxlength']">Content cannot exceed 10,000 characters</div>
                        </div>
                    </div>

                    <!-- Form Preview -->
                    <div *ngIf="showPreview" class="form-field mb-6">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-3">Preview</h3>
                        <div class="preview-container p-4 border border-surface-border rounded-md bg-surface-50 dark:bg-surface-800">
                            <h4 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-3">
                                {{ postForm.get('title')?.value || 'Untitled Post' }}
                            </h4>
                            <div class="text-surface-700 dark:text-surface-200 leading-relaxed">
                                <div [innerHTML]="getFormattedPreview()"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-3 justify-between">
                        <div class="flex gap-3">
                            <p-button type="button" label="Generate with AI" icon="pi pi-magic" [outlined]="true" (onClick)="openAIDialog()" [disabled]="isGeneratingAI">
                                <i class="pi pi-spin pi-spinner" *ngIf="isGeneratingAI"></i>
                            </p-button>
                        </div>

                        <div class="flex gap-3">
                            <p-button type="button" label="Cancel" icon="pi pi-times" [outlined]="true" severity="secondary" routerLink="/blog" [disabled]="isSubmitting"> </p-button>

                            <p-button type="submit" label="Publish Post" icon="pi pi-send" [disabled]="postForm.invalid || isSubmitting" [loading]="isSubmitting"> </p-button>
                        </div>
                    </div>
                </form>
            </p-card>

            <!-- Writing Tips -->
            <div class="writing-tips-section">
                <p-card>
                    <ng-template pTemplate="header">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-lightbulb"></i>
                            <span>Writing Tips</span>
                        </div>
                    </ng-template>

                    <div>
                        <ul>
                            <li>Use a clear, descriptive title that captures your main idea</li>
                            <li>Structure your content with paragraphs for better readability</li>
                            <li>Consider your audience and write in an engaging tone</li>
                            <li>Use the preview feature to see how your post will look</li>
                            <li>Save as draft if you need to come back and finish later</li>
                        </ul>
                    </div>
                </p-card>
            </div>
        </div>

        <!-- AI Generation Dialog -->
        <p-dialog header="Generate Content with AI" [(visible)]="showAIDialog" [modal]="true" [style]="{ width: '600px' }" [draggable]="false" [resizable]="false">
            <div class="ai-dialog-content">
                <div class="mb-4">
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Topic or Prompt</label>
                    <textarea
                        pInputTextarea
                        [(ngModel)]="aiPrompt"
                        placeholder="Describe what kind of blog post you want to generate (e.g., 'Write about modern web development practices' or 'Create a post about AI in software development')"
                        [rows]="4"
                        class="w-full"
                        [disabled]="isGeneratingAI"
                    >
                    </textarea>
                </div>

                <div class="mb-4">
                    <label class="block text-surface-900 dark:text-surface-0 font-medium mb-2">Quick Prompts</label>
                    <div class="flex flex-wrap gap-2">
                        <p-button *ngFor="let quickPrompt of quickPrompts" [label]="quickPrompt.label" [outlined]="true" size="small" (onClick)="selectQuickPrompt(quickPrompt.prompt)" [disabled]="isGeneratingAI"> </p-button>
                    </div>
                </div>

                <div *ngIf="aiError" class="mb-4">
                    <p-message severity="error" [text]="aiError"></p-message>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-between">
                    <p-button label="Cancel" icon="pi pi-times" [outlined]="true" (onClick)="closeAIDialog()" [disabled]="isGeneratingAI"> </p-button>
                    <p-button label="Generate Content" icon="pi pi-magic" (onClick)="generateAIContent()" [loading]="isGeneratingAI" [disabled]="!aiPrompt || isGeneratingAI"> </p-button>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class CreatePostComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    postForm: FormGroup;
    isSubmitting = false;
    showPreview = false;
    successMessage = '';
    errorMessage = '';

    // AI Generation properties
    showAIDialog = false;
    aiPrompt = '';
    isGeneratingAI = false;
    aiError = '';
    quickPrompts = [
        { label: 'Web Development Tips', prompt: 'Create a blog post about modern web development best practices and tips for developers' },
        { label: 'AI in Software', prompt: 'Write about how artificial intelligence is transforming software development and programming' },
        { label: 'Career Advice', prompt: 'Create a post with career advice for software developers and tech professionals' },
        { label: 'Technology Trends', prompt: 'Write about current technology trends and their impact on the industry' },
        { label: 'Programming Tips', prompt: 'Share useful programming tips and tricks for developers' }
    ];

    constructor(
        private fb: FormBuilder,
        private blogService: BlogService,
        private authService: AuthService,
        private router: Router
    ) {
        this.postForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
            body: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(10000)]]
        });
    }

    ngOnInit() {
        // Check if user is authenticated
        this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe((isAuth) => {
            if (!isAuth) {
                this.router.navigate(['/auth/login']);
            }
        });

        // Load any saved draft
        this.loadDraft();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit() {
        if (this.postForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            this.errorMessage = '';
            this.successMessage = '';

            const postData: CreateBlogPostRequest = {
                title: this.postForm.get('title')?.value,
                description: this.postForm.get('body')?.value
            };

            this.blogService
                .createPost(postData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (newPost) => {
                        this.isSubmitting = false;
                        this.successMessage = 'Post published successfully!';

                        // Clear any saved draft
                        this.clearDraft();

                        // Navigate to the new post after a short delay
                        setTimeout(() => {
                            this.router.navigate(['/blog/post', newPost.id]);
                        }, 1500);
                    },
                    error: (error) => {
                        this.isSubmitting = false;
                        this.errorMessage = error || 'Failed to publish post. Please try again.';
                    }
                });
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.postForm.controls).forEach((key) => {
                this.postForm.get(key)?.markAsTouched();
            });
        }
    }

    togglePreview() {
        this.showPreview = !this.showPreview;
    }

    getFormattedPreview(): string {
        const body = this.postForm.get('body')?.value || '';
        if (!body.trim()) {
            return '<p class="text-muted-color italic">Start writing to see preview...</p>';
        }

        // Convert line breaks to HTML paragraphs
        const paragraphs = body
            .split('\n\n')
            .map((paragraph: string) => paragraph.trim())
            .filter((paragraph: string) => paragraph.length > 0)
            .map((paragraph: string) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
            .join('');

        return paragraphs || '<p class="text-muted-color italic">No content to preview</p>';
    }

    saveDraft() {
        if (this.postForm.valid) {
            const draft = {
                title: this.postForm.get('title')?.value,
                body: this.postForm.get('body')?.value,
                savedAt: new Date().toISOString()
            };

            localStorage.setItem('blog_post_draft', JSON.stringify(draft));
            this.successMessage = 'Draft saved successfully!';

            // Clear success message after 3 seconds
            setTimeout(() => {
                this.successMessage = '';
            }, 3000);
        }
    }

    private loadDraft() {
        const draftJson = localStorage.getItem('blog_post_draft');
        if (draftJson) {
            try {
                const draft = JSON.parse(draftJson);
                this.postForm.patchValue({
                    title: draft.title,
                    body: draft.body
                });

                // Show info about loaded draft
                const savedAt = new Date(draft.savedAt).toLocaleString();
                this.successMessage = `Draft loaded from ${savedAt}`;

                // Clear message after 5 seconds
                setTimeout(() => {
                    this.successMessage = '';
                }, 5000);
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }
    }

    private clearDraft() {
        localStorage.removeItem('blog_post_draft');
    }

    // AI Generation methods
    openAIDialog() {
        this.showAIDialog = true;
        this.aiError = '';
    }

    closeAIDialog() {
        this.showAIDialog = false;
        this.aiPrompt = '';
        this.aiError = '';
    }

    selectQuickPrompt(prompt: string) {
        this.aiPrompt = prompt;
    }

    generateAIContent() {
        if (!this.aiPrompt.trim()) {
            this.aiError = 'Please enter a prompt for AI generation';
            return;
        }

        this.isGeneratingAI = true;
        this.aiError = '';

        this.blogService
            .generateAIContent(this.aiPrompt)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (generatedContent) => {
                    this.isGeneratingAI = false;

                    // Populate the form with generated content
                    this.postForm.patchValue({
                        title: generatedContent.title,
                        body: generatedContent.description
                    });

                    // Close the dialog
                    this.closeAIDialog();

                    // Show success message
                    this.successMessage = 'AI content generated successfully! You can now edit and publish your post.';
                },
                error: (error) => {
                    this.isGeneratingAI = false;
                    this.aiError = error || 'Failed to generate AI content. Please try again.';
                }
            });
    }
}
