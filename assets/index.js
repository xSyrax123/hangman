const gameData = {
  secretWord: "",
  MAX_TRIALS: 6,
  trials: 0,
  blanks: [],
  secretWordArray: [],
  hintUsed: false,
  words: "",
  WORDS_ARRAY: [],
  BLANKS_TAG: document.querySelector(".current-word"),
  VIRTUAL_KEYS: document.querySelector(".virtual-keys"),
  HINT_BUTTON: document.querySelector(".hint-button"),
  NEW_WORD_BUTTON: document.querySelector(".new-word-button"),
  HANGMAN_IMAGE: document.querySelector("img"),
};

/**
 * Updates the hangman image based on the number of attempts remaining.
 */
function updateHangmanImage() {
  gameData.HANGMAN_IMAGE.src = `img/${
    gameData.MAX_TRIALS - gameData.trials
  }.png`;
}

/**
 * Updates the blanks with the correctly guessed letter and marks the
 * corresponding span element as correct.
 * @param {string} LETTER - The letter to guess.
 * @returns {boolean} Returns true if it's a good guess, false otherwise.
 */
function guessAndUpdateBlanks(LETTER) {
  const SPANS = gameData.BLANKS_TAG.querySelectorAll("span");
  
  let isGoodGuess = false;
  let lastCorrectSpan = null;

  for (const [I, CHAR] of gameData.secretWordArray.entries()) {
    if (CHAR === LETTER) {
      isGoodGuess = true;
      gameData.blanks[I] = LETTER;
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
    const BLANKS_STRING = gameData.blanks.join(" ");
    const UPDATED_BLANKS_STRING = BLANKS_STRING.replace(
      new RegExp(LETTER, "gi"),
      `<span class="correct">${LETTER}</span>`
    );
    gameData.BLANKS_TAG.innerHTML = UPDATED_BLANKS_STRING;
  } else {
    gameData.trials--;
    updateHangmanImage();
  }
}

/**
 * Provides a hint by disabling a number of letters that are not in the secret word.
 */
function hint() {
  gameData.HINT_BUTTON.style.visibility = "hidden";
  gameData.hintUsed = true;

  const VIRTUAL_KEYS_CHIDREN = Array.from(
    gameData.VIRTUAL_KEYS.querySelectorAll(".btn:not(.disabled)")
  );
  const MAX_LETTERS_TO_SHOW = Math.floor(Math.random() * 6) + 1;
  const INDEXES = [];

  while (INDEXES.length < MAX_LETTERS_TO_SHOW) {
    const RANDOM_INDEX = Math.floor(
      Math.random() * VIRTUAL_KEYS_CHIDREN.length
    );
    const BUTTON = VIRTUAL_KEYS_CHIDREN[RANDOM_INDEX];
    const LETTER = BUTTON.getAttribute("data-value");

    if (
      !INDEXES.includes(RANDOM_INDEX) &&
      !gameData.secretWordArray.includes(LETTER)
    ) {
      BUTTON.classList.add("disabled");
      INDEXES.push(RANDOM_INDEX);
    }
  }
}

/**
 * Checks the game result and displays the secret word accordingly.
 */
function checkGameResult() {
  const BLANKS_STRING = gameData.blanks.join("");
  const SECRET_WORD_STRING = gameData.secretWordArray.join("");
  
  gameData.BLANKS_TAG.textContent = gameData.secretWord;
  gameData.HINT_BUTTON.style.visibility = "hidden";
  gameData.NEW_WORD_BUTTON.style.visibility = "visible";

  if (BLANKS_STRING === SECRET_WORD_STRING)
    gameData.BLANKS_TAG.classList.add("correct");
  else gameData.BLANKS_TAG.classList.add("incorrect");
}

/**
 * Initialize the game and choose a secret word at random.
 */
function initializeGame() {
  gameData.NEW_WORD_BUTTON.style.visibility = "hidden";
  gameData.BLANKS_TAG.classList.remove("correct", "incorrect");
  gameData.VIRTUAL_KEYS.querySelectorAll(".btn").forEach((BUTTON) => {
    BUTTON.classList.remove("disabled");
  });
  gameData.secretWord =
    gameData.WORDS_ARRAY[
      Math.floor(Math.random() * gameData.WORDS_ARRAY.length)
    ];
  gameData.trials = gameData.MAX_TRIALS;
  gameData.blanks = Array(gameData.secretWord.length).fill("_");
  gameData.secretWordArray = gameData.secretWord.split("");
  gameData.hintUsed = false;
  gameData.BLANKS_TAG.textContent = gameData.blanks.join(" ");
  updateHangmanImage();
}

/**
 * Manages the game event when a virtual key is clicked.
 * @param {Event} event - The click event object.
 */
function play(event) {
  if (gameData.trials === 0 || !gameData.blanks.includes("_")) return;

  if (
    event.target.classList.contains("btn") &&
    !event.target.classList.contains("disabled")
  ) {
    const BUTTON = event.target;
    const LETTER = BUTTON.getAttribute("data-value");
    const IS_GOOD_GUESS = guessAndUpdateBlanks(LETTER);

    replaceGuessedLetters(IS_GOOD_GUESS, LETTER);

    BUTTON.classList.add("disabled");

    if (gameData.trials === 1 && !gameData.hintUsed)
      gameData.HINT_BUTTON.style.visibility = "visible";
  }

  if (gameData.trials === 0 || !gameData.blanks.includes("_"))
    checkGameResult();
}

fetch("./words.txt")
  .then((response) => response.text())
  .then((data) => {
    gameData.words = data;
    gameData.WORDS_ARRAY = gameData.words.split(" ");
    initializeGame();
  })
  .catch((error) => {
    console.error(`Error reading word file: ${error}`);
  });

document.addEventListener("click", (event) => {
  const TARGET = event.target;

  if (TARGET === gameData.NEW_WORD_BUTTON) {
    initializeGame();
  } else if (TARGET.parentNode === gameData.VIRTUAL_KEYS) {
    play(event);
  } else if (TARGET === gameData.HINT_BUTTON) {
    hint();
  }
});
