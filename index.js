require('dotenv').config({ path: __dirname + '/.env' });
const Discord = require('discord.js');
const bot = new Discord.Client();

const BOT_TOKEN = process.env.BOT_TOKEN;

// Queue of users as an array of usernames
let userQueue = [];

const createPingTextFromId = (name) => ('<@' + name + '>');

bot.login(BOT_TOKEN);

bot.on('ready', (listener) => {
    console.log('Logged in and ready to go!');
})

bot.on('message', (msg) => {

    switch (msg.content) {
        case "!q": return sendStatus(msg);
        case "!q help": return printHelp(msg);
        case '!q me': return queueUser(msg);
        case '!q xme': return removeUser(msg);
        case '!q clear': return clear(msg);
        default:
            if ((msg.content.split(" ")[0] === "!q") && (msg.content.split(" ")[1] === "spots")) {
                spotsAvailable(msg, msg.content.split(" ")[2])
            }
    }

})

function printHelp(msg) {
    let embed = new Discord.MessageEmbed()
        .setColor("#ffbc41")
        .setTitle("Q-bie help!")
        .addField('!q help', "Show this help page, duh!")
        .addField('!q', "Show current queue list")
        .addField('!q me', "Add yourself to the queue!")
        .addField('!q xme', "Remove yourself from the queue")
        .addField('!q clear', "Clear the queue, don't troll this!");
    msg.channel.send(embed);
}

function sendStatus(msg) {
    msg.channel.send(getStatusEmbed());
}

function getStatusEmbed() {

    let replyEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle("Current Queue")
        .setDescription("List of queued members for the next event!");

    // Add currently quued users to embed
    for (let i = 0; i < userQueue.length; i++) {
        let user = userQueue[i];
        replyEmbed.addField(i + 1, user.username, true);
    }

    return replyEmbed;

}

function queueUser(msg) {
    if (userQueue.includes(msg.author)) {
        msg.reply("You're already in the queue!");
    } 
    else {
        msg.channel.send("I queued you up, here's the current list.")
        // Add sender to queue
        userQueue.push(msg.author);
    }

    msg.channel.send(getStatusEmbed());

}

async function spotsAvailable(msg, spotCount) {
    if (userQueue.length === 0) {
        return msg.channel.send("No users are queued!");
    }

    let pingMsg = "Hey, Yoohoo! You're up! "
    for (let i = 0; i < spotCount; i++) {
        let nextUserId = userQueue.shift().id;
        pingMsg += createPingTextFromId(nextUserId) + " ";
    }

    msg.channel.send(pingMsg);
    msg.channel.send(getStatusEmbed());

}

function clear(msg) {
    userQueue = [];
    msg.reply("I went ahead and cleared the queue, you better have meant it!");
    msg.channel.send(getStatusEmbed());
}

function removeUser(msg) {
    let indexOfUser = userQueue.findIndex(user => user.id === msg.author.id);
    console.log(indexOfUser);
    if (indexOfUser === -1) {
        msg.reply("You aren't even on the list!");
    }
    else {
        msg.reply("Okay, I went ahead and removed you.")
        userQueue.splice(indexOfUser, 1);
    }
    
    msg.channel.send(getStatusEmbed());
}