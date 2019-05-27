import { Component, OnInit } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { DataService } from './../data.service';
import { WorkBench, AllGameBox, AllBox,FreeGames } from './workbench.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.css']
})
export class WorkbenchComponent implements OnInit {

  jsonVar: WorkBench = null;
  subs = new Subscription();
  slots = "slots";

  ngOnInit() {
    this.dataService.getWorkbenchData()
      .subscribe(
        (res) => {
          this.jsonVar = res;
          console.log(this.jsonVar);

        },
        () => {
          console.log(this.jsonVar);
        }
      )

  }

  constructor(public dataService: DataService
    , private dragulaService: DragulaService) {
    var that = this;
    dragulaService.createGroup("slots", {
      removeOnSpill: false,

      copy: (el, source) => {
        return source.id === 'timeSlots';
      },

      accepts: function (el, target, source, sibling) {  
        if (source.id == 'freeGame' && target.id == 'blankSlot') {
          //Done
          return true
        }

        else if (source.id == 'timeSlots' && target.id == 'nullSlot') {
          //Done
          return true
        }

        else if (source.id == 'blankSlot' && target.id == 'nullSlot') {
          //Done
          return true
        }

        else if (source.id == 'gameSlot' && target.id == 'freeGame') {
          //Doing
          return true
        }

        else if (source.id == 'gameSlot' && target.id == 'blankSlot') {
          return true
        }

        else if (source.id == 'blankSlot' && target.id == 'timeSlotDelete') {
          console.log("Blank Slot to TimeSlot Delete");
          return true
        }



      }

    });

    this.subs.add(this.dragulaService.drag('slots')
      .subscribe(({ name, el, source }) => {
        console.log("DRAG:");
        console.log("Source Id: " + source.id);
        console.log("Source");
        console.log(source);
        console.log("Element:");
        console.log(el.innerHTML);

      })
    );

    this.subs.add(this.dragulaService.drop('slots')
      .subscribe(({ name, el, target, source, sibling }) => {
        console.log("DROP: ");
        console.log("Source");
        console.log(source);
        console.log("Target ID: "+target.id);
        console.log("Target");
        console.log(target);
        console.log("Element:");
        console.log(el.innerHTML);


        if (source.id == 'freeGame' && target.id == 'blankSlot') {
          //Done
          this.freeGametoBlankSlot(name, el, target, source, sibling);
        }

        else if (source.id == 'timeSlots' && target.id == 'nullSlot') {
          //Done
          this.timeSlottoNullSlot(name, el, target, source, sibling);
        }


        else if (source.id == 'blankSlot' && target.id == 'nullSlot') {
          //Done
          this.blankSlottoNullSlot(name, el, target, source, sibling);
        }

        else if (source.id == 'gameSlot' && target.id == 'freeGame') {
          //Doing
          this.gameSlottoFreeGames(name, el, target, source, sibling);
          return true
        }

        else if (source.id == 'gameSlot' && target.children[0].id == 'blankSlot') {
          this.gameSlottoBlankSlot(name, el, target, source, sibling);
          return true
        }


        else if (source.id == 'blankSlot' && target.id == 'timeSlotDelete') {
          this.deleteBlankSlot(name, el, target, source, sibling);
          return true
        }



      })
    );

  }

  freeGametoBlankSlot(name, el, target, source, sibling) {
    console.log("Free Game To Blank Slot");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);
    
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {

                element.IsGameBox = true;
                element.SlotColor = "#16a085";
                console.log(element);
                var allBox = new AllBox();
                allBox.BoxColor = "#2980b9";
                allBox.BoxHeight = element.Height;
                allBox.BoxTop = "0px";
                allBox.BoxValue = el.innerHTML;
                allBox.Division = "4";
                allBox.Duration = 0;
                allBox.EndTime = "06:55 PM";
                allBox.StartTime = "06:00 PM";
                allBox.TimeGroup = "10";

                this.jsonVar.FreeGames.forEach(freegame => {
                  if (freegame.Name == el.innerHTML) {
                    allBox.GameVolunteerList = freegame.GameVolunteerList;
                  }
                });

                console.log("Element");
                console.log(element);

                let allGameBox = new AllGameBox();
                allGameBox.AllBox = [];
                allGameBox.AllBox[0] = allBox;
                //console.log(allGameBox);                                           
                element.AllGameBox[0] = allGameBox;
                console.log(slot);
              }
              //console.log(slot);
            }
          )
        }
      }
    )

  }


  timeSlottoNullSlot(name, el, target, source, sibling) {
    console.log("Time Slot to Null Slot");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);

    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
                element.Duration = parseInt(source.attributes.getNamedItem('tsDuration').value);
                element.Height = source.attributes.getNamedItem('tsHeight').value;
                element.IsBlankBox = false;
                element.SlotColor = "#16a085";
                //console.log(element);
              }
              //console.log(slot);
            }
          )
        }
      }
    )
  }

  blankSlottoNullSlot(name, el, target, source, sibling) {
    console.log(this.jsonVar.allSlots);
    console.log("Blank Slot to Null Slot");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);

    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
                element.Duration = parseInt(source.attributes.getNamedItem('duration').value);
                element.Height = source.attributes.getNamedItem('boxheight').value;
                element.IsBlankBox = false;
                element.IsGameBox = false;
                element.SlotColor = "#16a085";
                //console.log(element);
              }
              //console.log(slot);
            }
          )
        }       
      }
    )

    setTimeout(()=>{
      console.log(this.jsonVar.allSlots);
    },500)
    
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == source.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == source.attributes.getNamedItem('starttime').value) {
                element.Duration = 0;
                element.Height = "20px";
                element.IsBlankBox = true;
                element.IsGameBox = false;
                element.SlotColor = "";
                //console.log(element);
              }
              //console.log(slot);
            }
          )
        }
      }
    )

   

  }

  gameSlottoFreeGames(name, el, target, source, sibling){
    console.log("GameSlot Slot to Free Games");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == source.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == source.attributes.getNamedItem('starttime').value) {
               
          
                this.jsonVar.FreeGames.push({
                  Division: element.AllGameBox[0].AllBox[0].Division,
                  GameDivId: element.AllGameBox[0].AllBox[0].GameDivId,
                  GameVolunteerList: element.AllGameBox[0].AllBox[0].GameVolunteerList,
                  Name: element.AllGameBox[0].AllBox[0].BoxValue
                });
                
                element.AllGameBox.splice(0,1)
                //console.log(element);
              }
              //console.log(slot);
            }
          )
        }       
      }
    )

    console.log(this.jsonVar.FreeGames);


  }

  gameSlottoBlankSlot(name, el, target, source, sibling){
    console.log("Game Slot to Blank Slot");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);
  }

  deleteBlankSlot(name, el, target, source, sibling){
    console.log("Delete Blank Slot");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);

  }

}
