//Settings
exports.alias = ["give"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.arguments=["@user","amt"];

exports.helpText = "Gives a user the specified amount.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (isNaN(args[1]))
        return message.reply("Invalid Amount");
    if (!(message.mentions.members.first().id in temptotals)) {
        temptotals[message.mentions.members.first().id] = set.startingamount;
    }
    var amt = Math.floor(parseInt(args[1]));
    if (amt > main.set.maxgive)
        return message.reply("You cannot give that amount of cash.");
    temptotals[message.mentions.members.first().id] += amt;
    main.store.updateItem('totals', temptotals);
    return message.reply("Successfully given");
}

