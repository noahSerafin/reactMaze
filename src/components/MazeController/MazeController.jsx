import { useCallback, useEffect } from "react";

const MazeController = (props) => {

    const {playerx, playery, maze, Move, levelNum, raiseLevel} = props;

    const handleKeyPress = useCallback((e) => {
        e.preventDefault();
        console.log(`Key pressed: ${e.key}`);
        console.log('cmoving from', playerx, playery, maze)
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

    useEffect(() => {
        // attach the event listener
        document.addEventListener('keydown', handleKeyPress);
        //console.log('controller', maze)
        console.log('moved to:', playerx, playery, maze)
    }, [maze, playerx, playery, handleKeyPress]);
    

    return (
        <>
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
            <button id="refresh">start over</button>
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
        </>
    )
}

export default MazeController;