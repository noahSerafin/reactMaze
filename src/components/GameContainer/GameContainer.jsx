import { useState, useEffect } from "react";
import MazeView from '../MazeView/MazeView';
import MazeController from '../MazeController/MazeController';

const GameContainer = () => {

    const player = {
        x : 1,
        y : 1
    }

    var initialMaze = [
        ['+', '-', '+', '-', '+', '-', '+', '-', '+', '-', '+', '-', '+'],
        ['|', 'P', 0, 0, 0, 0, 0, 0, 0, 0, '|', 0, '|'],
        ['+', 1, '+', 6, '+', 2, '+', '-', '+', 0, '+', '-', '+'],
        ['|', 0, '0', 0, '|', 0, '|', 0, '|', 0, 0, 0, '|'],
        ['+', 0, '+', '-', '+', 0, '+', 0, '+', '-', '+', 0, '+'],
        ['|', 0, 0, 0, '0', 0, '0', 0, '|', 0, 0, 0, '|'],
        ['+', 0, '+', 0, '+', 0, '+', '-', '+', 0, '+', '-', '+'],
        ['|', 0, '|', 0, '|', 0, 6, 0, 0, 0, 0, 0, '|'],
        ['+', 0, '+', 0, '+', 0, '+', 0, '+', '-', '+', 0, '+'],
        ['|', 0, 7, 0, 0, 0, '|', 0, 0, 0, 3, 0, '|'],
        ['+', 5, '+', '-', '+', 0, '+', 0, '+', '-', '+', '-', '+'],
        ['|', 0, '|', 0, '|', 0, 0, 0, 0, 0, 0, 0, '|'],
        ['+', '-', '+', '-', '+', '-', '+', '-', '+', '-', '+', '-', '+']
    ]

    const [maze, setMaze] = useState(initialMaze)
    const [count, setCount] = useState(0)

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
      
        /*tempMaze = tempMaze.map(row => {
            return row.map(tile => {            
                return switchDoor(tile, color)
            })
        })*/
        for (let row = 0; row< tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++){   
                tempMaze[row][column] = switchDoor(maze[row][column], color)
            }
        }
       
        setMaze(tempMaze);
    }

    const Move = (input) => {
        console.log('input', input)
        let tempMaze = maze

        tempMaze[player.y][player.x] = 0
        //console.log( tempMaze[player.y][player.x])

        if(input == "left" && tempMaze[player.y][player.x-1] <= 3 && tempMaze[player.y][player.x-2] == 0)
        {           
            if(tempMaze[player.y][player.x-1] == 1){
                invertDoors("red"); 
            } else if(tempMaze[player.y][player.x-1] == 2){
                invertDoors("blue");  
            } else if(tempMaze[player.y][player.x-1] == 3){
                invertDoors("green");
            }   
            player.x -= 2
        }
        if(input == "right"  && tempMaze[player.y][player.x+1] <= 3  && tempMaze[player.y][player.x+2] == 0)
        {
            console.log('right')
            if(tempMaze[player.y][player.x+1] == 1){                   
                invertDoors("red");
            } else if(tempMaze[player.y][player.x+1] == 2){
                invertDoors("blue");
            } else if(tempMaze[player.y][player.x+1] == 3){
                invertDoors("green");
            }
            player.x += 2
        }
        if(input == "up" && tempMaze[player.y-1][player.x] <= 3  && tempMaze[player.y-2][player.x] == 0)
        {
            if(tempMaze[player.y -1][player.x] == 1){
                invertDoors("red");
            } else if(tempMaze[player.y -1][player.x] == 2){
                invertDoors("blue");
            } else if(tempMaze[player.y -1][player.x] == 3){
                invertDoors("green");
            }
            player.y -= 2
        }
        if(input == "down" && tempMaze[player.y+1][player.x] <= 3  && tempMaze[player.y+2][player.x] == 0)
        {
            console.log('down')
            if(tempMaze[player.y +1][player.x] == 1){
                invertDoors("red");
            } else if(tempMaze[player.y +1][player.x] == 2){
                invertDoors("blue");
            } else if(tempMaze[player.y +1][player.x] == 3){
                invertDoors("green");
            }
            player.y += 2
        }
        tempMaze[player.y][player.x] = 'P'

        console.log('tempMaze', tempMaze)
        console.log('setting maze', player)
        setMaze(maze => [...tempMaze])
        console.log('maze:', maze)

        //console.log(`${player.x} ${player.y}`)
       /* if(player.x == tempMaze[0].length && player.y == tempMaze.length-1){
            alert(`Level Complete! You took ${stepCount} steps`)
            console.log("You Win!")
        }*/
        //debug()
    }

    //const gameBoard = <div className='game-board' id='game-board'></div>
    useEffect(() => {    
        console.log('model detected change')
        
     }, [JSON.stringify(maze)]);

    return (
        <div className='game-container'>
            <MazeController maze={maze} player={player} Move={Move}/>
            <div className='game-board' id='game-board'>
                <MazeView startingMaze={initialMaze} maze={maze} setMaze={setMaze} player={player} count={count}/>
            </div>
        </div>
    )
}

export default GameContainer;