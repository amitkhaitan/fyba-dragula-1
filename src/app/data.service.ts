import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class DataService {

  constructor(public http: Http) { }

  getWorkbenchData():Observable<any>{
    return this.http.get('http://209.105.243.241/api/FYBAAngular/')
    .map((res)=>res.json());
  }

}
