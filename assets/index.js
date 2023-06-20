const BLANKS_TAG = document.getElementById("current-word");
const VIRTUAL_KEYS = document.getElementById("virtual-keys");
const HINT_BUTTON = document.getElementById("hint-button");
const NEW_WORD_BUTTON = document.getElementById("new-word-button");
const HANGMAN_IMAGE = document.getElementById("hangman-image");
const MAX_TRIALS = 6;

let trials = MAX_TRIALS;
let hintUsed;
let blanks;
let wordsArray;
let secretWord;
let secretWordArray;

/**
 * Updates the hangman image based on the number of attempts remaining.
 */
function updateHangmanImage() {
  HANGMAN_IMAGE.src = `img/${MAX_TRIALS - trials}.png`;
}

/**
 * Updates the blanks with the correctly guessed letter and marks the
 * corresponding span element as correct.
 * @param {string} LETTER - The letter to guess.
 * @returns {boolean} Returns true if it's a good guess, false otherwise.
 */
function guessAndUpdateBlanks(LETTER) {
  const SPANS = BLANKS_TAG.querySelectorAll("span");

  let isGoodGuess = false;
  let lastCorrectSpan = null;

  for (const [I, CHAR] of secretWordArray.entries()) {
    if (CHAR === LETTER) {
      isGoodGuess = true;
      blanks[I] = LETTER;
      lastCorrectSpan = SPANS[I];
    }
  }

  if (lastCorrectSpan) lastCorrectSpan.classList.remove("correct");

  if (isGoodGuess) return true;
  else return false;
}

/**
 * Replaces the guessed letters in the string of blanks and updates the hangman image if the guess is incorrect.
 * @param {boolean} IS_GOOD_GUESS - Indicates if the guess is correct.
 * @param {string} LETTER - The guessed letter.
 */
function replaceGuessedLetters(IS_GOOD_GUESS, LETTER) {
  if (IS_GOOD_GUESS) {
    const BLANKS_STRING = blanks.join(" ");
    const UPDATED_BLANKS_STRING = BLANKS_STRING.replace(
      new RegExp(LETTER, "gi"),
      `<span class="correct">${LETTER}</span>`
    );
    BLANKS_TAG.innerHTML = UPDATED_BLANKS_STRING;
  } else {
    trials--;
    updateHangmanImage();
  }
}

/**
 * Provides a hint by disabling a number of letters that are not in the secret word.
 */
function hint() {
  HINT_BUTTON.style.visibility = "hidden";
  hintUsed = true;

  const VIRTUAL_KEYS_CHIDREN = Array.from(
    VIRTUAL_KEYS.querySelectorAll(".btn:not(.disabled)")
  );
  const MAX_LETTERS_TO_SHOW = Math.floor(Math.random() * 6) + 1;
  const INDEXES = [];

  while (INDEXES.length < MAX_LETTERS_TO_SHOW) {
    const RANDOM_INDEX = Math.floor(
      Math.random() * VIRTUAL_KEYS_CHIDREN.length
    );
    const BUTTON = VIRTUAL_KEYS_CHIDREN[RANDOM_INDEX];
    const LETTER = BUTTON.getAttribute("data-value");

    if (!INDEXES.includes(RANDOM_INDEX) && !secretWordArray.includes(LETTER)) {
      BUTTON.classList.add("disabled");
      INDEXES.push(RANDOM_INDEX);
    }
  }
}

/**
 * Checks the game result and displays the secret word accordingly.
 */
function checkGameResult() {
  const BLANKS_STRING = blanks.join("");
  const SECRET_WORD_STRING = secretWordArray.join("");

  BLANKS_TAG.textContent = secretWord;
  HINT_BUTTON.style.visibility = "hidden";
  NEW_WORD_BUTTON.style.visibility = "visible";

  if (BLANKS_STRING === SECRET_WORD_STRING) BLANKS_TAG.classList.add("correct");
  else BLANKS_TAG.classList.add("incorrect");
}

/**
 * Initialize the game and choose a secret word at random.
 */
function initializeGame() {
  NEW_WORD_BUTTON.style.visibility = "hidden";
  BLANKS_TAG.classList.remove("correct", "incorrect");
  VIRTUAL_KEYS.querySelectorAll(".btn").forEach((BUTTON) => {
    BUTTON.classList.remove("disabled");
  });
  secretWord = wordsArray[Math.floor(Math.random() * wordsArray.length)];
  trials = MAX_TRIALS;
  blanks = Array(secretWord.length).fill("_");
  secretWordArray = secretWord.split("");
  hintUsed = false;
  BLANKS_TAG.textContent = blanks.join(" ");
  updateHangmanImage();
}

/**
 * Manages the game event when a virtual key is clicked.
 * @param {Event} event - The click event object.
 */
function play(event) {
  if (trials === 0 || !blanks.includes("_")) return;

  const BUTTON = event.target;
  const LETTER = BUTTON.getAttribute("data-value");
  const IS_GOOD_GUESS = guessAndUpdateBlanks(LETTER);

  replaceGuessedLetters(IS_GOOD_GUESS, LETTER);

  BUTTON.classList.add("disabled");

  if (trials === 1 && !hintUsed) HINT_BUTTON.style.visibility = "visible";

  if (!trials || !blanks.includes("_")) checkGameResult();
}

fetch("./words.txt")
  .then((response) => response.text())
  .then((data) => {
    wordsArray = data.split(" ");
    initializeGame();
  })
  .catch((error) => {
    console.error(`Error reading word file: ${error}`);
  });

document.addEventListener("click", (event) => {
  const TARGET = event.target;

  if (TARGET === NEW_WORD_BUTTON) {
    initializeGame();
  } else if (TARGET.parentNode === VIRTUAL_KEYS) {
    play(event);
  } else if (TARGET === HINT_BUTTON) {
    hint();
  }
});
