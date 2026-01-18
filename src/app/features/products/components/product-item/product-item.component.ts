import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models/product.model';
import { DEFAULT_PRODUCT_IMAGE } from '../../../../core/constants/api.constants';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.css',
})
export class ProductItemComponent {
  @Input({ required: true }) product!: Product;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  readonly defaultImage = DEFAULT_PRODUCT_IMAGE;
  showMenu = false;

  /**
   * Obtiene la URL de la imagen del producto, usando la imagen por defecto si no hay logo
   */
  getProductImage(): string {
    return this.product.logo?.trim() || this.defaultImage;
  }

  /**
   * Maneja el error al cargar la imagen, cambiando a la imagen por defecto
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.defaultImage) {
      img.src = this.defaultImage;
    }
  }

  onEdit(): void {
    this.edit.emit(this.product.id);
    this.showMenu = false;
  }

  onDelete(): void {
    this.delete.emit(this.product.id);
    this.showMenu = false;
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  closeMenu(): void {
    this.showMenu = false;
  }

  /**
   * Obtiene las iniciales del nombre del producto para el avatar
   */
  getInitials(): string {
    if (!this.product.name) return '?';
    const words = this.product.name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return this.product.name.substring(0, 2).toUpperCase();
  }
}
