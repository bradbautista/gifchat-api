const express = require('express')
const RoomsService = require('./rooms-service')
const path = require('path')
const roomsRouter = express.Router()
const jsonParser = express.json()

//  /rooms/ accepts only post requests; the server responds to those requests 
//  by creating a room at a randomly generated URL and sending that URL 
//  back to the client

//  At /rooms/:room, we service: 
//  - Get requests that retrieve the list of messages in the conversation
//  - Patch requests that add messages to the conversation column array
//  - Put requests that update the last_connection column with a new Date()

//  For all requests, the server checks the room name against the
//  database and refuses the request if the room does not exist



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

    // Reject all requests when the room does not exist
    .all((req, res, next) => {

        // 0 = '/'
        const room = req.url.slice(1)


        RoomsService.getAllRooms(req.app.get('db'))
            .then(rooms => {

                // Rooms returns an array of objects, we want an array of strings
                const roomList = rooms.map(room => {
                    return room.conversation_location
                })

                if (!roomList.includes(room)) {
                    return res.status(404).json({
                    error: { message: `No such room.` }
                    })
                }
                next()

            })
            .catch(next)
    })

    // For a new room, messages will be an empty array; this is fine
    .get((req, res, next) => {

        const room = req.url.slice(1)

        // To prevent bugs which could allow users to see the content of 
        // conversations when they try to join full rooms, reject the request
        // if socket.connected logs false on the client side
        if (req.headers.isconnected === 'true') {
            RoomsService.getAllMessages(req.app.get('db'), room)
            .then(messages => {
                res.json(messages)
            })
            .catch(next)
        } else if (req.headers.isconnected === 'false') {
            return res.status(404).json({
                error: { message: `You have disconnected from the socket, or the room is full.` }
            })
        }

      })

    // Adding to conversation. We're doing this here instead of in app.js because 
    // firing addToConversation in the on.('chat message') event there does not 
    // update the database for reasons that are not obvious to me even after 
    // debugging the server and investigating postgres logs. We don't need to
    // check socket.connected here because the user can't emit messages if they're
    // not connected to the socket.
    .patch(jsonParser, (req, res, next) => { 
        
        const room = req.url.slice(1)

        const { msg } = req.body

        RoomsService.addToConversation(
            req.app.get('db'),
            msg,
            room
        )
        .then(() => res.status(201).json({ "message" : "Conversation updated." }) )
        .catch(next)
    })

    .put(jsonParser, (req, res, next) => {

        const room = req.url.slice(1)

        const { date } = req.body

        RoomsService.reportConnection(
            req.app.get('db'),
            date,
            room
        )
        .then(() => res.status(201).json({ "message" : "Connection recorded."}) )
        .catch(next)
    })

module.exports = roomsRouter