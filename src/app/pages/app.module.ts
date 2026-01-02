import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from '../app.component'
import {WjCoreModule} from '@mescius/wijmo.angular2.core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    WjCoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
