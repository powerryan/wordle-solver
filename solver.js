var colors = {"incorrect": "rgb(64, 75, 153)", "present": "rgb(180, 190, 0)", "correct": "rgb(51, 153, 51)"};
var letters = {"correct": [], "incorrect":[], "present":[]};
var correctPositions = {};
var presentPositions = {};
var taken = [];
var available = [];
var answers = [];

for (var i = 0; i < document.querySelectorAll(".letter").length; i++) {
  document.querySelectorAll(".letter")[i].addEventListener("click", changeColor);
}

function changeColor() {
  if (!this.style.borderColor || this.style.borderColor == colors["incorrect"]) {
    this.style.borderColor = colors["present"];
  }
  else if (this.style.borderColor == colors["present"]) {
    this.style.borderColor = colors["correct"];
  }
  else {
    this.style.borderColor = colors["incorrect"];
  }
}

document.addEventListener("keyup", function(event) {
  for (var i = 0; i < document.querySelectorAll(".letter").length; i++) {
    var letter = document.querySelectorAll(".letter")[i].innerHTML;
    if (letter.length === 0 && event.keyCode >= 65 && event.keyCode <= 90) {
      if (i > 0 && (i+1) % 5 == 0) {
        var word = "";
        for (var j = i-4; j < i; j++) {
          word = word + document.querySelectorAll(".letter")[j].innerHTML;
        }
        if (isWord(word+event.key)) {
          document.querySelectorAll(".letter")[i].innerHTML = event.key.toUpperCase();
          break;
        }
        else {
          document.querySelectorAll(".letter")[i-4].innerHTML = "";
          document.querySelectorAll(".letter")[i-3].innerHTML = "";
          document.querySelectorAll(".letter")[i-2].innerHTML = "";
          document.querySelectorAll(".letter")[i-1].innerHTML = "";
          break;
        }
      }
      else {
        document.querySelectorAll(".letter")[i].innerHTML = event.key.toUpperCase();
        break;
      }
    }
    if (event.keyCode == 46 || event.keyCode == 8) {
      deleteLetter();
      break;
    }
  }
})

function deleteLetter() {
  for (var i = document.querySelectorAll(".letter").length - 1; i > -1; i--) {
    var letter = document.querySelectorAll(".letter")[i].innerHTML;
    if (letter.length != 0) {
      document.querySelectorAll(".letter")[i].innerHTML = "";
      break;
    }
  }
}

function isWord(line) {
  var line = line.toLowerCase();
  for (word in words) {
    if (line == words[word]) {
      return true;
    }
  }
  return false;
}

function nextWord(num) {
  var added = {};
  for (var i = 0; i < 5; i++) {
    var letter = document.querySelectorAll(".letter")[num+i].innerHTML.toLowerCase();
    var color = document.querySelectorAll(".letter")[num+i].style.borderColor;
    if (!letter.length) {
      break;
    }
    // add to incorrect letter
    if (colors["incorrect"] == color || !color) {
      if (!letters["incorrect"].includes(letter)) {
        letters["incorrect"].push(letter);
      }
      else if (presentPositions[letter] && !presentPositions[letter].include(i%5)) {
        presentPositions[letter].push(i%5);
      }
    }
    // add to correct letter
    else if (colors["correct"] == color) {
      if (!letters["correct"].includes(letter)) {
        letters["correct"].push(letter);
        if (!added[letter] && letters["present"].includes(letter)) {
          letters["present"].splice(letters["present"].indexOf(letter), 1);
        }
      }
      if (!correctPositions[letter]) {
        correctPositions[letter] = [i%5];
        taken.push(letter);
      }
      else if (!correctPositions[letter].includes(i%5)) {
        correctPositions[letter].push(i%5);
        taken.push(letter);
      }
    }
    else if (colors["present"] == color) {
      if (!added[letter]) {
        added[letter] = 1;
      }
      else {
        added[letter] += 1;
      }
      if (!letters["present"].includes(letter)) {
        letters["present"].push(letter);
      }
      else if (letters["present"].filter(x => x == letter).length < added[letter]) {
        letters["present"].push(letter);
      }
      if (!presentPositions[letter]) {
        presentPositions[letter] = [i%5];
      }
      else if (!presentPositions[letter].includes(i%5)) {
        presentPositions[letter].push(i%5);
      }
    }

  }
}

function generateGuesses() {
  letters = {"correct": [], "incorrect":[], "present":[]};
  correctPositions = {};
  presentPositions = {};
  taken = [];
  answers = [];
  if (!document.querySelectorAll(".letter")[4].innerHTML) {
    document.querySelector(".output").style.visibility = "visible";
    return
  }
  for (var i = 0; i < 6; i++) {
    if (document.querySelectorAll(".letter")[(i * 5) + 4].innerHTML) {
      nextWord(i*5);
      console.log(letters);
      console.log(correctPositions);
      console.log(presentPositions);
      console.log(taken);
    }
  }
  for (var i = 0; i < words.length; i ++) {
    var correctLetters = 0;
    var incorrect = false;

    // check for incorrect letters
    for (var x = 0; x < 5; x++) {
      for (var y = 0; y < letters["incorrect"].length; y++) {
        if (words[i][x] == letters["incorrect"][y] && !isCorrect(words[i][x], x)) {
          incorrect = true;
        }
      }
    }
    // check for correct letters
    if (!incorrect) {
      for (var j = 0; j < taken.length; j++) {
        var count = 0;
        for (var pos = 0; pos < correctPositions[taken[j]].length; pos++) {
          if (words[i][correctPositions[taken[j]][pos]] == taken[j]) {
            count++;
          }
        }
        if (count == correctPositions[taken[j]].length) {
          correctLetters++;
        }
      }
    }
    // check for present letters
    if (!incorrect && correctLetters == taken.length) {

      var allPresent = true;
      if (!containsLetter(words[i], letters["present"])) {
        allPresent = false;
      }
      else {
        for (var letter = 0; letter < letters["present"].length; letter++) {
          // ensure all present letters in word

          // ensure present letters in possible positions
          if (!possiblePosition(words[i], letters["present"][letter])) {

            allPresent = false;
          }
        }
      }
      if (allPresent) {
        answers.push(words[i]);
      }
    }
  }

  document.querySelector(".output").innerHTML = "";
  for (var el = 0; el < answers.length - 1; el++) {
    document.querySelector(".output").innerHTML += answers[el].toUpperCase() + ", ";
  }
  if (answers.length) {
    document.querySelector(".output").innerHTML += answers[answers.length -1].toUpperCase();
  }
  document.querySelector(".output").style.visibility = "visible";
}

function isCorrect(letter, position) {
  for (var l = 0; l < taken.length; l++) {
    if (letter == taken[l]) {
      // if letter is not in any of letter's correct spots
      if (!correctPositions[letter].includes(position)) {
        // if letter not present or is in present letters and in eliminated spots
        if (!presentPositions[letter] || (presentPositions[letter] && presentPositions[letter].includes(position))) {
          return false;
        }
      }
      return true;
    }
  }
  if (presentPositions[letter] && !presentPositions[letter].includes(position)) {
      if (!correctPositions[letter] || !correctPositions[letter].includes(position)) {
        return true;
      }
    }
  return false;
}

function containsLetter(word, presentLetters) {
  var count = 0;
  var inWord;
  for (var l = 0; l < presentLetters.length; l++) {
    inWord = 0;
    count = presentLetters.filter(x => x == presentLetters[l]).length;
    for (var e = 0; e < 5; e++) {
      if (word[e] == presentLetters[l]) {
        inWord++;
      }
    }
    if (inWord < count) {
      return false;
    }
  }
  return true;
}

function possiblePosition(word, letter) {
  var possible = false;
  for (var l = 0; l < 5; l++) {
    if (word[l] == letter) {
      if (presentPositions[letter].includes(l)) {
        return false;
      }
      else if (correctPositions[letter]) {
        if (!correctPositions[letter].includes(l)) {
          possible = true;
        }
      }
      else if (!correctPositions[letter]) {
        possible = true;
      }
    }
  }
  return possible;
}
