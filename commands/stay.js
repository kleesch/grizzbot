//Settings
exports.alias = ["stay"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Finalizes blackjack.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    var id = message.author.id;
    if (!main.blackjack.hasOwnProperty(id))
        return message.reply("You don't have an active blackjack bet!");
    while (!main.blackjack[id][1]) {
        if (main.riskAssess(21 - main.blackjack[id][0]) > Math.random() && main.blackjack[id][0] > 17) { //Too risky! Also dealer must bet to 17.
            main.blackjack[id][1] = true;
        } else {
            main.blackjack[id][0] += Math.floor(Math.random() * 10) + 1;
            if (main.blackjack[id][0] > 21) {
                var embed = main.getBJEmbedFinal(id)
                embed.addField("Dealer Bust!", "You won!");
                main.awardCash(id, Math.floor(main.blackjack[id][3] * 2));
                delete main.blackjack[id];
                return message.channel.send(embed);
            }
        }
    }
    if (main.blackjack[id][0] > main.blackjack[id][2]) {
        var embed = main.getBJEmbedFinal(id);
        embed.addField("You lost!", "Better luck next time.");
        delete main.blackjack[id];
        return message.channel.send(embed);
    } else if (main.blackjack[id][0] < main.blackjack[id][2]) {
        var embed = main.getBJEmbedFinal(id);
        embed.addField("You won!", "Congrats");
        main.awardCash(id, main.blackjack[id][3] * 2);
        delete main.blackjack[id];
        return message.channel.send(embed);
    } else {
        var embed = main.getBJEmbedFinal(id);
        embed.addField("Push!","You tied");
        main.awardCash(id, main.blackjack[id][3]);
        delete main.blackjack[id];
        return message.channel.send(embed);
    }
}

exports.category="Betting";