const correctPassword = "michelangelo";

const loginScreen = document.getElementById("login-screen");
const letterScreen = document.getElementById("letter-screen");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const statusMessage = document.getElementById("status-message");

window.addEventListener("load", () => {
  passwordInput.focus();
});

function login() {
  const enteredPassword = passwordInput.value.trim().toLowerCase();

  statusMessage.classList.remove("error");
  statusMessage.textContent = "";

  if (!enteredPassword) {
    statusMessage.classList.add("error");
    statusMessage.textContent = "Password required.";
    return;
  }

  if (enteredPassword !== correctPassword) {
    statusMessage.classList.add("error");
    statusMessage.textContent = "Access denied.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  loginButton.disabled = true;
  passwordInput.disabled = true;

  statusMessage.classList.remove("error");
  statusMessage.textContent = "Authenticating...";

  setTimeout(() => {
    statusMessage.textContent = "Authenticating... ███░░░░░░░";
  }, 600);

  setTimeout(() => {
    statusMessage.textContent = "Authenticating... ██████░░░░";
  }, 1200);

  setTimeout(() => {
    statusMessage.textContent = "Authenticating... ██████████";
  }, 1800);

  setTimeout(() => {
    statusMessage.textContent = "Identity verified.";
  }, 2500);

  setTimeout(() => {
    loginScreen.classList.add("hidden");
    letterScreen.classList.remove("hidden");
    letterScreen.classList.add("fade-in");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 3300);
}

loginButton.addEventListener("click", login);

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    login();
  }
});
