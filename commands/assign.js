//Settings
exports.alias = ["assign", "giverole"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.arguments = ["@user","role"]

exports.helpText = "Gives a user a certain role.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (!message.mentions.members.first())
        return message.reply("Invalid mentions");
    args.shift();
    var rname = args.join(" ");
    if (message.mentions.members.first().roles.some(r => r.name === rname))
        return message.reply("That user already has that role!");
    var role = message.guild.roles.find(r => r.name === rname)
    message.mentions.members.first().addRole(role).catch(console.log);
    return message.channel.send("<@" + message.mentions.members.first().id + "> has been given the role.");
}

