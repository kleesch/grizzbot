//Settings
exports.alias = ["patchnotes","pn"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Gets the current patch notes.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    var patchspl = global.patch.split(".");
    var embed = new Discord.RichEmbed()
        .setTitle("Patch Notes for " + patchspl[0] + "." + patchspl[1])
        .setDescription("[Click Here](https://na.leagueoflegends.com/en/news/game-updates/patch/patch-" + patchspl[0] + patchspl[1] + "-notes)")
        .setColor(main.set.defaultcolor);
    return message.channel.send(embed);
}

exports.category="Misc";