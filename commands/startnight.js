//Settings
exports.alias = ["startnight", "saltyteemo"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Begins Salty Teemo Night.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    if (message.channel.type !== "text")
        return message.reply("This can only be run in a server!");

    if (!main.active) {
        main.active = true;
        main.chan = message.channel;
        let emb = new Discord.RichEmbed()
            .setColor(set.defaultcolor)
            .setTitle("**Salty teemo night started!**");
        return message.channel.send(emb);
    } else {
        return message.reply("Night already started");
    }
}

exports.category="Salty Teemo";