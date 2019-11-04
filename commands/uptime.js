//Settings
exports.alias = ["uptime"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Gets the uptime of the bot.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    var totalSeconds = Math.floor((main.client.uptime / 1000));
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    var uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    var embed=new Discord.RichEmbed()
        .setTitle("Uptime")
        .setDescription("GrizzBot has been up for "+uptime)
        .setColor(main.set.defaultcolor);
    return message.channel.send(embed);
}

exports.category="Misc";