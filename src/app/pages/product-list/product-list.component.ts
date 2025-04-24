import { CommonModule } from "@angular/common"
import { Component, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"

import { Product } from "../../models/product"
import { Category } from "../../models/category"
import { ProductService } from "../../services/product.service"
import { CartService } from "../../services/cart.service"
import { AuthService } from "../../services/auth.service"
import { RouterLink } from "@angular/router"
import { ProductCardComponent } from "../../components/product-card/product-card.component"



@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, FormsModule,ProductCardComponent],
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.css"],
})
export class ProductListComponent implements OnInit {
  products: Product[] = []
  filteredProducts: Product[] = []
  loading = true
  totalCount = 0

  // Filters
  searchQuery = ""
  selectedCategories: string[] = []
  priceRange = { min: 0, max: 1000 }
  selectedRating: number | null = null
  sortOption = "featured"

  // Pagination
  currentPage = 1
  itemsPerPage = 9
  totalPages = 1

  // Categories
  categories = [
    { id: 1, slug:"electronics",name: "Electronics" },
    { id: 2, slug:"clothing",name: "Clothing" },
    { id: 3, slug:"home-kitchen",name: "Home & Kitchen" },
    { id: 4, slug:"beauty-personal-care",name: "Beauty & Personal Care" },
    { id: 5, slug:"sports-outdoors",name: "Sports & Outdoors" },
  ]

  constructor(
    private productService: ProductService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.loadProducts()
  }

  loadProducts(): void {
    this.loading = true

    // Create params object for API request
    const params: any = {
      page: this.currentPage,
      page_size: this.itemsPerPage,
    }

    // Add filters to params if they exist
    if (this.searchQuery) {
      params.search = this.searchQuery
    }

    if (this.selectedCategories.length > 0) {
      params.category = this.selectedCategories.join(",")
    }

    if (this.priceRange.min > 0) {
      params.min_price = this.priceRange.min
    }

    if (this.priceRange.max < 1000) {
      params.max_price = this.priceRange.max
    }

    if (this.selectedRating) {
      params.min_rating = this.selectedRating
    }

    // Add sorting
    if (this.sortOption) {
      switch (this.sortOption) {
        case "price-low":
          params.ordering = "price"
          break
        case "price-high":
          params.ordering = "-price"
          break
        case "rating":
          params.ordering = "-rating"
          break
        case "newest":
          params.ordering = "-created_at"
          break
        case "featured":
          params.featured = true
          break
      }
    }

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.results
        this.filteredProducts = response.results
        this.totalCount = response.count
        this.totalPages = Math.ceil(response.count / this.itemsPerPage)
        this.loading = false
      },
      error: (error) => {
        console.error("Error fetching products:", error)
        this.loading = false
      },
    })
  }

  onSearch(): void {
    this.currentPage = 1
    this.loadProducts()
  }

  onCategoryChange(categorySlug: string, event: any): void {
    const checked = event.target.checked

    if (checked) {
      this.selectedCategories.push(categorySlug)
    } else {
      this.selectedCategories = this.selectedCategories.filter((slug) => slug !== categorySlug)
    }

    this.currentPage = 1
    this.loadProducts()
  }

  onPriceChange(): void {
    this.currentPage = 1
    this.loadProducts()
  }

  onRatingChange(): void {
    this.currentPage = 1
    this.loadProducts()
  }

  onSortChange(): void {
    this.loadProducts()
  }

  clearFilters(): void {
    this.searchQuery = ""
    this.selectedCategories = []
    this.priceRange = { min: 0, max: 1000 }
    this.selectedRating = null
    this.sortOption = "featured"
    this.currentPage = 1
    this.loadProducts()
  }

  goToPage(page: string | number): void {
    if (typeof page === "number" && page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.loadProducts()
      // Scroll to top of products
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = []

    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (this.currentPage > 3) {
        pages.push("...")
      }

      const start = Math.max(2, this.currentPage - 1)
      const end = Math.min(this.totalPages - 1, this.currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push("...")
      }

      pages.push(this.totalPages)
    }

    return pages
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        console.log(`Added ${product.name} to cart`)
      },
      error: (error) => {
        console.error("Error adding to cart:", error)
      },
    })
  }
}

