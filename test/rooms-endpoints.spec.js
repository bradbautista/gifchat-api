/* eslint-disable no-undef */
const knex = require('knex');
const app = require('../src/app');

describe('Rooms endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () =>
    db.raw('TRUNCATE gifchat_conversations RESTART IDENTITY')
  );

  afterEach('cleanup', () =>
    db.raw('TRUNCATE gifchat_conversations RESTART IDENTITY')
  );

  describe(`GET /rooms/:room`, () => {
    context(`Given nonexistent room`, () => {
      it(`responds with a 404 and a relevant message`, () => {
        const someRoom = 'a-stinky-green-grouch-named-Oscar';
        return supertest(app)
          .get(`/rooms/${someRoom}`)
          .expect(404, { error: { message: `No such room.` } });
      });
    });

    context(`Given a valid room and socket.connect = true`, () => {
      const testMsg =
        'https://media.tenor.com/images/2a13a6e45a811a0e810887fc3f7ae001/tenor.gif';
      const testRoom = 'a-disgusting-orange-tick-named-donald';

      beforeEach('insert conversation', () => {
        return db
          .into('gifchat_conversations')
          .insert([{ conversation_location: testRoom }])
          .then(() => {
            return db.raw(
              `UPDATE gifchat_conversations SET messages = messages || '{${testMsg}}' WHERE conversation_location = '${testRoom}';`
            );
          });
      });

      it(`responds with 200 and an array of messages`, () => {
        const validRoom = 'a-disgusting-orange-tick-named-donald';
        return supertest(app)
          .get(`/rooms/${validRoom}`)
          .set('isconnected', 'true')
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('array');
          });
      });
    });

    context(`Given a valid room and socket.connect = false`, () => {
      const testMsg =
        'https://media.tenor.com/images/2a13a6e45a811a0e810887fc3f7ae001/tenor.gif';
      const testRoom = 'a-disgusting-orange-tick-named-donald';

      beforeEach('insert conversation', () => {
        return db
          .into('gifchat_conversations')
          .insert([{ conversation_location: testRoom }])
          .then(() => {
            return db.raw(
              `UPDATE gifchat_conversations SET messages = messages || '{${testMsg}}' WHERE conversation_location = '${testRoom}';`
            );
          });
      });

      it(`responds with 404 and corresponding msg`, () => {
        const validRoom = 'a-disgusting-orange-tick-named-donald';
        return supertest(app)
          .get(`/rooms/${validRoom}`)
          .set('isconnected', 'false')
          .expect(404, {
            error: {
              message: `You have disconnected from the socket, or the room is full.`
            }
          });
      });
    });
  });

  describe(`PATCH /rooms/:room`, () => {
    context(`Given nonexistent room`, () => {
      it(`responds with a 404 and a relevant message`, () => {
        const someRoom = 'a-stinky-green-grouch-named-Oscar';
        return supertest(app)
          .patch(`/rooms/${someRoom}`)
          .expect(404, { error: { message: `No such room.` } });
      });
    });

    context(`Given a valid room`, () => {
      const testMsg =
        'https://media.tenor.com/images/2a13a6e45a811a0e810887fc3f7ae001/tenor.gif';
      const testRoom = 'a-disgusting-orange-tick-named-donald';

      beforeEach('insert conversation', () => {
        return db
          .into('gifchat_conversations')
          .insert([{ conversation_location: testRoom }])
          .then(() => {
            return db.raw(
              `UPDATE gifchat_conversations SET messages = messages || '{${testMsg}}' WHERE conversation_location = '${testRoom}';`
            );
          });
      });

      // We don't need to check socket.connected here b/c the user can't
      // emit messages if they're not connected to the socket.

      it(`responds with a 201`, () => {
        const validRoom = 'a-disgusting-orange-tick-named-donald';
        const toInsert = { msg: testMsg };
        return supertest(app)
          .patch(`/rooms/${validRoom}`)
          .send({ toInsert })
          .expect(201);
      });
    });
  });

  describe(`PUT /rooms/:room`, () => {
    context(`Given nonexistent room`, () => {
      it(`responds with a 404 and a relevant message`, () => {
        const someRoom = 'a-stinky-green-grouch-named-Oscar';
        return supertest(app)
          .put(`/rooms/${someRoom}`)
          .expect(404, { error: { message: `No such room.` } });
      });
    });

    context(`Given a valid room`, () => {
      const testMsg =
        'https://media.tenor.com/images/2a13a6e45a811a0e810887fc3f7ae001/tenor.gif';
      const testTime = 1581458541301;
      const testRoom = 'a-disgusting-orange-tick-named-donald';

      beforeEach('insert conversation', () => {
        return db
          .into('gifchat_conversations')
          .insert([{ conversation_location: testRoom }])
          .then(() => {
            return db.raw(
              `UPDATE gifchat_conversations SET messages = messages || '{${testMsg}}' WHERE conversation_location = '${testRoom}';`
            );
          });
      });

      it(`responds with a 201`, () => {
        const validRoom = 'a-disgusting-orange-tick-named-donald';
        const toInsert = { date: testTime };
        return supertest(app)
          .put(`/rooms/${validRoom}`)
          .send(toInsert)
          .expect(201);
      });
    });
  });

  describe(`POST /rooms/`, () => {
    it(`creates a room, responding with 201 and an array`, function() {
      return supertest(app)
        .post('/rooms/')
        .expect(201)
        .expect(res => {
          expect(res.body).to.be.an('array');
        });
    });
  });
});
