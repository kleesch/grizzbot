//Settings
exports.alias = ["daily"]; //Commands equivalents

exports.isAdmin = false; //Must be admin to use?

exports.helpText = "Gives you your daily cash.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    var tempdaily = await main.getDaily();
    if (!(message.author.id in tempdaily))
        tempdaily[message.author.id] = new Date(2000);
    var long = Math.abs(((new Date()).getTime() - (new Date(tempdaily[message.author.id])).getTime()));
    if (long/86400000 < 1){
        long/=1000;
        var hr=Math.floor(24-(long / 3600));
        long%=3600;
        var min=Math.floor(60-(long / 60));
        return message.reply(`You need to wait ${hr} hours and ${min} minutes to use daily again!`);
    }
        
    temptotals[message.author.id] += main.set.daily;
    tempdaily[message.author.id] = new Date();
    main.store.updateItem('daily', tempdaily);
    main.store.updateItem('totals', temptotals);
    return message.reply("You have received your daily reward!");
}

exports.category="Misc";