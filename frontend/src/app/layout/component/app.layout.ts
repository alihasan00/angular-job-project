import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppTopbar } from './app.topbar';
import { AppFooter } from './app.footer';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, AppTopbar, AppFooter, RouterModule],
    template: `
        <div class="min-h-screen bg-surface-ground flex flex-col">
            <app-topbar></app-topbar>
            <main class="flex-1 pt-16">
                <router-outlet></router-outlet>
            </main>
            <app-footer></app-footer>
        </div>
    `
})
export class AppLayout {}
