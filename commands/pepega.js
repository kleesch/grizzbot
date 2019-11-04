//Settings
exports.alias = ["pepega"]; //Commands equivalents

exports.arguments=["@user"];

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Identifies a certain user as a pepega.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (!(message.mentions.members.keyArray().length == 1))
        return message.reply("Invalid mentions"+message.mentions.members.length);
    if (message.mentions.members.first().roles.some(r => r.name === "pepega"))
        return message.reply("That user has already been identified as a pepega!");
    var role = message.guild.roles.find(r => r.name === "pepega")
    message.mentions.members.first().addRole(role).catch(console.log);
    return message.channel.send("<@" + message.mentions.members.first().id + "> is super <:pepega:565251747594108939>");
}

