import React from 'react';

function StatusPanel({ gameState }) {
  return (
    <div style={{
      border: '1px solid #00ff41',
      padding: '10px',
      borderRadius: '8px',
      backgroundColor: '#0a0a2e',
      color: '#00ff41',
      fontFamily: 'monospace',
      marginBottom: '15px'
    }}>
      <h4>Status Panel</h4>
      <p><strong>🧭 Location:</strong> {gameState.location}</p>
      <p><strong>💖 Health:</strong> {gameState.health}</p>
      <p><strong>🗝 Keys:</strong> {gameState.keys.length > 0 ? gameState.keys.join(', ') : 'None'}</p>
      <p><strong>🏆 Score:</strong> {gameState.score}</p>
    </div>
  );
}

export default StatusPanel;
