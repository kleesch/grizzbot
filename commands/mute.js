//Settings
exports.alias = ["mute"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Mutes a user.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (!(message.mentions.members.keyArray().length == 1))
        return message.reply("Invalid mentions"+message.mentions.members.length);
    if (message.mentions.members.first().roles.some(r => r.name === "Muted"))
        return message.reply("That user is already muted!");
    var role = message.guild.roles.find(r => r.name === "Muted")
    message.mentions.members.first().addRole(role).catch(console.log);
    return message.channel.send("<@" + message.mentions.members.first().id + "> has been muted.");
}

