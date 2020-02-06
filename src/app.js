require('dotenv').config()
const knex = require('knex')
const { PORT, DATABASE_URL } = require('./config')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const notesRouter = require('./notes/notes-router')
const foldersRouter = require('./folders/folders-router')
const roomsRouter = require('./rooms/rooms-router')



const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
})

app.set('db', db)

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common'))
app.use(cors())
app.use(helmet())

// We will want /rooms, /randos
app.use('/notes', notesRouter)
app.use('/folders', foldersRouter)
app.use('/rooms', roomsRouter)

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: 'Server error' }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

io.on('connection', (socket) => {
  console.log('A user has connected to the socket')
  // console.log(socket.handshake.headers.referer)
  // console.log(io)
  // console.log(server)

  socket.emit('chat message', 'Hello there')

  // We're using regex to get the room name; this will pull everything after the last slash in the url; .exec returns an array, but the first item in it is what we want
  const roomRegEx = /([^/]+$)/
  const room = roomRegEx.exec(socket.handshake.headers.referer)[0] || ''
  console.log(socket.handshake.headers)

  socket.join(room, () => {
    let rooms = Object.keys(socket.rooms);
    console.log(rooms);
  })
  // console.log('user joined room ' + room + ' at ' + Date());


  socket.on('disconnect', function() {
    socket.leave(room)
    console.log('user disconnected');
  });
  
  socket.on('chat message', (msg) => {
    console.log(msg)
    // io.to(room).emit('chat message', msg)
    // console.log(msg)
  })

})

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

// app.listen(17042, () => {
//   console.log(`Server listening at http://localhost:17042`)
// })

module.exports = app
