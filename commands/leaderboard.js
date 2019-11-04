//Settings
exports.alias = ["leaderboard", "lb"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Tells you the current standings of users in terms of cash.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (!(message.channel.type === "text"))
        return message.reply("You cannot use this here!");
    var str = "";
    var sorted = main.sortBets(temptotals);
    for (var i = 0; i < sorted.length && i < 25; i++) {
        var b = sorted[i][0];
        const user = await main.client.fetchUser(b);
        if (!user.bot)
            str += ("**" + (i + 1) + ":** " + message.channel.guild.member(user).displayName + ": " + temptotals[b] + "\n");
    }
    var embed = new Discord.RichEmbed()
        .setColor(main.set.defaultcolor)
        .setTitle('**Leaderboard**')
        .setDescription(str)
        .setTimestamp();
    return message.channel.send(embed);
}

exports.category="Misc";