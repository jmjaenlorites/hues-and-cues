import React, { useRef, useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

const BOARD_WIDTH = 30;
const BOARD_HEIGHT = 16;

// Ajustes para el posicionamiento correcto en la imagen real
// Estos valores representan los márgenes del grid de colores dentro de la imagen
// Calibrados basándose en la imagen real del tablero
const GRID_OFFSET_X = 10; // % de margen horizontal desde los bordes de la imagen
const GRID_OFFSET_Y = 36.4; // % de margen vertical desde los bordes de la imagen
const GRID_WIDTH = 80.5; // % de ancho que ocupa el grid de colores en la imagen
const GRID_HEIGHT = 38.3; // % de alto que ocupa el grid de colores en la imagen

// Para evitar el error de process.env
const IS_DEBUG = false; // Cambiar a true para habilitar logs de depuración

const GameBoard: React.FC = () => {
  const { gameState, addGuess } = useGameContext();
  const [inputCoord, setInputCoord] = useState({ col: '', row: '' });
  const boardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({ loaded: false });

  // Monitorear cuando la imagen del tablero se carga completamente
  useEffect(() => {
    const updateBoardDimensions = () => {
      if (imgRef.current) {
        setBoardDimensions({
          loaded: true
        });
        console.log("Imagen del tablero cargada");
      }
    };

    // Intentar obtener dimensiones inicialmente por si la imagen ya estaba cargada
    if (imgRef.current && imgRef.current.complete) {
      updateBoardDimensions();
    }

    // Listener para cuando la imagen termine de cargar
    const imgElement = imgRef.current;
    if (imgElement) {
      imgElement.addEventListener('load', updateBoardDimensions);
    }

    return () => {
      if (imgElement) {
        imgElement.removeEventListener('load', updateBoardDimensions);
      }
    };
  }, []);
  
  const parseCoordinates = () => {
    const rowIndex = inputCoord.row.toUpperCase().charCodeAt(0) - 65; 
    const colIndex = parseInt(inputCoord.col) - 1; 
    
    if (
      rowIndex >= 0 && rowIndex < BOARD_HEIGHT &&
      colIndex >= 0 && colIndex < BOARD_WIDTH
    ) {
      return { x: colIndex, y: rowIndex };
    }
    return null;
  };
  
  // Calcular la posición en porcentaje dentro de la imagen teniendo en cuenta los márgenes
  const calculatePosition = (x: number, y: number) => {
    // Convertir coordenadas del juego (0-29, 0-15) a porcentajes dentro del grid de colores
    const gridXPercent = (x / (BOARD_WIDTH - 1)); // de 0 a 1 horizontalmente
    const gridYPercent = (y / (BOARD_HEIGHT - 1)); // de 0 a 1 verticalmente
    
    // Ajustar al espacio real que ocupa el grid dentro de la imagen
    const adjustedX = GRID_OFFSET_X + (gridXPercent * GRID_WIDTH);
    const adjustedY = GRID_OFFSET_Y + (gridYPercent * GRID_HEIGHT);
    
    return { x: adjustedX, y: adjustedY };
  };
  
  const handleSelectCoordinate = (e: React.FormEvent) => {
    e.preventDefault();
    const coords = parseCoordinates();
    if (!coords) {
      alert("Coordenadas inválidas. Filas: A-P, Columnas: 1-30");
      return;
    }
    
    if (gameState.gamePhase === 'guessing') {
      const playerIdInput = document.getElementById('player-selector') as HTMLSelectElement;
      if (!playerIdInput || !playerIdInput.value) {
          alert("Por favor, selecciona tu nombre antes de hacer una selección.");
          return;
      }
      const playerId = parseInt(playerIdInput.value);
        
      addGuess(playerId, coords.x, coords.y);
      setInputCoord({ col: '', row: '' });
    }
  };

  // Determinar si mostrar o no las selecciones en el tablero
  const showSelections = gameState.gamePhase === 'scoring' || gameState.gamePhase === 'end';
  
  return (
    <div className="gameboard-container bg-white rounded-md border border-gray-200 shadow-sm h-full flex flex-col" ref={boardRef}>
      <div className="gameboard-header p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Tablero</h2>
        {gameState.gamePhase === 'guessing' && gameState.currentWord && (
          <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            Palabra: <span className="font-semibold">{gameState.currentWord}</span>
          </div>
        )}
        {gameState.gamePhase === 'scoring' && gameState.currentWord && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            Palabra: <span className="font-semibold">{gameState.currentWord}</span> - Resultados
          </div>
        )}
      </div>
      
      <div className="gameboard-image-container flex-grow p-4 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center w-full h-full">
          <img 
            ref={imgRef}
            src="/tablero.webp" 
            alt="Tablero de Hues and Cues" 
            className="game-board-image"
          />
          
          {/* Renderizar las selecciones sobre la imagen - SOLO EN FASE SCORING */}
          {boardDimensions.loaded && showSelections && gameState.guesses
            .filter(g => g.round === gameState.currentRound)
            .map((guess) => {
              const player = gameState.players.find(p => p.id === guess.playerId);
              if (!player) return null;
              
              // Usar la función mejorada de cálculo de posición
              const position = calculatePosition(guess.position.x, guess.position.y);
              
              // Mostrar en consola para depuración si es necesario
              if (IS_DEBUG) {
                console.log(`Posición de ${player.name}:`, {
                  original: guess.position,
                  calculada: position
                });
              }
              
              return (
                <div 
                  key={`guess-${player.id}`}
                  className="absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-sm z-10"
                  style={{ 
                    backgroundColor: player.color,
                    left: `${position.x}%`, 
                    top: `${position.y}%`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }}
                  title={`${player.name}: ${String.fromCharCode(65 + guess.position.y)}${guess.position.x + 1}`}
                />
              );
            })
          }
          
          {/* Renderizar el punto objetivo (solo visible en fase de puntuación) */}
          {boardDimensions.loaded && showSelections && gameState.averagePosition && (
            <div 
              className="absolute w-7 h-7 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-black shadow-md z-20 flex items-center justify-center"
              style={{ 
                ...calculatePosition(gameState.averagePosition.x, gameState.averagePosition.y),
                left: `${calculatePosition(gameState.averagePosition.x, gameState.averagePosition.y).x}%`, 
                top: `${calculatePosition(gameState.averagePosition.x, gameState.averagePosition.y).y}%`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
              }}
              title={`Coordenada media: ${String.fromCharCode(65 + gameState.averagePosition.y)}${gameState.averagePosition.x + 1}`}
            >
              <div className="w-3 h-3 rounded-full bg-black" />
            </div>
          )}
        </div>
      </div>
      
      {gameState.gamePhase === 'guessing' && (
        <div className="gameboard-form-container p-4 border-t border-gray-200 bg-gray-50">
          <form onSubmit={handleSelectCoordinate}>
            <div className="mb-3">
              <p className="text-sm text-gray-700 font-medium mb-2">
                Selecciona el color que mejor representa: <span className="font-semibold text-indigo-700">{gameState.currentWord || "..."}</span>
              </p>
              
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 sm:col-span-4">
                  <select
                    id="player-selector"
                    className="w-full px-2 py-1.5 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Selecciona jugador</option>
                    {gameState.players.map(player => {
                      const hasGuessed = gameState.guesses.some(g => 
                        g.playerId === player.id && g.round === gameState.currentRound
                      );
                      return (
                        <option 
                          key={player.id} 
                          value={player.id}
                          disabled={hasGuessed}
                        >
                          {player.name} {hasGuessed ? '(ya seleccionó)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="col-span-2 sm:col-span-2">
                  <input
                    id="row-input"
                    type="text"
                    value={inputCoord.row}
                    onChange={(e) => setInputCoord({ ...inputCoord, row: e.target.value.toUpperCase() })}
                    className="w-full px-2 py-1.5 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase text-sm text-center"
                    maxLength={1}
                    placeholder="A-P"
                    aria-label="Fila (A-P)"
                  />
                </div>
                
                <div className="col-span-3 sm:col-span-2">
                  <input
                    id="col-input"
                    type="number"
                    min="1"
                    max="30"
                    value={inputCoord.col}
                    onChange={(e) => setInputCoord({ ...inputCoord, col: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-center"
                    placeholder="1-30"
                    aria-label="Columna (1-30)"
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-4">
                  <button
                    type="submit"
                    className="w-full px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
              
              <div className="mt-1.5 flex justify-between text-xs text-gray-500">
                <div>Jugador</div>
                <div>Fila</div>
                <div>Col.</div>
                <div>&nbsp;</div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GameBoard; 