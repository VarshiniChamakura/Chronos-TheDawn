import React, { useState, useEffect, useRef } from "react";
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
  const shuffled = specialLocations
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  for (let i = 0; i < directions.length; i++) {
    locations["Central Hub"].exits[directions[i]] = shuffled[i];
    locations[shuffled[i]].exits[reverseDirection(directions[i])] = "Central Hub";
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
    timeModifier: 0,
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
    timeModifier: 2,
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
    timeModifier: 0,
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
    // Correction: only apply at most 10s since last tick
    const now = Date.now();
    let elapsed = (now - (parsed.lastTickTime || now)) / 1000;
    if (elapsed > 10) elapsed = 10; // Only allow 10s max
    // Advance the game timer by up to 10s if paused
    let gameTimeDelta = elapsed;
    const currentLocation =
      parsed.location && parsed.location in initialLocations
        ? parsed.location
        : "Central Hub";
    let timeModifier = initialLocations[currentLocation]?.timeModifier || 1;
    let timeEffect = initialLocations[currentLocation]?.timeEffect || "normal";
    // --- MODIFICATION FOR 10s TIME EFFECT ---
    // On reload, restore timeEffectStart if needed
    if (!parsed.timeEffectStart && currentLocation !== "Central Hub" && currentLocation !== "Treasure Vault") {
      parsed.timeEffectStart = now - (parsed.locationTimer > (LOCATION_TIME_LIMIT - 10) ? 0 : 10000);
    }
    // --- END MODIFICATION ---
    if (currentLocation !== "Central Hub" && currentLocation !== "Treasure Vault") {
      // Only apply effect if timeEffectStart is within 10s
      const effectActive =
        parsed.timeEffectStart &&
        now - parsed.timeEffectStart <= 10000;
      if (effectActive) {
        switch (timeEffect) {
          case "reverse":
            gameTimeDelta = -elapsed;
            break;
          case "accelerated":
            gameTimeDelta = elapsed * (timeModifier || 2);
            break;
          case "decelerated":
            gameTimeDelta = elapsed * (timeModifier || 0.5);
            break;
          default:
            gameTimeDelta = elapsed;
        }
      } else {
        gameTimeDelta = elapsed; // normal after 10s
      }
      parsed.locationTimer = Math.max(0, parsed.locationTimer - elapsed);
    }
    parsed.gameTime += gameTimeDelta;
    parsed.lastTickTime = now;
    return parsed;
  }
  // If no save, default new game
  return {
    health: 100,
    keys: [],
    location: "Central Hub",
    gameTime: 0,
    locationTimer: 120,
    timeEffect: "normal",
    awaitingAnswer: false,
    currentQuestion: null,
    visitedLocations: ["Central Hub"],
    gameActive: true,
    score: 0,
    lastTickTime: Date.now(),
    timeEffectStart: null, // --- MODIFICATION ---
  };
};

function App() {
  // Locations and portals (randomized once on mount or reset)
  const [locations, setLocations] = useState(() => {
    const locs = deepClone(initialLocations);
    randomizePortals(locs);
    return locs;
  });

  // Game State
  const [gameState, setGameState] = useState(() => getInitialGameState(locations));

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
        if (deltaTime > 10) deltaTime = 10; // Clamp max time passage to 10s
        let gameTimeDelta = deltaTime;
        const currentLocation = locations[prev.location];
        let effectActive = false;

        // --- MODIFICATION FOR 10s TIME EFFECT ---
        if (
          prev.location !== "Central Hub" &&
          prev.location !== "Treasure Vault"
        ) {
          // effectActive is true for first 10s after location entry
          effectActive =
            prev.timeEffectStart &&
            now - prev.timeEffectStart <= 10000;

          if (effectActive) {
            switch (currentLocation.timeEffect) {
              case "reverse":
                gameTimeDelta = -deltaTime;
                break;
              case "accelerated":
                gameTimeDelta = deltaTime * (currentLocation.timeModifier || 2);
                break;
              case "decelerated":
                gameTimeDelta = deltaTime * (currentLocation.timeModifier || 0.5);
                break;
              default:
                gameTimeDelta = deltaTime;
            }
          }
        }
        // --- END MODIFICATION ---

        let newGameTime = prev.gameTime + gameTimeDelta;
        let newLocationTimer = prev.locationTimer;
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
          locationTimer: newLocationTimer,
          lastTickTime: now,
        };
      });
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [gameState.gameActive, gameState.location, locations]);

  // Log helper
  const log = (msg, className = "") => {
    setLogs((lgs) => [...lgs, { msg, className }]);
  };

  // On mount: intro logs
  useEffect(() => {
    setLogs([]);
    log("🌟 ═══════════════════════════════════════════════════════════════════════════════════════════", "success");
    log("🌟 WELCOME TO TIME TRAVEL ADVENTURE! 🌟", "success");
    log("🌟 ═══════════════════════════════════════════════════════════════════════════════════════════", "success");
    log("");
    log("🎯 YOUR MISSION: Collect all 3 keys from different time-distorted locations!", "treasure");
    log("⏰ WARNING: Each location has unique time effects that will challenge you!", "warning");
    log("");
    log("💡 TIPS:", "success");
    log("• Use \"help\" to see all available commands");
    log("• Watch your location timer - you have 2 minutes per special location!");
    log("• Answer questions correctly to progress");
    log("• Collect keys to unlock the treasure vault");
    log("");
    log("🚀 Type your first command to begin your adventure!", "success");
    log("");
    enterLocation("Central Hub");
    // eslint-disable-next-line
  }, []);

  // Enter location
  function enterLocation(loc = null) {
    const currentLoc = locations[loc || gameState.location];
    log(currentLoc.welcome, "success");
    log(currentLoc.description);
    log("");

    if (loc && loc !== "Central Hub" && loc !== "Treasure Vault") {
      // --- MODIFICATION: set timeEffectStart ---
      setGameState((prev) => ({
        ...prev,
        locationTimer: LOCATION_TIME_LIMIT,
        timeEffectStart: Date.now(),
      }));
    } else if (loc === "Central Hub" || loc === "Treasure Vault") {
      setGameState((prev) => ({
        ...prev,
        timeEffectStart: null,
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
      setGameState((prev) => ({ ...prev, score: prev.score + 10000 }));
      log("🎉 CONGRATULATIONS! YOU WON! 🎉", "treasure");
      log(`🏆 VICTORY! FINAL SCORE: ${(gameState.score + 10000).toLocaleString()} POINTS!`, "treasure");
      log("You have mastered the art of time travel!", "treasure");
      showFinalStatus();
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
      log("💭 Type 'answer <your_response>' to respond.");
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
    log("⏰ TIME'S UP! ⏰", "game-over");
    log(`You ran out of time in ${gameState.location}!`, "game-over");
    log(`🏆 FINAL SCORE: ${gameState.score.toLocaleString()} POINTS`, "game-over");
    showFinalStatus();
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
    
    endGameTimeUp();
    
    log("");
    log("Thanks for playing Time Travel Adventure!", "success");
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

    const parts = value.toLowerCase().split(" ");
    const command = parts[0];
    const args = parts.slice(1).join(" ");

    switch (command) {
      case "help":
        log("🎮 COMMANDS:");
        log("• north/south/east/west - Move between locations");
        log("• treasure - Go to treasure vault (requires ALL 3 keys!)");
        log("• collect - Pick up keys");
        log("• answer <response> - Answer questions");
        log("• help - Show this help");
        log("");
        log("💡 TIP: Collect all 3 keys to unlock the treasure vault!");
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
            // --- MODIFICATION: set timeEffectStart when changing location ---
            timeEffectStart:
              (currentLocation.exits[command] !== "Central Hub" &&
                currentLocation.exits[command] !== "Treasure Vault")
                ? Date.now()
                : null,
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
      case "answer": {
        if (!gameState.awaitingAnswer) {
          log("❌ There's no question to answer right now.", "error");
          break;
        }
        const currentLoc = locations[gameState.location];
        if (args && args.toLowerCase().includes(currentLoc.answer.toLowerCase())) {
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
        break;
      }
      default:
        log(`❓ Unknown command: "${command}". Type 'help' for available commands.`, "error");
    }
  }

  // Reset Game
  function resetGame() {
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
      locationTimer: 120,
      timeEffect: "normal",
      awaitingAnswer: false,
      currentQuestion: null,
      visitedLocations: ["Central Hub"],
      gameActive: true,
      score: 0,
      lastTickTime: Date.now(),
      timeEffectStart: null,
    });
    setLogs([]);
    setInput("");
    localStorage.removeItem(GAME_STORAGE_KEY); // <--- clear save
    // Intro logs
    log("🌟 ═══════════════════════════════════════════════════════════════════════════════════════════", "success");
    log("🌟 WELCOME TO TIME TRAVEL ADVENTURE! 🌟", "success");
    log("🌟 ═══════════════════════════════════════════════════════════════════════════════════════════", "success");
    log("");
    log("🎯 YOUR MISSION: Collect all 3 keys from different time-distorted locations!", "treasure");
    log("⏰ WARNING: Each location has unique time effects that will challenge you!", "warning");
    log("");
    log("💡 TIPS:", "success");
    log("• Use \"help\" to see all available commands");
    log("• Watch your location timer - you have 2 minutes per special location!");
    log("• Answer questions correctly to progress");
    log("• Collect keys to unlock the treasure vault");
    log("");
    log("🚀 Type your first command to begin your adventure!", "success");
    log("");
    enterLocation("Central Hub");
    inputRef.current && inputRef.current.focus();
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
      <div className="header">
        <h1>🌀 TIME TRAVEL ADVENTURE 🌀</h1>
        <p>Collect keys and solve puzzles across time-warped locations!</p>
      </div>
      <div id="status-panel">
        <div className="status-item">
          <span className="status-label">🕒 Real Time:</span>
          <span className="status-value">{new Date().toLocaleTimeString()}</span>
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
          <button id="reset-button" type="button" onClick={resetGame}>
            🔄 Reset Game
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;