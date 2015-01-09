
var maxLengthOfChatLines = 50;
var hostName = "127.0.0.1";
var ismsPortNumber = 7000;
var ws = new WebSocket("ws://"+hostName+":"+ ismsPortNumber);
var userName = null;

ws.onopen = function() {
  alert("Using WebSocket.");
}

ws.onerrer = function(e) {
  alert("WebSocket Error: " + e);
}

ws.onclose = function(e) { 
  alert("WebSocket closed.");
}

ws.onmessage = function(m) {
    var message = m.data.toString();
    var firstOcurrenceOfOpenBracket = message.indexOf("[");
    var firstOcurrenceOfClosedBracket = message.indexOf("]");
    var fromUser = message.slice(firstOcurrenceOfOpenBracket+1,firstOcurrenceOfClosedBracket);
    var secondOcurrenceOfOpenBracket = message.indexOf("[",firstOcurrenceOfClosedBracket);
    var secondOcurrenceOfClosedBracket = message.indexOf("]",secondOcurrenceOfOpenBracket);
    var time = message.slice(secondOcurrenceOfOpenBracket+1,secondOcurrenceOfClosedBracket);
    var messageBody = message.slice(secondOcurrenceOfClosedBracket+1);
    addToChat(fromUser,messageBody,userName,time); 
}




function addToChat(username, messageBody, recipient, time) {
  var chatBox = document.getElementById("chat");
  var chatLines = chatBox.childNodes;
    if (chatLines.length >= maxLengthOfChatLines) { 
      chatBox.removeChild(ml[0]); 
    }
    var UserSaid = document.createTextNode(time.toString() + " " + username + " said to " + recipient + ": " + messageBody);
    var list = document.createElement("li");
    list.appendChild(UserSaid);
    chatBox.appendChild(list);
  }

  function sendMessage() {
    var message = document.getElementById("message").value;
    var recipient = document.getElementById("recipient").value;

    if (message.length > 0) { 
      if(validateMessageBody(message)) {
        if(validateRecipient(recipient)!=null) {
          var d = new Date();

          /*
          * format:
          * type: message
          * from: username
          * to: recepient
          * messageBody: message
          * sent: date
          */
          var object =  '{"type": "message", "from": "'+ userName +'", "to": "'+ recipient +'", "messageBody": "'+ message +'", "sent": "' + getTimeOfMessage(d) +'"}';
          ws.send(object);
          addToChat(userName,message,validateRecipient(recipient), getFormattedTimeOfMessage(d));
          document.getElementById("message").value = "";
          document.getElementById("recipient").value = "";
        }
      }
    }
  }

  
  function validateRecipient(recipients) {
    var regexForRecipient = /^[a-z]{2}[a-z0-9]{1,10}$/i;
    var nameRegex = /^[a-z ,.'-]+$/i;
    if(recipients.length > 0) {
      if(recipients == "*") {
        return "*";
      }
      else if(recipients.search(regexForRecipient) >= 0) {
        return recipients;
      }
      else if(recipients.search(nameRegex)>=0) {
        return recipients;
      }
    }
    alert("Not a right recipient");
    return null;
  }

  function validateUsername(someUsername) {
    var regexForUsername = /^[a-z]{2}[a-z0-9]{1,10}$/i;
    if(someUsername.search(regexForUsername) == -1) {
      alert("Type again. " + someUsername + " is Not a valid CS2003 class of 2014 username.");
      return false;
    }
    else {
      return true;
    }
  }

  function validateMessageBody(someMessageBody) {
    if(someMessageBody.length > 140) {
      alert("Type again. The message body is more than 140 characters.")
      return false;
    }
    else {
      return true;
    }
  }

  function getTimeOfMessage(d) {
    var year = d.getFullYear();
    var month = d.getMonth();
    if(month.toString().length==1) {
      month = "0" + month.toString();
    }
    var day = d.getDate();
    if(day.toString().length==1) {
      day = "0" + day.toString();
    }
    var hour = d.getHours();
    if(hour.toString().length==1) {
      hour = "0" + hour.toString();
    }
    var min = d.getMinutes();
    if(min.toString().length==1) {
      min = "0" + min.toString();
    }
    var seconds = d.getSeconds();
    if(seconds.toString().length==1) {
      seconds = "0" + seconds.toString();
    }
    return year.toString() + month.toString() + day.toString() + hour.toString() + min.toString() + seconds.toString();
  }

  function getFormattedTimeOfMessage(d) {
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var hour = d.getHours();
    var min = d.getMinutes();
    var seconds = d.getSeconds();
    return day.toString() + "/" + month.toString() + "/" + year.toString() + " at " + hour.toString() + ":" + min.toString() + ":" + seconds.toString();
  }


  function allowOnlyOneUserName(someUsername) {
      var allowedUsername = "abc1";
      if(someUsername==allowedUsername) {
        document.body.classList.remove("loginVisible");
        userName = someUsername;
        return true;
      }
      else {
        alert("Only the user named: " + allowedUsername + " can login from this port. Type again");
        return false;
      }
  }


  (function preventSubmission() {
    document.getElementById("username").addEventListener("submit",function(e){ e.preventDefault(); });
  })();

