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

function updateHangmanImage() {
  /*
   * Updates the hangman image based on the number of attempts remaining.
   */
  gameData.HANGMAN_IMAGE.src = `img/${
    gameData.MAX_TRIALS - gameData.trials
  }.png`;
}

function guessAndUpdateBlanks(LETTER) {
  /**
   * Updates the blanks with the correctly guessed letter and marks the
   * corresponding span element as correct.
   * @param {string} LETTER - The letter to guess.
   * @returns {boolean} Returns true if it's a good guess, false otherwise.
   */
  let isGoodGuess = false;
  let lastCorrectSpan = null;

  for (const [I, CHAR] of gameData.secretWordArray.entries()) {
    if (CHAR === LETTER) {
      isGoodGuess = true;
      gameData.blanks[I] = LETTER;
      lastCorrectSpan = gameData.BLANKS_TAG.querySelectorAll("span")[I];
    }
  }

  if (lastCorrectSpan) lastCorrectSpan.classList.remove("correct");

  if (isGoodGuess) return true;
  else return false;
}

function replaceGuessedLetters(IS_GOOD_GUESS, LETTER) {
  /**
   * Replaces the guessed letters in the string of blanks and updates the
   * hangman image if the guess is incorrect.
   * @param {boolean} IS_GOOD_GUESS - Indicates if the guess is correct.
   * @param {string} LETTER - The guessed letter.
   */
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

function hint() {
  /*
   * Provides a hint by disabling a number of letters that are not in the
   * secret word.
   */
  gameData.HINT_BUTTON.style.visibility = "hidden";
  gameData.hintUsed = true;
  const VIRTUAL_KEYS_CHILDREN = Array.from(
    gameData.VIRTUAL_KEYS.querySelectorAll(".btn:not(.disabled)")
  );
  const NON_MATCHING_LETTERS = VIRTUAL_KEYS_CHILDREN.map((BUTTON) =>
    BUTTON.getAttribute("data-value").toLowerCase()
  ).filter((LETTER) => !gameData.secretWordArray.includes(LETTER));
  const MAX_LETTERS_TO_SHOW = Math.min(6, NON_MATCHING_LETTERS.length);
  const INDEXES = new Set();

  for (let i = 0; i < MAX_LETTERS_TO_SHOW; i++) {
    let randomIndex = Math.floor(Math.random() * NON_MATCHING_LETTERS.length);
    while (INDEXES.has(randomIndex)) {
      randomIndex = Math.floor(Math.random() * NON_MATCHING_LETTERS.length);
    }
    const BUTTON = VIRTUAL_KEYS_CHILDREN.find(
      (BTN) =>
        BTN.getAttribute("data-value").toLowerCase() ===
        NON_MATCHING_LETTERS[randomIndex]
    );
    BUTTON.classList.add("disabled");
    INDEXES.add(randomIndex);
  }
}

function checkGameResult() {
  /*
   * Checks the game result and displays the secret word accordingly.
   */
  const BLANKS_STRING = gameData.blanks.join("");
  const SECRET_WORD_LOWERCASE_STRING = gameData.secretWordArray.join("");
  gameData.BLANKS_TAG.textContent = gameData.secretWord;
  gameData.HINT_BUTTON.style.visibility = "hidden";
  gameData.NEW_WORD_BUTTON.style.visibility = "visible";

  if (BLANKS_STRING === SECRET_WORD_LOWERCASE_STRING)
    gameData.BLANKS_TAG.classList.add("correct");
  else gameData.BLANKS_TAG.classList.add("incorrect");
}

function initializeGame() {
  /*
   * Initialize the game and choose a secret word at random.
   */
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

function play(event) {
  /*
   * Manages the game event when a virtual key is clicked.
   * @param {Event} event - The click event object.
   */
  if (gameData.trials === 0 || !gameData.blanks.includes("_")) return;

  if (
    event.target.classList.contains("btn") &&
    !event.target.classList.contains("disabled")
  ) {
    const BUTTON = event.target;
    const LETTER = BUTTON.getAttribute("data-value").toLowerCase();
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
  const target = event.target;

  if (target === gameData.NEW_WORD_BUTTON) {
    initializeGame();
  } else if (target.parentNode === gameData.VIRTUAL_KEYS) {
    play(event);
  } else if (target === gameData.HINT_BUTTON) {
    hint();
  }
});
