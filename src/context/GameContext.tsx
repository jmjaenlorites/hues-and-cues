import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';

// Define types
export interface Player {
  id: number;
  name: string;
  color: string;
}

export interface Guess {
  playerId: number;
  position: { x: number, y: number };
  round: number;
}

export interface GameState {
  players: Player[];
  currentRound: number;
  currentWord: string;
  guesses: Guess[];
  scores: { playerId: number, score: number }[];
  gamePhase: 'setup' | 'guessing' | 'scoring' | 'end';
  averagePosition: { x: number, y: number } | null;
  words: string[];
  maxRounds: number;
  wordHistory: { round: number; word: string }[];
}

// Game state initial values
const initialState: GameState = {
  players: [],
  currentRound: 1,
  currentWord: '',
  guesses: [],
  scores: [],
  gamePhase: 'setup',
  averagePosition: null,
  words: [],
  maxRounds: 5, // Número máximo predeterminado de rondas
  wordHistory: [], // Inicialmente vacío
};

// Action types
type GameAction =
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: number }
  | { type: 'ADD_GUESS'; payload: { playerId: number, position: { x: number, y: number } } }
  | { type: 'UPDATE_SCORES' }
  | { type: 'CALCULATE_FINAL_SCORES' }
  | { type: 'NEXT_PHASE' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_WORDS'; payload: string[] }
  | { type: 'SET_CURRENT_WORD'; payload: string }
  | { type: 'SET_MAX_ROUNDS'; payload: number };

// Helper function to calculate distance between two points on the board
const calculateDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }): number => {
  // Manhattan distance for grid-based movement
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
};

// Calculate average position from guesses
const calculateAveragePosition = (guesses: Guess[]): { x: number, y: number } => {
  if (guesses.length === 0) return { x: 0, y: 0 };
  
  const sumX = guesses.reduce((sum, guess) => sum + guess.position.x, 0);
  const sumY = guesses.reduce((sum, guess) => sum + guess.position.y, 0);
  
  return {
    x: Math.round(sumX / guesses.length),
    y: Math.round(sumY / guesses.length)
  };
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload],
        scores: [...state.scores, { playerId: action.payload.id, score: 0 }],
      };
    
    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(player => player.id !== action.payload),
        scores: state.scores.filter(score => score.playerId !== action.payload),
      };
    
    case 'ADD_GUESS':
      // Verificar si el jugador ya ha hecho una selección para esta ronda
      const playerHasGuessed = state.guesses.some(
        g => g.playerId === action.payload.playerId && g.round === state.currentRound
      );
      
      if (playerHasGuessed) {
        // Actualizar la selección existente
        return {
          ...state,
          guesses: state.guesses.map(g => 
            g.playerId === action.payload.playerId && g.round === state.currentRound
              ? { ...g, position: action.payload.position }
              : g
          )
        };
      } else {
        // Añadir nueva selección
        return {
          ...state,
          guesses: [
            ...state.guesses, 
            { 
              ...action.payload, 
              round: state.currentRound 
            }
          ],
        };
      }
    
    case 'UPDATE_SCORES':
      // Calcular posición media para la fase de puntuación
      console.log("Actualizando posición media para la ronda", state.currentRound);
      const currentRoundGuesses = state.guesses.filter(g => g.round === state.currentRound);
      
      // Si no hay suficientes selecciones y hay más de un jugador, no actualizar
      if (currentRoundGuesses.length < 1 || (state.players.length > 1 && currentRoundGuesses.length < 2)) {
        console.warn("No hay suficientes selecciones para calcular la media");
        return state;
      }
      
      // Calcular la posición media (o usar la única selección si solo hay un jugador)
      const avgPosition = currentRoundGuesses.length === 1 
        ? currentRoundGuesses[0].position 
        : calculateAveragePosition(currentRoundGuesses);
      
      console.log("Posición media calculada:", avgPosition);
      console.log("Cambiando a fase de scoring...");
      
      // Importante: garantizar que cambiamos a fase 'scoring'
      return {
        ...state,
        averagePosition: avgPosition,
        gamePhase: 'scoring',
      };
    
    case 'CALCULATE_FINAL_SCORES':
      // Calcular puntuaciones para todas las rondas al final del juego
      let roundGuesses: { [round: number]: Guess[] } = {};
      let roundAvgPositions: { [round: number]: { x: number, y: number } } = {};
      let finalScores = state.players.map(player => ({ playerId: player.id, score: 0 }));
      
      // Agrupar selecciones por ronda
      state.guesses.forEach(guess => {
        if (!roundGuesses[guess.round]) {
          roundGuesses[guess.round] = [];
        }
        roundGuesses[guess.round].push(guess);
      });
      
      // Calcular posición media para cada ronda
      Object.keys(roundGuesses).forEach(roundStr => {
        const round = parseInt(roundStr);
        const guesses = roundGuesses[round];
        if (guesses.length >= 2) { // Solo calcular si hay al menos 2 selecciones
          roundAvgPositions[round] = calculateAveragePosition(guesses);
        }
      });
      
      // Calcular puntos para cada jugador en cada ronda
      Object.keys(roundAvgPositions).forEach(roundStr => {
        const round = parseInt(roundStr);
        const avgPosition = roundAvgPositions[round];
        const guesses = roundGuesses[round];
        
        guesses.forEach(guess => {
          const distance = calculateDistance(avgPosition, guess.position);
          let pointsEarned = 0;
          
          // Calcular puntos basados en la distancia a la media
          if (distance === 0) {
            pointsEarned = 3; // Exacto
          } else if (distance === 1) {
            pointsEarned = 2; // Adyacente
          } else if (distance === 2) {
            pointsEarned = 1; // Cercano
          }
          
          const scoreIndex = finalScores.findIndex(s => s.playerId === guess.playerId);
          if (scoreIndex !== -1) {
            finalScores[scoreIndex].score += pointsEarned;
          }
        });
      });
      
      return {
        ...state,
        scores: finalScores,
        gamePhase: 'end',
      };
    
    case 'NEXT_PHASE':
      let nextPhase: GameState['gamePhase'] = 'setup';
      
      switch (state.gamePhase) {
        case 'setup':
          nextPhase = 'guessing';
          
          // Agregar la palabra actual al historial al iniciar la primera ronda
          let updatedWordHistory = [...state.wordHistory];
          
          // Comprobar si ya existe esta ronda en el historial
          const existingIndex = updatedWordHistory.findIndex(entry => entry.round === state.currentRound);
          if (existingIndex === -1 && state.currentWord) {
            updatedWordHistory.push({
              round: state.currentRound,
              word: state.currentWord
            });
          }
          
          console.log("Cambiando a fase de guessing con palabra:", state.currentWord);
          return {
            ...state,
            gamePhase: nextPhase,
            wordHistory: updatedWordHistory
          };
          
        case 'guessing':
          nextPhase = 'scoring';
          break;
        case 'scoring':
          // Si hemos llegado al máximo de rondas, pasar a la fase final
          if (state.currentRound >= state.maxRounds) {
            nextPhase = 'end';
          } else {
            // Pasar a la siguiente ronda
            nextPhase = 'guessing';
          }
          break;
        default:
          nextPhase = 'setup';
      }
      
      console.log("Cambiando fase de", state.gamePhase, "a", nextPhase);
      return {
        ...state,
        gamePhase: nextPhase,
      };
    
    case 'NEXT_ROUND':
      // Seleccionar una nueva palabra aleatoria del array de palabras
      console.log("Pasando a la siguiente ronda");
      let nextWord = '';
      if (state.words.length > 0) {
        const randomIndex = Math.floor(Math.random() * state.words.length);
        nextWord = state.words[randomIndex];
      }
      
      // Guardar la palabra actual en el historial antes de cambiar de ronda
      const updatedWordHistory = [
        ...state.wordHistory,
        { round: state.currentRound, word: state.currentWord }
      ];
      
      return {
        ...state,
        currentRound: state.currentRound + 1,
        currentWord: nextWord,
        averagePosition: null,
        gamePhase: 'guessing',
        wordHistory: updatedWordHistory,
      };
    
    case 'RESET_GAME':
      return {
        ...initialState,
        players: state.players,
        scores: state.players.map(player => ({ playerId: player.id, score: 0 })),
        words: state.words,
        maxRounds: state.maxRounds,
        wordHistory: [],
      };
    
    case 'SET_WORDS':
      // Seleccionar una palabra inicial aleatoria del array de palabras
      let initialWord = '';
      if (action.payload.length > 0) {
        const randomIndex = Math.floor(Math.random() * action.payload.length);
        initialWord = action.payload[randomIndex];
        console.log("SET_WORDS: Seleccionando palabra inicial:", initialWord);
      }
      
      // Si estamos en la primera ronda, guardar también en el historial
      let initialWordHistory = state.wordHistory;
      if (state.currentRound === 1 && initialWord && state.wordHistory.length === 0) {
        initialWordHistory = [{ round: 1, word: initialWord }];
        console.log("SET_WORDS: Guardando palabra inicial en historial:", initialWord);
      }
      
      return {
        ...state,
        words: action.payload,
        currentWord: initialWord,
        wordHistory: initialWordHistory
      };
    
    case 'SET_CURRENT_WORD':
      // Al establecer la palabra, también la añadimos al historial si estamos en una ronda activa
      let wordHistoryUpdate = state.wordHistory;
      
      // Solo añadir al historial si no estamos en setup y la palabra es nueva
      if (state.gamePhase !== 'setup' && action.payload !== state.currentWord) {
        // Verificar si ya existe una entrada para esta ronda
        const existingEntry = state.wordHistory.findIndex(entry => entry.round === state.currentRound);
        
        if (existingEntry >= 0) {
          // Actualizar la entrada existente
          wordHistoryUpdate = state.wordHistory.map(entry => 
            entry.round === state.currentRound ? { ...entry, word: action.payload } : entry
          );
        } else {
          // Añadir nueva entrada
          wordHistoryUpdate = [...state.wordHistory, { round: state.currentRound, word: action.payload }];
        }
      }
      
      return {
        ...state,
        currentWord: action.payload,
        wordHistory: wordHistoryUpdate,
      };
    
    case 'SET_MAX_ROUNDS':
      return {
        ...state,
        maxRounds: action.payload,
      };
    
    default:
      return state;
  }
};

// Generate a random color for a player
const getRandomPlayerColor = (): string => {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A8', 
    '#A833FF', '#33FFF5', '#FF8C33', '#BCFF33',
    '#FFD133', '#FF33D1', '#33FFAE', '#3390FF'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Create context
interface GameContextType {
  gameState: GameState;
  addPlayer: (name: string) => void;
  removePlayer: (id: number) => void;
  addGuess: (playerId: number, x: number, y: number) => void;
  updateScores: () => void;
  calculateFinalScores: () => void;
  nextPhase: () => void;
  nextRound: () => void;
  resetGame: () => void;
  setWords: (words: string[]) => void;
  setCurrentWord: (word: string) => void;
  setMaxRounds: (rounds: number) => void;
  loadWords: () => Promise<void>;
  haveAllPlayersGuessed: () => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Helper to load words from CSV
const loadClueWordsFromCSV = async (): Promise<string[]> => {
  try {
    const response = await fetch('/data/clue-words.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // Omitir encabezado y extraer solo las palabras (segunda columna)
    const words = lines.slice(1)
      .map(line => {
        const values = line.split(',');
        return values[1] || ''; // Tomar la segunda columna (índice 1)
      })
      .filter(word => word.trim() !== ''); // Filtrar valores vacíos
    
    return words;
  } catch (error) {
    console.error('Error loading clue words:', error);
    // Palabras de respaldo en caso de error
    return ['rojo', 'azul', 'verde', 'amarillo', 'naranja', 'morado', 'rosa', 'turquesa'];
  }
};

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [localState, setLocalState] = useState<GameState | null>(null);
  
  // Declarar loadWords antes de usarlo
  const loadWords = useCallback(async (): Promise<void> => {
    try {
      console.log("Cargando palabras...");
      const words = await loadClueWordsFromCSV();
      console.log(`Cargadas ${words.length} palabras`);
      
      // Garantizar que hay al menos algunas palabras
      if (words.length === 0) {
        console.warn("No se cargaron palabras, usando palabras por defecto");
        setWords(['rojo', 'azul', 'verde', 'amarillo', 'naranja', 'morado', 'rosa', 'turquesa']);
      } else {
        setWords(words);
      }
    } catch (error) {
      console.error('Error loading words:', error);
      setWords(['rojo', 'azul', 'verde', 'amarillo', 'naranja', 'morado', 'rosa', 'turquesa']);
    }
  }, []);
  
  // Dentro de useEffect para cargar estado
  useEffect(() => {
    // Intentar cargar estado guardado
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setLocalState(parsedState);
      } catch (e) {
        console.error('Error loading saved state:', e);
        // Cargar palabras por defecto si hay un error
        loadWords();
      }
    } else {
      // Si no hay estado guardado, cargar palabras
      loadWords();
    }
  }, [loadWords]);
  
  // Guardar estado cuando cambia
  useEffect(() => {
    if (state.players.length > 0 || state.currentRound > 1) {
      localStorage.setItem('gameState', JSON.stringify(state));
    }
  }, [state]);
  
  // Restaurar estado completo después de cargar words y maxRounds
  useEffect(() => {
    if (localState) {
      console.log("Restaurando estado guardado...");
      
      // Asegurarnos de que hay palabras
      if (!state.words || state.words.length === 0) {
        console.log("No hay palabras en el estado, cargando palabras de respaldo");
        loadWords();
        return;
      }
      
      // Asegurarnos de que hay una palabra actual
      if (!localState.currentWord && state.words.length > 0) {
        const randomIndex = Math.floor(Math.random() * state.words.length);
        localState.currentWord = state.words[randomIndex];
        console.log("Seleccionada palabra aleatoria:", localState.currentWord);
      }
      
      // Inicializar el nuevo estado con la configuración actual
      const newState: GameState = {
        ...localState,
        words: state.words.length > 0 ? state.words : localState.words,
        maxRounds: state.maxRounds || localState.maxRounds || 5
      };
      
      // Limpiar localState para no volver a restaurar
      setLocalState(null);
      
      // Guardar el estado restaurado
      localStorage.setItem('gameState', JSON.stringify(newState));
      
      // Para cada propiedad del estado, actualizamos el estado actual
      Object.entries(newState).forEach(([key, value]) => {
        if (key === 'words') {
          dispatch({ type: 'SET_WORDS', payload: value });
        } else if (key === 'maxRounds') {
          dispatch({ type: 'SET_MAX_ROUNDS', payload: value });
        } else if (key === 'currentWord' && value) {
          dispatch({ type: 'SET_CURRENT_WORD', payload: value });
        }
      });
      
      // Actualizamos también los jugadores y la fase actual
      if (newState.players && newState.players.length > 0) {
        newState.players.forEach(player => {
          dispatch({ type: 'ADD_PLAYER', payload: player });
        });
      }
      
      // Si hay alguna fase guardada que no sea setup, la restauramos
      if (newState.gamePhase && newState.gamePhase !== 'setup') {
        // Aquí podrías restaurar la fase actual si es necesario
        console.log("Restaurando fase:", newState.gamePhase);
      }
    }
  }, [localState, state.words, state.maxRounds, loadWords]);
  
  // Definir los métodos restantes después de loadWords
  const addPlayer = useCallback((name: string) => {
    if (name.trim()) {
      const newId = state.players.length > 0 
        ? Math.max(...state.players.map(p => p.id)) + 1 
        : 1;
      dispatch({
        type: 'ADD_PLAYER',
        payload: {
          id: newId,
          name: name.trim(),
          color: getRandomPlayerColor()
        }
      });
    }
  }, [state.players]);
  
  const removePlayer = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: id });
  }, []);
  
  const addGuess = useCallback((playerId: number, x: number, y: number) => {
    dispatch({
      type: 'ADD_GUESS',
      payload: {
        playerId,
        position: { x, y }
      }
    });
  }, []);
  
  const updateScores = useCallback(() => {
    dispatch({ type: 'UPDATE_SCORES' });
  }, []);
  
  const calculateFinalScores = useCallback(() => {
    dispatch({ type: 'CALCULATE_FINAL_SCORES' });
  }, []);
  
  const nextPhase = useCallback(() => {
    dispatch({ type: 'NEXT_PHASE' });
  }, []);
  
  const nextRound = useCallback(() => {
    dispatch({ type: 'NEXT_ROUND' });
  }, []);
  
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);
  
  const setWords = useCallback((words: string[]) => {
    dispatch({ type: 'SET_WORDS', payload: words });
  }, []);
  
  const setCurrentWord = useCallback((word: string) => {
    dispatch({ type: 'SET_CURRENT_WORD', payload: word });
  }, []);
  
  const setMaxRounds = useCallback((rounds: number) => {
    dispatch({ type: 'SET_MAX_ROUNDS', payload: rounds });
  }, []);
  
  const haveAllPlayersGuessed = (): boolean => {
    const currentRoundGuesses = state.guesses.filter(g => g.round === state.currentRound);
    
    // Si solo hay un jugador, verificar que haya hecho al menos una selección
    if (state.players.length === 1) {
      return currentRoundGuesses.some(g => g.playerId === state.players[0].id);
    }
    
    // Si hay múltiples jugadores, verificar que todos hayan hecho su selección
    return currentRoundGuesses.length >= state.players.length;
  };
  
  const contextValue: GameContextType = {
    gameState: state,
    addPlayer,
    removePlayer,
    addGuess,
    updateScores,
    calculateFinalScores,
    nextPhase,
    nextRound,
    resetGame,
    setWords,
    setCurrentWord,
    setMaxRounds,
    loadWords,
    haveAllPlayersGuessed
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook for using the game context
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}; 