import React, { useState, useEffect } from "react";
import EditableTile from "../GamePieces/EditableTile";

const LevelEditor = (props) => {

    const {dropper, setDropper, setNewMaze, maze, setMaze, player, count} = props;
    //console.log('gameBoard:', gameBoard);

    const wides = (maze[0].length-1)/2;
    const shorts = ((maze[0].length-1)/2+1);
    const segmentWidth = 100 / ((wides * 4) + shorts)

    function returnPiece(tile){
        if (tile === tile.toLowerCase()) {
            // Lowercase tiles
            switch (tile) {
                case 'p':
                    return 'path';
                case 'r':
                    return 'red door open';
                case 'b':
                    return 'blue door open';
                case 'g':
                    return 'green door open';
                case 'm':
                    return 'magenta door open';
                case 'c':
                    return 'cyan door open';
                case 'y':
                    return 'yellow door open';
                case 'o':
                    return 'orange door open';
                case '-':
                    return 'wall';
                case '|':
                    return 'wall';
                case '+':
                    return 'corner';
                case '0':
                    return 'void';
                case 'e':
                    return 'finish';
            }   
        }  else {
            switch (tile) {
                case 'R':
                    return 'red door closed';
                case 'B':
                    return 'blue door closed';
                case 'G':
                    return 'green door closed';
                case 'M':
                    return 'magenta door closed';
                case 'C':
                    return 'cyan door closed';
                case 'Y':
                    return 'yellow door closed';
                case 'O':
                    return 'orange door closed';
                case 'P':
                    return 'player';
                case 'E':
                    return 'finish';
            }
        }
    }

    //draw the maze
    function draw(){

        let tempMaze = Array.from(maze);
        let tileList = []
    
        //gameBoard.innerHTML = '';
        //tempMaze[player.y][player.x] = 'P'

        //draw goal
        //tempMaze[tempMaze[0].length-2][tempMaze.length-1] = 'E'
        
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
        //setMaze(tempMaze);
        //console.log(maze)

        return tileList;
    }

    let tileID = 0
    let tiles = draw().map(function(tile) {
        //console.log('drawing')
        tileID++
        return(
            <EditableTile key={tileID} tile={tile} dropper={dropper} setNewMaze={setNewMaze}/>
        )
    })

    /*useEffect(() => {
        console.log('viewStart', startingMaze)
        console.log('view', maze)
        //draw()
    }, [startingMaze, maze]);*/
    
    return (
        <>
        {tiles}
        </>
    )
}

export default LevelEditor;