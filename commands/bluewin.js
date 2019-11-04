//Settings
exports.alias = ["bluewin"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Awards bets to respective winners and resets all betting.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    for (var key in global.blue) {
        temptotals[key] += global.blue[key] * 2;
        await main.exper(key, 30, true);
            //message.reply("You leveled up!"); //Give EXP
    }
    main.store.updateItem('totals', temptotals);
    main.clearBets();
    return message.channel.send("Bets distributed!");
}

exports.category="Salty Teemo";