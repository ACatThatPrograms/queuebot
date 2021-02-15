const Discord = require('discord.js');

class BaseCommands {

    static printHelp(msg) {
        let embed = new Discord.MessageEmbed()
            .setColor("#ffbc41")
            .setTitle("Q-bie help!",)
            .setDescription("I'm Q-bie! Create a new queue to manage with !q new #code")
            .addField('!q new #map #cpde', "Create a new queue for (map) with (code)")
            .addField('!q list', "Show available queues")
            .addField('!q help', "Show this help page, duh!")
            .addField('!q code #code', "Update your queue's room code")
            .addField('!q map #MAP', "Set the map name for this queue")
            .addField('!q status', "Show your queue's status or available queues if you haven't a queue")
            .addField('!q spots x', "Advance your queue by x spots")
            .addField('!q me', "Add yourself to any available queue!")
            .addField('!q me #username', "Add yourself to a specified user's queue!")
            .addField('!q me #map', "Add yourself to an available queue with #MAP")
            .addField('!q xme', "Remove yourself from any queues you are enrolled in")
            .addField('!q clear', "Clear your queue!")
            .addField('!q done', "Close your queue");
        msg.channel.send(embed);
    }

}

module.exports = BaseCommands;