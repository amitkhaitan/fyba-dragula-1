import { Component, OnInit, Inject } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DataService } from './../../data.service';

@Component({
  selector: 'app-validation-modal',
  templateUrl: './validation-modal.component.html',
  styleUrls: ['./validation-modal.component.css']
})
export class ValidationModalComponent implements OnInit {
  title:string;
  message:string;
  bgClass: string;
  isBlackout:boolean;
  isServerError:boolean;

  constructor(public bsModalRef: BsModalRef, public dataService: DataService) {}

  ngOnInit(){
    console.log(this.isServerError);
  }

  yes(){
    if(this.isBlackout){
      this.dataService.blackoutSubject.next(true);
    }
    else{
      this.dataService.timeSlotSubject.next(true);
    }
  
    this.bsModalRef.hide();
  }

  no(){
    if(this.isBlackout){
      this.dataService.blackoutSubject.next(false);
    }
    else{
      this.dataService.timeSlotSubject.next(false);
    }
  
    this.bsModalRef.hide();
  }

  


}
