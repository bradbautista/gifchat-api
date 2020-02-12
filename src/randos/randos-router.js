const express = require('express')
const RoomsService = require('../rooms/rooms-service')
const path = require('path')
const randosRouter = express.Router()
const jsonParser = express.json()

// Scope on these is intentional; the way the server responds
// to post requests depends on value of lonelyRandos, and each request 
// toggles the value; randoRoom gets overwritten as we match randos.
// Defaults to true because first toggle sets the inital state we want.
let lonelyRandos = true;
let randoRoom = '';

randosRouter

    .route('/')
    .post((req, res, next) => {

        lonelyRandos = !lonelyRandos;

        // If there is no rando waiting for a match, create a room
        // and put the rando in it. If there is a lonely
        // rando, put the inquirer in the room with the
        // lonely rando. Preferring if to ternary here for
        // readability.
        if (lonelyRandos) {
            res
                .status(303)
                .location(path.posix.join(req.originalUrl, `/${randoRoom}`))
                .json(randoRoom)
        
        } else if (!lonelyRandos) {
            
            RoomsService.insertConversation(
                req.app.get('db'),
                RoomsService.getRoomName(),
            )
            .then(roomName => {
                randoRoom = roomName,
                res
                    .status(303)
                    .location(path.posix.join(req.originalUrl, `/${roomName}`))
                    .json(roomName)
            })
            .catch(next)

        }

    })

// Once they're in the room, it behaves the same as all other rooms

randosRouter   

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
            return RoomsService.getAllMessages(req.app.get('db'), room)
            .then(messages => {
                res.json(messages)
            })
            .catch(next)
        } else if (req.headers.isconnected === 'false') {
            return res.status(404).json({
                error: { message: `You have disconnected from the socket, or the room is full.` }
            })
        }

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
        .then(() => res.status(201).end())
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
        .then(() => res.status(201).end())
        .catch(next)
    })

module.exports = randosRouter