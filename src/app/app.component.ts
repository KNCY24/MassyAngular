import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  username: any =localStorage.getItem("username");

  progressbarvalue : number[] = [0,0,0,0,0,0];
  timeleft : number[] = [0,0,0,0,0,0];
  lastupdate : number[]= [0,0,0,0,0,0];
  commutateur : number = 1; //1, 10, 100, 0(max)
  xcommut : string = "x1";
  qtmulti : number[] = [1,1,1,1,1,1];
  Productprice :  number[] = [0,0,0,0,0,0];

  profil: boolean=false;
  showUnlocks :boolean = false;
  showUpgrades :boolean = false;
    showcashU :boolean = true;
    showangelU :boolean = false;
  showManagers :boolean = false;
  showInvestors :boolean = false;

  badgeUnlocks:number=2;
  badgeUpgrades:number=0;
  badgeManagers:number=2;
  badgeInvestors:number=0;


  constructor(private service: RestserviceService, private snackBar: MatSnackBar) { 
    this.server = service.getServer(); 
    service.getWorld().then( 
      world => { this.world = world; }
    ); 
  }

  startFabrication(p : number){
    if(this.timeleft[p]<=0){
      this.timeleft[p] = this.world.products.product[p].timeleft;
      this.lastupdate[p] = Date.now();
    }    
  }

  buyProduct(p:number){
    if(this.Productprice[p] <= this.world.money){
      this.world.money = this.world.money - this.Productprice[p];
      this.world.products.product[p].cout = this.world.products.product[p].cout * this.world.products.product[p].croissance;
      this.world.products.product[p].quantite = this.world.products.product[p].quantite+this.qtmulti[p];
      this.calcMaxCanBuy();
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

  changeCommut(){
    switch(this.commutateur){
      case 1: {
        this.commutateur = 10;
        this.xcommut="x10";
        break;
      }
      case 10: {
        this.commutateur = 100;
        this.xcommut="x100";
        break;
      }
      case 100: {
        this.commutateur = 0;
        this.xcommut="Max";
        break;
      }
      case 0: {
        this.commutateur = 1;
        this.xcommut="x1";
        break;
      }
    }
    this.calcMaxCanBuy();
  }

  calcMaxCanBuy() {
    if(this.commutateur ==0){
      for(let i=0; i<6 ;i++) {
        let max=false;
        let n=0;
        this.qtmulti[i]=1;
        let multiplicateur = 0;
        let price = 0;
        while(max === false){
          multiplicateur = multiplicateur + (1 * Math.pow(this.world.products.product[i].croissance,n));
          
          price = this.world.products.product[i].cout*multiplicateur;
          if(price <= this.world.money) {
            this.qtmulti[i] = n+1;
            this.Productprice[i]=price;
          }else{
            max=true;
          }
          n=n+1;
        }
        multiplicateur=0;
      }
    } else {
      for(let i=0;i<6;i++){
        let multiplicateur = 0;
        this.qtmulti[i] = this.commutateur;
        
        for(let n=0;n<this.commutateur;n++){
          multiplicateur = multiplicateur + (1 * Math.pow(this.world.products.product[i].croissance,n));
        }
        this.Productprice[i] =  this.world.products.product[i].cout*multiplicateur;
      }
    }
  }

  buyUpgrade(upgrade : any,type : string) {
    if(type == "cash"){
      if(this.world.money>=upgrade.seuil){
        this.world.money = this.world.money-upgrade.seuil;
        upgrade.unlocked = true;
        switch(upgrade.typeratio){
          case "vitesse":{
            if(upgrade.idcible ==0){
              for(let i=0;i<6;i++) this.world.products.product[i].vitesse = this.world.products.product[i].vitesse/upgrade.ratio; 
            } else {
              this.world.products.product[upgrade.idcible-1].vitesse = this.world.products.product[upgrade.idcible-1].vitesse/upgrade.ratio; 
            }
            break;
          }
          case "gain": {
            if(upgrade.idcible ==0){
              for(let i=0;i<6;i++) this.world.products.product[i].revenu = this.world.products.product[i].revenu*upgrade.ratio;
            } else {
              this.world.products.product[upgrade.idcible-1].revenu = this.world.products.product[upgrade.idcible-1].revenu*upgrade.ratio;
            }
            break;
          }
          case "ange": {
            this.world.angelbonus = this.world.angelbonus + upgrade.ratio;
            break;
          }
        }
      }
      this.snackBar.open("Génial ! Vous venez d'acheter un Cash Upgrade", "", {duration:6000});
    } else{
      if(this.world.activeangels>=upgrade.seuil){
        this.world.activeangels = this.world.activeangels-upgrade.seuil;
        upgrade.unlocked = true;
        switch(upgrade.typeratio){
          case "vitesse":{
            if(upgrade.idcible ==0){
              for(let i=0;i<6;i++) this.world.products.product[i].vitesse = this.world.products.product[i].vitesse/upgrade.ratio; 
            } else {
              this.world.products.product[upgrade.idcible-1].vitesse = this.world.products.product[upgrade.idcible-1].vitesse/upgrade.ratio; 
            }
            break;
          }
          case "gain": {
            if(upgrade.idcible ==0){
              for(let i=0;i<6;i++) this.world.products.product[i].revenu = this.world.products.product[i].revenu*upgrade.ratio;
            } else {
              this.world.products.product[upgrade.idcible-1].revenu = this.world.products.product[upgrade.idcible-1].revenu*upgrade.ratio;
            }
            break;
          }
          case "ange": {
            this.world.angelbonus = this.world.angelbonus + upgrade.ratio;
            break;
          }
        }
      }
      this.snackBar.open("Génial ! Vous venez d'acheter un Angel Upgrade", "", {duration:6000});
    }
  }

  buyManager(manager :any){
    if(this.world.money>=manager.seuil){
      this.world.money = this.world.money - manager.seuil;
      manager.unlocked = true;
      this.world.products.product[manager.idcible-1].managerUnlocked = true;
      setInterval(() => { this.startFabrication(manager.idcible-1); },100);
      this.snackBar.open("Félicitations ! Vous venez d'embaucher un manager pour "+this.world.products.product[manager.idcible-1].name, "", {duration:6000})
    }
  }

  changeUsername(){
    localStorage.setItem("username",this.username);
  }
}
