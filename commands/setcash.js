//Settings
exports.alias = ["setcash"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Sets the cash value for a user.";

//Requirements
var main = require('../main.js');
var config = require('../config.json');
const Discord = require('Discord.js');

function isSuperAdmin(id) {
    if (config.adminids.includes(id))
        return true;
    return false;
}

//Command
exports.command = function (message, args, temptotals, exp) {
    if (!isSuperAdmin(message.author.id))
        return message.channel.send("You don't have permission to do that!");
    if (isNaN(args[1]))
        return message.reply("Invalid Amount");
    if (!(message.mentions.members.first().id in temptotals)) {
        temptotals[message.mentions.members.first().id] = set.startingamount;
    }
    var amt = Math.floor(parseInt(args[1]));
    temptotals[message.mentions.members.first().id] = amt;
    main.store.updateItem('totals', temptotals);
    return message.reply("Successfully set");
}

exports.category = "Misc";