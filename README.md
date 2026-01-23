# Butt Nha Tro - Room Rental Management System

A comprehensive room-rental management web application for Can Tho, Vietnam, featuring role-based access control, advanced search/filtering, and booking management.

## 🚀 Features

### For Users
- **Browse Rooms**: View available rooms with images, prices, and detailed information
- **Advanced Search**: Filter by location, price range, number of people, and amenities
- **Room Details**: View comprehensive room information with image gallery
- **Easy Booking**: Book rooms without login (auto-fill for logged-in users)
- **Booking History**: Track your bookings (for registered users)

### For Admins
- **Room Management**: Full CRUD operations for rooms
- **Image Upload**: Upload multiple images via Cloudinary
- **Archive/Unarchive**: Manage room availability
- **Booking Management**: View and update booking statuses
- **Advanced Filtering**: Filter bookings by status, date, and search terms

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Morgan** - Logging
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Context API** - State management

## 📁 Project Structure

```
butt-nha-tro/
├── server/                 # Backend
│   ├── config/            # Database & Cloudinary config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth & error handling
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── scripts/           # Seed data script
│   ├── .env.example       # Environment variables template
│   └── server.js          # Entry point
│
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   ├── utils/         # Helper functions
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── .env.example       # Environment variables template
│   └── index.html         # HTML template
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (optional, for image uploads)

### Installation

1. **Clone the repository**
```bash
cd d:\pha
cd butt-nha-tro
```

2. **Setup Backend**
```bash
cd server
npm install

# Copy and configure environment variables
copy .env.example .env
# Edit .env with your MongoDB URI and other settings
```

3. **Setup Frontend**
```bash
cd ../client
npm install

# Copy and configure environment variables
copy .env.example .env
```

4. **Seed Database**
```bash
cd ../server
npm run seed
```

This will create:
- Admin user: `admin@example.com` / `password123`
- Sample user: `user@example.com` / `password123`
- 3 sample rooms
- 2 sample bookings

### Running the Application

1. **Start Backend** (Terminal 1)
```bash
cd server
npm run dev
```
Backend runs on `http://localhost:5000`

2. **Start Frontend** (Terminal 2)
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

3. **Access the Application**
- **User Interface**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin (login required)

## 📝 Default Accounts

### Admin Account
- **Email**: admin@example.com
- **Password**: password123

### User Account
- **Email**: user@example.com
- **Password**: password123

> ⚠️ **Important**: Change these passwords in production!

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Rooms
- `GET /api/rooms` - List rooms (with filters)
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room (admin)
- `PUT /api/rooms/:id` - Update room (admin)
- `PATCH /api/rooms/:id/archive` - Archive room (admin)
- `PATCH /api/rooms/:id/unarchive` - Unarchive room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)

### Bookings
- `POST /api/bookings` - Create booking (public)
- `GET /api/bookings` - List all bookings (admin)
- `GET /api/bookings/my` - Get user's bookings (user)
- `PATCH /api/bookings/:id/status` - Update booking status (admin)

### Upload
- `POST /api/upload` - Upload images (admin)

## 🎨 Features Highlights

### Search & Filter
- Location-based filtering (district, ward)
- Price range slider
- Number of people filter
- Furniture requirements
- Text search across title and address

### Room Management
- Create/Edit rooms with multiple images
- Archive rooms when unavailable
- Soft delete functionality
- Comprehensive room information (location, layout, amenities, costs)

### Booking System
- No login required for booking
- Auto-fill for logged-in users
- Vietnamese phone number validation
- Booking code generation
- Status tracking (pending → contacted → scheduled → done/canceled)

### Responsive Design
- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layouts for all screen sizes

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (admin/user)
- Protected API routes
- Input validation
- CORS configuration

## 🌐 Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/butt-nha-tro
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Sample Data

The seed script creates 3 rooms based on real Can Tho listings:

1. **MINIHOUSE KDC 91B** - 4.3M VND/month, 2 bedrooms, 35-40m²
2. **MINIHOUSE NGUYỄN VĂN CỪ** - 3M VND/month, near Can Tho University
3. **MINIHOUSE ĐƯỜNG 3/2** - 4M VND/month, near University of Medicine

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify network connectivity

### Port Already in Use
- Change `PORT` in server `.env`
- Update `VITE_API_URL` in client `.env`

### Cloudinary Upload Fails
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file formats (jpg, png, webp)

## 🚀 Deployment

### Backend (Render, Railway, etc.)
1. Set environment variables
2. Ensure MongoDB is accessible
3. Run `npm start`

### Frontend (Vercel, Netlify, etc.)
1. Build: `npm run build`
2. Set `VITE_API_URL` to production backend URL
3. Deploy `dist` folder

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Built as a comprehensive full-stack room rental management system for Can Tho, Vietnam.

## 🙏 Acknowledgments

- Sample room data inspired by real Can Tho listings
- Vietnamese localization for better user experience
- Modern UI/UX best practices
