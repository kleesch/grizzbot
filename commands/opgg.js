//Settings
exports.alias = ["op.gg","opgg"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.arguments=["user"];

exports.helpText = "Generates a link to an op.gg profile.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    var embed = new Discord.RichEmbed()
        .setColor(main.set.defaultcolor)
        .setTitle("OP.GG Statistics")
        .setDescription("[" + args[0] + "](https://na.op.gg/summoner/userName=" + args[0] + ")");
    return message.channel.send(embed);
}

exports.category="Misc";