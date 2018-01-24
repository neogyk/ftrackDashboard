import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import 'hammerjs';
import { RouterModule, Routes } from '@angular/router';
import { NgDatepickerModule } from 'ng2-datepicker';

const appRoutes: Routes = [
    {
        path      : '**',
        //comonent: [YourImportedComponentClass]
    },

];

@NgModule({
  declarations: [
    AppComponent

  ],
  imports: [
    BrowserModule,
    NgDatepickerModule,
    BrowserAnimationsModule,
    HttpClientModule,


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
