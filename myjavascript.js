//Global variable
var g = {};

function removeEvent(obj, type, fnName){
    if (obj.removeEventListener) {
        obj.removeEventListener(type, fnName);
    } 
    else if (obj.detachEvent) {
        obj.detachEvent(type, fnName);
    }
    else{
        alert("Browser not compatible with application");   
    }
}

function addEvent(obj, type, fnName){

    if(obj.addEventListener){
        obj.addEventListener(type, fnName, false);
    }	
    else if(obj.attachEvent){
        obj.attachEvent("on" + type, fnName);
    }
    else{
        alert("Browser not compatible with application");
    }	
}

function unhighlightElement(e){
    var evt = e || window.Event;
    var target = evt.target || evt.srcElement;

    target.style.backgroundColor = null;
    target.style.textDecoration = "none";
}

//Used to hightlight elements in the navigation bar
function highlightElement(e){
    var evt = e || window.Event;
    var target = evt.target || evt.srcElement;

    target.style.backgroundColor = "#000000";
    target.style.textDecoration = "underline overline";
}


function startChat(e){
    var evt = e || window.Event;
    var target = evt.target || evt.srcElement;
    
    //Gets the users name which will be used when sending messages
    g.chatName = document.getElementById('chatName').value.trim();

    if(g.chatName != ""){
        g.chatDiv = document.getElementById('chatDiv');
        g.chatBox = document.getElementById('chatBox');
        g.chatBoxMsgs = document.getElementById('chatBoxMsgs');
        g.nameForm = document.getElementById('nameForm');

        g.chatDiv.style.height = "450px";
        g.chatBox.style.visibility = "visible";
        g.chatBoxMsgs.style.width = "595px";
        g.chatBoxMsgs.style.height = "300px";
        g.nameForm.style.visibility = "hidden";

        createRequestObject();
        getWelcomeMessage();
        getMessages();
        
        //Sets an interval which will update the chatbox every 5 seconds
        g.updateInterval = setInterval(getMessages, 5000);  
    }
    else{
        g.errorMsg.innerHTML = "Please insert a chat name";
    }
}

//Gets the first two welcome messages
function getWelcomeMessage(){
    g.msgNo = 0;
    serverRequest(getParams("none"),false);
}

//Gets the previous messages, used to update the chatbox
function getMessages(){
   serverRequest(getParams("none"), true);   
}

//Function used to send messages 
function sendMessage(){
    //Gets the message that will be sent to the server and put it into variable
    var msgToSend = g.messageBox.value.trim()
    
    //Checks whethers it is null, does not want to send empty string
    if(msgToSend != ""){
        //Stops the script from updating every 5 seconds, makes it synchronous,
        //then sends messages and finally makes it asynchronous again.
        clearInterval(g.updateInterval);
        serverRequest(getParams(msgToSend),false);
        g.updateInterval = setInterval(getMessages, 5000);  
        g.messageBox.value = ""; //clear message box
    }
}

//Gets the parameters that will be sent to the php script
//msgNo, username, msg
function getParams(msg)
{
    return "msgNo=" + g.msgNo + "&username=" + g.chatName + "&msg=" + msg;   
}

//Creates an XML http request
function createRequestObject(){
    if (window.XMLHttpRequest) 
    {
        g.request = new XMLHttpRequest();
    } 
    else 
    {
        g.request = new ActiveXObject();//"Microsoft.XMLHTTP");
    }
}

//Creates a server request to the php script
function serverRequest(params, async){
    g.request.open("POST", "chatpgm.php", async);
    g.request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    g.request.onreadystatechange = processServerData;
    g.request.send(params);
}

function processServerData(){
    var messages;
    var xmlDoc;
    var fieldText;
    var parser;
    
    if(g.request.readyState == 4 && g.request.status == 200)
    {   
        //XML as a string
        fieldText = g.request.responseText;
        
        //Parses string to an XML
        if(window.DOMParser){
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(fieldText, "text/xml");
        }
        else{
            xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(fieldText);
        }
    
        messages = xmlDoc.getElementsByTagName("message");
        
        //Disply each line having the following format = (msgNo) username: msg
        for(var cntr = 0; cntr < messages.length; cntr++)
        { 
            while(messages[cntr].childNodes[1].textContent == undefined || messages[cntr].childNodes[2].textContent == undefined){
                i++;
            }
            
            g.chatBoxMsgs.innerHTML += "<p> (<b>" + messages[cntr].childNodes[0].textContent + ") " +  messages[cntr].childNodes[1].textContent + ": </b>" + messages[cntr].childNodes[2].textContent + "</p>";
        }
        
        //Gets the appropriate message number
        if (g.msgNo == 0){
            //retrive the last 50 messages only, can be changed if you find it is not enough
            g.msgNo = xmlDoc.getElementsByTagName("chat")[0].getAttribute("id") - 50;
        }
        else{
            g.msgNo = xmlDoc.getElementsByTagName("chat")[0].getAttribute("id");
        }
        
        //Scrolls all the way to the bottom
        g.chatBoxMsgs.scrollTop = g.chatBoxMsgs.scrollHeight;  
    }
}

//This function handles the enter key, it is used to either start the chat or send a message
function handleEnterKey(e){
    var evt = e || window.Event;
    var target = evt.target || evt.srcElement;
    var key = evt.which || evt.keyCode;
    
    if(key == 13){
        if(target.id == "chatName"){
            startChat();   
        }
        if(target.id == "messageBox"){
            sendMessage();      
        }
    }
}

//Opens up all the project in a new window, it opens the project in a different tab
//but on the same window. Prefer this over having a window pop up over the website
function openProject(e){
    var evt = e || window.Event;
    var target = evt.target || evt.srcElement;
    var win;
    
    if(target.id == "restoreview"){
        win = window.open("http://waldo2.dawsoncollege.qc.ca/1337762/", "_blank");    
    }
    else{
        win = window.open("./projects/" + target.id + "/index.html", "_blank")    
    }
    
    //puts the focus on the window that was oppened
    win.focus();
}

function init(){

    g.navElements = document.getElementsByClassName('navElement');
    g.chatButton = document.getElementById('chatButton');
    g.errorMsg = document.getElementById('errorMsg');
    g.sections = document.getElementsByTagName('section');
    g.sendButton = document.getElementById('sendButton');
    g.chatName = document.getElementById('chatName');
    g.messageBox = document.getElementById('messageBox');
    g.projectImages = document.getElementsByClassName("projectImages");
    
    //Setting all the events
    for (var cntr = 0; cntr < g.navElements.length; cntr++) {
        addEvent(g.navElements[cntr],"mouseover", highlightElement);
        addEvent(g.navElements[cntr], "mouseout", unhighlightElement);
    }
    for(var cntr = 0; cntr < g.projectImages.length; cntr++){
        addEvent(g.projectImages[cntr], "click", openProject);   
    }
    addEvent(g.chatName, "keypress", handleEnterKey);
    addEvent(g.chatButton, "click", startChat);
    addEvent(g.messageBox, "keypress", handleEnterKey);
    addEvent(g.sendButton, "click", sendMessage);
}

window.onload = init;