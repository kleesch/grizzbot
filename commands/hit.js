//Settings
exports.alias = ["hit"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Gives you an additional card in blackjack.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    var id = message.author.id;
    if (!main.blackjack.hasOwnProperty(id))
        return message.reply("You don't have an active blackjack bet!");
    main.blackjack[id][2] += Math.floor(Math.random() * 10) + 1; //random betweeen 1 and 10
    if (main.blackjack[id][2] > 21) {
        var embed = main.getBJEmbedFinal(id)
        embed.addField("Bust!", "You lost!");
        delete main.blackjack[id];
        return message.channel.send(embed);

    }
    return message.channel.send(main.getBJEmbed(id));
}

