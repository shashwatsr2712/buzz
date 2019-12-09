$(function(){
    //Connection
    let socket=io.connect();
    let timeout;

    //Variables declaration
    let username=$("#userName");
    let setUserName=$("#setName");
    let sendMessage=$("#sendMessage");
    let message=$("#messageToSend");
    let chatSpace=$("#chatSpace");
    let helloAlert=$("#helloUser");
    let detailAlert=$("#detailInfo");
    let sessionID;

    //Display count of online users
    socket.on("displayCount",(data)=>{
        //Banner on top displaying online users
        $('#countUsers').empty();
        if(data.count==1){
            $('#countUsers').append('Waiting for other users to join...');
        } else{
            $('#countUsers').append('<strong>'+(data.count-1)+'</strong>&nbsp;&nbsp;online');
        }
    })

    //Put cursor in setName when 'Start Chat' is clicked
    $("#startBtn").click(function(e){
        e.preventDefault();
        username.focus();
    });

    //Configuring 'Enter' key for button click of changing username
    username.keyup(function(event){
        if(event.keyCode===13){
            setUserName.click();
        }
    });

    //Helper timeout function ('false' typing event)
    function timeoutFunction(){
        socket.emit('typing',false);
    }
    //Emitting an event when a user types
    message.keyup(function(){
        socket.emit('typing',true);
        clearTimeout(timeout);
        //If no key is pressed for 2 seconds, a 'false' typing event should be emitted to remove the "...is typing..." message
        timeout=setTimeout(timeoutFunction,2000);
    });

    //Listening for message-typing event
    socket.on('typing',function(data){
        if(data){
            detailAlert.empty();
            detailAlert.append(data.username+" (ID:"+data.id+") is typing...");
            detailAlert.slideDown();
        } else{
            detailAlert.empty();
            detailAlert.slideUp();
        }
    });

    //Emit an event (and scroll to bottom) for setting name
    setUserName.click(function(e){
        socket.emit("changeUserName",{username:username.val()});
        e.preventDefault();
        $("html,body").animate({scrollTop:$(document).height()},'slow');
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
        helloAlert.slideDown(1000);
        helloAlert.slideUp(1000);
    });

    //Listening for any new connection (after name change) and broadcasting the info to others
    socket.on('newConnection',(data)=>{
        detailAlert.empty();
        detailAlert.append(data.username+" (ID:"+data.id+") joined!");
        detailAlert.slideDown(500);
        setTimeout(()=>{detailAlert.slideUp(500);},3000);
    });

    //Emit event for sending message
    sendMessage.click(function(){
        socket.emit("newMessage",{message:message.val()});
    });

    //Listening for new messages
    socket.on("newMessage",(data) => {
        message.val('');
        let marginSet="margin-right:auto;border-top-right-radius:10px;border-bottom-right-radius:10px;";
        //Check if current client is sender or receiver
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

    //Listening for any disconnected clients
    socket.on("disconnection",(data)=>{
        detailAlert.empty();
        detailAlert.append(data.username+" (ID:"+data.id+") disconnected!");
        detailAlert.slideDown(500);
        setTimeout(()=>{detailAlert.slideUp(500);},3000);
    });

});