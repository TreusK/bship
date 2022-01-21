'use strict';

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
        return (!s1 && !s2 && !s3 && !s4 && !s5);
    }

    return {board, shipsObj, placeShip, receiveAttack, areAllShipsSunk};
}

let p1 = Gameboard();
let p2 = Gameboard();


