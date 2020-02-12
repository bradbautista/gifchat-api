const knex = require('knex')
const app = require('../src/app')

describe('Randos endpoints', function() {
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

    // We only need to test the POST on this; once they're in
    // a room, code is the same as in /rooms/
    //
    // Post will behave differently on the server side depending
    // on the state of a variable there, but either way it should
    // respond 303

    describe.only(`POST /randos/`, () => {
        it(`Responds with 303, either after creating a room or with the url of a room the user should be directed to`, function() {
        return supertest(app)
            .post('/randos/')
            .expect(303)
        })
    })

})