import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { variable } from '@angular/compiler/src/output/output_ast';
import {DragServiceService} from '../drag-service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import './external.js';
import * as $ from 'jquery';
import  '../../assets/jsonData.json' ;


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-drop2',
  templateUrl: './drop2.component.html',
  styleUrls: ['./drop2.component.css'],
  providers:[DragServiceService]
})



export class Drop2Component implements OnInit {
  jsonVar : Object;
  localGroup;
  localFlag;
  mainHTML;
  txta;
  divObj;
  divCounter;
 
  ngOnInit() {    
    
    this.getOrderSummary2();
    
    //this.testFunction1();
  }
  
testFunction1()
{
  $(document).ready(function(){
     $(".slotStyle").mousedown(function(){
    console.log("oop1");
    $("#hid").val($(this).html());
    $("#hidObjId").val($(this).attr("id"));
  });
   $(".slotStyle").mouseup(function(){
    console.log("oop2");
    let txta=$("#hid").val();
    let objId=$("#hidObjId").val();
    $("#"+objId).html("");
   $(this).html(txta.toString());
  
  });
  }); 

}



  constructor(private http:Http, private dragService: DragServiceService,private sanitizer: DomSanitizer) {
    this.localFlag=0;
    this.localGroup='0';
    this.dragService.show= false;    
    this.mainHTML="";
    this.divCounter=0;
    //webGlObject.init();
 }  

 

  getOrderSummary2(): any{ 
    console.log("Inside order summary 2");
    return this.http.get('../../assets/jsonData.json')
  .map((data: Response) => {

    return data.json() as JSON;
  }).toPromise().then(x =>{
    this.jsonVar = x;
    console.log(this.jsonVar);  
  });  
 
    }


getOrderSummary(): void{ 
  console.log("Inside order summary 1");
  this.http.get('../../assets/jsonData.json')
    .map((data: Response)=>{
      return data.json()
    }).toPromise().then(x =>{
      return Promise.resolve(this.jsonVar = x);
    });      
  }

  assignLocal(x){
    this.localGroup = x;
    this.localFlag = 1;
  }

createHTML(allSlots)
{
var l= allSlots.length;

for (let index = 0; index < l; index++) {
  var slot = allSlots[index];
  
  this.mainHTML+='<div style="width:20%; float:left;" id="11">';
  this.mainHTML+='<div style="background:#508abb; padding:0px; text-align:center; border-right:1px solid #6ea1cc;"> <span style="color:#fff; font-size:16px; font-weight:bold;">'+slot.Heading+'</span> </div>'
 //console.log(slot.Heading);
  var bl=slot.AllBox.length;
  this.localGroup=0;
  for (let index2 = 0; index2 < bl; index2++) {
    var box = slot.AllBox[index2];
    if (box.TimeGroup != this.localGroup)
                    {
                        if (this.localGroup == "0")
                        {
                          this.mainHTML+="<div  class='mainDiv'  style='padding:10px;text-align:center;position:relative;height:40px;text-align:center;border-top:1px solid #e1edff;border-right:1px solid #e1edff;background:#f4fbff;margin-top:0px;'>";
                        }
                        else
                        {
                          this.mainHTML+="</div>";
                          this.mainHTML+="<div class='mainDiv' style='padding:10px;text-align:center;position:relative;height:40px;text-align:center;border-top:1px solid #e1edff;border-right:1px solid #e1edff;background:#f4fbff;margin-top:0px;'>";
                        }

                        this.localGroup = box.TimeGroup;
                        if (box.BoxHeight != "0px")
                        {
                          this.divCounter++;
                          this.mainHTML+="<div class='slotStyle' id='divSlot_"+this.divCounter+"' style='position:absolute;background-color:" + box.BoxColor + ";left:0;top:" + box.BoxTop + ";border:1px solid #880000;height:" + box.BoxHeight + ";width:100%;z-index:1;font-size:8px;user-select: none;'>" + box.BoxValue + "</div>";
                        }
                        else
                        {
                          this.mainHTML+="<div style='position:absolute;left:0;top:0;border:0px solid #880000;height:0px;width:100%;z-index:1;'></div>";
                        }
                      }
                      else
                      {
                          if (box.BoxHeight != "0px")
                          {
                            this.divCounter++;
                            this.mainHTML+="<div class='slotStyle' id='divSlot_"+this.divCounter+"' style='position:absolute;background-color:" + box.BoxColor + ";left:0;top:" + box.BoxTop + ";border:1px solid #880000;height:" + box.BoxHeight + ";width:100%;z-index:1;font-size:8px;user-select: none;'>" + box.BoxValue + "</div>";
                          }
                          else
                          {
                            this.mainHTML+="<div style='position:absolute;left:0;top:0;border:0px solid #880000;height:0px;width:100%;z-index:1;'></div>";
                          }
                      }
                     
                     this.findLastIndex(slot.AllBox,box);
                      if (this.dragService.show)
                      {
                        this.mainHTML+="</div>";
                      }

                    }
                    this.mainHTML+="</div>";
                  }
                  
                  this.mainHTML = this.sanitizer.bypassSecurityTrustHtml(this.mainHTML);
                  //.log(this.mainHTML);
                }

  findLastIndex(slot,box){

 
   
    var l=Object.keys(slot).length;

  var element = slot[l-1];  
 
  if(box.BoxValue== element.BoxValue && box.TimeGroup == element.TimeGroup)
  {
    this.dragService.show=true;
  }
  else
  {
  this.dragService.show=false;
  }

  return this.dragService.show;
  }
}