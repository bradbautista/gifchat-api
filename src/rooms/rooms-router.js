const express = require('express')
const server = require('http').Server(express)
const io = require('socket.io')(server)
const RoomsService = require('./rooms-service')
const path = require('path')
const roomsRouter = express.Router()
const jsonParser = express.json()

// /rooms/ accepts only post requests; the server responds to those requests by creating a room at a randomly generated URL and sending that URL back to the client


// At /rooms/:room, we service: 
//   - Get requests that retrieve the list of messages in the conversation
//   - Patch requests that add messages to the conversation column array
//   - Put requests that update the last_connection column with a new Date()

// TO DO:

// For all requests, the server needs to check the room name against the
// database and refuse the connection if the room does not exist

// The server needs to check to see how many people are in the room when a connection attempt is made to /rooms/:room; if there are two people in there, refuse the connection

// Figure out how and where to cull convos

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

roomsRouter   

    .route('/:room')

    // For a new room, messages will be an empty array; this is fine
    .get((req, res, next) => {

        // 0 = '/'
        const room = req.url.slice(1)

        RoomsService.getAllMessages(req.app.get('db'), room)
            .then(messages => {
                res.json(messages)
            })
            .catch(next)
      })

    // Adding to conversation. We're doing this here instead of in app.js because firing addToConversation in the on.('chat message') event there does not update the database for reasons that are not obvious to me even after debugging the server and investigating postgres logs
    .patch(jsonParser, (req, res, next) => { 
        
        const room = req.url.slice(1)

        const { msg } = req.body

        RoomsService.addToConversation(
            req.app.get('db'),
            msg,
            room
        )
        .then(() => { res.status(201) })
        .catch(next)
    })

    .put(jsonParser, (req, res, next) => {

        const room = req.url.slice(1)

        const { date } = req.body

        console.log(date)
        console.log(room)

        console.log(RoomsService.reportConnection(
            req.app.get('db'),
            date,
            room
        ).toString())

        RoomsService.reportConnection(
            req.app.get('db'),
            date,
            room
        )
        .then(() => { res.status(201) })
        .catch(next)
    })

    

module.exports = roomsRouter