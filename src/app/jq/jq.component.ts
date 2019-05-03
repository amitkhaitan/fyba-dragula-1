import { Component, OnInit } from '@angular/core';
declare var jQuery: any;
import { DragulaService } from 'ng2-dragula/ng2-dragula';

@Component({
  selector: 'app-jq',
  templateUrl: './jq.component.html',
  styleUrls: ['./jq.component.css']
})
export class JqComponent implements OnInit {

  x:boolean;
  constructor(private dragulaService: DragulaService) {
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
   }

  ngOnInit() {
    $( document ).ready(function() {
      function adjustLine(from, to, line){

        var fT = from.offsetTop  + from.offsetHeight/2;
        var tT = to.offsetTop 	 + to.offsetHeight/2;
        var fL = from.offsetLeft + from.offsetWidth/2;
        var tL = to.offsetLeft 	 + to.offsetWidth/2;
        
        var CA   = Math.abs(tT - fT);
        var CO   = Math.abs(tL - fL);
        var H    = Math.sqrt(CA*CA + CO*CO);
        var ANG  = 180 / Math.PI * Math.acos( CA/H );
      
        if(tT > fT){
            var top  = (tT-fT)/2 + fT;
        }else{
            var top  = (fT-tT)/2 + tT;
        }
        if(tL > fL){
            var left = (tL-fL)/2 + fL;
        }else{
            var left = (fL-tL)/2 + tL;
        }
      
        if(( fT < tT && fL < tL) || ( tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)){
          ANG *= -1;
        }
        top-= H/2;
      
        line.style["-webkit-transform"] = 'rotate('+ ANG +'deg)';
        line.style["-moz-transform"] = 'rotate('+ ANG +'deg)';
        line.style["-ms-transform"] = 'rotate('+ ANG +'deg)';
        line.style["-o-transform"] = 'rotate('+ ANG +'deg)';
        line.style["-transform"] = 'rotate('+ ANG +'deg)';
        line.style.top    = top+'px';
        line.style.left   = left+'px';
        line.style.height = H + 'px';
      }

      adjustLine(
        document.getElementById('my1'), 
        document.getElementById('my3'),
        document.getElementById('line1')
      );
 
    });
  } 

  private onDrag(args) {
    let [e, el] = args;
    
  }

  private onDrop(args) {
    let [e, el] = args;
    this.abc();
  }

  private onOver(args) {
    let [e, el, container] = args;
  
  }

  private onOut(args) {
    let [e, el, container] = args;
  
  }

  abc(){   function adjustLine(from, to, line){

    var fT = from.offsetTop  + from.offsetHeight/2;
    var tT = to.offsetTop 	 + to.offsetHeight/2;
    var fL = from.offsetLeft + from.offsetWidth/2;
    var tL = to.offsetLeft 	 + to.offsetWidth/2;
    
    var CA   = Math.abs(tT - fT);
    var CO   = Math.abs(tL - fL);
    var H    = Math.sqrt(CA*CA + CO*CO);
    var ANG  = 180 / Math.PI * Math.acos( CA/H );
  
    if(tT > fT){
        var top  = (tT-fT)/2 + fT;
    }else{
        var top  = (fT-tT)/2 + tT;
    }
    if(tL > fL){
        var left = (tL-fL)/2 + fL;
    }else{
        var left = (fL-tL)/2 + tL;
    }
  
    if(( fT < tT && fL < tL) || ( tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)){
      ANG *= -1;
    }
    top-= H/2;
  
    line.style["-webkit-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-moz-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-ms-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-o-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-transform"] = 'rotate('+ ANG +'deg)';
    line.style.top    = top+'px';
    line.style.left   = left+'px';
    line.style.height = H + 'px';
  }

  adjustLine(
    document.getElementById('my1'), 
    document.getElementById('my3'),
    document.getElementById('line1')
  );
  adjustLine(
    document.getElementById('my2'), 
    document.getElementById('my3'),
    document.getElementById('line2')
  );
  }

}
