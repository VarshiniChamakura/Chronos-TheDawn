# 🌟 Chronos: The Dawn - Time Travel Adventure Game

A multi-page React application featuring a text-based time travel adventure game with user authentication.

## 🎮 Game Flow

1. **Homepage** (`/`) - Welcome page with game description
2. **Login Page** (`/login`) - User authentication (signup/login)
3. **Game Page** (`/game`) - The main time travel adventure game

## 🚀 How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   node index1.js
   ```
   The backend will run on `http://localhost:3000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3001`

## 🎯 How to Play

1. **Start at Homepage**: Visit `http://localhost:3001` to see the game introduction
2. **Click "Play Game"**: This will take you to the login page
3. **Create Account or Login**: 
   - First time users can sign up with email, username, and password
   - Returning users can login with username and password
4. **Begin Adventure**: After successful login, you'll be redirected to the game
5. **Game Commands**:
   - `north/south/east/west` - Move between locations
   - `treasure` - Go to treasure vault (requires ALL 3 keys!)
   - `collect` - Pick up keys
   - `answer <response>` - Answer questions
   - `help` - Show all available commands

## 🗝 Game Objectives

- Collect 3 keys from different time-distorted locations:
  - 🔺 Bermuda Triangle
  - 🗿 Stonehenge  
  - 🌲 Crooked Forest
- Each location has unique time effects:
  - **ACCELERATED**: Game time moves 1.5x faster
  - **DECELERATED**: Game time moves 0.5x slower
  - **REVERSE**: Game time flows backward!
- Answer questions correctly to progress
- Unlock the treasure vault with all 3 keys

## 🔧 Technical Details

### Frontend
- React with React Router for navigation
- Protected routes for game access
- Local storage for game state persistence
- Terminal-style UI with custom styling

### Backend
- Express.js server
- MongoDB Atlas for user authentication
- bcrypt for password hashing
- CORS enabled for frontend communication

### Authentication
- JWT-style token system (simplified for demo)
- User registration and login
- Protected game routes

## 🎨 Features

- **Responsive Design**: Works on desktop and mobile
- **Terminal Theme**: Retro computer terminal aesthetic
- **Time Effects**: Each location affects game time differently
- **Auto-save**: Game progress is automatically saved
- **Score System**: Points for keys, questions, and completion
- **Logout Functionality**: Secure logout with route protection

## 🐛 Troubleshooting

- **"react-scripts not recognized"**: Run `npm install` in the frontend directory
- **Backend connection errors**: Ensure MongoDB Atlas connection string is correct
- **Port conflicts**: Change ports in package.json or use different ports

## 📝 Notes

- The backend uses MongoDB Atlas - ensure your connection string is valid
- Game state is saved in browser localStorage
- Authentication tokens are stored in localStorage (simplified for demo)

Enjoy your time travel adventure! 🌟 
