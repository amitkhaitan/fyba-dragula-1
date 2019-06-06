import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class DataService {
  headerOptions;
  postRequestOptions;
  timeSlotSubject = new Subject<boolean>();

  constructor(public http: HttpClient) {
    this.headerOptions = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.postRequestOptions = { headers: this.headerOptions};
  }

  getWorkbenchDataOld(): Observable<any> {
    return this.http.get('http://38.109.219.208:2019/api/GameWorkbench')
      .map((res) => res);
  }


  getWorkbenchData(): Observable<any> {
  //   let headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'responseType': 'json'
  // });

//   let httpHeaders = new HttpHeaders();
//   httpHeaders.set('Content-Type', 'application/json');    

// let options = {headers:httpHeaders};


// let headers={
//   headers: new HttpHeaders({
//       'Content-Type': 'application/json'
//   })
// }
    
    var body = JSON.stringify({
      SeasonId: '17',
      Period: '3',
      GameScheduleId: '1',
      LoginUserId: '7113'
    });
    console.log(body);
    return this.http.get('http://38.109.219.208:2019/api/GameWorkbench');
  }


}
