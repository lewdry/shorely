let isDragging = false;
let crabPosition = { x: 0, y: 0 };
let targetPosition = { x: 0, y: 0 };
let crabSpeed = 5; // Pixels per frame, adjust this to change the crab's speed

function adjustLayout() {
  const container = document.getElementById('container');
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const maxWidth = 1000;
  const aspectRatio = 1.8; // height:width ratio of 1.8:1
  let containerWidth, containerHeight;

  // Calculate width first, capped at maxWidth
  containerWidth = Math.min(windowWidth, maxWidth);
  // Calculate height based on the aspect ratio
  containerHeight = containerWidth * aspectRatio;

  // If the calculated height is greater than the window height,
  // recalculate width based on height
  if (containerHeight > windowHeight) {
    containerHeight = windowHeight;
    containerWidth = containerHeight / aspectRatio;
  }

  container.style.width = `${containerWidth}px`;
  container.style.height = `${containerHeight}px`;

  // Center the container
  container.style.position = 'absolute';
  container.style.left = `${(windowWidth - containerWidth) / 2}px`;
  container.style.top = `${(windowHeight - containerHeight) / 2}px`;

  // Adjust font sizes
  const baseFontSize = containerHeight * 0.02; // 2% of container height
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
  setInterval(randomTide, 5000); // Change tide every 5 seconds
}

function updateTargetPosition(event) {
  const container = document.getElementById('container');
  const containerRect = container.getBoundingClientRect();

  targetPosition.x = event.clientX - containerRect.left;
  targetPosition.y = event.clientY - containerRect.top;
}

function moveCrab() {
  if (!isDragging) return;

  const crab = document.getElementById('crab');
  const container = document.getElementById('container');

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
  }
}

function startDragging(event) {
  isDragging = true;
  updateTargetPosition(event);
  // Change cursor style
  document.getElementById('container').style.cursor = 'grabbing';
}

function stopDragging() {
  isDragging = false;
  // Reset cursor style
  document.getElementById('container').style.cursor = 'grab';
}

function animateFish() {
    const fish = document.getElementById('fish');
    const container = document.getElementById('container');
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;
    const devicePixelRatio = window.devicePixelRatio;
  
    function swimFish() {
      // Random y position in the top 30% of the container
      const randomY = Math.random() * (containerHeight * 0.3);
      fish.style.top = `${randomY}px`;
  
      // Start fish at the right edge of the container
      fish.style.left = `${containerWidth}px`;
      fish.style.display = 'block';
  
      // Trigger reflow to restart the animation
      fish.getBoundingClientRect();
  
      //  Sine wave amplitude and frequency for a more visible wave
      const amplitude = Math.random() * (containerHeight * 0.2) + (containerHeight * 0.1); // Between 10% and 30% of container height
      const frequency = Math.random() * 2 + 1; // Between 1 and 3
  
      // Move fish to the left side of the screen with sine wave y movement
      let startTime = null;
      const swimDuration = 8000; // 8000ms for full swim (5 seconds)
      function swim(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const normalizedProgress = progress / swimDuration;
        const x = normalizedProgress * containerWidth * devicePixelRatio; 
        const y = amplitude * Math.sin(2 * Math.PI * frequency * normalizedProgress); 
  
        fish.style.transform = `translateX(-${x}px) translateY(${y}px)`;
  
        if (progress < swimDuration) {
          requestAnimationFrame(swim);
        } else {
          fish.style.display = 'none';
          fish.style.transform = 'none'; // Reset transform
          setTimeout(swimFish, 2000); // Wait 2 seconds before starting the next swim
        }
      }
      requestAnimationFrame(swim);
    }
  
    // Initial swim
    swimFish();
  }

window.addEventListener('resize', adjustLayout);

document.addEventListener('DOMContentLoaded', () => {
  adjustLayout();
  animateWater();
  animateFish();

  const container = document.getElementById('container');

  // Set initial cursor style
  container.style.cursor = 'grab';

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