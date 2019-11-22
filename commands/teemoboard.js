//Settings
exports.alias = ["teemoboard", "tb"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Tells you the standings of users for salty teemo night.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (Object.keys(global.net).length == 0) {
        let emb = new Discord.RichEmbed()
            .setColor(main.set.defaultcolor)
            .setTitle("**No Changes**");
        return message.channel.send(emb);
    }
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

exports.category = "Salty Teemo";