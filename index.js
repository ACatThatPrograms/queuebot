require('dotenv').config({ path: __dirname + '/.env' });
const BaseCommands = require('./Classes/BaseCommands.js');
const Queue = require('./Classes/Queue.js');
const utils = require('./utils/utils.js');
const Discord = require('discord.js');
const bot = new Discord.Client();

const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_SPOTS_COOLDOWN = process.env.BOT_SPOTS_COOLDOWN;

// Queue of users as an array of usernames
let queues = [];

bot.login(BOT_TOKEN);

bot.on('ready', (listener) => {
    console.log('Logged in and ready to go!');
})

bot.on('message', (msg) => {

    let args = msg.content.split(" ");

    switch (msg.content) {
        case "!q":
        case "!q status": return sendQueueStatus(msg);

        case "!q help": return BaseCommands.printHelp(msg);
        case '!q xme': return removeUser(msg);
        case '!q clear': return clear(msg);
        case '!q list': return listQueues(msg);

        case `!q close`:
        case '!q done': return closeQueue(msg);
        
        default:
            if (args[0] === "!q") {

                // !q new (map) (code)
                if (args[1] === "new") {
                    return newQueue(msg, args[2], args[3])
                }

                if (args[1] === "me") {
                    return queueUser(msg, args[2]);
                }

                // !q spots (count)
                if (args[1] === "spots" && args[2]) {
                    return spotsAvailable(msg, args[2])
                }

                // !q code (newCode)
                if (args[1] === "code" && args[2]) {
                    return updateRoomCode(msg, args[2])
                }

                // !q map (code)
                if (args[1] === "map" && args[2]) {
                    return updateMapName(msg, args[2])
                }

            }
    }

})

function listQueues(msg) {
    let queuesEmbed = new Discord.MessageEmbed;
    queuesEmbed.setAuthor("Available Queues")

    if (queues.length === 0) {
        return msg.reply("There aren't any queues yet, why don't you make one with `!q new #map #code`")
    }

    for (let queue of queues) {
        queuesEmbed.addField(queue.owner.username + "@" + queue.mapName, queue.list.length + "/" + queue.maxUsers)
    }

    msg.channel.send(queuesEmbed);
}

function fetchOwnerQueue(msg) {
    let queue = queues.filter(queue => parseInt(queue.owner.id) === parseInt(msg.author.id));
    if (queue.length > 0) {
        return queue[0];
    }
    else {
        return false;
    }
}

function closeQueue(msg) {
    let ownerQueue = fetchOwnerQueue(msg);
    if (!ownerQueue) {
        return msg.reply("You don't have a queue to close!");
    }
    let queueIndex = queues.findIndex(queue => parseInt(queue.owner.id) === parseInt(msg.author.id));
    queues.splice(queueIndex, 1);
    msg.reply("I went ahead and closed your queue.");
}

function newQueue(msg, mapName, roomCode) {
    if (roomCode && roomCode.length !== 6) {
        return msg.reply("Make sure you provide a valid room code!")
    }
    // Check if user has an existing queue
    let ownerQueue = fetchOwnerQueue(msg);
    if (ownerQueue) {
        return msg.reply("You already have a queue, you can close it with !q close");
    }
    queues.push(new Queue(msg, mapName, roomCode));
}

function updateMapName(msg, mapName) {
    let ownerQueue = fetchOwnerQueue(msg)
    if (!ownerQueue) {
        return msg.reply("You don't have a queue setup! Set one up with !q new");
    }
    ownerQueue.updateMapName(msg, mapName);
}

function updateRoomCode(msg, code) {
    if (code.length !== 6) {
        return msg.reply("Make sure you supply a proper among us room code!")
    }
    let ownerQueue = fetchOwnerQueue(msg)
    if (!ownerQueue) {
        return msg.reply("You don't have a queue setup! Set one up with !q new");
    }
    ownerQueue.updateCode(msg, code);
}

function sendQueueStatus(msg) {
    let ownerQueue = fetchOwnerQueue(msg);
    if (!ownerQueue) {
        return listQueues(msg);
    }
    ownerQueue.sendStatus(msg);
}

function queueUser(msg, mapOrUsername) {

    // First check if the user is in any queue
    for (let queue of queues) {
        let userIn = queue.list.filter(user => user.id === msg.author.id)
        if (userIn.length > 0) {
            return msg.reply("You can only be in one queue at a time, remove yourself with `!q xme`")
        }
    }

    // If user is not in a queue, see if they want a map
    let mapName = mapOrUsername && mapOrUsername.toUpperCase();
    if (mapName && mapName === "POLUS"
        || mapName === "SKELD"
        || mapName === "MIRA"
    ) {
        // User requesting queue with map. . . Find queue with map
        queueWithMap = queues.filter(queue => queue.mapName === mapName);
        if (queues.length > 0) {
            return queues[0].queueUser(msg)
        }

    }

    // If username is requested see if requested user has a queue
    let reqQueueOwnerDisplayname = mapOrUsername;
    queueOwnedByUsername = queues.filter(queue => queue.owner.username === reqQueueOwnerDisplayname)

    if (queueOwnedByUsername.length > 0) {
        return queues[0].queueUser(msg)
    }

    // Requested queue wasn't found, so just append them to any queue if available. . .
    for (let queue of queues) {
        if (queue.list.length < queue.maxUsers) {
            return queue.queueUser(msg);
        }
    }

    // Else reply that no queues were available
    msg.reply("I'm sorry I couldn't find a queue to add you to! Try making one!")

}

async function spotsAvailable(msg, spotCount) {
    let ownerQueue = fetchOwnerQueue(msg);

    if (!ownerQueue) {
        return msg.reply("You don't have a queue setup! Set one up with !q new");
    }

    ownerQueue.spotsAvailable(msg, spotCount)

}


function removeUser(msg) {
    let removed = false;
    for (let queue of queues) {
        if (queue.hasUser(msg)) {
            queue.removeUser(msg);
            removed = true;
        }
    }
    if (!removed) {
        msg.reply("You weren't in any queues to be removed from!")
    }
}