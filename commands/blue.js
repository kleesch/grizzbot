//Settings
exports.alias = ["blue"]; //Commands equivalents

exports.arguments = ["amt"];

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Bets the specified amount on blue.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    if (!main.active)
        return message.reply("Salty teemo night hasn't started!");
    else if (!main.takebets)
        return message.reply("Betting is closed!");
    else if (isNaN(args[0])) // Is not a number
        return message.reply("Invalid Amount");
    else if (Math.abs(args[0]) > temptotals[message.author.id])
        return message.reply("You don't have enough to make that bet!");
    else if (main.hasBet(message.author.id))
        return message.reply("You have already bet!");
    else {
        var bet = Math.abs(Math.floor(parseInt(args[0])));
        if (bet * 2 > Number.MAX_SAFE_INTEGER)
            return message.reply("Bet too large.");
        global.blue[message.author.id] = bet;
        main.awardCash(message.author.id, -1 * bet);
        if(!(message.author.id in global.net))
            global.net[message.author.id]=0;
        global.net[message.author.id]-=bet;
        return message.reply("Bet set for " + bet + " on blue!");
    }
}
exports.category="Salty Teemo";