import { useState, useEffect } from 'react';
import './styles.scss';
import GameContainer from './components/GameContainer/GameContainer';
import LevelList from './components/LevelList/LevelList';

const App = () => {
  const [myArray, setMyArray] = useState([]);

  const updateArray = () => {
    const newValue = 'New Value';
    setMyArray([...myArray, newValue]);
  };

  useEffect(() => {
    console.log('Inside useEffect:', myArray);
  }, [myArray]);

  const logArrayValue = (array) => {
    console.log('Inside logArrayValue:', array);
  };

  const resetValue = (array) => {
    const newValue = 'Value';
    setMyArray([newValue]);
  };

  return (
    <div>
      <button onClick={updateArray}>Update Array</button>
      <button onClick={resetValue}>Uresety</button>
      <button onClick={() => logArrayValue(myArray)}>Log Array Value</button>
      <ul>
        {myArray.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;