import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { DataService } from './../data.service';
import { CurrentPeriodSlot, AllGameBox, AllBox, FreeGames, AllSlotBox, allSlots, TravelMatrix } from '../models/workbench.model';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { RootModel } from '../models/root.model';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ValidationModalComponent } from '../common/validation-modal/validation-modal.component';
import { DOCUMENT } from '@angular/platform-browser';
import { TravelIndex } from './../models/travel-index.model';

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
  modalRef: BsModalRef;
  fetchingData: boolean;

  ngOnInit() {
    this.fetchingData = true;

    this.dataService.getWorkbenchData()
      .subscribe(
        (res) => {
          this.responseData = res;
          console.log(this.responseData);
          //console.log(JSON.stringify(this.responseData));
          this.jsonVar = this.responseData.CurrentPeriodSlot;
          console.log(this.jsonVar);
          this.fetchingData = false;
        }
      )
  }

  constructor(public dataService: DataService,
    private modalService: BsModalService,
    private dragulaService: DragulaService,
    private elementRef:ElementRef,
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
          return true
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
          //Game Slot will only be accepted if its duration is equal to TimeSlot Duration         
          // let sourceDuration = parseInt(source.getAttribute("duration"));
          // let targetDuration = parseInt(target.getAttribute("duration"));
          // if (sourceDuration == targetDuration) {
          //   return true
          // }
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
        // console.log("DRAG:");
        // console.log("Source Id: " + source.id);
        // console.log("Source");
        // console.log(source);
        // console.log("Element:");
        // console.log(el.innerHTML);

      })
    );

    this.subs.add(this.dragulaService.drop('slots')
      .subscribe(({ name, el, target, source, sibling }) => {
        // console.log("DROP: ");
        // console.log("Source");
        // console.log(source);
        // //console.log("Target ID: " + target.id);
        // console.log("Target");
        // console.log(target);

        // console.log("Element:");
        // console.log(el.innerHTML);

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


  get miniDatabase() {
    return this.responseData.MiniDatabase;
    //this.miniDatabase[0].Slots.length
  }

  get blackouts() {
    return this.responseData.BlackOuts;
  }

  get FYBADataFromBackEnd() {
    return this.responseData.FYBADataFromBackEnd;
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
                allBox.EndTime = moment(allBox.StartTime, "hh:mm A").add(allBox.Duration, "minutes").format("hh:mm A");
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

    //Don't Apply to All
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


  // applyTimeSlottoAll(name, el, target, source, sibling) {
  //   console.log(this.miniDatabase[0]);
  //   this.miniDatabase[0].Slots.forEach(
  //     db => {
  //       console.log(db);
  //       //console.log(db[0]);

  //       db.allSlots.forEach(
  //         (slot) => {
  //           //console.log(slot);
  //           if (slot.Heading == target.attributes.getNamedItem('location').value) {
  //             slot.AllSlotBox.forEach(
  //               element => {
  //                 if (element.StartTime == target.attributes.getNamedItem('starttime').value) {

  //                   if (element.IsBlankBox == true) {
  //                     element.Duration = parseInt(source.attributes.getNamedItem('tsDuration').value);
  //                     element.Height = source.attributes.getNamedItem('tsHeight').value;
  //                     element.IsBlankBox = false;
  //                     element.SlotColor = "#16a085";
  //                   }
  //                   else {
  //                     console.log(element);
  //                     console.log("There is overlap");
  //                   }

  //                 }
  //               }
  //             )
  //           }
  //         }
  //       )
  //     }
  //   )
  // }

  blackoutCount: number = 0;

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
                          isBlackout: true

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

                    for (let i = 0; i < this.blackouts.length; ++i) {
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

                            // this.modalRef.hide();

                            const initialState = {
                              title: 'Blackout Encountered',
                              message: 'Are You sure you want to proceed with the change, because the time-slot lies in a blackout.',
                              bgClass: 'bgRed',
                              isBlackout: true

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

                  }
                })
              }
            })
          }
        )
      }
    )
  }

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
    this.miniDatabase.forEach(
      (db) => {
        db.Slots.forEach(
          (slot) => {
            slot.allSlots.forEach((allSlot) => {
              if (allSlot.Heading == target.attributes.getNamedItem('location').value) {
                allSlot.AllSlotBox.forEach((slotBox) => {

                  if (slotBox.StartTime == source.attributes.getNamedItem('starttime').value) {
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


  currentBlackout: boolean;
  dbBlackout: boolean;
  addCurrentTimeSlot: boolean;
  addMiniDbTimeSlot: boolean;
  //testCount: number = 0;

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
                    timeSlotExists=false;
                    //debugger;
                    element.Duration = parseInt(source.attributes.getNamedItem('duration').value);
                    element.Height = source.attributes.getNamedItem('boxheight').value;
                    element.IsBlankBox = false;
                    element.IsGameBox = false;
                    element.SlotColor = "#16a085";
                    element.SeriesId = seriesid;
                  }

                  else {
                    console.log("Time Slot Already Exists");
                    timeSlotExists=true;
                    const initialState = {
                      title: 'Time Slot Already Exists',
                      message: 'Time Slot Can Not be added as a Time Slot already exists in the target location.',
                      bgClass: 'bgRed',
                      isBlackout: false 
                    };

                    this.modalRef = this.modalService.show(ValidationModalComponent,{initialState});

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


    if(timeSlotExists==false){
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
   



    if (source.getAttribute('seriesid') == null || source.getAttribute('seriesid').length <= 1) {
      console.log("Series id is null");
      this.checkCurrentPeriodBlackout(source, target, seriesid);

    }

    else {
      console.log("Series Id is not null");

      if(timeSlotExists==false){
        console.log(timeSlotExists);
        const initialState = {
          title: 'Change Time Slot',
          message: 'Do you want to apply the same changes to the entire season ?',
          bgClass: 'bgBlue',
          isBlackout: false
        };
  
        this.modalRef = this.modalService.show(ValidationModalComponent, { initialState });
  
        this.dataService.timeSlotSubject.subscribe((data) => {
          console.log(data);
          if (data) {
            //Apply to All 
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
                          isBlackout: true

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
    this.miniDatabase.forEach(
      (db) => {
        db.Slots.forEach(
          (slot) => {
            slot.allSlots.forEach((allSlot) => {
              if (allSlot.Heading == target.attributes.getNamedItem('location').value) {
                allSlot.AllSlotBox.forEach((slotBox) => {

                  if (slotBox.StartTime == source.attributes.getNamedItem('starttime').value) {
                    // console.log(slotBox);
                    // console.log(allSlot);
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
    this.jsonVar.allSlots.forEach(
      slot => {
        if (slot.Heading == source.attributes.getNamedItem('location').value) {
          console.log(slot);
          slot.AllSlotBox.forEach(
            
            element => {
             
              if (element.StartTime == source.attributes.getNamedItem('starttime').value) {
                console.log(element);
                //debugger;

                this.jsonVar.FreeGames.push({
                  Division: element.AllGameBox[0].AllBox[0].Division,
                  GameDivId: element.AllGameBox[0].AllBox[0].GameDivId,
                  GameVolunteerList: element.AllGameBox[0].AllBox[0].GameVolunteerList,
                  Name: element.AllGameBox[0].AllBox[0].BoxValue
                });
                //debugger;

                element.AllGameBox[0].AllBox.splice(0,1);
                element.AllGameBox.splice(0,1);
                element.IsGameBox = false;   
                element.IsBlankBox = false;  

              }

            }
          )
        }
      }
    )

    //Removing the un-necesary div created by dragula at the top
    let domElement: HTMLElement = this.gameElement.nativeElement;
    //domElement.parentNode.removeChild(domElement);
    console.log(this.jsonVar.FreeGames);


  }

  gameSlottoBlankSlot(name, el, target, source, sibling) {
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

    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].IsBlankBox = true;
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].Height = "20px";
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].SlotColor = "";
    this.jsonVar.allSlots[allSlotsIndex].AllSlotBox[slotBoxIndex].Duration = 0;

    //Removing the un-necesary div created by dragula at the top
    //let domElement: HTMLElement = this.timeElement.nativeElement;

    let slotDivId = source.getAttribute('SlotDivId');   
    var el = this.elementRef.nativeElement.querySelector('.'+slotDivId);
    el.remove();
    //el.style.display = 'none';     
    //domElement.parentNode.removeChild(domElement);
  

  }

  checkGameSlotPlacement(allSlotBox: AllSlotBox) {
    console.log("Checking Game Slot Placement");

    var gameSlotDetails = allSlotBox.AllGameBox[0].AllBox[0];
    var gameVolunteerList = gameSlotDetails.GameVolunteerList;
    console.log("------------");
    console.log(allSlotBox.Location);
    //console.log(allSlotBox.LocationId);
    console.log(allSlotBox);
    var index = 0;
    let sameLocations: TravelIndex[] = [];
    let differentLocations : TravelIndex[] = [];

    var sameLocationFlag = null;
    var differentLocationFlag = null;
    // var sameLocationAllSlotIndex = [];
    // var sameLocationSlotBoxIndex = [];
    // var differentLocationAllSlotIndex = [];
    // var differentLocationSlotBoxIndex = [];



    for (var i = 0; i < gameVolunteerList.length; ++i) {
      this.jsonVar.allSlots.forEach((slot,allSlotIndex) => {        
        slot.AllSlotBox.forEach((slotBox, slotBoxIndex) => {          
          if (slotBox.AllGameBox.length > 0 && slotBox.IsGameBox) {
            slotBox.AllGameBox[0].AllBox[0].GameVolunteerList.forEach(volunteer => {
              if (gameVolunteerList[i].VolunteerSeasonalId == volunteer.VolunteerSeasonalId) {
                //So the same volunteer has another game scheduled on the same day
                if (allSlotBox.Location == slotBox.Location && allSlotBox.StartTime != slotBox.StartTime) {
                  //It means the volunteer is in the same location. So he can easily go to the next game
                  //Okay        
                  // sameLocationAllSlotIndex.push(allSlotIndex);
                  // sameLocationSlotBoxIndex.push(slotBoxIndex);

                  let newModel = new TravelIndex();
                  newModel.allSlotIndex = allSlotIndex;
                  newModel.slotBoxIndex = slotBoxIndex;
                  sameLocations.push(newModel);
                  sameLocationFlag=true;
                  console.log("*****************");
                  console.log("Same location");
                  console.log("Index: "+ ++index);
                  console.log(allSlotIndex,slotBoxIndex);
                  console.log(allSlotBox.Location);
                  console.log(slotBox.Location);
                  console.log(slotBox);

                  if(differentLocationFlag==true){
                    allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
                    slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
                  }
                  else{
                    allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
                    slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
                  }                
                }

                else if ((allSlotBox.Location != slotBox.Location) && slotBox.AllGameBox.length > 0) {
                  //Calculate time to move between both locations
                  console.log("*****************");
                  console.log("Different locations");
                  console.log("Index: " + ++index);
                  console.log(allSlotIndex,slotBoxIndex);
                  differentLocationFlag=true;     

                  let newModel = new TravelIndex();
                  newModel.allSlotIndex = allSlotIndex;
                  newModel.slotBoxIndex = slotBoxIndex;
                  differentLocations.push(newModel);
                 
                  console.log(slotBox.Location);
                  console.log(slotBox);                  
                  console.log(slotBox.AllGameBox[0].AllBox[0]);
                  //this.gameElement.nativeElement.style.background="red";                 

                  this.calculateTravelTime(allSlotBox, gameSlotDetails, slotBox);

                }
              }
            })
          }
        })
      })
    }  
   
    
    console.log(sameLocations);
    console.log(differentLocations);

  }

  calculateTravelTime(allSlotBox: AllSlotBox, gameSlotDetails: AllBox, slotBox: AllSlotBox) {
    //Caldulating Travel Time  
    console.log("Calculating Travel Time");

    // console.log("Time Slot Box:");
    // console.log(allSlotBox.LocationId);
    // console.log(allSlotBox);
    // console.log("Game Slot Box:");
    // console.log(slotBox.LocationId);
    // console.log(slotBox);


    let gameSlotStartTime = moment(slotBox.AllGameBox[0].AllBox[0].StartTime, "HH:mm A");
    let gameSlotEndTime = moment(slotBox.AllGameBox[0].AllBox[0].EndTime, "HH:mm A");
    // console.log("GameSlot Start Time: " + gameSlotStartTime.format("HH:mm "));
    // console.log("GameSlot End Time:" + gameSlotEndTime.format("HH:mm"));

    let timeSlotStartTime = moment(allSlotBox.StartTime, "HH:mm A");
    let timeslotEndTime = moment(allSlotBox.StartTime, "HH:mm A").add(allSlotBox.Duration, "minutes");

    // console.log("TimeSlot Start Time: " + timeSlotStartTime.format("HH:mm"));
    // console.log("TimeSlot End Time:" + timeslotEndTime.format("HH:mm"));

    console.log(this.jsonVar.TravelMatrix);


    if (timeSlotStartTime.isSame(gameSlotStartTime)) {
      console.log("--Both Start Times are same.");
      allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
      slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
    }

    else if (timeSlotStartTime.isBefore(gameSlotStartTime)) {
      console.log("--Time Slot before Game.");
      var tsEndTime = parseInt(timeslotEndTime.format("HH")) * 60 + parseInt(timeslotEndTime.format("mm"));
      var gsStartTime = parseInt(gameSlotStartTime.format("HH")) * 60 + parseInt(gameSlotStartTime.format("mm"));

      // console.log(tsEndTime);
      // console.log(gsStartTime);

      //var timeBwSlots = gameSlotStartTime.subtract(tsEndTime, "ms").format("hh:mm");
      var timeBwSlots = gsStartTime - tsEndTime;

      for (var i = 0; i < this.jsonVar.TravelMatrix.length; ++i) {
        if ((this.jsonVar.TravelMatrix[i].FromFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].ToFacilityId == slotBox.LocationId)
          || (this.jsonVar.TravelMatrix[i].ToFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].FromFacilityId == slotBox.LocationId)) {
          //console.log(slotBox.LocationId + ', ' + this.jsonVar.TravelMatrix[i].FromFacilityId);
          //console.log(this.jsonVar.TravelMatrix[i].ToFacilityId + ', ' + allSlotBox.LocationId);
          //console.log(timeBwSlots);
          //console.log(this.jsonVar.TravelMatrix[i]);
          if (this.jsonVar.TravelMatrix[i].Duration < timeBwSlots) {
            //No Error

            //console.log(i);
            console.log(this.jsonVar.TravelMatrix[i].Duration);
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
          }
          else {
            //Error
            //console.log(this.jsonVar.TravelMatrix[i].Duration);
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
          }
        }
      }


    }

    else if (timeSlotStartTime.isAfter(gameSlotStartTime)) {
      console.log("--Time Slot after Game.");
      var tsStartTime = parseInt(timeSlotStartTime.format("HH")) * 60 + parseInt(timeSlotStartTime.format("mm"));
      var gsEndTime = parseInt(gameSlotEndTime.format("HH")) * 60 + parseInt(gameSlotEndTime.format("mm"));
      var timeBwSlots = tsStartTime - gsEndTime;
      // console.log(tsStartTime);
      // console.log(gsEndTime);
      // console.log(timeBwSlots);
      for (var i = 0; i < this.jsonVar.TravelMatrix.length; ++i) {
        console.log(this.jsonVar.TravelMatrix[i]);
        if ((this.jsonVar.TravelMatrix[i].FromFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].ToFacilityId == slotBox.LocationId)
          ||
          (this.jsonVar.TravelMatrix[i].ToFacilityId == allSlotBox.LocationId && this.jsonVar.TravelMatrix[i].FromFacilityId == slotBox.LocationId)
        ) {
          //console.log(this.jsonVar.TravelMatrix[i]);
          //console.log(slotBox.LocationId + ', ' + this.jsonVar.TravelMatrix[i].FromFacilityId);
          //console.log(this.jsonVar.TravelMatrix[i].ToFacilityId + ', ' + allSlotBox.LocationId);
          //console.log(timeBwSlots);
          //console.log(this.jsonVar.TravelMatrix[i]);
          if (this.jsonVar.TravelMatrix[i].Duration < timeBwSlots) {
            //No Error
            //console.log(this.jsonVar.TravelMatrix[i].Duration);
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "#2980b9";
          }
          else {
            //Error
            console.log(this.jsonVar.TravelMatrix[i].Duration);
            allSlotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
            slotBox.AllGameBox[0].AllBox[0].BackgroundColor = "red";
          }
        }
      }
    }

    //console.log(timeBwSlots);
    //this.fetchingData=false;

  }

  togglePeriod(timePeriodNumber) {
    this.fetchingData = true;
    this.dataService.togglePeriod(timePeriodNumber).subscribe(
      (res) => {
        this.responseData = res;
        console.log(this.responseData);
        //console.log(JSON.stringify(this.responseData));
        this.jsonVar = this.responseData.CurrentPeriodSlot;
        console.log(this.jsonVar);
        this.fetchingData = false;
      }
    );
  }

  checkTimeSlotDropValidity(source,target){
    //console.log(source, target);

    var seriesid = source.getAttribute('seriesid');
    var timeSlotExists = null;
    // let targetStartTime = moment(target.attributes.getNamedItem('starttime').value, "HH:mm A");
    // let targetEndTime = moment(target.attributes.getNamedItem('endtime').value, "HH:mm A");


    this.jsonVar.allSlots.forEach(
      (slot, allSlotIndex) => {
        if (slot.Heading == target.attributes.getNamedItem('location').value) {
          slot.AllSlotBox.forEach(
            (element, slotBoxIndex) => {
              if (element.StartTime == target.attributes.getNamedItem('starttime').value) {
                // console.log("Element.....");
                // console.log(element);

                if (element.IsBlankBox == true) {
                  //let targetStartTime = moment(target.attributes.getNamedItem('starttime').value, "HH:mm A").add(30,'minutes').format('hh:mm A');
                  let targetStartTime = element.EndTime;
                  console.log(targetStartTime);
                  // console.log(allSlotIndex, slotBoxIndex);
                  // console.log(this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 1]);
                  // console.log(this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex - 1]);

                  if (this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex + 1].IsBlankBox == true
                    &&
                    this.jsonVar.allSlots[allSlotIndex].AllSlotBox[slotBoxIndex - 1].IsBlankBox == true) {
                    console.log("It is a null slot.");
                    timeSlotExists=false;
                    //return true;
                  }

                  else {
                    console.log("Time Slot Already Exists");
                    timeSlotExists=true;
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

  // convertMinsToHrsMins(minutes) {
  //   var h = Math.floor(minutes / 60);
  //   var m = minutes % 60;
  //   var hh = h < 10 ? '0' + h : h;
  //   var mm = m < 10 ? '0' + m : m;
  //   return hh + ':' + mm;
  // }
}
