import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../world';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  product!: Product;
  
  constructor() { }

  ngOnInit(): void {
  }

  @Input()
  set prod(value: Product) {
    this.product = value;
  }

  getprod(){
    return this.product;
  }

  getimage(){
    return "http://localhost:8080/"+this.product.logo;
  }

}
