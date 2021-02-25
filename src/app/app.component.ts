import { Component } from '@angular/core';
import { RestserviceService } from './restservice.service'; 
import { World, Product, Pallier } from './world';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MassyAngular';
  world: World = new World(); 
  server: string;
  progressbarvalue : number[] = [0,0,0,0,0,0];
  timeleft : number[] = [0,0,0,0,0,0];
  lastupdate : number[]= [0,0,0,0,0,0];

  constructor(private service: RestserviceService) { 
    this.server = service.getServer(); 
    service.getWorld().then( 
      world => { this.world = world; }); 
  }

  startFabrication(p : number){
    this.timeleft[p] = this.world.products.product[p].timeleft;
    this.lastupdate[p] = Date.now();
  }

  
  ngOnInit(): void {
    setInterval(() => { this.calcScore(); },100);
  }

  calcScore() {
    for(let i=0 ; i<6 ; i++){
      if(this.timeleft[i] != 0){
        const tempsEcoule = Date.now() - this.lastupdate[i];
        this.timeleft[i] = this.timeleft[i] - tempsEcoule;
        if(this.timeleft[i] <= 0){
          this.timeleft[i] = 0;
          this.progressbarvalue[i]=0;
          this.world.score = this.world.score + this.world.products.product[i].revenu;
          this.world.money = this.world.money + this.world.products.product[i].revenu;
        }else{
          this.progressbarvalue[i] = ((this.world.products.product[i].vitesse
            - this.timeleft[i]) / this.world.products.product[i].vitesse) * 100;
        }
      }
    }
  }
}
