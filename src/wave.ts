// wave.ts (TypeScript)

function randomWavePolygon(): string {
    // Generate 3 random Y values in the range 40%–70% for the “peak” points.
    const y1 = 20 + Math.random() * 40; // 40-70
    const y2 = 20 + Math.random() * 40;
    const y3 = 20 + Math.random() * 40;
    const y4 = 20 + Math.random() * 40; // 40-70
    const y5 = 20 + Math.random() * 40;
    const y6 = 20 + Math.random() * 40;
  
    // Build a polygon path (You can add more points if you want smoother shapes).
    // Also note that we always end with "100% 100%, 0 100%" so that the wave
    // covers the bottom of the screen.
    return `polygon(
      0% ${y1}%,
      15% ${y4}%,
      33% ${y2}%,
      50% ${y5}%,
      66% ${y3}%,
      82% ${y6}%,
      100% ${y1}%,
      100% 100%,
      0 100%
    )`;
  }
  
  function shuffleWaves(): void {
    // Get reference to the <body> element style
    const bodyStyle = document.body.style;
  
    // Generate random shapes for wave1 & wave2
    const wave1Clip = randomWavePolygon();
    const wave2Clip = randomWavePolygon();
    const wave3Clip = randomWavePolygon();
  
    // Assign them to the custom properties
    bodyStyle.setProperty('--wave1-clip', wave1Clip);
    bodyStyle.setProperty('--wave2-clip', wave2Clip);
    bodyStyle.setProperty('--wave3-clip', wave3Clip);
  }
  
  // Example: Re‐randomize the waves every 5 seconds
  export function initWaves() {
    // Shuffle once on load:
    shuffleWaves();
  
    // Then shuffle repeatedly (optional):
    setInterval(shuffleWaves, 5000);
  }
  