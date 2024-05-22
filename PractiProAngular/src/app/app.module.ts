import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { MaterialModule } from "../material.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { JwtModule, } from '@auth0/angular-jwt';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { RouterModule } from "@angular/router";
import { routes } from "./app.routes";


@NgModule({
    declarations: [
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        RouterModule.forRoot(routes, { useHash: true })
    ],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
})
export class AppModule {

}