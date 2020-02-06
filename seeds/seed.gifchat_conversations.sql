BEGIN;

TRUNCATE
  gifchat_conversations
  RESTART IDENTITY CASCADE;

INSERT INTO gifchat_conversations (id, conversation_location, last_connection, messages)
VALUES
  (
    1, 
    'a-quiet-blue-bird-named-bobby', 
    now(),
    ARRAY['https://media.tenor.com/images/f52ef1be3e644dc39ce611096c3fa6ee/tenor.gif', 'https://media.tenor.com/images/f52ef1be3e644dc39ce611096c3fa6ee/tenor.gif', 'https://media.tenor.com/images/f52ef1be3e644dc39ce611096c3fa6ee/tenor.gif']
  ),
  (
    2, 
    'a-disgusting-orange-tick-named-donald', 
    now(),
    ARRAY['https://media.tenor.com/images/02a081de6151971255829c2d8ef25432/tenor.gif', 'https://media.tenor.com/images/02a081de6151971255829c2d8ef25432/tenor.gif', 'https://media.tenor.com/images/02a081de6151971255829c2d8ef25432/tenor.gif']
  );

COMMIT;