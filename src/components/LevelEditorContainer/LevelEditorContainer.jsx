
import { useCallback, useState, useEffect } from "react";
import MazeView from '../MazeView/MazeView';
import MazeController from '../MazeController/MazeController';
import { levels } from "../../assets/levels";
import { sassNull } from "sass";
import LevelEditor from "../LevelEditor/LevelEditor";
import { generateLevel, generateLevelOfDifficulty } from "../../utils/gen";

const GameContainer = () => {

    const [levelNum, setlevelNum] = useState(levels.length)
    const [size, setSize] = useState(15)
    const [height, setHeight] = useState(12)
    const [count, setCount] = useState(0)
    const [maze, setMaze] = useState(levels[levelNum - 1].map(row => [...row])) //current state of maze .map creates a deep copy to not affect the imported levels
    const [mazeHistory, setMazeHistory] = useState([])
    const [canMove, setCanMove] = useState(true)
    const [initialMaze, setInitialMaze] = useState(levels[levelNum - 1].map(row => [...row])) //starting state of maze/level 
    const [dropper, setDropper] = useState('Wall/Path')
    const [solutionPath, setSolutionPath] = useState([])
    const [showSolution, setShowSolution] = useState(false)
    const [numColors, setNumColors] = useState(3)
    const [deadEnds, setDeadEnds] = useState([])
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveLevelName, setSaveLevelName] = useState('');
    const [saveSlot, setSaveSlot] = useState(1);
    
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

        setlevelNum((prevNum) => {
            return tempNum
        });

        let tempLevel = Array.from(levels[tempNum - 1])

        setInitialMaze(() => [...tempLevel])

        setMaze((prevMaze) => [...tempLevel]);
        setMazeHistory([]);
        //console.log('newInitialMaze:', levelNum, initialMaze)
    }

    const startOver = () => {
        setMaze((prevMaze) => {
            return [...initialMaze]
        })
        setCount(0)
        setMazeHistory([])
    }

    const switchDoors = (tempMaze, tile) => {
        for (let row = 0; row < tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++) {
                if (tempMaze[row][column] === tile) {
                    tempMaze[row][column] = tile.toUpperCase()
                } else if (tempMaze[row][column] === tile.toUpperCase()) {
                    tempMaze[row][column] = tile.toLowerCase()
                }
            }
        }
    }

    const Move = (input, currentMaze, currentPosition) => {

        if (canMove) {
            setCanMove(false)

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

            if (input === "left") {
                attemptedMove = tempMaze[playery][playerx - 2]
                attemptedX = playerx - 2
                tileInPath = tempMaze[playery][playerx - 1]
            }
            else if (input === "right") {
                attemptedMove = tempMaze[playery][playerx + 2]
                attemptedX = playerx + 2
                tileInPath = tempMaze[playery][playerx + 1]
            }
            else if (input === "up") {
                attemptedMove = tempMaze[playery - 2][playerx]
                attemptedY = playery - 2
                tileInPath = tempMaze[playery - 1][playerx]
            }
            else if (input === "down") {
                attemptedMove = tempMaze[playery + 2][playerx]
                attemptedY = playery + 2
                tileInPath = tempMaze[playery + 1][playerx]
            }

            if (!(/^[a-z]$/.test(tileInPath) && /^[a-z]$/.test(attemptedMove) && attemptedMove === 'p')) {
                console.log('invalid move')
                tempMaze[playery][playerx] = 'P';
            } else {
                setMazeHistory(history => [...history, maze.map(row => [...row])]);
                if (/^[a-z]$/.test(tileInPath) && tileInPath !== 'p') {
                    //invertDoors(tempMaze, color)
                    switchDoors(tempMaze, tileInPath)
                }
                tempMaze[attemptedY][attemptedX] = 'P'
                setCount(count + 1)
            }
            console.log('test:', /^[a-z]$/.test(tileInPath) && tileInPath !== 'p')

            console.log('tempMaze after move', tempMaze)
            setMaze(maze => [...tempMaze])
            setCanMove(true)
        }
    }

    function createArray(size) {
        // Initialize the array
        let tempMaze = [];

        // Loop through rows (height)
        for (let i = 0; i < size; i++) {
            // Initialize the row
            let row = [];

            // Loop through columns (width) and set each element to 'p'
            for (let j = 0; j < size; j++) {
                row.push('p');
            }

            // Add the row to the result array
            tempMaze.push(row);
        }
        for (let row = 0; row < tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++) {
                if (row === 0 || row === tempMaze.length - 1 || column === 0 || column === tempMaze[row].length - 1) {
                    tempMaze[row][column] = '-'
                    if (column === 0 || column === tempMaze.length - 1) {
                        tempMaze[row][column] = '|'
                    }
                }
                if (((row === 0 || row === tempMaze.length - 1) && (column % 2 === 0)) || ((column === 0 || column === tempMaze.length - 1) && row % 2 === 0) || (row % 2 === 0 && column % 2 === 0)) {
                    tempMaze[row][column] = '+'
                }
            }
        }
        tempMaze[1][1] = 'P'
        return tempMaze;
    }

    //generative////////////////

    function createRandArray(size) {
        // Initialize the array
        let tempMaze = [];

        // Loop through rows (height)
        for (let i = 0; i < size; i++) {
            // Initialize the row
            let row = [];

            // Loop through columns (width) and set each element to 'p'
            for (let j = 0; j < size; j++) {
                row.push('p');
            }

            // Add the row to the result array
            tempMaze.push(row);
        }
        for (let row = 0; row < tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++) {
                if ((row !== 0 || row !== tempMaze.length - 1) && (column !== 0 || column === tempMaze.length - 1) && (row % 2 === 0 || column % 2 === 0)) {
                    let max = 27
                    let doorcuttoff = 24
                    let rng = Math.floor(Math.random() * max);

                    let randomTile = 'p'
                    if (rng === 0 || (rng > 16 && rng < doorcuttoff + 1)) {
                        randomTile = 'p'
                    } else if ((rng === 1 || rng > doorcuttoff) && column % 2 === 0) {
                        randomTile = '|'
                    } else if ((rng === 1 || rng > doorcuttoff) && row % 2 === 0) {
                        randomTile = '-'
                    } else if (rng === 2) {
                        randomTile = 'r'
                    } else if (rng === 3) {
                        randomTile = 'R'
                    } else if (rng === 4) {
                        randomTile = 'g'
                    } else if (rng === 5) {
                        randomTile = 'G'
                    } else if (rng === 6) {
                        randomTile = 'b'
                    } else if (rng === 7) {
                        randomTile = 'B'
                    } else if (rng === 8) {
                        randomTile = 'o'
                    } else if (rng === 9) {
                        randomTile = 'O'
                    } else if (rng === 10) {
                        randomTile = 'm'
                    } else if (rng === 11) {
                        randomTile = 'M'
                    } else if (rng === 12) {
                        randomTile = 'c'
                    } else if (rng === 13) {
                        randomTile = 'C'
                    } else if (rng === 15) {
                        randomTile = 'y'
                    } else if (rng === 16) {
                        randomTile = 'Y'
                    }
                    tempMaze[row][column] = randomTile
                }
                if (row === 0 || row === tempMaze.length - 1 || column === 0 || column === tempMaze[row].length - 1) {
                    tempMaze[row][column] = '-'
                    if (column === 0 || column === tempMaze.length - 1) {
                        tempMaze[row][column] = '|'
                    }
                }
                if (((row === 0 || row === tempMaze.length - 1) && (column % 2 === 0)) || ((column === 0 || column === tempMaze.length - 1) && row % 2 === 0) || (row % 2 === 0 && column % 2 === 0)) {
                    tempMaze[row][column] = '+'
                }

            }
        }
        tempMaze[1][1] = 'P'
        setMaze(tempMaze)
        setMazeHistory([])
    }

    function generateMaze(size) {
        // Initialize the array
        let resultArray = [];

        // Generate a random player position
        const playerRow = Math.floor(Math.random() * size);
        const playerCol = Math.floor(Math.random() * size);

        // Generate a random exit position on the edge
        const exitSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let exitRow, exitCol;

        switch (exitSide) {
            case 0: // top
                exitRow = 0;
                exitCol = Math.floor(Math.random() * size);
                break;
            case 1: // right
                exitRow = Math.floor(Math.random() * size);
                exitCol = size - 1;
                break;
            case 2: // bottom
                exitRow = size - 1;
                exitCol = Math.floor(Math.random() * size);
                break;
            case 3: // left
                exitRow = Math.floor(Math.random() * size);
                exitCol = 0;
                break;
        }

        // Loop through rows (size)
        for (let i = 0; i < size; i++) {
            // Initialize the row
            let row = [];

            // Loop through columns (size) and set each element to 'p' or 'P' or 'E'
            for (let j = 0; j < size; j++) {
                if (i === playerRow && j === playerCol) {
                    row.push('P'); // Player
                } else if (i === exitRow && j === exitCol) {
                    row.push('E'); // Exit
                } else {
                    row.push('p'); // Path
                }
            }

            // Add the row to the result array
            resultArray.push(row);
        }

        setMaze(resultArray);
    }

    function handleGenerateLevel() {
        console.log('size', size)
        const { newMaze, solutionPath: newPath, deadEnds: newDeadEnds } = generateLevel(size, numColors);
        setMaze(newMaze);
        setInitialMaze(newMaze.map(row => [...row]));
        setSolutionPath(newPath);
        setDeadEnds(newDeadEnds || []);
        setCount(0);
        setMazeHistory([]);
    }

    function handleGenerateLevelOfDifficulty(difficulty) {
        const { newMaze, solutionPath: newPath, deadEnds: newDeadEnds, size: newSize, numColors: newNumColors } = generateLevelOfDifficulty(difficulty);
        setSize(newSize);
        setNumColors(newNumColors);
        setMaze(newMaze);
        setInitialMaze(newMaze.map(row => [...row]));
        setSolutionPath(newPath);
        setDeadEnds(newDeadEnds || []);
        setCount(0);
        setMazeHistory([]);
    }

    function drawPath(maze) {
        const size = maze.length;

        // Find the player ('P') and exit ('E') positions
        let playerRow, playerCol, exitRow, exitCol;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (maze[i][j] === 'P') {
                    playerRow = i;
                    playerCol = j;
                } else if (maze[i][j] === 'E') {
                    exitRow = i;
                    exitCol = j;
                }
            }
        }

        // Initialize the path array
        let pathArray = [...maze.map(row => row.slice())]; // Create a deep copy of the maze

        // Draw a random path from player to exit
        let currentRow = playerRow;
        let currentCol = playerCol;

        while (currentRow !== exitRow || currentCol !== exitCol) {
            pathArray[currentRow][currentCol] = 'x';

            // Move randomly (up, down, left, or right)
            const randomDirection = Math.floor(Math.random() * 4);

            switch (randomDirection) {
                case 0: // Move up
                    if (currentRow > 0) currentRow--;
                    break;
                case 1: // Move down
                    if (currentRow < size - 1) currentRow++;
                    break;
                case 2: // Move left
                    if (currentCol > 0) currentCol--;
                    break;
                case 3: // Move right
                    if (currentCol < size - 1) currentCol++;
                    break;
            }
        }

        setMaze(pathArray);
    }

    ////////////////////////////////////////////////

    const handleSizeChange = (event) => {
        const newSize = parseInt(event.target.value, 10);
        if (!(newSize % 2 === 0)) {
            console.log(newSize);
            setSize(newSize);
            let newMaze = createArray(newSize);
            setMaze(newMaze);
        }
    };

    const setNewDropper = (val) => {
        if (val === dropper) {
            return
        } else {
            setDropper(val)
        }
    }

    const resetPlayer = () => {
        let tempMaze = maze.map(row => [...row]);
        console.log(findPlayerPos(tempMaze).x, findPlayerPos(tempMaze).y)
        console.log(tempMaze)
        console.log(findPlayerPos(initialMaze).x, findPlayerPos(initialMaze).y)
        tempMaze[findPlayerPos(tempMaze).x][findPlayerPos(tempMaze).y] = 'p'
        tempMaze[findPlayerPos(initialMaze).x][findPlayerPos(initialMaze).y] = 'P'
        setMaze(maze => [...tempMaze])
    }

    const setNewMaze = (tileBeingChanged, val) => {
        if (dropper === 'solution') {
            setSolutionPath(prev => [...prev, { x: tileBeingChanged.y, y: tileBeingChanged.x }]);
            return;
        }

        if (dropper === 'P' && val === 'P') {
            const playerExists = maze.some(row => row.includes('P'));
            if (playerExists) {
                alert("There can only be one player in the maze!");
                return;
            }
        }

        let tempMaze = maze.map(row => [...row]);
        tempMaze[tileBeingChanged.x][tileBeingChanged.y] = val;
        setMaze(maze => [...tempMaze]);
        setInitialMaze(initialMaze => [...tempMaze]);
    }

    const Save = () => {
        navigator.clipboard.writeText(JSON.stringify(maze));
        alert('Maze copied to clipboard!');
    }

    const handleSaveLevel = () => {
        let storedLevels = [];
        try {
            const stored = localStorage.getItem('userLevels');
            if (stored) {
                storedLevels = JSON.parse(stored);
            }
        } catch (e) {}
        
        const padded = Array(10).fill(null);
        storedLevels.forEach((val, idx) => {
            if (idx < 10) padded[idx] = val;
        });

        padded[saveSlot - 1] = { name: saveLevelName || `Level ${saveSlot}`, maze: maze.map(row => [...row]) };
        localStorage.setItem('userLevels', JSON.stringify(padded));
        setShowSaveModal(false);
        alert('Level saved!');
    };

    const undo = useCallback(() => {
        if (mazeHistory.length > 0) {
            const previousMaze = mazeHistory[mazeHistory.length - 1];
            setMaze(previousMaze.map(row => [...row]));
            setMazeHistory(history => history.slice(0, -1));
            setCount(prev => prev > 0 ? prev - 1 : 0);
        }
    }, [mazeHistory]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            e.preventDefault();
            //console.log(`Key pressed: ${e.key}`);
            //console.log('cmoving from', playerX, playerY, maze)
            if (e.key === 'w' || e.key === 'ArrowUp') {
                Move("up");
            } else if (e.key === 's' || e.key === 'ArrowDown') {
                Move("down");
            } else if (e.key === 'a' || e.key === 'ArrowLeft') {
                Move("left");
            } else if (e.key === 'd' || e.key === 'ArrowRight') {
                Move("right");
            } else if (e.key === ' ') {
                startOver();
            } else if (e.key === 'Enter' || e.key === 'Backspace') {
                undo();
            }
        }

        setPlayerX(findPlayerPos(maze).x);
        setPlayerY(findPlayerPos(maze).y);

        document.addEventListener('keydown', handleKeyPress);
        //console.log('useEffect:', 'level',levelNum, 'player',playerX, playerY, 'current:', maze)//, 'initial:', initialMaze)//values work here can Move() go inside this?
        //console.log(levels[levelNum-1])

        return () => {
            // Cleanup: Remove event listener when the component unmounts
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [dropper, maze, playerX, playerY, initialMaze, size, undo]);//, JSON.stringify(maze)]);

    const trueSize = (inp) => {
        let out = inp + 1
        //console.log(out)
        // console.log(out/2)
        return out / 2
    }

    return (
        <>
            <div className="flex">
                <div className="mr-2">Size: {(size / 2) - 0.5}x{(size / 2) - 0.5}</div>
                <div className="mr-2">Dropper: {dropper}</div>
            </div>
            {showSaveModal && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 1000, border: '1px solid black', display: 'flex', flexDirection: 'column', gap: '10px', color: 'black' }}>
                    <h3>Save Level</h3>
                    <input type="text" placeholder="Level Name" value={saveLevelName} onChange={(e) => setSaveLevelName(e.target.value)} style={{ color: 'black' }} />
                    <select value={saveSlot} onChange={(e) => setSaveSlot(Number(e.target.value))} style={{ color: 'black' }}>
                        {[...Array(10)].map((_, i) => (
                            <option key={i} value={i + 1}>Slot {i + 1}</option>
                        ))}
                    </select>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleSaveLevel}>Save</button>
                        <button onClick={() => setShowSaveModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
            <div className='game-container level-editor-container'>
                <div className="instructions game-instructions">
                    <h3 id="counter">Steps: {count}</h3>
                    <div className="controls">
                        <div className="control-up">
                            <button id="up" onClick={() => { Move("up") }}></button>
                        </div>
                        <div className="flex">
                            <button id="left" onClick={() => { Move("left") }}></button>
                            <button id="down" onClick={() => { Move("down") }}></button>
                            <button id="right" onClick={() => { Move("right") }}></button>
                        </div>
                    </div>
                    <div>
                        <h3>Level: {levelNum}/{levels.length}</h3>
                    </div>
                </div>
                <div className="flex">
                    <div className='game-board' id='game-board'>
                        <LevelEditor dropper={dropper} setNewMaze={setNewMaze} startingMaze={initialMaze} maze={maze} setMaze={setMaze} solutionPath={solutionPath} showSolution={showSolution} deadEnds={deadEnds} />
                    </div>
                    <div className="tile-list">
                        <div>
                            <p>Size: {(size / 2) - 0.5}x{(size / 2) - 0.5}</p>
                            <input type="range" min="5" max="29" value={size} onChange={handleSizeChange} />
                        </div>
                        <button onClick={() => { setNewDropper('Wall/Path') }}>Wall/Path: {dropper === 'Wall/Path' ? 'selected' : ''}</button>
                        <button onClick={() => { setNewDropper('r') }}>Red: {dropper === 'r' ? 'selected' : ''}</button>
                        <button onClick={() => { setNewDropper('g') }}>Green: {dropper === 'g' ? 'selected' : ''}</button>
                        <button onClick={() => { setNewDropper('b') }}>Blue: {dropper === 'b' ? 'selected' : ''}</button>
                        <button onClick={() => { setNewDropper('y') }}>Yellow: {dropper === 'y' ? 'selected' : ''}</button>
                        <button onClick={() => { setNewDropper('m') }}>Magenta: {dropper === 'm' ? 'selected' : ''}</button>
                        <button onClick={() => { setNewDropper('o') }}>Orange: {dropper === 'o' ? 'selected' : ''}</button>
                        <button onClick={() => { setNewDropper('c') }}>Cyan: {dropper === 'c' ? 'selected' : ''}</button>
                        <button onClick={() => { setNewDropper('P') }}>Player: {dropper === 'P' ? 'selected' : ''}</button>
                        <button onClick={() => { setNewDropper('E') }}>Exit: {dropper === 'E' ? 'selected' : ''}</button>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => { setNewDropper('solution'); setShowSolution(true); }}>Solution ({solutionPath.length}): {dropper === 'solution' ? 'selected' : ''}</button>
                            <button onClick={() => setSolutionPath(prev => prev.slice(0, -1))}>Remove Last Step</button>
                        </div>
                        <button id="refresh" onClick={() => { createRandArray(size) }}>randomise</button>
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px', gap: '5px' }}>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <span>Colors: {numColors}</span>
                                <button onClick={() => setNumColors(Math.max(1, numColors - 1))}>-</button>
                                <button onClick={() => setNumColors(Math.min(7, numColors + 1))}>+</button>
                            </div>
                            <button onClick={handleGenerateLevel}>Generate Solvable Level</button>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={() => handleGenerateLevelOfDifficulty(0)}>Easy</button>
                                <button onClick={() => handleGenerateLevelOfDifficulty(1)}>Medium</button>
                                <button onClick={() => handleGenerateLevelOfDifficulty(2)}>Hard</button>
                            </div>
                            <button onClick={() => setShowSolution(!showSolution)}>{showSolution ? 'Hide Solution' : 'Show Solution'}</button>
                        </div>
                    </div>
                </div>
                <div className="flex lower-buttons">
                    <button id="refresh" onClick={() => { startOver() }}>start over</button>
                    <button id="undo" onClick={undo} disabled={mazeHistory.length === 0}>undo</button>
                    <button id="save" onClick={() => { Save() }}>copy to clipboard</button>
                    <button style={{ marginLeft: '10px' }} onClick={() => setShowSaveModal(true)}>Save Level</button>
                </div>
            </div>
        </>
    )
}

export default GameContainer;
//<button id="refresh"  onClick={() => {generateMaze(size)}}>generate</button>

//<MazeController playerx={playerX} playery={playerY} maze={maze} Move={Move} levelNum={levelNum} raiseLevel={raiseLevel}/>