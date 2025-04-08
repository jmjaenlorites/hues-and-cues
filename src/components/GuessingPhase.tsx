import React from 'react';
import { useGameContext } from '../context/GameContext';

const GuessingPhase: React.FC = () => {
  const { gameState, updateScores, haveAllPlayersGuessed } = useGameContext();
  
  // Check if all players have made their guess for the current round
  const allPlayersGuessed = haveAllPlayersGuessed();
  
  // Get current round guesses
  const currentRoundGuesses = gameState.guesses.filter(g => g.round === gameState.currentRound);
  
  // Proceed to see round results (without calculating scores yet)
  const handleViewResults = () => {
    console.log("Mostrando resultados de la ronda...");
    try {
      // Usar solo updateScores que ya incluye el cambio de fase a 'scoring'
      updateScores();
      
      // Forzar una actualización de la interfaz
      setTimeout(() => {
        console.log("Estado después de mostrar resultados:", gameState.gamePhase);
      }, 100);
    } catch (error) {
      console.error("Error al mostrar resultados:", error);
    }
  };
  
  console.log("Renderizando GuessingPhase con palabra:", gameState.currentWord);
  
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Adivinanza</h2>
      
      <div className="p-3 mb-4 bg-blue-50 border border-blue-100 rounded-md">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Instrucciones:</span> Cada jugador debe seleccionar las coordenadas (ej. A1) del color que mejor coincida con la palabra.
        </p>
      </div>
      
      {/* Show the current word - Mejor destacado */}
      <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-md text-center">
        <h3 className="text-sm font-medium mb-1 text-indigo-600">Palabra de la ronda:</h3>
        <p className="text-2xl font-bold text-indigo-800">{gameState.currentWord}</p>
        <p className="text-xs text-indigo-500 mt-1">
          Ronda {gameState.currentRound} / {gameState.maxRounds}
        </p>
      </div>
      
      {/* Show status of players who have guessed */}
      <div className="mb-5">
        <h3 className="text-base font-medium text-gray-700 mb-2">Estado de selecciones:</h3>
        <div className="space-y-1.5">
          {gameState.players.map(player => {
            const hasGuessed = currentRoundGuesses.some(g => g.playerId === player.id);
            const playerGuess = currentRoundGuesses.find(g => g.playerId === player.id);
            
            return (
              <div key={player.id} className="flex items-center justify-between text-sm px-3 py-1.5 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-gray-800">{player.name}</span>
                </div>
                {hasGuessed ? (
                  <div className="flex items-center">
                    {playerGuess && (
                      <span className="font-mono text-gray-600 text-xs mr-1">
                        {String.fromCharCode(65 + playerGuess.position.y)}
                        {playerGuess.position.x + 1}
                      </span>
                    )}
                    <span className="text-green-600 font-medium">✓</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs italic">Pendiente</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Botón principal para ver resultados - Habilitado para un jugador */}
      <button
        onClick={handleViewResults}
        disabled={!allPlayersGuessed}
        className="w-full py-2.5 mt-4 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {allPlayersGuessed 
          ? 'Ver resultados de la ronda' 
          : 'Esperando selecciones...'}
      </button>
    </div>
  );
};

export default GuessingPhase; 