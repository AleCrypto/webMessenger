________
Overview
________

Peer-to-peer Web Messenger. Every peer must have this application as a web-based User Interface, where the User Interface runs one Message Server instance. This Message Server instance can communicate with a Message Server instance of any other peers and allow peer-to-peer transfer of text-based messages.

USERNAME: abc1


_______________________________
Design and Structure of the Program
_______________________________

	Communication Model (communicationModel.png)
	-> The browser-based User Interface with the help of the WebSocket communicates the Message Server in full-duplex communication channel. Such full-duplex communication allowed the update of information to happen when sending and receiving messages to another user/users.
	-> The communication between this Message Server and the Message Server of the other  peer was required to be built on TCP. 
