$(function(){
    //Connection
    let socket=io.connect();

    //Variables declaration
    let username=$("#userName");
    let setUserName=$("#setName");
    let sendMessage=$("#sendMessage");
    let message=$("#messageToSend");
    let chatSpace=$("#chatSpace");
    let helloAlert=$("#helloUser");
    let sessionID;

    //Put cursor in setName when 'Start Chat' is clicked
    $("#startBtn").click(function(e){
        e.preventDefault();
	    username.focus();
    });

    //Emit an event for setting name
    setUserName.click(function(e){
        socket.emit("changeUserName",{username:username.val()});
    	e.preventDefault();
	    message.focus();
    });

    //SessionID of Client
    socket.on('connect',()=>{
        sessionID=socket.id;
    })

    //Listening for change of Username
    socket.on("changeUserName",(data) => {
        helloAlert.empty();
        helloAlert.append("Welcome "+data.username+"!");
        helloAlert.fadeIn();
        helloAlert.fadeOut(2000);
    });

    //Emit event for sending message
    sendMessage.click(function(){
        socket.emit("newMessage",{message:message.val()});
    });

    //Listening for new messages
    socket.on("newMessage",(data) => {
        message.val('');
        //Check if current client is sender or receiver
        let marginSet="margin-right:auto;border-top-right-radius:10px;border-bottom-right-radius:10px;";
        if(sessionID==data.sender){
            marginSet="margin-left:auto;border-top-left-radius:10px;border-bottom-left-radius:10px;";
        }
        //Choosing a random bg color for chatbox
        let back = ["#D3FEFC","#CCFCD1","#F0F5BD","#FAD48C","#D2FCFC","#D2ECFC","#EEDDFE","#FDE4FD","#FCE0DA"];
        let rand = back[Math.floor(Math.random() * back.length)];
        let styling="style='"+marginSet+"background-color:"+rand+";max-width:80vw;padding:2vh 2vw 2vh 2vw;'";
        chatSpace.append("<div class='message' "+styling+"><strong>"+data.username+"</strong><br/>"+data.message+"</div><br/>");
        //Scroll Chat Space to top when new message comes
        chatSpace.animate({scrollTop:$(document).height()},'slow');
    });

});