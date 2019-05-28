import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragulaModule, DragulaService} from 'ng2-dragula';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import { WorkbenchComponent } from './workbench/workbench.component';
import { DataService } from './data.service';
import { MomentModule } from 'ngx-moment';


@NgModule({
  declarations: [
    AppComponent,
    TestComponent,  
    WorkbenchComponent
  ],
  imports: [
    BrowserModule,
    DragulaModule,
    HttpModule,
    MomentModule
  ],
  providers: [DataService, DragulaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
