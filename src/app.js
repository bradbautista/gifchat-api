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
const roomsRouter = require('./rooms/rooms-router')
const RoomsService = require('./rooms/rooms-service')
const randosRouter = require('./randos/randos-router')
const cron = require("node-cron");

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
})

// Cron job to cull old chats and unused rooms.
// Scheduled for midnight.

// * * * * * *
// | | | | | |
// | | | | | day of week
// | | | | month
// | | | day of month
// | | hour
// | minute
// second ( optional )

cron.schedule("0 0 0 * * *", function() {

  // The knex promises need to be returned, so let's
  // add some utility by logging the work our functions
  // have done for admin QoL.

  RoomsService.deleteUnusedRooms(db).then(x => console.log(`Deleted ${x} unused rooms.`))
  RoomsService.deleteOldConversations(db).then(x => console.log(`Deleted ${x.rowCount} expired rooms.`))
  console.log('Cron job ran')

});


app.set('db', db)

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common'))
app.use(cors())
app.use(helmet())

// We will want /rooms, /randos, possibly a * or .get all for all other routes? See S/O tabs -- also mb app.error!
app.use('/rooms', roomsRouter)
app.use('/randos', randosRouter)

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
  // console.log(socket.handshake)
  
  // We're using regex to get the room name; this will pull everything after the last slash in the url; .exec returns an array, but the first item in it is what we want
  const roomRegEx = /([^/]+$)/
  const room = roomRegEx.exec(socket.handshake.headers.referer)[0] || ''
  // console.log(socket.handshake.headers)

  // This returns the no. of users in ${room}, but it is an array length;
  // ergo, 1 is 2. So, check to see how many clients are connected; if it's
  // two, disconnect. This functions more like a bouncer than a locked door,
  // but I don't know of a way to lock the door and it works.
  io.sockets.adapter.clients([room], function(err, clients){
    (clients.length > 1)
    ? socket.disconnect(true)
    : socket.join(room)
  })

  socket.on('join', function() {
    
    console.log('Something')
  })
  

  console.log('user joined room ' + room + ' at ' + Date());

  socket.on('disconnect', function() {
    socket.leave(room)
    console.log('user disconnected from room ' + room + ' at ' + Date());
  });
  
  socket.on('chat message', function(msg){
    io.to(room).emit('chat message', msg)
    // RoomsService.addToConversation(db, msg, room)

  })

})

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

module.exports = app
