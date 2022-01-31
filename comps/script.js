'use strict';

//General DOM grabbin
let startBtn = document.getElementById('startBtn');
let P2Board = document.getElementById('P2');
let dragBoats = document.getElementById('dragBoats');
let boats = document.querySelectorAll('.boats');

for(let elem of boats) {
    elem.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.classList[2])
    })
}


//Factory to construct ship objects based on their length
function Ship(len) {
    let arr = [];
    for(let i=0; i<len; i++) {
        arr[i] = 'o';
    }

    function hit(num) {
        if(num >= 0 && num<len) {
            arr[num] = 'x';
        }
    }

    //Function to check if a ship is or isn't Sunk
    function isNotSunk() {
        return arr.includes('o');
    }

    return {len, arr, hit, isNotSunk}
}



//Factory for the gameboards
function Gameboard() {
    let board = [];
    for(let i=0; i<100; i++) {
        board[i] = '';
    }    

    let carrier = Ship(5);
    let battleship = Ship(4);
    let destroyer = Ship(3);
    let submarine = Ship(3);
    let patrol = Ship(2);

    let shipsObj = {
        carrier, battleship, destroyer, submarine, patrol
    };

    //Private function to "place" a ship in the board array
    function placeInCoord(ship, identifier, x, y) {
        let indexStart = +[y,x].join('');
        let indexEnd = indexStart + ship.len;
        let shipIndex = '0';
        for(let i=indexStart; i<indexEnd; i++) {
            board[i] = identifier + shipIndex;
            shipIndex++;
        }
    }

    //Private function to connect a Character to the right Ship Object, so as to not
    //make switch/cases all over the place
    function whichShip(char) {
        switch (char) {
            case 'C': return carrier;
            case 'B': return battleship;
            case 'D': return destroyer;
            case 'S': return submarine;
            case 'P': return patrol;
        }
    }

    //Function to receive an attack and mark the corresponding ship object
    function receiveAttack(x, y) {
        let index = +[y,x].join('');
        //if it's empty, it's a Miss
        if(board[index] == '') {
            board[index] = 'm';
        //else, if it has something, but that something isn't a Miss or a Hit that means it's an (un)hit ship
        } else if(board[index] != 'm' && board[index] != 'h') {
            let identifier = board[index][0];
            let shipIndex = board[index][1];
            let ship = whichShip(identifier);
            ship.hit(shipIndex);
            board[index] = 'h';
        }
    }

    //Function to know which ship to "place" in the arr
    function placeShip(identifier, x, y) {
        let ship = whichShip(identifier);
        placeInCoord(ship, identifier, x, y); 
    }

    //Function to check if all our ships have been sunk
    function areAllShipsSunk() {
        let s1 = carrier.isNotSunk();
        let s2 = battleship.isNotSunk();
        let s3 = destroyer.isNotSunk();
        let s4 = submarine.isNotSunk();
        let s5 = patrol.isNotSunk();
        //Temporarily make winning check just the patrol for ease of testing
        return /*(!s1 && !s2 && !s3 && !s4 && */(!s5);
    }

    return {board, shipsObj, placeShip, receiveAttack, areAllShipsSunk};
}



//Factory for players
function Player(name) {
    let gameboard = Gameboard();
    let publicName;

    function attack(enemy, x, y) {
        enemy.gameboard.receiveAttack(x, y);
        Loop.render(enemy.name)
    }

    return {name, publicName, gameboard, attack};
}

let P1 = Player('P1');
let P2 = Player('P2');

let tempVar = 'Treus';
P1.publicName = tempVar;
P2.publicName = 'CPU';


//Module for DOM manipulation and lotsa stuff
let Loop = (function () {
    let turn = true;
    let boardNotClickable = true;

    //DOM grabbin
    let P1Cells = document.getElementsByClassName('cellP1');
    let P2Cells = document.getElementsByClassName('cellP2');

    ///DOM events
    //Add events on click to each cell, and a unique class based on their "index" and player
    for(let i=0; i<100; i++) {
        P1Cells[i].addEventListener('click', clickedCell);
        P1Cells[i].classList.add('P1-'+i);
        P1Cells[i].addEventListener('dragover', e => e.preventDefault());
        P1Cells[i].addEventListener('dragenter', e => e.preventDefault());
        P1Cells[i].addEventListener('drop', (e) => {
            e.preventDefault();
            let shipIdent = e.dataTransfer.getData('text/plain');
            let cellIdent = e.target.classList[1].slice(3);
            let coords = getCoord(cellIdent);
            let cellX = coords[0];
            let cellY = coords[1];
            if(canIPutItHere(shipIdent, cellIdent, P1)) {
                P1.gameboard.placeShip(shipIdent, cellX, cellY);
                render('P1');
            }
        });

        P2Cells[i].addEventListener('click', clickedCell);
        P2Cells[i].classList.add('P2-'+i);
    }
    //Start button event
    startBtn.addEventListener('click', function() {
        P2Board.style.display = 'grid';
        dragBoats.style.display = 'none';
        boardNotClickable = false;
    })

    
    //Function to check availability of nearby spaces when placing a ship
    function canIPutItHere(shipIdent, cellIndex, player) {
        console.log(cellIndex);
        let length;
        if(shipIdent == 'C') {length = 5};
        if(shipIdent == 'B') {length = 4};
        if(shipIdent == 'D' || shipIdent == 'S') {length = 3};
        if(shipIdent == 'P') {length = 2};
        let tempIndex = +cellIndex;
        let generalState = true;
        //check that I'm not placing a ship over another one
        for(let i=0; i<length; i++) {
            if(player.gameboard.board[tempIndex] != '') {
                generalState = false;
                break;
            }
            tempIndex++;
        }
        //check if the ship is already in the board 
        for(let elem of player.gameboard.board) {
            if(elem[0] == shipIdent) {
                generalState = false;
                break;
            }
        }
        //check if the ship touches the border of the board
        let wallLimit = cellIndex[1] || cellIndex[0];
        if(+wallLimit + length > 10) {
            generalState = false;
        }
        //check if the ships are touching
        let startPosition = +cellIndex;
        let endPosition = startPosition+length;
        
        return generalState;
    }

    //Winner function
    function winner(player) {
        console.log('WINNER IS ' + player.publicName + '!!!');
        //Do winner stuff here like reseting the boards and shit
    }

    //Check for a winner every turn
    function checkWinner(player, enemy) {
        if(enemy.gameboard.areAllShipsSunk()) {
            winner(player)
        }
    }

    //Function to get coords from class number
    function getCoord(str) {
        let cellX;
        let cellY;
        if(str.length == 1) {
            cellX = str[0];
            cellY = 0;
        } else {
            cellX = str[1];
            cellY = str[0];
        }
        return [cellX, cellY];
    }

    ///Event function on cell click
    function clickedCell(e) {
        if(boardNotClickable) {return;};
        let identifier = e.target.classList[1];
        //Take the clicked cell class to know both the player board clicked and the cell index
        let playerIdent = identifier.slice(0, 2);
        let cellIdent = identifier.slice(3);

        let players = whichPlayer();
        //If the player clicks its own board, nothing happens
        if(players[0].name == playerIdent) {return;}

        let coords = getCoord(cellIdent);
        let cellX = coords[0];
        let cellY = coords[1];

        //If the clicked cell has been Hit or Missed before, do nothing
        let testIndex = +[cellY,cellX].join('');
        if(players[1].gameboard.board[testIndex] == 'h' || players[1].gameboard.board[testIndex] == 'm') {return;}
        players[0].attack(players[1], cellX, cellY);

        checkWinner(players[0], players[1]);
        turn = !turn;
    }

    //Function to identify current player and enemy
    function whichPlayer() {
        return (turn) 
            ? [P1, P2] 
            : [P2, P1];
    }

    //Function to block

    //Function to render the player board based on a identifier string
    function render(playerString) {
        if(playerString == 'P1') {
            for(let i=0; i<100; i++) {
                 P1Cells[i].innerHTML = P1.gameboard.board[i];
            }
        } else if(playerString == 'P2') {
            for(let i=0; i<100; i++) {
                    P2Cells[i].innerHTML = P2.gameboard.board[i];
            }
        } 
    }  

    return {render}
})();


Loop.render(P1.name);
Loop.render(P2.name);

//Use "transform: rotate(90deg);" to turn, and "transform: rotate(0deg);" to reset the boards


////Checkpoints
///Posicionar las naves de p1 a mano
///Idem las de p2, pero random
///No dejar q dos naves se toquen al posicionarlas
///No dejar q toquen el borde del board al posicionarlas
///Como se representa el contenido del board en el html (h, m, vacio, ship)
///Checkear q las naves no se repitan en el board al posicionarlas


///Remove temp win test of just patrol boat







