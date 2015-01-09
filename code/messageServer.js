var ismsPortNumber = 7000;
var http = require("http");
var fs = require("fs");
var ws = require("ws"); 
var net = require("net");
var readline = require("readline");
var listOfConnections = [];
var msmsPortNumber = 7654;
var hostClients = [];
var students = [];
var httpServer = http.createServer(serveApp).listen(ismsPortNumber);
var wsServer = new ws.Server({server: httpServer});
var frontEnd = null;

function serveApp(request, response) {
  var url = request.url;
  generateContent(response, url);  
}

function identifyContentType(path) {
  if(path == "/" || path == "/index.html") {
    return "text/html";
  }
  if(path == "/styles.css") {
    return "text/css";
  }
  if(path == "/favicon.ico") {
    return "image/x-icon";
  }
  if(path == "/background.png") {
    return "image/jpeg";
  }
  if(path == "/inputValidator.js") {
    return "application/javascript"
  }
}

function generateContent(response, path) {
  if(path == "/") {
    path = "/index.html";
  }
  fs.readFile(__dirname + path, function(error, data) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();

    } else {
      response.writeHead(200, {"Content-Type": ""+identifyContentType(path)+""});
      response.end(data);
    }
  });
}


function Student(username, lastName, firstName, uimsport, msmsport) {
  this.username = username;
  this.lastName = lastName;
  this.firstName = firstName;
  this.uimsport = uimsport;
  this.msmsport = msmsport;
}

(function readWeb2UsersFile() {
  fs.readFile(__dirname + "/web2-users.txt", function(error, data) {
   if (error) {
    return console.log(error);
  }
  var lines = data.toString().split("\n");
  for(var i =0; i < lines.length; i++) {
    var sentence = lines[i];
    var line = sentence.split(" ");
    var userName = line[0];
    var firstname = line[2];
    var lastname = line[1];
    var uiMSport = line[3];
    var msMSport = line[4];
    if(userName.length > 0) {
     var student = new Student(userName,lastname,firstname,uiMSport,msMSport);
     students.push(student);
   }
 }
 for(var i = 0; i < students.length; i++) {
        //console.log(students[i]);
      }
    });
})();


function printHostClients() {
    for(var i = 0; i < hostClients.length; i++) {
      if(hostClients[i].username!="unknown") {
        //console.log("Online: " + hostClients[i].username);
      }
    }
}

function findCorrespondingMsPortToUserName(someUsername) {
  var port = -1;
  for(var i = 0; i < students.length; i++) {
    if(students[i].username.toString()==someUsername.toString()) {
      port = students[i].msmsport;
      return port;
    }
  }
  return port;
}

function findCorrespondingUserNameToMsPort(somePort) {
  var unknownUser = "unknown";
  for(var i = 0; i < students.length; i++) {
    if(students[i].msmsport.toString()==somePort.toString()) {
      unknownUser = students[i].username;
      return unknownUser;
    }
  }
  return unknownUser;
}

function findCorrespondingUserNameToLastName(someLastName) {
  var potentialUsername = someLastName;
   for(var i = 0; i < students.length; i++) {
    var fistAndLast = students[i].firstName.toString() + " " +  students[i].lastName.toString();
    var lastAndFirst = students[i].lastName.toString() + " " + students[i].firstName.toString();
    if(students[i].lastName.toString()==someLastName.toString()) {
      potentialUsername = students[i].username;
      return potentialUsername;
    }
    else if(fistAndLast==someLastName.toString()) {
      potentialUsername = students[i].username;
      return potentialUsername;
    }
    else if(lastAndFirst==someLastName.toString()) {
      potentialUsername = students[i].username;
      return potentialUsername;
    }
  }
  return potentialUsername;
}

function passToConnection() {
  var remote = this.remoteAddress + ": " + this.remotePort;
  console.log("-- Connected to this sockets Remote Address and Port: " + remote);  
}

//connect
function connectOnce(username) {
  var port = findCorrespondingMsPortToUserName(username);
  if(port!=- 1) {
    var host = {
      client : net.connect(port, "127.0.0.1", passToConnection),
      username: username
    } 
    hostClients.push(host);
    setUpClient(host);
    printHostClients();
  }
  else {
    console.log("The username's port is underfined in web2-users.txt file");
  }
}

function sendDirectMessage(message, toUser) {
  for(var i=0; i < hostClients.length; i++) {
      if(hostClients[i].username==toUser) {
        hostClients[i].client.write(message);
        return;
      }
  }
  connectOnce(toUser);
  for(var i=0; i < hostClients.length; i++) {
      if(hostClients[i].username==toUser) {
        hostClients[i].client.write(message);
        break;
      }
    }
}

function sendToAllUsers(message) {
    for(var i = 0; i < students.length; i++) {
      sendDirectMessage(message, students[i].username);
    }
}

wsServer.on("connection", function(ws) {
  //global variable, that's how the messages get passed to you!
  frontEnd = ws;
  listOfConnections.push(ws);
  console.log("-- connection: " + listOfConnections.length);
  frontEnd.on("message", function(data) {
      var message = data.toString();
      var obj = JSON.parse(message);
      var fromUser = obj.from.toString();
      var toUser = obj.to.toString();
      var messageBody = obj.messageBody.toString();
      var time = obj.sent.toString();
      var format = "["+ fromUser +"]"+"["+time+"]"+ messageBody;

      if(toUser=="*") {
        sendToAllUsers(format);
      }
      else {  
        sendDirectMessage(format,toUser);
      }

    for(var i = 0; i < listOfConnections.length; ++i) {
      if (listOfConnections[i] != this) { 
        listOfConnections[i].send(message); 
      }
    }
  });

  frontEnd.on("close", function(code, message) {
    var i = listOfConnections.indexOf(this);
    listOfConnections[i] = null;
    for(var n = i; n < listOfConnections.length; ++n) {
      // close hole in array
      listOfConnections[n] = listOfConnections[n + 1];
    }
    --listOfConnections.length;
    console.log("-- disconnected: " + (i + 1));
  });
});
console.log("--server running on:" + ismsPortNumber);


function setUpClient(host) {
  host.client.on("data", function(line) {
    var from = "-- " + host.client.remoteAddress + ":" + host.client.remotePort; 
    console.log(from + " said to you: " + line.toString());
    frontEnd.send(line.toString());  
  });
  host.client.on("end", function() { 
    console.log("-- Disconnected.");
    host.client.destroy();
  }); 
  host.client.on("error", function(e) {
    console.log("Error: This client is offline!");
    var index = hostClients.indexOf(host);
    hostClients[index] = null;
    for(var n = index; n < hostClients.length; ++n) {
      hostClients[n]=hostClients[n+1];
    }
    --hostClients.length;
    printHostClients();
  });   
}


var server = net.createServer(
  function(socket) {
    var host = {
      client : socket,
      username: "unknown"
    }
    hostClients.push(host);
    setUpClient(host);
    printHostClients();
    var otherRemote = host.client.remoteAddress + ":" + host.client.remotePort;
    var remote = socket.remoteAddress + ":" + socket.remotePort;
  });
server.listen(msmsPortNumber);

console.log("-- MSServer running at: " +
  server.address().address + ":" +
  server.address().port);




