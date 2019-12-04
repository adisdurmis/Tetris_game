let time = 0,
    gameInProgress = false,
    score = 0,
    lines = 0,
    figures = 0,
    currentRotation = 0,
    currentShape,
    emptyTop,
    nextShape,
    nextShapeColor,
    newRotation,
    currentShapePosition = [0, 3],
    newShapePosition = [0, 0],
    table = [],
    nextFigureTable = [],
    paused = false,
    cellColor,
    autoMove,
    highScore = [],
    playerFail = false,
    x = document.getElementById("myAudio"),

    config = {
        speed1: 600,
        speed2: 100,
        tableWidth: 10,
        tableHeight: 20,
        destroyedLinesBonus: 2
    };


// Main Code

table = generateTable(config.tableWidth, config.tableHeight);
drawTable("game-box", config.tableHeight, config.tableWidth);
document.getElementById("start1").addEventListener("click", startGame1);
document.getElementById("start2").addEventListener("click", startGame2);
document.getElementById("end").addEventListener("click", endGame);
document.getElementById("reset").addEventListener("click", restartGame);

document.getElementById("high-score-btn").addEventListener("click", viewHighScore);
document.getElementById("hide-high-score-btn").addEventListener("click", function () {
    hideBox("high-score-wrapper");
});

document.body.addEventListener("keydown", function (event) {
    let keys = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"];
    if (keys.includes(event.key)) {
        event.preventDefault();
    };
});


// Methods


function highScoreInput(player, score, lines, figures) {
    if (highScore === null) highScore = [];
    highScore.push({
        player: player,
        score: score,
        lines: lines,
        figures: figures
    });

    highScore.sort(function (a, b) {
        return b.score - a.score;
    });

    let jsonHighScore = JSON.stringify(highScore);
    localStorage.setItem("HighScore", jsonHighScore);
};

function viewHighScore() {
    paused = true;
    highScore = JSON.parse(localStorage.getItem("HighScore"));
    let scoreTest = "<table id=high-score-table><th>Player: </th><th>Score: </th><th>Lines: </th><th>Figures: </th>";

    if (highScore !== null) {
        for (let i = 0; i < highScore.length; i++) {
            if (i === 10) break
            scoreTest += `<tr><td>${highScore[i].player}</td><td>${highScore[i].score}</td>` +
                `<td>${highScore[i].lines}</td><td>${highScore[i].figures}</td></tr>`;
        };
    };

    document.getElementById("table-wrapper").innerHTML = scoreTest + "</table>";
    showBox("high-score-wrapper");
};

function showBox(id) {
    document.getElementById(id).classList.remove("hidden");
    document.getElementById(id).classList.add("visible");
};

function hideBox(id) {
    paused = false;
    document.getElementById(id).classList.remove("visible");
    document.getElementById(id).classList.add("hidden");
};

function startGame1() {
    if (gameInProgress) return false;
    playAudio();
    table = [];
    table = generateTable(config.tableWidth, config.tableHeight);
    drawTable("game-box", config.tableHeight, config.tableWidth);
    gameInProgress = true;
    let keys = justObjectProperties(shapes);
    let randomNumber = Math.floor(Math.random() * keys.length);
    nextShape = shapes[keys[randomNumber]];
    nextShapeColor = shapes.shapeColor(keys[randomNumber]);
    generateShape();
    drawNextShapeTable(nextShape[0], "next-figure", nextShape[0].length);
    let emptyTop = emptyLinesInShapeTop(currentShape[currentRotation]);
    currentShapePosition = [0 - emptyTop, 3];
    placeShapeInTable(currentShapePosition, currentShape[currentRotation]);
    drawTable("game-box", config.tableHeight, config.tableWidth);
    document.body.addEventListener("keydown", keyDown);
    autoMove = setInterval(autoDrop, config.speed1);
   

};

function startGame2() {
    if (gameInProgress) return false;
    playAudio();
    table = [];
    table = generateTable(config.tableWidth, config.tableHeight);
    drawTable("game-box", config.tableHeight, config.tableWidth);
    gameInProgress = true;
    let keys = justObjectProperties(shapes);
    let randomNumber = Math.floor(Math.random() * keys.length);
    nextShape = shapes[keys[randomNumber]];
    nextShapeColor = shapes.shapeColor(keys[randomNumber]);
    generateShape();
    drawNextShapeTable(nextShape[0], "next-figure", nextShape[0].length);
    let emptyTop = emptyLinesInShapeTop(currentShape[currentRotation]);
    currentShapePosition = [0 - emptyTop, 3];
    placeShapeInTable(currentShapePosition, currentShape[currentRotation]);
    drawTable("game-box", config.tableHeight, config.tableWidth);
    document.body.addEventListener("keydown", keyDown);
    autoMove = setInterval(autoDrop, config.speed2);

};

function playAudio() { 
    x.play(); 
  } 



function endGame() {
    if (gameInProgress) {
        paused = true;
        if (playerFail || confirm("Are you sure?")) {
            if (confirm("Enter name for High Score?")) {
                let playerName = prompt("Enter name:");
                highScoreInput(playerName, score, lines, figures);
                x.pause();
            };

            playerFail = false;
            gameInProgress = false;
            startShapePosition = [0, 3];
            currentShapePosition = [0, 3];
            newShapePosition = [0, 0];
            score = 0;
            lines = 0;
            figures = 0;
            currentRotation = 0;
            table = [];
            nextFigureTable = [];
            paused = false;
            clearInterval(autoMove);
            config.speed = 600;
            document.body.removeEventListener("keydown", keyDown);
            document.getElementById("score").innerHTML = "Score: " + score;
            document.getElementById("lines").innerHTML = "Lines: " + lines;
            document.getElementById("figures").innerHTML = "Figures: " + figures;
            x.pause();

        } else paused = false;
    };
};

function restartGame() {
    if (gameInProgress) {
        endGame();
        x.pause();
        startGame1();
    };
};

function keyDown(event) {
    if (event.key === "p") {
        paused = !paused;
        return false;
    };

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowDown") return false
    paused = false;
    possibleShapeMove(event.key);
};

function drawNextShapeTable(table, id, length) {
    let tableHTML = "<table>";
    for (let i = 0; i < length; i++) {
        if (i === 0) tableHTML += "<tr>";
        if (i % 4 === 0) tableHTML += "</tr><tr>";
        if (table[i] === 1) tableHTML += "<td class=cell-" + nextShapeColor + "></td>";
        else tableHTML += "<td class=cell-" + "empty-next" + "></td>";
    };

    tableHTML += "</tr></table>";
    document.getElementById(id).innerHTML = tableHTML;
};

function autoDrop() {
    if (!paused) possibleShapeMove("ArrowDown");
};

function possibleShapeMove(event) {
    eraseShapeFromTable(currentShapePosition, currentShape[currentRotation]);
    if (!moveShape(event)) {
        placeShapeInTable(currentShapePosition, currentShape[currentRotation]);
        if (!stopShapeMove()) return
    } else {
        placeShapeInTable(currentShapePosition, currentShape[currentRotation]);
    };
    drawTable("game-box", config.tableHeight, config.tableWidth);
};

function generateTable(width, height) {
    for (let i = 0; i < height; i++) {
        table.push([])
        for (let j = 0; j < width; j++) {
            table[i].push({
                cell: 0,
                color: "empty"
            });
        };
    };
    return table;
};

function drawTable(id, height, width) {
    let tableHTML = "<table>";
    for (let i = 0; i < height; i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < width; j++) {
            tableHTML += "<td class=cell-" + table[i][j].color + "></td>";
        };
        tableHTML += "</tr>";
    };
    tableHTML += "</table>";
    document.getElementById(id).innerHTML = tableHTML;
};

function generateShape() {
    currentShape = nextShape;
    cellColor = nextShapeColor;
    let keys = justObjectProperties(shapes);
    let randomNumber = Math.floor(Math.random() * keys.length);
    nextShape = shapes[keys[randomNumber]];
    nextShapeColor = shapes.shapeColor(keys[randomNumber]);
    ++figures;
    document.getElementById("figures").innerHTML = "Figures: " + figures;
};

function placeShapeInTable(shapePosition, shape) {
    let counter = 0;
    let y = shapePosition[0];
    let x = shapePosition[1];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (table[i + y] === undefined) continue;
            if (table[i + y][j + x] !== undefined && table[i + y][j + x].cell !== 1) {
                table[i + y][j + x].cell = shape[counter + j];
                if (shape[counter + j] === 1) table[i + y][j + x].color = cellColor;
            };
        };
        counter += 4;
    };
};

function eraseShapeFromTable(shapePosition, shape) {
    let counter = 0;
    let y = shapePosition[0];
    let x = shapePosition[1];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (table[i + y] === undefined || table[i + y][j + x] === undefined) continue;
            if (table[i + y][j + x].cell === shape[counter + j]) {
                table[i + y][j + x].cell = 0;
                table[i + y][j + x].color = "empty";
            };
        };
        counter += 4;
    };
};

function moveShape(key) {
    newShapePosition[0] = currentShapePosition[0];
    newShapePosition[1] = currentShapePosition[1];

    if (key === "ArrowLeft") {
        newShapePosition[1] = currentShapePosition[1] - 1;
        if (checkIfValidMove(newShapePosition, currentShape[currentRotation])) {
            currentShapePosition[1] = newShapePosition[1];
        } else {
            newShapePosition[1] = currentShapePosition[1] + 1;
            return true;
        };
    } else if (key === "ArrowRight") {
        newShapePosition[1] = currentShapePosition[1] + 1;
        if (checkIfValidMove(newShapePosition, currentShape[currentRotation])) {
            currentShapePosition[1] = newShapePosition[1];
        } else {
            newShapePosition[1] = currentShapePosition[1] - 1;
            return true;
        };
    } else if (key === "ArrowDown") {
        newShapePosition[0] = currentShapePosition[0] + 1;
        if (checkIfValidMove(newShapePosition, currentShape[currentRotation])) {
            currentShapePosition[0] = newShapePosition[0];
        } else {
            newShapePosition[0] = currentShapePosition[0] - 1;
            return false;
        };
    } else if (key === "ArrowUp") {
        newRotation = rotateShape(currentShape, currentRotation);
        if (checkIfValidMove(currentShapePosition, currentShape[newRotation])) {
            currentRotation = newRotation;
        } else {
            newRotation = currentRotation;
            return true;
        };
    };

    return true;
};

function checkIfValidMove(shapePosition, shape) {
    let currentShapeWidth = shapeWidth(shape);
    let currentShapeHeight = shapeHeight(shape);
    if (shapePosition[1] + emptyLinesInShapeLeft(shape) < 0 || shapePosition[1] + currentShapeWidth - 1 >= config.tableWidth) return false;
    if (shapePosition[0] + currentShapeHeight > config.tableHeight) {
        return false;
    };

    if (checkForOtherShapes(shapePosition, shape)) {
        return false;
    };

    return true;
};

function checkForOtherShapes(shapePosition, shape) {
    let counter = 0;
    let y = shapePosition[0];
    let x = shapePosition[1];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (table[i + y] === undefined || table[i + y][j + x] === undefined) continue;
            if (table[i + y][j + x].cell === 1 && shape[counter + j] === 1) {
                return true;
            };
        };
        counter += 4;
    };
};

function stopShapeMove() {
    checkForFullLines(0);
    currentShapePosition = [0, 3];
    newShapePosition = [0, 3];
    currentRotation = 0;
    generateShape();
    drawNextShapeTable(nextShape[0], "next-figure", nextShape[0].length);
    emptyTop = emptyLinesInShapeTop(currentShape[currentRotation]);
    currentShapePosition[0] -= emptyTop;
    checkForGameEnd(currentShapePosition, currentShape[currentRotation]);

    if (gameInProgress) {
        eraseShapeFromTable(currentShapePosition, currentShape[currentRotation]);
        placeShapeInTable(currentShapePosition, currentShape[currentRotation]);
        drawTable("game-box", config.tableHeight, config.tableWidth);
    };
};

function rotateShape(currentShape, rotation) {
    ++rotation;
    if (rotation >= currentShape.length) rotation = 0;
    return rotation;
};

function checkForFullLines(destroyedLines) {
    let lineDestroyed = false;
    let emptyLine = [];
    for (let j = 0; j < config.tableWidth; j++) {
        emptyLine.push({
            cell: 0,
            color: "empty"
        });
    };
    for (let i = 0; i < config.tableHeight; i++) {
        if (indexOfObjPropInArray(table[i], "cell") === -1 && !lineDestroyed) {
            table.unshift(emptyLine);
            table.splice(i + 1, 1);
            lineDestroyed = true;
            ++lines;
            score += (10 + destroyedLines * config.destroyedLinesBonus);
            document.getElementById("lines").innerHTML = "Lines: " + lines;
        };
    };
    if (lineDestroyed) {
        drawTable("game-box", config.tableHeight, config.tableWidth);
        checkForFullLines(1);
    } else {
        document.getElementById("score").innerHTML = "Score: " + score;
        document.getElementById("lines").innerHTML = "Lines: " + lines;
    };
};

function checkForGameEnd(shapePosition, shape) {
    let counter = 0;
    let y = shapePosition[0];
    let x = shapePosition[1];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (table[i + y] === undefined) continue;
            if (table[i + y][j + x].cell === 1 && shape[counter + j] === 1) {
                alert("This is the end!");
                playerFail = true;
                endGame();
                return;
            };
        };
        counter += 4;
    };
};

function shapeWidth(shape) {
    let substraction = 0;
    return shape.reduce(function (acc, item, index) {
        if ((index + 1) % 4 === 0)++substraction;
        if (item === 1) {
            if ((index + 1) % 4 === 0) acc = 4;
            else if ((index + 1 - substraction) % 3 === 0 && acc < 3) acc = 3;
            else if ((index + 1) % 2 === 0 && acc < 2) acc = 2;
        };
        return acc;
    }, 1);
};

function emptyLinesInShapeLeft(shape) {
    let empty = 0;
    for (let i = 0; i < shape.length; i += 4) {
        if (shape[i] === 0) empty = 1
        else return 0;
    };
    return empty;
};

function emptyLinesInShapeTop(shape) {
    let empty = 0;
    for (let i = 0; i < 4; i++) {
        if (shape[i] === 0) empty = 1
        else return 0
    };
    return empty;
};

function shapeHeight(shape) {
    let sum = 1;
    return shape.reduce(function (acc, item, index) {
        if (item === 1 && acc < sum) acc = sum;
        if ((index + 1) % 4 === 0)++sum;
        return acc
    }, 1);
};

function justObjectProperties(obj) {
    return Object.keys(obj).filter(function (element) {
        return typeof obj[element] !== "function";
    });
};

function indexOfObjPropInArray(obj, property) {
    return obj.reduce(function (acc, item, index) {
        if (item[property] === 0) acc = 1
        return acc;
    }, -1);
};







