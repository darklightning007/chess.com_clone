const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js")
const path = require("path")

const app = express()

const server = http.createServer(app)  // initialize http server with express
const io = socket(server);

const chess = new Chess();


// initializing some variables 
let players = {}; 
let curPlayer = 'w';

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname,"public")));

app.get("/", (req,res)=>{
    res.render("index", {title: "Custom Chess Game"});
})

io.on("connection", function(uniquesocket){
    console.log("connected");

    uniquesocket.on("disconnect", function(){
        console.log("disconnected");
    })

    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        }else if(uniquesocket.id === players.black){
            delete players.black;
        }
    })

    uniquesocket.on("move",(move)=> {
        try{
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return ;
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return ;

            const result = chess.move(move);
            if(result){
                curPlayer = chess.turn();
                io.emit("move",move);
                io.emit("boardstate", chess.fen()); // fen is the state of code 
            }else{
                console.log("Invalid Move");
                uniquesocket.emit("Invalid Move", move);
            }
        }
        catch(err){
            console.log(err);
            uniquesocket.emit("asdfasdf", move);
        }
    });  
});

server.listen(3000, function(){
    console.log("listening on port 3000")
})