import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

const Game = () => (
  <div style={{ color: '#00ff41', textAlign: 'center', marginTop: '50px' }}>
    <h1>Game Page</h1>
    <p>Game implementation coming soon!</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/game"
          element={
            <PrivateRoute>
              <Game />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;