//Settings
exports.alias = ["close", "closebets"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Stops bets from being placed.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    if (!main.active)
        return message.reply("The night hasn't started!");
    if (!main.takebets)
        return message.reply("Bets are already closed!");
    main.takebets = false;
    let emb = new Discord.RichEmbed()
            .setColor(set.defaultcolor)
            .setTitle("**Betting is now closed!**");
    return message.channel.send(emb);
}

exports.category="Salty Teemo";