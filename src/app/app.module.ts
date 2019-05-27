import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragulaModule} from 'ng2-dragula';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import { WorkbenchComponent } from './workbench/workbench.component';
import { DataService } from './data.service';


@NgModule({
  declarations: [
    AppComponent,
    TestComponent,  
    WorkbenchComponent
  ],
  imports: [
    BrowserModule,
    DragulaModule,
    HttpModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
