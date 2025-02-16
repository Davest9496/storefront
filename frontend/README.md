# Storefront E-commerce Website

This project is a modern, responsive e-commerce platform built with Angular 17+. It implements a mobile-first design approach with progressive enhancement for tablet and desktop views.

## 🚀 Features

- **Responsive Design**
  - Mobile-first approach
  - Fluid transitions between mobile, tablet, and desktop layouts
  - Optimized images for different screen sizes using `<picture>` element

- **Modern Architecture**
  - Standalone components
  - Lazy-loaded modules
  - Server-side rendering support
  - State management for cart and user preferences

- **User Interface**
  - Clean, minimalist design
  - Responsive navigation with hamburger menu for mobile
  - Category-based product browsing
  - Detailed product pages with image galleries
  - Shopping cart with real-time updates

## 🛠️ Technical Stack

- **Framework**: Angular 17+
- **Styling**: SCSS with mobile-first approach
- **Testing**: Jasmine for unit tests
- **Build Tool**: Angular CLI 17.0.4
- **State Management**: Services with RxJS
- **Server-Side Rendering**: Angular Universal


## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Davest9496/storefront_frontend.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   ng serve
   ```

4. Open browser and navigate to `http://localhost:4200`


## 📱 Responsive Design

The application follows a mobile-first approach with breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1199px
- Desktop: ≥ 1200px

Images are optimized for each breakpoint using the `<picture>` element:

```html
<picture>
  <source media="(min-width: 1200px)" srcset="desktop-image.jpg">
  <source media="(min-width: 768px)" srcset="tablet-image.jpg">
  <img src="mobile-image.jpg" alt="Product">
</picture>
```

## 🚀 Deployment

Build for production:
```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Design inspiration from Frontend Mentor
- Angular team for the fantastic framework
- The open-source community for their invaluable tools and libraries