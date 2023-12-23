import { useState, useEffect } from "react";

//visual repesentation of tile
const Tile = (props) => {

    const {id, type, style} = props;

    let doorStart = ''
    if(type.includes('door') && type.includes('open')){
        doorStart = 'isOpen'
    } else if(type.includes('door') && type.includes('closed')){
        doorStart = 'isClosed'
    }
    const [doorState, setDoorState] = useState(doorStart);

    return (
        <div id={id} className={`${type} ${doorState}`} style={style}></div>
    )
}

export default Tile;