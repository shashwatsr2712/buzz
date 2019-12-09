$(function(){
    //Connection
    let socket=io.connect();
    let timeout,timeout1,timeout2,timeout3,timeout4;

    //Variables declaration
    let username=$("#userName");
    let setUserName=$("#setName");
    let sendMessage=$("#sendMessage");
    let message=$("#messageToSend");
    let chatSpace=$("#chatSpace");
    let helloAlert=$("#helloUser");
    let detailAlert=$("#detailInfo");
    let userList=$("#onlineList");
    let sessionID;

    //Display count of online users
    socket.on("displayCount",(data)=>{
        //Banner on top displaying online users
        $('#countUsers').empty();
        // $('#floatingCountUsers').empty();
        if(data.count==1){
            $('#countUsers').append('<i class="onlineIndicate fas fa-circle"></i>&nbsp;&nbsp;Waiting for other users to join...');
            // $('#floatingCountUsers').append('<i class="onlineIndicate fas fa-circle"></i>&nbsp;Waiting for other users to join...');
        } else{
            $('#countUsers').append('<i class="onlineIndicate fas fa-circle"></i>&nbsp;&nbsp;<strong>'+(data.count-1)+'</strong>&nbsp;&nbsp;online');
            // $('#floatingCountUsers').append('<i class="onlineIndicate fas fa-circle"></i>&nbsp;<strong>'+(data.count-1)+'</strong>&nbsp;&nbsp;online');
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
        helloAlert.slideDown(500);
        clearTimeout(timeout1);
        timeout1=setTimeout(()=>{helloAlert.slideUp(500);},3000);
    });

    //Listening for any new connection (after name change) and broadcasting the info to others
    socket.on('newConnection',(data)=>{
        detailAlert.empty();
        detailAlert.append(data.username+" (ID:"+data.id+") joined!");
        detailAlert.slideDown(500);
        clearTimeout(timeout2);
        timeout2=setTimeout(()=>{detailAlert.slideUp(500);},3000);
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
        clearTimeout(timeout3);
        timeout3=setTimeout(()=>{detailAlert.slideUp(500);},3000);
    });

    //Emit an event when online-count banner is clicked
    $('#countUsers').click(function(e){
        if(userList.is(":visible")){
            //Emit 'false' event to hide the list 
            socket.emit("displayActive",false);
        } else{
            socket.emit("displayActive",true);
        }
    });
    // $('#floatingCountUsers').click(function(e){
    //     if(userList.is(":visible")){
    //         //Emit 'false' event to hide the list 
    //         socket.emit("displayActive",false);
    //     } else{
    //         socket.emit("displayActive",true);
    //     }
    // });

    //Listening for displayActive event
    socket.on('displayActive',(data)=>{
        if(!data){
            userList.slideUp(200);
        } else{
            userList.empty();
            let temp='<ul id="listMembers" class="list-group">';
            (data.usernames).forEach(function(name){
                temp+='<li class="itemMember list-group-item list-group-item-warning">'+name+'</li>';
            });
            temp+='</ul>';
            userList.append(temp);
            userList.slideDown(200);
        }
    });

    //Show floating countDiv on scrolling down 
    // $(document).scroll(function(){
    //     let scr=$(this).scrollTop();
    //     if(scr>65){
    //         $('#floatingCountUsers').slideDown(200);
    //         clearTimeout(timeout4);
    //         if(!userList.is(":visible")){
    //             timeout4=setTimeout(()=>{$('#floatingCountUsers').slideUp(200);},3000);
    //         }
    //     } else{
    //         $('#floatingCountUsers').slideUp(200);
    //     }
    // });

    //Hide users' list on clicking anywhere other than within its boundaries
    $(document).click(function(){
        userList.slideUp(200);
    });
    userList.click(function(e) {
        e.stopPropagation(); 
        return false;
    });


    $(document).ready(function(){
        blinkColor();
    });
    //Function to blink icon light for count banner
    function blinkColor(){
        //color:#CCE5FF<->rgb(204, 229, 255); color:#82CA35<->rgb(130, 202, 53);
        if($("i.onlineIndicate").css('color')=='rgb(204, 229, 255)'){
            $("i.onlineIndicate").css('color','#82CA35');
        } else{
            $("i.onlineIndicate").css('color','#CCE5FF');
        }
        setTimeout(function(){blinkColor();},500);
    }
});