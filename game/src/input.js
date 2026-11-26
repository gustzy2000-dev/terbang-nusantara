// Masukan pemain: keyboard dan seret mouse.
// Keadaan dibaca sekali per frame oleh loop utama.

import { clamp } from "./random.js";

export function createInput(canvas) {
  const state = {
    climb: false,
    dive: false,
    throttleUp: false,
    throttleDown: false,
    boost: false,
    drag: 0, // -1..1, negatif = seret ke atas
    pause: false, // berbalik tiap kali P ditekan
    muted: false, // berbalik tiap kali M ditekan
  };

  const down = (code) => {
    switch (code) {
      case "ArrowUp":
      case "KeyW":
        state.climb = true;
        break;
      case "ArrowDown":
      case "KeyS":
        state.dive = true;
        break;
      case "ArrowRight":
      case "KeyD":
        state.throttleUp = true;
        break;
      case "ArrowLeft":
      case "KeyA":
        state.throttleDown = true;
        break;
      case "Space":
        state.boost = true;
        break;
    }
  };

  const up = (code) => {
    switch (code) {
      case "ArrowUp":
      case "KeyW":
        state.climb = false;
        break;
      case "ArrowDown":
      case "KeyS":
        state.dive = false;
        break;
      case "ArrowRight":
      case "KeyD":
        state.throttleUp = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        state.throttleDown = false;
        break;
      case "Space":
        state.boost = false;
        break;
    }
  };

  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    if (e.repeat) return;
    if (e.code === "KeyP") state.pause = !state.pause;
    else if (e.code === "KeyM") state.muted = !state.muted;
    else down(e.code);
  });
  window.addEventListener("keyup", (e) => up(e.code));

  // Seret mouse di kanvas: tarik ke atas = menanjak, ke bawah = menukik.
  let dragging = false;
  let lastY = 0;
  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    lastY = e.clientY;
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    state.drag = clamp((e.clientY - lastY) / 40, -1, 1);
  });
  window.addEventListener("mouseup", () => {
    dragging = false;
    state.drag = 0;
  });

  return state;
}
