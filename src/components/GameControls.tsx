import React from 'react';
import { useGameContext } from '../context/GameContext';

const GameControls: React.FC = () => {
  const { gameState, resetGame, nextRound, calculateFinalScores } = useGameContext();
  
  // Helper to get phase name in Spanish
  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'setup': return 'Configuración';
      case 'guessing': return 'Adivinanza';
      case 'scoring': return 'Resultados';
      case 'end': return 'Fin del Juego';
      default: return phase;
    }
  };
  
  // Manejar paso a siguiente ronda o cálculo de puntuaciones finales
  const handleNextAction = () => {
    console.log("Manejando siguiente acción desde GameControls");
    try {
      if (gameState.currentRound >= gameState.maxRounds) {
        // Calcular puntuaciones finales
        console.log("GameControls: Calculando puntuaciones finales...");
        calculateFinalScores();
      } else {
        // Pasar a la siguiente ronda
        console.log("GameControls: Pasando a ronda", gameState.currentRound + 1);
        nextRound();
      }
    } catch (error) {
      console.error("Error al ejecutar acción en GameControls:", error);
    }
  };
  
  // Only show actual game controls if there are players and not in setup phase
  if (gameState.players.length === 0 || gameState.gamePhase === 'setup') {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-700 mb-2">Estado del Juego</h2>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <div className="text-gray-500 font-medium">Ronda:</div>
          <div className="text-gray-700">{gameState.currentRound} / {gameState.maxRounds}</div>
          
          <div className="text-gray-500 font-medium">Fase:</div>
          <div className="text-gray-700">{getPhaseLabel(gameState.gamePhase)}</div>
          
          <div className="text-gray-500 font-medium">Palabra:</div>
          <div className="text-gray-700 font-medium">{gameState.currentWord || '-'}</div>
        </div>
      </div>
      
      {/* Game action buttons based on phase */}
      <div className="space-y-2 border-t border-gray-200 pt-4 mt-4">
        {gameState.gamePhase === 'scoring' && (
          <button
            onClick={handleNextAction}
            className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {gameState.currentRound >= gameState.maxRounds ? 'Ver Resultados Finales' : 'Siguiente Ronda'}
          </button>
        )}
        
        <button
          onClick={resetGame}
          className="w-full py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Reiniciar Partida
        </button>
      </div>
      
      {/* Show current scores */}
      {gameState.players.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-base font-medium text-gray-700 mb-2">Puntuaciones</h3>
          <div className="space-y-1.5 text-sm max-h-48 overflow-y-auto">
            {gameState.players
              .map(player => ({
                ...player,
                score: gameState.scores.find(s => s.playerId === player.id)?.score || 0
              }))
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div key={player.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-gray-400 w-5 mr-1 text-xs">{index + 1}.</span>
                    <div 
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="text-gray-700 truncate">{player.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{player.score} pts</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls; 