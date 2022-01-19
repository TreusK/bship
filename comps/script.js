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

    //Function to know which ship to "place" in the arr
    function placeShip(identifier, x, y) {
        let ship = whichShip(identifier);
        placeInCoord(ship, identifier, x, y); 
    }

    return {board, shipsObj, placeShip};
}

let p1 = Gameboard();
console.log([...p1.board]);

p1.placeShip('B', 0, 3)
p1.placeShip('D', 0, 0)

console.log([...p1.board]);