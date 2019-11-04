//Settings
exports.alias = ["eval"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Runs the code. Meant for debugging only.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    try{
        eval(args.join(''));
    } catch (err) {
        message.author.send(err);
    }
    return await message.delete();
}

exports.category="Misc";