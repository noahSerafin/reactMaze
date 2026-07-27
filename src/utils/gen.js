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
        exitOptions.push({r: 0, c: i});
        exitOptions.push({r: size - 1, c: i});
        exitOptions.push({r: i, c: 0});
        exitOptions.push({r: i, c: size - 1});
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
    let path = [{r: pr, c: pc}];
    let visited = Array.from({length: size}, () => Array(size).fill(false));
    visited[pr][pc] = true;
    
    let current = {r: pr, c: pc};
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
                neighbors.push({r: nr, c: nc, wr: current.r + d[0]/2, wc: current.c + d[1]/2});
            }
        }
        
        if (neighbors.length > 0) {
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];
            visited[next.r][next.c] = true;
            path.push({r: next.r, c: next.c, wr: next.wr, wc: next.wc});
            current = {r: next.r, c: next.c};
        } else {
            path.pop();
            if (path.length > 0) {
                current = {r: path[path.length - 1].r, c: path[path.length - 1].c};
            }
        }
    }

    // Record solution path
    let solutionPath = [];
    let solutionWallCoords = [];
    for (let i = 0; i < path.length; i++) {
        if (i > 0) {
            let wr = path[i].wr;
            let wc = path[i].wc;
            solutionPath.push({x: wc, y: wr});
            solutionWallCoords.push({r: wr, c: wc});
        }
        solutionPath.push({x: path[i].c, y: path[i].r});
    }
    solutionPath.push({x: chosenExit.c, y: chosenExit.r});

    // 5. Place doors on the solution path
    const colorPool = ['r', 'b', 'g', 'y', 'm', 'c', 'o'];
    let shuffledColors = [...colorPool].sort(() => 0.5 - Math.random());
    let activeColors = shuffledColors.slice(0, numColors);
    let openedColors = new Set();

    for (let wall of solutionWallCoords) {
        let rng = Math.random();
        if (rng < 0.4 && activeColors.length > 0) {
            let color = activeColors[Math.floor(Math.random() * activeColors.length)];
            if (openedColors.has(color)) {
                newMaze[wall.r][wall.c] = Math.random() < 0.5 ? color.toUpperCase() : color;
            } else {
                newMaze[wall.r][wall.c] = color;
                openedColors.add(color);
            }
        } else {
            newMaze[wall.r][wall.c] = 'p';
        }
    }

    // 6. Fill remaining tiles
    for (let r = 1; r < size - 1; r++) {
        for (let c = 1; c < size - 1; c++) {
            // Is it an inner wall?
            if ((r % 2 === 0 && c % 2 !== 0) || (r % 2 !== 0 && c % 2 === 0)) {
                // Check if it's in solutionWallCoords
                if (!solutionWallCoords.some(w => w.r === r && w.c === c)) {
                    let rng = Math.random();
                    if (rng < 0.3) {
                        newMaze[r][c] = 'p';
                    } else if (rng < 0.7) {
                        // Keep as initial '-' or '|'
                    } else if (activeColors.length > 0) {
                        let color = activeColors[Math.floor(Math.random() * activeColors.length)];
                        newMaze[r][c] = Math.random() < 0.5 ? color : color.toUpperCase();
                    } else {
                        newMaze[r][c] = 'p';
                    }
                }
            }
        }
    }

    return { newMaze, solutionPath };
};
