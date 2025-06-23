# Chronos Game Backend with MongoDB Atlas

This backend uses MongoDB Atlas to store user data and game statistics.

## Setup Instructions

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier is fine)
4. Create a database user with read/write permissions
5. Get your connection string

### 2. Update Connection String
In `server.js`, replace the MongoDB connection string:
```javascript
const MONGODB_URI = 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/chronos-game?retryWrites=true&w=majority';
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Server
```bash
npm start
```

You should see:
- `🚀 Server running on port 5000`
- `✅ Connected to MongoDB Atlas`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/stats/:userId` - Get user game statistics
- `POST /api/auth/stats/:userId` - Update user game statistics

### Health Check
- `GET /health` - Check server and database status

## User Data Structure

The backend stores the following user information:
- **Basic Info**: email, username, password (hashed)
- **Game Statistics**:
  - Total games played
  - Games won/lost
  - Total and average game time
  - Best game time
  - Keys collected
  - Questions answered
  - Last game date

## Security Features
- Password hashing with bcrypt
- Input validation
- Error handling
- CORS enabled for frontend communication 