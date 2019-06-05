import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { DataService } from './../data.service';
import { CurrentPeriodSlot, AllGameBox, AllBox, FreeGames, AllSlotBox, allSlots } from '../models/workbench.model';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { RootModel } from '../models/root.model';

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.css']
})
export class WorkbenchComponent implements OnInit {
  @ViewChild('timeElement') private timeElement: ElementRef;
  @ViewChild('gameElement') private gameElement: ElementRef;
  responseData: RootModel = null;
  jsonVar: CurrentPeriodSlot = null;
  subs = new Subscription();
  slots = "slots";

  ngOnInit() {

    // var startingTime = "8:30 PM";
    // var endTime = "9:30 AM";
    // var date1 = moment(startingTime, "HH:mm A").format('hh:mm A');
    // var date2 = moment(endTime, "HH:mm A").format('hh:mm A');  
    // console.log(this.convertMinsToHrsMins("85"));
    // console.log(moment(startingTime, "HH:mm A").add(85,"minutes").format('hh:mm A'));
    // var x = moment(startingTime, "HH:mm A").isBefore(moment(endTime, "HH:mm A"));
    // console.log(x);

    this.dataService.getWorkbenchData()
      .subscribe(
        (res) => {
          this.responseData = res;
          console.log(this.responseData);
          //console.log(JSON.stringify(this.responseData));
          this.jsonVar = this.responseData.CurrentPeriodSlot;
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
          if (sourceDuration == targetDuration) {
            return true
          }
        }

        else if (source.id == 'blankSlot' && target.id == 'timeSlotDelete') {
          return true
        }

        else if (source.id == 'timeSlots' && target.id == 'blankSlot') {
          return false;
        }

        else if (target == null) {
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

  get miniDatabase(){
    return this.responseData.MiniDatabase;
  }

  freeGametoBlankSlot(name, el, target, source, sibling) {
    console.log("Free Game To Blank Slot");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);
    console.log(el);
    console.log(el.getAttribute("GameName"));
    
    this.jsonVar.allSlots.forEach(
      slot => {

        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {

              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {

                element.IsGameBox = true;
                element.SlotColor = "#16a085";

                var allBox = new AllBox();
                allBox.BackgroundColor = "#2980b9"
                allBox.BoxColor = "#2980b9";
                allBox.BoxHeight = element.Height;
                allBox.BoxTop = "0px";
                allBox.BoxValue = el.getAttribute("GameName");
                allBox.Division = "4";
                allBox.Duration = target.getAttribute("duration");                
                allBox.StartTime = target.attributes.getNamedItem('starttime').value;                              
                allBox.EndTime =  moment(allBox.StartTime,"hh:mm A").add(allBox.Duration,"minutes").format("hh:mm A");               
                allBox.TimeGroup = "10";

                console.log("Flag");


                this.jsonVar.FreeGames.forEach(freegame => {
                  if (freegame.Name == el.getAttribute("GameName")) {
                    allBox.GameVolunteerList = freegame.GameVolunteerList;
                  }
                });

                let allGameBox = new AllGameBox();
                allGameBox.AllBox = [];
                allGameBox.AllBox[0] = allBox;
                element.AllGameBox[0] = allGameBox;                

                this.checkGameSlotPlacement(element);


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
    let domElement: HTMLElement = this.gameElement.nativeElement;
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
                console.log("Flag");

                console.log(this.jsonVar.allSlots);                

                this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].AllGameBox = [];
                this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].IsBlankBox = false;
                this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].IsGameBox = false;


                this.checkGameSlotPlacement(element);

              
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
    let domElement: HTMLElement = this.timeElement.nativeElement;
    domElement.parentNode.removeChild(domElement);
    // this.draggableElement.nativeElement.style.display = "none";

  }

  checkGameSlotPlacement(allSlotBox: AllSlotBox) {
    console.log("Checking Game Slot Placement");

    var gameSlotDetails = allSlotBox.AllGameBox[0].AllBox[0];   
    var gameVolunteerList = gameSlotDetails.GameVolunteerList;
    console.log("------------");
    console.log(allSlotBox.Location);
    console.log(allSlotBox.LocationId);
    console.log(allSlotBox);
   
    

    for (var i = 0; i < gameVolunteerList.length; ++i) {
      this.jsonVar.allSlots.forEach(slot => {
        slot.AllSlotBox.forEach(slotBox => {
          if (slotBox.AllGameBox.length > 0 && slotBox.IsGameBox) {
            slotBox.AllGameBox[0].AllBox[0].GameVolunteerList.forEach(volunteer => {
              if (gameVolunteerList[i].VolunteerSeasonalId == volunteer.VolunteerSeasonalId) {

                //So the same volunteer has another game scheduled on the same day
                if (allSlotBox.Location == slotBox.Location && allSlotBox.StartTime != slotBox.StartTime) {
                  //It means the volunteer is in the same location. So he can easily go to the next game
                  //Okay        
                  console.log("*****************");
                  console.log("Same location");
                  console.log(allSlotBox.Location);
                  console.log(slotBox.Location);
                  console.log(slotBox);

                  allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
                  slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";


                }
                else if ((allSlotBox.Location != slotBox.Location) && slotBox.AllGameBox.length>0) {
                  //Calculate time to move between both locations
                  console.log("*****************");
                  console.log("Different locations");
                  console.log(slotBox.Location);
                  console.log(slotBox);
                  console.log("Slotbox Length: "+slotBox.AllGameBox.length);
                  console.log(slotBox.AllGameBox[0].AllBox[0]);
                  //this.gameElement.nativeElement.style.background="red";                 

                  this.calculateTravelTime(allSlotBox, gameSlotDetails,slotBox);                

                }
              }
            })
          }
        })
      })
    }



  }

  calculateTravelTime(allSlotBox: AllSlotBox, gameSlotDetails: AllBox,slotBox: AllSlotBox) {
    //Caldulating Travel Time  
    console.log("Calculating Travel Time");

    console.log("Time Slot Box:");
    console.log(allSlotBox.LocationId);
    console.log(allSlotBox);
    console.log("Game Slot Box:");
    console.log(slotBox.LocationId);
    console.log(slotBox);

    
    let gameSlotStartTime = moment(slotBox.AllGameBox[0].AllBox[0].StartTime, "HH:mm A");
    let gameSlotEndTime = moment(slotBox.AllGameBox[0].AllBox[0].EndTime, "HH:mm A");
    console.log("GameSlot Start Time: "+gameSlotStartTime.format("hh:mm"));
    console.log("GameSlot End Time:"+gameSlotEndTime.format("hh:mm"));

    let timeSlotStartTime = moment(allSlotBox.StartTime, "HH:mm A");
    let timeslotEndTime = moment(allSlotBox.StartTime, "HH:mm A").add(allSlotBox.Duration, "minutes");

    console.log("TimeSlot Start Time: "+timeSlotStartTime.format("hh:mm"));
    console.log("TimeSlot End Time:"+timeslotEndTime.format("hh:mm"));

    var error: boolean;

    if (timeSlotStartTime.isSame(gameSlotStartTime)) {
      console.log("--Both Start Times are same.");
      allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
      slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
    }

    else if(timeSlotStartTime.isBefore(gameSlotStartTime)){
      console.log("--Time Slot before Game.");
      var tsEndTime = parseInt(timeslotEndTime.format("hh"))*60+ parseInt(timeslotEndTime.format("mm"));     
      var gsStartTime = parseInt(gameSlotStartTime.format("hh"))*60+ parseInt(gameSlotStartTime.format("mm"));
     
      console.log(tsEndTime);
      console.log(gsStartTime);
     
      //var timeBwSlots = gameSlotStartTime.subtract(tsEndTime, "ms").format("hh:mm");
      var timeBwSlots = gsStartTime - tsEndTime;


      for(var i=0;i<this.jsonVar.TravelMatrix.length;++i){
        if(this.jsonVar.TravelMatrix[i].FromFacilityId==allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].ToFacilityId==slotBox.LocationId){
          if(this.jsonVar.TravelMatrix[i].Duration<timeBwSlots){
            //No Error
            console.log(this.jsonVar.TravelMatrix[i].Duration);
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
          }
          else{
            //Error
            console.log(this.jsonVar.TravelMatrix[i].Duration);
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
          }
        }
      }
  

    }

    else if(timeSlotStartTime.isAfter(gameSlotStartTime)) {
      console.log("--Time Slot after Game.");
      var tsStartTime = parseInt(timeSlotStartTime.format("hh"))*60+parseInt(timeSlotStartTime.format("mm"));
      var gsEndTime = parseInt(gameSlotEndTime.format("hh"))*60+parseInt(gameSlotEndTime.format("mm"));
      var timeBwSlots = tsStartTime - gsEndTime;

      for(var i=0;i<this.jsonVar.TravelMatrix.length;++i){
        if(this.jsonVar.TravelMatrix[i].FromFacilityId==slotBox.LocationId && this.jsonVar.TravelMatrix[i].ToFacilityId==allSlotBox.LocationId){
          if(this.jsonVar.TravelMatrix[i].Duration<timeBwSlots){
            //No Error
            console.log(this.jsonVar.TravelMatrix[i].Duration);
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
          }
          else{
            //Error
            console.log(this.jsonVar.TravelMatrix[i].Duration);
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
          }
        }
      }

    }

   
    console.log(timeBwSlots);

  }

  // convertMinsToHrsMins(minutes) {
  //   var h = Math.floor(minutes / 60);
  //   var m = minutes % 60;
  //   var hh = h < 10 ? '0' + h : h;
  //   var mm = m < 10 ? '0' + m : m;
  //   return hh + ':' + mm;
  // }



}
