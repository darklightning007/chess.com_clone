const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard")

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard= ()=>{
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row,rowindex)=>{
        row.forEach((square,colindex)=>{
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex + colindex) % 2 ==0 ? "light" : "dark"
            );
            
            squareElement.dataset.row = rowindex;   // assigning every sqr with its own row index
            squareElement.dataset.col = colindex;   // and col index for future use

            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white": "black"
                );

                pieceElement.innerText = getPieceUnicode(square);        // using the unicode of each elemt we are gonna create it 
                pieceElement.draggable = playerRole === square.color; // if person code is black then he should only be able to move his piece and not white

                pieceElement.addEventListener("dragstart", (e) =>{
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement
                        sourceSquare = {row: rowindex , col: colindex};
                        
                        // capture event "e" from the draggable element 
                        // this ensures that the draggable element flows smoothly 
                        // cross platform/browser
                        e.dataTransfer.setData("text/plain","")   
                    }
                });

                pieceElement.addEventListener("dragend", (e)=>{
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e)=>{
                e.preventDefault();     // this is to prevent emtpy squares being moved
            });

            squareElement.addEventListener("drop", (e)=>{
                e.preventDefault(); // chat-gpt karna 
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handlemove(sourceSquare,targetSource);
                }
            });

            boardElement.appendChild(squareElement);
        });
    })

    if(playerRole === "b"){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
}

const handlemove = (source,target)=>{
    const move= {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion: 'q'  // check how to promote to different pieces
    }

    if ((chess.turn() === 'w' && playerRole !== 'w') || (chess.turn() === 'b' && playerRole !== 'b')) {
        alert("Opponent's turn!");
        return;
    }
    
    socket.emit("move",move);
}

const getPieceUnicode = (piece)=>{
    const unicodePieces = {
        k: "♔",
        q: "♕",
        r: "♖",
        b: "♗",
        n: "♘",
        p: "♙",
        K: "♔",
        Q: "♕",
        R: "♖",
        B: "♗",
        N: "♘",
        P: "♙",
    }

    return unicodePieces[piece.type] || "";
}

socket.on("playerRole",(role)=>{
    playerRole = role,
    renderBoard();
});

socket.on("spectatorRole", ()=>{
    playerRole = null,
    renderBoard();
});

socket.on("boardState",(fen)=>{
    chess.load(fen),
    renderBoard();
});

socket.on("move",(move)=>{
    chess.move(move),
    renderBoard();
});



renderBoard();
