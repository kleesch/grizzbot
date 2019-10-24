const Discord = require('Discord.js');
const set = require("./config.json");

const client = new Discord.Client();

var active = false; // is salty teemo night active
var chan; // what channel is it occuring in?
var takebets = false; // take bets?

//datastore stuff

const store = require('node-persist');
async function setup() {
    await store.init();
}
setup();

async function getTotals() {
    var keys = await store.keys()
    if (keys.includes('totals')) {
        return await store.getItem('totals');
    } else {
        return {};
    }
}

async function awardCash(id, amt) {
    var keys = await store.keys()
    var totals = {}
    if (keys.includes('totals')) {
        totals = await store.getItem('totals');
    }
    if (!(id in totals))
        totals[id] = set.startingamount;
    totals[id] += amt;
    await store.setItem('totals', totals);
    return;
}

async function getDaily() {
    var keys = await store.keys()
    if (keys.includes('daily')) {
        return await store.getItem('daily');
    } else {
        return {};
    }
}

async function getExp() {
    var keys = await store.keys()
    if (keys.includes('exp')) {
        return await store.getItem('exp');
    } else {
        return {};
    }
}

var blue = {}; //blue[id]=bet
var red = {}; //red[id]=bet

const req = require("request-promise");
var champs = []
var patch = "9.20.1";
function updateChamps() {
    champs = [];
    try {
        var ver;
        req('https://ddragon.leagueoflegends.com/api/versions.json').then(function (body) {
            ver = JSON.parse(body);
            patch = ver[0];
            req('http://ddragon.leagueoflegends.com/cdn/' + ver[0] + '/data/en_US/champion.json').then(function (body) {
                var stuff = JSON.parse(body);
                for (var name in stuff["data"])
                    champs.push(name);
                return;
            });
        });
    } catch (err) {
        champs = ["Error loading champion data. Try teemo?"];
        console.log(err);
    }
}
updateChamps();

function isAdmin(author) {
    try {
        if (author.roles)
            if (author.roles.some(r => set.adminroles.includes(r.name)))
                return true;
        if (set.adminids.includes(author.id))
            return true;
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
};

function hasBet(id) {
    if (id in blue || id in red)
        return true;
    return false;
}

function sortBets(obj) {
    var sortable = [];
    for (var key in obj)
        if (obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]);
    sortable.sort(function (a, b) {
        return b[1] - a[1];
    });
    return sortable;
}

function sortExp(obj) {
    var sortable = [];
    for (var key in obj)
        if (obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]);
    sortable.sort(function (a, b) {
        return b[1]["raw"] - a[1]["raw"];
    });
    return sortable;
}

//exp
function exp_curve(x) {
    return Math.floor(7 * Math.sqrt(x) + 20);
}

async function exper(id, amt, force) {
    var exp = await getExp();
    if (!(id in exp)) {
        exp[id] = {
            "lvl": 0,
            "raw": 20,
            "cd": new Date(2000),
        };
    };
    var long = Math.abs(((new Date()).getTime() - (new Date(exp[id]["cd"])).getTime()) / 60000);
    if (long < 1 && !force) {
        return false;
    }
    exp[id]["cd"] = new Date();
    exp[id]["raw"] += amt;
    var sum = 0;
    for (var i = 0; i <= exp[id]["lvl"]; i++) {
        sum += exp_curve(i);
    }
    if (exp_curve(exp[id]["lvl"] + 1) <= (exp[id]["raw"] - sum)) {
        //exp[id]["raw"] = 0;
        exp[id]["lvl"]++;
        await store.updateItem('exp', exp);
        return true;
    }
    await store.updateItem('exp', exp);
    return false;
}

//Random events
const filter = (reaction, user) => {
    return ['💸'].includes(reaction.emoji.name);
};
async function randomDrop(channel) {
    updateChamps();// this is the least frequent way to call httpupdate
    var embed = new Discord.RichEmbed()
        .setTitle("Cash Giveaway!")
        .setDescription("React to this message for cash!")
        .setColor(set.defaultcolor);
    channel.send(embed).then(async (message) => {
        await message.react('💸');
        message.awaitReactions(filter, { time: (60000 * 5) }).then(async (collected) => {
            var temptotals = await getTotals();
            collected.first().users.keyArray().forEach(function (id) {
                if (!(id in temptotals))
                    temptotals[id] = set.startingamount;
                temptotals[id] += set.randomreward;
            });
            await store.updateItem('totals', temptotals);
            await message.delete();
        }).catch(collected => {
            console.log("Error with awarding random drops.");
        });
    });
}

//Blackjack manager
var blackjack = {} //[id]=[pcamt,pcstay,useramt,userbet,userdisplayname]
function riskAssess(amt) {//This is the mathematical function to determine if the computer should hit or stay.
    return .1 * (-amt - 10) + 2; //can be negative. if negative, safe to bet
}

function getBJEmbed(id) {
    var embed = new Discord.RichEmbed()
        .setTitle("Blackjack with " + blackjack[id][4])
        .setDescription("Your Amount: " + blackjack[id][2])
        .setColor(set.defaultcolor);
    return embed;
}

function getBJEmbedFinal(id) {
    var embed = new Discord.RichEmbed()
        .setTitle("Blackjack with " + blackjack[id][4])
        .setDescription("Dealer: " + blackjack[id][0] + "\n\nYou: " + blackjack[id][2])
        .setColor(set.defaultcolor);
    return embed;
}

client.on("ready", () => {
    console.log("Salty Teemo Bot Started");
    client.user.setActivity('Challenger Replays', { type: 'WATCHING' })
});

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (await exper(message.author.id, 1, false))
        message.reply("You leveled up!"); //Give EXP

    if (message.content.indexOf(set.prefix) !== 0) {
        if (Math.floor((Math.random() * 100 + 1)) <= 1)
            randomDrop(message.channel);
        return;
    }
    const args = message.content.slice(set.prefix.length).trim().split(/ +/g);
    var command = args.shift();//.toLowerCase();
    command = command.toLowerCase();

    var temptotals = await getTotals();
    var exp = await getExp();
    if (!(message.author.id in temptotals)) {
        temptotals[message.author.id] = set.startingamount;
        store.updateItem('totals', temptotals);
        message.reply("Your profile has been created with " + set.startingamount);
    }

    switch (command) {
        case "startnight":
        case "saltyteemo":
            if (message.channel.type !== "text")
                return message.reply("This can only be run in a server!");
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");

            if (!active) {
                active = true;
                chan = message.channel;
                return message.channel.send("Salty teemo night started!");
            } else {
                return message.reply("Night already started");
            }
        case "blue":
            if (!active)
                return message.reply("Salty teemo night hasn't started!");
            else if (!takebets)
                return message.reply("Betting is closed!");
            else if (isNaN(args[0])) // Is not a number
                return message.reply("Invalid Amount");
            else if (args[0] > getTotals()[message.author.id])
                return message.reply("You don't have enough to make that bet!");
            else if (hasBet(message.author.id))
                return message.reply("You have already bet!");
            else {
                var bet = Math.floor(parseInt(args[0]));
                if (bet * 2 > Number.MAX_SAFE_INTEGER)
                    return message.reply("Bet too large.");
                blue[message.author.id] = bet;
                awardCash(message.author.id, -1 * bet);
                return message.reply("Bet set for " + args[0] + " on blue!");
            };
        case "red":
            if (!active)
                return message.reply("Salty teemo night hasn't started!");
            else if (!takebets)
                return message.reply("Betting is closed!");
            else if (isNaN(args[0])) // Is not a number
                return message.reply("Invalid Amount");
            else if (args[0] > temptotals[message.author.id])
                return message.reply("You don't have enough to make that bet!");
            else if (hasBet(message.author.id))
                return message.reply("You have already bet!");
            else {
                var bet = Math.floor(parseInt(args[0]));
                if (bet * 2 > Number.MAX_SAFE_INTEGER)
                    return message.reply("Bet too large.");
                red[message.author.id] = bet;
                temptotals[message.author.id] -= bet;
                store.updateItem('totals', temptotals);
                return message.reply("Bet set for " + args[0] + " on red!");
            };
        case "profile":
        case "check":
            var loadbar = "";
            var nxt = exp_curve(exp[message.author.id]["lvl"] + 1);
            try {
                var sum = 0;
                for (var i = 0; i <= exp[message.author.id]["lvl"]; i++) {
                    sum += exp_curve(i);
                }
                for (var i = 1; i <= 10; i++) {
                    if ((exp[message.author.id]["raw"] - sum) / nxt > (i / 10))
                        loadbar += "▰";
                    else loadbar += "▱";
                }
            } catch (err) {
                loadbar = "▱▱▱▱▱▱▱▱▱▱";
                console.log(err);
            }
            var name = "";
            if (message.channel.type === 'text') name = message.member.displayName;
            else name = message.author.username;
            var sorted = sortExp(exp)
            var rank = 1
            for (var i = 0; i < sorted.length; i++) {
                if (sorted[i][0] == message.author.id)
                    break;
                else rank++;
            };
            var embed = new Discord.RichEmbed()
                .setColor(set.defaultcolor)
                .setTitle('**' + (name) + '\'s Statistics**')
                .setDescription("**Cash:** " + temptotals[message.author.id] + "\n**Level:** " + exp[message.author.id]["lvl"] + "\n" + loadbar + "\n(Rank: " + rank + "/" + sorted.length + ")")
                .setTimestamp();
            return message.channel.send("<@" + message.author.id + ">", embed);
        case "open":
        case "betsopen":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            if (!active)
                return message.reply("The night hasn't started!");
            if (takebets)
                return message.reply("Bets are already open!");
            takebets = true;
            return message.channel.send("**Betting is now open!**");
        case "close":
        case "betsclose":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            if (!active)
                return message.reply("The night hasn't started!");
            if (!takebets)
                return message.reply("Bets are already closed!");
            takebets = false;
            return message.channel.send("**Betting is now closed!**");
        case "redwin":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            for (var key in red) {
                temptotals[key] += red[key] * 2;
                if (await exper(key, 30, true))
                    message.reply("You leveled up!"); //Give EXP
            }
            store.updateItem('totals', temptotals);
            red = {};
            blue = {};
            return message.channel.send("Bets distributed!");
        case "bluewin":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            for (var key in blue) {
                temptotals[key] += blue[key] * 2;
                await exper(key, 30, true)
            }
            store.updateItem('totals', temptotals);
            red = {};
            blue = {};
            return message.channel.send("Bets distributed!");
        case "bets":
            if (!active)
                return message.reply("The night hasn't started yet!");
            var rstr = "";
            var sortedRed = sortBets(red)
            var totRed = 0;
            for (var i = 0; i < sortedRed.length; i++) {
                var b = sortedRed[i][0];
                const user = await client.fetchUser(b);
                rstr += ("\t" + chan.guild.member(user).displayName + ": " + red[b] + "\n");
                totRed += red[b];
            }
            rstr += ("**Total: " + totRed + "**");
            var totBlue = 0;
            var bstr = ""
            var sortedBlue = sortBets(blue)
            for (var i = 0; i < sortedBlue.length; i++) {
                var b = sortedBlue[i][0];
                const user = await client.fetchUser(b);
                bstr += ("\t" + chan.guild.member(user).displayName + ": " + blue[b] + "\n");
                totBlue += blue[b];
            }
            bstr += ("**Total: " + totBlue + "**");
            var rembed = new Discord.RichEmbed()
                .setColor('#e62d20')
                .setTitle('**Red Bets**')
                .setDescription(rstr);
            var bembed = new Discord.RichEmbed()
                .setColor('#0946ed')
                .setTitle('**Blue Bets**')
                .setDescription(bstr);
            message.channel.send("**Current Bets**");
            message.channel.send(rembed);
            message.channel.send(bembed);
            return;
        case "give":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            if (isNaN(args[1]))
                return message.reply("Invalid Amount");
            if (!(message.mentions.members.first().id in temptotals)) {
                temptotals[message.mentions.members.first().id] = set.startingamount;
            }
            var amt = Math.floor(parseInt(args[1]));
            if (amt > set.maxgive)
                return message.reply("You cannot give that amount of cash.");
            temptotals[message.mentions.members.first().id] += amt;
            store.updateItem('totals', temptotals);
            return message.reply("Successfully given");
        case "lb":
        case "leaderboard":
            if (!(message.channel.type === "text"))
                return message.reply("You cannot use this here!");
            var str = "";
            var sorted = sortBets(temptotals);
            for (var i = 0; i < sorted.length && i < 25; i++) {
                var b = sorted[i][0];
                const user = await client.fetchUser(b);
                if (!user.bot)
                    str += ("**" + (i + 1) + ":** " + message.channel.guild.member(user).displayName + ": " + temptotals[b] + "\n");
            }
            var embed = new Discord.RichEmbed()
                .setColor(set.defaultcolor)
                .setTitle('**Leaderboard**')
                .setDescription(str)
                .setTimestamp();
            return message.channel.send(embed);
        case "expboard":
            if (!(message.channel.type === "text"))
                return message.channel.send("You cannot use this command here!");
            var str = "";
            var sorted = sortExp(exp)
            for (var i = 0; i < sorted.length && i < 25; i++) {
                var b = sorted[i][0];
                const user = await client.fetchUser(b);
                str += ("**" + (i + 1) + ":** " + message.guild.member(user).displayName + ": " + exp[b]["lvl"] + "\n");
            }
            var embed = new Discord.RichEmbed()
                .setColor(set.defaultcolor)
                .setTitle('**Leaderboard**')
                .setDescription(str)
                .setTimestamp();
            return message.channel.send(embed);
        case "help":
            var embed = new Discord.RichEmbed()
                .setColor(set.defaultcolor)
                .addField("**User Commands**", `
daily - Gives you your daily cash.
check - Tells you your current balance.
highlow amt - Bets the amount on a higher/lower game.
blue amt - Bets the specified amount on blue.
red amt - Bets the specified amount on red.
bets  - Tells you the current active bets.
leaderboard - Tells you the current standings of everyone playing.
expboard - Tells you the current standings for EXP levels.
ultimatebravery - Generates a random link for ultimate bravery.
op.gg user - Generates a link to the OP.GG page for a summoner. (NA Server)
random - Tells you a random champ to play.`, true);
            if (isAdmin(message.member))
                embed.addField("**Admin Commands**", `
assign role @user - Gives a user a certain role.
remove role @user - Removes a role from a certain user.
pepega @user - Identifies a certain user as a pepega.
poll options Question - Holds a poll in the same channel.
saltyteemo - Begins Salty Teemo Night.
open - Allows bets to be placed.
close - Stops bets from being placed.
redwin / bluewin - Awards bets to respective winners and resets all betting.
give @user amt - Gives a user the specified amount.
endnight - Stop Salty Teemo Night & Reset Bets`);
            return message.channel.send(embed);
        case "endnight":
        case "end":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            if (!active)
                return message.reply("The night has not yet begun!");
            active = false;
            takebets = false;
            red = {};
            blue = {};
            return message.channel.send("Salty teemo night is over!");
        case "resetteemo":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            temptotals = {};
            store.updateItem('totals', temptotals);
            return;
        case "quit":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            message.reply("Shutting down");
            client.destroy();
            return;
        case "ub":
        case "ultimatebravery":
            var embed = new Discord.RichEmbed()
                .setColor(set.defaultcolor)
                .setTitle("Ultimate Bravery")
                .setDescription("[Click Here](https://ultimate-bravery.net/Dataset)")
            return message.reply(embed);
        case "random":
            var champ = champs[Math.floor(Math.random() * champs.length)];
            var embed = new Discord.RichEmbed()
                .setColor(set.defaultcolor)
                .setTitle("Random Champion")
                .setDescription("You should play " + champ)
                .setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + patch + '/img/champion/' + champ + '.png');
            return message.reply(embed);
        case "op.gg":
            var embed = new Discord.RichEmbed()
                .setColor(set.defaultcolor)
                .setTitle("OP.GG Statistics")
                .setDescription("[" + args[0] + "](https://na.op.gg/summoner/userName=" + args[0] + ")");
            return message.channel.send(embed);
        case "pepega":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            if (!message.mentions.members.length == 1)
                return message.reply("Invalid mentions");
            if (message.mentions.members.first().roles.some(r => r.name === "pepega"))
                return message.reply("That user has already been identified as a pepega!");
            var role = message.guild.roles.find(r => r.name === "pepega")
            message.mentions.members.first().addRole(role).catch(console.log);
            return message.channel.send("<@" + message.mentions.members.first().id + "> is super <append pepega here>");
        case "assign":
        case "giverole":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            if (!message.mentions.members.first())
                return message.reply("Invalid mentions");
            args.shift();
            var rname = args.join(" ");
            if (message.mentions.members.first().roles.some(r => r.name === rname))
                return message.reply("That user already has that role!");
            var role = message.guild.roles.find(r => r.name === rname)
            message.mentions.members.first().addRole(role).catch(console.log);
            return message.channel.send("<@" + message.mentions.members.first().id + "> has been given the role.");
        case "remove":
        case "removerole":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            if (!message.mentions.members.first())
                return message.reply("Invalid mentions");
            args.shift();
            var rname = args.join(" ");
            if (!message.mentions.members.first().roles.some(r => r.name === rname))
                return message.reply("That user doesn't have that role!");
            var role = message.guild.roles.find(r => r.name === rname)
            message.mentions.members.first().removeRole(role).catch(console.log);
            return message.channel.send("<@" + message.mentions.members.first().id + "> has had the role removed.");
        case "daily":
            var tempdaily = await getDaily();
            var temptotals = await getTotals();
            if (!(message.author.id in tempdaily))
                tempdaily[message.author.id] = new Date(2000);
            var long = Math.abs(((new Date()).getTime() - (new Date(tempdaily[message.author.id])).getTime()) / 86400000);
            if (long < 1)
                return message.reply("You've already used that today!");
            temptotals[message.author.id] += set.daily;
            tempdaily[message.author.id] = new Date();
            store.updateItem('daily', tempdaily);
            store.updateItem('totals', temptotals);
            return message.reply("You have received your daily reward!");
        case "poll":
            if (!isAdmin(message.member))
                return message.reply("Only an admin can do that!");
            var options = args[0].split(",");
            if (options.length < 2)
                return message.reply("Invalid Options");
            var question = args.shift();
            question = args.join(" ");
            var ostr = "";
            //var alp=["A: ","B: ","C: ","D: ","E: ","F: "];
            var alp = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫"]
            for (var i = 0; i < options.length; i++) {
                ostr += (alp[i] + " " + options[i].replace(/_/g, " ") + "\n\n");
            }
            question = "**" + question + "**";
            var embed = new Discord.RichEmbed()
                .setTitle("Club Poll")
                .setDescription(question + "\n\n" + ostr)
                .setColor(set.defaultcolor)
                .setFooter("Started by " + message.member.displayName);
            message.channel.send(embed).then(async (smsg) => {
                var emote_table = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫"]
                for (var i = 0; i < options.length; i++)
                    await smsg.react(emote_table[i]);
            });
            message.delete();
            return;
        case "highlow":
        case "hl":
            if (isNaN(args[0]))
                return message.reply("Invalid Amount");
            var bet = Math.floor(parseInt(args[0]));
            if (bet <= 0)
                return message.reply("Invalid Amount");
            if (bet * 2 > Number.MAX_SAFE_INTEGER)
                return message.reply("Bet too big.");
            awardCash(message.author.id, -1 * bet);
            const filter2 = (reaction, user) => {
                return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
            };
            var first = Math.floor(Math.random() * 81) + 10 //Range: 10-90
            var second = first;
            while (second == first)
                second = Math.floor(Math.random() * 100) + 1;
            var embed = new Discord.RichEmbed()
                .setTitle("Higher / Lower Game")
                .setColor(set.defaultcolor)
                .setDescription("Number: **" + first + "**\n\nDo you think that the number will be higher or lower?\n(1 Minute To Answer)");
            message.reply(embed).then(async (msg) => {
                await msg.react('👍');
                await msg.react('👎');

                msg.awaitReactions(filter2, { max: 1, time: 60000, errors: ['time'] })
                    .then(async collected => {
                        const reaction = collected.first();
                        var won = false
                        if (reaction.emoji.name === '👍' && second > first) {
                            won = true;
                        } else if (reaction.emoji.name === '👎' && second < first) {
                            won = true;
                        }
                        if (won) {
                            embed.setDescription("Number 1: **" + first + "**\nNumber 2: **" + second + "**\n\nYou guessed correctly! Congratulations!");
                            await awardCash(message.author.id, 2 * bet);
                        } else {
                            embed.setDescription("Number 1: **" + first + "**\nNumber 2: **" + second + "**\n\nYou guessed incorrectly.");
                        }
                        await msg.edit(embed);
                        await msg.clearReactions();
                    })
                    .catch(async collected => {
                        embed.setDescription("You took too long!");
                        await msg.edit(embed);
                        await msg.clearReactions();
                    });

            });
            return;
        case "giveaway": // {ppl,cash,amt,mins}
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
            if (config["amt"] > set.maxgive)
                return message.reply("You cannot give that much cash away!");
            const filter3 = (reaction, user) => {
                return ['😄'].includes(reaction.emoji.name);
            };
            var embed = new Discord.RichEmbed()
                .setTitle("Giveaway!")
                .setColor(set.defaultcolor)
                .setFooter("Started by " + message.member.displayName)
                .setDescription("React to enter!");
            message.channel.send(embed).then(async (msg) => {
                message.delete();
                await msg.react('😄');

                msg.awaitReactions(filter3, { time: 6000 * config["mins"] })
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
                                        await awardCash(randid, config["amt"]);
                                    try {
                                        var user = await client.fetchUser(randid);
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
                                        var user = await client.fetchUser(winarr[i]);
                                        if (config["amt"] > 0)
                                            await awardCash(winarr[i], config["amt"]);
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
        case "patchnotes":
            var patchspl = patch.split(".");
            var embed = new Discord.RichEmbed()
                .setTitle("Patch Notes for " + patchspl[0] + "." + patchspl[1])
                .setDescription("[Click Here](https://na.leagueoflegends.com/en/news/game-updates/patch/patch-" + patchspl[0] + patchspl[1] + "-notes)")
                .setColor(set.defaultcolor);
            return message.channel.send(embed);
        case "flip":
            var txt = (Math.random() <= .5) ? "Heads" : "Tails";
            var embed = new Discord.RichEmbed()
                .setTitle("Coin Flip")
                .setDescription(txt)
                .setColor(set.defaultcolor);
            return message.reply(embed);
        case "blackjack": //args=[amt]
            if (blackjack.hasOwnProperty(message.author.id))
                return message.reply("You already have an ongoing game!");
            if (!(args.length == 1))
                return message.reply("Invalid bet!");
            if (isNaN(args[0]))
                return message.reply("Invalid bet!");
            var bet = parseInt(args[0]);
            if (temptotals[message.author.id] < bet)
                return message.reply("You don't have enough to make that bet!");
            if (bet <= 0)
                return message.reply("Invalid bet!");
            awardCash(message.author.id, -1 * bet);
            blackjack[message.author.id] = [Math.floor(Math.random() * 10) + 1, false, Math.floor(Math.random() * 10) + 1, bet, message.member.displayName];
            return message.channel.send(getBJEmbed(message.author.id));
        case "hit"://[id]=[pcamt,pcstay,useramt,userbet,userdisplayname]
            var id = message.author.id;
            if (!blackjack.hasOwnProperty(id))
                return message.reply("You don't have an active blackjack bet!");
            blackjack[id][2] += Math.floor(Math.random() * 10) + 1; //random betweeen 1 and 10
            if (blackjack[id][2] > 21) {
                var embed = getBJEmbedFinal(id)
                embed.addField("Bust!", "You lost!");
                delete blackjack[id];
                return message.channel.send(embed);

            }
            return message.channel.send(getBJEmbed(id));
        case "stay":
            var id = message.author.id;
            if (!blackjack.hasOwnProperty(id))
                return message.reply("You don't have an active blackjack bet!");
            while (!blackjack[id][1]) {
                if (riskAssess(21 - blackjack[id][0]) > Math.random() && blackjack[id][0] > 17) { //Too risky! Also dealer must bet to 17.
                    blackjack[id][1] = true;
                } else {
                    blackjack[id][0] += Math.floor(Math.random() * 10) + 1;
                    if (blackjack[id][0] > 21) {
                        var embed = getBJEmbedFinal(id)
                        embed.addField("Dealer Bust!", "You won!");
                        awardCash(id, blackjack[id][3] * 2);
                        delete blackjack[id];
                        return message.channel.send(embed);
                    }
                }
            }
            if (blackjack[id][0] > blackjack[id][2]) {
                var embed = getBJEmbedFinal(id);
                embed.addField("You lost!", "Better luck next time.");
                delete blackjack[id];
                return message.channel.send(embed);
            } else if (blackjack[id][0] < blackjack[id][2]) {
                var embed = getBJEmbedFinal(id);
                embed.addField("You won!", "Congrats");
                awardCash(id, blackjack[id][3] * 2);
                delete blackjack[id];
                return message.channel.send(embed);
            } else {
                var embed = getBJEmbedFinal(id);
                embed.addField("Push!");
                awardCash(id, blackjack[id][3]);
                delete blackjack[id];
                return message.channel.send(embed);
            }
    }
});

client.login(set.token);
