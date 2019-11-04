//Settings
exports.alias = ["ultimatebravery", "ub"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Generates a random link for ultimate bravery.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    var embed = new Discord.RichEmbed()
        .setColor(main.set.defaultcolor)
        .setTitle("Ultimate Bravery")
        .setDescription("[Click Here](https://ultimate-bravery.net/Dataset)")
    return message.reply(embed);
}

exports.category="Misc";