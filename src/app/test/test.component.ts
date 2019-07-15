import { Directive, Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DragServiceService } from '../drag-service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DragulaService } from 'ng2-dragula';
import { findIndex } from 'rxjs/operator/findIndex';
import { timeInterval } from 'rxjs/operator/timeInterval';
//import { ECANCELED } from 'constants';

declare var jQuery: any;

@Component({
  //providers:[DragServiceService],
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  jsonVar: Object;
  dragStartSlotId = 0;
  dragParentDiv;
  objOldJSON;
  objNewJSON;
  dragFreeGameId;
  dragFreeGameParentDiv;
  slotIdCounter = 10000;
  slotCountForUI=0;

  ngOnInit() {
    this.getGameAndSlotData();

  }
  ngOnDestroy() { console.log("Destroy"); }

  constructor(private http: Http, private sanitizer: DomSanitizer, private dragulaService: DragulaService, public elementRef: ElementRef) {
    // dragulaService.drag.subscribe((value) => {
    //   this.onDrag(value.slice(1));
    // });
    // dragulaService.drop.subscribe((value) => {
    //   this.onDrop(value.slice(1));
    // });
    // dragulaService.over.subscribe((value) => {
    //   this.onOver(value.slice(1));
    // });
    // dragulaService.out.subscribe((value) => {
    //   this.onOut(value.slice(1));
    // });
    // dragulaService.setOptions('bag-task1', {
    //   removeOnSpill: false
    // });

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
    let [e, el] = args;
    //console.log(el);
    //console.log(e);
    if (el.getAttribute("SlotId") === null) {
      this.dragFreeGameId = e.getAttribute("id");
      //console.log(el.getAttribute("id"));
      this.dragFreeGameParentDiv = e;
      this.dragStartSlotId = 0;
    }
    else {
      this.dragStartSlotId = el.getAttribute("SlotId");
      this.dragParentDiv = el;
    }
    //console.log(this.dragStartSlotId);
  }

  private onDrop(args) {

    let [e, el] = args;
    console.log(e);
    console.log(el);
    // e: drag object.
    // el: drop container.
    this.removeClass(e, 'dragOver');
    
    //Detete time slot
    if (e.getAttribute("attrFreeSlot") == "1" && el.getAttribute("attrDelete") == "1") {

      var _location = e.getAttribute("location");
      var _slotId = e.getAttribute("slotid");
      this.jsonVar["allSlots"].forEach(_slot => {
        if (_slot.Heading == _location) {
          _slot["AllSlotBox"].forEach(_slotBox => {
            if (_slotBox.SlotId == _slotId) {
              _slotBox.IsBlankBox = true;
            }
          });
        }
      });
      el.innerHTML = "<br/>Drop for delete timeslot";
    }
    //drop free slot on blank area
    else if (e.getAttribute("attrFreeSlot") == "1" && el.getAttribute("attrBlank") == "1" && el.getAttribute("attrDelete") == null) {
      console.log("0");
      var _newlocation = el.getAttribute("location");
      var _oldlocation = e.getAttribute("location");
      var _slotId = e.getAttribute("slotid");
      var _startTimeString = el.getAttribute("StratTime");
      var _height = e.getAttribute("boxHeight");

      var _duration = this.ConvertPixelIntoMinute(_height);
      var _startTime = new Date("1/1/2000 " + _startTimeString);
      var _endTime = new Date("1/1/2000 " + _startTimeString);
      _endTime = new Date(_endTime.getTime() + (_duration * 60 * 1000));
      console.log(_endTime + "," + _newlocation + "," + _startTime + "," + _duration + "," + _startTimeString);
      var _flag = 0
      _flag = this.ValidateTimeSlotWhenDrop(_endTime, _newlocation, _startTime, _duration, _startTimeString, e, el, false, _slotId);
      console.log(_flag);
      if (_flag == 0) {
        this.jsonVar["allSlots"].forEach(_slot => {
          if (_slot.Heading == _newlocation) {
            _slot["AllSlotBox"].forEach(_slotBox => {
              if (_slotBox.IsBlankBox == true && _slotBox.StratTime == _startTimeString) {
                _slotBox.IsBlankBox = false;
                _slotBox.Height = _height;
              }
            });
          }
          if (_slot.Heading == _oldlocation) {
            _slot["AllSlotBox"].forEach(_slotBox => {
              if (_slotBox.SlotId == _slotId) {
                _slotBox.IsBlankBox = true;
                _slotBox.Height = "20px";
              }
            });
          }
        });
      }
      else {
        this.dragulaService.find('bag-task1').drake.cancel(true);
      }
    }
    else if (e.getAttribute("dragCase5") == "1" && el.getAttribute("dragCase4") == "1" && e.getAttribute("attrMainTimeSlot") == null && e.getAttribute("attrfreegame") == null && el.getAttribute("attrDelete") == null) {
      console.log("1");
      var _location = el.getAttribute("location");
      var _slotId = el.getAttribute("slotid");
      var _gameDivId = e.getAttribute("id");
      var _division = e.getAttribute("division");
      var _slotDuration = el.getAttribute("duration");

      var _flag = 0;
      console.log("D:" + _division + " == Du:" + _slotDuration);
      if (_slotDuration != "85" && (_division == "1B" || _division == "2B" || _division == "1/2G")) {
        _flag = 1;
      }
      else if (_slotDuration == "85" && (_division != "1B" && _division != "2B" && _division != "1/2G")) {
        _flag = 2;
      }
      if (_flag == 0) {
        //console.log(_slotId);
        this.jsonVar["allSlots"].forEach(_slot => {
          _slot["AllSlotBox"].forEach(_slotBox => {
            if (_slotBox.AllGameBox != null && _slotBox.AllGameBox[0].AllBox.length == 1) {
              if (_slotBox.AllGameBox[0].AllBox[0].GameDivId == _gameDivId) {
                this.objOldJSON = _slotBox.AllGameBox[0].AllBox[0];
                _slotBox.IsGameBox = false;
              }
            }
          });
        });
        //console.log(this.jsonVar);
        this.jsonVar["allSlots"].forEach(_slot => {
          if (_slot.Heading == _location) {
            _slot["AllSlotBox"].forEach(_slotBox => {
              if (_slotBox.IsBlankBox == false && _slotBox.SlotId == _slotId) {
                //console.log(this.objOldJSON)
                _slotBox.IsGameBox = true;
                _slotBox.AllGameBox = [{}];
                _slotBox.AllGameBox[0].TimeGroup = "1";
                _slotBox.AllGameBox[0].AllBox = [{}];
                _slotBox.AllGameBox[0].AllBox[0] = this.objOldJSON;
                _slotBox.AllGameBox[0].AllBox[0].BoxHeight = _slotBox.Height;
                _slotBox.AllGameBox[0].AllBox[0].BoxTop = _slotBox.Top;
              }
            });
          }
        });
        this.ValidateGameResourceTiming(e, el);
      }
      else if (_flag == 1) {

        alert("You can not add division 1B,2B & 1/2G game in 55 minute slot");
        this.dragulaService.find('bag-task1').drake.cancel(true);
      }
      else if (_flag == 2) {

        alert("You can add only division 1B,2B & 1/2G game in 85 minute slot");
        this.dragulaService.find('bag-task1').drake.cancel(true);
      }

    }
    else if ((e.getAttribute("dragCase1") == "1" && el.getAttribute("dragCase1") == "1")
      || (e.getAttribute("dragCase2") == "1" && el.getAttribute("dragCase2") == "1")
      || (e.getAttribute("dragCase3") == "1" && el.getAttribute("dragCase3") == "1")
      || (e.getAttribute("dragCase4") == "1" && el.getAttribute("dragCase4") == "1")
      || (e.getAttribute("dragCase7") == "1" && el.getAttribute("dragCase7") == "1")
      || (e.getAttribute("dragCase5") == "1" && el.getAttribute("dragCase5") == "1")
    ) {
      console.log("2");
      this.dragulaService.find('bag-task1').drake.cancel(true);
    }
    // Free Game in free slots
    else if (e.getAttribute("attrfreegame") == "1" && el.getAttribute("attrfreeslot") == "1" && el.getAttribute("attrDelete") == null) // when freeGame drop into freeSlot
    {
      console.log("3");
      var _location = el.getAttribute("location");
      var _slotId = el.getAttribute("slotid");
      var _division = e.getAttribute("division");
      var _slotDuration = el.getAttribute("duration");
      var _flag = 0;
      console.log("D:" + _division + " == Du:" + _slotDuration);
      if (_slotDuration != "85" && (_division == "1B" || _division == "2B" || _division == "1/2G")) {
        _flag = 1;
      }
      else if (_slotDuration == "85" && (_division != "1B" && _division != "2B" && _division != "1/2G")) {
        _flag = 2;
      }
      if (_flag == 0) {
        this.jsonVar["allSlots"].forEach(_slot => {
          if (_slot.Heading == _location) {
            _slot["AllSlotBox"].forEach(_slotBox => {
              if (_slotBox.IsBlankBox == false && _slotBox.SlotId == _slotId) {
                _slotBox.IsGameBox = true;
                _slotBox.AllGameBox = [{}];
                _slotBox.AllGameBox[0].TimeGroup = "1";
                _slotBox.AllGameBox[0].AllBox = [{}];

                _slotBox.AllGameBox[0].AllBox[0].BoxColor = "#2980b9";
                _slotBox.AllGameBox[0].AllBox[0].BoxValue = e.innerText;
                _slotBox.AllGameBox[0].AllBox[0].GameDivId = e.getAttribute("id");
                _slotBox.AllGameBox[0].AllBox[0].ResourceGroup = e.getAttribute("resourcegroup");
                _slotBox.AllGameBox[0].AllBox[0].BoxHeight = _slotBox.Height;
                _slotBox.AllGameBox[0].AllBox[0].BoxTop = _slotBox.Top;
                _slotBox.AllGameBox[0].AllBox[0].StratTime = el.getAttribute("strattime");
                _slotBox.AllGameBox[0].AllBox[0].TimeGroup = "1";
                //_slotBox.AllGameBox[0].AllBox[0].Division = _division;
                //console.log("11111 = >>>"+_division);
                //console.log(_slotBox);
              }
            });
          }
        });
        this.ValidateGameResourceTiming(e, el);
      }
      else if (_flag == 1) {

        alert("You can not add division 1B,2B & 1/2G game in 55 minute slot");
        this.dragulaService.find('bag-task1').drake.cancel(true);
      }
      else if (_flag == 2) {

        alert("You can add only division 1B,2B & 1/2G game in 85 minute slot");
        this.dragulaService.find('bag-task1').drake.cancel(true);
      }

    }
    else if (e.getAttribute("dragCase6") == "1" && el.getAttribute("dragCase6") == "1" && el.getAttribute("attrDelete") == null) // when timeslot drop into free area
    {
      console.log("4");
      var _duration1 = e.getAttribute("tsDuration");
      var _location = el.getAttribute("location");
      var _startTimeString = el.getAttribute("StratTime");
      var _divHeight = e.getAttribute("tsHeight");
      var _startTime = new Date("1/1/2000 " + _startTimeString);
      var _endTime = new Date("1/1/2000 " + _startTimeString);
      _endTime = new Date(_endTime.getTime() + (_duration1 * 60 * 1000));
      this.ValidateTimeSlotWhenDrop(_endTime, _location, _startTime, _duration1, _startTimeString, e, el, true, 0);
      this.dragulaService.find('bag-task1').drake.cancel(true);
    }
    else if (e.getAttribute("attrGameBox") == "1" && el.getAttribute("dragCase1") == "1") {
      var _index = this.jsonVar["FreeGames"].length;
      var _newObj = {
        "Name": e.getAttribute("title"),
        "GameDivId": e.getAttribute("id"),
        "ResourceGroup": e.getAttribute("ResourceGroup"),
        "Division": e.getAttribute("Division")
      };
      this.jsonVar["FreeGames"].unshift(_newObj); //unshift : push into list at top index (0);

      this.jsonVar["allSlots"].forEach(_slot => {
        _slot["AllSlotBox"].forEach(_slotBox => {
          if (_slotBox.AllGameBox != null && _slotBox.AllGameBox[0].AllBox.length == 1) {
            if (_slotBox.AllGameBox[0].AllBox[0].GameDivId == _newObj.GameDivId) {
              _slotBox.IsGameBox = false;
            }
          }
        });
      });
      console.log(this.jsonVar["FreeGames"]);
      this.dragulaService.find('bag-task1').drake.cancel(true);
    }
    else {
      console.log(e.getAttribute("attrGameBox"));
      this.dragulaService.find('bag-task1').drake.cancel(true);
    }
    //#region Update JSON data
  }

  private ValidateTimeSlotWhenDrop(_endTime: Date, _location: any, _startTime: any, _duration: any, _startTimeString: any, e: any, el: any, _checkResourceTiming: boolean, _slotId: any) {
    var _flagError = 0;
    var _endTimeString = "";
    var _maxTime = new Date("1/1/2000 10:00 PM");
    if (_endTime.getHours() > 12) {
      _endTimeString = (_endTime.getHours() - 12) + ":" + _endTime.getMinutes() + " PM";
    }
    else {
      _endTimeString = _endTime.getHours() + ":" + _endTime.getMinutes() + " AM";
    }
    if (_endTime.getTime() <= _maxTime.getTime()) {
      _flagError = 0;
      this.jsonVar["allSlots"].forEach(_slot => {
        if (_slot.Heading == _location) {
          //console.log(_location);
          _slot["AllSlotBox"].forEach(_slotBox => {
            if ((_slotBox.IsGameBox || _slotBox.IsBlankBox == false) && _slotBox.SlotId != _slotId) {
              var _stime = new Date("1/1/2000 " + _slotBox.StratTime);
              var _etime = new Date("1/1/2000 " + _slotBox.EndTime);
              var _slotDuration = this.ConvertPixelIntoMinute(_slotBox.Height);
              if (_slotDuration <= 60) {
                var _m = _stime.getMinutes() + _slotDuration;
                if (_m <= 60) {
                  _etime.setMinutes(_m);
                }
                else {
                  var _h = _stime.getHours();
                  var _newHour = _m / 60;
                  _etime.setHours(_h + parseInt(_newHour.toString()));
                  _etime.setMinutes(_m - (parseInt(_newHour.toString()) * 60));
                }
                //console.log("if:"+_etime);
              }
              else {
                var _m = _stime.getMinutes() + _slotDuration;
                var _h = _stime.getHours();
                var _newHour = _m / 60;
                _etime.setHours(_h + parseInt(_newHour.toString()));
                _etime.setMinutes(_m - (parseInt(_newHour.toString()) * 60));
                //console.log("else:"+_etime);
              }
              //console.log(_stime +" < = > "+_slotBox.Height);
              if ((_startTime.getTime() <= _stime.getTime() && _stime.getTime() <= _endTime.getTime()) || (_startTime.getTime() <= _etime.getTime() && _etime.getTime() <= _endTime.getTime())) {
                _flagError = 1;
              }
            }
          });
        }
      });
      if (_flagError == 1) {
        alert("Timeslot overlap: You can not insert " + _duration + " minuts timeslot at " + _startTimeString);
      }
      else {
        _flagError = 0;
        this.slotIdCounter++;
        this.jsonVar["allSlots"].forEach(_slot => {
          if (_slot.Heading == _location) {
            _slot["AllSlotBox"].forEach(_slotBox => {
              var _stime = new Date("1/1/2000 " + _slotBox.StratTime);
              var _etime = new Date("1/1/2000 " + _slotBox.EndTime);
              if (_slotBox.IsBlankBox && _stime.getTime() == _startTime.getTime()) {
                //console.log(_slotBox.Height);
                _slotBox.IsBlankBox = false;
                _slotBox.Height = this.ConvertMinuteIntoPixel(_duration);
                if (_duration == 55) {
                  _slotBox.SlotColor = "#16a085";
                  _slotBox.Duration = 55;
                }
                else {
                  _slotBox.SlotColor = "#f1c40f";
                  _slotBox.Duration = 85;
                }
                _slotBox.slotid = this.slotIdCounter;
              }
            });
          }
        });
        if (_checkResourceTiming) {
          this.ValidateGameResourceTiming(e, el);
        }
      }
    }
    else {
      _flagError = 1;
      alert("You can not insert " + _duration + " minuts timeslot at " + _startTimeString);
    }
    return _flagError;
  }

  private ValidateGameResourceTiming(e: any, el: any) {

    var _resourceGroup = e.getAttribute("ResourceGroup");
    var _division = e.getAttribute("division");

    //console.log(_resourceGroup + " => " + this.dragStartSlotId);
    if (this.dragStartSlotId != 0) {
      var _newSlotId = el.getAttribute("SlotId");
      var _gameId = e.getAttribute("id");
      //#region set Old value
      //console.log("=> 1");
      this.jsonVar["allSlots"].forEach(_slot => {
        _slot["AllSlotBox"].forEach(_slotBox => {
          //console.log("=> 2");
          if (_slotBox.SlotId == this.dragStartSlotId) {
            //console.log("=> 3");
            /*if (_slotBox.AllGameBox[0].AllBox.length > 1) {
              _slotBox.AllGameBox[0].AllBox.forEach(_box => {
                if (_box.GameDivId == _gameId) {
                  //InCompleate -- need to work on it 
                }
              });
            }*/
            if (_slotBox.AllGameBox[0].AllBox.length == 1) {
              if (_slotBox.AllGameBox[0].AllBox[0].GameDivId == _gameId) {
                // console.log("=> 4");
                this.objOldJSON = _slotBox.AllGameBox[0].AllBox[0];
                _slotBox.IsGameBox = false;
                //_slotBox.Height = _slotBox.AllGameBox[0].AllBox[0].BoxHeight;
                _slotBox.Top = _slotBox.AllGameBox[0].AllBox[0].BoxTop;
              }
            }
          }
        });
      });
      //#endregion
      //#region Set new value
      this.jsonVar["allSlots"].forEach(_slot => {
        _slot["AllSlotBox"].forEach(_slotBox => {
          if (_slotBox.SlotId == _newSlotId) {

            _slotBox.IsGameBox = true;
            _slotBox.AllGameBox = [{}];
            _slotBox.AllGameBox[0].TimeGroup = "1";
            _slotBox.AllGameBox[0].AllBox = [];
            _slotBox.AllGameBox[0].AllBox[0] = this.objOldJSON;
            _slotBox.AllGameBox[0].AllBox[0].BoxHeight = _slotBox.Height;
            _slotBox.AllGameBox[0].AllBox[0].BoxTop = _slotBox.Top;
            this.addClass(this.dragParentDiv, 'borderGreen');
          }
        });
      });
      //#endregion
    }
    // For Free Gmames
    else {
      //console.log("=> 5");
      var _newSlotId = el.getAttribute("SlotId");
      this.jsonVar["allSlots"].forEach(_slot => {
        //console.log("=> 6");
        _slot["AllSlotBox"].forEach(_slotBox => {
          if (_slotBox.SlotId == _newSlotId) {
            //console.log("=> 7");
            _slotBox.IsGameBox = true;
            _slotBox.AllGameBox = [{}];
            _slotBox.AllGameBox[0].TimeGroup = "1";
            _slotBox.AllGameBox[0].AllBox = [{}];
            _slotBox.AllGameBox[0].AllBox[0].BoxHeight = _slotBox.Height;
            _slotBox.AllGameBox[0].AllBox[0].BoxColor = "#2980b9";
            _slotBox.AllGameBox[0].AllBox[0].BoxValue = this.dragFreeGameParentDiv.innerText;
            _slotBox.AllGameBox[0].AllBox[0].BoxTop = _slotBox.Top;
            _slotBox.AllGameBox[0].AllBox[0].GameDivId = this.dragFreeGameParentDiv.getAttribute("id");
            _slotBox.AllGameBox[0].AllBox[0].ResourceGroup = this.dragFreeGameParentDiv.getAttribute("resourcegroup");
            _slotBox.AllGameBox[0].AllBox[0].Division = _division;
          }
        });
      });
    }
    //#endregion
    // Set all Game Blue of same resource
    this.ChangeGameBoxColor(_resourceGroup);
  }

  private ChangeGameBoxColor(_resourceGroup: any) {
    //console.log("=> 10");
    var _timeInterval = this.jsonVar["TimeInterval"];
    //console.log(_timeInterval);
    var _newSlotStartTime, _newSlotEndTime, _newSlotHeight, _newSlotLocation, _newSlotTop;
    this.jsonVar["allSlots"].forEach(_iSlot => {
      _iSlot["AllSlotBox"].forEach(_iSlotBox => {
        if (_iSlotBox.IsGameBox) {
          //console.log("=> 11");
          _iSlotBox.AllGameBox[0].AllBox.forEach(_iBox => {
            if (_iBox.ResourceGroup == _resourceGroup) {
              //console.log("=> 12");
              _iSlotBox.AllGameBox[0].AllBox[0].BoxColor = "#2980b9"; //blue
            }
          });
        }
      });
    });
    // i Loop
    this.jsonVar["allSlots"].forEach(_iSlot => {
      _iSlot["AllSlotBox"].forEach(_iSlotBox => {
        if (_iSlotBox.IsGameBox) {
          //console.log("=> 13");
          _iSlotBox.AllGameBox[0].AllBox.forEach(_iBox => {
            if (_iBox.ResourceGroup == _resourceGroup) {
              //console.log("=> 14");
              _newSlotStartTime = _iSlotBox.StratTime;
              _newSlotEndTime = _iSlotBox.EndTime;
              _newSlotHeight = _iBox.BoxHeight;
              _newSlotLocation = _iSlotBox.Location;
              _newSlotTop = _iBox.BoxTop;

              //console.log("_newSlotStartTime="+_newSlotStartTime+"_newSlotTop="+_newSlotTop+"_newSlotHeight="+_newSlotHeight);

              var _newStartTime = new Date("1/1/2000 " + _newSlotStartTime);
              // manage slots when overlap time (like 1:30 to 2:30)
              _newStartTime = new Date(_newStartTime.getTime());
              var _newEndTime = new Date("1/1/2000 " + _newSlotStartTime);
              _newEndTime = new Date(_newEndTime.getTime() + (_iSlotBox.Duration * 60 * 1000));
              var _newSlotId = _iSlotBox.SlotId;
              //j Loop
              this.jsonVar["allSlots"].forEach(_jSlot => {
                _jSlot["AllSlotBox"].forEach(_jSlotBox => {
                  if (_jSlotBox.IsGameBox && _iSlotBox.SlotId != _jSlotBox.SlotId) {
                    _jSlotBox.AllGameBox[0].AllBox.forEach(_jBox => {
                      if (_iBox.ResourceGroup == _jBox.ResourceGroup && _iSlotBox.Location != _jSlotBox.Location) {
                        //console.log("=> 15");
                        var _currentSlotStartTime = new Date("1/1/2000 " + _jSlotBox.StratTime);


                        _currentSlotStartTime = new Date(_currentSlotStartTime.getTime());
                        var _currentSlotEndTime = new Date("1/1/2000 " + _jSlotBox.StratTime);
                        _currentSlotEndTime = new Date(_currentSlotEndTime.getTime() + (_jSlotBox.Duration * 60 * 1000));

                        /*console.log("Duration: "+_jSlotBox.Duration+" => "+_jSlotBox.Duration) 
                        console.log("-----------------------------------") 
                        console.log("New:S "+_newStartTime+" =>E "+_newEndTime) 
                        console.log("Current:S "+_currentSlotStartTime+" =>E "+_currentSlotEndTime) */

                        if ((_currentSlotStartTime <= _newStartTime && _currentSlotEndTime >= _newStartTime) || (_currentSlotStartTime <= _newEndTime && _currentSlotEndTime >= _newEndTime)) {
                          //console.log("Red1");
                          _jSlotBox.AllGameBox[0].AllBox[0].BoxColor = "#e74c3c";
                          _iSlotBox.AllGameBox[0].AllBox[0].BoxColor = "#e74c3c";
                        }
                        else {
                          var _timeDiff = (_newStartTime.getTime() - _currentSlotEndTime.getTime()) / (1000 * 60);
                          //console.log(_timeDiff);
                          //console.log("__________________________________________") 
                          if ((_timeDiff >= -5 && _timeDiff < _timeInterval)) {
                            //console.log("Red2 =>"+_timeDiff+" = > "+_timeInterval);
                            _jSlotBox.AllGameBox[0].AllBox[0].BoxColor = "#e74c3c";
                            _iSlotBox.AllGameBox[0].AllBox[0].BoxColor = "#e74c3c";
                          }
                          if (_timeDiff <= 0) {
                            var _timeDiff = (_newEndTime.getTime() - _currentSlotStartTime.getTime()) / (1000 * 60);
                            //console.log(_timeDiff);
                            //console.log("_________2222222222222___________") 
                            if ((_timeDiff > -5 && _timeDiff < _timeInterval)) {
                              //console.log("Red3");
                              _jSlotBox.AllGameBox[0].AllBox[0].BoxColor = "#e74c3c";
                              _iSlotBox.AllGameBox[0].AllBox[0].BoxColor = "#e74c3c";
                            }
                          }
                        }
                      }
                    });
                  }
                });
              });
            }
          });
        }
      });
    });
    console.log(this.jsonVar);
  }

  private CheckGameConflictOnPageLoad() {
    this.jsonVar["allSlots"].forEach(_iSlot => {
      _iSlot["AllSlotBox"].forEach(_iSlotBox => {
        if (_iSlotBox.IsGameBox) {
          _iSlotBox.AllGameBox[0].AllBox.forEach(_iBox => {
            this.ChangeGameBoxColor(_iBox.ResourceGroup);
          });
        }
      });
    });

  }

  private onOver(args) {
    let [e, el, container] = args;
    //console.log("over");
    this.addClass(e, 'dragOver');
  }

  private onOut(args) {
    //console.log("out");
    let [e, el, container] = args;
    this.removeClass(e, 'dragOver');
  }

  //https://jsonplaceholder.typicode.com/posts/1
  //https://api.github.com/users/hadley/orgs
  //http://209.105.243.241/api/FYBAAngular/
  //https://feeds.citibikenyc.com/stations/stations.json
  //http://ergast.com/api/f1/2004/1/results.json

  getGameAndSlotData(): any {
    //console.log("Inside order summary 2");
    return this.http.get('http://209.105.243.241/api/FYBAAngular/')
      .map((data: Response) => {
        return data.json() as JSON;
      }).toPromise().then(x => {
        this.jsonVar = x;
        this.CheckGameConflictOnPageLoad();
      });
  }

  public ConvertPixelIntoMinute(_px) {
    //console.log("ConvertPixelIntoMinute() Call for "+_px );
    _px = _px.replace("px", "");
    //1 minute=.66px
    var _minute = 0.66;
    return Math.floor(_px / _minute);
  }
  private ConvertMinuteIntoPixel(_minute) {
    //1 minute=.66px
    var px = 0.66
    return Math.floor(_minute * px) + "px";

  }

  RecalculateGameSlotColorAfterTimeChange() {
    this.jsonVar["TimeInterval"] = (document.getElementById("txtTime") as HTMLInputElement).value;
    this.CheckGameConflictOnPageLoad();
  }

  // makeLine(fromDivId, toDivId, lineDivId) {
  //   //console.log(fromDivId);
  //   adjustLine(
  //     document.getElementById(fromDivId),
  //     document.getElementById(toDivId),
  //     document.getElementById(lineDivId)
  //   );

  //   function adjustLine(from, to, line) {

  //     var fT = $(from).offset().top + $(from).height() / 2;
  //     var tT = $(to).offset().top + $(to).height() / 2;
  //     var fL = $(from).offset().left + $(from).width() / 2;
  //     var tL = $(to).offset().left + $(to).width() / 2;

  //     var CA = Math.abs(tT - fT);
  //     var CO = Math.abs(tL - fL);
  //     var H = Math.sqrt(CA * CA + CO * CO);
  //     var ANG = 180 / Math.PI * Math.acos(CA / H);
  //     if (tT > fT) {
  //       var top = (tT - fT) / 2 + fT;
  //     }
  //     else {
  //       var top = (fT - tT) / 2 + tT;
  //     }
  //     if (tL > fL) {
  //       var left = (tL - fL) / 2 + fL;
  //     } else {
  //       var left = (fL - tL) / 2 + tL;
  //     }
  //     if ((fT < tT && fL < tL) || (tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
  //       ANG *= -1;
  //     }
  //     top -= H / 2;
  //     line.style["-webkit-transform"] = 'rotate(' + ANG + 'deg)';
  //     line.style["-moz-transform"] = 'rotate(' + ANG + 'deg)';
  //     line.style["-ms-transform"] = 'rotate(' + ANG + 'deg)';
  //     line.style["-o-transform"] = 'rotate(' + ANG + 'deg)';
  //     line.style["-transform"] = 'rotate(' + ANG + 'deg)';
  //     line.style.top = top + 'px';
  //     line.style.left = left + 'px';
  //     line.style.height = H + 'px';
  //   }
  // }
}
