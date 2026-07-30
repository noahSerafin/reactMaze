export const generateLevel = (size, numColors) => {
    // 1. Initialize Blank Maze
    let newMaze = [];
    for (let r = 0; r < size; r++) {
        let row = [];
        for (let c = 0; c < size; c++) {
            if (r % 2 === 0 && c % 2 === 0) row.push('+');
            else if (r % 2 === 0 && c % 2 !== 0) row.push('-');
            else if (r % 2 !== 0 && c % 2 === 0) row.push('|');
            else row.push('p'); // odd row & odd col
        }
        newMaze.push(row);
    }

    // Replace outer boundaries with '-' and '|'
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (r === 0 || r === size - 1 || c === 0 || c === size - 1) {
                newMaze[r][c] = '-';
                if (c === 0 || c === size - 1) {
                    newMaze[r][c] = '|';
                }
                if ((r === 0 || r === size - 1) && (c % 2 === 0)) newMaze[r][c] = '+';
                if ((c === 0 || c === size - 1) && (r % 2 === 0)) newMaze[r][c] = '+';
            }
        }
    }

    // 2. Place Player
    const maxOdd = Math.floor(size / 2);
    const pr = (Math.floor(Math.random() * maxOdd) * 2) + 1;
    const pc = (Math.floor(Math.random() * maxOdd) * 2) + 1;
    newMaze[pr][pc] = 'P';

    // 3. Place Exit
    let exitOptions = [];
    for (let i = 1; i < size; i += 2) {
        exitOptions.push({ r: 0, c: i });
        exitOptions.push({ r: size - 1, c: i });
        exitOptions.push({ r: i, c: 0 });
        exitOptions.push({ r: i, c: size - 1 });
    }

    // Filter by Manhattan distance
    let validExits = exitOptions.filter(pos => {
        let dist = Math.abs(pos.r - pr) + Math.abs(pos.c - pc);
        return dist > Math.floor(size / 2);
    });
    if (validExits.length === 0) validExits = exitOptions;

    const chosenExit = validExits[Math.floor(Math.random() * validExits.length)];
    newMaze[chosenExit.r][chosenExit.c] = 'E';

    // 4. Random Walk (DFS)
    let path = [{ r: pr, c: pc }];
    let visited = Array.from({ length: size }, () => Array(size).fill(false));
    visited[pr][pc] = true;

    let current = { r: pr, c: pc };
    let foundExit = false;

    while (!foundExit && path.length > 0) {
        let distToExit = Math.abs(current.r - chosenExit.r) + Math.abs(current.c - chosenExit.c);
        if (distToExit === 1) {
            foundExit = true;
            break;
        }

        let neighbors = [];
        const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
        for (let d of dirs) {
            let nr = current.r + d[0];
            let nc = current.c + d[1];
            if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1 && !visited[nr][nc]) {
                neighbors.push({ r: nr, c: nc, wr: current.r + d[0] / 2, wc: current.c + d[1] / 2 });
            }
        }

        if (neighbors.length > 0) {
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];
            visited[next.r][next.c] = true;
            path.push({ r: next.r, c: next.c, wr: next.wr, wc: next.wc });
            current = { r: next.r, c: next.c };
        } else {
            path.pop();
            if (path.length > 0) {
                current = { r: path[path.length - 1].r, c: path[path.length - 1].c };
            }
        }
    }

    // Record solution path
    let solutionPath = [];
    let solutionWallCoords = [];
    let containingWallsSet = new Set();
    for (let i = 0; i < path.length; i++) {
        if (i > 0) {
            let wr = path[i].wr;
            let wc = path[i].wc;
            solutionPath.push({ x: wc, y: wr });
            solutionWallCoords.push({ r: wr, c: wc });
        }
        solutionPath.push({ x: path[i].c, y: path[i].r });
        
        containingWallsSet.add(`${path[i].r - 1},${path[i].c}`);
        containingWallsSet.add(`${path[i].r + 1},${path[i].c}`);
        containingWallsSet.add(`${path[i].r},${path[i].c - 1}`);
        containingWallsSet.add(`${path[i].r},${path[i].c + 1}`);
    }
    solutionPath.push({ x: chosenExit.c, y: chosenExit.r });

    // 5. Place doors on the solution path
    const colorPool = ['r', 'b', 'g', 'y', 'm', 'c', 'o'];
    let shuffledColors = [...colorPool].sort(() => 0.5 - Math.random());
    let activeColors = shuffledColors.slice(0, numColors);
    let lastDoorState = new Map();

    for (let wall of solutionWallCoords) {
        let rng = Math.random();
        if (rng < 0.6 && activeColors.length > 0) {
            let color = activeColors[Math.floor(Math.random() * activeColors.length)];
            if (lastDoorState.has(color)) {
                let lastState = lastDoorState.get(color);
                let nextState = lastState === color ? color.toUpperCase() : color;
                newMaze[wall.r][wall.c] = nextState;
                lastDoorState.set(color, nextState);
            } else {
                newMaze[wall.r][wall.c] = color;
                lastDoorState.set(color, color);
            }
        } else {
            newMaze[wall.r][wall.c] = 'p';
        }
    }

    // 6. Generate multi-branch fake paths (filling all remaining space)
    let visitedNodes = Array.from({ length: size }, () => Array(size).fill(false));
    let activeNodes = [];

    for (let p of path) {
        visitedNodes[p.r][p.c] = true;
        activeNodes.push({ r: p.r, c: p.c, doorState: null });
    }

    while (activeNodes.length > 0) {
        let idx = Math.floor(Math.random() * activeNodes.length);
        let curr = activeNodes[idx];

        let neighbors = [];
        const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
        for (let d of dirs) {
            let nr = curr.r + d[0];
            let nc = curr.c + d[1];
            if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1) {
                if (!visitedNodes[nr][nc]) {
                    neighbors.push({ r: nr, c: nc, wr: curr.r + d[0] / 2, wc: curr.c + d[1] / 2 });
                }
            }
        }

        if (neighbors.length === 0) {
            activeNodes.splice(idx, 1);
        } else {
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];
            visitedNodes[next.r][next.c] = true;

            let nextDoorState = curr.doorState ? new Map(curr.doorState) : new Map();

            let rng = Math.random();
            if (rng < 0.4 && activeColors.length > 0) {
                let color = activeColors[Math.floor(Math.random() * activeColors.length)];
                if (nextDoorState.has(color)) {
                    let lastState = nextDoorState.get(color);
                    let nextState = lastState === color ? color.toUpperCase() : color;
                    newMaze[next.wr][next.wc] = nextState;
                    nextDoorState.set(color, nextState);
                } else {
                    newMaze[next.wr][next.wc] = color;
                    nextDoorState.set(color, color);
                }
            } else {
                newMaze[next.wr][next.wc] = 'p';
            }

            activeNodes.push({ r: next.r, c: next.c, doorState: nextDoorState });
        }
    }

    // 7. Add extra doors and loops
    for (let r = 1; r < size - 1; r++) {
        for (let c = 1; c < size - 1; c++) {
            // Check if it's a wall candidate (even/odd or odd/even)
            if ((r % 2 === 0 && c % 2 !== 0) || (r % 2 !== 0 && c % 2 === 0)) {
                // Check if it's an untouched wall
                if (newMaze[r][c] === '-' || newMaze[r][c] === '|') {
                    // Check if it's NOT a containing wall of the solution path
                    if (!containingWallsSet.has(`${r},${c}`)) {
                        // 30% chance to break this wall (chance to modify candidate wall)
                        if (Math.random() < 0.3) {
                            // 80% chance to be a door, 20% to be an open passage
                            if (Math.random() < 0.8 && activeColors.length > 0) {
                                let color = activeColors[Math.floor(Math.random() * activeColors.length)];
                                // 50/50 chance for initial open/closed state
                                let state = Math.random() < 0.5 ? color : color.toUpperCase();
                                newMaze[r][c] = state;
                            } else {
                                newMaze[r][c] = 'p';
                            }
                        }
                    }
                }
            }
        }
    }

    return { newMaze, solutionPath };
};
