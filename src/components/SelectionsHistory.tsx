import React, { useState, useMemo } from 'react';
import { useGameContext } from '../context/GameContext';

interface SelectionSummary {
  round: number;
  word: string;
  playerName: string;
  playerColor: string;
  coordinates: string;
  rawCoordinates: { x: number, y: number };
  playerId: number;
}

declare global {
  interface Window {
    saveAs: (blob: Blob, filename: string) => void;
  }
}

const SelectionsHistory: React.FC = () => {
  const { gameState } = useGameContext();
  const [filter, setFilter] = useState<string>('all');
  
  // Process and organize all guesses data
  const selectionHistory = useMemo<SelectionSummary[]>(() => {
    const result: SelectionSummary[] = [];
    
    // Function to get word for a specific round
    const getWordForRound = (round: number): string => {
      // For the current round, we can use the current word
      if (round === gameState.currentRound) {
        return gameState.currentWord || '(Sin palabra asignada)';
      }
      
      // Check in word history if available
      const historyEntry = gameState.wordHistory.find(entry => entry.round === round);
      if (historyEntry) {
        return historyEntry.word;
      }
      
      // Fallback if not found in history
      return `(Palabra ronda ${round})`;
    };
    
    // Group all guesses by round
    for (const guess of gameState.guesses) {
      const player = gameState.players.find(p => p.id === guess.playerId);
      if (player) {
        result.push({
          round: guess.round,
          word: getWordForRound(guess.round),
          playerName: player.name,
          playerColor: player.color,
          coordinates: `${String.fromCharCode(65 + guess.position.y)}${guess.position.x + 1}`,
          rawCoordinates: guess.position,
          playerId: player.id
        });
      }
    }
    
    // Sort by round (descending) and then by player name
    return result.sort((a, b) => {
      if (a.round !== b.round) return b.round - a.round;
      return a.playerName.localeCompare(b.playerName);
    });
  }, [gameState.guesses, gameState.players, gameState.currentRound, gameState.currentWord, gameState.wordHistory]);
  
  // Apply filters based on selected filter option
  const filteredSelections = useMemo(() => {
    if (filter === 'all') {
      return selectionHistory;
    } else if (filter === 'current') {
      return selectionHistory.filter(s => s.round === gameState.currentRound);
    } else {
      // Filter by player ID
      const playerId = parseInt(filter);
      return selectionHistory.filter(s => s.playerId === playerId);
    }
  }, [selectionHistory, filter, gameState.currentRound]);
  
  // Export data to CSV
  const exportToCSV = () => {
    try {
      // Prepare CSV header and data
      const headers = ['Ronda', 'Palabra', 'Jugador', 'Coordenadas', 'X', 'Y'];
      const data = filteredSelections.map(selection => [
        selection.round,
        selection.word,
        selection.playerName,
        selection.coordinates,
        selection.rawCoordinates.x + 1, // Add 1 to match display format
        String.fromCharCode(65 + selection.rawCoordinates.y) // Convert to letter
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');
      
      // Create blob and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      window.saveAs(blob, `hues-and-cues-selections-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Ocurrió un error al exportar los datos. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Comprobar si hay palabras en el historial
  const missingWords = useMemo(() => {
    // Obtener todas las rondas
    const rounds = Array.from(new Set(gameState.guesses.map(g => g.round)));
    
    // Comprobar cuántas rondas tienen palabra en el historial
    const roundsWithWord = gameState.wordHistory.map(h => h.round);
    
    return rounds.length - roundsWithWord.length;
  }, [gameState.guesses, gameState.wordHistory]);
  
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Historial de Selecciones</h2>
      
      <div className="p-3 mb-4 bg-blue-50 border border-blue-100 rounded-md">
        <p className="text-sm text-blue-700">
          Visualiza todas las selecciones realizadas durante la partida.
        </p>
        {missingWords > 0 && (
          <p className="text-xs text-amber-700 mt-2">
            Nota: Hay {missingWords} {missingWords === 1 ? 'ronda' : 'rondas'} sin información de palabra guardada.
          </p>
        )}
      </div>
      
      {/* Filter controls */}
      <div className="mb-4">
        <label htmlFor="filter-selections" className="block text-sm font-medium text-gray-600 mb-1">
          Filtrar selecciones:
        </label>
        <select
          id="filter-selections"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
        >
          <option value="all">Todas las selecciones</option>
          <option value="current">Solo ronda actual ({gameState.currentRound})</option>
          {gameState.players.map(player => (
            <option key={player.id} value={player.id.toString()}>
              Solo jugador: {player.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Export button */}
      <div className="mb-4">
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar a CSV
        </button>
      </div>
      
      {/* Selections table */}
      {filteredSelections.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ronda
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Palabra
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jugador
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordenadas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSelections.map((selection, index) => (
                <tr key={`${selection.playerId}-${selection.round}-${index}`} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {selection.round}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                    {selection.word}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                        style={{ backgroundColor: selection.playerColor }}
                      />
                      <span className="text-gray-800 truncate">{selection.playerName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center font-mono text-gray-600">
                    {selection.coordinates}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-gray-500 text-sm">No hay selecciones para mostrar.</p>
        </div>
      )}
    </div>
  );
};

export default SelectionsHistory; 