//Settings
exports.alias = ["giveaway"]; //Commands equivalents

exports.isAdmin = true; //Must be admin to use?

exports.helpText = "Holds a giveaway.";

//Requirements
var main = require('../main.js');
const Discord = require('Discord.js');

//Command
exports.command = async function (message, args, temptotals, exp) {
    if (message.channel.type !== "text")
        return message.reply("This can only be run in a server!");
    var config = {
        "ppl": 1,
        "amt": 0,
        "mins": 5
    };
    for (var i = 0; i < args.length; i++) {
        var brk = args[i].split(':')
        if (isNaN(brk[1]))
            return message.reply('Invalid Settings');
        switch (brk[0]) {
            case "ppl":
                config["ppl"] = Math.floor(parseInt(brk[1]));
                break;
            case "amt":
                config["amt"] = Math.floor(parseInt(brk[1]));
                break;
            case "mins":
                config["mins"] = Math.floor(parseInt(brk[1]));
                break;
            default:
                return message.reply("Invalid Settings");
        }
    }
    if (config["amt"] > main.set.maxgive)
        return message.reply("You cannot give that much cash away!");
    const filter3 = (reaction, user) => {
        return ['😄'].includes(reaction.emoji.name);
    };
    var embed = new Discord.RichEmbed()
        .setTitle("Giveaway!")
        .setColor(main.set.defaultcolor)
        .setFooter("Started by " + message.member.displayName)
        .setDescription("React to enter!");
    message.channel.send(embed).then(async (msg) => {
        message.delete();
        await msg.react('😄');

        msg.awaitReactions(filter3, { time: 60000 * config["mins"] })
            .then(async collected => {
                const reaction = collected.first();
                var winners = await reaction.fetchUsers();
                try {
                    var winarr = []
                    winners.tap(user => {
                        if (!user.bot)
                            winarr.push(user.id);
                    });
                    var winstr = "";
                    if (winarr.length > config["ppl"]) {
                        for (var i = 0; i < winarr.length; i++) {
                            var index = Math.floor(Math.random() * winarr.length)
                            var randid = winarr[index];
                            if (config["amt"] > 0)
                                await main.awardCash(randid, config["amt"]);
                            try {
                                var user = await main.client.fetchUser(randid);
                                winarr.splice(index, 1);
                                var mem = await message.channel.guild.member(user)
                                winstr += "\n" + mem.displayName;
                            } catch (err) {
                                winstr = "Error";
                            };

                        }
                    } else {
                        for (var i = 0; i < winarr.length; i++) {
                            try {
                                var user = await main.client.fetchUser(winarr[i]);
                                if (config["amt"] > 0)
                                    await main.awardCash(winarr[i], config["amt"]);
                                var mem = await message.channel.guild.member(user)
                                winstr += "\n" + mem.displayName;
                            } catch (err) {
                                winstr = "Error";
                            }
                        }
                    }
                    embed.setDescription("Winner(s): " + winstr);
                    await msg.edit(embed);
                    await msg.clearReactions();
                } catch (err) {
                    msg.edit("Error");
                    console.log(err);
                }
            })
            .catch(async collected => {
                embed.setDescription("Error!");
                await msg.edit(embed);
                await msg.clearReactions();
            });

    });
    return;
}

