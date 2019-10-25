//Settings
exports.alias = ["bets"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Tells you the current active bets.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (!main.active)
        return message.reply("The night hasn't started yet!");
    var rstr = "";
    var sortedRed = main.sortBets(global.red);
    var totRed = 0;
    for (var i = 0; i < sortedRed.length; i++) {
        var b = sortedRed[i][0];
        const user = await main.client.fetchUser(b);
        rstr += ("\t" + main.chan.guild.member(user).displayName + ": " + global.red[b] + "\n");
        totRed += red[b];
    }
    rstr += ("**Total: " + totRed + "**");
    var totBlue = 0;
    var bstr = ""
    var sortedBlue = main.sortBets(global.blue)
    for (var i = 0; i < sortedBlue.length; i++) {
        var b = sortedBlue[i][0];
        const user = await main.client.fetchUser(b);
        bstr += ("\t" + main.chan.guild.member(user).displayName + ": " + global.blue[b] + "\n");
        totBlue += global.blue[b];
    }
    bstr += ("**Total: " + totBlue + "**");
    var rembed = new Discord.RichEmbed()
        .setColor('#e62d20')
        .setTitle('**Red Bets**')
        .setDescription(rstr);
    var bembed = new Discord.RichEmbed()
        .setColor('#0946ed')
        .setTitle('**Blue Bets**')
        .setDescription(bstr);
    message.channel.send("**Current Bets**");
    message.channel.send(rembed);
    message.channel.send(bembed);
    return;
}

