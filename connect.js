// Word pool
const words =
  `in one good real one not school set they state high life consider on and not come what also for set point can want as while with of order child about school thing never hold find order each too between program work end you home place around while place problem end begin interest while public or where see time those increase interest be give end think seem small as both another a child same eye you between way do who into again good fact than under very head become real possible some write know however late each that with because that place nation only for each change form consider we would interest with world so order or run more open that large write turn never over open each over change still old take hold need give by consider line only leave while what set up number part form want against great problem can because head so first this here would course become help year first end want both fact public long word down also long for without new turn against the because write seem line interest call not if line thing what work people way may old consider leave hold want life between most place may if go who need fact such program where which end off child down change to from people high during people find to however into small new general it do that could old for last get another hand much eye great no work and with but good there last think can around use like number never since world need what we around part show new come seem while some and since still small these you general which seem will place come order form how about just also they with state late use both early too lead general seem there point take general seem few out like might under if ask while such interest feel word right again how about system such between late want fact up problem stand new say move a lead small however large public out by eye here over so be way use like say people work for since interest so face order school good not most run problem group run she late other problem real form what just high no man do under would to each too end point give number child through so this large see get form also all those course to work during about he plan still so like down he look down where course at who plan way so since come against he all who at world because while so few last these mean take house who old way large no first too now off would in this course present order home public school back own little about he develop of do over help day house stand present another by few come that down last or use say take would each even govern play around back under some line think she even when from do real problem between long as there school do as mean to all on other good may from might call world thing life turn of he look last problem after get show want need thing old other during be again develop come from consider the now number say life interest to system only group world same state school one problem between for turn run at very against eye must go both still all a as so after play eye little be those should out after which these both much house come both school this he real and may mean time by real number other as feel at end ask plan come turn by all head increase he present increase use stand after see order lead than system here ask in of look point little too without each for both but right we come world much own set we right off long those stand go both but under now must real general then before with much those at no of we only back these person plan from run new as own take early just increase only look open follow get that on system the mean plan man over it possible if most late linew ould first without real hand say turn point small set at in system however to be home show new again come under because about show face child know person large program how over could thing from out world while nation stand part run have look what many system order some one program you great could write day do he any also where child late face eye run still again on by as call high the must by late little mean never another seem to leave because for day against public long number word about after much need open change also`.split(
    ' '
  );

// Game time
const gameTime = 30; // seconds
let timer = null;
let timeLeft = gameTime;
let gameStarted = false;

// Score tracking
let typedChars = 0;
let correctChars = 0;
let totalWordsTyped = 0;

// DOM elements
const gameEl = document.getElementById('game');
const wordsEl = document.getElementById('words');
const infoEl = document.getElementById('info');
const cursorEl = document.getElementById('cursor');
const newGameBtn = document.getElementById('newGameBtn');

// ---------------- Utility functions ----------------
function addClass(el, name) {
  if (el && !el.classList.contains(name)) el.classList.add(name);
}
function removeClass(el, name) {
  if (el) el.classList.remove(name);
}

function randomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word
    .split('')
    .join('</span><span class="letter">')}</span></div>`;
}

// ---------------- NEW CURSOR FUNCTION ----------------
function updateCursor() {
  const currentLetter = document.querySelector('.letter.current');
  const currentWord = document.querySelector('.word.current');

  // If no word is current, we can't position.
  if (!currentWord) {
    cursorEl.style.display = 'none'; // Hide cursor if no word
    return;
  }
  
  // Ensure cursor is visible if it should be
  if(gameEl === document.activeElement) {
      cursorEl.style.display = 'block';
  }

  const gameRect = gameEl.getBoundingClientRect();
  let targetRect;
  let positionAtEnd = false;

  if (currentLetter) {
    // Position at the start of the current letter
    targetRect = currentLetter.getBoundingClientRect();
  } else {
    // No current letter. This means we are at the end of the word.
    // We should position the cursor after the last letter.
    const letters = currentWord.querySelectorAll('.letter');
    if (letters.length > 0) {
      // Get the last letter and position at its end
      targetRect = letters[letters.length - 1].getBoundingClientRect();
      positionAtEnd = true;
    } else {
      // The word is empty (e.g., after backspacing all letters)
      // Position at the start of the word container
      targetRect = currentWord.getBoundingClientRect();
    }
  }

  // Calculate position relative to the #game container
  const top = targetRect.top - gameRect.top;
  const left = positionAtEnd
    ? (targetRect.right - gameRect.left) // Position *after* the last letter
    : (targetRect.left - gameRect.left); // Position *before* the current letter

  cursorEl.style.top = top + 'px';
  cursorEl.style.left = left + 'px';
}

// ---------------- Game functions ----------------
function newGame() {
  clearInterval(timer);
  timer = null;
  timeLeft = gameTime;
  gameStarted = false;
  typedChars = 0;
  correctChars = 0;
  totalWordsTyped = 0;

  infoEl.innerHTML = `Time: <span id="timer">${gameTime}</span> s`;
  document.getElementById('timer').classList.remove('warn');
  
  // Reset stats
  document.getElementById('wpm').innerText = '0';
  document.getElementById('acc').innerText = '100%';


  wordsEl.style.marginTop = '0px';
  wordsEl.innerHTML = '';

  // Generate words
  for (let i = 0; i < 200; i++) {
    wordsEl.innerHTML += formatWord(randomWord());
  }

  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.letter'), 'current');
  removeClass(gameEl, 'over');
  
  // Reset timer text and stats
  document.getElementById('timer').innerText = gameTime;
  document.getElementById('stats').hidden = false;
  document.getElementById('result').hidden = true;
  
  gameEl.focus(); // Re-focus the game area
  updateCursor();
}

// Calculates WPM for the *final* score
function calculateResults() {
  const wpm = (correctChars / 5) / (gameTime / 60); // Use full gameTime for WPM
  const accuracy = typedChars ? (correctChars / typedChars) * 100 : 0;
  return {
    wpm: Math.round(wpm || 0),
    accuracy: Math.round(accuracy || 0),
    words: totalWordsTyped,
  };
}

// ---------------- NEW: Calculates WPM *while typing* ----------------
function calculateLiveResults() {
  const elapsed = gameTime - timeLeft;
  if (elapsed === 0) return { wpm: 0, accuracy: 100 }; // Avoid division by zero
  
  const wpm = (correctChars / 5) / (elapsed / 60);
  const accuracy = typedChars ? (correctChars / typedChars) * 100 : 0;
  return {
      wpm: Math.round(wpm || 0),
      accuracy: Math.round(accuracy || 0),
  };
}


function gameOver() {
  clearInterval(timer);
  timer = null;
  gameStarted = false;
  addClass(gameEl, 'over');

  const { wpm, accuracy, words } = calculateResults(); // Use final calculation
  
  // Show results in the result div
  const resultEl = document.getElementById('result');
  resultEl.innerHTML = `WPM: <strong>${wpm}</strong> | Accuracy: <strong>${accuracy}%</strong> | Words: <strong>${words}</strong>`;
  resultEl.hidden = false;
  
  // Hide the live stats
  document.getElementById('stats').hidden = true;
  document.getElementById('info').innerHTML = "Game Over!";
  cursorEl.style.display = 'none'; // Hide cursor on game over
}

// ---------------- Timer ----------------
function startTimer() {
  if (gameStarted) return;
  gameStarted = true;
  
  const timerEl = document.getElementById('timer');

  timer = setInterval(() => {
    timeLeft--;
    timerEl.innerText = timeLeft;
    if (timeLeft <= 10 && !timerEl.classList.contains('warn')) {
      addClass(timerEl, 'warn');
    }
    if (timeLeft <= 0) {
      gameOver();
    }
  }, 1000);
}

// ---------------- Typing logic ----------------
gameEl.addEventListener('keydown', (e) => {
  const key = e.key;
  const currentWord = document.querySelector('.word.current');
  const currentLetter = document.querySelector('.letter.current');
  const expected = currentLetter ? currentLetter.innerText : ' ';
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';

  if (document.querySelector('#game.over')) return;

  // Start timer on first letter press
  if (isLetter && !gameStarted) {
      startTimer();
  }

  // Update stats on every keypress (except backspace)
  if ((isLetter || isSpace) && gameStarted) {
     // ---------------- MODIFIED: Use live calculator ----------------
     const { wpm, accuracy } = calculateLiveResults(); 
     document.getElementById('wpm').innerText = wpm;
     document.getElementById('acc').innerText = accuracy + '%';
  }

  // Typing letters
  if (isLetter) {
    typedChars++;
    if (currentLetter) {
      if (key === expected) {
        addClass(currentLetter, 'correct');
        correctChars++;
      } else {
        addClass(currentLetter, 'incorrect');
      }
      removeClass(currentLetter, 'current');
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, 'current');
      }
    } else {
      // Allow adding "extra" letters
      const extra = document.createElement('span');
      extra.innerText = key;
      extra.className = 'letter incorrect extra';
      currentWord.appendChild(extra);
      addClass(extra, 'current'); // Make the new extra letter current
    }
  }

  // Space handling (next word)
  if (isSpace) {
    // Don't allow space if at the very beginning of a word
    if (!currentLetter && currentWord.querySelectorAll('.letter').length === 0) return;

    const incorrectLetters = currentWord.querySelectorAll('.letter.incorrect').length;
    const extraLetters = currentWord.querySelectorAll('.letter.extra').length;
    
    // Only count as a "word" if no incorrect or extra letters
    if (incorrectLetters === 0 && extraLetters === 0 && currentWord.querySelectorAll('.letter').length > 0) {
      totalWordsTyped++;
    }

    removeClass(currentWord, 'current');
    if (currentWord.nextSibling) {
        addClass(currentWord.nextSibling, 'current');

        if (currentLetter) removeClass(currentLetter, 'current');
        addClass(currentWord.nextSibling.firstChild, 'current');

        // Scroll logic
        const nextWordRect = currentWord.nextSibling.getBoundingClientRect();
        const gameRect = gameEl.getBoundingClientRect();
        if (nextWordRect.bottom > gameRect.bottom - 20) { // Check if next word is near the bottom
            const margin = parseInt(wordsEl.style.marginTop || '0px');
            wordsEl.style.marginTop = (margin - 34) + 'px'; // Scroll up by one line-height
        }
    } else {
        // End of game, no more words
        gameOver();
    }
  }

  // Backspace handling
  if (isBackspace) {
    e.preventDefault();
    
    // Handle "extra" letters first
    const extraLetters = currentWord.querySelectorAll('.letter.extra');
    if (extraLetters.length > 0) {
        const lastExtra = extraLetters[extraLetters.length - 1];
        if(lastExtra.classList.contains('current')){
            removeClass(lastExtra, 'current');
            if (lastExtra.previousSibling) {
                addClass(lastExtra.previousSibling, 'current');
            }
        }
        lastExtra.remove();
        
        // Update live stats after backspace
        if (gameStarted) {
            const { wpm, accuracy } = calculateLiveResults();
            document.getElementById('wpm').innerText = wpm;
            document.getElementById('acc').innerText = accuracy + '%';
        }
        updateCursor();
        return;
    }

    // If no current letter, move to previous word
    if (!currentLetter && currentWord.previousElementSibling) {
      removeClass(currentWord, 'current');
      addClass(currentWord.previousElementSibling, 'current');

      const prevLetters = currentWord.previousElementSibling.querySelectorAll('.letter');
      if (prevLetters.length > 0) {
         const lastLetter = prevLetters[prevLetters.length - 1];
         addClass(lastLetter, 'current');
         
         if (lastLetter.classList.contains('correct')) correctChars--;
         if (lastLetter.classList.contains('correct') || lastLetter.classList.contains('incorrect')) {
            typedChars = Math.max(0, typedChars - 1);
         }
         lastLetter.classList.remove('correct', 'incorrect');
      }
    }
    
    // If there is a current letter and it's not the first
    if (currentLetter && currentLetter.previousSibling) {
        const prev = currentLetter.previousSibling;
        removeClass(currentLetter, 'current');
        addClass(prev, 'current');
        
        if (prev.classList.contains('correct')) correctChars--;
        if(prev.classList.contains('correct') || prev.classList.contains('incorrect')) {
            typedChars = Math.max(0, typedChars - 1);
        }
        prev.classList.remove('correct', 'incorrect');
    }
    
    // Update live stats after backspace
    if (gameStarted) {
        const { wpm, accuracy } = calculateLiveResults();
        document.getElementById('wpm').innerText = wpm;
        document.getElementById('acc').innerText = accuracy + '%';
    }
  }

  updateCursor();
});

// ---------------- Button Listeners ----------------
newGameBtn.addEventListener('click', newGame);
document.getElementById('resetBtn').addEventListener('click', newGame);

// Initial setup
newGame();