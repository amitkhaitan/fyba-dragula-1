import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { DataService } from './../data.service';
import { WorkBench, AllGameBox, AllBox, FreeGames, AllSlotBox, allSlots } from './workbench.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.css']
})
export class WorkbenchComponent implements OnInit {
  @ViewChild('timeElement') private timeElement: ElementRef;
  @ViewChild('gameElement') private gameElement: ElementRef;
  jsonVar: WorkBench = null;
  subs = new Subscription();
  slots = "slots";

  ngOnInit() {
    this.dataService.getWorkbenchData()
      .subscribe(
        (res) => {
          this.jsonVar = res;
          console.log(this.jsonVar);
        }
      )

  }

  constructor(public dataService: DataService
    , private dragulaService: DragulaService) {
    dragulaService.createGroup("slots", {
      removeOnSpill: false,

      copy: (el, source) => {
        //The timeslot will be copied
        return source.id === 'timeSlots';
      },

      accepts: function (el, target, source, sibling) {
        if (source.id == 'freeGame' && target.id == 'blankSlot') {
          return true
        }

        else if (source.id == 'timeSlots' && target.id == 'nullSlot') {
          return true
        }

        else if (source.id == 'blankSlot' && target.id == 'nullSlot') {
          return true
        }

        else if (source.id == 'gameSlot' && target.id == 'freeGame') {
          return true
        }

        else if (source.id == 'gameSlot' && target.id == 'blankSlot') {
          //Game Slot will only be accepted if its duration is equal to TimeSlot Duration         
          let sourceDuration = parseInt(source.getAttribute("duration"));
          let targetDuration = parseInt(target.getAttribute("duration"));
          if(sourceDuration==targetDuration){           
            return true
          }         
        }

        else if (source.id == 'blankSlot' && target.id == 'timeSlotDelete') {
          return true
        }

        else if (source.id == 'timeSlots' && target.id == 'blankSlot') {             
          return false;
        }

        else if(target==null){
          return false;
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
        //console.log("Target ID: " + target.id);
        console.log("Target");
        console.log(target);
        console.log("Element:");
        console.log(el.innerHTML);

        if (source.id == 'freeGame' && target.id == 'blankSlot') {
         this.freeGametoBlankSlot(name, el, target, source, sibling);
        }

        else if (source.id == 'timeSlots' && target.id == 'nullSlot') {         
          this.timeSlottoNullSlot(name, el, target, source, sibling);
        }


        else if (source.id == 'blankSlot' && target.id == 'nullSlot') {         
          this.blankSlottoNullSlot(name, el, target, source, sibling);
        }

        else if (source.id == 'gameSlot' && target.id == 'freeGame') {        
          this.gameSlottoFreeGames(name, el, target, source, sibling);         
        }

        else if (source.id == 'gameSlot' && target.id == 'blankSlot') {      
          this.gameSlottoBlankSlot(name, el, target, source, sibling);         
        }

        else if (source.id == 'blankSlot' && target.id == 'timeSlotDelete') {         
          this.deleteBlankSlot(name, el, target, source, sibling);         
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
            
                let allGameBox = new AllGameBox();
                allGameBox.AllBox = [];
                allGameBox.AllBox[0] = allBox;
                                                
                element.AllGameBox[0] = allGameBox;
              
              }
              
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
              }
           
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
                
              }
              
            }
          )
        }
      }
    )

    setTimeout(() => {
      console.log(this.jsonVar.allSlots);
    }, 500)

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
                
              }
            
            }
          )
        }
      }
    )



  }

  gameSlottoFreeGames(name, el, target, source, sibling) {
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

                element.AllGameBox.splice(0, 1);
             
                
              }
             
            }
          )
        }
      }
    )
    
    //Removing the un-necesary div created by dragula at the top
    let domElement : HTMLElement = this.gameElement.nativeElement;
    domElement.parentNode.removeChild(domElement);
    console.log(this.jsonVar.FreeGames);


  }

  gameSlottoBlankSlot(name, el, target, source, sibling) {
    console.log("Game Slot to Blank Slot");
    console.log("Source");
    console.log(source);
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);

    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
                console.log(element);
                element.IsBlankBox = false;
                element.IsGameBox = true;
                element.Duration = parseInt(source.attributes.getNamedItem('duration').value);               
                let allSlotsIndex = parseInt(source.getAttribute('allSlotsIndex'));
                let slotBoxIndex = parseInt(source.getAttribute('slotBoxIndex'));

                let allGameBox = new AllGameBox();
                allGameBox.TimeGroup = this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].AllGameBox[0].TimeGroup;
                allGameBox.AllBox = this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].AllGameBox[0].AllBox;

                element.AllGameBox.push(allGameBox);

                this.checkGameSlotPlacement(element);

                this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].AllGameBox = [];
                this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].IsBlankBox = false;
                this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].IsGameBox = false;

              
              }
             
            }
          )
        }
      }
    )

    setTimeout(() => {
      console.log(this.jsonVar.allSlots);
    }, 500)

  }

  deleteBlankSlot(name, el, target, source, sibling) {
    console.log("Delete Blank Slot");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);

    let allSlotsIndex = parseInt(source.getAttribute('allSlotsIndex'));
    let slotBoxIndex = parseInt(source.getAttribute('slotBoxIndex'));

    console.log(allSlotsIndex);

    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].IsBlankBox = true;
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].Height = "20px";
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].SlotColor = "";
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].Duration = 0;

    //Removing the un-necesary div created by dragula at the top
    let domElement : HTMLElement = this.timeElement.nativeElement;
    domElement.parentNode.removeChild(domElement);
    // this.draggableElement.nativeElement.style.display = "none";

  }

  checkGameSlotPlacement(allSlotBox: AllSlotBox){
    var gameSlotDetails = allSlotBox.AllGameBox[0].AllBox[0];
    var gameVolunteerList = gameSlotDetails.GameVolunteerList;

    for(var i=0; i<gameVolunteerList.length; ++i){
      this.jsonVar.allSlots.forEach(slot=>{
        slot.AllSlotBox.forEach(slotBox=>{
          slotBox.AllGameBox[0].AllBox[0].GameVolunteerList.forEach(volunteer=>{
            if(gameVolunteerList[i].VolunteerSeasonalId == volunteer.VolunteerSeasonalId){
              //So the same volunteer has another game scheduled on the same day
              if(allSlotBox.Location==slotBox.Location){
                //It means the volunteer is in the same location. So he can easily go to the next game
                //Okay
              }
              else{
                //Calculate time to move between both locations
                this.calculateTravelTime(allSlotBox, gameSlotDetails);
              
              }
            }
          })
        })
      })
    }

  }

  calculateTravelTime(allSlotBox : AllSlotBox, gameSlotDetails: AllBox){
    let gameSlotStartTime = Date.parse(gameSlotDetails.StartTime);
    console.log(gameSlotStartTime);
  }

}
