import React, { useEffect } from 'react';
import { useGameContext } from './context/GameContext';
import GameBoard from './components/GameBoard';
import PlayerSetup from './components/PlayerSetup';
import GameControls from './components/GameControls';
import TabsPanel from './components/TabsPanel';

// Constante para activar/desactivar elementos de desarrollo
const IS_DEBUG = false; // Cambia esto manualmente según necesites depuración

const App: React.FC = () => {
  const { gameState } = useGameContext();
  
  // Actualizar la variable CSS --app-height cuando cambia el tamaño de ventana
  useEffect(() => {
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    // Ejecutar al cargar y cuando cambia el tamaño de ventana
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);
    
    // Llamar inicialmente y asegurar que se actualiza después de la carga completa
    setAppHeight();
    window.setTimeout(setAppHeight, 300);
    
    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
    };
  }, []);

  return (
    <div className="bg-white" style={{ backgroundColor: '#ffffff' }}>
      <div className="app-container mx-auto px-4 py-6 max-w-7xl">
        <header className="app-header mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-center text-gray-900">Hues & Cues</h1>
        </header>
        
        <div className="app-body">
          <div className="app-main w-full lg:w-3/4 mb-6 lg:mb-0 lg:pr-6">
            <GameBoard />
          </div>
          
          <div className="app-sidebar w-full lg:w-1/4 space-y-6">
            <GameControls />
            {gameState.gamePhase === 'setup' ? (
              <PlayerSetup />
            ) : (
              <TabsPanel activePhase={gameState.gamePhase} />
            )}
          </div>
        </div>
        
        {/* Mostrar estado actual para depuración */}
        {IS_DEBUG && (
          <div className="mt-10 p-4 bg-gray-100 text-xs text-gray-600 rounded-md font-mono">
            <div>Fase actual: {gameState.gamePhase}</div>
            <div>Ronda: {gameState.currentRound}/{gameState.maxRounds}</div>
            <div>Jugadores: {gameState.players.length}</div>
            <div>Selecciones en ronda actual: {
              gameState.guesses.filter(g => g.round === gameState.currentRound).length
            }</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App; 