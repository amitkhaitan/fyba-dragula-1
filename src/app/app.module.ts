import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragulaModule, DragulaService} from 'ng2-dragula';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { WorkbenchComponent } from './workbench/workbench.component';
import { DataService } from './data.service';
import { MomentModule } from 'ngx-moment';
import { ModalModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ValidationModalComponent } from './common/validation-modal/validation-modal.component';
import { TestComponent } from './test/test.component';
import { CssLoaderComponent } from './common/css-loader/css-loader.component';
import { ActivatedRoute, RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    AppComponent, 
    WorkbenchComponent,
    ValidationModalComponent,
    TestComponent,
    CssLoaderComponent
  ],
  imports: [
    BrowserModule,
    DragulaModule,
    HttpClientModule,
    MomentModule,
    RouterModule.forRoot([
      {
         path: '',
         component: WorkbenchComponent
      }
      //,

    //   //SeasonId=23&Period=3&GameScheduleId=1&LoginUserId=5
    //   {
    //     path: 'workbench/:id',
    //     component: WorkbenchComponent
    //  }
   ]),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  providers: [DataService, DragulaService],
  bootstrap: [AppComponent],
  entryComponents:[ValidationModalComponent]
})
export class AppModule { }
