import { useState } from 'react';
import './styles.scss';
import GameContainer from './components/GameContainer/GameContainer';
import LevelEditorContainer from './components/LevelEditorContainer/LevelEditorContainer';

function App() {

  const [isGameContainer, setIsGameContainer] = useState(true);

  const toggleContainer = () => {
    setIsGameContainer((prev) => !prev);
  };

  return (
    <>
      <main>
        <div className="flex">
          <h3>Maze</h3>
          <div className="flex">
          <button onClick={toggleContainer}>Toggle Container</button>
          {isGameContainer ? <h4>Game</h4> : <h4>Level Editor</h4>}
          </div>
        </div>
        {isGameContainer ? <GameContainer /> : <LevelEditorContainer />}
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
        
      </main>
    </>
  )
}
 
export default App
//<button id="right" onClick={setContainer(levelEditor)}>Level Editor</button> 
//levels={levels}