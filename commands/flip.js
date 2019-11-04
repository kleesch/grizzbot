//Settings
exports.alias = ["flip", "coinflip"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Flips a coin.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    var state = (Math.random() <= .5)
    var embed = new Discord.RichEmbed()
        .setTitle("Coin Flip")
        .setColor(main.set.defaultcolor);
    if (state)
        embed.setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/US_Nickel_2013_Obv.png/110px-US_Nickel_2013_Obv.png');
    else
        embed.setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/US_Nickel_2013_Rev.png/110px-US_Nickel_2013_Rev.png');
    return message.reply(embed);
}

