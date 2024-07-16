// Constants for the game
const gridSize = 20; // Size of each grid cell in pixels
const gridRows = 30; // Number of rows in the grid
const gridCols = 40; // Number of columns in the grid
const initialLength = 5; // Initial length of the snake
const initialSpeed = 150; // Initial speed in milliseconds
const speedIncrement = 10; // Speed decrement in milliseconds per score increment

// Initialize game variables
let snake;
let food;
let score = 0;
let gameInterval;
let speed = initialSpeed;
let direction = "right"; // Initial direction of the snake

// Create SVG element
const svg = d3.select("body").append("svg")
    .attr("width", gridCols * gridSize)
    .attr("height", gridRows * gridSize);

// Initialize game
function initializeGame() {
    // Reset score and speed
    score = 0;
    speed = initialSpeed;
    updateScore();

    // Initialize snake
    snake = [{ x: Math.floor(gridCols / 2), y: Math.floor(gridRows / 2) }];
    for (let i = 1; i < initialLength; i++) {
        snake.push({ x: snake[0].x - i, y: snake[0].y });
    }

    // Generate initial food
    generateFood();

    // Draw initial state
    drawSnake();
    drawFood();

    // Start the game loop
    gameInterval = setInterval(moveSnake, speed);

    // Listen for click events on the SVG
    svg.on("click", handleMouseClick);
}

// Function to update the score display
function updateScore() {
    d3.select("#score").text(`Score: ${score}`);
}

// Function to generate food at a random position
function generateFood() {
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * gridCols);
        foodY = Math.floor(Math.random() * gridRows);
    } while (snake.some(segment => segment.x === foodX && segment.y === foodY));

    food = { x: foodX, y: foodY };
}

// Function to draw the snake
function drawSnake() {
    const snakeSelection = svg.selectAll(".snake")
        .data(snake, (d, i) => i);

    snakeSelection.enter().append("rect")
        .attr("class", "snake")
        .attr("width", gridSize - 2)
        .attr("height", gridSize - 2)
        .attr("x", d => d.x * gridSize)
        .attr("y", d => d.y * gridSize)
        .style("fill", "#4CAF50");

    snakeSelection.exit().remove();
}

// Function to draw the food
function drawFood() {
    svg.selectAll(".food").data([food])
        .enter().append("rect")
        .attr("class", "food")
        .attr("width", gridSize - 2)
        .attr("height", gridSize - 2)
        .attr("x", d => d.x * gridSize)
        .attr("y", d => d.y * gridSize)
        .style("fill", "#FF5722");
}

// Function to move the snake
function moveSnake() {
    // Create a new head based on the current direction
    let newHead = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
        case "up":
            newHead.y -= 1;
            break;
        case "down":
            newHead.y += 1;
            break;
        case "left":
            newHead.x -= 1;
            break;
        case "right":
            newHead.x += 1;
            break;
    }

    // Check for collision with walls or itself
    if (newHead.x < 0 || newHead.x >= gridCols || newHead.y < 0 || newHead.y >= gridRows || snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return;
    }

    // Move snake
    snake.unshift(newHead);

    // Check for food collision
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        updateScore();
        generateFood();
        drawFood();
        speed -= speedIncrement;
        clearInterval(gameInterval);
        gameInterval = setInterval(moveSnake, speed);
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    // Redraw snake
    svg.selectAll(".snake")
        .data(snake, (d, i) => i)
        .attr("x", d => d.x * gridSize)
        .attr("y", d => d.y * gridSize);
}

// Function to handle mouse click events
function handleMouseClick() {
    // Get the mouse coordinates relative to the SVG
    const [mouseX, mouseY] = d3.mouse(this);

    // Determine direction based on mouse position relative to the snake's head
    const headX = snake[0].x * gridSize;
    const headY = snake[0].y * gridSize;

    if (mouseX > headX && direction !== "left") {
        direction = "right";
    } else if (mouseX < headX && direction !== "right") {
        direction = "left";
    } else if (mouseY > headY && direction !== "up") {
        direction = "down";
    } else if (mouseY < headY && direction !== "down") {
        direction = "up";
    }
}

// Function to end the game
function endGame() {
    clearInterval(gameInterval);
    alert(`Game over! Your score is ${score}.`);
}

// Initialize the game
initializeGame();
