# POI Sharing Application

A modern social media application for sharing Points of Interest (POI) with photo capture capabilities. Built with Node.js 22, React 19, and PostgreSQL.

## 🚀 Features

- **Photo Capture**: Built-in camera functionality for capturing POI photos
- **Social Timeline**: View and interact with posts from other users
- **User Authentication**: Secure JWT-based authentication system
- **Real-time Engagement**: Like and share functionality with automatic counters
- **Responsive Design**: Mobile-first design with modern UI components
- **Image Storage**: Efficient binary storage of images in PostgreSQL
- **Security**: Rate limiting, CORS protection, and input validation

## 🏗️ Architecture

### Backend (Node.js 22)
- **Framework**: Express.js with security middleware
- **Database**: PostgreSQL 15 with UUID primary keys
- **Authentication**: JWT tokens with refresh token support
- **Image Processing**: Sharp for image optimization
- **Security**: Helmet, CORS, rate limiting, input validation with Joi
- **Logging**: Winston for structured logging

### Frontend (React 19)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 with Radix UI components
- **Routing**: React Router DOM
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React

## 📁 Project Structure

```
poi_application/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── app.js          # Main application entry point
│   │   ├── config/         # Database and AWS configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Authentication and error handling
│   │   ├── routes/         # API route definitions
│   │   ├── scripts/        # Database DDL and seed scripts
│   │   └── utils/          # Logging and validation utilities
│   ├── docker-compose.yml  # Local development environment
│   ├── railway.json        # Railway deployment configuration
│   └── nixpacks.toml       # Railway build configuration
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── authmodal/  # Authentication modal
│   │   │   ├── layout/     # Header and navigation
│   │   │   ├── posts/      # Post-related components
│   │   │   ├── timeline/   # Timeline feed component
│   │   │   └── ui/         # Base UI components (Radix)
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API service layer
│   │   └── lib/            # Utility functions and API client
│   └── dist/               # Built application
└── README.md
```

## 🗄️ Database Schema

### Core Tables
- **users**: User authentication and profile data
- **posts**: POI posts with image data stored as BYTEA
- **likes**: User likes tracking with automatic counters
- **shares**: User shares tracking with automatic counters
- **refresh_tokens**: JWT refresh token management

### Key Features
- UUID primary keys for all tables
- Automatic timestamp updates with triggers
- Automatic like/share counter updates
- Performance indexes on frequently queried columns
- Database views for optimized queries

## 🛠️ Prerequisites

- **Node.js 22.x**
- **PostgreSQL 15+**
- **Docker & Docker Compose** (for local development)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd poi_application
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Database Setup
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Initialize database schema and seed data
npm run db:init
```

### 4. Environment Configuration
Create a `.env` file in the backend directory:
```env
PORT=3000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/poi_sharing_app
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
```

### 5. Start Backend Server
```bash
npm run dev
```

### 6. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432
- **pgAdmin**: http://localhost:8080 (admin@poi.com / admin123)

## 📱 Usage

1. **Authentication**: The app will prompt for authentication on first load
2. **Create Posts**: Use the camera feature to capture POI photos
3. **Timeline**: Browse posts from other users
4. **Engagement**: Like and share posts to interact with the community

## 🔧 Development Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run db:setup   # Initialize database schema
npm run db:seed    # Seed database with sample data
npm run db:init    # Setup and seed database
npm run db:reset   # Reset database (destructive)
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## 🚀 Deployment

### Railway Deployment
The backend is configured for Railway deployment with:
- **Health Check**: `/health` endpoint
- **Auto-restart**: On failure policy
- **Database Migration**: Automatic schema setup
- **PostgreSQL Client**: Included in build process

### Environment Variables for Production
Ensure these environment variables are set in your deployment platform:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **SQL Injection Prevention**: Parameterized queries

## 🎨 UI/UX Features

- **Mobile-First Design**: Responsive layout optimized for mobile devices
- **Modern Components**: Radix UI components with Tailwind CSS
- **Camera Integration**: Native camera access for photo capture
- **Real-time Updates**: Automatic counter updates for likes and shares
- **Accessibility**: ARIA-compliant components

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (multipart/form-data)
- `POST /api/posts/:id/like` - Like a post
- `POST /api/posts/:id/share` - Share a post
- `GET /api/posts/:id/image` - Get post image

### Health
- `GET /health` - Health check endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api/docs` (when available)

---

**Built with ❤️ using Node.js 22, React 19, and PostgreSQL**
