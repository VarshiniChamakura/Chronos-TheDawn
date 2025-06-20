import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const startAdventure = () => {
    navigate('/adventure');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🌀 Time Travel Adventure</h1>
      <p>Embark on a thrilling journey through time!</p>
      <button onClick={startAdventure}>Start Adventure</button>
    </div>
  );
}

export default Home;
