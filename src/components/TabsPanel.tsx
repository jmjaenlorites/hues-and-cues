import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import GuessingPhase from './GuessingPhase';
import ScoreBoard from './ScoreBoard';
import EndGame from './EndGame';
import SelectionsHistory from './SelectionsHistory';

interface TabsPanelProps {
  activePhase: string;
}

const TabsPanel: React.FC<TabsPanelProps> = ({ activePhase }) => {
  const { gameState } = useGameContext();
  const [activeTab, setActiveTab] = useState<string>(activePhase);
  
  // If game phase changes, update the active tab
  React.useEffect(() => {
    if (activePhase !== 'selecciones') {
      setActiveTab(activePhase);
    }
  }, [activePhase]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'guessing':
        return <GuessingPhase />;
      case 'scoring':
        return <ScoreBoard />;
      case 'end':
        return <EndGame />;
      case 'selecciones':
        return <SelectionsHistory />;
      default:
        return null;
    }
  };

  // Only show tabs when in active game (not in setup)
  if (gameState.gamePhase === 'setup') {
    return null;
  }

  return (
    <div className="tabs-panel w-full">
      <div className="flex border-b border-gray-200">
        {/* Tab for active game phase */}
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t-md ${
            activeTab !== 'selecciones'
              ? 'bg-white text-indigo-600 border-l border-r border-t border-gray-200'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab(activePhase)}
        >
          {activePhase === 'guessing' && 'Adivinanza'}
          {activePhase === 'scoring' && 'Resultados'}
          {activePhase === 'end' && 'Fin del Juego'}
        </button>
        
        {/* Tab for selections history */}
        <button
          className={`px-4 py-2 text-sm font-medium rounded-t-md ${
            activeTab === 'selecciones'
              ? 'bg-white text-indigo-600 border-l border-r border-t border-gray-200'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('selecciones')}
        >
          Selecciones
        </button>
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TabsPanel; 