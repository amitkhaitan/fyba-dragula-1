import { NgModule } from "@angular/core";
import { Routes, RouterModule, Router } from "@angular/router";
import { WorkbenchComponent } from './workbench/workbench.component';

const routes: Routes = [
    {path: '', component: WorkbenchComponent}
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}

  
