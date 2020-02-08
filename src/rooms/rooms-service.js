const { uniqueNamesGenerator, adjectives, colors, animals, names } = require('unique-names-generator');

const RoomsService = {

    getAllMessages(knex, roomName) {
      return knex.select('messages').from('gifchat_conversations').where('conversation_location', roomName)
    },

    reportConnection(knex, date, room) {
        
        // Our query structure:
        // UPDATE gifchat_conversations 
        // SET last_connection = '08 Jan 1970 00:00:00 GMT' 
        // WHERE conversation_location = 'a-marked-gold-crane-named-Tonie';

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

        // These three variable declarations set up our URL scheme. 'A' & 'named' are established as dictionaries in order to get the flavor/human readabilty we want. There are going to be a/an disagreements; I have played with a couple of ways to get around this but with the way the package is implemented it's not straightfoward.

        const a = ['a']    
        const named = ['named']

        const randomName = uniqueNamesGenerator({ 
            dictionaries: [a, adjectives, colors, animals, named, names],
            separator: '-',
            length: 6
        })

        return randomName;
    },

    addToConversation(knex, msg, room) {

        // Using raw here because knex mangles the array concat syntax
        // and also because it's more readable
        
        return knex.raw(
            `UPDATE gifchat_conversations SET messages = messages || '{${msg}}' WHERE conversation_location = '${room}';`
        )

    }


}
  
module.exports = RoomsService