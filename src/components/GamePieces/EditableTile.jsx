
import { useState, useEffect } from "react";

//visual repesentation of tile
const EditableTile = (props) => {

    const {dropper, setNewMaze, tile} = props;

    let doorStart = ''
    if(tile.classList.includes('door') && tile.classList.includes('open')){
        doorStart = 'isOpen'
    } else if(tile.classList.includes('door') && tile.classList.includes('closed')){
        doorStart = 'isClosed'
    }
    const [doorState, setDoorState] = useState(doorStart);
    const [val, setVal] = useState('+');

    let msg = ''
    const determineVal = (dropper) => {
        if(!tile.classList.includes('corner')){
            if(tile.classList.includes('full')){
                if(tile.value === '0'){
                    setVal('p')
                } else if(tile.value === 'p'){
                    setVal('0')
                }
            } else if(dropper === 'Wall/Path'){
                if (tile.value === '-' || tile.value === '|'){
                    setVal('p')
                } else if(tile.classList.includes('horizontal')){
                    setVal('-')
                } else if(tile.classList.includes('vertical')){
                    setVal('|')
                }
            } else if(dropper === 'E'){
                if(tile.value === '-' || tile.value === '|' || tile.value === 'p'){
                    setVal('E')
                } else if(tile.value === 'E'){
                    setVal('p')
                }
            } else if(/^[a-z]$/.test(dropper)){
                //msg = `${(/^[a-z]$/.test(dropper))}`
                if(/^[a-z]$/.test(tile.value)){
                    setVal(dropper.toUpperCase())
                    //console.log
                } else {
                    setVal(dropper)
                }
            }
        }
    }

    useEffect(() => {
        determineVal(dropper)
    }, [dropper, tile]);

    return (
        <div onClick={() => {setNewMaze(tile, val)}} id={tile.id} className={`${tile.classList} ${doorState}`} style={tile.style}>
        
        </div>
    )
}
/*
 <div className="switch">{msg}</div>
            {tile.value}
            <div className="switch">{val}</div>
*/

export default EditableTile;