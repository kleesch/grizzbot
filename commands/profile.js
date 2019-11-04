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
    var target=message.member;
    var targetId=message.author.id;
    if (message.mentions.members.first()){
        targetId=message.mentions.members.first().id;
        target=message.mentions.members.first();
    }
    if(!(targetId in exp)){
        exp[targetId] = {
            "lvl": 0,
            "raw": main.exp_curve(0),
            "cd": new Date(2000),
        };
        await store.updateItem('exp', exp);
    }
    if (!(message.author.id in temptotals)) {
        temptotals[message.author.id] = set.startingamount;
        store.updateItem('totals', temptotals);
    }
    var nxt = main.exp_curve(exp[targetId]["lvl"] + 1);
    try {
        var sum = 0;
        for (var i = 0; i <= exp[targetId]["lvl"]; i++) {
            sum += main.exp_curve(i);
        }
        for (var i = 1; i <= 10; i++) {
            if ((exp[targetId]["raw"] - sum) / nxt > (i / 10))
                loadbar += "▰";
            else loadbar += "▱";
        }
    } catch (err) {
        loadbar = "▱▱▱▱▱▱▱▱▱▱";
        console.log(err);
    }
    var name = "";
    if (message.channel.type === 'text') name = target.displayName;
    else name = message.author.username;
    var sorted = main.sortExp(exp)
    var rank = 1
    for (var i = 0; i < sorted.length; i++) {
        if (sorted[i][0] == targetId)
            break;
        else rank++;
    };
    var embed = new Discord.RichEmbed()
        .setColor(main.set.defaultcolor)
        .setTitle('**' + (name) + '\'s Statistics**')
        .setDescription("**Cash:** " + temptotals[targetId] + "\n**Level:** " + exp[targetId]["lvl"] + "\n" + loadbar + "\n(Rank: " + rank + "/" + sorted.length + ")")
        .setTimestamp();
    return message.channel.send("<@" + message.author.id + ">", embed);
}

