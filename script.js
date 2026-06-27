const correctPassword = "michelangelo";

const loginScreen = document.getElementById("login-screen");
const letterScreen = document.getElementById("letter-screen");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const statusMessage = document.getElementById("status-message");
const connectionMessage = document.getElementById("connection-message");

let audioContext;
let ambientGain;
let musicGain;
let ambientOscillators = [];
let musicTimer;
let hasStartedAmbient = false;

window.addEventListener("load", () => {
  passwordInput.focus();
});

function createAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function startAmbientSound() {
  if (hasStartedAmbient) return;

  createAudioContext();
  hasStartedAmbient = true;

  ambientGain = audioContext.createGain();
  ambientGain.gain.setValueAtTime(0.025, audioContext.currentTime);
  ambientGain.connect(audioContext.destination);

  const frequencies = [82, 123, 164];

  frequencies.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gain.gain.setValueAtTime(0.015, audioContext.currentTime);

    oscillator.connect(gain);
    gain.connect(ambientGain);

    oscillator.start();

    ambientOscillators.push({ oscillator, gain });
  });
}

function stopAmbientSound() {
  if (!ambientGain || !audioContext) return;

  ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

  setTimeout(() => {
    ambientOscillators.forEach(({ oscillator }) => {
      try {
        oscillator.stop();
      } catch (error) {
        // Already stopped.
      }
    });

    ambientOscillators = [];
    hasStartedAmbient = false;
  }, 600);
}

function playMusicNote(frequency, startTime, duration) {
  if (!audioContext || !musicGain) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(musicGain);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.05);
}

function startMusicBox() {
  createAudioContext();

  musicGain = audioContext.createGain();
  musicGain.gain.setValueAtTime(0.018, audioContext.currentTime);
  musicGain.connect(audioContext.destination);

  const melody = [
    523.25, 659.25, 783.99, 659.25,
    587.33, 698.46, 880.00, 698.46,
    523.25, 659.25, 783.99, 1046.50,
    987.77, 783.99, 659.25, 523.25
  ];

  let index = 0;

  function playNextNote() {
    if (!audioContext || !musicGain) return;

    const now = audioContext.currentTime;
    const frequency = melody[index % melody.length];

    playMusicNote(frequency, now, 0.75);

    index += 1;
    musicTimer = setTimeout(playNextNote, 900);
  }

  playNextNote();
}

function stopMusicBox() {
  if (musicTimer) {
    clearTimeout(musicTimer);
  }

  if (musicGain && audioContext) {
    musicGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);
  }
}

function setStatus(message, isError = false) {
  statusMessage.classList.toggle("error", isError);
  statusMessage.textContent = message;
}

function revealLetter() {
  loginScreen.classList.add("hidden");
  letterScreen.classList.remove("hidden");
  letterScreen.classList.add("fade-in");

  startMusicBox();

  window.scrollTo({ top: 0, behavior: "smooth" });

  setTimeout(() => {
    connectionMessage.classList.remove("hidden");
    connectionMessage.classList.add("fade-in");
  }, 6000);
}

function authorize() {
  startAmbientSound();

  const enteredPassword = passwordInput.value.trim().toLowerCase();

  if (!enteredPassword) {
    setStatus("Access key required.", true);
    return;
  }

  if (enteredPassword !== correctPassword) {
    setStatus("Access denied.", true);
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  loginButton.disabled = true;
  passwordInput.disabled = true;

  stopAmbientSound();

  const sequence = [
    { text: "Verifying access key...", delay: 0 },
    { text: "Authenticating... ██░░░░░░░░", delay: 700 },
    { text: "Authenticating... █████░░░░░", delay: 1400 },
    { text: "Authenticating... ██████████", delay: 2100 },
    { text: "Decrypting archive...", delay: 2850 },
    { text: "Archive unlocked.", delay: 3650 },
    { text: "Welcome back.", delay: 4400 }
  ];

  sequence.forEach((item) => {
    setTimeout(() => {
      setStatus(item.text);
    }, item.delay);
  });

  setTimeout(() => {
    revealLetter();
  }, 5400);
}

passwordInput.addEventListener("focus", startAmbientSound);
passwordInput.addEventListener("input", startAmbientSound);

loginButton.addEventListener("click", authorize);

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    authorize();
  }
});

window.addEventListener("beforeunload", () => {
  stopAmbientSound();
  stopMusicBox();
});
