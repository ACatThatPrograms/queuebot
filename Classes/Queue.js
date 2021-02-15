const Discord = require('discord.js');
const utils = require('../utils/utils.js');

class Queue {

    constructor(msg, mapName, roomCode) {
        this.list = []; // List of queued users
        this.owner = msg.author // Queue Owner
        this.spotsTimeout = process.env.BOT_SPOTS_COOLDOWN, // How long in seconds you must wait between spots commands
        this.roomCode = roomCode ? roomCode.toUpperCase() : "???",
        this.mapName = mapName ? mapName.toUpperCase() : "???",

        this.maxUsers = 8

        msg.reply("Created a queue for map " + this.mapName + " with code " + this.roomCode + ". Update with `!q map` and `!q code`");
    }

    _getStatusEmbed(customMsg) {

        let replyEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(customMsg ? customMsg : this.owner.username + "'s Queue" + "    " + this.list.length + "/" + this.maxUsers)
            .setDescription(this.owner.username + "'s queue.")
            .addField('Room Code', this.roomCode, true)
            .addField('Map', this.mapName, true)

        // Add currently queued users to embed
        for (let i = 0; i < this.list.length; i++) {
            let user = this.list[i];
            replyEmbed.addField(i + 1, user.username, true);
        }

        return replyEmbed;

    }

    queueUser(msg) {
        this.list.push(msg.author);
        msg.channel.send(this._getStatusEmbed("I queued you up, here's the deets:"));
    }

    sendStatus(msg) {
        msg.channel.send(this._getStatusEmbed());
    }

    updateCode(msg, code) {
        if (code.length !== 6) {
            return msg.reply("Make sure that's a valid room code! 6 digits!");
        }
        this.roomCode = toUpperCase(code);
        msg.reply("I updated your queue's room code to: " + this.roomCode);
    }

    updateMapName(msg, mapName) {
        this.mapName = mapName.toUpperCase();
        msg.reply("I updated your queue's map name to: " + this.mapName);
    }

    clear(msg) {
        this.list = [];
        msg.channel.send(getStatusEmbed("I went ahead and cleared your queue."));
    }

    removeUser(msg) {
        let indexOfUser = this.list.findIndex(user => user.id === msg.author.id);
        if (indexOfUser === -1) {
            return false;
        }
        else {
            this.list.splice(indexOfUser, 1);
            return msg.reply("You have been removed from the queue.")
        }    
    }

    // Return true of author is in queue
    hasUser(msg) {
        let indexOfUser = this.list.findIndex(user => user.id === msg.author.id);
        return indexOfUser !== -1;
    }

    spotsAvailable(msg, spotCount) {
        if (this.list.length === 0) {
            return msg.channel.send("No users are queued!");
        }
    
        let pingMsg = "Hey, Yoohoo!    You're up in **" + this.roomCode + "** playing **" + this.mapName + "**!    Don't miss it! \n\n"
        for (let i = 0; i < spotCount; i++) {
            let nextUser = this.list.shift();
            if (!nextUser) {
                break;
            }
            let nextUserId = nextUser.id;
            pingMsg += utils.createPingFromUserId(nextUserId) + " ";
        }
    
        msg.channel.send(pingMsg);
    }

}

module.exports = Queue;