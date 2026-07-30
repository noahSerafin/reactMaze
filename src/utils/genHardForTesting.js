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
        return dist > Math.floor(size);
    });
    if (validExits.length === 0) validExits = exitOptions;

    const chosenExit = validExits[Math.floor(Math.random() * validExits.length)];
    newMaze[chosenExit.r][chosenExit.c] = 'E';

    // 4. Random Walk (DFS)
    let path = [{ r: pr, c: pc }];
    let visits = Array.from({ length: size }, () => Array(size).fill(0));
    visits[pr][pc] = 1;

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
        let prev = path.length > 1 ? path[path.length - 2] : null;

        for (let d of dirs) {
            let nr = current.r + d[0];
            let nc = current.c + d[1];

            if (prev && nr === prev.r && nc === prev.c) continue;

            if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1) {
                if (visits[nr][nc] === 0) {
                    neighbors.push({ r: nr, c: nc, wr: current.r + d[0] / 2, wc: current.c + d[1] / 2, type: 'normal' });
                } else if (visits[nr][nc] === 1) {
                    let nnr = nr + d[0];
                    let nnc = nc + d[1];
                    if (nnr > 0 && nnr < size - 1 && nnc > 0 && nnc < size - 1 && visits[nnr][nnc] === 0) {
                        neighbors.push({
                            r: nnr, c: nnc,
                            wr: nr + d[0] / 2, wc: nc + d[1] / 2,
                            cross_r: nr, cross_c: nc,
                            cross_wr: current.r + d[0] / 2, cross_wc: current.c + d[1] / 2,
                            type: 'cross'
                        });
                    }
                }
            }
        }

        if (neighbors.length > 0) {
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];
            if (next.type === 'cross') {
                visits[next.cross_r][next.cross_c] = 2;
                visits[next.r][next.c] = 1;
                path.push({ r: next.cross_r, c: next.cross_c, wr: next.cross_wr, wc: next.cross_wc, isCrossover: true });
                path.push({ r: next.r, c: next.c, wr: next.wr, wc: next.wc, isCrossoverTarget: true });
                current = { r: next.r, c: next.c };
            } else {
                visits[next.r][next.c] = 1;
                path.push({ r: next.r, c: next.c, wr: next.wr, wc: next.wc });
                current = { r: next.r, c: next.c };
            }
        } else {
            let popped = path.pop();
            if (popped && popped.isCrossoverTarget) {
                let crossTile = path.pop();
                if (crossTile) {
                    visits[crossTile.r][crossTile.c] = 1;
                }
            }
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
    let nodeDoorStates = Array.from({ length: size }, () => Array(size).fill(null));

    path[0].doorState = new Map();
    nodeDoorStates[path[0].r][path[0].c] = path[0].doorState;

    for (let i = 0; i < solutionWallCoords.length; i++) {
        let wall = solutionWallCoords[i];
        let rng = Math.random();

        let isNextToCrossover = false;
        let crossoverTile = null;
        let adjTiles = [];
        if (wall.r % 2 === 0) {
            adjTiles.push({ r: wall.r - 1, c: wall.c });
            adjTiles.push({ r: wall.r + 1, c: wall.c });
        } else {
            adjTiles.push({ r: wall.r, c: wall.c - 1 });
            adjTiles.push({ r: wall.r, c: wall.c + 1 });
        }

        for (let t of adjTiles) {
            if (visits[t.r] && visits[t.r][t.c] === 2) {
                isNextToCrossover = true;
                crossoverTile = t;
                break;
            }
        }

        if (isNextToCrossover && crossoverTile) {
            let doorsAround = 0;
            const wallCoords = [
                { r: crossoverTile.r - 1, c: crossoverTile.c },
                { r: crossoverTile.r + 1, c: crossoverTile.c },
                { r: crossoverTile.r, c: crossoverTile.c - 1 },
                { r: crossoverTile.r, c: crossoverTile.c + 1 }
            ];
            for (let wc of wallCoords) {
                if (wc.r >= 0 && wc.r < size && wc.c >= 0 && wc.c < size) {
                    let val = newMaze[wc.r][wc.c];
                    if (val && activeColors.includes(val.toLowerCase())) {
                        doorsAround++;
                    }
                }
            }
            if (doorsAround < 2) {
                rng = 0; // force door placement
            }
        }

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

        path[i + 1].doorState = new Map(lastDoorState);
        nodeDoorStates[path[i + 1].r][path[i + 1].c] = path[i + 1].doorState;
    }

    // 6. Generate multi-branch fake paths (filling all remaining space)
    let visitedNodes = Array.from({ length: size }, () => Array(size).fill(false));
    let activeNodes = [];
    let deadEnds = [];
    let solutionNodesSet = new Set(path.map(p => `${p.r},${p.c}`));

    for (let p of path) {
        visitedNodes[p.r][p.c] = true;
        activeNodes.push({ r: p.r, c: p.c, doorState: p.doorState });
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
            deadEnds.push({ r: curr.r, c: curr.c });
            activeNodes.splice(idx, 1);
        } else {
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];
            visitedNodes[next.r][next.c] = true;

            let nextDoorState = curr.doorState ? new Map(curr.doorState) : new Map();

            let rng = Math.random();
            if (rng < 0.6 && activeColors.length > 0) {
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

            nodeDoorStates[next.r][next.c] = nextDoorState;
            activeNodes.push({ r: next.r, c: next.c, doorState: nextDoorState });
        }
    }

    // 7. Dead End Linkups
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (let deadEnd of deadEnds) {
        let validNeighbors = [];
        for (let d of dirs) {
            let nr = deadEnd.r + d[0];
            let nc = deadEnd.c + d[1];
            if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1) {
                if (visitedNodes[nr][nc] && !solutionNodesSet.has(`${nr},${nc}`)) {
                    let wr = deadEnd.r + d[0] / 2;
                    let wc = deadEnd.c + d[1] / 2;
                    if (newMaze[wr][wc] === '-' || newMaze[wr][wc] === '|') {
                        validNeighbors.push({ r: nr, c: nc, wr, wc });
                    }
                }
            }
        }

        if (validNeighbors.length > 0) {
            let neighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
            let doorStateA = nodeDoorStates[deadEnd.r][deadEnd.c];
            let doorStateB = nodeDoorStates[neighbor.r][neighbor.c];

            let validColors = [];
            for (let color of activeColors) {
                let charA = doorStateA && doorStateA.has(color) ? doorStateA.get(color) : color.toUpperCase();
                let charB = doorStateB && doorStateB.has(color) ? doorStateB.get(color) : color.toUpperCase();
                if (charA === charB) {
                    validColors.push(charA);
                }
            }

            if (validColors.length > 0) {
                let chosenChar = validColors[Math.floor(Math.random() * validColors.length)];
                newMaze[neighbor.wr][neighbor.wc] = chosenChar;
            }
        }
    }

    return { newMaze, solutionPath, deadEnds };
};
