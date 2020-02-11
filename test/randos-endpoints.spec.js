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

    describe(`POST /randos/`, () => {
        it(`creates a room, responding with 201 and an array`, function() {
        return supertest(app)
            .post('/randos/')
            .expect(201)
            .expect(res => {
            expect(res.body).to.be.an('array')
            })
        })
    })

})