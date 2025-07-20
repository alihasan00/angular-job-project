export interface BlogPost {
    id: number;
    title: string;
    body: string; // Frontend uses 'body', backend uses 'description'
    description?: string; // Backend field name
    excerpt?: string;
    author: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    publishedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateBlogPostRequest {
    title: string;
    description: string; // Backend expects 'description' instead of 'body'
}

export interface BlogPostsResponse {
    posts: BlogPost[];
    total: number;
    page: number;
    limit: number;
}
