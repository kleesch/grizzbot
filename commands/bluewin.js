//Settings
exports.alias = ["bluewin"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Awards bets to respective winners and resets all betting.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (Object.keys(global.red).length==0 && Object.keys(global.blue).length==0)
        return message.reply("There isn't an active game!");
    for (var key in global.blue) {
        temptotals[key] += global.blue[key] * 2;
        await main.exper(key, 30, true);
        if(!(key in global.net))
            global.net[key]=0;
        global.net[key]+=global.blue[key]*2;
            //message.reply("You leveled up!"); //Give EXP
    }
    main.store.updateItem('totals', temptotals);
    main.clearBets();
    let emb = new Discord.RichEmbed()
            .setColor(main.set.defaultcolor)
            .setTitle("**Bets distributed!**");
    return message.channel.send(emb);
}

exports.category="Salty Teemo";