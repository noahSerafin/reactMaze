import React, { useState, useEffect } from "react";
import Tile from "./Tile";

const MazeView = (props) => {
    console.log('maxeView')

    const {startingMaze, maze, setMaze, player, count} = props;
    const [stepCount, setStepCount] = useState(count)
    //console.log('gameBoard:', gameBoard);

    const wides = (maze[0].length-1)/2;
    const shorts = ((maze[0].length-1)/2+1);
    const segmentWidth = 100 / ((wides * 4) + shorts)

    const [currentMaze, setCurrentMaze] = useState(maze);

    function returnPiece(tile){
        switch(tile){    
            case 0:
                return 'path'            
            case 1:                        
                return 'red open'
            case 2:
                return 'blue open'
            case 3:
               return 'green open'
            case 4:
                return 'wall'
            case '-':
                return 'wall'
            case '|':
                return 'wall'
            case '+':
                return 'corner' 
            case 5:
               return 'red closed'
            case 6:
                return 'blue closed'
            case 7:
                return 'green closed'
            case '0':
                return 'path'
            case 'P':
                return 'player'
            case 'E':
                return 'finish'
            case tile > 7:
                return 'wall'
        }  
    }

    //draw the maze
    function draw(){

        let tempMaze = maze;
        let tileList = []
    
        //gameBoard.innerHTML = '';
        //tempMaze[player.y][player.x] = 'P'

        //draw goal
        tempMaze[tempMaze[0].length-2][tempMaze.length-1] = 'E'
        
        let i = 0;
        for (let row = 0; row< tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++){
                var tile = tempMaze[row][column];  
                const newTile = {
                    id: '',
                    classList: '',
                    open: false,
                    style: {
                        gridRowStart: null,
                        gridColumnStart: null,
                        width: '',
                        height: ''
                    },
                    value: tempMaze[row][column],
                    x: row,
                    y: column
                }
                if(!isNaN(tile) && tile !== 4 && tile !== 0){
                    newTile.classList = newTile.classList.concat(' door ')
                }
                if(tile === '-' ||  tile == '|'){
                    tile = 4;
                }          
                newTile.style.gridRowStart = newTile.style.gridRowStart = row +1
                newTile.style.gridColumnStart = newTile.style.gridColumnStart = column +1
                newTile.classList = newTile.classList.concat(returnPiece(tile));
                newTile.classList = newTile.classList.concat(' tile ');
                if(row == 0 || row  % 2 == 0){
                    newTile.classList = newTile.classList.concat(' horizontal ')
                    newTile.style.width = `${(segmentWidth*4)}%`
                    newTile.style.height = `${(segmentWidth)}%`
                } else if(column == 0 || column  % 2 == 0 ){
                    newTile.classList = newTile.classList.concat(' vertical ')
                    newTile.style.width = `${(segmentWidth)}%`
                    newTile.style.height = `${(segmentWidth*4)}%`
                } else{
                    newTile.classList = newTile.classList.concat(' full ')
                    newTile.style.width = `${(segmentWidth*4)}%`
                }
                if(newTile.classList.includes('corner')){
                    newTile.style.width = `${(segmentWidth)}%`
                    newTile.style.height = `${(segmentWidth)}%`
                }
                newTile.id = `${row} ${column}`;
           
                tileList.push(newTile)
                i++
            }
        }
        //console.log(tileList)
        setMaze(tempMaze);
        //console.log(maze)

        return tileList;
    }

    let tiles = draw().map(function(tile) {
        //console.log('drawing')
        return(
            <Tile tile={tile}/>
        )
    })
    
    return (
        <>
        {tiles}
        </>
    )
}

export default MazeView;