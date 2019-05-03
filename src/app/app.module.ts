import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {DragulaModule} from 'ng2-dragula';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import { JqComponent } from './jq/jq.component';
import { Drop2Component } from './drop2/drop2.component';


@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    JqComponent,
    Drop2Component
  ],
  imports: [
    BrowserModule,
    DragulaModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
