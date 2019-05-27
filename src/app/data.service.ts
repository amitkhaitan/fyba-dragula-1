import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class DataService {

  constructor(public http: Http) { }

  getWorkbenchData():Observable<any>{
    return this.http.get('http://38.109.219.208:2019/api/GameWorkbench')
    .map((res)=>res.json());
  }

}
