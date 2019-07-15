import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { FYBADataFromBackEnd } from './models/root.model';

@Injectable()
export class DataService {
 
  headerOptions;
  postRequestOptions;
  timeSlotSubject = new Subject<boolean>();
  blackoutSubject = new Subject<boolean>();

  constructor(public http: HttpClient) {
    this.headerOptions = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.postRequestOptions = { headers: this.headerOptions};
  }

  getWorkbenchDataOld(): Observable<any> {
    return this.http.get('assets/test.json')
      .map((res) => res);
  }



  getWorkbenchData(model): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'responseType': 'json'
  });

  let options = {headers:headers};
    
    // var body = JSON.stringify({
    //   SeasonId: '23',
    //   Period: '3',
    //   GameScheduleId: '1',
    //   LoginUserId: '7113'
    // });
    var body = JSON.stringify(model);
    console.log(body);
    return this.http.post('http://38.109.219.208:2019/api/GameWorkbench',body,this.postRequestOptions);
  }

  togglePeriod(model,timePeriodNumber):Observable<any> {
    var body = JSON.stringify({
      SeasonId: model.SeasonId,
      Period: timePeriodNumber,
      GameScheduleId: model.GameScheduleId,
      LoginUserId: model.LoginUserId
    });
    console.log(body);
    return this.http.post('http://38.109.219.208:2019/api/GameWorkbench',body,this.postRequestOptions);
  }

  saveData(data):Observable<any>{
    console.log(data);
    return this.http.post("http://38.109.219.208:2019/api/SaveGameWorkbench", data, this.postRequestOptions);
    
  }


}
