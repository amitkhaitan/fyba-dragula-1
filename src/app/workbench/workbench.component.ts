import { Component, OnInit } from '@angular/core';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { DataService } from './../data.service';
import { WorkBench } from './workbench.model';

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.css']
})
export class WorkbenchComponent implements OnInit {

  jsonVar: WorkBench = null;

  ngOnInit() {
    this.dataService.getWorkbenchData()
    .subscribe(
      (res)=>{
        this.jsonVar = res;    
        console.log(this.jsonVar);
        
      },
      ()=>{
        console.log(this.jsonVar);
       
      }
    )

  }

  constructor(public dataService: DataService
    , private dragulaService: DragulaService) {
    dragulaService.drag.subscribe((value) => {
      this.onDrag(value.slice(1));
    });
    dragulaService.drop.subscribe((value) => {
      this.onDrop(value.slice(1));
    });
    dragulaService.over.subscribe((value) => {
      this.onOver(value.slice(1));
    });
    dragulaService.out.subscribe((value) => {
      this.onOut(value.slice(1));
    });
    dragulaService.setOptions('slots', {
      removeOnSpill: false
    });

  }

  private hasClass(el: any, name: string) {
    return new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)').test(el.className);
  }

  private addClass(el: any, name: string) {
    if (!this.hasClass(el, name)) {
      el.className = el.className ? [el.className, name].join(' ') : name;
    }
  }

  private removeClass(el: any, name: string) {
    if (this.hasClass(el, name)) {
      el.className = el.className.replace(new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)', 'g'), '');
    }
  }

  private onDrag(args) {
    console.log("Drag");
    console.log(args);
    let [e, el] = args;
    // console.log(el);
    // console.log(e);
    // console.log(e.id);
 
  }

  private onDrop(args) {    
    console.log("Drop");
    console.log(args);
    let [e, el] = args;
    console.log(e);
    console.log(el);
    if(e.id=='timeSlot'&& el.id=='nullSlot'){
      console.log("TimeSlot to nullSlot");
    }
    else if(e.id=='freeGame' && el.id=='blankDiv'){
      
      console.log("freeGame to BlankDiv");
    }
  
  } 

  private onOver(args) {
    let [e, el, container] = args;
    console.log("over");
    console.log(e);
    console.log(el);
    console.log(container);
    console.log("Child Element");
    const hostElem = e.nativeElement;
    console.log(hostElem.children);
    this.addClass(e, 'dragOver');
  }

  private onOut(args) {
    //console.log("out");
    let [e, el, container] = args;
    this.removeClass(e, 'dragOver');
  }

}
