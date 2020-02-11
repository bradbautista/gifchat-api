const { uniqueNamesGenerator, adjectives, colors, animals, names } = require('unique-names-generator');

const RoomsService = {

    getAllRooms(knex) {
        return knex
            .select('conversation_location')
            .from('gifchat_conversations')
    },

    getAllMessages(knex, roomName) {
      return knex.select('messages').from('gifchat_conversations').where('conversation_location', roomName)
    },

    reportConnection(knex, date, room) {
        
        dateInt = parseInt(date)

        return knex('gifchat_conversations')
        .where('conversation_location', room)
        .update('last_connection', date)

    },

    insertConversation(knex, randomName) {
        return knex
          .insert([
              { conversation_location: randomName }
            ])
          .into('gifchat_conversations')
          .returning('conversation_location')
    },

    getRoomName() {

        // These three variable declarations set up our URL scheme. 'A' & 'named' are established as dictionaries in order to get the flavor/human readabilty we want.

        const a = ['a']    
        const named = ['named']

        const randomName = uniqueNamesGenerator({ 
            dictionaries: [a, adjectives, colors, animals, named, names],
            separator: '-',
            length: 6
        })

        // I cannot abide the a/an disagreements
        if (randomName.charAt(2) === 'a' || randomName.charAt(2) === 'e' || randomName.charAt(2) === 'i' || randomName.charAt(2) === 'o' || randomName.charAt(2) === 'u') {
            return randomName.slice(0, 1) + 'n' + randomName.slice(1)
        } else {
            return randomName
        }
        
    },

    addToConversation(knex, msg, room) {

        // Using raw here because knex mangles the array concat syntax
        // and also because it's more readable. Note pipe here is not
        // OR as in JS, it is concat

        return knex.raw(
            `UPDATE gifchat_conversations SET messages = messages || '{${msg}}' WHERE conversation_location = '${room}';`
        )

    },

    deleteUnusedRooms(knex) {

        return knex('gifchat_conversations')
            .where('last_connection', 42)
            .del()

    },

    deleteOldConversations(knex) {

        const today = Date.now() // Ms since epoch
        const msInAWeek = 604800000
        const sevenDaysAgoInMs = today - msInAWeek

        // Once again using raw because knex interprets the
        // WHERE criterion as 1 = 0

        return knex.raw(
            `DELETE FROM gifchat_conversations WHERE last_connection < '${sevenDaysAgoInMs}';`
        )
        
    },


}
  
module.exports = RoomsService