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

  constructor(public bsModalRef: BsModalRef, public dataService: DataService) {}

  ngOnInit(){
    
  }

  yes(){
    this.dataService.timeSlotSubject.next(true);
    this.bsModalRef.hide();
  }

  no(){
    this.dataService.timeSlotSubject.next(false);
    this.bsModalRef.hide();
  }

  


}
