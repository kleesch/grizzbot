//Settings
exports.alias = ["teemoboard", "tb"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Tells you the current standings of users for the current salty teemo night.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    var str = "";
    var sorted = main.sortBets(global.net);
    for (var i = 0; i < sorted.length && i < 25; i++) {
        var b = sorted[i][0];
        const user = await main.client.fetchUser(b);
        if (!user.bot)
            str += ("**" + (i + 1) + ":** " + message.channel.guild.member(user).displayName + ": " + global.net[b] + "\n");
    }
    var embed = new Discord.RichEmbed()
        .setColor(main.set.defaultcolor)
        .setTitle('**Leaderboard**')
        .setDescription(str)
        .setTimestamp();
    return message.channel.send(embed);
}

exports.category="Misc";