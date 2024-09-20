let isDragging = false;
let crabPosition = { x: 0, y: 0 };
let crabVelocity = { x: 0, y: 0 }; // Add velocity to the crab
let targetPosition = { x: 0, y: 0 };
let crabSpeed = 6; // Pixels per frame, adjust this to change the crab's speed
const emojis = ['🐚', '🌟', '💖', '💍', '💎', '🧿', '👑', '🗝️', '💠']; // List of emojis with frequencies
const fishEmojis = ['🐟', '🐠', '🐡', '🦐', '🐙', '🏄‍♀️', '🏄‍♂️',]; // List of fish emojis
let currentEmoji = null;
let treasureCount = 0; // Counter for treasures
let isBouncing = false; // Flag to indicate if the crab is bouncing

// Scaling factor based on device pixel ratio
const scalingFactor = window.devicePixelRatio || 1;

function adjustLayout() {
    const container = document.getElementById('container');
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    container.style.width = `${windowWidth}px`;
    container.style.height = `${windowHeight}px`;

    // Adjust font sizes
    const baseFontSize = windowHeight * 0.03; // 2% of window height
    document.documentElement.style.fontSize = `${baseFontSize}px`;

    // Update crab position after layout adjustment
    setCrabInitialPosition();
}

function setCrabInitialPosition() {
    const container = document.getElementById('container');
    const crab = document.getElementById('crab');

    // Set initial crab position to bottom center
    crabPosition.x = (container.offsetWidth - crab.offsetWidth) / 2;
    crabPosition.y = container.offsetHeight - crab.offsetHeight;

    // Reset crab velocity
    crabVelocity.x = 0;
    crabVelocity.y = 0;

    // Update crab's CSS position
    updateCrabPosition();
}

function updateCrabPosition() {
    const crab = document.getElementById('crab');
    crab.style.left = `${crabPosition.x}px`;
    crab.style.top = `${crabPosition.y}px`;
}

function animateWater() {
    const water = document.getElementById('water');
    const container = document.getElementById('container');
    const maxHeight = container.clientHeight;
    const minHeight = maxHeight * 0.3; // Minimum height of the water (30% of container height)
    const maxHeightWater = maxHeight * 0.8; // Maximum height of the water (80% of container height)

    function randomTide() {
        const newHeight = Math.random() * (maxHeightWater - minHeight) + minHeight;
        water.style.height = `${newHeight}px`;
    }

    // Initial water height
    randomTide();
    setInterval(randomTide, 4000); // Change tide every 4 seconds
}

function updateTargetPosition(event) {
    const container = document.getElementById('container');
    const containerRect = container.getBoundingClientRect();

    targetPosition.x = event.clientX - containerRect.left;
    targetPosition.y = event.clientY - containerRect.top;
}

function moveCrab() {
    if (!isDragging && !isBouncing) return;

    const crab = document.getElementById('crab');
    const container = document.getElementById('container');

    if (!isBouncing) {
        // Calculate direction vector
        let dx = targetPosition.x - crabPosition.x;
        let dy = targetPosition.y - crabPosition.y;

        // Calculate distance
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {  // Only move if the distance is significant
            // Normalize direction vector
            dx /= distance;
            dy /= distance;

            // Move crab
            crabPosition.x += dx * crabSpeed;
            crabPosition.y += dy * crabSpeed;

            // Constrain crab within container
            crabPosition.x = Math.max(0, Math.min(crabPosition.x, container.offsetWidth - crab.offsetWidth));
            crabPosition.y = Math.max(0, Math.min(crabPosition.y, container.offsetHeight - crab.offsetHeight));

            // Update crab position
            updateCrabPosition();

            // Check for collision with emoji
            checkCollision();
        }
    } else {
        // Apply velocity to crab position
        crabPosition.y += crabVelocity.y;

        // Constrain crab within container
        crabPosition.y = Math.min(crabPosition.y, container.offsetHeight - crab.offsetHeight);

        // Update crab position
        updateCrabPosition();
    }

    // Check for collision with water
    checkWaterCollision();
}

function startDragging(event) {
    isDragging = true;
    updateTargetPosition(event);
    // Change cursor style
    document.getElementById('container').style.cursor = 'default';
}

function stopDragging() {
    isDragging = false;
    // Reset cursor style
    document.getElementById('container').style.cursor = 'default';
}

function animateFish() {
    const fish = document.getElementById('fish');
    const container = document.getElementById('container');
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;
    

    function swimFish() {
        // Randomly select a fish emoji
        const randomFish = fishEmojis[Math.floor(Math.random() * fishEmojis.length)];
        fish.textContent = randomFish;

        // Random y position in the top 30% of the container
        const randomY = Math.random() * (containerHeight * 0.3);
        fish.style.top = `${randomY}px`;

        // Start fish at the right edge of the container
        fish.style.left = `${containerWidth}px`;
        fish.style.display = 'block';

        // Trigger reflow to restart the animation
        fish.getBoundingClientRect();

        // Move fish to the left side of the screen
        let startTime = null;
        const swimDuration = 6000; // Adjust duration based on scaling factor
        const amplitude = 200; // Amplitude of the sine wave
        const frequency = 0.003; // Frequency of the sine wave

        function swim(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const normalizedProgress = progress / swimDuration;
            const x = containerWidth - normalizedProgress * (containerWidth + fish.offsetWidth); // Adjusted for scaling factor

            // Calculate sine wave offset
            const sineOffset = amplitude * Math.sin(frequency * progress);

            fish.style.transform = `translate(${x - containerWidth * scalingFactor}px, ${sineOffset}px)`;

            if (progress < swimDuration) {
                requestAnimationFrame(swim);
            } else {
                fish.style.display = 'none';
                fish.style.transform = 'none'; // Reset transform
                setTimeout(swimFish, 1000); // Wait 1 seconds before starting the next swim
            }
        }
        requestAnimationFrame(swim);
    }

    // Initial swim
    swimFish();
}

function placeRandomEmoji() {
    const container = document.getElementById('container');
    const emojiElement = document.getElementById('emoji');
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;

    // Randomly select an emoji
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    emojiElement.textContent = randomEmoji;

    // Random position in the lower 50% of the container
    let randomX, randomY;
    do {
        randomX = Math.random() * (containerWidth - 50);
        randomY = containerHeight / 2 + Math.random() * (containerHeight / 2 - 50);
    } while (Math.abs(randomX - crabPosition.x) < 100 && Math.abs(randomY - crabPosition.y) < 100);

    emojiElement.style.left = `${randomX}px`;
    emojiElement.style.top = `${randomY}px`;
    emojiElement.style.display = 'block';
}

function checkCollision() {
    const crab = document.getElementById('crab');
    const emojiElement = document.getElementById('emoji');
    const crabRect = crab.getBoundingClientRect();
    const emojiRect = emojiElement.getBoundingClientRect();

    // Define a margin for collision detection
    const margin = 20; // Adjust this value to increase the overlap threshold

    if (
        crabRect.left < emojiRect.right - margin &&
        crabRect.right > emojiRect.left + margin &&
        crabRect.top < emojiRect.bottom - margin &&
        crabRect.bottom > emojiRect.top + margin
    ) {
        // Collision detected
        emojiElement.style.display = 'none';
        placeRandomEmoji();
        updateCounter(); // Update the counter
    }
}

function checkWaterCollision() {
    const crab = document.getElementById('crab');
    const water = document.getElementById('water');
    const crabRect = crab.getBoundingClientRect();
    const waterRect = water.getBoundingClientRect();

    // Define a margin for collision detection
    const margin = 20; // Adjust this value to increase the overlap threshold

    if (
        crabRect.left < waterRect.right - margin &&
        crabRect.right > waterRect.left + margin &&
        crabRect.top < waterRect.bottom - margin &&
        crabRect.bottom > waterRect.top + margin
    ) {
        // Collision detected, bounce crab towards the bottom
        crabVelocity.y = 10; // Adjust this value to control the bounce speed
        isBouncing = true;
        setTimeout(() => {
            isBouncing = false;
            crabVelocity.y = 0;
        }, 300); // Stop bouncing after 0.3 second
    }
}

function updateCounter() {
    treasureCount++;
    const counterElement = document.getElementById('counter');
    if (treasureCount === 1) {
        counterElement.textContent = `${treasureCount} treasure`;
        counterElement.style.display = 'block'; // Show counter after first treasure
    } else {
        counterElement.textContent = `${treasureCount} treasures`;
    }
}

window.addEventListener('resize', adjustLayout);

document.addEventListener('DOMContentLoaded', () => {
    adjustLayout();
    animateWater();
    animateFish();
    placeRandomEmoji();

    const container = document.getElementById('container');
    const crab = document.getElementById('crab');
    const fish = document.getElementById('fish');
    const emoji = document.getElementById('emoji');

    // Set initial cursor style
    container.style.cursor = 'default';

    // Prevent text selection and dragging
    [crab, fish, emoji].forEach(element => {
        element.addEventListener('mousedown', (e) => e.preventDefault());
        element.addEventListener('dragstart', (e) => e.preventDefault());
    });

    // Use pointer events
    container.addEventListener('pointerdown', startDragging);
    container.addEventListener('pointermove', updateTargetPosition);
    container.addEventListener('pointerup', stopDragging);
    container.addEventListener('pointerleave', stopDragging);

    // Prevent default touch behavior
    container.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    container.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // Start animation loop
    function animate() {
        moveCrab();
        requestAnimationFrame(animate);
    }
    animate();
});