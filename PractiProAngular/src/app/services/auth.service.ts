import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private http:HttpClient) { }

  isLoggedIn=false;
  apiurl='http://localhost:3000/user';


  GetAll(){
    return this.http.get(this.apiurl);
  }
  Getbycode(code:any){
    return this.http.get(this.apiurl+'/'+code);
  }
  GetAllRoles(){
    return this.http.get('http://localhost:3000/role');
  }
  Proceedregister(inputdata:any){
    return this.http.post(this.apiurl, inputdata);
  }
  Updateuser(code: any, inputdata: any){
    return this.http.put(this.apiurl+'/'+code, inputdata);
  }

  IsLoggedIn() {
    return sessionStorage.getItem('email') != null;
  }
  GetUserRole(){
    return sessionStorage.getItem('userrole')!=null?sessionStorage.getItem('userrole')?.toString():'';
  }
}
