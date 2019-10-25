const Discord = require('Discord.js');
const set = require("./config.json");
module.exports.set = set;
const getDir = require('require-dir');

const client = new Discord.Client();
module.exports.client = client;

var active = false; // is salty teemo night active
module.exports.active = active;
var chan; // what channel is it occuring in?
module.exports.chan = chan;
var takebets = false; // take bets?
module.exports.takebets = takebets;

//datastore stuff

const store = require('node-persist');
async function setup() {
    await store.init();
}
setup();
module.exports.store = store;

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
module.exports.awardCash = awardCash;

async function getDaily() {
    var keys = await store.keys()
    if (keys.includes('daily')) {
        return await store.getItem('daily');
    } else {
        return {};
    }
}
module.exports.getDaily = getDaily;

async function getExp() {
    var keys = await store.keys()
    if (keys.includes('exp')) {
        return await store.getItem('exp');
    } else {
        return {};
    }
}

global.blue = {}; //blue[id]=bet
global.red = {}; //red[id]=bet

function clearBets() {
    global.red = {};
    global.blue = {};
}
module.exports.clearBets = clearBets;

const req = require("request-promise");
global.champs = []

var patch = "9.20.1";
module.exports.patch = patch;
function updateChamps() {
    global.champs = [];
    try {
        var ver;
        req('https://ddragon.leagueoflegends.com/api/versions.json').then(function (body) {
            ver = JSON.parse(body);
            patch = ver[0];
            req('http://ddragon.leagueoflegends.com/cdn/' + ver[0] + '/data/en_US/champion.json').then(function (body) {
                var stuff = JSON.parse(body);
                for (var name in stuff["data"])
                    global.champs.push(name);
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
    if (id in global.blue || id in global.red)
        return true;
    return false;
}
module.exports.hasBet = hasBet;

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
module.exports.sortBets = sortBets;

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
module.exports.sortExp = sortExp;

//exp
function exp_curve(x) {
    return Math.floor(7 * Math.sqrt(x) + 20);
}
module.exports.exp_curve = exp_curve;

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
module.exports.exper = exper;

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
module.exports.blackjack = blackjack;
function riskAssess(amt) {//This is the mathematical function to determine if the computer should hit or stay.
    return .1 * (-amt - 10) + 2; //can be negative. if negative, safe to bet
}
module.exports.riskAssess = riskAssess;

function getBJEmbed(id) {
    var embed = new Discord.RichEmbed()
        .setTitle("Blackjack with " + blackjack[id][4])
        .setDescription("Your Amount: " + blackjack[id][2])
        .setColor(set.defaultcolor);
    return embed;
}
module.exports.getBJEmbed = getBJEmbed;

function getBJEmbedFinal(id) {
    var embed = new Discord.RichEmbed()
        .setTitle("Blackjack with " + blackjack[id][4])
        .setDescription("Dealer: " + blackjack[id][0] + "\n\nYou: " + blackjack[id][2])
        .setColor(set.defaultcolor);
    return embed;
}
module.exports.getBJEmbedFinal = getBJEmbedFinal;

//Command Setup
var commands = {};
var adminNum = 0;
var regNum = 0;
var helpRegDesc = "";
var helpRegCommands = "";
var helpAdminDesc = "";
var helpAdminCommands = "";

function indexCommands() {
    var dir = getDir('./commands');
    for (var com in dir) {
        for (var i = 0; i < dir[com].alias.length; i++) {
            commands[dir[com].alias[i]] = { func: dir[com].command, admin: dir[com].isAdmin };
        }
        if (dir[com].isAdmin) {
            if (!(set.helpexemptions.includes(dir[com].alias[0]))) { //This exempts resetteemo from the help command. It isn't meant to be widely known.
                if (adminNum % 2 == 1) {
                    helpAdminDesc += "**" + dir[com].helpText + "**\n";
                    helpAdminCommands += "**" + dir[com].alias[0] + "**\n";
                } else {
                    helpAdminDesc += dir[com].helpText + "\n";
                    helpAdminCommands += dir[com].alias[0] + "\n";
                }
                adminNum++;
            }
        } else {
            if (regNum % 2 == 0) {
                helpRegDesc += "**" + dir[com].helpText + "**\n";
                helpRegCommands += "**" + dir[com].alias[0] + "**\n";
            } else {
                helpRegDesc += dir[com].helpText + "\n";
                helpRegCommands += dir[com].alias[0] + "\n";
            }
            regNum++;
        }
    }
}
indexCommands();

client.on("ready", () => {
    console.log("GrizzBot Started");
    client.user.setActivity(set.prefix + "help", { type: 'LISTENING' })
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
    // When the time comes!
    if (commands.hasOwnProperty(command)) {
        if (commands[command].admin && !isAdmin(message.member))
            return message.reply("Only an admin can do that!");
        commands[command].func(message, args, temptotals, exp);
    } else if (command === "help") {
        var embed = new Discord.RichEmbed()
            .setColor(set.defaultcolor)
            .setTitle("**Grizzbot Commands**")
            .addField("User Commands", "---")
            .addField("Command", helpRegCommands, true)
            .addField("Description", helpRegDesc, true);
        if (isAdmin(message.member)) {
            embed.addBlankField();
            embed.addField("Admin Commands", "---");
            embed.addField("Command", helpAdminCommands, true);
            embed.addField("Description", helpAdminDesc, true);
        }
        return message.channel.send(embed);
    }

});

client.login(set.token);
