const correctPassword = "michelangelo";

const loginScreen = document.getElementById("login-screen");
const letterScreen = document.getElementById("letter-screen");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const statusMessage = document.getElementById("status-message");
const connectionMessage = document.getElementById("connection-message");

const typeSound = new Audio("type.mp3");
const authorizeSound = new Audio("authorize.mp3");
const errorSound = new Audio("error.mp3");
const successSound = new Audio("success.mp3");
const musicbox = new Audio("musicbox.mp3");

musicbox.volume = 0;
musicbox.loop = false;

[typeSound, authorizeSound, errorSound, successSound].forEach((sound) => {
  sound.volume = 0.45;
});

window.addEventListener("load", () => {
  passwordInput.focus();
});

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function fadeAudio(audio, targetVolume, duration) {
  const steps = 30;
  const startVolume = audio.volume;
  const volumeStep = (targetVolume - startVolume) / steps;
  const stepDuration = duration / steps;
  let currentStep = 0;

  const interval = setInterval(() => {
    currentStep += 1;
    audio.volume = Math.min(1, Math.max(0, startVolume + volumeStep * currentStep));

    if (currentStep >= steps) {
      audio.volume = targetVolume;
      clearInterval(interval);
    }
  }, stepDuration);
}

function setStatus(message, isError = false) {
  statusMessage.classList.toggle("error", isError);
  statusMessage.textContent = message;
}

function revealLetter() {
  loginScreen.classList.add("hidden");
  letterScreen.classList.remove("hidden");
  letterScreen.classList.add("fade-in");

  musicbox.currentTime = 0;
  musicbox.volume = 0;
  musicbox.play().then(() => {
    fadeAudio(musicbox, 0.38, 2200);
  }).catch(() => {});

  window.scrollTo({ top: 0, behavior: "smooth" });

  setTimeout(() => {
    connectionMessage.classList.remove("hidden");
    connectionMessage.classList.add("fade-in");
    fadeAudio(musicbox, 0, 5000);
  }, 18000);
}

function resetAfterError() {
  loginButton.disabled = false;
  passwordInput.disabled = false;
  loginButton.textContent = "AUTHORIZE";
  passwordInput.value = "";
  passwordInput.focus();
}

function authorize() {
  const enteredPassword = passwordInput.value.trim().toLowerCase();

  if (!enteredPassword) {
    playSound(errorSound);
    setStatus("Access key required.", true);
    resetAfterError();
    return;
  }

  if (enteredPassword !== correctPassword) {
    playSound(errorSound);
    setStatus("Access denied.", true);
    resetAfterError();
    return;
  }

  playSound(authorizeSound);

  loginButton.disabled = true;
  passwordInput.disabled = true;
  loginButton.textContent = "AUTHORIZING...";

  const sequence = [
    { text: "Verifying access key...", delay: 450 },
    { text: "Authenticating... ██░░░░░░░░", delay: 1200 },
    { text: "Authenticating... █████░░░░░", delay: 1950 },
    { text: "Authenticating... ██████████", delay: 2700 },
    { text: "Decrypting archive...", delay: 3500 },
    { text: "Archive unlocked.", delay: 4400 },
    { text: "Welcome back.", delay: 5200 }
  ];

  sequence.forEach((item) => {
    setTimeout(() => {
      setStatus(item.text);
    }, item.delay);
  });

  setTimeout(() => {
    playSound(successSound);
  }, 4400);

  setTimeout(() => {
    revealLetter();
  }, 6400);
}

passwordInput.addEventListener("keydown", (event) => {
  const ignoredKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "CapsLock",
    "Escape",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Enter"
  ];

  if (!ignoredKeys.includes(event.key) && event.key.length === 1) {
    playSound(typeSound);
  }

  if (event.key === "Enter") {
    authorize();
  }
});

loginButton.addEventListener("click", authorize);
