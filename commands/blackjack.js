//Settings
exports.alias = ["blackjack"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Bets the amount on a blackjack game.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (main.blackjack.hasOwnProperty(message.author.id))
        return message.reply("You already have an ongoing game!");
    if (!(args.length == 1))
        return message.reply("Invalid bet!");
    if (isNaN(args[0]))
        return message.reply("Invalid bet!");
    var bet = parseInt(args[0]);
    if (temptotals[message.author.id] < bet)
        return message.reply("You don't have enough to make that bet!");
    if (bet <= 0)
        return message.reply("Invalid bet!");
    main.awardCash(message.author.id, -1 * bet);
    main.blackjack[message.author.id] = [Math.floor(Math.random() * 10) + 1, false, Math.floor(Math.random() * 10) + 1, bet, message.member.displayName];
    return message.channel.send(main.getBJEmbed(message.author.id));
}

