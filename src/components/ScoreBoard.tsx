import React, { useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

const ScoreBoard: React.FC = () => {
  const { gameState, nextRound, calculateFinalScores } = useGameContext();
  
  // Ejecutar acción al montar para verificar que estamos en la fase correcta
  useEffect(() => {
    console.log("ScoreBoard montado, fase:", gameState.gamePhase);
  }, [gameState.gamePhase]);
  
  // Ordenar jugadores por sus selecciones
  const playersWithGuesses = gameState.players.map(player => {
    const playerGuess = gameState.guesses.find(g => 
      g.playerId === player.id && g.round === gameState.currentRound
    );
    
    return {
      ...player,
      guess: playerGuess
    };
  });
  
  // Obtener las adivinanzas de la ronda actual
  const currentRoundGuesses = gameState.guesses.filter(g => g.round === gameState.currentRound);
  
  // Calcular distancia para la visualización (solo visualización, no puntuación real)
  const getDistanceFromAverage = (guessId: number) => {
    if (!gameState.averagePosition) return '-';
    
    const guess = currentRoundGuesses.find(g => g.playerId === guessId);
    if (!guess) return '-';
    
    const distance = Math.abs(guess.position.x - gameState.averagePosition.x) + 
                     Math.abs(guess.position.y - gameState.averagePosition.y);
    return distance;
  };
  
  // Pasar a la siguiente ronda o al final del juego
  const handleNextRound = () => {
    console.log("Manejando paso a siguiente ronda desde ScoreBoard...");
    try {
      if (gameState.currentRound >= gameState.maxRounds) {
        // Calcular puntuaciones al final del juego
        console.log("Última ronda completada, calculando puntuaciones finales...");
        calculateFinalScores();
      } else {
        // Pasar a la siguiente ronda sin calcular puntuaciones
        console.log("Pasando a la ronda", (gameState.currentRound + 1));
        nextRound();
        // Forzar una actualización de la interfaz
        setTimeout(() => {
          console.log("Estado después de siguiente ronda:", gameState.gamePhase);
        }, 100);
      }
    } catch (error) {
      console.error("Error al pasar a la siguiente ronda:", error);
      alert("Error al pasar a la siguiente ronda. Por favor, inténtalo de nuevo.");
    }
  };
  
  console.log("Renderizando ScoreBoard, fase:", gameState.gamePhase, "ronda:", gameState.currentRound, "palabra:", gameState.currentWord);
  
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Resultados de la Ronda</h2>
      
      <div className="p-3 mb-4 bg-blue-50 border border-blue-100 rounded-md">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Ronda {gameState.currentRound}/{gameState.maxRounds}</span>
        </p>
        <p className="text-sm font-medium text-blue-800 mt-1">
          Palabra: "{gameState.currentWord}"
        </p>
      </div>
      
      {/* Mostrar la posición media */}
      {gameState.averagePosition && (
        <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-200">
          <h3 className="text-sm font-medium text-green-700 mb-1">Coordenada Media:</h3>
          <div className="flex items-center">
            <div className="text-lg font-semibold font-mono text-green-800">
              {String.fromCharCode(65 + gameState.averagePosition.y)}
              {gameState.averagePosition.x + 1}
            </div>
            <p className="ml-3 text-xs text-green-600">
              Punto promedio de las selecciones.
            </p>
          </div>
        </div>
      )}
      
      {/* Tabla de selecciones de la ronda actual */}
      <div className="mb-5">
        <h3 className="text-base font-medium text-gray-700 mb-2">Selecciones de esta ronda:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugador</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Selección</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Distancia</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playersWithGuesses.map(player => {
                const distance = getDistanceFromAverage(player.id);
                
                return (
                  <tr key={player.id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                          style={{ backgroundColor: player.color }}
                        />
                        <span className="text-gray-800 truncate">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center font-mono text-gray-600">
                      {player.guess ? (
                        <span className="font-mono">
                          {String.fromCharCode(65 + player.guess.position.y)}
                          {player.guess.position.x + 1}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      {distance !== '-' ? (
                        <span 
                          className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            distance === 0 ? 'bg-green-100 text-green-800' : 
                            distance === 1 ? 'bg-blue-100 text-blue-800' :
                            distance === 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {distance}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Nota explicativa */}
      <div className="mb-5 p-3 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Nota:</span> Las puntuaciones se calcularán al final de todas las rondas.
          <br />
          Distancia 0 = 3 pts, Distancia 1 = 2 pts, Distancia 2 = 1 pt.
        </p>
      </div>
      
      {/* Botón para pasar a la siguiente ronda */}
      <button
        onClick={handleNextRound}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {gameState.currentRound >= gameState.maxRounds 
          ? 'Finalizar juego y calcular puntuaciones' 
          : 'Siguiente ronda'}
      </button>
    </div>
  );
};

export default ScoreBoard; 