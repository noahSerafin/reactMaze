import { useState, useEffect, useCallback } from 'react';
import './styles.scss';
import GameContainer from './components/GameContainer/GameContainer';
import TutorialContainer from './components/TutorialContainer/TutorialContainer';
import PracticeContainer from './components/PracticeContainer/PracticeContainer';
import LevelEditorContainer from './components/LevelEditorContainer/LevelEditorContainer';
import UserLevelsContainer from './components/UserLevelsContainer/UserLevelsContainer';

const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {

  const [mode, setMode] = useState('game'); // 'game', 'tutorial', 'practice', 'editor'
  const [colorblind, setColorblind] = useState(() => {
    const saved = localStorage.getItem('colorblind');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [todayScore, setTodayScore] = useState(0);
  const [customLevelToLoad, setCustomLevelToLoad] = useState(null);

  const calculateScores = useCallback(() => {
    let total = 0;
    let today = 0;
    const todayStr = getDateString(new Date());

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('solvedMazes_')) {
        try {
          const solved = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(solved)) {
            total += solved.length;
            if (key === `solvedMazes_${todayStr}`) {
              today = solved.length;
            }
          }
        } catch (e) {
          // ignore invalid JSON
        }
      }
    }
    setTotalScore(total);
    setTodayScore(today);
  }, []);

  useEffect(() => {
    calculateScores();
  }, [calculateScores]);

  const toggleColorBlind = () => {
    setColorblind((prev) => {
      const next = !prev;
      localStorage.setItem('colorblind', JSON.stringify(next));
      return next;
    });
  };
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('darkMode', JSON.stringify(next));
      return next;
    });
  };

  const handleMenuClick = (newMode) => {
    setMode(newMode);
    setMenuOpen(false);
  }

  const renderContainer = () => {
    switch (mode) {
      case 'game': return <GameContainer onScoreUpdate={calculateScores} />;
      case 'tutorial': return <TutorialContainer />;
      case 'practice': return <PracticeContainer customLevel={customLevelToLoad} />;
      case 'editor': return <LevelEditorContainer />;
      case 'user-levels': return <UserLevelsContainer onLoadLevel={(level) => { setCustomLevelToLoad(level.maze); handleMenuClick('practice'); }} />;
      default: return <GameContainer onScoreUpdate={calculateScores} />;
    }
  }

  return (
    <>
      <main className={`dark-mode-${darkMode}`}>
        <div className="top-nav">
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            &#9776;
          </div>
          <h3 className='header'>Mazle</h3>
          <div className="score-display">
            🏆 {totalScore} | Today: {todayScore}/4
          </div>
        </div>

        {menuOpen && (
          <div className="burger-menu">
            <button className='x-button' onClick={() => setMenuOpen(false)}>X</button>
            <button onClick={() => handleMenuClick('game')}>Daily</button>
            <button onClick={() => handleMenuClick('tutorial')}>Tutorial</button>
            <button onClick={() => handleMenuClick('practice')}>Practice</button>
            <button onClick={() => handleMenuClick('editor')}>Level Editor</button>
            <button onClick={() => handleMenuClick('user-levels')}>User Levels</button>
            <hr />
            <button onClick={toggleColorBlind}>Colorblind Pallete: {colorblind ? 'On' : 'Off'}</button>
            <button onClick={toggleDarkMode}>Dark Mode: {darkMode ? 'On' : 'Off'}</button>
          </div>
        )}

        <div className={`colourblind-${colorblind}`}>
          {renderContainer()}
        </div>
      </main>
    </>
  )
}

export default App