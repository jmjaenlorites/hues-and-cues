import React, { useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import SelectionsHistory from './SelectionsHistory';

const EndGame: React.FC = () => {
  const { gameState, resetGame, calculateFinalScores } = useGameContext();
  const [showSelections, setShowSelections] = React.useState(false);

  // Asegurarse de que las puntuaciones finales se hayan calculado
  useEffect(() => {
    if (gameState.gamePhase === 'end' && gameState.scores.some(s => s.score === 0)) {
      console.log("Calculando puntuaciones finales en EndGame");
      calculateFinalScores();
    }
  }, [gameState.gamePhase, gameState.scores, calculateFinalScores]);

  // Ordenar jugadores por puntuación
  const sortedPlayers = [...gameState.players]
    .map(player => ({
      ...player,
      score: gameState.scores.find(s => s.playerId === player.id)?.score || 0
    }))
    .sort((a, b) => b.score - a.score);

  console.log("Renderizando EndGame con scores:", gameState.scores);

  // Si se muestra el historial de selecciones, retornar el componente
  if (showSelections) {
    return (
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Historial de Selecciones</h2>
          <button 
            onClick={() => setShowSelections(false)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Volver a resultados
          </button>
        </div>
        
        <SelectionsHistory />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">¡Fin del Juego!</h2>
      
      <div className="p-3 mb-5 bg-green-50 border border-green-100 rounded-md">
        <p className="text-sm text-green-700">
          <span className="font-medium">🏆 ¡Partida completada!</span> El juego ha terminado tras {gameState.currentRound} rondas.
        </p>
      </div>
      
      <div className="mb-5">
        <h3 className="text-base font-medium text-gray-700 mb-2">Clasificación Final</h3>
        <div className="space-y-1.5">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-md border ${ 
                index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div 
                  className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 text-white text-xs font-bold ${ 
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-400' : 'bg-gray-300' // Adjusted bronze color
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-medium text-gray-800 text-sm truncate">{player.name}</span>
                </div>
              </div>
              <div className={`font-semibold text-sm ${ index === 0 ? 'text-yellow-700' : 'text-gray-800'}`}>{player.score} pts</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={resetGame}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Jugar de Nuevo
        </button>
        
        <button
          onClick={() => setShowSelections(true)}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ver Historial de Selecciones
        </button>
        
        <p className="text-xs text-gray-500 text-center italic">
          (Mismos jugadores, nuevas palabras)
        </p>
      </div>
      
      {/* Optional Stats Section */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Estadísticas</h3>
        <ul className="text-xs text-gray-500 space-y-0.5">
          <li>Rondas jugadas: {gameState.currentRound}</li>
          <li>Jugadores: {gameState.players.length}</li>
          <li>
            Puntuación media por jugador: {
              Math.round(sortedPlayers.reduce((sum, p) => sum + p.score, 0) / sortedPlayers.length * 10) / 10 || 0
            } pts
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EndGame; 