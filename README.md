# TravelBuddy - Experience-based Travel Sharing Platform

A full-stack MERN application that allows users to share real-life travel experiences, including detailed cost breakdowns, images, and travel tips. It's a community-driven platform where travelers help each other by sharing insights from their journeys.

## images

![Travelbuddypng](https://github.com/user-attachments/assets/a52e31cc-66e6-4180-82b8-9770505c391d)

##  Features

### Core Features
- **User Authentication**: JWT-based authentication with secure password hashing
- **Trip Sharing**: Upload detailed travel experiences with costs, tips, and photos
- **Community Interaction**: Comment system with nested replies and Q&A functionality
- **Wishlist System**: Save favorite trips for future reference
- **Search & Filter**: Find trips by location, cost range, and other criteria
- **Responsive Design**: Mobile-first design that works on all devices

### User Experience
- **Guest Browsing**: Users can explore trips without creating an account
- **Protected Features**: Login required for sharing trips, commenting, and wishlist
- **Real-time Feedback**: Toast notifications for user actions
- **Smooth Animations**: Framer Motion for beautiful transitions
- **Modern UI**: Clean, intuitive interface with Tailwind CSS

##  Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Framer Motion** for smooth animations
- **React Router** for client-side routing
- **Axios** for API communication
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Cloudinary** ready for image uploads
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection




##  Getting Started

### Prerequisites
- Node.js 
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd TravelBuddy
   \`\`\`

2. **Backend Setup**
   \`\`\`bash
   cd backend
   npm install
   cp .env.example .env
   \`\`\`

   Edit `.env` file with your configuration:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/travelbuddy
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   FRONTEND_URL=http://localhost:5173
   PORT=5000
   NODE_ENV=development
   \`\`\`

3. **Frontend Setup**
   \`\`\`bash
   cd ../frontend
   npm install
   cp .env.example .env
   \`\`\`

   Edit `.env` file:
   \`\`\`env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=TravelBuddy
   VITE_APP_URL=http://localhost:5173
   \`\`\`

4. **Start the Development Servers**

   Backend (Terminal 1):
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

   Frontend (Terminal 2):
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Trip Endpoints
- `GET /api/trips` - Get all trips (with filtering)
- `GET /api/trips/:id` - Get single trip
- `POST /api/trips` - Create new trip (protected)
- `PUT /api/trips/:id` - Update trip (protected, owner only)
- `DELETE /api/trips/:id` - Delete trip (protected, owner only)
- `POST /api/trips/:id/like` - Like/unlike trip (protected)

### Comment Endpoints
- `GET /api/comments/trip/:tripId` - Get trip comments
- `POST /api/comments` - Create comment (protected)
- `PUT /api/comments/:id` - Update comment (protected, owner only)
- `DELETE /api/comments/:id` - Delete comment (protected, owner only)
- `POST /api/comments/:id/like` - Like/unlike comment (protected)

### Wishlist Endpoints
- `GET /api/wishlist` - Get user wishlist (protected)
- `POST /api/wishlist/:tripId` - Add to wishlist (protected)
- `DELETE /api/wishlist/:tripId` - Remove from wishlist (protected)
- `GET /api/wishlist/check/:tripId` - Check wishlist status (protected)

##  Design Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts and responsive typography

### Color Scheme
- Primary: Blue tones (#3b82f6, #2563eb)
- Secondary: Green tones (#22c55e, #16a34a)
- Neutral: Gray scale for text and backgrounds
- Accent: Red for likes, Orange for warnings

### Animations
- Page transitions with Framer Motion
- Hover effects on interactive elements
- Loading states and micro-interactions
- Smooth scrolling and reveal animations

##  Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Prevent spam and abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet**: Security headers for Express
- **Environment Variables**: Sensitive data protection

##  Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Connect repository to Railway or Render
2. Set environment variables
3. Configure MongoDB Atlas connection
4. Deploy with automatic builds

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Configure network access and database user
3. Update MONGODB_URI in environment variables

##  Future Enhancements

### Planned Features
- **Image Upload**: Cloudinary integration for trip photos
- **Real-time Comments**: Socket.io for live discussions
- **Google Maps**: Location tagging and visualization
- **Email Notifications**: Welcome emails and trip updates
- **Trip Ratings**: 5-star rating system
- **Advanced Search**: Filters by activities, budget ranges
- **Social Features**: Follow users, trip recommendations
- **Mobile App**: React Native version

### Technical Improvements
- **Caching**: Redis for improved performance
- **Search**: Elasticsearch for advanced search
- **CDN**: Image optimization and delivery
- **Analytics**: User behavior tracking
- **Testing**: Unit and integration tests
- **CI/CD**: Automated testing and deployment

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


##  Acknowledgments

- **Design Inspiration**: Modern travel platforms and community sites
- **Icons**: Lucide React icon library
- **Fonts**: Inter font family from Google Fonts
- **Images**: Placeholder images for development

##  Support

For support, email support@travelbuddy.com or create an issue in the repository.

---

**Built with  for travelers, by travelers**
\`\`\`

The project is now complete with all missing files created and properly organized! The structure includes:

1. **Fixed Import Issues**: All page components are now created
2. **Organized Utils**: API functions are properly organized in `frontend/src/utils/api.js`
3. **Complete Frontend**: All pages, components, and utilities
4. **Beginner-Friendly**: Extensive comments explaining each part
5. **Modern Structure**: Clean separation of concerns
6. **Responsive Design**: Mobile-first approach with Tailwind CSS
7. **Authentication Flow**: Complete login/register system
8. **Trip Management**: Full CRUD operations for trips
9. **Community Features**: Comments, likes, wishlist functionality


