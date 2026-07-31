export function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

export function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export const generateLevel = (size, numColors, maxCrossovers = Infinity, prng = Math.random) => {
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
    const pr = (Math.floor(prng() * maxOdd) * 2) + 1;
    const pc = (Math.floor(prng() * maxOdd) * 2) + 1;
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

    const chosenExit = validExits[Math.floor(prng() * validExits.length)];
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
                    let currentCrossovers = path.filter(p => p.isCrossoverTarget).length;
                    if (currentCrossovers < maxCrossovers) {
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
        }

        if (neighbors.length > 0) {
            let next = neighbors[Math.floor(prng() * neighbors.length)];
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
    let shuffledColors = [...colorPool].sort(() => 0.5 - prng());
    let activeColors = shuffledColors.slice(0, numColors);
    let lastDoorState = new Map();
    let nodeDoorStates = Array.from({ length: size }, () => Array(size).fill(null));

    path[0].doorState = new Map();
    nodeDoorStates[path[0].r][path[0].c] = path[0].doorState;

    for (let i = 0; i < solutionWallCoords.length; i++) {
        let wall = solutionWallCoords[i];
        let rng = prng();

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
            let color = activeColors[Math.floor(prng() * activeColors.length)];
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
        activeNodes.push({ r: p.r, c: p.c, doorState: p.doorState, hasChildren: false });
    }

    while (activeNodes.length > 0) {
        let idx = Math.floor(prng() * activeNodes.length);
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
            if (!curr.hasChildren && !solutionNodesSet.has(`${curr.r},${curr.c}`)) {
                deadEnds.push({ r: curr.r, c: curr.c });
            }
            activeNodes.splice(idx, 1);
        } else {
            curr.hasChildren = true;
            let next = neighbors[Math.floor(prng() * neighbors.length)];
            visitedNodes[next.r][next.c] = true;

            let nextDoorState = curr.doorState ? new Map(curr.doorState) : new Map();

            let rng = prng();
            if (rng < 0.6 && activeColors.length > 0) {
                let color = activeColors[Math.floor(prng() * activeColors.length)];
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
            activeNodes.push({ r: next.r, c: next.c, doorState: nextDoorState, hasChildren: false });
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
            let neighbor = validNeighbors[Math.floor(prng() * validNeighbors.length)];
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
                let chosenChar = validColors[Math.floor(prng() * validColors.length)];
                newMaze[neighbor.wr][neighbor.wc] = chosenChar;
            }
        }
    }

    return { newMaze, solutionPath, deadEnds, crossovers: path.filter(p => p.isCrossoverTarget).length };
};

export const generateLevelOfDifficulty = (difficulty, seedString = null) => {
    let prng = Math.random;
    if (seedString) {
        let seed = cyrb128(seedString)[0];
        prng = mulberry32(seed);
    }
    let sizeRange, colorsRange, solutionLengthRange, maxCrossovers, minCrossovers;
    if (difficulty === 0) {
        sizeRange = [15, 17];
        colorsRange = [3, 5];
        solutionLengthRange = [20, 80];
        maxCrossovers = 1;
        minCrossovers = 0;
    } else if (difficulty === 1) {
        sizeRange = [19, 21];
        colorsRange = [5, 6];
        solutionLengthRange = [60, 100];
        maxCrossovers = 2;
        minCrossovers = 1;
    } else { // difficulty === 2
        sizeRange = [21, 23];
        colorsRange = [6, 7];
        solutionLengthRange = [71, 1000]; // > 70
        maxCrossovers = 99; // effectively infinity
        minCrossovers = 2;
    }

    const getRandomOdd = (min, max) => {
        let odds = [];
        for (let i = min; i <= max; i++) {
            if (i % 2 !== 0) odds.push(i);
        }
        return odds[Math.floor(prng() * odds.length)];
    }

    let targetSize = getRandomOdd(sizeRange[0], sizeRange[1]);
    let targetColors = Math.floor(prng() * (colorsRange[1] - colorsRange[0] + 1)) + colorsRange[0];

    let level;
    let attempts = 0;
    while (attempts < 50) {
        level = generateLevel(targetSize, targetColors, maxCrossovers, prng);
        let solLen = level.solutionPath.length;
        if (solLen >= solutionLengthRange[0] && solLen <= solutionLengthRange[1] && level.crossovers >= minCrossovers) {
            break;
        }
        attempts++;
    }
    return { ...level, size: targetSize, numColors: targetColors };
};
