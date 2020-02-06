const express = require('express')
const server = require('http').Server(express)
const io = require('socket.io')(server)
const RoomsService = require('./rooms-service')
const path = require('path')
const roomsRouter = express.Router()
const jsonParser = express.json()

// So: /rooms/ will accept only post requests; the server will respond to these requests by creating a room/socket at a randomly generated URL and send that URL back to the client


// At /rooms/:roomId, we will be servicing get requests that will retrieve the list of messages in the conversation from the server; intially this will be an empty array, which is fine. Idk about the need to send post requests vs emittences ... we'll have to see!

// Also, the server needs to check to see how many people are in the room when a connection attempt is made to /rooms/:roomId; if there are two people in there, refuse the connection

roomsRouter

    // On an empty post request (i.e., one coming from the "Get a room" button), create a new room with a randomly generated name in the database and have the database return that name, then send back the new room location in the header and send json of the room name to be displayed to the user.

    .route('/')
    .post((req, res, next) => {

        RoomsService.insertConversation(
            req.app.get('db'),
            RoomsService.getRoomName(),
        )
        .then(roomName => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${roomName}`))
                .json(roomName)
        })
        .catch(next)
    })

    // On a 

// roomsRouter
//     .route('/:room')

module.exports = roomsRouter