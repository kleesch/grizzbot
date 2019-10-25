//Settings
exports.alias = ["resetteemo"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Resets cash values.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    main.store.updateItem('totals', {});
    return;
}

