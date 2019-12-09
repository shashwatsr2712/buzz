const express=require('express');
const bodyParser=require('body-parser');
const app=express();
//const User=require("./models/user")

app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/",(req,res) => {
    res.render("index");
});


//Server listening (Port config)
const port=process.env.PORT || 3000;
const server=app.listen(port,() => {
    console.log('Server has been started!');
});

let io=require("socket.io")(server);

io.on("connection",(socket) => {
    let sID=socket.id;
    console.log("New User connected!");
    socket.username='Anonymous';
    let sName=socket.username;
    //broadcast the number of online users
    io.sockets.emit("displayCount",{count:io.engine.clientsCount});
    socket.on('changeUserName',(data) => {
        socket.username=data.username;
        sName=socket.username;
        socket.emit("changeUserName",{username:sName});
        //broadcast to all but the one who has joined
        socket.broadcast.emit('newConnection',{id:sID,username:sName});
    });
    socket.on("newMessage",(data) => {
        //broadcast to all (io.sockets <-> io)
        io.sockets.emit("newMessage",{message:data.message,username:sName,sender:sID});
    });
    socket.on("typing",(data)=>{
        if(data){
            socket.broadcast.emit("typing",{id:sID,username:sName});
        } else{ //no key pressed for 2 seconds
            socket.broadcast.emit("typing",false);
        }
    });
    socket.on("disconnect",function(){
        //broadcast to all but the one who has disconnected
        socket.broadcast.emit("disconnection",{id:sID,username:sName});
        //broadcast the number of online users
        io.sockets.emit("displayCount",{count:io.engine.clientsCount});
    });
});