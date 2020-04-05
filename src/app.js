require('dotenv').config();
const knex = require('knex');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const { PORT, DATABASE_URL } = require('./config');
const { NODE_ENV } = require('./config');
const roomsRouter = require('./rooms/rooms-router');
const RoomsService = require('./rooms/rooms-service');
const randosRouter = require('./randos/randos-router');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

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

cron.schedule('0 0 0 * * *', function() {
  // The knex promises need to be returned, so let's
  // add some utility by logging the work our functions
  // have done for admin QoL.

  RoomsService.deleteUnusedRooms(db).then(x =>
    console.log(`Deleted ${x} unused rooms.`)
  );
  RoomsService.deleteOldConversations(db).then(x =>
    console.log(`Deleted ${x.rowCount} expired rooms.`)
  );
});

app.set('db', db);

app.use(morgan(NODE_ENV === 'production' ? 'tiny' : 'common'));
app.use(cors());
app.use(helmet());

app.use('/rooms', roomsRouter);
app.use('/randos', randosRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: 'Server error' };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

io.on('connection', socket => {
  // This pops a string out of an array, splits the string and pops the value we want. Easier to read than regEx and causes fewer issues.
  const room = socket.handshake.headers.referer
    .split(',')
    .pop()
    .split('/')
    .pop();

  // This returns the no. of users in ${room}, but it is an array length;
  // ergo, 1 is 2. So, check to see how many clients are connected; if it's
  // two, disconnect. This functions more like a bouncer than a locked door,
  // but I don't know of a way to lock the door and it works. The console logs
  // are for troubleshooting in case of server issues.
  io.sockets.adapter.clients([room], function(err, clients) {
    clients.length > 1
      ? socket.disconnect(true)
      : socket.join(room, function() {
          console.log('user joined room ' + room + ' at ' + Date());
        });
  });

  socket.on('disconnect', function() {
    socket.leave(room);
    console.log('user disconnected from room ' + room + ' at ' + Date());
  });

  socket.on('chat message', function(msg) {
    io.to(room).emit('chat message', msg);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

module.exports = app;
