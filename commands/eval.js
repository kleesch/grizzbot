//Settings
exports.alias = ["eval"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Runs the code. Meant for debugging only.";

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
exports.command = async function (message, args, temptotals, exp) {
    if (!isSuperAdmin(message.author.id))
        return message.reply("You don't have permissions to do that.");
    try{
        var code=args.join('');
        eval(code);
    } catch (err) {
        console.log("Eval Err");
        message.author.send("Error"+err);
    }
    return await message.delete();
}

exports.category="Misc";