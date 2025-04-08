import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import uuid library
import toast, { Toaster } from 'react-hot-toast'; // Import toast and Toaster
import GameBoard from './components/GameBoard';
// Removed imports: useGameContext, PlayerSetup, GameControls, TabsPanel

// Constante para activar/desactivar elementos de desarrollo - Kept for potential future use
const IS_DEBUG = false; 

// Define the structure for a row in the CSV
interface ClueWord {
  id: string;
  word: string;
  category: string;
}

// Define the structure for the submission data
interface GuessData {
  userId: string;
  clueId: string; // Added from ClueWord
  word: string; // The actual word used as the clue
  clueCategory: string; // Added from ClueWord
  coordinate: string; // e.g., "A10", "P5"
  timestamp: Date;
}

const App: React.FC = () => {
  // State for the single player game
  const [userId, setUserId] = useState<string | null>(null);
  // Changed state to hold ClueWord objects
  const [allWords, setAllWords] = useState<ClueWord[]>([]); 
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for words
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [coordinateInput, setCoordinateInput] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [submittedGuesses, setSubmittedGuesses] = useState<GuessData[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch words from CSV on component mount
  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true); // Ensure loading state is set
      try {
        // Updated fetch URL to the Google Sheet CSV endpoint
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQzJK78x6lOSPbDV_L0DLSxAPYCwnOylPAmr2A6lSwnMgqYpo2XZG7oTYG3cYw-OPkrtz8NMG09iUuB/pub?output=csv'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Parse CSV text, skipping header and extracting relevant columns
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length <= 1) { // Check if there's data beyond a potential header
           throw new Error("CSV file has no data rows.");
        }

        // Skip header row (first line)
        const dataLines = lines.slice(1);

        const parsedWords: ClueWord[] = dataLines.map((line, index) => {
          const columns = line.split(','); // Assuming comma delimiter
          // Basic validation: Ensure we have at least 3 columns (id, word, category)
          if (columns.length >= 3) {
            return {
              id: columns[0].trim(),
              word: columns[1].trim(), // Word is the second column
              category: columns[2].trim(),
            };
          } else {
            console.warn(`Skipping invalid CSV line ${index + 1}: ${line}`);
            return null; // Indicate invalid line
          }
        }).filter((word): word is ClueWord => word !== null); // Filter out null values
        
        setAllWords(parsedWords);
        if (parsedWords.length === 0) {
             console.warn("No valid clue words parsed from the CSV.");
             toast.error('Could not parse any valid words from the file.');
        }

      } catch (error) {
        console.error("Failed to load or parse words:", error);
        toast.error(`Failed to load clue words: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
         setIsLoading(false); // Ensure loading state is reset
      }
    };

    fetchWords();
  }, []);

  // Effect for responsive height (kept from original)
  useEffect(() => {
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);
    setAppHeight();
    window.setTimeout(setAppHeight, 300); // Ensure update after load
    
    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
    };
  }, []);

  // Function to start a new game
  const startGame = () => {
    setUserId(uuidv4()); // Generate new UUID for the game session
    setCurrentWordIndex(0);
    setGameStarted(true);
    setCoordinateInput('');
    setInputError(null);
    setSubmittedGuesses([]); // Clear previous guesses if any
    setIsSubmitting(false);
  };

  // Validate coordinate input (A-P, 1-30)
  const validateCoordinate = (input: string): boolean => {
    const regex = /^[A-P]([1-9]|[12][0-9]|30)$/i; // Case-insensitive
    return regex.test(input.trim());
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCoordinateInput(value);
    if (inputError) { // Clear error on new input
        setInputError(null);
    }
  };
  
  // Refactored handleSubmitGuess to return success status
  const handleSubmitGuess = async (data: GuessData): Promise<boolean> => { 
    console.log("Submitting guess:", data);
    const apiUrl = "https://script.google.com/macros/s/AKfycbxyRZjnuLHiPm6dzRhiRPtjwB0ovkxgbnts1si-OVJgT_8AFME-AQlGm8HQqvRL5kOh/exec";
    setIsSubmitting(true);
    let success = false;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
           'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data),
      });

      console.log("Fetch attempt completed. Status code:", response.status);
      
      if (response.ok) { 
        console.log("Submission successful.");
        success = true;
        setSubmittedGuesses(prev => [...prev, data]); 
      } else {
         console.warn(`Submission potentially failed with status: ${response.status}`);
      }

    } catch (error) {
      console.error("Error submitting guess:", error);
      success = false;
    } finally {
        setIsSubmitting(false);
    }
    
    return success;
  };

  // Refactored handleFormSubmit to use async/await and toast
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedInput = coordinateInput.trim().toUpperCase();

    if (!validateCoordinate(trimmedInput)) {
      setInputError("Invalid format. Use Letter (A-P) followed by Number (1-30), e.g., 'H15'.");
      return;
    }

    if (!userId) {
      console.error("User ID not set. Cannot submit guess.");
      setInputError("Game error: User ID missing.");
      toast.error("Game error occurred. Please refresh.");
      return;
    }
    
    if (currentWordIndex >= allWords.length) {
        console.warn("Attempted to submit after all words shown.");
        return;
    }

    // Get current clue object
    const currentClue = allWords[currentWordIndex];
    if (!currentClue) {
        console.error(`Error: No clue found at index ${currentWordIndex}`);
        toast.error("Game error: Could not find current clue.");
        return;
    }

    // Create guessData with id, word, and category from the current clue
    const guessData: GuessData = {
      userId: userId,
      clueId: currentClue.id,
      word: currentClue.word,
      clueCategory: currentClue.category,
      coordinate: trimmedInput,
      timestamp: new Date(),
    };

    // Await the submission result
    const success = await handleSubmitGuess(guessData);

    if (success) {
      toast.success("Guess registered successfully!");
      if (currentWordIndex < allWords.length - 1) {
        setCurrentWordIndex(prevIndex => prevIndex + 1);
        setCoordinateInput('');
        setInputError(null);
      } else {
        console.log("Game Over - All words guessed!");
        toast.success("Game Over! All clues completed.");
        setGameStarted(false);
      }
    } else {
      toast.error("Failed to register guess. Please try again.");
    }
  };
  
  // --- Rendering Logic ---

  if (isLoading) {
    return (
        <div> 
            <Toaster position="top-center" reverseOrder={false} /> {/* Add Toaster here too */}
            <div className="text-center p-10">Loading words...</div>
        </div>
    );
  }

  return (
    <div className="bg-white" style={{ backgroundColor: '#ffffff' }}>
       <Toaster position="top-center" reverseOrder={false} /> {/* Add Toaster for notifications */}
      <div className="app-container mx-auto px-4 py-6 max-w-7xl flex flex-col lg:flex-row">
        <header className="app-header mb-6 pb-4 border-b border-gray-200 w-full lg:hidden"> 
          {/* Mobile Header */}
          <h1 className="text-3xl font-bold text-center text-gray-900">Hues & Cues (Single Player)</h1>
        </header>

        {/* Game Board Area */}
        <div className="app-main w-full lg:w-3/4 mb-6 lg:mb-0 lg:pr-6 flex-grow">
           <header className="app-header mb-6 pb-4 border-b border-gray-200 hidden lg:block"> 
             {/* Desktop Header */}
             <h1 className="text-3xl font-bold text-center text-gray-900">Hues & Cues (Single Player)</h1>
           </header>
           {/* Pass ClueWord objects if GameBoard needs more than coordinate */}
          <GameBoard /> {/* Removed submittedGuesses prop */}
        </div>
        
        {/* Control/Info Area */}
        <div className="app-sidebar w-full lg:w-1/4 space-y-6 flex-shrink-0">
          {!gameStarted ? (
            <div className="text-center">
              <button 
                onClick={startGame}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-lg"
                disabled={isLoading || allWords.length === 0} 
              >
                Start New Game
              </button>
              {allWords.length === 0 && !isLoading && <p className="text-red-500 mt-2">Could not load words. Please check console.</p>}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-center">Current Clue:</h2>
              <p className="text-2xl font-bold mb-4 text-center bg-gray-100 p-3 rounded">
                  {currentWordIndex < allWords.length ? allWords[currentWordIndex]?.word : "Game Over!"} 
              </p>

             {currentWordIndex < allWords.length && (
                <form onSubmit={handleFormSubmit} className="space-y-3">
                   <label htmlFor="coordinateInput" className="block text-sm font-medium text-gray-700">
                       Enter Coordinate (e.g., H15):
                   </label>
                   <input
                     type="text"
                     id="coordinateInput"
                     value={coordinateInput}
                     onChange={handleInputChange}
                     className={`mt-1 block w-full px-3 py-2 border ${inputError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                     placeholder="A1 - P30"
                     maxLength={3} 
                     disabled={isSubmitting || currentWordIndex >= allWords.length}
                   />
                   {inputError && <p className="text-red-500 text-xs mt-1">{inputError}</p>}
                   <button 
                     type="submit"
                     className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={!coordinateInput || !!inputError || isSubmitting || currentWordIndex >= allWords.length} 
                   >
                     {isSubmitting ? 'Submitting...' : 'Submit Guess'}
                   </button>
                </form>
             )}

             {/* Update debug history display if needed */}
              {IS_DEBUG && submittedGuesses.length > 0 && (
                <div className="mt-6 p-4 bg-gray-100 text-xs text-gray-600 rounded-md font-mono max-h-60 overflow-y-auto">
                   <h3 className="font-bold mb-2">Submission History:</h3>
                   <ul>
                     {submittedGuesses.map((guess, index) => (
                       <li key={index}>{`${guess.word} (${guess.clueCategory}) -> ${guess.coordinate} (${guess.timestamp.toLocaleTimeString()})`}</li>
                     ))}
                   </ul>
                 </div>
               )}
            </div>
          )}
        </div>
        
        {/* Update debug info display if needed */}
        {IS_DEBUG && gameStarted && (
          <div className="mt-10 p-4 bg-gray-100 text-xs text-gray-600 rounded-md font-mono w-full order-last">
            <div>User ID: {userId}</div>
            <div>Word Index: {currentWordIndex} / {allWords.length}</div>
            <div>Current Clue: {JSON.stringify(allWords[currentWordIndex])}</div>
            <div>Current Input: {coordinateInput}</div>
             <div>Input Error: {inputError || 'None'}</div>
            <div>Guesses This Game: {submittedGuesses.length}</div>
            <div>Is Submitting: {isSubmitting.toString()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App; 