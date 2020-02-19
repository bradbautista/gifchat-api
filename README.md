# [GifChat](https://gifchat.now.sh/) server

**If you have not already, please read the [GifChat client readme](https://github.com/bradbautista/gifchat-client) before proceeding.**

## Table of Contents
[About](#about)
<br>
[Tech](#tech)
<br>
[Why?](#why)
 

<a name="about"></a>
## About

Now that you know about how the service works, let's talk about the API that services it.

GifChat's back end is comprised of an Express server utilizing socket.io coupled with a PostgreSQL database. The database only stores URL references to GIFs; it does not store any actual images.

If you're running it locally, the server will be listening on port 17043. To change this, change the value of the PORT field in src/config.js.

The API services requests to two endpoints: /rooms/ and /randos/. For complete implementation details, see the /src/rooms/ and /src/randos/ directories.

Typical request patterns look like this:

* **A user visits the homepage and requests a room.**  This sends an empty POST request to /rooms/. The server generates a room, adds a conversation entry for that room to the database and sends the URL for the room back to the user.
* **A user visits the homepage and requests a room with a stranger.** This also sends an empty POST request to the server, but that request encounters a state machine: The server tracks whether it has put anyone in a room since the last time someone requested a stranger; if it has not, it puts the new user in that room. If it has, it will generate a new room as above and put the user in it automatically.
* **A user enters a room.** This sends a GET request to /rooms/:roomId or /randos/:roomId for the messages in that conversation, which are stored in an array in the database. After checking whether the connection is valid and the room is at capacity, the server grants the request; if not, it rejects it and the client displays an error. This also sends a PUT request to the server to update the last_connection value in the conversation entry in the database (more on why below). Entry to the room is also when the socket connection is made.
* **A user sends a message.** This sends a PATCH request to the server with the URL of the GIF that has been added to the conversation. Due to socket.io, there is no need for the server to return the list of messages in the conversation; the client handles that, and can get them from the server by refreshing in the event that something happens to the connection.

Additionally, the GifChat server will attempt to preen itself: At midnight every night, it will look for and delete rooms that have been created but not entered, or which have not been used for seven days.

Because GifChat is hosted on Heroku currently, you may need to poke the server with a few requests initially in order to wake up the dyno it's on.

<a name="tech"></a>
## Tech

GifChat is a full-stack web application. The client is hosted [Zeit](https://zeit.co/home) and the server and database are hosted on [Heroku](https://www.heroku.com). Here's the stack:

**Front end**
<br>
HTML5/CSS3/JS
<br>
[React](https://reactjs.org/)
<br>
[Socket.io client](https://socket.io/)

**Back end**
<br>
[Node.js](https://nodejs.org/en/)
<br>
[Express](https://expressjs.com/)
<br>
[Socket.io 2.0](https://socket.io/)
<br>
[PostgreSQL](https://www.postgresql.org/)

For details about how the GifChat API works, check the comments in the source files of [its repo](https://github.com/bradbautista/gifchat-api).

**Misc.**
<br>
[Tenor API](https://tenor.com/gifapi)
<br>
[React Router](https://reacttraining.com/react-router/)
<br>
[node-cron](https://github.com/node-cron/node-cron)
<br>
[Knex](https://knexjs.org/)
<br>
[unique-names-generator](https://github.com/andreasonny83/unique-names-generator#readme)
<br>
[Mocha](https://mochajs.org/) / [Chai](https://www.chaijs.com/) / [Supertest](https://github.com/visionmedia/supertest)
<br>
[Morgan](https://github.com/expressjs/morgan) / [CORS](https://github.com/expressjs/cors) / [Helmet](https://github.com/helmetjs/helmet)

<a name="why"></a>
## Why?

I mean, why not? But mostly: Time, scope, appeal, and a desire to play with new tech.

I wanted a project, and did not have a lot of time to see it from idea to finished product. This meant whatever idea I chose to run with needed to be achieveable as mostly-idea — that is, I want you to be able to enjoy a meal without having to build an entire kitchen to prepare it for you.

For me, this meant dispensing with any sort of user or accounts system, for multiple reasons:
1. **Scope:** It's a bunch of work for something that likely has nothing to do with the core idea. 
2. **Security:** The last thing I want is someone getting credential-stuffed because they reused a password on my silly project.
3. **User-friendliness:** The fact that every website wants your email address is one of the worst parts of the modern web. How many neat tools or services have you balked at because you didn't want to deal with yet another sign-up process? If your app needs users more than anything else, you need them to try it before they leave.
4. **Creative restraint:** How are you going to deal with the implications of not having user accounts?

As I was running down my list of ideas to people to gauge their reactions, one consistently got smiles: "GifChat, a chat room where you can only communicate using GIFs." It sparked joy.

So, we're building a chat service! ...without any sort of user accounts. What does THAT look like?

As I spent time considering the shape of the project, I started to really become interested in and appreciate the type of space and the nature of the exchanges a service like this has the potential to engender. 

When you tear away all of the identifying information about a user, limit their vocabulary and force them to engage with only one other person in a private space, you theoretically eliminate a lot of the vectors for toxicity that exist on social platforms. There are no lynch mobs. There are no unsolicited pictures of genitalia. There are no DMs. There is nothing letting your chat partner know whether you're a man, woman, both, neither or all of the above. There is no handle for them to track you across the Internet with. There are no strings: there's only the room, and the GIFs the Tenor API can serve up.

Getting rid of identifying user information also had interesting security implications: Even if someone were to access a room you had been chatting in, all they would see is a string of GIFs. They could presume context, but it would be projection. It's security through absurdity.

Add a dash of [the Glass Bead Game](https://en.wikipedia.org/wiki/The_Glass_Bead_Game#The_game), and you've got a GifChat!
