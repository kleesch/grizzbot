//Settings
exports.alias = ["resetteemo"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Resets cash values.";

//Requirements
var main = require('../main.js');
var config = require('../config.json');
const Discord = require('Discord.js');

function isSuperAdmin(id){
    if (config.adminids.includes(id))
            return true;
        return false;
}

//Command
exports.command = function (message, args, temptotals, exp) {
    if(!isSuperAdmin(message.author.id))
        return message.channel.send("You don't have permission to do that!");
    main.store.updateItem('totals', {});
    return;
}

exports.category="Misc";