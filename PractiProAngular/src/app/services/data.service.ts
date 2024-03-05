import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  private apiURL = "https://pokeapi.co/api/v2/";

  sendRequest(endpoint: string){
    const result = this.http.get(this.apiURL + endpoint);
    return result;
  }

}
