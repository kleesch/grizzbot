//Settings
exports.alias = ["endnight", "end"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Stop Salty Teemo Night & Reset Bets";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (!main.active)
        return message.reply("The night has not yet begun!");
    main.active = false;
    main.takebets = false;
    main.red = {};
    main.blue = {};
    let emb = new Discord.RichEmbed()
            .setColor(main.set.defaultcolor)
            .setTitle("**Salty teemo night is over!**");
    return message.channel.send(emb);
}

exports.category="Salty Teemo";