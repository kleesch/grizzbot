//Settings
exports.alias = ["resetteemo"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Resets salty teemo night leaderboard values.";

//Requirements
var main = require('../main.js');
var config = require('../config.json');
const Discord = require('Discord.js');

//Command
exports.command = function (message, args, temptotals, exp) {
    global.net={};
    return;
}

exports.category="Salty Teemo";