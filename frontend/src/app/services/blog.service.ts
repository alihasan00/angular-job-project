import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, map, catchError, throwError } from 'rxjs';
import { BlogPost, CreateBlogPostRequest, BlogPostsResponse } from '../models/blog-post.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class BlogService {
    private readonly API_URL = 'http://localhost:3000/api/blog';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    /**
     * Get blog posts with pagination
     */
    getPosts(page: number = 1, limit: number = 5): Observable<BlogPostsResponse> {
        const url = `${this.API_URL}?page=${page}&limit=${limit}`;

        return this.http
            .get<any>(url, {
                headers: this.getPublicHeaders()
            })
            .pipe(
                map((response) => ({
                    posts: response.posts.map((post: any) => this.mapApiPostToBlogPost(post)),
                    total: response.pagination.totalPosts,
                    page: response.pagination.currentPage,
                    limit: response.pagination.postsPerPage
                })),
                catchError(this.handleError)
            );
    }

    /**
     * Get all blog posts (for search functionality)
     */
    getAllPosts(): Observable<BlogPost[]> {
        return this.http
            .get<any>(`${this.API_URL}?limit=1000`, {
                headers: this.getPublicHeaders()
            })
            .pipe(
                map((response) => response.posts.map((post: any) => this.mapApiPostToBlogPost(post))),
                catchError(this.handleError)
            );
    }

    /**
     * Get a single blog post by ID
     */
    getPostById(id: number): Observable<BlogPost | null> {
        return this.http
            .get<any>(`${this.API_URL}/${id}`, {
                headers: this.getPublicHeaders()
            })
            .pipe(
                map((response) => this.mapApiPostToBlogPost(response)),
                catchError((error) => {
                    if (error.status === 404) {
                        return of(null);
                    }
                    return this.handleError(error);
                })
            );
    }

    /**
     * Create a new blog post
     */
    createPost(postData: CreateBlogPostRequest): Observable<BlogPost> {
        return this.http
            .post<any>(this.API_URL, postData, {
                headers: this.getAuthenticatedHeaders()
            })
            .pipe(
                map((response) => this.mapApiPostToBlogPost(response)),
                catchError(this.handleError)
            );
    }

    /**
     * Generate AI content for a new post
     */
    generateAIContent(prompt: string): Observable<{ title: string; description: string }> {
        return this.http
            .post<any>(
                `${this.API_URL}/generate-ai`,
                { prompt },
                {
                    headers: this.getAuthenticatedHeaders()
                }
            )
            .pipe(
                map((response) => response.generatedContent),
                catchError(this.handleError)
            );
    }

    /**
     * Search posts by title or content
     */
    searchPosts(query: string): Observable<BlogPost[]> {
        return this.getAllPosts().pipe(map((posts) => posts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()) || post.body.toLowerCase().includes(query.toLowerCase()))));
    }

    /**
     * Get posts by author
     */
    getPostsByAuthor(authorId: number): Observable<BlogPost[]> {
        return this.getAllPosts().pipe(map((posts) => posts.filter((post) => post.author.id === authorId)));
    }

    /**
     * Map API response to BlogPost interface
     */
    private mapApiPostToBlogPost(apiPost: any): BlogPost {
        return {
            id: apiPost.id,
            title: apiPost.title,
            body: apiPost.description, // Backend uses 'description', frontend expects 'body'
            excerpt: this.generateExcerpt(apiPost.description),
            author: {
                id: apiPost.author.id,
                firstName: apiPost.author.firstName,
                lastName: apiPost.author.lastName,
                email: apiPost.author.email
            },
            publishedDate: new Date(apiPost.createdAt),
            createdAt: new Date(apiPost.createdAt),
            updatedAt: new Date(apiPost.updatedAt)
        };
    }

    /**
     * Generate excerpt from body text
     */
    private generateExcerpt(body: string): string {
        const maxLength = 200;
        if (body.length <= maxLength) {
            return body;
        }
        return body.substring(0, maxLength).trim() + '...';
    }

    /**
     * Get public HTTP headers (no authentication required)
     */
    private getPublicHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json'
        });
    }

    /**
     * Get authenticated HTTP headers
     */
    private getAuthenticatedHeaders(): HttpHeaders {
        return this.authService.getAuthenticatedHeaders();
    }

    /**
     * Handle HTTP errors
     */
    private handleError = (error: any): Observable<never> => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
        } else {
            // Server-side error
            if (error.status === 401) {
                errorMessage = 'Authentication required';
            } else if (error.status === 400) {
                errorMessage = error.error?.message || 'Bad request';
            } else if (error.status === 404) {
                errorMessage = 'Blog post not found';
            } else if (error.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else {
                errorMessage = error.error?.message || `Error Code: ${error.status}`;
            }
        }

        console.error('Blog Service Error:', error);
        return throwError(() => errorMessage);
    };
}
