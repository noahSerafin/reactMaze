
import {  useCallback, useState, useEffect } from "react";
import MazeView from '../MazeView/MazeView';
import MazeController from '../MazeController/MazeController';
import {levels} from "../../assets/defaults";

const GameContainer = () => {

    const [levelNum, setlevelNum] = useState(1)
    const [maze, setMaze] = useState(levels[levelNum-1]) //current state of maze
    const [initialMaze, setInitialMaze] = useState(levels[levelNum-1]) //starting state of maze/level
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
    //console.log('start', playerx, playery)
    //console.log('GAMECONTAINER', playerX, playerY, maze)

    const raiseLevel = () => {
        //console.log(levelNum, levels[levelNum-1])
        let tempNum = levelNum < levels.length ? levelNum + 1 : 1;
        
        setlevelNum(tempNum);
        console.log('new level:', tempNum, levels[tempNum-1])

        //setLevel(levels[levelNum-1])
        let tempLevel = levels[tempNum-1]
   
        console.log('tempLevel:', tempLevel)
        setInitialMaze(() => [...tempLevel])

        //renders correct until move(), state of maze is not acutally changing
        /*setMaze(() => [...tempLevel]){

        }
        setPlayerX(findPlayerPos().x)
        setPlayerY(findPlayerPos().y)*?*/
        setMaze((prevMaze) => [...tempLevel]);
        
        //setMaze(maze => [...initialMaze])
        console.log('newInitialMaze:', initialMaze)
        console.log('newMaze:', maze)
        console.log('playerinnewlevel', playerX, playerY)

    }

    const startOver = () => {
        let prevMaze = maze
        setMaze((prevMaze)  => {
            return [...initialMaze]
        })
    }

    const switchDoor = (tile, color) => { 
        switch (color) {
            case 'red':
                console.log("red switch")
                if(tile === 1){
                    return 5            
                } else if (tile === 5){
                    return 1
                } else {
                    return tile
                }   
            case 'blue':
                console.log("blue switch")
                if(tile === 2){
                    return 6            
                } else if (tile === 6){
                    return 2
                } else {
                    return tile
                } 
            case 'green':
                console.log("green switch")
                if(tile === 3){
                    return 7           
                } else if (tile === 7){
                    return 3
                } else {
                    return tile
                }    
            default: return tile
        }       
    }

    const invertDoors = (color) => {
        let tempMaze = maze
    
        for (let row = 0; row< tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++){   
                tempMaze[row][column] = switchDoor(maze[row][column], color)
            }
        }
       
        setMaze(maze => [...tempMaze]);
    }

    const Move = (input, currentMaze, currentPosition) => {
        
        let tempMaze = Array.from(maze)
        
        let playerx = playerX //findPlayerpos based on maze once correct maze value is being received
        let playery = playerY
       
        //console.log('input', input, tempMaze)
       
        console.log('moving from', playerx, playery, tempMaze)
        
        tempMaze[playery][playerx] = 0
        //console.log( tempMaze[playery][playerx])

        if(!(input == "left" && tempMaze[playery][playerx-1] <= 3 && tempMaze[playery][playerx-2] == 0) && !(input == "right"  && tempMaze[playery][playerx+1] <= 3  && tempMaze[playery][playerx+2] == 0) && !(input == "up" && tempMaze[playery-1][playerx] <= 3  && tempMaze[playery-2][playerx] == 0) && !(input == "down" && tempMaze[playery+1][playerx] <= 3  && tempMaze[playery+2][playerx] == 0)){
            console.log('invalid move');
            tempMaze[playery][playerx] = 'P'
        }
        if(input == "left" && tempMaze[playery][playerx-1] <= 3 && tempMaze[playery][playerx-2] == 0)
        {           
            if(tempMaze[playery][playerx-1] == 1){
                invertDoors("red"); 
            } else if(tempMaze[playery][playerx-1] == 2){
                invertDoors("blue");  
            } else if(tempMaze[playery][playerx-1] == 3){
                invertDoors("green");
            }   
            tempMaze[playery][playerx - 2] = 'P'
            setPlayerX(playerx => playerx - 2)
        }
        if(input == "right"  && tempMaze[playery][playerx+1] <= 3  && tempMaze[playery][playerx+2] == 0)
        {
            console.log('right')
            if(tempMaze[playery][playerx+1] == 1){                   
                invertDoors("red");
            } else if(tempMaze[playery][playerx+1] == 2){
                invertDoors("blue");
            } else if(tempMaze[playery][playerx+1] == 3){
                invertDoors("green");
            }
            tempMaze[playery][playerx + 2] = 'P'
            setPlayerX(playerx => playerx + 2)
        }
        if(input == "up" && tempMaze[playery-1][playerx] <= 3  && tempMaze[playery-2][playerx] == 0)
        {
            if(tempMaze[playery -1][playerx] == 1){
                invertDoors("red");
            } else if(tempMaze[playery -1][playerx] == 2){
                invertDoors("blue");
            } else if(tempMaze[playery -1][playerx] == 3){
                invertDoors("green");
            }
            tempMaze[playery - 2][playerx] = 'P'
            setPlayerY(playery => playery - 2)
        }
        if(input == "down" && tempMaze[playery+1][playerx] <= 3  && tempMaze[playery+2][playerx] == 0)
        {
            console.log('down')
            if(tempMaze[playery +1][playerx] == 1){
                invertDoors("red");
            } else if(tempMaze[playery +1][playerx] == 2){
                invertDoors("blue");
            } else if(tempMaze[playery +1][playerx] == 3){
                invertDoors("green");
            }
            tempMaze[playery + 2][playerx] = 'P'
            setPlayerY(playery => playery + 2)
        }

        console.log('tempMaze after move', tempMaze)
        setMaze(maze => [...tempMaze])
        
        //console.log('player', playerx, playery)
    }

    //key listener/controller/////////////
    const handleKeyPress = useCallback((e) => {
        e.preventDefault();
        console.log(`Key pressed: ${e.key}`);
        console.log('cmoving from', playerX, playerY, maze)
        if(e.key === 'w'){    
            Move("up");
        }else if(e.key === 's'){ 
            Move("down");
        }else if(e.key === 'a'){ 
            Move("left");
        }else if(e.key === 'd'){ 
            Move("right");
        }
        //console.log('maze:', maze)
        //console.log('moved to:', playerx, playery)
    }, []);

    ////////////////////////

    useEffect(() => {    

        setPlayerX(findPlayerPos(maze).x);
        setPlayerY(findPlayerPos(maze).y);

        document.addEventListener('keydown', handleKeyPress);
        console.log('model detected change')
        console.log('useEffect:', playerX, playerY, 'current:', maze, 'initial:', initialMaze)//values work here can Move() go inside this?
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