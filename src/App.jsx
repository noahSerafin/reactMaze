import { useState } from 'react';
import './styles.scss';
import GameContainer from './components/GameContainer/GameContainer';
import LevelEditorContainer from './components/LevelEditorContainer/LevelEditorContainer';

function App() {

  const [isGameContainer, setIsGameContainer] = useState(true);
  const [colorblind, setColorblind] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleContainer = () => {
    setIsGameContainer((prev) => !prev);
  };
  const toggleColorBlind = () => {
    setColorblind((prev) => !prev);
  };
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <>
      <main className={`dark-mode-${darkMode}`}>
        <div className="top">
          <h3 className='header'>Mazel</h3>
        </div>
        <div className={`colourblind-${colorblind}`}>
          {isGameContainer ? <GameContainer /> : <LevelEditorContainer />}  
        </div>
          <div className="flex">
            <button className='cb-button' onClick={toggleColorBlind}>Colourblind pallete: {colorblind ? 'On' : 'off'}</button>
            <button className='cb-button' onClick={toggleDarkMode}>Dark mode: {darkMode ? 'On' : 'off'}</button>
          </div>
          <div className="flex container-toggle">
            <div className='container-header'>
              <p>Mode:</p>
              {isGameContainer ?<h4> Game</h4> : <h4>Level Editor</h4>}
            </div>
            <button onClick={toggleContainer}>Toggle Mode</button>
          </div>
      </main>
    </>
  )
}
 
export default App
//<button id="right" onClick={setContainer(levelEditor)}>Level Editor</button> 
//levels={levels}