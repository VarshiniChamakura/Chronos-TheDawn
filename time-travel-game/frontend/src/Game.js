import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

// Game data initialization
const specialLocations = ["Bermuda Triangle", "Stonehenge", "Crooked Forest"];
const directions = ["north", "south", "east"];
const LOCATION_TIME_LIMIT = 120;
const GAME_STORAGE_KEY = "timeTravelGameStateV1";

function reverseDirection(direction) {
  switch (direction) {
    case "north": return "south";
    case "south": return "north";
    case "east": return "west";
    case "west": return "east";
    default: return "";
  }
}

function randomizePortals(locations) {
  // Randomize which portal leads where
  const shuffled = specialLocations
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  // Randomize time effects for each special location (accelerated, decelerated, reverse)
  const timeEffects = ["accelerated", "decelerated", "reverse"];
  const shuffledEffects = timeEffects
    .map((effect) => ({ effect, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ effect }) => effect);

  for (let i = 0; i < directions.length; i++) {
    locations["Central Hub"].exits[directions[i]] = shuffled[i];
    locations[shuffled[i]].exits[reverseDirection(directions[i])] = "Central Hub";
    // Assign a random time effect to each special location
    locations[shuffled[i]].timeEffect = shuffledEffects[i];
    // Set the timeModifier based on the effect
    if (shuffledEffects[i] === "accelerated") {
      locations[shuffled[i]].timeModifier = 1.5;
    } else if (shuffledEffects[i] === "decelerated") {
      locations[shuffled[i]].timeModifier = 0.5;
    } else if (shuffledEffects[i] === "reverse") {
      locations[shuffled[i]].timeModifier = -1;
    }
  }
  locations["Central Hub"].exits["treasure"] = "Treasure Vault";
}

const initialLocations = {
  "Central Hub": {
    description: "A mystical nexus where time flows normally. Portals shimmer in all directions.",
    welcome: "🌟 Welcome to the Central Hub! Choose your time adventure wisely.",
    key: null,
    exits: {},
    timeEffect: "normal",
    hasQuestion: false,
    questionAnswered: true,
    timeModifier: 1,
  },
  "Bermuda Triangle": {
    description: "A mysterious triangular vortex where time accelerates dramatically. Reality bends around you.",
    welcome: "🔺 Entering Bermuda Triangle! Time is speeding up - move quickly!",
    key: "Triangle Key",
    exits: {},
    timeEffect: "accelerated",
    hasQuestion: true,
    question: "What phenomenon is the Bermuda Triangle famous for?",
    answer: "disappearances",
    questionAnswered: false,
    timeModifier: 1.5,
  },
  "Stonehenge": {
    description: "Ancient stone circles where time moves sluggishly, as if weighted by millennia.",
    welcome: "🗿 Welcome to Stonehenge! Time drags heavily here - use it wisely.",
    key: "Stone Key",
    exits: {},
    timeEffect: "decelerated",
    hasQuestion: true,
    question: "How many stones form the main circle of Stonehenge?",
    answer: "30",
    questionAnswered: false,
    timeModifier: 0.5,
  },
  "Crooked Forest": {
    description: "A twisted woodland where time flows in reverse, undoing moments as they pass.",
    welcome: "🌲 Entering Crooked Forest! Time flows backward - reality unravels!",
    key: "Forest Key",
    exits: {},
    timeEffect: "reverse",
    hasQuestion: true,
    question: "In which country is the famous Crooked Forest located?",
    answer: "poland",
    questionAnswered: false,
    timeModifier: -1,
  },
  "Treasure Vault": {
    description: "The legendary treasure vault, accessible only to those who have mastered time itself!",
    welcome: "💰 TREASURE VAULT UNLOCKED! Congratulations, Time Master!",
    key: null,
    exits: {},
    timeEffect: "normal",
    hasQuestion: false,
    questionAnswered: true,
    timeModifier: 1,
  },
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function formatTime(seconds) {
  const hours = Math.floor(Math.abs(seconds) / 3600);
  const minutes = Math.floor((Math.abs(seconds) % 3600) / 60);
  const secs = Math.floor(Math.abs(seconds) % 60);
  const sign = seconds < 0 ? "-" : "";
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const getInitialGameState = (locations) => {
  // Try to load from localStorage
  const saved = localStorage.getItem(GAME_STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    const now = Date.now();
    let elapsed = (now - (parsed.lastTickTime || now)) / 1000;
    if (elapsed > 10) elapsed = 10; // Only allow 10s max
    
    const currentLocation =
      parsed.location && parsed.location in locations
        ? parsed.location
        : "Central Hub";
    
    let gameTimeDelta = elapsed;
    
    if (currentLocation !== "Central Hub" && currentLocation !== "Treasure Vault") {
      const timeModifier = locations[currentLocation]?.timeModifier || 1;
      gameTimeDelta = elapsed * timeModifier;
      parsed.locationTimer = Math.max(0, parsed.locationTimer - elapsed);
    }
    
    parsed.gameTime += gameTimeDelta;
    // Add elapsed real time to the constant game time
    parsed.constantGameTime = (parsed.constantGameTime || 0) + elapsed;
    parsed.lastTickTime = now;
    return parsed;
  }
  
  return {
    health: 100,
    keys: [],
    location: "Central Hub",
    gameTime: 0,
    constantGameTime: 0, // New state for the constant timer
    locationTimer: 120,
    timeEffect: "normal",
    awaitingAnswer: false,
    currentQuestion: null,
    visitedLocations: ["Central Hub"],
    gameActive: true,
    score: 0,
    lastTickTime: Date.now(),
  };
};

function Game() {
  const navigate = useNavigate();
  
  // Locations and portals (randomized once on mount or reset)
  const [locations, setLocations] = useState(() => {
    const locs = deepClone(initialLocations);
    randomizePortals(locs);
    return locs;
  });

  // Game State
  const [gameState, setGameState] = useState(() => getInitialGameState(locations));
  const [isTimeUpPopupVisible, setIsTimeUpPopupVisible] = useState(false);
  const [isResetConfirmVisible, setIsResetConfirmVisible] = useState(false);
  const [isWinPopupVisible, setIsWinPopupVisible] = useState(false);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);

  // Console log
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  // --- AUTO SCROLL CONSOLE BOX ---
  const consoleRef = useRef(null);
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  // --------- AUTO-SAVE GAME STATE ON CHANGE -----------
  useEffect(() => {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // --------- UPDATE TIMER -----------
  useEffect(() => {
    if (!gameState.gameActive) return;
    const interval = setInterval(() => {
      setGameState((prev) => {
        const now = Date.now();
        let deltaTime = (now - prev.lastTickTime) / 1000;
        if (deltaTime > 10) deltaTime = 10;
        let gameTimeDelta = deltaTime;
        const currentLocation = locations[prev.location];
        if (prev.location !== "Central Hub" && prev.location !== "Treasure Vault") {
          switch (currentLocation.timeEffect) {
            case "accelerated":
              gameTimeDelta = deltaTime * 1.5;
              break;
            case "decelerated":
              gameTimeDelta = deltaTime * 0.5;
              break;
            case "reverse":
              gameTimeDelta = deltaTime * -1;
              break;
            default:
              gameTimeDelta = deltaTime;
          }
        }
        let newGameTime = prev.gameTime + gameTimeDelta;
        let newLocationTimer = prev.locationTimer;
        const newConstantGameTime = (prev.constantGameTime || 0) + deltaTime;
        if (prev.location !== "Central Hub" && prev.location !== "Treasure Vault") {
          newLocationTimer = Math.max(0, prev.locationTimer - deltaTime);
        }
        if (
          newLocationTimer <= 0 &&
          prev.location !== "Central Hub" &&
          prev.location !== "Treasure Vault"
        ) {
          clearInterval(interval);
          endGameTimeUp();
          return { ...prev, gameActive: false, locationTimer: 0, lastTickTime: now };
        }
        return {
          ...prev,
          gameTime: newGameTime,
          constantGameTime: newConstantGameTime,
          locationTimer: newLocationTimer,
          lastTickTime: now,
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [gameState.gameActive, gameState.location, locations, gameState.lastTickTime]);

  // Log helper
  const log = (msg, className = "") => {
    setLogs((lgs) => [...lgs, { msg, className }]);
  };

  // On mount: intro logs
  useEffect(() => {
    setLogs([]);
    log("🌟 ═══════════════════════════════════════════════════════════════════════════════════════════", "success");
    log("�� WELCOME TO CHRONOS: THE DAWN! 🌟", "success");
    log("🌟 ═══════════════════════════════════════════════════════════════════════════════════════════", "success");
    log("");
    log("🎯 YOUR MISSION: Collect all 3 keys from different time-distorted locations!", "treasure");
    log("⏰ WARNING: Each location has unique time effects that will challenge you!", "warning");
    log("");
    log("💡 TIPS:", "success");
    log("• Use \"help\" to see all available commands");
    log("• Answer questions correctly to progress");
    log("• Collect keys to unlock the treasure vault");
    log("");
    log("🚀 Type your first command to begin your adventure!", "success");
    log("");
    enterLocation("Central Hub");
  }, []);

  // Enter location
  function enterLocation(loc = null) {
    const currentLoc = locations[loc || gameState.location];
    log(currentLoc.welcome, "success");
    log(currentLoc.description);
    log("");

    if (loc && loc !== "Central Hub" && loc !== "Treasure Vault") {
      setGameState((prev) => ({
        ...prev,
        locationTimer: LOCATION_TIME_LIMIT,
      }));
    }

    const exits = Object.keys(currentLoc.exits);
    if (exits.length > 0) {
      log(`🚪 Available directions: ${exits.join(", ")}`);
      if (exits.includes("treasure")) {
        if (checkTreasureUnlock()) {
          log("💰 ✨ TREASURE VAULT UNLOCKED! Type \"treasure\" to enter! ✨", "treasure");
        } else {
          const keysNeeded = 3 - gameState.keys.length;
          log(`🔐 Treasure Vault: LOCKED (Need ${keysNeeded} more keys)`, "warning");
        }
      }
    }

    if (currentLoc.key && !gameState.keys.includes(currentLoc.key)) {
      log(`🗝 You see a ${currentLoc.key} glinting nearby! Type 'collect' to take it.`);
    }

    if (loc === "Treasure Vault" || (!loc && gameState.location === "Treasure Vault")) {
      setGameState((prev) => ({ ...prev, score: prev.score + 10000, gameActive: false }));
      setIsWinPopupVisible(true);
      return;
    }

    if (!gameState.visitedLocations.includes(loc || gameState.location)) {
      setGameState((prev) => ({
        ...prev,
        visitedLocations: [...prev.visitedLocations, loc || gameState.location],
      }));
    }
  }

  function askQuestion() {
    const currentLocation = locations[gameState.location];
    if (currentLocation.hasQuestion && !currentLocation.questionAnswered) {
      log("🤔 " + currentLocation.question, "question");
      log("💭 Type '<your_response>' to respond.");
      setGameState((prev) => ({
        ...prev,
        awaitingAnswer: true,
        currentQuestion: currentLocation.question,
      }));
      return true;
    }
    return false;
  }

  function checkTreasureUnlock() {
    const requiredKeys = ["Triangle Key", "Stone Key", "Forest Key"];
    return requiredKeys.every((key) => gameState.keys.includes(key));
  }

  function endGameTimeUp() {
    setGameState((prev) => ({ ...prev, gameActive: false }));
    showFinalStatus();
    // Use a timeout to ensure the score renders before the alert appears
    setTimeout(() => {
      setIsTimeUpPopupVisible(true);
    }, 100);
  }

  function showFinalStatus() {
    log("════════ GAME OVER ════════", "success");
    log(`🏆 FINAL SCORE: ${gameState.score.toLocaleString()} POINTS`, "treasure");
    log("");
    log("=== DETAILED STATISTICS ===", "success");
    log(`🕒 Total Game Time: ${formatTime(gameState.gameTime)}`);
    log(`💖 Final Health: ${gameState.health}/100`);
    log(`🗝 Keys Collected: ${gameState.keys.join(", ") || "None"} (${gameState.keys.length}/3)`);
    log(`📍 Locations Visited: ${gameState.visitedLocations.join(", ")}`);

    const completion = (gameState.keys.length / 3) * 100;
    log(`📊 Completion Rate: ${completion.toFixed(1)}%`);
    log("");
    log("=== SCORE BREAKDOWN ===", "success");
    log(
      `🗝 Keys Collected: ${gameState.keys.length} × 1,000 = ${(gameState.keys.length * 1000).toLocaleString()} pts`
    );
    const questionsAnswered = Object.values(locations).filter(
      (loc) => loc.hasQuestion && loc.questionAnswered
    ).length;
    log(
      `🤔 Questions Answered: ${questionsAnswered} × 500 = ${(questionsAnswered * 500).toLocaleString()} pts`
    );
    if (gameState.location === "Treasure Vault" || gameState.score >= 10000) {
      log("💰 Treasure Vault Bonus: 10,000 pts", "treasure");
    }
    log(`🏆 TOTAL SCORE: ${gameState.score.toLocaleString()} POINTS`, "treasure");
    log("");

    if (gameState.score >= 10000) {
      log("🌟 RANK: MASTER OF TIME! Perfect completion!", "treasure");
    } else if (gameState.keys.length === 3) {
      log("🎖 RANK: TIME COLLECTOR! All keys found!", "success");
    } else if (gameState.keys.length >= 2) {
      log("🥉 RANK: TIME SEEKER! Good progress!", "success");
    } else if (gameState.keys.length >= 1) {
      log("🔰 RANK: TIME NOVICE! Keep exploring!", "success");
    } else {
      log("📚 RANK: TIME STUDENT! Practice makes perfect!", "warning");
    }
    
    log("");
    log("Thanks for playing Chronos: The Dawn!", "success");
    log('Click "Reset Game" to play again!', "success");
  }

  // Handle command input
  function handleCommand(e) {
    e.preventDefault();
    if (!gameState.gameActive) return;

    const value = input.trim();
    if (!value) return;
    setInput("");
    log(`> ${value}`);

    // If awaiting an answer, treat any input as the answer
    if (gameState.awaitingAnswer) {
      const currentLoc = locations[gameState.location];
      if (value.toLowerCase().includes(currentLoc.answer.toLowerCase())) {
        log("✅ Correct! Well done!", "success");
        setLocations((prev) => {
          const newLocs = deepClone(prev);
          newLocs[gameState.location].questionAnswered = true;
          return newLocs;
        });
        setGameState((prev) => ({
          ...prev,
          awaitingAnswer: false,
          currentQuestion: null,
          score: prev.score + 500,
        }));
      } else {
        log("❌ Incorrect answer. Try again!", "error");
        setGameState((prev) => ({
          ...prev,
          health: prev.health - 10,
        }));
        log("🤔 " + currentLoc.question, "question");
      }
      return;
    }

    const parts = value.toLowerCase().split(" ");
    const command = parts[0];
    const args = parts.slice(1).join(" ");

    switch (command) {
      case "help":
        log("🎮 COMMANDS:");
        log("• north/south/east/west - Move between locations");
        log("• treasure - Go to treasure vault (requires ALL 3 keys!)");
        log("• collect - Pick up keys");
        log("• help - Show this help");
        log("");
        log("💡 TIP: Collect all 3 keys to unlock the treasure vault!");
        log("");
        break;
      case "north":
      case "south":
      case "east":
      case "west":
      case "treasure": {
        const currentLocation = locations[gameState.location];
        if (!currentLocation.exits[command]) {
          log(`❌ You can't go ${command} from here.`, "error");
        } else if (command === "treasure" && !checkTreasureUnlock()) {
          const keysNeeded = 3 - gameState.keys.length;
          log(`🔐 The treasure vault is sealed! You need ${keysNeeded} more keys.`, "error");
          log(
            `🗝 Current keys: ${gameState.keys.join(", ") || "None"} (${gameState.keys.length}/3)`,
            "warning"
          );
          log(
            "💡 Visit Bermuda Triangle, Stonehenge, and Crooked Forest to collect all keys!",
            "warning"
          );
        } else {
          if (currentLocation.hasQuestion && !currentLocation.questionAnswered) {
            if (!askQuestion()) {
              log("🚫 You must answer the question before leaving!", "warning");
              return;
            }
            return;
          }
          setGameState((prev) => ({
            ...prev,
            location: currentLocation.exits[command],
          }));
          log(`🚶 Moving ${command}...`);
          enterLocation(currentLocation.exits[command]);
        }
        break;
      }
      case "collect": {
        const locationObj = locations[gameState.location];
        if (locationObj.key && !gameState.keys.includes(locationObj.key)) {
          log(`✨ You collected the ${locationObj.key}!`, "success");
          setGameState((prev) => ({
            ...prev,
            keys: [...prev.keys, locationObj.key],
            score: prev.score + 1000,
          }));
          if (checkTreasureUnlock()) {
            log("🎉 ALL KEYS COLLECTED! 🎉", "treasure");
            log("💰 The treasure vault is now accessible from Central Hub!", "treasure");
          } else {
            const remaining = 3 - (gameState.keys.length + 1);
            log(
              `🗝 ${remaining} more key${remaining > 1 ? "s" : ""} needed for the treasure vault!`,
              "success"
            );
          }
        } else {
          log("❌ There's no key to collect here or you already have it.", "error");
        }
        break;
      }
      default:
        log(`❓ Unknown command: "${command}". Type 'help' for available commands.`, "error");
    }
  }

  // Reset Game
  function resetGame() {
    setIsTimeUpPopupVisible(false);
    setIsResetConfirmVisible(false);
    setIsWinPopupVisible(false);
    setLocations(() => {
      const locs = deepClone(initialLocations);
      randomizePortals(locs);
      return locs;
    });
    setGameState({
      health: 100,
      keys: [],
      location: "Central Hub",
      gameTime: 0,
      constantGameTime: 0, // Reset constant timer
      locationTimer: 120,
      timeEffect: "normal",
      awaitingAnswer: false,
      currentQuestion: null,
      visitedLocations: ["Central Hub"],
      gameActive: true,
      score: 0,
      lastTickTime: Date.now(),
    });
    setLogs([]);
    setInput("");
    localStorage.removeItem(GAME_STORAGE_KEY);
    // Intro logs
    log("🌟 ═══════════════════════════════════════════════════════════════════════════════════════════", "success");
    log("�� WELCOME TO CHRONOS: THE DAWN! 🌟", "success");
    log("🌟 ═══════════════════════════════════════════════════════════════════════════════════════════", "success");
    log("");
    log("🎯 YOUR MISSION: Collect all 3 keys from different time-distorted locations!", "treasure");
    log("⏰ WARNING: Each location has unique time effects that will challenge you!", "warning");
    log("");
    log("💡 TIPS:", "success");
    log("• Use \"help\" to see all available commands");
    log("• Watch your location timer - you have 2 minutes per special location!");
    log("• ACCELERATED: Game time moves 1.5x faster (3min in 2min)");
    log("• DECELERATED: Game time moves 0.5x slower (1min in 2min)");
    log("• REVERSE: Game time flows backward!");
    log("• Answer questions correctly to progress");
    log("• Collect keys to unlock the treasure vault");
    log("");
    log("🚀 Type your first command to begin your adventure!", "success");
    log("");
    enterLocation("Central Hub");
    inputRef.current && inputRef.current.focus();
  }

  // Helper to get userId from localStorage (assume it's stored after login)
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  // Save game result to backend
  async function saveGameResult(won) {
    if (!userId) return;
    try {
      await fetch(`http://localhost:5000/api/auth/stats/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameTime: gameState.gameTime,
          constantGameTime: gameState.constantGameTime,
          won
        })
      });
    } catch (e) {
      // Ignore errors for now
    }
  }

  // When win popup is shown, save win
  useEffect(() => {
    if (isWinPopupVisible) saveGameResult(true);
  }, [isWinPopupVisible]);
  // When time up popup is shown, save loss
  useEffect(() => {
    if (isTimeUpPopupVisible) saveGameResult(false);
  }, [isTimeUpPopupVisible]);

  function logout() {
    setIsLogoutConfirmVisible(true);
  }
  function confirmLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    navigate('/login');
  }
  function cancelLogout() {
    setIsLogoutConfirmVisible(false);
  }

  // Status display colors
  function healthColor() {
    if (gameState.health <= 25) return "#ff4444";
    if (gameState.health <= 50) return "#ffa500";
    return "#00ff41";
  }

  // UI
  return (
    <div>
      {isWinPopupVisible && (
        <div className="popup-overlay">
          <div className="popup-content win-popup">
            <h1 className="green-text">🎉 CONGRATULATIONS!</h1>
            <p>You have mastered the Chronos: The Dawn!</p>
            <div className="win-popup-stats">
              <p><strong>🏆 Final Score:</strong> {gameState.score.toLocaleString()}</p>
              <p><strong>⏰ Game Time:</strong> {formatTime(gameState.gameTime)}</p>
              <p><strong>🕒 Constant Game Time:</strong> {formatTime(gameState.constantGameTime)}</p>
            </div>
            <button className="play-again-green" onClick={resetGame}>🔄 Play Again</button>
          </div>
        </div>
      )}
      {isTimeUpPopupVisible && (
        <div className="popup-overlay">
          <div className="popup-content game-over-popup">
            <h1>⏰ TIME'S UP! ⏰</h1>
            <p>You ran out of time in {gameState.location}!</p>
            <p>Final Score: {gameState.score.toLocaleString()}</p>
            <button className="play-again-green" onClick={resetGame}>🔄 Play Again</button>
          </div>
        </div>
      )}

      {isResetConfirmVisible && (
        <div className="popup-overlay">
          <div className="popup-content reset-confirm-popup">
            <h2>🔄 Reset Game?</h2>
            <p>Are you sure you want to start over? All progress will be lost.</p>
            <div className="popup-buttons">
              <button onClick={resetGame} className="popup-button-yes">
                Yes, Reset
              </button>
              <button onClick={() => setIsResetConfirmVisible(false)} className="popup-button-no">
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isLogoutConfirmVisible && (
        <div className="popup-overlay">
          <div className="popup-content logout-confirm-popup">
            <h1 className="red-text">Logout?</h1>
            <p>Are you sure you really want to logout of the game?</p>
            <div className="popup-buttons">
              <button className="popup-button-yellow" onClick={cancelLogout}>No, Cancel</button>
              <button className="popup-button-red" onClick={confirmLogout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      <div className="header">
        <h1>🌀 CHRONOS: THE DAWN 🌀</h1>
        {username && <div className="welcome-user">Welcome, <b>{username}</b></div>}
        <p>Collect keys and solve puzzles across time-warped locations!</p>
        <button onClick={logout} className="logout-button right-red">🚪 Logout</button>
      </div>
      <div id="status-panel">
        <div className="status-item">
          <span className="status-label">🕒 Constant Game Time:</span>
          <span className="status-value">{formatTime(gameState.constantGameTime)}</span>
        </div>
        <div className="status-item">
          <span className="status-label">⏰ Game Time:</span>
          <span className="status-value">{formatTime(gameState.gameTime)}</span>
        </div>
        <div className="status-item">
          <span className="status-label">⏱ Location Timer:</span>
          <span
            className={`status-value${gameState.locationTimer <= 30 && gameState.locationTimer > 0 ? " pulsing" : ""}`}
            style={{
              color:
                gameState.locationTimer <= 10
                  ? "#ff4444"
                  : gameState.locationTimer <= 30
                  ? "#ffa500"
                  : "#fff",
            }}
          >
            {gameState.location !== "Central Hub" && gameState.location !== "Treasure Vault"
              ? formatTime(Math.max(0, gameState.locationTimer))
              : "∞"}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">💖 Health:</span>
          <span className="status-value" style={{ color: healthColor() }}>
            {gameState.health}/100
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">🗝 Keys:</span>
          <span className="status-value">
            {gameState.keys.length > 0 ? gameState.keys.join(", ") : "None"}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">📍 Location:</span>
          <span className="status-value">{gameState.location}</span>
        </div>
        <div className="status-item">
          <span className="status-label">🌀 Time Effect:</span>
          <span className="status-value time-effect">
            {locations[gameState.location]?.timeEffect?.toUpperCase() || "NORMAL"}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">🏆 Score:</span>
          <span className="status-value">{gameState.score.toLocaleString()}</span>
        </div>
      </div>
      <div id="game-area">
        <div id="console" ref={consoleRef}>
          {logs.map(({ msg, className }, idx) => (
            <div key={idx} className={className}>
              {msg}
            </div>
          ))}
        </div>
        <div id="map-container">
          <div id="score-board">
            <h3>🎯 OBJECTIVES</h3>
            <p>
              Collect keys from:<br />
              🔺 Bermuda Triangle<br />
              🗿 Stonehenge<br />
              🌲 Crooked Forest
            </p>
            <p className="treasure">💰 Need ALL 3 keys for treasure!</p>
            <p className="warning">⚠ 2 minutes per location!</p>
            <br />
          </div>
        </div>
      </div>
      <form className="input-area-wrap" onSubmit={handleCommand}>
        <input
          id="cmd"
          placeholder="Enter command (north/south/east/west/collect/answer/help)..."
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!gameState.gameActive}
          ref={inputRef}
        />
        <div style={{ marginTop: 10, textAlign: "left" }}>
          <button id="reset-button" type="button" onClick={() => setIsResetConfirmVisible(true)}>
            🔄 Reset Game
          </button>
        </div>
      </form>
    </div>
  );
}

export default Game; 