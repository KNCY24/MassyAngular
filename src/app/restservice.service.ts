import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { World, Pallier, Product } from './world';


@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  server :string= "http://localhost:8080/"
  user :string = "";

  constructor(private http: HttpClient) { }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
   }

  private setHeaders(user: string): HttpHeaders {
    var headers = new HttpHeaders({'X-user':user});
    return headers;
  }
   getWorld(): Promise<World> {
    return this.http.get(this.server + "adventureisis/generic/world",{
      headers: this.setHeaders(this.user)
    })
    .toPromise().catch(this.handleError);
   };

   getServer():string{
     return this.server;
   }

  getUser() : string{
    return this.user;
  }

  setUser(username : string) : void {
    this.user = username;
  }

  setServer(servername : string) : void {
    this.server=servername;
  }

}


