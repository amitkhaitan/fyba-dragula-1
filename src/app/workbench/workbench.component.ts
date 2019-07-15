import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { DataService } from './../data.service';
import { CurrentPeriodSlot, AllGameBox, AllBox, FreeGames, AllSlotBox, allSlots, TravelMatrix, GameVolunteerList } from '../models/workbench.model';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { RootModel, FYBADataFromBackEnd } from '../models/root.model';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ValidationModalComponent } from '../common/validation-modal/validation-modal.component';
import { DOCUMENT } from '@angular/platform-browser';
import { TravelIndex } from './../models/travel-index.model';

import * as $ from 'jquery';

@Component({
  selector: 'app-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.css']
})
export class WorkbenchComponent implements OnInit {
  @ViewChild('timeElement') private timeElement: ElementRef;
  @ViewChild('gameElement') private gameElement: ElementRef;

  urlParams = {
    GameScheduleId: null,
    LoginUserId: null,
    Period: null,
    SeasonId: null,
  };
  responseData: RootModel = null;
  jsonVar: CurrentPeriodSlot = null;
  subs = new Subscription();
  slots = "slots";
  modalRef: BsModalRef;
  fetchingData: boolean;
  blackoutCount: number = 0;
  currentBlackout: boolean;
  sameLocations2: TravelIndex[] = [];
  differentLocations2: TravelIndex[] = [];
  sameLocations: TravelIndex[] = [];
  differentLocations: TravelIndex[] = [];
  differentLocationError: boolean;
  dataChanged:boolean = false;

  constructor(public dataService: DataService,
    private modalService: BsModalService,
    private dragulaService: DragulaService,
    private elementRef: ElementRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: any) {
    var scope = this;
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
          //return true;
          var validity = scope.checkTimeSlotDropValidity(source, target);

          return validity;
        
        }


        else if (source.id == 'blankSlot' && target.id == 'nullSlot') {
          // console.log("Source: ");
          // console.log(source);
          // console.log(source.children);
          // console.log("Target: ");
          // console.log(target);  

          var validity = scope.checkTimeSlotDropValidity(source, target);

          return validity;
        }

        else if (source.id == 'gameSlot' && target.id == 'freeGame') {
          return true
        }

        else if (source.id == 'gameSlot' && target.id == 'blankSlot') {
          return true
        }

        else if (source.id == 'blankSlot' && target.id == 'timeSlotDelete') {
          return true
        }

        else if (source.id == 'timeSlots' && target.id == 'blankSlot') {
          return false;
        }

        else if (target == null) {
          console.log("Target is null");
          return false;
        }
      }
    });

    this.subs.add(this.dragulaService.drag('slots')
      .subscribe(({ name, el, source }) => {
        this.dataChanged = true;
        console.log("Source");
        console.log(source);
        console.log("Element");
        console.log(el);
      })
    );

    this.subs.add(this.dragulaService.drop('slots')
      .subscribe(({ name, el, target, source, sibling }) => {
        if (target != null) {
          if (source.id == 'freeGame' && target.id == 'blankSlot') {
            this.freeGametoBlankSlot(name, el, target, source, sibling);
          }

          else if (source.id == 'timeSlots' && target.id == 'nullSlot') {
            this.timeSlottoNullSlot(name, el, target, source, sibling);
          }

          else if (source.id == 'blankSlot' && target.id == 'nullSlot') {
            this.blackoutCount = 0;

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
        }

      })
    );

  }


  ngOnInit() {

    let model = this.activatedRoute.snapshot.queryParams;
    console.log(this.activatedRoute.snapshot.queryParams);
    this.urlParams.GameScheduleId = model.GameScheduleId;
    this.urlParams.LoginUserId = model.LoginUserId;
    this.urlParams.Period = model.Period;
    this.urlParams.SeasonId = model.SeasonId;

    this.fetchInitialData(this.urlParams);
  }

  fetchInitialData(model) {
    this.fetchingData = true;
    //this.dataService.getWorkbenchData(model)  
    this.dataService.getWorkbenchDataOld()      
      .subscribe(
        (res) => {
          this.responseData = res;
          console.log(this.responseData);
          //console.log(JSON.stringify(this.responseData));
          this.jsonVar = this.responseData.CurrentPeriodSlot;
          console.log(this.jsonVar);
          this.fetchingData = false;

        },
        (err) => {
          console.log(err);
          this.fetchingData = false;
          const initialState = {
            title: 'Error',
            message: err.message,
            bgClass: 'bgRed',
            isBlackout: null,
            isServerError: true
          }

          this.modalRef = this.modalService.show(ValidationModalComponent, { initialState });
        }
      );
  }


  /* Getters */


  get miniDatabase() {
    return this.responseData.MiniDatabase;
  }

  get blackouts() {
    return this.responseData.BlackOuts;
  }

  get FYBADataFromBackEnd() {
    return this.responseData.FYBADataFromBackEnd;
  }

  get resourceLine() {
    return this.responseData.CurrentPeriodSlot.ResourceLine;
  }

  togglePeriod(timePeriodNumber) {
    this.fetchingData = true;

    if(this.dataChanged){
      this.fetchingData = false;
      const initialState = {
        title: 'Error',
        message: 'Do you want to Save your changes before proceeding?',
        bgClass: 'bgRed',
        isBlackout: null,
        isServerError: false
      }

      this.modalRef = this.modalService.show(ValidationModalComponent, { initialState });

      this.dataService.timeSlotSubject.subscribe((data) => {
        console.log(data);
        if (data) {
          
        }
        else {
          this.dataChanged=false;
        }
      });
    }
    
    else{
      this.postToggleData(timePeriodNumber);
    }   
  }

  postToggleData(timePeriodNumber){
    this.dataService.togglePeriod(this.urlParams,timePeriodNumber).subscribe(
      (res) => {
        this.responseData = res;
        console.log(this.responseData);
        //console.log(JSON.stringify(this.responseData));
        this.jsonVar = this.responseData.CurrentPeriodSlot;
        console.log(this.jsonVar);
        this.urlParams.Period = timePeriodNumber;
        this.fetchingData = false;
        console.log("Url Params: ");
        console.log(this.urlParams);
      },
        (err) => {
          console.log(err);
          this.fetchingData = false;
          const initialState = {
            title: 'Error',
            message: err.message,
            bgClass: 'bgRed',
            isBlackout: null,
            isServerError: true
          }
        }
    );
  
  }

  reset() {
    
    this.fetchInitialData(this.urlParams);
  }

  saveData(){
    this.fetchingData = true;
    this.dataService.saveData(this.responseData).subscribe(
      (res) => {
        this.responseData = res;
        console.log(this.responseData);
        //console.log(JSON.stringify(this.responseData));
        this.jsonVar = this.responseData.CurrentPeriodSlot;
        console.log(this.jsonVar);
        this.fetchingData = false;
        this.dataChanged=false;
      },
        (err) => {
          console.log(err);
          this.fetchingData = false;
          const initialState = {
            title: 'Error',
            message: err.message,
            bgClass: 'bgRed',
            isBlackout: null,
            isServerError: true
          }
        }
    );
  }

  freeGametoBlankSlot(name, el, target, source, sibling) {
    console.log("Free Game To Blank Slot");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);
    //console.log(el);
    //console.log(el.getAttribute("GameName"));

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
                allBox.EndTime = moment(allBox.StartTime, "hh:mm A").add(allBox.Duration, "minutes").format("hh:mm A");
                allBox.TimeGroup = "10";
                allBox.GameDivId = el.getAttribute("id");
                allBox.GameMatchupId = el.getAttribute("gamematchupid");

                console.log("Flag");

                this.jsonVar.FreeGames.forEach((freegame,fgIndex) => {
                  if (freegame.Name == el.getAttribute("GameName")) {
                    allBox.GameVolunteerList = freegame.GameVolunteerList;
                    this.jsonVar.FreeGames.splice(fgIndex,1);
                  };                  
                });

                let allGameBox = new AllGameBox();
                allGameBox.AllBox = [];
                allGameBox.AllBox[0] = allBox;
                element.AllGameBox[0] = allGameBox;

                this.checkGameSlotPlacement(element);

                
                // this.jsonVar.FreeGames.forEach((freegame,fgIndex) => {
                //   if (freegame.Name == el.getAttribute("GameName")) {
                //     //allBox.GameVolunteerList = freegame.GameVolunteerList;
                    
                //   };
                 
                // });


                console.log(this.jsonVar.FreeGames);
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

    //Don't Apply to All
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
                element.Duration = parseInt(source.attributes.getNamedItem('Duration').value);
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


  checkBlackoutinCurrentPeriod(source, target, seriesid) {
    /*
     TIME SLOT ADDED TO TARGET LOCATION
     Here the time-slot is added in the target location, where the time-slot has been dragged to
     */
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
                /* BLACKOUTS
                   Here we are checking for blackouts, so that if there is a blackout,
                   we can still make a time-slot but notify the user that the timeslot has
                   been generated on a blackout day.
                 */

                for (let i = 0; i < this.blackouts.length; ++i) {
                  if (slot.FacilityCurrentPeriodDate == this.blackouts[i].Date) {

                    console.log('Blackout DateMatches');
                    if (target.attributes.getNamedItem('location').value == this.blackouts[i].FacilityName) {
                      console.log('Location Matches');
                      let slotStartTime = moment(element.StartTime, "HH:mm A");
                      let blackoutStartTime = moment(this.blackouts[i].StartTime, "HH:mm A");
                      let blackoutEndTime = moment(this.blackouts[i].EndTime, "HH:mm A");
                      console.log(element.StartTime);
                      console.log(this.blackouts[i].StartTime);
                      console.log(this.blackouts[i].EndTime);

                      if (slotStartTime.isSameOrAfter(blackoutStartTime) && slotStartTime.isBefore(blackoutEndTime)) {
                        console.log("It is a blackout");
                        //currentBlackout=true;

                        const initialState = {
                          title: 'Blackout Encountered',
                          message: 'Are You sure you want to proceed with the change, because the time-slot lies in a blackout.',
                          bgClass: 'bgRed',
                          isBlackout: true,
                          isServerError: false

                        }

                        this.modalRef = this.modalService.show(ValidationModalComponent, { initialState });

                        this.dataService.blackoutSubject.subscribe((data) => {
                          if (data) {
                            //addCurrentTimeSlot= true;
                            this.addCurrentPeriodTimeSlot(source, target, seriesid);
                            this.modalRef.hide();
                          }
                          else {
                            //addCurrentTimeSlot= false;
                            this.modalRef.hide();
                          }
                        })
                      }
                    }
                  }
                }
              }
            }
          )
        }
      }
    )
  }

  checkBlackoutinMiniDb(source, target, seriesid) {
    console.log("Checking blackout in mini db");
    this.addMiniDatabaseTimeSlot(source, target, seriesid);
    this.miniDatabase.forEach(
      (db) => {
        db.Slots.forEach(
          (slot) => {
            slot.allSlots.forEach((allSlot) => {
              if (allSlot.Heading == target.attributes.getNamedItem('location').value) {
                allSlot.AllSlotBox.forEach((slotBox) => {

                  if (slotBox.StartTime == source.attributes.getNamedItem('starttime').value) {

                    /* BLACKOUTS
                       Here we are checking for blackouts, so that if there is a blackout,
                       we can still make a time-slot but notify the user that the timeslot has
                       been generated on a blackout day.
                     */

                    var blackoutEncountered = false;


                    for (let i = 0; i < this.blackouts.length; ++i) {
                      //debugger;
                      //console.log(this.blackouts[i]);
                      //console.log(this.blackouts[i].Date);
                      //console.log(allSlot.FacilityCurrentPeriodDate);
                      if (allSlot.FacilityCurrentPeriodDate == this.blackouts[i].Date) {

                        console.log('Blackout DateMatches');
                        if (target.attributes.getNamedItem('location').value == this.blackouts[i].FacilityName) {
                          console.log('Location Matches');
                          let slotStartTime = moment(slotBox.StartTime, "HH:mm A");
                          let blackoutStartTime = moment(this.blackouts[i].StartTime, "HH:mm A");
                          let blackoutEndTime = moment(this.blackouts[i].EndTime, "HH:mm A");

                          if (slotStartTime.isSameOrAfter(blackoutStartTime) && slotStartTime.isBefore(blackoutEndTime)) {
                            console.log("It is a blackout");
                            var blackoutEncountered = true;

                            // this.modalRef.hide();

                            const initialState = {
                              title: 'Blackout Encountered',
                              message: 'Are You sure you want to proceed with the change, because the time-slot lies in a blackout.',
                              bgClass: 'bgRed',
                              isBlackout: true,
                              isServerError: false

                            }

                            this.modalRef = this.modalService.show(ValidationModalComponent, { initialState });

                            this.dataService.blackoutSubject.subscribe(
                              (data) => {
                                if (data) {
                                  this.addMiniDatabaseTimeSlot(source, target, seriesid);
                                  this.modalRef.hide();
                                }
                                else {
                                  this.removeCurrentTimeSlot(source, target, seriesid);
                                  this.modalRef.hide();

                                }
                              }
                            )

                          }
                        }
                      }

                    }
                    console.log(blackoutEncountered);
                    if (blackoutEncountered == false) {
                      //debugger;
                      this.addMiniDatabaseTimeSlot(source, target, seriesid);
                    }

                  }
                })
              }
            })
          }
        )
      }
    )
  }

  /* Adding Time Slot only in current period/game. 
  The game will not be added to other games in the season. */
  addCurrentPeriodTimeSlot(source, target, seriesid) {
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
                element.SeriesId = seriesid;
              }
            }
          )
        }
      }
    )


    setTimeout(() => {
      console.log(this.jsonVar.allSlots);
    }, 500);

    /*
    TIME SLOT REMOVED FROM SOURCE LOCATION
    Here the source time-slot is changed and its properties are changed to reflect that it's not a 
    time-slot any more.
     */

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
                element.SeriesId = null;
              }
            }
          )
        }
      }
    )
  }

  addMiniDatabaseTimeSlot(source, target, seriesid) {
    //Changing the location and start-time all the time slots in the series 
    console.log("adding timeslot to all");
    this.miniDatabase.forEach(
      (db) => {
        db.Slots.forEach(
          (slot) => {
            slot.allSlots.forEach((allSlot) => {
              if (allSlot.Heading == target.attributes.getNamedItem('location').value) {
                allSlot.AllSlotBox.forEach((slotBox) => {
                  if (slotBox.StartTime == target.attributes.getNamedItem('starttime').value) {
                    console.log(slotBox);
                    slotBox.Duration = parseInt(source.attributes.getNamedItem('duration').value);
                    slotBox.Height = source.attributes.getNamedItem('boxheight').value;
                    slotBox.IsBlankBox = false;
                    slotBox.IsGameBox = false;
                    slotBox.SlotColor = "#16a085";
                    slotBox.SeriesId = seriesid;

                  }
                })
              }
            })
          }
        )
      }
    )


    setTimeout(() => {
      console.log(this.miniDatabase);
    }, 500)

    //Changing all the timeslots which match with the timeslot being dragged and setting it to null-slot
    this.miniDatabase.forEach(
      (db) => {
        db.Slots.forEach(
          (slot) => {
            slot.allSlots.forEach((allSlot) => {
              if (allSlot.Heading == source.attributes.getNamedItem('location').value) {

                allSlot.AllSlotBox.forEach((slotBox) => {
                  if (slotBox.SeriesId == seriesid && slotBox.StartTime == source.attributes.getNamedItem('starttime').value) {
                    console.log(slotBox);
                    //console.log(allSlot);
                    slotBox.Duration = 0;
                    slotBox.Height = "20px";
                    slotBox.IsBlankBox = true;
                    slotBox.IsGameBox = false;
                    slotBox.SlotColor = "";
                    slotBox.SeriesId = null;
                  }
                })
              }
            })
          }
        )
      }
    )
  }




  blankSlottoNullSlot(name, el, target, source, sibling) {
    console.log(this.jsonVar.allSlots);
    console.log("Blank Slot to Null Slot");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);

    var seriesid = source.getAttribute('seriesid')
    console.log(seriesid);


    var timeSlotExists = null;
    // let targetStartTime = moment(target.attributes.getNamedItem('starttime').value, "HH:mm A");
    // let targetEndTime = moment(target.attributes.getNamedItem('endtime').value, "HH:mm A");


    this.jsonVar.allSlots.forEach(
      (slot, allSlotIndex) => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            (element, slotBoxIndex) => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
                console.log("Element.....");
                console.log(element);

                if (element.IsBlankBox == true) {
                  //let targetStartTime = moment(target.attributes.getNamedItem('starttime').value, "HH:mm A").add(30,'minutes').format('hh:mm A');
                  let targetStartTime = element.EndTime;
                  console.log(targetStartTime);
                  console.log(allSlotIndex, slotBoxIndex);
                  console.log(this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 1]);
                  console.log(this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex - 1]);

                  if (this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 1].IsBlankBox == true
                    &&
                    this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex - 1].IsBlankBox == true) {
                    console.log("It is a null slot.");
                    timeSlotExists = false;
                    //debugger;
                    element.Duration = parseInt(source.attributes.getNamedItem('duration').value);
                    element.Height = source.attributes.getNamedItem('boxheight').value;
                    element.IsBlankBox = false;
                    element.IsGameBox = false;
                    element.SlotColor = "#16a085";
                    element.SeriesId = seriesid;
                    element.TimeSlotId = source.attributes.getNamedItem('timeslotid').value;
                    console.log(source.attributes.getNamedItem('timeslotid').value);
                  }

                  else {
                    console.log("Time Slot Already Exists");
                    timeSlotExists = true;
                    const initialState = {
                      title: 'Time Slot Already Exists',
                      message: 'Time Slot Can Not be added as a Time Slot already exists in the target location.',
                      bgClass: 'bgRed',
                      isBlackout: false,
                      isServerError: false
                    };

                    this.modalRef = this.modalService.show(ValidationModalComponent, { initialState });

                  }
                }
              }
            }
          )
        }
      }
    )

    setTimeout(() => {
      console.log(this.jsonVar.allSlots);
    }, 500);


    if (timeSlotExists == false) {
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
                  element.SeriesId = null;
                  element.TimeSlotId = null;
                }
              }
            )
          }
        }
      )
    }




    if (source.getAttribute('seriesid') == null || source.getAttribute('seriesid').length <= 1) {
      console.log("Series id is null");
      this.checkCurrentPeriodBlackout(source, target, seriesid);

    }

    else {
      console.log("Series Id is not null");

      if (timeSlotExists == false) {
        console.log(timeSlotExists);
        const initialState = {
          title: 'Change Time Slot',
          message: 'Do you want to apply the same changes to the entire series ?',
          bgClass: 'bgBlue',
          isBlackout: false,
          isServerError: false
        };

        this.modalRef = this.modalService.show(ValidationModalComponent, { initialState });

        this.dataService.timeSlotSubject.subscribe((data) => {
          console.log(data);
          if (data) {
            //Apply to All 
            console.log("Apply to all");
            this.checkCurrentPeriodBlackout(source, target, seriesid);
            this.checkBlackoutinMiniDb(source, target, seriesid);
          }
          else {
            //Don't Apply to All
            this.checkCurrentPeriodBlackout(source, target, seriesid);
          }
        });
      }
    }
  }

  /* Check Blackout in current Period */
  checkCurrentPeriodBlackout(source, target, seriesid) {
    console.log("Source: ");
    console.log(source);
    console.log("Target: ");
    console.log(target);

    console.log(target.attributes.getNamedItem('location').value);
    console.log(seriesid);
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {

                console.log(target.attributes.getNamedItem('starttime').value);
                console.log(target.attributes.getNamedItem('endtime').value);
                console.log("Element:");
                console.log(element);
                /* BLACKOUTS
                   Here we are checking for blackouts, so that if there is a blackout,
                   we can still make a time-slot but notify the user that the timeslot has
                   been generated on a blackout day.
                 */

                for (let i = 0; i < this.blackouts.length; ++i) {
                  if (slot.FacilityCurrentPeriodDate == this.blackouts[i].Date) {
                    console.log(this.blackouts[i].Date);
                    console.log(slot.Heading);
                    console.log(target.attributes.getNamedItem('location').value);
                    console.log('Blackout DateMatches');
                    if (target.attributes.getNamedItem('location').value == this.blackouts[i].FacilityName) {
                      console.log('Location Matches');
                      let slotStartTime = moment(element.StartTime, "HH:mm A");
                      let blackoutStartTime = moment(this.blackouts[i].StartTime, "HH:mm A");
                      let blackoutEndTime = moment(this.blackouts[i].EndTime, "HH:mm A");

                      if (slotStartTime.isSameOrAfter(blackoutStartTime) && slotStartTime.isBefore(blackoutEndTime)) {
                        console.log("It is a blackout");
                        console.log("Blackout Count: " + this.blackoutCount);

                        console.log(slot);
                        console.log(element);
                        console.log(element.StartTime);
                        console.log(slot.FacilityCurrentPeriodDate);

                        const initialState = {
                          title: 'Blackout Encountered',
                          message: 'Are You sure you want to proceed with the change, because the time-slot lies in a blackout.',
                          bgClass: 'bgRed',
                          isBlackout: true,
                          isServerError: false

                        }

                        this.blackoutCount++;

                        if (this.blackoutCount == 0) {
                          this.modalRef = this.modalService.show(ValidationModalComponent, { initialState });
                        }

                        this.dataService.blackoutSubject.subscribe((data) => {
                          if (data) {
                            this.currentBlackout = true;
                          }
                          else {
                            //Removing the changes made initially
                            this.removeCurrentTimeSlot(source, target, seriesid);
                          }
                        })
                      }
                    }
                  }
                }
              }
            }
          )
        }
      }
    )
  }

  removeCurrentTimeSlot(source, target, seriesid) {
    console.log("Remove Current Time-slot");
    console.log("Source: ");
    console.log(source);
    console.log("Target: ");
    console.log(target);
    console.log("Changing Target");
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
                console.log("Target Element");
                console.log(element);
                element.Duration = parseInt(source.attributes.getNamedItem('duration').value);;
                element.Height = "20px";
                element.IsBlankBox = true;
                element.IsGameBox = false;
                element.SlotColor = "";
                element.SeriesId = null;
              }
            }
          )
        }
      }
    )

    setTimeout(() => {
      console.log(this.jsonVar.allSlots);
    }, 500)

    console.log("Changing Source");
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == source.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == source.attributes.getNamedItem('starttime').value) {
                console.log("Source Element");
                console.log(element);
                element.Duration = source.attributes.getNamedItem('duration').value;;
                element.Height = source.attributes.getNamedItem('boxheight').value;;
                element.IsBlankBox = false;
                element.IsGameBox = false;
                element.SlotColor = "#16a085";
                element.SeriesId = seriesid;
              }
            }
          )
        }
      }
    )
  }

  /* Apply the timeslot changes to all the time-slots in other periods with same series-id */
  applyTimeSlotToAll(source, target, seriesid) {
    //Changing the location and start-time all the time slots in the series 
    console.log("Applying change to all");
    this.miniDatabase.forEach(
      (db) => {
        db.Slots.forEach(
          (slot) => {
            slot.allSlots.forEach((allSlot) => {
              if (allSlot.Heading == target.attributes.getNamedItem('location').value) {
                allSlot.AllSlotBox.forEach((slotBox) => {

                  if (slotBox.StartTime == source.attributes.getNamedItem('starttime').value) {
                    console.log(slotBox);
                    // console.log(allSlot);
                    slotBox.Duration = parseInt(source.attributes.getNamedItem('duration').value);
                    slotBox.Height = source.attributes.getNamedItem('boxheight').value;
                    slotBox.IsBlankBox = false;
                    slotBox.IsGameBox = false;
                    slotBox.SlotColor = "#16a085";
                    slotBox.SeriesId = seriesid;
                    //debugger;
                  }
                })
              }
            })
          }
        )
      }
    )

    console.log(this.miniDatabase);

    setTimeout(() => {
      console.log(this.jsonVar.allSlots);
    }, 500)

    //Changing all the timeslots which match with the timeslot being dragged and setting it to null-slot
    this.miniDatabase.forEach(
      (db) => {
        db.Slots.forEach(
          (slot) => {
            slot.allSlots.forEach((allSlot) => {
              if (allSlot.Heading == source.attributes.getNamedItem('location').value) {

                allSlot.AllSlotBox.forEach((slotBox) => {
                  if (slotBox.SeriesId == seriesid && slotBox.StartTime == source.attributes.getNamedItem('starttime').value) {
                    console.log(seriesid);
                    console.log(slotBox);
                    console.log(allSlot);
                    slotBox.Duration = 0;
                    slotBox.Height = "20px";
                    slotBox.IsBlankBox = true;
                    slotBox.IsGameBox = false;
                    slotBox.SlotColor = "";
                    slotBox.SeriesId = null;



                  }
                })
              }
            })
          }
        )
      }
    )
  }

  gameSlottoFreeGames(name, el, target, source, sibling) {
    console.log("GameSlot Slot to Free Games");
    console.log("Target");
    console.log("Target Id: " + target.id);
    console.log(target);
    var name;
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == source.attributes.getNamedItem('location').value) {
          console.log(slot);
          slot.AllSlotBox.forEach(

            element => {

              if (element.StartTime == source.attributes.getNamedItem('starttime').value) {
                console.log(element);
                //debugger;
                name = element.AllGameBox[0].AllBox[0].BoxValue;
                
                $('#'+element.AllGameBox[0].AllBox[0].GameDivId).prop('id', null);
                //console.log($('#' + element.AllGameBox[0].AllBox[0].GameMatchupId).attr('id'));

                this.jsonVar.FreeGames.push({
                  Division: element.AllGameBox[0].AllBox[0].Division,
                  GameDivId: element.AllGameBox[0].AllBox[0].GameDivId,
                  GameVolunteerList: element.AllGameBox[0].AllBox[0].GameVolunteerList,
                  Name: element.AllGameBox[0].AllBox[0].BoxValue,
                  GameMatchupId: element.AllGameBox[0].AllBox[0].GameMatchupId
                });

                console.log(this.jsonVar.FreeGames);
                //debugger;

               
                element.AllGameBox[0].AllBox.splice(0, 1);
                element.AllGameBox.splice(0, 1);
                element.IsGameBox = false;
                element.IsBlankBox = false;
                // console.log("Changing Element");
                // console.log(element);


              }

            }
          )
        }
      }
    )

    //Removing the un-necesary div created by dragula at the top
    // let domElement: HTMLElement = this.gameElement.nativeElement;
    // console.log(domElement);
    // console.log(name);
    // console.log(domElement.attributes.getNamedItem('title').value);
    // if(domElement.attributes.getNamedItem('title').value==name){
    //   console.log(domElement);
    //   console.log(domElement.children);
    //   console.log(domElement.parentElement);
    //   domElement.remove();
    //   domElement.id = null;
     
    //   console.log(this.jsonVar.FreeGames);
    //   console.log(this.jsonVar.allSlots);
    // }

  }

  gameSlottoBlankSlot(name, el, target, source, sibling) {
    this.differentLocationError = null;
    //this.fetchingData=true;
    console.log("Game Slot to Blank Slot");
    console.log("Source");
    console.log(source);
    console.log("Target");
    console.log(target);


    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            element => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
                // console.log(element);
                // console.log(target.attributes.getNamedItem('boxheight'));
                element.IsBlankBox = false;
                element.IsGameBox = true;
                //element.Duration = parseInt(target.attributes.getNamedItem('duration').value);                               
                //element.Height =  target.attributes.getNamedItem('boxheight');     

                let allSlotsIndex = parseInt(source.getAttribute('allSlotsIndex'));
                let slotBoxIndex = parseInt(source.getAttribute('slotBoxIndex'));

                let allGameBox = new AllGameBox();
                allGameBox.TimeGroup = this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].AllGameBox[0].TimeGroup;
                allGameBox.AllBox = this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].AllGameBox[0].AllBox;
                allGameBox.AllBox[0].StartTime = element.StartTime;

                allGameBox.AllBox[0].EndTime = moment(element.StartTime, "HH:mm A").add(element.Duration, "minutes").format("hh:mm A");

                allGameBox.AllBox[0].BoxHeight = target.attributes.getNamedItem('boxheight').value;

                console.log(allGameBox);

                element.AllGameBox.push(allGameBox);
                console.log("Flag");

                console.log(this.jsonVar.allSlots);

                console.log(allSlotsIndex,slotBoxIndex);
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
      //this.fetchingData=false;
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



    let deletedBox = this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex];
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].IsBlankBox = true;
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].Height = "20px";
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].SlotColor = "";
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].Duration = 0;

    //Removing the un-necesary div created by dragula at the top
    //let domElement: HTMLElement = this.timeElement.nativeElement;

    let slotDivId = source.getAttribute('SlotDivId');
    var el = this.elementRef.nativeElement.querySelector('.' + slotDivId);
    el.remove();

    this.jsonVar.DeletedTimeSlot.push(deletedBox)
    console.log(this.jsonVar.DeletedTimeSlot);
    //el.style.display = 'none';     
    //domElement.parentNode.removeChild(domElement);
  }




  checkGameSlotPlacement(allSlotBox: AllSlotBox) {
    console.log("Checking Game Slot Placement");
    this.sameLocations = [];
    this.differentLocations = [];
    this.sameLocations2 = [];
    this.differentLocations2 = [];
    // this.differentLocationFlag=null;
    // this.sameLocationFlag=null;

    var gameSlotDetails = allSlotBox.AllGameBox[0].AllBox[0];
    var gameVolunteerList = gameSlotDetails.GameVolunteerList;
    console.log("------------");
    console.log(allSlotBox.Location);
    //console.log(allSlotBox.LocationId);
    console.log(allSlotBox);
    var index = 0;

    for (var i = 0; i < gameVolunteerList.length; ++i) {
      this.jsonVar.allSlots.forEach((slot, allSlotIndex) => {
        slot.AllSlotBox.forEach((slotBox, slotBoxIndex) => {
          if (slotBox.AllGameBox.length > 0 && slotBox.IsGameBox) {

            slotBox.AllGameBox[0].AllBox[0].GameVolunteerList.forEach(volunteer => {

              if (gameVolunteerList[i].VolunteerSeasonalId == volunteer.VolunteerSeasonalId) {
                //So the same volunteer has another game scheduled on the same day
                if (allSlotBox.Location == slotBox.Location && allSlotBox.StartTime != slotBox.StartTime) {
                  //It means the volunteer is in the same location. So he can easily go to the next game
                  //Okay        

                  let newModel = new TravelIndex();
                  newModel.allSlotIndex = allSlotIndex;
                  newModel.slotBoxIndex = slotBoxIndex;
                  console.log("Pushing..." + this.sameLocations.length);
                  this.sameLocations.push(newModel);
                  //this.sameLocationFlag=true;
                  console.log("*****************");
                  console.log("Same location");
                  console.log("Index: " + ++index);
                  console.log(this.differentLocationError);

                  allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
                  slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
                  console.log(allSlotBox);
                  console.log(slotBox);

                  this.checkGamesWithSameVolunteers2(slotBox);

                  if (this.sameLocations2.length > 0) {
                    var uniq = {};
                    var x = this.sameLocations2.filter(obj => !uniq[obj.allSlotIndex] && (uniq[obj.allSlotIndex] = true));
                    console.log(x);
                  }

                  //this.checkOtherGameErrors(allSlotBox,slotBox);

                  // if(this.differentLocationError==true){
                  //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";   
                  //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";            
                  // }
                  // else{
                  //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
                  //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";

                  // }                
                }

                else if ((allSlotBox.Location != slotBox.Location) && slotBox.AllGameBox.length > 0) {
                  //Calculate time to move between both locations
                  console.log("*****************");
                  console.log("Different locations");
                  console.log("Index: " + ++index);
                  // console.log(allSlotIndex,slotBoxIndex);

                  let newModel = new TravelIndex();
                  newModel.allSlotIndex = allSlotIndex;
                  newModel.slotBoxIndex = slotBoxIndex;
                  console.log("Pushing..." + this.differentLocations.length);
                  this.differentLocations.push(newModel);
                  //this.checkGamesWithSameVolunteers(allSlotBox,slotBox);                 

                  if (this.sameLocations2.length > 0) {
                    var uniq = {};
                    var x = this.sameLocations2.filter(obj => !uniq[obj.allSlotIndex] && (uniq[obj.allSlotIndex] = true));
                    console.log(x);
                  }

                  this.calculateTravelTime(allSlotBox, gameSlotDetails, slotBox);

                }
              }
            })
          }
        })
      })
    }


    // if(this.differentLocationError==true){
    //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";

    // }
    // else{
    //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";

    // }  


    var uniq = {};

    this.differentLocations = this.differentLocations.filter(obj => !uniq[obj.allSlotIndex] && (uniq[obj.allSlotIndex] = true));
    this.sameLocations = this.sameLocations.filter(obj => !uniq[obj.allSlotIndex] && (uniq[obj.allSlotIndex] = true));
    // console.log(this.differentLocations);
    // console.log(this.sameLocations);

  }

  calculateTravelTime(allSlotBox: AllSlotBox, gameSlotDetails: AllBox, slotBox: AllSlotBox) {
    //Caldulating Travel Time  
    console.log("Calculating Travel Time");

    let gameSlotStartTime = moment(slotBox.AllGameBox[0].AllBox[0].StartTime, "HH:mm A");
    let gameSlotEndTime = moment(slotBox.AllGameBox[0].AllBox[0].EndTime, "HH:mm A");
    // console.log("GameSlot Start Time: " + gameSlotStartTime.format("HH:mm "));
    // console.log("GameSlot End Time:" + gameSlotEndTime.format("HH:mm"));

    let timeSlotStartTime = moment(allSlotBox.StartTime, "HH:mm A");
    let timeslotEndTime = moment(allSlotBox.StartTime, "HH:mm A").add(allSlotBox.Duration, "minutes");
    // console.log("TimeSlot Start Time: " + timeSlotStartTime.format("HH:mm"));
    // console.log("TimeSlot End Time:" + timeslotEndTime.format("HH:mm"));

    if (timeSlotStartTime.isSame(gameSlotStartTime)) {
      console.log("--Both Start Times are same.");
      console.log(allSlotBox);
      console.log(slotBox);
      this.differentLocationError = true;

      allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
      slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
      this.checkGamesWithSameVolunteers2(slotBox);

    }

    else if (timeSlotStartTime.isBefore(gameSlotStartTime)) {
      console.log("--Time Slot before Game.");
      var tsEndTime = parseInt(timeslotEndTime.format("HH")) * 60 + parseInt(timeslotEndTime.format("mm"));
      var gsStartTime = parseInt(gameSlotStartTime.format("HH")) * 60 + parseInt(gameSlotStartTime.format("mm"));


      var timeBwSlots = gsStartTime - tsEndTime;

      for (var i = 0; i < this.jsonVar.TravelMatrix.length; ++i) {
        if ((this.jsonVar.TravelMatrix[i].FromFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].ToFacilityId == slotBox.LocationId)
          || (this.jsonVar.TravelMatrix[i].ToFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].FromFacilityId == slotBox.LocationId)) {

          if (this.jsonVar.TravelMatrix[i].Duration < timeBwSlots) {
            //No Error

            // console.log("Duration: ");
            // console.log(this.jsonVar.TravelMatrix[i].Duration);
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
            this.checkGamesWithSameVolunteers2(slotBox);
            // if(this.differentLocationError==true){

            //   slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";       
            // }
            // else if(this.differentLocationError==false){
            //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
            //   slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";        
            // }            

          }
          else {
            //Error    
            console.log(this.differentLocationError);
            this.differentLocationError = true;
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
            this.checkGamesWithSameVolunteers2(slotBox);
          }
        }
      }


    }

    else if (timeSlotStartTime.isAfter(gameSlotStartTime)) {
      console.log("--Time Slot after Game.");
      var tsStartTime = parseInt(timeSlotStartTime.format("HH")) * 60 + parseInt(timeSlotStartTime.format("mm"));
      var gsEndTime = parseInt(gameSlotEndTime.format("HH")) * 60 + parseInt(gameSlotEndTime.format("mm"));
      var timeBwSlots = tsStartTime - gsEndTime;

      for (var i = 0; i < this.jsonVar.TravelMatrix.length; ++i) {

        if ((this.jsonVar.TravelMatrix[i].FromFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].ToFacilityId == slotBox.LocationId)
          ||
          (this.jsonVar.TravelMatrix[i].ToFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].FromFacilityId == slotBox.LocationId)
        ) {

          if (this.jsonVar.TravelMatrix[i].Duration < timeBwSlots) {
            //No Error           
            console.log("No Error - Duration greater than time b/w slots");
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
            this.checkGamesWithSameVolunteers2(slotBox);

          }
          else {
            //Error
            console.log("Error - Duration Less than time b/w slots");
            this.differentLocationError = true;
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
            this.checkGamesWithSameVolunteers2(slotBox);
          }
        }
      }
    }

    // if(this.differentLocationError){
    //   console.log(this.differentLocationError);
    //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
    // }
    // else{
    //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
    // }
    //console.log(timeBwSlots);
    //this.fetchingData=false;

  }


  
  checkGamesWithSameVolunteers2(comparedSlotBox: AllSlotBox){
    console.log("2Checking other games with same volunteers");

    
    console.log(comparedSlotBox);

   
    let gameVolunteerList = comparedSlotBox.AllGameBox[0].AllBox[0].GameVolunteerList;
    console.log("Game Volunteer List");
    console.log(gameVolunteerList);


    for (var i = 0; i < gameVolunteerList.length; ++i) {
      //console.log(gameVolunteerList.length);
      this.jsonVar.allSlots.forEach((slot, allSlotIndex) => {
        slot.AllSlotBox.forEach((slotBox, slotBoxIndex) => {
          if (slotBox.AllGameBox.length > 0 && slotBox.IsGameBox) {           
            if(slotBox.Location!=comparedSlotBox.Location ){            
              slotBox.AllGameBox[0].AllBox[0].GameVolunteerList.forEach(volunteer => {
                //console.log(volunteer);
                if (parseInt(gameVolunteerList[i].VolunteerSeasonalId) === parseInt(volunteer.VolunteerSeasonalId)) {
                  console.log(slotBox);
                  console.log(gameVolunteerList[i].VolunteerSeasonalId, volunteer.VolunteerSeasonalId);
                  let model = new TravelIndex();
                  model.allSlotIndex = allSlotIndex;
                  model.slotBoxIndex = slotBoxIndex;
                  this.sameLocations2.push(model);
                  this.checkTimeDifference(comparedSlotBox,slotBox);
                }              
              })
            }     
          }
        })
      })
    }

  }



  checkGamesWithSameVolunteers(allSlotBox: AllSlotBox,comparedSlotBox: AllSlotBox){
    console.log("2Checking other games with same volunteers");

    console.log(allSlotBox);
    console.log(comparedSlotBox);

    let gameVolunteerList1 = allSlotBox.AllGameBox[0].AllBox[0].GameVolunteerList;
    let gameVolunteerList2 = comparedSlotBox.AllGameBox[0].AllBox[0].GameVolunteerList;
    console.log("Game Volunteer List 1");
    console.log(gameVolunteerList1);
    console.log("Game Volunteer List 2");
    console.log(gameVolunteerList2);

    for (var i = 0; i < gameVolunteerList1.length; ++i) {
      console.log(gameVolunteerList1.length);
      this.jsonVar.allSlots.forEach((slot, allSlotIndex) => {
        slot.AllSlotBox.forEach((slotBox, slotBoxIndex) => {
          if (slotBox.AllGameBox.length > 0 && slotBox.IsGameBox) {           
            if(slotBox.Location!=allSlotBox.Location && slotBox.Location!=comparedSlotBox.Location ){            
              slotBox.AllGameBox[0].AllBox[0].GameVolunteerList.forEach(volunteer => {
                //console.log(volunteer);
                if (parseInt(gameVolunteerList1[i].VolunteerSeasonalId) === parseInt(volunteer.VolunteerSeasonalId)) {
                  console.log(slotBox);
                  console.log(gameVolunteerList1[i].VolunteerSeasonalId, volunteer.VolunteerSeasonalId);
                  let model = new TravelIndex();
                  model.allSlotIndex = allSlotIndex;
                  model.slotBoxIndex = slotBoxIndex;
                  this.sameLocations2.push(model);
                  this.checkTimeDifference(allSlotBox,slotBox);
                }
                else if (parseInt(gameVolunteerList2[i].VolunteerSeasonalId) === parseInt(volunteer.VolunteerSeasonalId)) {
                  console.log(slotBox);
                  console.log(gameVolunteerList1[i].VolunteerSeasonalId, volunteer.VolunteerSeasonalId);
                  let model = new TravelIndex();
                  model.allSlotIndex = allSlotIndex;
                  model.slotBoxIndex = slotBoxIndex;
                  this.sameLocations2.push(model);
                  this.checkTimeDifference(allSlotBox,slotBox);
                }
              })
            }     
          }
        })
      })
    }

  }


  checkTimeDifference(allSlotBox: AllSlotBox, slotBox: AllSlotBox) {
    //Caldulating Travel Time  
    console.log("2Calculating Travel Time");
    console.log(allSlotBox);
    console.log(slotBox);

    let gameVolunteerList1 = allSlotBox.AllGameBox[0].AllBox[0].GameVolunteerList;
    let gameVolunteerList2 = slotBox.AllGameBox[0].AllBox[0].GameVolunteerList;
    var volunteerEqual = false;

    for(var i=0;i<gameVolunteerList1.length; ++i){
      if(gameVolunteerList1[i].VolunteerSeasonalId==gameVolunteerList2[i].VolunteerSeasonalId){
        console.log(gameVolunteerList1[i].VolunteerSeasonalId, gameVolunteerList2[i].VolunteerSeasonalId);
        volunteerEqual=true;
      }
    }

    // for(var i=0;i<gameVolunteerList2.length; ++i){

    // }

    if(volunteerEqual){
      let gameSlotStartTime = moment(slotBox.AllGameBox[0].AllBox[0].StartTime, "HH:mm A");
      let gameSlotEndTime = moment(slotBox.AllGameBox[0].AllBox[0].EndTime, "HH:mm A");
      // console.log("GameSlot Start Time: " + gameSlotStartTime.format("HH:mm "));
      // console.log("GameSlot End Time:" + gameSlotEndTime.format("HH:mm"));
  
      let timeSlotStartTime = moment(allSlotBox.StartTime, "HH:mm A");
      let timeslotEndTime = moment(allSlotBox.StartTime, "HH:mm A").add(allSlotBox.Duration, "minutes");
  
      // console.log("TimeSlot Start Time: " + timeSlotStartTime.format("HH:mm"));
      // console.log("TimeSlot End Time:" + timeslotEndTime.format("HH:mm"));
  
      if(allSlotBox.Location!=slotBox.Location){
        if (timeSlotStartTime.isSame(gameSlotStartTime)) {
          console.log("2--Both Start Times are same.");
          console.log(allSlotBox);
          console.log(slotBox);
          this.differentLocationError = true;
    
          allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
          slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
    
        }
    
        else if (timeSlotStartTime.isBefore(gameSlotStartTime)) {
          console.log("2--Time Slot before Game.");
          var tsEndTime = parseInt(timeslotEndTime.format("HH")) * 60 + parseInt(timeslotEndTime.format("mm"));
          var gsStartTime = parseInt(gameSlotStartTime.format("HH")) * 60 + parseInt(gameSlotStartTime.format("mm"));
    
          var timeBwSlots = gsStartTime - tsEndTime;
    
          for (var i = 0; i < this.jsonVar.TravelMatrix.length; ++i) {
            if ((this.jsonVar.TravelMatrix[i].FromFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].ToFacilityId == slotBox.LocationId)
              || (this.jsonVar.TravelMatrix[i].ToFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].FromFacilityId == slotBox.LocationId)) {
    
              if (this.jsonVar.TravelMatrix[i].Duration < timeBwSlots) {
                //No Error
                if (slotBox.AllGameBox[0].AllBox[0].BackgroundColor == "red") {
                  allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
                }
                else {
                  allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
                  slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
                }
              }
              else {
                //Error    
                console.log(this.differentLocationError);
                this.differentLocationError = true;
                allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
                slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
              }
            }
          }
    
    
        }
    
        else if (timeSlotStartTime.isAfter(gameSlotStartTime)) {
          console.log("2--Time Slot after Game.");
          var tsStartTime = parseInt(timeSlotStartTime.format("HH")) * 60 + parseInt(timeSlotStartTime.format("mm"));
          var gsEndTime = parseInt(gameSlotEndTime.format("HH")) * 60 + parseInt(gameSlotEndTime.format("mm"));
          var timeBwSlots = tsStartTime - gsEndTime;
    
          for (var i = 0; i < this.jsonVar.TravelMatrix.length; ++i) {
    
            if ((this.jsonVar.TravelMatrix[i].FromFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].ToFacilityId == slotBox.LocationId)
              ||
              (this.jsonVar.TravelMatrix[i].ToFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].FromFacilityId == slotBox.LocationId)
            ) {
    
              if (this.jsonVar.TravelMatrix[i].Duration < timeBwSlots) {
                //No Error           
                console.log("2No Error - Duration greater than time b/w slots");
                console.log(allSlotBox);
                allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
    
              }
              else {
                //Error
                console.log("2Error - Duration Less than time b/w slots");
                this.differentLocationError = true;
                allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
                slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
              }
            }
          }
        }
    
        // if(this.differentLocationError){
        //   console.log(this.differentLocationError);
        //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
        // }
        // else{
        //   allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
        // }
        //console.log(timeBwSlots);
        //this.fetchingData=false;
      }
    }

 

   

  }


  checkTimeSlotDropValidity(source, target) {
    //console.log(source, target);

    var seriesid = source.getAttribute('seriesid');
    var timeSlotExists = null;
    let duration = source.attributes.getNamedItem('duration').value;
    console.log(duration);

    // let targetStartTime = moment(target.attributes.getNamedItem('starttime').value, "HH:mm A");
    // let targetEndTime = moment(target.attributes.getNamedItem('endtime').value, "HH:mm A");


    this.jsonVar.allSlots.forEach(
      (slot, allSlotIndex) => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            (element, slotBoxIndex) => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
          
                if (element.IsBlankBox == true) {
                  //let targetStartTime = moment(target.attributes.getNamedItem('starttime').value, "HH:mm A").add(30,'minutes').format('hh:mm A');
                  let targetStartTime = element.EndTime;

                  if(duration=='85'){
                    timeSlotExists = true;
                    // console.log(slotBoxIndex);
                    // console.log(slot.AllSlotBox.length);              


                      if(slotBoxIndex==0){
                        if (this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 1].IsBlankBox == true
                          &&                                               
                          this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 2].IsBlankBox == true) {
                       
                          timeSlotExists = false;
                      }
                    }

                      else if(slotBoxIndex==slot.AllSlotBox.length-1 || slotBoxIndex==slot.AllSlotBox.length-2){
                          timeSlotExists=true;
                      }

                      else{
                        if (this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 1].IsBlankBox == true
                          &&
                          this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex - 1].IsBlankBox == true
                          &&                       
                          this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 2].IsBlankBox == true) {
                       
                          timeSlotExists = false;
                      }
                  }
                }

                  else if(duration =='55'){
                    timeSlotExists=true;

                    if(slotBoxIndex==0){
                      if (this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 1].IsBlankBox == true) 
                        {          
                          timeSlotExists = false;
                        }    
                    }
                    else if(slotBoxIndex == slot.AllSlotBox.length-1){
                      if (this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex - 1].IsBlankBox == true) 
                        {          
                          timeSlotExists = false;
                        }    
                    }
                    else{
                      if (this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 1].IsBlankBox == true
                        &&
                        this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex - 1].IsBlankBox == true) 
                        {          
                          timeSlotExists = false;
                        }    
                    }

                                
                  }

                  else {
                    console.log("Time Slot Already Exists");
                    timeSlotExists = true;
                    //return false;                  

                  }              
                 
                }
              }
            }
          )
        }
      }
    )
    return !timeSlotExists;
  }


  makeLine(fromDivId, toDivId, lineDivId) {
    adjustLine(
      document.getElementById(fromDivId),
      document.getElementById(toDivId),
      document.getElementById(lineDivId)
    );

    function adjustLine(from, to, line) {
     //console.log(to);
     if (to){
      var fT = $(from).offset().top + $(from).height() / 2;
      var tT = $(to).offset().top + $(to).height() / 2;
      var fL = $(from).offset().left + $(from).width() / 2;
      var tL = $(to).offset().left + $(to).width() / 2;

      var CA = Math.abs(tT - fT);
      var CO = Math.abs(tL - fL);
      var H = Math.sqrt(CA * CA + CO * CO);
      var ANG = 180 / Math.PI * Math.acos(CA / H);
      if (tT > fT) {
        var top = (tT - fT) / 2 + fT;
      }
      else {
        var top = (fT - tT) / 2 + tT;
      }
      if (tL > fL) {
        var left = (tL - fL) / 2 + fL;
      } else {
        var left = (fL - tL) / 2 + tL;
      }
      if ((fT < tT && fL < tL) || (tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
        ANG *= -1;
      }
      top -= H / 2;
      line.style["-webkit-transform"] = 'rotate(' + ANG + 'deg)';
      line.style["-moz-transform"] = 'rotate(' + ANG + 'deg)';
      line.style["-ms-transform"] = 'rotate(' + ANG + 'deg)';
      line.style["-o-transform"] = 'rotate(' + ANG + 'deg)';
      line.style["-transform"] = 'rotate(' + ANG + 'deg)';
      line.style.top = top + 'px';
      line.style.left = left + 'px';
      line.style.height = H + 'px';
     }
    
    }
  }
}


