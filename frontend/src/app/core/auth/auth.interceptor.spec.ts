import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHeaders, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
    let http: HttpClient;
    let backend: HttpTestingController;
    // Only the parts of Router the interceptor uses.
    let router: { navigate: Mock; url: string };

    beforeEach(() => {
        router = {
            navigate: vi.fn().mockName("Router.navigate"),
            url: '/student-dashboard'
        };
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
                { provide: Router, useValue: router },
            ],
        });
        http = TestBed.inject(HttpClient);
        backend = TestBed.inject(HttpTestingController);
        sessionStorage.setItem('token', 'abc.def.ghi');
    });

    afterEach(() => {
        backend.verify();
        sessionStorage.clear();
    });

    it('adds the token to API requests', () => {
        http.get(`${environment.apiUrl}/student/1`).subscribe();

        const req = backend.expectOne(`${environment.apiUrl}/student/1`);
        expect(req.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
        req.flush({});
    });

    it('does not send the token to other servers', () => {
        http.get('https://example.com/data').subscribe();

        const req = backend.expectOne('https://example.com/data');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('logs the user out when their session has expired', () => {
        http.get(`${environment.apiUrl}/student/1`).subscribe({ error: () => { } });

        backend.expectOne(`${environment.apiUrl}/student/1`).flush(null, {
            status: 401,
            statusText: 'Unauthorized',
            headers: new HttpHeaders({ 'WWW-Authenticate': 'Bearer' }),
        });

        expect(sessionStorage.getItem('token')).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith(['login'], { queryParams: { returnUrl: '/student-dashboard' } });
    });

    it('leaves other 401s, like an expired join link, to the page', () => {
        http.get(`${environment.apiUrl}/getclassjointoken/xyz`).subscribe({ error: () => { } });

        backend.expectOne(`${environment.apiUrl}/getclassjointoken/xyz`).flush(null, { status: 401, statusText: 'Unauthorized' });

        expect(sessionStorage.getItem('token')).toBe('abc.def.ghi');
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
