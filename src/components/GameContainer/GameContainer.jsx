import { useCallback, useState, useEffect } from "react";
import MazeView from '../MazeView/MazeView';
import { generateLevelOfDifficulty } from "../../utils/gen";
import { generateExpertLevel } from "../../utils/genHardForTesting";

const GameContainer = ({ onScoreUpdate }) => {
    // Current date and difficulty state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [difficulty, setDifficulty] = useState(0); // 0: Easy, 1: Medium, 2: Hard, 3: Expert

    const getDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // State for maze, initialized gracefully
    const [maze, setMaze] = useState([]);
    const [initialMaze, setInitialMaze] = useState([]);
    const [mazeHistory, setMazeHistory] = useState([]);
    const [undoLives, setUndoLives] = useState(3);
    const [solutionPath, setSolutionPath] = useState([]);
    const [showSolution, setShowSolution] = useState(false);
    const [count, setCount] = useState(0); // steps
    const [canMove, setCanMove] = useState(true);
    const [solutionLengths, setSolutionLengths] = useState([0, 0, 0, 0]);
    const [showCompletionPopup, setShowCompletionPopup] = useState(false);
    const [showGameOverPopup, setShowGameOverPopup] = useState(false);
    const [solvedMazes, setSolvedMazes] = useState({});

    const [playerX, setPlayerX] = useState(-1);
    const [playerY, setPlayerY] = useState(-1);

    const findPlayerPos = (currentMaze) => {
        for (let row = 0; row < currentMaze.length; row++) {
            for (let column = 0; column < currentMaze[row].length; column++) {
                if (currentMaze[row][column] === 'P') {
                    return { x: column, y: row };
                }
            }
        }
        return { x: -1, y: -1 };
    };

    const loadDailyMaze = useCallback((date, diff) => {
        const dateStr = getDateString(date);
        console.log(`Loading daily maze for ${dateStr}, difficulty: ${diff}`);

        let levelData;
        if (diff === 3) {
            levelData = generateExpertLevel(dateStr);
        } else {
            levelData = generateLevelOfDifficulty(diff, dateStr);
        }

        setMaze(levelData.newMaze);
        setInitialMaze(levelData.newMaze.map(row => [...row]));
        setSolutionPath(levelData.solutionPath);

        setCount(0);
        setMazeHistory([]);
        setUndoLives(3);
        setShowSolution(false);
        setCanMove(true);
        setShowGameOverPopup(false);

        const pos = findPlayerPos(levelData.newMaze);
        setPlayerX(pos.x);
        setPlayerY(pos.y);
    }, []);

    // Load maze when date or difficulty changes
    useEffect(() => {
        loadDailyMaze(currentDate, difficulty);

        const dateStr = getDateString(currentDate);
        const saved = localStorage.getItem(`solvedMazes_${dateStr}`);
        if (saved) {
            setSolvedMazes(prev => ({ ...prev, [dateStr]: JSON.parse(saved) }));
        } else {
            setSolvedMazes(prev => ({ ...prev, [dateStr]: [] }));
        }
    }, [currentDate, difficulty, loadDailyMaze]);

    // Calculate solution lengths when date changes
    useEffect(() => {
        const dateStr = getDateString(currentDate);
        setSolutionLengths([
            generateLevelOfDifficulty(0, dateStr).solutionPath.length,
            generateLevelOfDifficulty(1, dateStr).solutionPath.length,
            generateLevelOfDifficulty(2, dateStr).solutionPath.length,
            generateExpertLevel(dateStr).solutionPath.length
        ]);
    }, [currentDate]);

    // Show game over popup if lives hit 0
    useEffect(() => {
        if (undoLives === 0 && !showSolution) {
            setShowGameOverPopup(true);
        }
    }, [undoLives, showSolution]);

    const startOver = () => {
        setMaze(initialMaze.map(row => [...row]));
        setCount(0);
        setMazeHistory([]);
        setUndoLives(3);
        setShowSolution(false);
        setShowGameOverPopup(false);
        const pos = findPlayerPos(initialMaze);
        setPlayerX(pos.x);
        setPlayerY(pos.y);
    };

    const giveUp = () => {
        setShowGameOverPopup(false);
        setShowSolution(true);
    };

    const switchDoors = (tempMaze, tile) => {
        for (let row = 0; row < tempMaze.length; row++) {
            for (let column = 0; column < tempMaze[row].length; column++) {
                if (tempMaze[row][column] === tile) {
                    tempMaze[row][column] = tile.toUpperCase();
                } else if (tempMaze[row][column] === tile.toUpperCase()) {
                    tempMaze[row][column] = tile.toLowerCase();
                }
            }
        }
    };

    const Finish = () => {
        console.log('COMPLETE');
        setShowCompletionPopup(true);

        if (showSolution) return;

        const dateStr = getDateString(currentDate);
        const saved = localStorage.getItem(`solvedMazes_${dateStr}`);
        let currentSolved = saved ? JSON.parse(saved) : [];
        if (!currentSolved.includes(difficulty)) {
            currentSolved.push(difficulty);
            localStorage.setItem(`solvedMazes_${dateStr}`, JSON.stringify(currentSolved));
            setSolvedMazes(prev => ({
                ...prev,
                [dateStr]: currentSolved
            }));
            if (onScoreUpdate) onScoreUpdate();
        }
    };

    const closeCompletionPopup = () => {
        setShowCompletionPopup(false);
        setShowSolution(true);
    };

    const Move = useCallback((input) => {
        if (!canMove || maze.length === 0 || showGameOverPopup || showCompletionPopup) return;
        setCanMove(false);

        let tempMaze = maze.map(row => [...row]);
        let playerx = playerX;
        let playery = playerY;

        tempMaze[playery][playerx] = 'p';

        let attemptedMove = null;
        let attemptedX = playerx;
        let attemptedY = playery;
        let tileInPath = null;

        if (input === "left") {
            attemptedMove = tempMaze[playery][playerx - 2];
            attemptedX = playerx - 2;
            tileInPath = tempMaze[playery][playerx - 1];
        } else if (input === "right") {
            attemptedMove = tempMaze[playery][playerx + 2];
            attemptedX = playerx + 2;
            tileInPath = tempMaze[playery][playerx + 1];
        } else if (input === "up") {
            attemptedMove = tempMaze[playery - 2]?.[playerx];
            attemptedY = playery - 2;
            tileInPath = tempMaze[playery - 1]?.[playerx];
        } else if (input === "down") {
            attemptedMove = tempMaze[playery + 2]?.[playerx];
            attemptedY = playery + 2;
            tileInPath = tempMaze[playery + 1]?.[playerx];
        }

        if (!(/^[a-z]$/.test(tileInPath) && /^[a-z]$/.test(attemptedMove) && attemptedMove === 'p')) {
            // invalid move
            tempMaze[playery][playerx] = 'P';
        } else {
            setMazeHistory(history => [...history, maze.map(row => [...row])]);
            if (/^[a-z]$/.test(tileInPath) && tileInPath !== 'p') {
                switchDoors(tempMaze, tileInPath);
            }
            tempMaze[attemptedY][attemptedX] = 'P';
            setCount(c => c + 1);
            setPlayerX(attemptedX);
            setPlayerY(attemptedY);
        }

        setMaze(tempMaze);
        if (tileInPath === 'E') {
            Finish();
        }
        setCanMove(true);
    }, [canMove, maze, playerX, playerY, showGameOverPopup, showCompletionPopup]);

    const undo = useCallback(() => {
        if (undoLives > 0 && mazeHistory.length > 0) {
            const previousMaze = mazeHistory[mazeHistory.length - 1];
            setMaze(previousMaze.map(row => [...row]));
            setMazeHistory(history => history.slice(0, -1));
            setCount(prev => prev > 0 ? prev - 1 : 0);
            setUndoLives(lives => lives - 1);

            const pos = findPlayerPos(previousMaze);
            setPlayerX(pos.x);
            setPlayerY(pos.y);
        }
    }, [undoLives, mazeHistory]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            // prevent default for arrows and space if we are focused on game, but let's just do it broadly like before
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === 'w' || e.key === 'ArrowUp') Move("up");
            else if (e.key === 's' || e.key === 'ArrowDown') Move("down");
            else if (e.key === 'a' || e.key === 'ArrowLeft') Move("left");
            else if (e.key === 'd' || e.key === 'ArrowRight') Move("right");
            else if (e.key === ' ') startOver();
            else if (e.key === 'Enter' || e.key === 'Backspace') undo();
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [Move, undo]);

    const changeDate = (days) => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + days);
            return d;
        });
    };

    const randomDate = () => {
        const now = new Date();
        const pastYear = new Date();
        pastYear.setFullYear(now.getFullYear() - 1);

        const randTime = pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime());
        setCurrentDate(new Date(randTime));
        setDifficulty(0);
    };

    const diffStrings = ["Easy", "Medium", "Hard", "Expert"];

    if (maze.length === 0) return <div>Loading...</div>;

    return (
        <div className='game-container'>
            {showCompletionPopup && (
                <div className="popup-overlay">
                    <div className="popup-menu">
                        <h2>Level complete!</h2>
                        <p>You took {count} Steps</p>
                        <button onClick={closeCompletionPopup}>
                            Reveal Solution
                        </button>
                    </div>
                </div>
            )}
            {showGameOverPopup && (
                <div className="popup-overlay">
                    <div className="popup-menu">
                        <h2>Out of Lives!</h2>
                        <p>What would you like to do?</p>
                        <button onClick={giveUp}>
                            Give Up (Reveal Solution)
                        </button>
                        <button onClick={startOver}>
                            Start Over
                        </button>
                    </div>
                </div>
            )}
            <div className="flex bottom-text">WASD to move, or use arrow buttons</div>
            <div className="instructions game-instructions">
                <h3 id="counter">Steps: {count}</h3>
                <div className="controls">
                    <div className="control-up">
                        <button id="up" onClick={() => Move("up")}></button>
                    </div>
                    <div className="flex">
                        <button id="left" onClick={() => Move("left")}></button>
                        <button id="down" onClick={() => Move("down")}></button>
                        <button id="right" onClick={() => Move("right")}></button>
                    </div>
                </div>
                <div>
                    <h3>{getDateString(currentDate)} - {diffStrings[difficulty]}</h3>
                </div>
            </div>

            <div className="flex lower-buttons" style={{ marginBottom: '10px' }}>
                <button className={difficulty === 0 ? "active" : ""} onClick={() => setDifficulty(0)}>
                    Easy [{solutionLengths[0] / 2 - 1}] {(solvedMazes[getDateString(currentDate)] || []).includes(0) ? "⭐" : ""}
                </button>
                <button className={difficulty === 1 ? "active" : ""} onClick={() => setDifficulty(1)}>
                    Medium [{solutionLengths[1] / 2 - 1}] {(solvedMazes[getDateString(currentDate)] || []).includes(1) ? "⭐" : ""}
                </button>
                <button className={difficulty === 2 ? "active" : ""} onClick={() => setDifficulty(2)}>
                    Hard [{solutionLengths[2] / 2 - 1}] {(solvedMazes[getDateString(currentDate)] || []).includes(2) ? "⭐" : ""}
                </button>
                <button className={difficulty === 3 ? "active" : ""} onClick={() => setDifficulty(3)}>
                    Expert [{solutionLengths[3] / 2 - 1}] {(solvedMazes[getDateString(currentDate)] || []).includes(3) ? "⭐" : ""}
                </button>
            </div>

            <div className='game-board' id='game-board'>
                <MazeView startingMaze={initialMaze} maze={maze} setMaze={setMaze} count={count} solutionPath={solutionPath} showSolution={showSolution} />
            </div>

            <div className="flex lower-buttons">
                <button id="refresh" onClick={startOver}>start over</button>
                <button id="undo" onClick={undo} disabled={undoLives === 0 || mazeHistory.length === 0}>
                    undo {'❤️'.repeat(undoLives)}
                </button>
            </div>
            <div className="flex lower-buttons" style={{ marginTop: '10px' }}>
                <button onClick={() => changeDate(-1)}>Yesterday</button>
                <button onClick={() => changeDate(1)} disabled={getDateString(currentDate) === getDateString(new Date())}>Tomorrow</button>
                <button onClick={randomDate}>Random</button>
            </div>
        </div>
    );
};

export default GameContainer;