import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, set, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import confetti from "https://esm.run/canvas-confetti@1";

var playerName = ""

const appSettings = {
    databaseURL: "https://super-bowl-bingo-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const peopleRef = ref(database, "/People")

let initialDataRetrieved = false;
let previousData = {};

async function winPopup(personName, person) {
    document.getElementById("windisplay1").innerText = personName+" Won!"
    document.getElementById("winnerswinsdisplay").innerText = personName+" Has "+person.Wins+" Wins"
    document.getElementById("winningspacesdisplay").innerText = person.WinCause
    document.getElementById("popupback").style.display = "inline";
    document.getElementById("winpopup").style.display = "flex";
    document.getElementById("winpopup").style.flexDirection = "column"
    document.getElementById("winpopup").style.flexFlow = "row wrap"
}

onValue(peopleRef, (snapshot) => {
  const peopleData = snapshot.val();

  if (!initialDataRetrieved) {
    console.log("Initial data retrieved, waiting for updates...");
    initialDataRetrieved = true;
    previousData = peopleData;
    return;
  }
  for (const personName in peopleData) {
    if (peopleData.hasOwnProperty(personName)) {
      const person = peopleData[personName];
      const wins = person.Wins;
      if (previousData[personName] && previousData[personName].Wins !== wins) {
        if (!(personName==playerName)) {
            console.log(`${personName}'s Wins: ${wins}`);
            winPopup(personName, person)
        }
      }
    }
  }
  previousData = peopleData;
});

async function incrementWins() {
    var winsvalue = await get(ref(database, "People/"+playerName+"/Wins"));
    const causeRef = ref(database, 'People/'+playerName+'/WinCause');
    set(causeRef,winningSquaresString)
    const nameRef = ref(database, 'People/'+playerName+'/Wins');
    set(nameRef,winsvalue.val()+1)
    document.getElementById("wins").innerText = "Wins: "+(winsvalue.val()+1)
}

function addPerson(name) {
    const personRef = ref(database, '/People/'+name)
  set(personRef, {
    Wins: 0,
    WinCause: "",
  })
    .then(() => {
      console.log("Person added successfully");
    })
    .catch((error) => {
      console.error("Error adding person:", error);
    });
}

const spacesList = [
    "Taylor Swift",
    "Taylor Swift ",
    "Touchdown",
    "Injury",
    "Patrick Mahomes Ad",
    "Gronk Ad",
    "Touchdown",
    "Field Goal",
    "Interception",
    "Fumble",
    "Replay Review",
    "White Unicorn",
    "Trifecta: Black/Asian/White",
    "Black Straight",
    "Face Paint Fan",
    "Dog in Ad",
    "Fast Food Ad",
    "Pizza Ad",
    "New Car Ad",
    "Booze Ad",
    "Fan on Cellphone",
    "Drug Ad",
    "25+ Yard Run",
    "25+ Yard Pass",
    "Gay Stuff",
    "Announcers Talking About Taylor Swift"
]

function resetBoard() {
    var taken = []
    for (let i=0; i<25; i++) {
        var randomElementFromSpacesList = spacesList[Math.floor(Math.random() * spacesList.length)];
        while (taken.includes(randomElementFromSpacesList)) {
            randomElementFromSpacesList = spacesList[Math.floor(Math.random() * spacesList.length)];
        }
        taken.push(randomElementFromSpacesList)
    };
    for (let i=0; i<taken.length; i++) {
        var currentBoardSpace = document.getElementById("square"+i)
        currentBoardSpace.innerText = taken[i]
    }
    for (let i=0; i<25; i++) {
        if (activatedBoxes.includes("square"+i)) {
            activatedBoxes.splice(activatedBoxes.indexOf('square'+i), 1)
            document.getElementById("square"+i).style.backgroundColor = "rgb(66, 66, 66)"
        }
    }
    localStorage.setItem('SB_board', JSON.stringify(taken));
    adjustFontSize();
}

function adjustFontSize() {
    var cells = document.querySelectorAll('td');
    cells.forEach(function(cell) {
        cell.style.fontSize = 'inherit';
        var initialFontSize = parseInt(window.getComputedStyle(cell).fontSize, 10);
        var maxWidth = cell.clientWidth;
        var textWidth = cell.scrollWidth;
        var fontSize = Math.min(initialFontSize, Math.floor((maxWidth / textWidth) * initialFontSize));
        cell.style.fontSize = fontSize + 'px';
    });
}
window.addEventListener('resize', adjustFontSize);

window.onload = function() {
    adjustFontSize();
};

var winningSquares = []

const downdiag = ["square0","square6","square8","square18","square24"]
const updiag = ["square4","square9","square8","square16","square20"]
const row1 = ["square0","square5","square11","square15","square20"]
const row2 = ["square1","square6","square12","square16","square21"]
const row3 = ["square2","square7","square8","square17","square22"]
const row4 = ["square3","square9","square13","square18","square23"]
const row5 = ["square4","square10","square14","square19","square24"]
const column1 = ["square0","square1","square2","square3","square4"]
const column2 = ["square5","square6","square7","square9","square10"]
const column3 = ["square11","square12","square8","square13","square14"]
const column4 = ["square15","square16","square17","square18","square19"]
const column5 = ["square20","square21","square22","square23","square24"]

function checkIfWin() {
    var notDone = true
    while (notDone) {
        if (downdiag.every(element => activatedBoxes.includes(element))&&(!downdiag.every(element => winningSquares.includes(element)))) { // \ diag
            winningSquares=winningSquares.concat(downdiag)
        } else if (updiag.every(element => activatedBoxes.includes(element))&&(!updiag.every(element => winningSquares.includes(element)))) { // / diag
            winningSquares=winningSquares.concat(updiag)
        } else if (column1.every(element => activatedBoxes.includes(element))&&(!column1.every(element => winningSquares.includes(element)))) { // | 1st column
            winningSquares=winningSquares.concat(column1)
        } else if (column2.every(element => activatedBoxes.includes(element))&&(!column2.every(element => winningSquares.includes(element)))) { // | 2nd column
            winningSquares=winningSquares.concat(column2)
        } else if (column3.every(element => activatedBoxes.includes(element))&&(!column3.every(element => winningSquares.includes(element)))) { // | 3rd column
            winningSquares=winningSquares.concat(column3)
        } else if (column4.every(element => activatedBoxes.includes(element))&&(!column4.every(element => winningSquares.includes(element)))) { // | 4th column
            winningSquares=winningSquares.concat(column4)
        } else if (column5.every(element => activatedBoxes.includes(element))&&(!column5.every(element => winningSquares.includes(element)))) { // | 5th column
            winningSquares=winningSquares.concat(column5)
        } else if (row1.every(element => activatedBoxes.includes(element))&&(!row1.every(element => winningSquares.includes(element)))) { // _ 1st row
            winningSquares=winningSquares.concat(row1)
        } else if (row2.every(element => activatedBoxes.includes(element))&&(!row2.every(element => winningSquares.includes(element)))) { // _ 2nd row
            winningSquares=winningSquares.concat(row2)
        } else if (row3.every(element => activatedBoxes.includes(element))&&(!row3.every(element => winningSquares.includes(element)))) { // _ 3rd row
            winningSquares=winningSquares.concat(row3)
        } else if (row4.every(element => activatedBoxes.includes(element))&&(!row4.every(element => winningSquares.includes(element)))) { // _ 4th row
            winningSquares=winningSquares.concat(row4)
        } else if (row5.every(element => activatedBoxes.includes(element))&&(!row5.every(element => winningSquares.includes(element)))) { // _ 5th row
            winningSquares=winningSquares.concat(row5)
        } else {
            notDone = false
        }
    }
}

function promptWin() {
    winningSquaresString = ""
    for (let i=0;i<winningSquares.length;i++) {
        if (!winningSquaresString.includes(document.getElementById(winningSquares[i]).innerText)) {
            winningSquaresString=winningSquaresString+document.getElementById(winningSquares[i]).innerText+", "
        }
    }
    winningSquaresString = winningSquaresString.slice(0, -2) + "."
    document.getElementById("confirmationspacesdisplay").innerText = winningSquaresString
    document.getElementById("popupback").style.display = "inline";
    document.getElementById("confirmationpopup").style.display = "flex";
    document.getElementById("confirmationpopup").style.flexDirection = "column"
    document.getElementById("confirmationpopup").style.flexFlow = "row wrap"
    console.log(winningSquaresString)
}

var boxesAreClickable = false
var activatedBoxes = []
var winningSquaresString = ""
var storedarrayofSelected = []
var storedarrayofFullBoard = []

function loadboard() {
    for (let i=0;i<storedarrayofFullBoard.length;i++) {
        document.getElementById("square"+i).innerText = storedarrayofFullBoard[i]
    }
    for (let i=0;i<storedarrayofSelected.length;i++) {
        document.getElementById(storedarrayofSelected[i]).style.backgroundColor = "#7256A3"
        activatedBoxes.push(storedarrayofSelected[i])
    }
}

async function join(name) {
    if (!name.length==0) {
        const checkpeopleRef = await get(ref(database, "People/"+name));
        if (checkpeopleRef.exists()) {
            var winsvalue = await get(ref(database, "People/"+name+"/Wins"));
            document.getElementById("wins").innerText = "Wins: "+winsvalue.val()
        } else {
            addPerson(name);
        }
        playerName = name
        var arrayofSelected = localStorage.getItem('SB_selected');
        var arrayofFullBoard = localStorage.getItem('SB_board');
        if ((arrayofSelected !== null)&&(arrayofFullBoard !== null)) {
            storedarrayofSelected = JSON.parse(arrayofSelected);
            storedarrayofFullBoard = JSON.parse(arrayofFullBoard);
            if (storedarrayofFullBoard.length == 25) {
                loadboard()
                adjustFontSize()
                localStorage.setItem('SB_selected', JSON.stringify(activatedBoxes));
            } else {
                resetBoard()
            }
        } else {
            resetBoard();
        }
        document.getElementById("namepopup").style.display = "none";
        document.getElementById("popupback").style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var joinButton = document.getElementById('namebutton');
    joinButton.addEventListener('click', function() {
        boxesAreClickable = true
        join(document.getElementById("nameinput").value)
    });

    var confirmButton = document.getElementById('confirmwinbutton');
    confirmButton.addEventListener('click', function() {
        document.getElementById("confirmationpopup").style.display = "none";
        document.getElementById("popupback").style.display = "none";
        incrementWins()
        resetBoard()
        localStorage.setItem('SB_selected', JSON.stringify(activatedBoxes));
        confetti({particleCount: 150,spread: 100});
    });
    var cancelConfirmationButton = document.getElementById('cancelconfirmation');
    cancelConfirmationButton.addEventListener('click', function() {
        document.getElementById("confirmationpopup").style.display = "none";
        document.getElementById("popupback").style.display = "none";
    });

    var resetBoardButton = document.getElementById('resetboardbutton');
    resetBoardButton.addEventListener('click', function() {
        document.getElementById("winpopup").style.display = "none";
        document.getElementById("popupback").style.display = "none";
        resetBoard()
    });
    document.getElementById("nameinput").addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (!boxesAreClickable) {
                boxesAreClickable = true
                join(document.getElementById("nameinput").value)
            }
        }
    });
    for (let i=0; i<25; i++) {
        document.getElementById("square"+i).addEventListener('click',function() {
            if (boxesAreClickable) {
                console.log("CLICKED SQUARE"+i)
                adjustFontSize();
                if (activatedBoxes.includes("square"+i)) {
                    activatedBoxes.splice(activatedBoxes.indexOf('square'+i), 1)
                    document.getElementById("square"+i).style.backgroundColor = "rgb(66, 66, 66)"
                    localStorage.setItem('SB_selected', JSON.stringify(activatedBoxes));
                } else {
                    document.getElementById("square"+i).style.backgroundColor = "#7256A3"
                    activatedBoxes.push("square"+i)
                    winningSquares = []
                    checkIfWin()
                    if (!(winningSquares.length==0)) {
                        promptWin()
                    }
                    localStorage.setItem('SB_selected', JSON.stringify(activatedBoxes));
                }
            }
        })
    }
});