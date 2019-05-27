import { Component } from '@angular/core';

import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Testing ng2-dragula';
  abc = 1; 

  constructor(private dragulaService: DragulaService) {
    this.abc = 1
    
   
  }

  
  
  ngOnInit() {
    //var json = { "key1" : "watevr1", "key2" : "watevr2", "key3" : "watevr3" };
    //console.log( getObjectKeyIndex(json, 'key3') ); 
    //function getObjectKeyIndex(obj, keyToFind) {
    //var i = 0, key;
    //for (key in obj) {
    //    if (key == keyToFind) {
    //        return i;
    //    }

    //    i++;
    //}
    //return null;
 // }
  }

  }
        

