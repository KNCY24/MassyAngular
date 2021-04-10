import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(temps: number, args?: any): string {

    let res : string =""; 
    let nbdix : number = 0 ;
    let nbsec : number = 0;
    let nbmin : number = 0;
    let nbheure : number = 0;

    if (temps > 100)
      nbdix= Math.floor(temps/100);
      console.log(nbdix);
      if(nbdix >= 10){
        nbdix=nbdix%10;
        console.log("if"+nbdix);
        nbsec= Math.floor(temps/1000);
        nbmin=Math.floor(nbsec/60);
        nbheure=Math.floor(nbsec/3660);
        nbmin=nbmin%60;
        nbsec=nbsec%60}
      else{
        nbdix=nbdix;
        console.log("else"+ nbdix);
        nbsec= Math.floor(temps/1000);
        nbmin=Math.floor(nbsec/60);
        nbheure=Math.floor(nbsec/3660);
        nbmin=nbmin%60;
        nbsec=nbsec%60
      }
      
      
      res = String(nbheure).padStart(2, '0') + ":" +String(nbmin).padStart(2, '0') + ":"+ String(nbsec).padStart(2, '0') + ":"+ String(nbdix).padStart(2, '0') ; 
     
    return res ; 
  }

}
