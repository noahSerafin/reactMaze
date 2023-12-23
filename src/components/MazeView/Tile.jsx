import { useState, useEffect } from "react";

//visual repesentation of tile
const Tile = (props) => {

    const {tile} = props;

   /* useEffect(() => {
        console.log('tile detected change')
        //console.log(maze[tile.x][tile.y])
    }, [maze[tile.x][tile.y]]);*/

    let doorStart = ''
    if(tile.classList.includes('door') && tile.classList.includes('open')){
        doorStart = 'isOpen'
    } else if(tile.classList.includes('door') && tile.classList.includes('closed')){
        doorStart = 'isClosed'
    }
    const [doorState, setDoorState] = useState(doorStart);

    return (
        <div id={tile.id} className={`${tile.classList} ${doorState}`} style={tile.style}></div>
    )
    //{maze[tile.x][tile.y]}
}

export default Tile;