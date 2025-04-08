import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

const PlayerSetup: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [numRounds, setNumRounds] = useState(5);
  const { gameState, addPlayer, removePlayer, nextPhase, setMaxRounds, setCurrentWord } = useGameContext();
  
  // Asegurarse de que siempre haya una palabra seleccionada
  useEffect(() => {
    // Si no hay una palabra seleccionada y hay palabras disponibles, seleccionar una aleatoria
    if (!gameState.currentWord && gameState.words.length > 0) {
      console.log("Seleccionando palabra inicial...");
      const randomIndex = Math.floor(Math.random() * gameState.words.length);
      setCurrentWord(gameState.words[randomIndex]);
    }
  }, [gameState.currentWord, gameState.words, setCurrentWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      addPlayer(playerName.trim());
      setPlayerName('');
    }
  };
  
  const handleStartGame = () => {
    // Guardar el número de rondas
    setMaxRounds(numRounds);
    
    // Asegurarnos de que hay una palabra seleccionada
    if (!gameState.currentWord && gameState.words.length > 0) {
      const randomIndex = Math.floor(Math.random() * gameState.words.length);
      setCurrentWord(gameState.words[randomIndex]);
    }
    
    // Iniciar el juego solo si hay al menos un jugador
    if (gameState.players.length > 0) {
      console.log("Iniciando juego con palabra:", gameState.currentWord);
      nextPhase(); // Cambiar de setup a guessing
    } else {
      alert("¡Añade al menos un jugador para empezar!");
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Configuración de Jugadores</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Jugador
          </label>
          <div className="flex">
            <input
              type="text"
              id="player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-grow px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Escribe un nombre..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Añadir
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="num-rounds" className="block text-sm font-medium text-gray-700 mb-1">
            Número de rondas
          </label>
          <input
            type="number"
            id="num-rounds"
            min="1"
            max="10"
            value={numRounds}
            onChange={(e) => setNumRounds(parseInt(e.target.value) || 5)}
            className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </form>
      
      {/* Lista de jugadores agregados */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Jugadores ({gameState.players.length})</h3>
        
        {gameState.players.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No hay jugadores aún. Añade al menos uno para comenzar.</p>
        ) : (
          <ul className="space-y-2">
            {gameState.players.map(player => (
              <li key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-gray-800 text-sm">{player.name}</span>
                </div>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  aria-label="Eliminar jugador"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <button
        onClick={handleStartGame}
        disabled={gameState.players.length === 0}
        className={`w-full py-2.5 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          gameState.players.length > 0
            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Comenzar Juego
      </button>
      
      {/* Mensaje aclaratorio */}
      <p className="mt-2 text-xs text-gray-500 text-center">
        {gameState.players.length > 0 
          ? `Comenzar con ${gameState.players.length} ${gameState.players.length === 1 ? 'jugador' : 'jugadores'} y ${numRounds} ${numRounds === 1 ? 'ronda' : 'rondas'}.`
          : "Añade al menos un jugador para comenzar."}
      </p>
    </div>
  );
};

export default PlayerSetup; 