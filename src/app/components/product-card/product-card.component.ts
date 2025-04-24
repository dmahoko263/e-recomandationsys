import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule,RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product!: Product

  getImageUrl(path: string): string {
    // Handle relative URLs from the backend
    
    if (path && path.startsWith("/")) {
      return `${environment.apiUrl}${path}`
    }
    return path || "/assets/placeholder.jpeg"
  }

  getPrice(price: string | number): number {
    return typeof price === "string" ? Number.parseFloat(price) : price
  }

  addToCart(): void {
    console.log(`Added ${this.product.name} to cart`)
    // In a real app, this would call your cart service
  }
}

