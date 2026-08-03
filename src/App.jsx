import { useState } from 'react';
import './styles.scss';
import GameContainer from './components/GameContainer/GameContainer';
import TutorialContainer from './components/TutorialContainer/TutorialContainer';
import PracticeContainer from './components/PracticeContainer/PracticeContainer';
import LevelEditorContainer from './components/LevelEditorContainer/LevelEditorContainer';

function App() {

  const [mode, setMode] = useState('game'); // 'game', 'tutorial', 'practice', 'editor'
  const [colorblind, setColorblind] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleColorBlind = () => {
    setColorblind((prev) => !prev);
  };
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleMenuClick = (newMode) => {
    setMode(newMode);
    setMenuOpen(false);
  }

  const renderContainer = () => {
    switch (mode) {
      case 'game': return <GameContainer />;
      case 'tutorial': return <TutorialContainer />;
      case 'practice': return <PracticeContainer />;
      case 'editor': return <LevelEditorContainer />;
      default: return <GameContainer />;
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
          <div style={{ width: '24px' }}></div> {/* spacer to center title */}
        </div>

        {menuOpen && (
          <div className="burger-menu">
            <button className='x-button' onClick={() => setMenuOpen(false)}>X</button>
            <button onClick={() => handleMenuClick('game')}>Daily</button>
            <button onClick={() => handleMenuClick('tutorial')}>Tutorial</button>
            <button onClick={() => handleMenuClick('practice')}>Practice</button>
            <button onClick={() => handleMenuClick('editor')}>Level Editor</button>
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