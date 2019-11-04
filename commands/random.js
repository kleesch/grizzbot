//Settings
exports.alias = ["random"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Tells you a random champ to play.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    var champ = global.champs[Math.floor(Math.random() * global.champs.length)];
    var embed = new Discord.RichEmbed()
        .setColor(main.set.defaultcolor)
        .setTitle("Random Champion")
        .setDescription("You should play " + champ)
        .setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + main.patch + '/img/champion/' + champ + '.png');
    return message.reply(embed);
}

exports.category="Misc";