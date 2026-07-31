
import {  useCallback, useState, useEffect } from "react";
import MazeView from '../MazeView/MazeView';
import MazeController from '../MazeController/MazeController';
import {levels} from "../../assets/levels";
import { sassNull } from "sass";
import { generateLevel } from "../../utils/gen";

const GameContainer = () => {

    const [levelNum, setlevelNum] = useState(1)
    const [maze, setMaze] = useState(levels[levelNum-1].map(row => [...row])) //current state of maze .map creates a deep copy to not affect the imported levels
    const [mazeHistory, setMazeHistory] = useState([])
    const [undoLives, setUndoLives] = useState(3)

    const [initialMaze, setInitialMaze] = useState(levels[levelNum-1].map(row => [...row])) //starting state of maze/level 
    const [count, setCount] = useState(0) //steps
    const [canMove, setCanMove] = useState(true)
    const [solutionPath, setSolutionPath] = useState([])
    const [showSolution, setShowSolution] = useState(false)
    const [numColors, setNumColors] = useState(3)
    const [size, setSize] = useState(11)
    
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
        setCount(0)
        setMazeHistory([])
        setUndoLives(3)
        //console.log('newInitialMaze:', levelNum, initialMaze)
    }

    const startOver = () => {
        setMaze((prevMaze)  => {
            return [...initialMaze]
        })
        setCount(0)
        setMazeHistory([])
        setUndoLives(3)
    }

    function handleGenerateLevel() {
        const { newMaze, solutionPath: newPath } = generateLevel(size, numColors);
        setMaze(newMaze);
        setInitialMaze(newMaze.map(row => [...row]));
        setSolutionPath(newPath);
        setCount(0);
        setMazeHistory([]);
        setUndoLives(3);
        setPlayerX(findPlayerPos(newMaze).x);
        setPlayerY(findPlayerPos(newMaze).y);
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

    const Finish = () => {
        console.log('COMPLETE')
        alert(`Level complete! You took ${count} Steps`)
    }

    const Move = (input, currentMaze, currentPosition) => {
        
        //setcanMove to false while function runs
        setCanMove(false)
        if(canMove){
        //
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
            if (tempMaze[playery + 2]){
                attemptedMove = tempMaze[playery + 2][playerx]
            }
            attemptedY = playery + 2
            tileInPath = tempMaze[playery + 1][playerx]
        }
        if (!(/^[a-z]$/.test(tileInPath) && /^[a-z]$/.test(attemptedMove) && attemptedMove === 'p')){//checks if tileInPath is a lowercase letter and 'p' (path)
            console.log('invalid move')
            tempMaze[playery][playerx] = 'P';
        } else {
            setMazeHistory(history => [...history, maze.map(row => [...row])]);
            if(/^[a-z]$/.test(tileInPath) && tileInPath !== 'p'){//checks if tileInPath is a lowercase letter
                //invertDoors(tempMaze, color)
                switchDoors(tempMaze, tileInPath)
            }
            tempMaze[attemptedY][attemptedX] = 'P'
            setCount(count + 1)
        }
        console.log('test:', /^[a-z]$/.test(tileInPath) && tileInPath !== 'p')

        console.log('tempMaze after move', tempMaze)
        setMaze(maze => [...tempMaze])
        if (tileInPath === 'E'){
            Finish()
        }
        setCanMove(true)
        }
    }

    const undo = useCallback(() => {
        if (undoLives > 0 && mazeHistory.length > 0) {
            const previousMaze = mazeHistory[mazeHistory.length - 1];
            setMaze(previousMaze.map(row => [...row]));
            setMazeHistory(history => history.slice(0, -1));
            setCount(prev => prev > 0 ? prev - 1 : 0);
            setUndoLives(lives => lives - 1);
        }
    }, [undoLives, mazeHistory]);

    useEffect(() => {   
        const handleKeyPress = (e) => {
            e.preventDefault();
            console.log(`Key pressed: ${e.key}`);
            //console.log('cmoving from', playerX, playerY, maze)
            if(e.key === 'w' || e.key === 'ArrowUp'){    
                Move("up");
            }else if(e.key === 's' || e.key === 'ArrowDown'){ 
                Move("down");
            }else if(e.key === 'a' || e.key === 'ArrowLeft'){ 
                Move("left");
            }else if(e.key === 'd' || e.key === 'ArrowRight'){ 
                Move("right");
            } else if(e.key === ' '){ 
                startOver();
            } else if (e.key === 'Enter' || e.key === 'Backspace') {
                undo();
            }
        }

        setPlayerX(findPlayerPos(maze).x);
        setPlayerY(findPlayerPos(maze).y);

        document.addEventListener('keydown', handleKeyPress);
        console.log('useEffect:', 'level',levelNum, 'player',playerX, playerY, 'current:', maze, 'initial:', initialMaze)//values work here can Move() go inside this?
        console.log(levels[levelNum-1])

        return () => {
            // Cleanup: Remove event listener when the component unmounts
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [maze, playerX, playerY, initialMaze, undo]);//, JSON.stringify(maze)]);

    return (
        <div className='game-container'>
            <div className="flex bottom-text">WASD to move, or use arrow buttons</div>
            <div className="instructions game-instructions">
                <h3 id="counter">Steps: {count}</h3>
                <div className="controls">
                    <div className="control-up">
                        <button id="up" onClick={() => {Move("up")}}></button>
                    </div>       
                    <div className="flex">
                        <button id="left" onClick={() => {Move("left")}}></button>
                        <button id="down" onClick={() => {Move("down")}}></button>
                        <button id="right" onClick={() => {Move("right")}}></button>                
                    </div>        
                </div>
                <div>
                    <h3>Level: {levelNum}/{levels.length}</h3>
                </div>
            </div>
            <div className='game-board' id='game-board'>
                <MazeView startingMaze={initialMaze} maze={maze} setMaze={setMaze} count={count} solutionPath={solutionPath} showSolution={showSolution} />
            </div>
            <div className="flex lower-buttons">
                <button id="refresh"  onClick={() => {startOver()}}>start over</button>
                <button id="undo" onClick={undo} disabled={undoLives === 0 || mazeHistory.length === 0}>
                    undo {'❤️'.repeat(undoLives)}
                </button>
                <button onClick={raiseLevel}>
                    next level
                </button>
            </div>
            <div className="flex lower-buttons" style={{marginTop: '10px', gap: '5px', flexWrap: 'wrap'}}>
                <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                    <span>Size:</span>
                    <input type="range" min="5" max="29" step="2" value={size} onChange={(e) => setSize(parseInt(e.target.value))} />
                </div>
                <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                    <span>Colors: {numColors}</span>
                    <button onClick={() => setNumColors(Math.max(1, numColors - 1))}>-</button>
                    <button onClick={() => setNumColors(Math.min(7, numColors + 1))}>+</button>
                </div>
                <button onClick={handleGenerateLevel}>Random Level</button>
                <button onClick={() => setShowSolution(!showSolution)}>{showSolution ? 'Hide Solution' : 'Show Solution'}</button>
            </div>
        </div>
    )
}

export default GameContainer;

//<MazeController playerx={playerX} playery={playerY} maze={maze} Move={Move} levelNum={levelNum} raiseLevel={raiseLevel}/>