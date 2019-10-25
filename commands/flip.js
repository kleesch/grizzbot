//Settings
exports.alias = ["flip", "coinflip"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Flips a coin.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    var txt = (Math.random() <= .5) ? "Heads" : "Tails";
    var embed = new Discord.RichEmbed()
        .setTitle("Coin Flip")
        .setDescription(txt)
        .setColor(main.set.defaultcolor);
    return message.reply(embed);
}

