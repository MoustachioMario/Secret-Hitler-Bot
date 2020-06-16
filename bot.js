const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = '/';
client.on('ready', () => {
    console.log('BetrayalBot is up and running! Updates successfully installed.');
});

var Game = {}
Game.state = {
    Ids : [],
    players : [],
    playerNicks : [],
    votes   : [],
    gameInProgress : false,
}

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    if (message.guild == null) return message.author.send("I'm sorry, but I cannot read Direct Messages.");
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    if (command == 'ping'){
        message.channel.send("pong");
    }
    else if (command == "join"){
        if (Game.state.gameInProgress) return message.channel.send("It's too late now. The game has already started.");
        var joiner = message.member.user.tag;
        for (i = 0; i < Game.state.players.length;i++){
            //var joiner = message.author.id;
            if(Game.state.players[i] == joiner){
                return message.reply("you are already in this game.");
            }
        }
        Game.state.Ids.push(message.author.id);
        Game.state.players.push(joiner);
        Game.state.votes.push([Game.state.players[Game.state.players.length-1],"no one"])
        message.channel.send("You are now in the game.");
    }
    else if (command == "vote"){
        const num = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 unvote";
        if (num.indexOf(args[0]) == -1){
            for (play = 1;play < Game.state.players.length+1;play++){
                message.channel.send("[" + play + "] " + message.guild.members.find("id", Game.state.Ids[play-1]).displayName);
            }
            return message.channel.send("Proper usage: /vote [num]");
        }
        else {
            if (args[0] > Game.state.votes.length || args[0] < 1) return message.channel.send("There is no player at index " + args[0]);
            for (i = 0;i<Game.state.votes.length;i++){
                if (Game.state.votes[i][0] == message.member.user.tag){
                    if (args[0] == "unvote"){
                        Game.state.votes[i][1] = "no one";
                        return message.channel.send("You are not voting no one.");
                    }
                    Game.state.votes[i][1] = Game.state.Ids[args[0]-1];
                    return message.channel.send("You have voted against: " + message.guild.members.find("id", Game.state.Ids[args[0]-1]).displayName);
                }
            }
            message.channel.send("You are not in this game, or you are dead.");
        }
    }
    else if (command == "out" || command == "quit"){
        if (Game.state.gameInProgress) return message.channel.send("It's too late now. The game has already started.");
        for (i = 0; i < Game.state.players.length;i++){
            if (Game.state.players[i] == message.member.user.tag){
                removePlayer(i+1);
                message.channel.send("You have left the game.");
                break;
            }
        }
    }
    //COHOST OR MASTER ROLE REQUIRED PAST THIS POINT
    else if (!message.member.roles.has("647983854266613761")){
        message.channel.send("You might have been try to use a restricted command, or the command you were trying to use does not exist!");
    }
    else if (command == "votecount"){
        if (args[0] !== "confirm") return message.channel.send("Proper usage: /votecount confirm");
        message.channel.send("Current Votes:");
        for (i=0;i<Game.state.votes.length;i++){
            if (Game.state.votes[i][1] == "no one"){
                message.channel.send(message.guild.members.find("id", Game.state.Ids[i]).displayName + " **->** no one");
            }
            else {
                message.channel.send(message.guild.members.find("id", Game.state.Ids[i]).displayName + " **->** " + message.guild.members.find("id", Game.state.votes[i][1]).displayName);
            }
        }
    }
    else if (command == "kill" || command == "eliminate"){
        if (args[0] > Game.state.votes.length || args[0] < 1) return message.channel.send("There is no player at index " + args[0]);
        const num = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21";
        if (num.indexOf(args[0]) == -1){
            for (play = 1;play < Game.state.players.length+1;play++){
                message.channel.send("[" + play + "] " + message.guild.members.find("id", Game.state.Ids[play-1]).displayName);
            }
            return message.channel.send("Proper usage: /kill [num]");
        }
        else {
            message.channel.send("You have eliminated " + message.guild.members.find("id", Game.state.Ids[args[0]-1]).displayName + " from the game.");
            removePlayer(args[0]);
        }
    }
    else if (command == "revive"){
        if (!message.mentions.users.size) return message.channel.send("This command requires you to mention the player you want to revive.");
        const reborn = message.mentions.members.first();
        for (i = 0;i<Game.state.Ids.length;i++){
            if (Game.state.Ids[i] == reborn.id) return message.channel.send("That player is already in the game! You can't add them back in.");
        }
        Game.state.Ids.push(reborn.id);
        Game.state.players.push(message.guild.members.find("id", reborn.id).user.tag);
        Game.state.votes.push([Game.state.players[Game.state.players.length-1],"no one"])
        message.channel.send(message.guild.members.find("id", reborn.id).displayName + " is back in the game.");
    }
    else if (command == "start"){
        if (!Game.state.gameInProgress){
            message.channel.send("Get ready to backstab your allies, cause Betrayal has officially started!");
            Game.state.gameInProgress = true;
            for (i = 0;i<Game.state.Ids.length;i++){
                createConfessional(message.guild.members.find("id", Game.state.Ids[i]).displayName,message.guild);
            }
        }
        else {
            message.channel.send("Someone already started the game :/");
        }
    }
    else {
        message.channel.send("The command you were trying to use does not exist!");
    }
});

//636693925918408742 Co-Host
//490965300620165120 Master

function removePlayer(num){
    var index = num - 1;
    Game.state.Ids.splice(index, 1);
    Game.state.players.splice(index, 1);
    Game.state.votes.splice(index, 1);
    Game.state.playerNicks.splice(index, 1);
}

function createConfessional(player, server){
    var name = player + "-confessional";

    server.createChannel("text","hiya",1);
}

//client.login(process.env.token);
