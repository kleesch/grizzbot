//Settings
exports.alias = ["expboard"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Tells you the current standings for EXP levels.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (!(message.channel.type === "text"))
        return message.channel.send("You cannot use this command here!");
    var str = "";
    var sorted = main.sortExp(exp)
    for (var i = 0; i < sorted.length && i < 25; i++) {
        var b = sorted[i][0];
        const user = await main.client.fetchUser(b);
        str += ("**" + (i + 1) + ":** " + message.guild.member(user).displayName + ": " + exp[b]["lvl"] + "\n");
    }
    var embed = new Discord.RichEmbed()
        .setColor(main.set.defaultcolor)
        .setTitle('**Leaderboard**')
        .setDescription(str)
        .setTimestamp();
    return message.channel.send(embed);
}

