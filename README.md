# 🎪 EventHub

<div align="center">
  
  ![EventHub Logo](https://img.shields.io/badge/EventHub-Your%20Ultimate%20Event%20Management%20Platform-blue?style=for-the-badge&logo=react)
  
  [![Angular](https://img.shields.io/badge/Frontend-Angular-DD0031?style=flat-square&logo=angular)](https://angular.io/)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
  
</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🌟 Overview

**EventHub** is a comprehensive event management platform that streamlines the process of creating, finding, and registering for events. This full-stack application was developed as part of the Areeb Competition Internship 2025, showcasing a modern and intuitive solution for event organizers and attendees.

## ✨ Features

- **User Authentication & Authorization** - Secure login and registration with role-based access control
- **Event Discovery & Search** - Find events based on category, location, or date
- **Event Registration & Ticketing** - Seamless booking process with digital tickets
- **Payment Integration** - Secure payment processing
- **Admin Dashboard** - Comprehensive management system for event organizers
- **User Profiles** - Personalized user experience with event history and preferences
- **Responsive Design** - Optimal experience across all devices

## 📂 Project Structure

The project is organized into two main directories:

```
event-system/
│
├── event-booking-app/   # Angular frontend
│   ├── src/
│   │   ├── app/         # Angular components, services, etc.
│   │   ├── assets/      # Static assets and mock data
│   │   └── ...
│   └── ...
│
└── event-api/           # Node.js backend (to be created)
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   └── utils/
    ├── config/
    └── ...
```

## 🛠 Tech Stack

### Frontend

- **Framework**: Angular
- **State Management**: Angular Services & RxJS
- **Styling**: CSS/SCSS
- **HTTP Client**: Angular HttpClient

### Backend (Planned)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize/TypeORM
- **Authentication**: JWT
- **API Documentation**: Swagger

## 📥 Installation

### Prerequisites

- Node.js (v18.x or higher)
- npm (v9.x or higher)
- PostgreSQL (v14.x or higher)
- Angular CLI

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/event-system.git
cd event-system/event-booking-app

# Install dependencies
npm install

# Start development server
ng serve
```

Navigate to `http://localhost:4200/` to view the application.

### Backend Setup

```bash
# Navigate to backend directory
cd ../event-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your database credentials

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000/`.

## 🚀 Usage

1. **Registration/Login**: Create an account or sign in with existing credentials
2. **Browse Events**: Discover events based on interests, location, or date
3. **Event Details**: View comprehensive information about each event
4. **Booking**: Reserve tickets for desired events
5. **Payment**: Complete transaction using the integrated payment system
6. **Tickets**: Access digital tickets from your profile dashboard
7. **Admin Panel**: Manage events, users, and bookings (for admins)

## 📚 API Documentation

API documentation will be available at `http://localhost:3000/api-docs` when the backend is implemented, providing detailed information about all available endpoints, request methods, and response formats.

## 📸 Screenshots

_Coming soon_

## 🗺 Roadmap

- [ ] Mobile application development
- [ ] Advanced analytics for event organizers
- [ ] Social sharing integration
- [ ] Recommendation engine based on user preferences
- [ ] QR code ticket scanning
- [ ] Event check-in system
- [ ] Multilingual support

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For any inquiries regarding the project, please reach out via:

- **Email**: [your.email@example.com](mailto:your.email@example.com)
- **LinkedIn**: [Your Name](https://www.linkedin.com/in/yourname/)
- **Project Link**: [GitHub Repository](https://github.com/yourusername/event-system)

---

<div align="center">
  <sub>Built with ❤️ for the Areeb Competition Internship 2025</sub>
</div>
