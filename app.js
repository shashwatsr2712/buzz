const express=require('express');
const bodyParser=require('body-parser');
const app=express();
//const User=require("./models/user")

//Count of Users
let Users=0;

app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/",(req,res) => {
    res.render("index",{Users:Users});
});


//Server listening (Port config)
const port=process.env.PORT || 3000;
const server=app.listen(port,() => {
    console.log('Server has been started!');
});

let io=require("socket.io")(server);

io.on("connection",(socket) => {
    Users+=1;
    let sID=socket.id;
    console.log("New User connected!");
    socket.username='Anonymous';
    let sName=socket.username;
    //Username in socket
    socket.on('changeUserName',(data) => {
        socket.username=data.username;
        sName=socket.username;
        socket.emit("changeUserName",{username:data.username});
    });
    socket.on("newMessage",(data) => {
        //broadcast to all (io.sockets <-> io)
        io.sockets.emit("newMessage",{message:data.message,username:socket.username,sender:sID});
    });
    socket.on("disconnect",function(){
        Users-=1;
        //broadcast to all but the one who has disconnected
        socket.broadcast.emit("disconnection",{id:sID,username:sName});
    });
});