# LifeLink - Blood Donation Management System

A full-stack MERN application connecting blood donors with patients in need.

## Live Demo

Check out the live version of the project here: [LifeLink Live Demo](https://lifelink-tan.vercel.app/)


## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS
- React Router DOM
- Axios for API calls
- Context API for state management

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Google OAuth 2.0
- Nodemailer for email verification
- bcryptjs for password hashing

## ✨ Features

- **User Authentication**: JWT + Google OAuth integration
- **Email Verification**: Real SMTP email verification system
- **Role-Based Access**: Separate donor and patient dashboards
- **Blood Type Matching**: Smart compatibility algorithm
- **Real-Time Data**: Live donor and request statistics
- **Responsive Design**: Mobile-first approach
- **Security**: Input validation, CORS, secure headers

## 🏗️ Project Structure

```
LIFELINK_2/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context providers
│   │   └── assets/        # Images and static files
│   └── package.json
├── backend/           # Node.js API
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Helper functions
│   └── server.js
└── README.md
```

## 🚀 Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB
- Gmail account for email service

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env):**
```
MONGO_URI=mongodb://localhost:27017/lifelink
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
```

## 📱 Key Features Demo

1. **User Registration**: Email verification with links
2. **Google OAuth**: One-click social login
3. **Donor Registration**: Blood type, location, availability
4. **Patient Requests**: Urgent blood requests with priority levels
5. **Smart Matching**: Compatible blood type suggestions
6. **Dashboard**: Personalized donor/patient dashboards

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Secure email verification

## 🌐 Deployment

**Database**: MongoDB Atlas  
**Backend**: Render.com  
**Frontend**: Vercel  

## 📊 API Endpoints

```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/donor             # Get all donors
POST /api/donor/register    # Register as donor
GET  /api/patient/requests  # Get patient requests
POST /api/patient/request   # Create blood request
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

** Name - Ankit Singhania**  
- GitHub: [GitHUB](https://github.com/AnkitsinghaniaAKS)
- LinkedIn: [LinkedIn](https://linkedin.com/in/ankit-singhania-aks)
- Email: ankitsinghaniaaks@example.com

---

⭐ Star this repository if you found it helpful!
