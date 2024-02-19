
import {  useCallback, useState, useEffect } from "react";
import MazeView from '../MazeView/MazeView';
import MazeController from '../MazeController/MazeController';
import {levels} from "../../assets/levels";
import { sassNull } from "sass";
import LevelEditor from "../LevelEditor/LevelEditor";

const GameContainer = () => {

    const [levelNum, setlevelNum] = useState(1)
    const [size, setSize] = useState(12)
    const [height, setHeight] = useState(12)
    const [count, setCount] = useState(0)
    const [maze, setMaze] = useState(levels[levelNum-1].map(row => [...row])) //current state of maze .map creates a deep copy to not affect the imported levels

    const [initialMaze, setInitialMaze] = useState(levels[levelNum-1].map(row => [...row])) //starting state of maze/level 
    const [dropper, setDropper] = useState('Wall/Path')
    
    const findPlayerPos = (currentMaze) => {
        for (let row = 0; row < currentMaze.length; row++) {
            for (let column = 0; column < currentMaze[row].length; column++) {
                if (currentMaze[row][column] === 'P') {
                    return { x: column, y: row };
                }
            }
        }
        // Return a default position if the player is not found
        return { x: -1, y: -1 };
    };

    const [playerX, setPlayerX] = useState(findPlayerPos(maze).x)
    const [playerY, setPlayerY] = useState(findPlayerPos(maze).y)

    const raiseLevel = () => {  
        let tempNum = levelNum < levels.length ? levelNum + 1 : 1;

        setlevelNum((prevNum)  => {
            return tempNum
        });

        let tempLevel = Array.from(levels[tempNum-1])
      
        setInitialMaze(() => [...tempLevel])

        setMaze((prevMaze) => [...tempLevel]); 
        //console.log('newInitialMaze:', levelNum, initialMaze)
    }

    const startOver = () => {
        setMaze((prevMaze)  => {
            return [...initialMaze]
        })
        setCount(0)
    }

    const switchDoors = (tempMaze, tile) => {
        for (let row = 0; row< tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++){  
                if(tempMaze[row][column] === tile){
                    tempMaze[row][column] = tile.toUpperCase()
                } else if(tempMaze[row][column] === tile.toUpperCase()){
                    tempMaze[row][column] = tile.toLowerCase()
                } 
            }
        }
    }

    const Move = (input, currentMaze, currentPosition) => {
        
        let tempMaze = maze.map(row => [...row]);
        
        let playerx = playerX //findPlayerpos based on maze once correct maze value is being received
        let playery = playerY
       
        //console.log('input', input, tempMaze)
       
        console.log('moving from', playerx, playery, tempMaze)
        
        tempMaze[playery][playerx] = 'p'

        let attemptedMove = null;
        let attemptedX = playerx;
        let attemptedY = playery;
        let tileInPath = null;

        if (input === "left"){
            attemptedMove = tempMaze[playery][playerx - 2]
            attemptedX = playerx - 2
            tileInPath = tempMaze[playery][playerx - 1]
        }
        else if (input === "right"){
            attemptedMove = tempMaze[playery][playerx + 2]
            attemptedX = playerx + 2
            tileInPath = tempMaze[playery][playerx + 1]
        }
        else if (input === "up"){
            attemptedMove = tempMaze[playery - 2][playerx]
            attemptedY = playery - 2
            tileInPath = tempMaze[playery - 1][playerx]
        }
        else if (input === "down"){
            attemptedMove = tempMaze[playery + 2][playerx]
            attemptedY = playery + 2
            tileInPath = tempMaze[playery + 1][playerx]
        }

        if (!(/^[a-z]$/.test(tileInPath) && /^[a-z]$/.test(attemptedMove) && attemptedMove === 'p')){
            console.log('invalid move')
            tempMaze[playery][playerx] = 'P';
        } else {
            if(/^[a-z]$/.test(tileInPath) && tileInPath !== 'p'){
                //invertDoors(tempMaze, color)
                switchDoors(tempMaze, tileInPath)
            }
            tempMaze[attemptedY][attemptedX] = 'P'
        }
        console.log('test:', /^[a-z]$/.test(tileInPath) && tileInPath !== 'p')

        console.log('tempMaze after move', tempMaze)
        setMaze(maze => [...tempMaze])
        setCount(count + 1)
    }

    function createArray(size) {
        // Initialize the array
        let tempMaze = [];
      
        // Loop through rows (height)
        for (let i = 0; i < size; i++) {
          // Initialize the row
          let row = [];

          // Loop through columns (width) and set each element to 'p'
          for (let j = 0; j < size; j++) {
            row.push('p');
          }
      
          // Add the row to the result array
          tempMaze.push(row);
        }
        for (let row = 0; row< tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++){
                if(row===0 || row===tempMaze.length-1 || column===0 || column===tempMaze[row].length-1){
                    tempMaze[row][column] = '-'
                    if(column===0 || column === tempMaze.length-1){
                        tempMaze[row][column] = '|'
                    }
                }
                if(((row===0 || row === tempMaze.length-1) && (column % 2 === 0)) || ((column===0 || column === tempMaze.length-1) && row % 2 === 0) || (row % 2 === 0 && column % 2 === 0)){
                    tempMaze[row][column] = '+'
                }
            }
        }
        tempMaze[1][1]='P'
        return tempMaze;
    }

    //generative////////////////

    function createRandArray(size) {
        // Initialize the array
        let tempMaze = [];
      
        // Loop through rows (height)
        for (let i = 0; i < size; i++) {
          // Initialize the row
          let row = [];

          // Loop through columns (width) and set each element to 'p'
          for (let j = 0; j < size; j++) {
            row.push('p');
          }
      
          // Add the row to the result array
          tempMaze.push(row);
        }
        for (let row = 0; row< tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++){
                if((row!==0 || row!==tempMaze.length-1)&&(column!==0 || column === tempMaze.length-1)&&(row % 2 === 0 || column % 2 === 0)){
                    let max = 27
                    let doorcuttoff = 24
                    let rng = Math.floor(Math.random() * max);
                    
                    let randomTile = 'p'
                    if(rng===0 || (rng>16 && rng<doorcuttoff+1)){
                        randomTile = 'p'
                    } else if((rng===1 || rng>doorcuttoff)&& column % 2 === 0){
                        randomTile = '|'
                    } else if((rng===1 || rng>doorcuttoff)&& row % 2 === 0){
                        randomTile = '-'
                    } else if(rng===2){
                        randomTile = 'r'
                    } else if(rng===3){
                        randomTile = 'R'
                    } else if(rng===4){
                        randomTile = 'g'
                    } else if(rng===5){
                        randomTile = 'G'
                    } else if(rng===6){
                        randomTile = 'b'
                    } else if(rng===7){
                        randomTile = 'B'
                    } else if(rng===8){
                        randomTile = 'o'
                    } else if(rng===9){
                        randomTile = 'O'
                    } else if(rng===10){
                        randomTile = 'm'
                    } else if(rng===11){
                        randomTile = 'M'
                    } else if(rng===12){
                        randomTile = 'c'
                    } else if(rng===13){
                        randomTile = 'C'
                    } else if(rng===15){
                        randomTile = 'y'
                    } else if(rng===16){
                        randomTile = 'Y'
                    }
                    tempMaze[row][column] = randomTile
                }
                if(row===0 || row===tempMaze.length-1 || column===0 || column===tempMaze[row].length-1){
                    tempMaze[row][column] = '-'
                    if(column===0 || column === tempMaze.length-1){
                        tempMaze[row][column] = '|'
                    }
                }
                if(((row===0 || row === tempMaze.length-1) && (column % 2 === 0)) || ((column===0 || column === tempMaze.length-1) && row % 2 === 0) || (row % 2 === 0 && column % 2 === 0)){
                    tempMaze[row][column] = '+'
                }
                
            }
        }
        tempMaze[1][1]='P'
        setMaze(tempMaze)
    }

    function generateMaze(size) {
        // Initialize the array
        let resultArray = [];
      
        // Generate a random player position
        const playerRow = Math.floor(Math.random() * size);
        const playerCol = Math.floor(Math.random() * size);
      
        // Generate a random exit position on the edge
        const exitSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let exitRow, exitCol;
      
        switch (exitSide) {
          case 0: // top
            exitRow = 0;
            exitCol = Math.floor(Math.random() * size);
            break;
          case 1: // right
            exitRow = Math.floor(Math.random() * size);
            exitCol = size - 1;
            break;
          case 2: // bottom
            exitRow = size - 1;
            exitCol = Math.floor(Math.random() * size);
            break;
          case 3: // left
            exitRow = Math.floor(Math.random() * size);
            exitCol = 0;
            break;
        }
      
        // Loop through rows (size)
        for (let i = 0; i < size; i++) {
          // Initialize the row
          let row = [];
      
          // Loop through columns (size) and set each element to 'p' or 'P' or 'E'
          for (let j = 0; j < size; j++) {
            if (i === playerRow && j === playerCol) {
              row.push('P'); // Player
            } else if (i === exitRow && j === exitCol) {
              row.push('E'); // Exit
            } else {
              row.push('p'); // Path
            }
          }
      
          // Add the row to the result array
          resultArray.push(row);
        }
      
       setMaze(resultArray);
    }

    function drawPath(maze) {
        const size = maze.length;
      
        // Find the player ('P') and exit ('E') positions
        let playerRow, playerCol, exitRow, exitCol;
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            if (maze[i][j] === 'P') {
              playerRow = i;
              playerCol = j;
            } else if (maze[i][j] === 'E') {
              exitRow = i;
              exitCol = j;
            }
          }
        }
      
        // Initialize the path array
        let pathArray = [...maze.map(row => row.slice())]; // Create a deep copy of the maze
      
        // Draw a random path from player to exit
        let currentRow = playerRow;
        let currentCol = playerCol;
      
        while (currentRow !== exitRow || currentCol !== exitCol) {
          pathArray[currentRow][currentCol] = 'x';
      
          // Move randomly (up, down, left, or right)
          const randomDirection = Math.floor(Math.random() * 4);
      
          switch (randomDirection) {
            case 0: // Move up
              if (currentRow > 0) currentRow--;
              break;
            case 1: // Move down
              if (currentRow < size - 1) currentRow++;
              break;
            case 2: // Move left
              if (currentCol > 0) currentCol--;
              break;
            case 3: // Move right
              if (currentCol < size - 1) currentCol++;
              break;
          }
        }
      
        setMaze(pathArray);
    }
      
    ////////////////////////////////////////////////

    const handleSizeChange = (event) => {
        if(!(event.target.value % 2 === 0)){
            console.log(event.target.value)
            setSize(event.target.value);     
        }
        let newMaze = createArray(size)
        //console.log('newMaze:', newMaze)
        setMaze(newMaze)
    };

    const setNewDropper = (val) => {
        if(val === dropper) {
            return 
        }else{
            setDropper(val)
        }
    }

    const resetPlayer = () => {
        let tempMaze = maze.map(row => [...row]);
        console.log(findPlayerPos(tempMaze).x, findPlayerPos(tempMaze).y)
        console.log(tempMaze)
        console.log(findPlayerPos(initialMaze).x, findPlayerPos(initialMaze).y)
        tempMaze[findPlayerPos(tempMaze).x][findPlayerPos(tempMaze).y] = 'p'
        tempMaze[findPlayerPos(initialMaze).x][findPlayerPos(initialMaze).y] = 'P'
        setMaze(maze => [...tempMaze])
    }

    const setNewMaze = (tileBeingChanged, dropper) => {
        
        //console.log('setting:', dropper, tileBeingChanged)
        let tempMaze = maze.map(row => [...row]);

        tempMaze[tileBeingChanged.x][tileBeingChanged.y] = dropper

        setMaze(maze => [...tempMaze])
        setInitialMaze(initialMaze => [...tempMaze])
    }
    
    const Save = () => {
        console.log('Saving to console:')
        console.log(maze)
        navigator.clipboard.writeText(maze)
    }

    useEffect(() => {   
        const handleKeyPress = (e) => {
            e.preventDefault();
            //console.log(`Key pressed: ${e.key}`);
            //console.log('cmoving from', playerX, playerY, maze)
            if(e.key === 'w'){    
                Move("up");
            }else if(e.key === 's'){ 
                Move("down");
            }else if(e.key === 'a'){ 
                Move("left");
            }else if(e.key === 'd'){ 
                Move("right");
            }
        }

        setPlayerX(findPlayerPos(maze).x);
        setPlayerY(findPlayerPos(maze).y);

        document.addEventListener('keydown', handleKeyPress);
        //console.log('useEffect:', 'level',levelNum, 'player',playerX, playerY, 'current:', maze)//, 'initial:', initialMaze)//values work here can Move() go inside this?
        //console.log(levels[levelNum-1])

        return () => {
            // Cleanup: Remove event listener when the component unmounts
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [dropper, maze, playerX, playerY, initialMaze, size]);//, JSON.stringify(maze)]);

    const trueSize = (inp) =>{
        let out = inp + 1
        //console.log(out)
       // console.log(out/2)
        return out/2
    }

    return (
        <>
        <div className="flex">
            <div className="mr-2">Size: {(size/2) - 0.5}x{(size/2) - 0.5}</div>
            <div className="mr-2">Dropper: {dropper}</div>
        </div>
        <div className='game-container level-editor-container'>
            <div className="instructions">
                <div className="controls">
                    <div className="control-up">
                        <button id="up" onClick={() => {Move("up")}}>^</button>
                    </div>               
                    <button id="left" onClick={() => {Move("left")}}>L</button>
                    <button id="down" onClick={() => {Move("down")}}>v</button>
                    <button id="right" onClick={() => {Move("right")}}>R</button>                
                </div>
                <button id="refresh"  onClick={() => {startOver()}}>start over</button>
                <button id="save" onClick={() => {Save()}}>save</button>
                <div>
                    <div id="counter">Steps: {count}</div>
                    <h3>Level: {levelNum}</h3>
                    <button onClick={raiseLevel}>
                        next Level
                    </button>
                </div>
            </div>
            <div className="flex">

                <div className='game-board' id='game-board'>
                    <LevelEditor dropper={dropper} setNewMaze={setNewMaze} startingMaze={initialMaze} maze={maze} setMaze={setMaze}/>
                </div>
                <div className="tile-list">
                    <div> 
                        <p>Size:</p>
                        <input type="range" min="5" max="29" value={size} onChange={handleSizeChange}/>
                    </div>
                    <button onClick={() => {setNewDropper('Wall/Path')}}>Wall/Path: {dropper==='Wall/Path' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('r')}}>Red: {dropper==='r' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('g')}}>Green: {dropper==='g' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('b')}}>Blue: {dropper==='b' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('y')}}>Yellow: {dropper==='y' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('m')}}>Magenta: {dropper==='m' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('o')}}>Orange: {dropper==='o' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('c')}}>Cyan: {dropper==='c' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('P')}}>Player: {dropper==='P' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('E')}}>Exit: {dropper==='E' ? 'selected' : ''}</button>
                    <button onClick={() => {setNewDropper('void')}}>Void: {dropper==='void' ? 'selected' : ''}</button>
                    <button id="refresh"  onClick={() => {resetPlayer()}}>reset player</button>
                    <button id="refresh"  onClick={() => {createRandArray(size)}}>randomise</button>
                </div>
            </div>
        </div>
        </>
    )
}

export default GameContainer;
//<button id="refresh"  onClick={() => {generateMaze(size)}}>generate</button>

//<MazeController playerx={playerX} playery={playerY} maze={maze} Move={Move} levelNum={levelNum} raiseLevel={raiseLevel}/>