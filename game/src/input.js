// Keyboard dan mouse: naik, turun, gas, rem, boost, jeda, suara, dan seret mouse.
// Satu file, satu tugas: membaca kendali pemain.

export function makeInput() {
  const input = {
    up: false,
    down: false,
    gas: false,
    brake: false,
    boost: false,
    steerY: 0, // -1..1 dari seret mouse
    paused: false,
  };

  const keys = {};

  function updateFromKeys() {
    input.up = !!(keys.ArrowUp || keys.KeyW);
    input.down = !!(keys.ArrowDown || keys.KeyS);
    input.gas = !!(keys.ArrowRight || keys.KeyD);
    input.brake = !!(keys.ArrowLeft || keys.KeyA);
    input.boost = !!keys.Space;
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    keys[e.code] = true;
    updateFromKeys();
    if (e.code === 'KeyP') input.paused = !input.paused;
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    updateFromKeys();
  });

  // Seret mouse di atas canvas: arah vertikal seretan membelokkan pesawat.
  let dragging = false;
  let lastY = 0;
  const canvas = document.getElementById('cv');
  if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
      dragging = true;
      lastY = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dy = e.clientY - lastY;
      lastY = e.clientY;
      input.steerY = Math.max(-1, Math.min(1, dy / 60));
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      input.steerY = 0;
    });
  }

  return input;
}
