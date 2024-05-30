import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule} from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { PdfDownloadComponent } from 'ngx-extended-pdf-viewer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule), provideAnimationsAsync(),    
    JwtHelperService, { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    PdfDownloadComponent,
    
    
  ]
};
