import { Component, Input } from '@angular/core';
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
  commutateur : number = 1; //1, 10, 100, 0(max)
  multi : number[]=[1,10,100];
  qtmulti : number[] = [1,1,1,1,1,1];

  constructor(private service: RestserviceService) { 
    this.server = service.getServer(); 
    service.getWorld().then( 
      world => { this.world = world; }
    ); 
  }

  startFabrication(p : number){
    if(this.world.products.product[p].cout <= this.world.money && this.timeleft[p]<=0){
      let multiplicateur = 0;
      let price = 0;
      for(let n=0;n<this.qtmulti[p];n++){
        multiplicateur = multiplicateur + (1 * Math.pow(this.world.products.product[p].croissance,n));
      } 
      price = this.world.products.product[p].cout*multiplicateur;
      
      if(price <= this.world.money){
        this.world.money = this.world.money - price;
      
        this.timeleft[p] = this.world.products.product[p].timeleft;
        this.lastupdate[p] = Date.now();
        this.world.products.product[p].cout = this.world.products.product[p].cout * this.world.products.product[p].croissance;
      }
    }    
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
          this.world.products.product[i].quantite = this.world.products.product[i].quantite+this.qtmulti[i];
          this.world.score = this.world.score + this.world.products.product[i].revenu;
          this.world.money = this.world.money + this.world.products.product[i].revenu;
          this.calcMaxCanBuy();
        }else{
          this.progressbarvalue[i] = ((this.world.products.product[i].vitesse
            - this.timeleft[i]) / this.world.products.product[i].vitesse) * 100;
        }
      }
    }
  }

  calcMaxCanBuy() {
    for(let i=0; i<6 ;i++) {
      this.qtmulti[i]=1;
      let multiplicateur = 0;
      let price = 0;
      for(let j=0;j<3;j++){
        for(let n=0;n<this.multi[j];n++){
          multiplicateur = multiplicateur + (1 * Math.pow(this.world.products.product[i].croissance,n));
        } 
        price = this.world.products.product[i].cout*multiplicateur;
        if(price <= this.world.money) {
          this.qtmulti[i] = this.multi[j];
        }
        multiplicateur=0;
      }
    }
  }
}
