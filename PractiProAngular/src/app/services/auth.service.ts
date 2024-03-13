import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private http:HttpClient) { }

  isLoggedIn=false;
  apiurl='http://localhost/PractiPro/backend/api/user';


  getAllUsers() {
    return this.http.get('http://localhost/PractiPro/backend/api/user');
  }
  
  GetAll(){
    return this.http.get<any[]>(this.apiurl);
  }
  Getbycode(code:any){
    return this.http.get(this.apiurl+'/'+code);
  }
  GetAllRoles(){
    return this.http.get('http://localhost/PractiPro/backend/api/role');
  }
  Proceedregister(inputdata:any){
    return this.http.post('http://localhost/PractiPro/backend/api/adduser', inputdata);
  }
  Updateuser(inputdata: any, code: any){
    return this.http.post('http://localhost/PractiPro/backend/api/edituser'+'/'+inputdata, code, );
  }

  IsLoggedIn() {
    return sessionStorage.getItem('email') != null;
  }
  GetUserRole(){
    return sessionStorage.getItem('userrole')!=null?sessionStorage.getItem('userrole')?.toString():'';
  }

  uploadFile(user_id: number, file: File) {
    const formData = new FormData();
    formData.append('user_id', user_id.toString());
    formData.append('file', file);

    return this.http.post('http://localhost/PractiPro/backend/api/uploadfile', formData);
  }
}
