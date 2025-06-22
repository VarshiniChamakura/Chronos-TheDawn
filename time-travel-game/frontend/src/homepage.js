import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Optional: Import a CSS file for font if needed
// import './Homepage.css';

export default function Homepage() {
  const [helpHover, setHelpHover] = useState(false);
  const [playHover, setPlayHover] = useState(false);
  const navigate = useNavigate();

  // Inline styles to match your theme
  const styles = {
    body: {
      background: "linear-gradient(to bottom, #101632 80%, #142355 100%)",
      color: "#f3f3f3",
      fontFamily: "'Share Tech Mono', 'Fira Mono', 'Consolas', 'Monaco', monospace",
      minHeight: "100vh",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    mainContainer: {
      width: "98vw",
      maxWidth: 1100,
      margin: "38px auto 0 auto",
      paddingBottom: 40,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    headerFlex: {
      width: "100%",
      maxWidth: 500,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      marginBottom: 10,
    },
    terminalHeading: {
      fontSize: "3.4rem",
      color: "#ff6600",
      letterSpacing: "0.09em",
      textShadow: "0 0 16px #ff7f5080, 0 0 30px #fcf67b40",
      fontFamily: "'Share Tech Mono', 'Fira Mono', monospace",
      textAlign: "center",
      marginRight: "6%",
      marginBottom: 0,
      marginTop: "0.2em",
      flexShrink: 0,
      lineHeight: 1.1,
    },
    subtitle: {
      color: "#39ff14",
      fontSize: "1.1rem",
      marginBottom: 25,
      textAlign: "center",
      letterSpacing: "0.05em",
      textShadow: "0 0 6px #39ff1455",
    },
    descSection: {
      background: "#081629",
      borderRadius: 12,
      boxShadow: "0 0 0 3px #1fff7a, 0 2px 28px 4px #20ff6d55",
      border: "1.5px solid #13ff53",
      padding: "28px 30px 26px 30px",
      width: "100%",
      maxWidth: 700,
      marginBottom: 30,
    },
    descSectionH2: {
      color: "#ffcc00",
      marginTop: "1.4em",
      marginBottom: "0.5em",
      fontSize: "1.4em",
      borderBottom: "1px solid #444",
      paddingBottom: "0.2em",
      fontFamily: "inherit",
    },
    descSectionUl: {
      marginLeft: "1.5em",
      marginBottom: "1.5em",
    },
    descSectionLi: {
      marginBottom: "0.5em",
    },
    keysDescription: {
      color: "#7fffd4",
      marginBottom: "0.8em",
    },
    treasure: {
      color: "#ffd700",
    },
    playBtn: {
      display: "block",
      margin: "25px auto 0 auto",
      padding: "0.8em 2.2em",
      fontSize: "1.3em",
      fontFamily: "inherit",
      color: "#e7f612",
      background: "linear-gradient(90deg, #f97063 20%, #d37752 80%)",
      border: "2px solid #97fa97",
      borderRadius: 8,
      boxShadow: "0 0 10px #cbda28, 0 0 5px #e8d031a0",
      cursor: "pointer",
      outline: "none",
      transition: "background 0.2s, box-shadow 0.2s, transform 0.13s",
      ...(playHover
        ? {
            background: "linear-gradient(90deg, #44c2f4 30%, #10f792 90%)",
            boxShadow: "0 0 22px #7de26b, 0 0 8px #7bece3a0",
            transform: "translateY(-2px) scale(1.04)",
          }
        : {}),
    },
  };

  return (
    <div style={styles.body}>
      {/* If using create-react-app, Google Fonts import should be in index.html */}
      <div style={styles.mainContainer}>
        <div style={styles.headerFlex}>
          <div style={styles.terminalHeading}>CHRONOS: THE DAWN</div>
        </div>
        <div style={styles.subtitle}>
          Collect keys and solve puzzles across time-warped locations!
        </div>
        <div style={styles.descSection}>
          <h2 style={styles.descSectionH2}>About the Game</h2>
          <p>
            <strong>Chronos: The Dawn</strong> is a text-based adventure game that lets you explore mysterious places, solve puzzles, and discover hidden treasures. Navigate through legendary locations and use your wits to survive and succeed!
          </p>
          <h2 style={styles.descSectionH2}>Locations</h2>
          <ul style={styles.descSectionUl}>
            <li style={styles.descSectionLi}>
              <strong>Stonehenge</strong>:<br />
              Explore the ancient stone circle shrouded in mystery and legend. Solve riddles among the monoliths and uncover the secrets of this prehistoric monument.
            </li>
            <li style={styles.descSectionLi}>
              <strong>Crooked Forest</strong>:<br />
              Wander through a bizarre grove of twisted trees. Strange things lurk in the shadows—can you find your way out and discover what caused the forest's unusual shapes?
            </li>
            <li style={styles.descSectionLi}>
              <strong>Bermuda Triangle</strong>:<br />
              Brave the perilous waters haunted by disappearances. Navigate storms and supernatural phenomena as you search for lost artifacts and the truth behind the Triangle's mysteries.
            </li>
          </ul>
          <h2 style={styles.descSectionH2}>Game Keys</h2>
          <div style={styles.keysDescription}>
            You need to find keys hidden across different locations to unlock the treasure vault. Solve puzzles and explore wisely—each key brings you closer to your goal!
          </div>
          {/* Add key controls here if you want */}
          <h2 style={styles.descSectionH2}>Treasure</h2>
          <p style={styles.treasure}>
            Seek out hidden treasures in each location! Each treasure brings you one step closer to victory, unlocking new lore and upgrades for your journey. Will you uncover them all?
          </p>
        </div>
        <button
          style={styles.playBtn}
          onMouseEnter={() => setPlayHover(true)}
          onMouseLeave={() => setPlayHover(false)}
          onClick={() => navigate("/login")}
        >
          ▶ Play Game
        </button>
      </div>
    </div>
  );
}