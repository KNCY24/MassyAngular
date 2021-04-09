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
  username: any = "";
  usertype : string[] = ["Decontesse", "MissDonut","4fromages","Pernaut","Ok","Spielberg"];

  progressbarvalue : number[] = [0,0,0,0,0,0];
  timeleft : number[] = [0,0,0,0,0,0];
  lastupdate : number[]= [0,0,0,0,0,0];
  commutateur : number = 1; //1, 10, 100, 0(max)
  xcommut : string = "x1";
  qtmulti : number[] = [1,1,1,1,1,1];
  Productprice :  number[] = [0,0,0,0,0,0];
  totalClaimed : number = 0;

  welcome: boolean=true;
  sound:boolean=true;
  profil: boolean=false;
  showUnlocks :boolean = false;
    showpU :boolean = true;
    showgU :boolean = false;
    showrU :boolean = false;
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
    if(!localStorage.getItem("username")){
      this.username=this.usertype[Math.floor(Math.random()*6)]+" "+Math.floor(Math.random()*10000);
      localStorage.setItem("username",this.username);
    } else {
      this.username = localStorage.getItem("username");
    } 
    this.service.setUser(this.username);
    service.getWorld().then( 
      world => { this.world = world; }
    ); 
  }

  startFabrication(p : number){
    if(this.timeleft[p]<=0){
      this.timeleft[p] = this.world.products.product[p].vitesse;
      this.service.putProduct(this.world.products.product[p]);
      this.lastupdate[p] = Date.now();
    }    
  }

  buyProduct(p:number){

    if(this.Productprice[p] <= this.world.money){
      this.world.money = this.world.money - this.Productprice[p];
      for(let q =0;q<this.qtmulti[p];q++) this.world.products.product[p].cout = this.world.products.product[p].cout * this.world.products.product[p].croissance;
      this.world.products.product[p].quantite = this.world.products.product[p].quantite+this.qtmulti[p];
      this.service.putProduct(this.world.products.product[p]);
      
      this.verifUnlocks();
      this.calcMaxCanBuy();
    }
  }

  
  ngOnInit(): void {
    setInterval(() => { this.calcScore(); },100);
    //localStorage.clear();
  }

  init() {
    let player=<HTMLVideoElement> document.getElementById('audioPlayer');
    player.play();
    this.totalClaimed = 150* Math.sqrt(this.world.score/Math.pow(10,15)) - this.world.totalangels;
    if (this.totalClaimed<0) this.totalClaimed =0;
    for(let p in this.world.products.product){
      this.Productprice[p] = this.world.products.product[p].cout;
      if(this.world.products.product[p].timeleft != 0){
        this.progressbarvalue[p] = ((this.world.products.product[p].vitesse
          - this.world.products.product[p].timeleft) / this.world.products.product[p].vitesse) * 100;

        this.lastupdate[p] = parseInt(this.world.lastupdate);
        this.timeleft[p] = this.world.products.product[p].timeleft;
      }
    }
    for(let m in this.world.managers.pallier){
      if(this.world.managers.pallier[m].unlocked == true){
        this.loopManager(this.world.managers.pallier[m])
      }
    }
  }

  mutedSound() {
    let player=<HTMLVideoElement> document.getElementById('audioPlayer');
    player.muted=this.sound;
    if(this.sound==true){
      this.sound=false; 
      document.getElementById('sound')?.setAttribute("src","assets/mute.png");
    } else{
      this.sound=true; 
      document.getElementById('sound')?.setAttribute("src","assets/volume.png");
    }
  }

  calcScore() {
    for(let i in this.world.products.product){
      if(this.timeleft[i] != 0){
        const tempsEcoule = Date.now() - this.lastupdate[i];
        this.lastupdate[i] = Date.now();
        this.timeleft[i] = this.timeleft[i] - tempsEcoule;
        if(this.timeleft[i] <= 0){
          this.timeleft[i] = 0;
          this.progressbarvalue[i]=0;
          this.world.score = this.world.score + (this.world.products.product[i].revenu * (1+(this.world.activeangels*this.world.angelbonus/100) ));
          this.world.money = this.world.money + (this.world.products.product[i].revenu * (1+(this.world.activeangels*this.world.angelbonus/100) ));
          this.totalClaimed = 150* Math.sqrt(this.world.score/Math.pow(10,5)) - this.world.totalangels;
          if (this.totalClaimed<0) this.totalClaimed =0;
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
      for(let i in this.world.products.product) {
        let max=false;
        let n=0;
        this.qtmulti[i]=1;
        let multiplicateur = 0;
        let price = 0;
        while(max === false){
          multiplicateur = multiplicateur + (Math.pow(this.world.products.product[i].croissance,n));
          
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
      for(let i in this.world.products.product){
        let multiplicateur = 0;
        this.qtmulti[i] = this.commutateur;
        
        for(let n=0;n<this.commutateur;n++){
          multiplicateur = multiplicateur + (1 * Math.pow(this.world.products.product[i].croissance,n));
        }
        this.Productprice[i] =  this.world.products.product[i].cout*multiplicateur;
      }
    }
  }

  verifUnlocks(){
    var test =0;
    for(let i in this.world.products.product) {
      for(let p in this.world.products.product[i].palliers.pallier){
        if(this.world.products.product[i].quantite >= this.world.products.product[i].palliers.pallier[p].seuil && this.world.products.product[i].palliers.pallier[p].unlocked===false){
          this.world.products.product[i].palliers.pallier[p].unlocked=true;
          this.snackBar.open("Wouaaah ! Vous venez de débloquer un nouveau bonus "+ this.world.products.product[i].palliers.pallier[p].typeratio +" pour le produit "+this.world.products.product[i].name, "", {duration:6000})
          this.unlocks(this.world.products.product[i],this.world.products.product[i].palliers.pallier[p]);
        }
      }
    }
    for(let i in this.world.allunlocks.pallier){
      if(this.world.allunlocks.pallier[i].unlocked===false){
        for(let p in this.world.products.product){
          if(this.world.allunlocks.pallier[i].seuil <= this.world.products.product[p].quantite ){
            test = test+1;
          }
        }
        if(test == this.world.products.product.length){
          this.world.allunlocks.pallier[i].unlocked=true;
          this.snackBar.open("Wouaaah ! Vous venez de débloquer un bonus général "+this.world.allunlocks.pallier[i].typeratio, "", {duration:6000})
          this.unlocks(null,this.world.allunlocks.pallier[i]);
        }
      }
    } 
  }

  unlocks(produit:any,pallier:any){
    if(produit==null){
      switch(pallier.typeratio){
        case "vitesse":{
          for(let p in this.world.products.product) this.world.products.product[p].vitesse = this.world.products.product[p].vitesse/pallier.ratio; 
          break;
        }
        case "gain": {
          for(let p in this.world.products.product) this.world.products.product[p].revenu = this.world.products.product[p].revenu*pallier.ratio;
          break;
        }
      }
    }else {
      switch(pallier.typeratio){
        case "vitesse":{
          produit.vitesse = produit.vitesse/pallier.ratio; 
          break;
        }
        case "gain": {
          produit.revenu = produit.revenu*pallier.ratio;
          break;
        }
      }
    }
    if(pallier.typeratio == "ange"){
      this.world.angelbonus = this.world.angelbonus + pallier.ratio;
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
              for(let i in this.world.products.product) this.world.products.product[i].vitesse = this.world.products.product[i].vitesse/upgrade.ratio; 
            } else {
              this.world.products.product[upgrade.idcible-1].vitesse = this.world.products.product[upgrade.idcible-1].vitesse/upgrade.ratio; 
            }
            break;
          }
          case "gain": {
            if(upgrade.idcible ==0){
              for(let i in this.world.products.product) this.world.products.product[i].revenu = this.world.products.product[i].revenu*upgrade.ratio;
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
        this.service.putUpgrade(upgrade)
        this.snackBar.open("Génial ! Vous venez d'acheter un Cash Upgrade", "", {duration:6000});
      }
    } else{
      if(this.world.activeangels>=upgrade.seuil){
        this.world.activeangels = this.world.activeangels-upgrade.seuil;
        upgrade.unlocked = true;
        switch(upgrade.typeratio){
          case "vitesse":{
            if(upgrade.idcible ==0){
              for(let i in this.world.products.product) this.world.products.product[i].vitesse = this.world.products.product[i].vitesse/upgrade.ratio; 
            } else {
              this.world.products.product[upgrade.idcible-1].vitesse = this.world.products.product[upgrade.idcible-1].vitesse/upgrade.ratio; 
            }
            break;
          }
          case "gain": {
            if(upgrade.idcible ==0){
              for(let i in this.world.products.product) this.world.products.product[i].revenu = this.world.products.product[i].revenu*upgrade.ratio;
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
        this.service.putUpgrade(upgrade)
        this.snackBar.open("Génial ! Vous venez d'acheter un Angel Upgrade", "", {duration:6000});
      }
    }
  }
  

  buyManager(manager :any){
    if(this.world.money>=manager.seuil){
      this.service.putManager(manager);
      this.world.money = this.world.money - manager.seuil;
      manager.unlocked = true;
      this.world.products.product[manager.idcible-1].managerUnlocked = true;
      this.snackBar.open("Félicitations ! Vous venez d'embaucher un manager pour "+this.world.products.product[manager.idcible-1].name, "", {duration:6000})
      this.loopManager(manager)
    }
  }

  loopManager(manager:any){
    setInterval(() => { 
      if(this.timeleft[manager.idcible-1]<=0){
        this.timeleft[manager.idcible-1] = this.world.products.product[manager.idcible-1].vitesse;
        this.lastupdate[manager.idcible-1] = Date.now();
      }  
    },100);
  }

  changeUsername(){
    if(this.username!=""){
      localStorage.setItem("username",this.username);
      this.service.setUser(this.username); 
    }else {
      this.username = localStorage.getItem("username");
    }
  }

  deleteWorld(){
    if(this.totalClaimed >0){
      this.service.delete().then( 
        world => { this.world = world; }
      ); 
    }
  }

}
