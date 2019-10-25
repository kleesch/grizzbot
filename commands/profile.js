//Settings
exports.alias = ["profile", "cash"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Tells you your current balance and exp.";

//Requirements
var main=require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command=function(message, args, temptotals, exp) {
    var loadbar = "";
    var nxt = main.exp_curve(exp[message.author.id]["lvl"] + 1);
    try {
        var sum = 0;
        for (var i = 0; i <= exp[message.author.id]["lvl"]; i++) {
            sum += main.exp_curve(i);
        }
        for (var i = 1; i <= 10; i++) {
            if ((exp[message.author.id]["raw"] - sum) / nxt > (i / 10))
                loadbar += "▰";
            else loadbar += "▱";
        }
    } catch (err) {
        loadbar = "▱▱▱▱▱▱▱▱▱▱";
        console.log(err);
    }
    var name = "";
    if (message.channel.type === 'text') name = message.member.displayName;
    else name = message.author.username;
    var sorted = main.sortExp(exp)
    var rank = 1
    for (var i = 0; i < sorted.length; i++) {
        if (sorted[i][0] == message.author.id)
            break;
        else rank++;
    };
    var embed = new Discord.RichEmbed()
        .setColor(main.set.defaultcolor)
        .setTitle('**' + (name) + '\'s Statistics**')
        .setDescription("**Cash:** " + temptotals[message.author.id] + "\n**Level:** " + exp[message.author.id]["lvl"] + "\n" + loadbar + "\n(Rank: " + rank + "/" + sorted.length + ")")
        .setTimestamp();
    return message.channel.send("<@" + message.author.id + ">", embed);
}

