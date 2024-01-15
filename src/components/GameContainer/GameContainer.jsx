
import {  useCallback, useState, useEffect } from "react";
import MazeView from '../MazeView/MazeView';
import MazeController from '../MazeController/MazeController';
import {levels} from "../../assets/levels";
import { sassNull } from "sass";

const GameContainer = () => {

    const [levelNum, setlevelNum] = useState(1)
    const [maze, setMaze] = useState(levels[levelNum-1].map(row => [...row])) //current state of maze .map creates a deep copy to not affect the imported levels

    const [initialMaze, setInitialMaze] = useState(levels[levelNum-1].map(row => [...row])) //starting state of maze/level 
    const [count, setCount] = useState(0) //steps
    
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
    }

    useEffect(() => {   
        const handleKeyPress = (e) => {
            e.preventDefault();
            console.log(`Key pressed: ${e.key}`);
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
        console.log('useEffect:', 'level',levelNum, 'player',playerX, playerY, 'current:', maze, 'initial:', initialMaze)//values work here can Move() go inside this?
        console.log(levels[levelNum-1])

        return () => {
            // Cleanup: Remove event listener when the component unmounts
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [maze, playerX, playerY, initialMaze]);//, JSON.stringify(maze)]);

    return (
        <div className='game-container'>
            <div className="flex">
            </div>
            <button id="save">save</button>
            <div className="instructions">
                <h4>WASD to move, or:</h4>
                <div className="controls">
                    <div className="control-up">
                        <button id="up" onClick={() => {Move("up")}}>^</button>
                    </div>               
                    <button id="left" onClick={() => {Move("left")}}>L</button>
                    <button id="down" onClick={() => {Move("down")}}>v</button>
                    <button id="right" onClick={() => {Move("right")}}>R</button>                
                </div>
                <button id="refresh"  onClick={() => {startOver()}}>start over</button>
                <div>
                <h3>Level: {levelNum}</h3>
                    <button onClick={raiseLevel}>
                        next Level
                    </button>
                <div>
                </div>
                    Steps: <div id="counter"></div>
                </div>
            </div>
                <div className='game-board' id='game-board'>
                    <MazeView startingMaze={initialMaze} maze={maze} setMaze={setMaze} count={count}/>
                </div>
        </div>
    )
}

export default GameContainer;

//<MazeController playerx={playerX} playery={playerY} maze={maze} Move={Move} levelNum={levelNum} raiseLevel={raiseLevel}/>