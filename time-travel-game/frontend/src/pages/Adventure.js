import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusPanel from '../components/StatusPanel';

function Adventure() {
  const [gameState, setGameState] = useState({
    location: 'Central Hub',
    health: 100,
    keys: [],
    score: 0,
  });

  const navigate = useNavigate();

  const finishAdventure = () => {
    navigate('/summary', { state: gameState });
  };

  const collectKey = () => {
    setGameState(prev => ({
      ...prev,
      keys: [...prev.keys, 'Stone Key'],
      score: prev.score + 1000,
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🌍 Adventure Zone</h2>
      <StatusPanel gameState={gameState} />
      <p>You are currently in: <strong>{gameState.location}</strong></p>
      <button onClick={collectKey}>🗝 Collect Key</button>
      <br /><br />
      <button onClick={finishAdventure}>Finish Adventure</button>
    </div>
  );
}

export default Adventure;
