const correctPassword = "michelangelo";

const container = document.getElementById("container");
const loginScreen = document.getElementById("login-screen");
const transitionScreen = document.getElementById("transition-screen");
const letterScreen = document.getElementById("letter-screen");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const statusMessage = document.getElementById("status-message");
const endingMessage = document.getElementById("ending-message");
const archiveMessage = document.getElementById("archive-message");

const typeSound = new Audio("type.mp3");
const authorizeSound = new Audio("authorize.mp3");
const errorSound = new Audio("error.mp3");
const successSound = new Audio("success.mp3");
const musicbox = new Audio("musicbox.mp3");

musicbox.volume = 0;
musicbox.loop = false;

typeSound.volume = 0.32;
authorizeSound.volume = 0.48;
errorSound.volume = 0.45;
successSound.volume = 0.5;

let archiveMessageShown = false;

window.addEventListener("load", () => {
  passwordInput.focus();
});

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function fadeAudio(audio, targetVolume, duration) {
  const steps = 40;
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

function resetAfterError() {
  loginButton.disabled = false;
  passwordInput.disabled = false;
  loginButton.textContent = "AUTHORIZE";
  passwordInput.value = "";
  passwordInput.focus();
}

function startMusicbox() {
  musicbox.currentTime = 0;
  musicbox.volume = 0;

  musicbox.play().then(() => {
    fadeAudio(musicbox, 0.38, 2400);
  }).catch(() => {});
}

function observeRevealItems() {
  const revealItems = document.querySelectorAll(".reveal-item");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  });

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });
}

function observeEnding() {
  const endingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !archiveMessageShown) {
        archiveMessageShown = true;

        setTimeout(() => {
          archiveMessage.classList.remove("hidden");
          archiveMessage.classList.add("fade-in");
          fadeAudio(musicbox, 0, 5200);
        }, 1800);

        endingObserver.unobserve(endingMessage);
      }
    });
  }, {
    threshold: 0.7
  });

  endingObserver.observe(endingMessage);
}

function revealLetter() {
  loginScreen.classList.add("hidden");
  transitionScreen.classList.remove("hidden");

  setTimeout(() => {
    startMusicbox();
  }, 700);

  setTimeout(() => {
    transitionScreen.classList.add("hidden");
    container.classList.add("reading");
    letterScreen.classList.remove("hidden");
    letterScreen.classList.add("fade-in");

    window.scrollTo({ top: 0, behavior: "smooth" });

    observeRevealItems();
    observeEnding();
  }, 1600);
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
    { text: "Authenticating...\n█░░░░░░░░░", delay: 1200 },
    { text: "Authenticating...\n████░░░░░░", delay: 1950 },
    { text: "Authenticating...\n██████████", delay: 2700 },
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
  }, 6500);
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
