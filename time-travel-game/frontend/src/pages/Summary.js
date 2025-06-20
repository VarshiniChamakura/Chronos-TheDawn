import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Summary() {
  const location = useLocation();
  const navigate = useNavigate();
  const gameState = location.state || {
    location: 'Unknown',
    health: 0,
    keys: [],
    score: 0,
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📜 Adventure Summary</h2>
      <p><strong>Location:</strong> {gameState.location}</p>
      <p><strong>Health:</strong> {gameState.health}</p>
      <p><strong>Keys Collected:</strong> {gameState.keys.join(', ') || 'None'}</p>
      <p><strong>Score:</strong> {gameState.score}</p>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}

export default Summary;
