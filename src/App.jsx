import { useState, useEffect } from 'react';
import './styles.scss';
import GameContainer from './components/GameContainer/GameContainer';
import LevelList from './components/LevelList/LevelList';


function App() {

  return (
    <>
      <main>
        <h3>Maze</h3>
        <GameContainer/>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </main>
    </>
  )
}
 
export default App
//levels={levels}