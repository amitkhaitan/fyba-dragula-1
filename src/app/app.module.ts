import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragulaModule, DragulaService} from 'ng2-dragula';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { WorkbenchComponent } from './workbench/workbench.component';
import { DataService } from './data.service';
import { MomentModule } from 'ngx-moment';


@NgModule({
  declarations: [
    AppComponent, 
    WorkbenchComponent
  ],
  imports: [
    BrowserModule,
    DragulaModule,
    HttpClientModule,
    MomentModule
  ],
  providers: [DataService, DragulaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
