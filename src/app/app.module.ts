import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatMenuModule} from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductComponent } from './product/product.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import {FormsModule} from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import { HttpClientModule } from '@angular/common/http';
import { BigvaluePipe } from './bigvalue.pipe';
import { TimePipe } from './time.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ProductComponent,
    BigvaluePipe,
    TimePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
