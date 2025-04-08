import React, { useRef, useState, useEffect } from 'react';

// Removed unused constants
// const BOARD_WIDTH = 30;
// const BOARD_HEIGHT = 16;
// const GRID_OFFSET_X = 10; 
// const GRID_OFFSET_Y = 36.4; 
// const GRID_WIDTH = 80.5; 
// const GRID_HEIGHT = 38.3;

// Para evitar el error de process.env
const IS_DEBUG = false; // Cambiar a true para habilitar logs de depuración

// Define props for the component
interface GameBoardProps {
  // No props needed currently, but keeping interface for potential future use
}

const GameBoard: React.FC<GameBoardProps> = (/* Removed props destructuring */) => {
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
        if (IS_DEBUG) console.log("Imagen del tablero cargada");
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
  
  return (
    <div className="gameboard-container bg-white rounded-md border border-gray-200 shadow-sm h-full flex flex-col" ref={boardRef}>
      <div className="gameboard-image-container flex-grow p-4 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center w-full h-full">
          <img 
            ref={imgRef}
            src="/HuesAndCues_2020_gb_web.jpg"
            alt="Tablero de Hues and Cues" 
            className="game-board-image max-w-full max-h-full object-contain"
            style={{ visibility: boardDimensions.loaded ? 'visible' : 'hidden' }}
          />
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 