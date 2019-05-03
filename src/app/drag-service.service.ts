import { Injectable } from '@angular/core';

@Injectable()
export class DragServiceService {

  public show: boolean; 

  constructor() {
    this.show = false;
    
   }

}
