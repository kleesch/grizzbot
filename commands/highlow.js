//Settings
exports.alias = ["highlow","hl"]; //Commands equivalents

exports.arguments=["amt"];

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Bets the amount on a higher/lower game.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (isNaN(args[0]))
        return message.reply("Invalid Amount");
    var bet = Math.floor(parseInt(args[0]));
    if (bet <= 0)
        return message.reply("Invalid Amount");
    if (bet * 2 > Number.MAX_SAFE_INTEGER)
        return message.reply("Bet too big.");
    main.awardCash(message.author.id, -1 * bet);
    const filter2 = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
    };
    var first = Math.floor(Math.random() * 81) + 10 //Range: 10-90
    var second = first;
    while (second == first)
        second = Math.floor(Math.random() * 100) + 1;
    var embed = new Discord.RichEmbed()
        .setTitle("Higher / Lower Game")
        .setColor(main.set.defaultcolor)
        .setDescription("Number: **" + first + "**\n\nDo you think that the number will be higher or lower?\n(1 Minute To Answer)");
    message.reply(embed).then(async (msg) => {
        await msg.react('👍');
        await msg.react('👎');

        msg.awaitReactions(filter2, { max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const reaction = collected.first();
                var won = false
                if (reaction.emoji.name === '👍' && second > first) {
                    won = true;
                } else if (reaction.emoji.name === '👎' && second < first) {
                    won = true;
                }
                if (won) {
                    embed.setDescription("Number 1: **" + first + "**\nNumber 2: **" + second + "**\n\nYou guessed correctly! Congratulations!");
                    await main.awardCash(message.author.id, 2 * bet);
                } else {
                    embed.setDescription("Number 1: **" + first + "**\nNumber 2: **" + second + "**\n\nYou guessed incorrectly.");
                }
                await msg.edit(embed);
                await msg.clearReactions();
            })
            .catch(async collected => {
                embed.setDescription("You took too long!");
                await msg.edit(embed);
                await msg.clearReactions();
            });

    });
    return;
}

exports.category="Betting";