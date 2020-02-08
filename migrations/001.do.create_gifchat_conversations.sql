CREATE TABLE gifchat_conversations (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    conversation_location TEXT NOT NULL,
    -- Although this is a chronological identifier, 
    -- we are choosing to store it as TEXT for two reasons:
    -- 1) We will be overwriting it with a string, 
    --    which we will Date.parse() on the server
    -- 2) It will be easy to find and clean up rooms that have been
    --    created but not used: the reportConnection function is fired
    --    when the user enters the room; so if the room is never used,
    --    last_connection will be formatted as now()
    last_connection TEXT DEFAULT now() NOT NULL,
    messages TEXT[] default ARRAY[]::text[] NOT NULL
);