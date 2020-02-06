const { uniqueNamesGenerator, adjectives, colors, animals, names } = require('unique-names-generator');

const RoomsService = {

    getAllMessages(knex, roomName) {
      return knex.select('messages').from('gifchat_conversations').where('conversation_location', roomName)
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

        // These three variable declarations set up our URL scheme. 'A' & 'named' are established as dictionaries in order to get the flavor/human readabilty we want. There are going to be a/an disagreements; I have played with a couple of ways to get around this but with the way the package implemented it's not straightfoward.

        const a = [
            'a'
        ]
    
        const named = [
            'named'
        ]
    
        const randomName = uniqueNamesGenerator({ 
            dictionaries: [a, adjectives, colors, animals, named, names],
            separator: '-',
            length: 6
        })

        return randomName;
    }


}
  
module.exports = RoomsService