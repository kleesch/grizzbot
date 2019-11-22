//Settings
exports.alias = ["open", "openbets"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Allows bets to be placed.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    if (!main.active)
        return message.reply("The night hasn't started!");
    if (main.takebets)
        return message.reply("Bets are already open!");
    main.takebets = true;
    let emb = new Discord.RichEmbed()
            .setColor(set.defaultcolor)
            .setTitle("**Betting is now open!**");
    return message.channel.send(emb);
}

exports.category="Salty Teemo";