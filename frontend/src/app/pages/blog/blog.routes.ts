import { Routes } from '@angular/router';
import { BlogHomeComponent } from './home';
import { PostDetailComponent } from './post-detail';
import { CreatePostComponent } from './create-post';
import { AuthGuard } from '../../guards/auth.guard';

export const blogRoutes: Routes = [
    {
        path: '',
        component: BlogHomeComponent
    },
    {
        path: 'post/:id',
        component: PostDetailComponent
    },
    {
        path: 'create',
        component: CreatePostComponent,
        canActivate: [AuthGuard]
    }
];

export default blogRoutes;
