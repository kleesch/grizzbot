//Settings
exports.alias = ["poll"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Holds a poll in the same channel.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    var options = args[0].split(",");
    if (options.length < 2)
        return message.reply("Invalid Options");
    var question = args.shift();
    question = args.join(" ");
    var ostr = "";
    var alp = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫"]
    for (var i = 0; i < options.length; i++) {
        ostr += (alp[i] + " " + options[i].replace(/_/g, " ") + "\n\n");
    }
    question = "**" + question + "**";
    var embed = new Discord.RichEmbed()
        .setTitle("Club Poll")
        .setDescription(question + "\n\n" + ostr)
        .setColor(main.set.defaultcolor)
        .setFooter("Started by " + message.member.displayName);
    message.channel.send(embed).then(async (smsg) => {
        var emote_table = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫"]
        for (var i = 0; i < options.length; i++)
            await smsg.react(emote_table[i]);
    });
    message.delete();
    return;
}

