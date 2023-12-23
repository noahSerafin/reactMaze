import { useState } from 'react'
import './styles.scss'
import GameContainer from './components/GameContainer/GameContainer';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <main>
        <div className="flex">
          <h3>MAZel</h3>
          <button onClick={() => setCount((count) => count + 1)}>
            generate {count}
          </button>
        </div>
        <GameContainer/>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </main>
    </>
  )
}

export default App
