const knex = require('knex')
const app = require('../src/app')
const { makeConversationsArray } = require('./rooms.fixtures')

describe('Rooms endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw(
        'TRUNCATE gifchat_conversations RESTART IDENTITY'
        ))

    afterEach('cleanup',() => db.raw(
        'TRUNCATE gifchat_conversations RESTART IDENTITY'
        ))

    // We need to describe/test:
    // POST /rooms/
    // ALL /rooms/:room
    // GET /rooms/:room
    // PATCH /rooms/:room
    // PUT /rooms/:room



    ///////////////////////////////
    ///////////////////////////////
    ///////////////////////////////
    ///////////////////////////////
    ///////////////////////////////
    
//     describe(`POST /rooms/`, () => {

//     })

//     describe(`ALL /rooms/:room`, () => {
        
//     })

//     describe(`GET /rooms/:room`, () => {
        
//     })

//     describe(`PATCH /rooms/:room`, () => {
        
//     })

//     describe(`PUT /rooms/:room`, () => {
        
//     })



  describe(`POST /rooms/`, () => {
    it(`creates a room, responding with 201 and the location of the room`, function() {
      return supertest(app)
        .post('/rooms/')
        .expect(201)
        .expect(res => {
          expect(res.body).to.be.an('array')
        })
        // .then(res =>
        //   supertest(app)
        //     .post(`/rooms/${res.body.id}`)
        //     .expect(res.body)
        // )
    })

  })



})