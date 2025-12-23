# EduTrack - Project Allocation & Progress Tracking System

A comprehensive full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application for managing academic project allocation and progress tracking in technical institutions.

## Overview

EduTrack digitizes the complete project lifecycle with a centralized platform for students, faculty guides, and administrators, solving common challenges like:

- Duplicate project topics
- Uneven guide workload distribution
- Lack of transparent progress tracking
- Manual coordination overhead
- Last-minute evaluation confusion

## Features

### For Students

- Form project groups (2-4 members)
- Submit project proposals with detailed information
- **Upload project proposal documents (PDF) during submission**
- Upload documents (proposals, reports, presentations)
- Track milestone progress
- Receive feedback from guides
- View project status and deadlines

### For Faculty Guides

- Review and approve/reject project proposals
- **View project proposal documents (PDF) directly in the browser**
- **Enhanced project details view with visual timelines and group information**
- View assigned project groups
- Monitor progress through milestone submissions
- Provide feedback at each stage
- View workload dashboard
- Set custom milestones for projects

### For Administrators

- Manage user accounts
- Allocate/reassign guides to projects
- View system-wide analytics
- Monitor guide workload distribution
- Detect duplicate project topics
- Track delayed projects
- Generate comprehensive reports

## Technology Stack

### Frontend

- **React.js** (JavaScript - NO TypeScript)
- **react-router-dom** v6 - Routing
- **axios** - API calls
- **recharts** - Analytics visualization
- **react-hook-form** - Form handling
- **Context API** - State management

### Backend

- **Node.js** with **Express.js** (JavaScript - NO TypeScript)
- **MongoDB** with **Mongoose** ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email notifications
- **express-validator** - Input validation

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Guru54/Edutrack.git
cd Edutrack
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

FRONTEND_URL=http://localhost:3000
```

#### Start MongoDB

Make sure MongoDB is running:

```bash
# On macOS/Linux
mongod

# On Windows (run as service or)
"C:\Program Files\MongoDB\Server\X.X\bin\mongod.exe"
```

#### Run the Backend Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

The `.env` file is already created in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Run the Frontend

```bash
npm start
```

Frontend will run on http://localhost:3000

## Project Structure

```
Edutrack/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and email configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Entry point
│   ├── uploads/             # File upload storage
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── contexts/        # React contexts
│   │   ├── utils/           # Helper utilities
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── .env
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/logout` - Logout user

### Projects

- `GET /api/projects` - List all projects (with filters)
- `POST /api/projects` - Create new proposal
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/approve` - Approve proposal
- `POST /api/projects/:id/reject` - Reject proposal
- `GET /api/projects/duplicates` - Check for duplicates

### Milestones

- `GET /api/projects/:id/milestones` - Get project milestones
- `POST /api/projects/:id/milestones` - Create milestone
- `PUT /api/milestones/:id` - Update milestone
- `POST /api/milestones/:id/submit` - Submit milestone
- `POST /api/milestones/:id/feedback` - Provide feedback

### Users & Groups

- `GET /api/users` - List users (Admin only)
- `PUT /api/users/:id` - Update user profile
- `POST /api/groups` - Create student group
- `GET /api/groups/:id` - Get group details

### Allocations

- `GET /api/guides` - Get available guides
- `POST /api/allocations` - Assign guide to project
- `PUT /api/allocations/:id` - Reassign guide
- `GET /api/guides/:id/workload` - Get guide's workload

### Analytics

- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/guide-workload` - Guide workload data
- `GET /api/analytics/project-status` - Project status distribution
- `GET /api/analytics/duplicates` - Duplicate projects

### File Upload

- `POST /api/upload` - Upload file
- `GET /api/files/:id` - Download file

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

## Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: express-validator for all inputs
- **File Upload Validation**: Type and size restrictions
- **CORS Configuration**: Controlled cross-origin requests
- **SQL Injection Prevention**: Mongoose parameterized queries

## Default User Roles

The system supports three user roles:

- **Student**: Submit proposals, track progress
- **Faculty**: Review projects, provide feedback
- **Admin**: System management, allocations, analytics

## UI Features

- Clean, modern, responsive design
- **Enhanced Faculty Dashboard with Review Queue**
- **Visual Project Timelines and Progress Tracking**
- **Interactive Milestone Review System**
- Mobile-first approach
- Card-based layouts
- Real-time notifications
- Loading states
- Form validation with error messages
- Professional color scheme

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Development Guidelines

1. **Code Quality**: Well-commented, modular code
2. **Naming Conventions**: Consistent camelCase for variables
3. **Async Operations**: Use async/await pattern
4. **Error Handling**: Centralized error handling
5. **Git Commits**: Clear, descriptive commit messages

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongo --eval "db.stats()"

# Restart MongoDB service
sudo service mongod restart  # Linux
brew services restart mongodb-community  # macOS
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process and restart
```

### Email Not Sending

- Verify SMTP credentials in `.env`
- For Gmail, enable "Less secure app access" or use App Password
- Check firewall settings

## License

This project is licensed under the MIT License.

## Made with MERN Stack

Built with MongoDB, Express.js, React.js, and Node.js for academic institutions.
