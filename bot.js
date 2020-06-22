const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('sync-request')

const prefixes = ["sh.","/"]

var DBHeader = { "Content-Type": "application/json; charset=utf-8", "x-apikey": process.env.APIKEY }

client.on('message', message => {
let prefix = false;
    for(const thisPrefix of prefixes) {
      if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;
    }
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    try {
        if (command == "ping"){
            message.channel.send("pongalongadingdong V2")
        }
        else if (command == "get"){
            message.channel.send(getEvent());
        }
    }
    catch (error) {
        client.users.cache.get('642172417417936925').send("**Full Error:** " + err.stack);
    }
});
    //try{
    //var channelIndex = isChannelOpen(message.channel.id)
    //if (channelIndex != -1){
      //var signup = Game.signups[channelIndex][0];
      //var gameInfo = Game.signups[channelIndex][1];
    //}
    /*
    if (prefix == '/'){
      if (command == "nominate"){
        for (var i in gameInfo.players){
          if (gameInfo.players[i].id == message.author.id){
          	if (gameInfo.players[i].office != "President"){
              return message.author.send("You are not president.")
            }
          }
        }
        for (var i in gameInfo.players){
          if (gameInfo.players[i].id == message.mentions.members.first().id){
            if (gameInfo.players[i].office == "Chancellor"){
              return message.channel.send("You already nominated someone.")
            }
          }
        }
        if (args[0] == null){
          return message.channel.send("You didn't say who you were nominating.");
        }
        nominateChancellor(message,message.mentions.members.first().id);
      }
      else if (command == "shoot" || command == "execute"){
        if (Game.signups[channelIndex][1].fascist == 4 || Game.signups[channelIndex][1].fascist == 5){
          if (Game.signups[channelIndex][1].inOffice.length == 1){
            for (var i in Game.signups[channelIndex][1].players){
              if (Game.signups[channelIndex][1].players[i].id == message.author.id){
                if (Game.signups[channelIndex][1].players[i].office == "President"){
                  Game.signups[channelIndex][1].players[playerPos(message.mentions.members.first().id,channelIndex)].alive = false;
                  Game.signups[channelIndex][1].inOffice = [];
                  message.channel.send("The president has executed "+message.mentions.members.first()+".")
                  if (Game.signups[channelIndex][1].players[playerPos(message.mentions.members.first().id,channelIndex)].secretRole == "Hitler"){
                    message.channel.send("The Liberals have executed Hitler.")
                    return endGame(channelIndex)
                  }
                  else {
                    message.channel.send("They were not hitler.")
                    nextRound(channelIndex);
                  }
                }
                return message.channel.send("You are not the President.")
              }
            }
          }
        }
        return message.channel.send("The President does not have enough power to execute anyone.")
      }
      else if (command == "inv" || command == "investigate"){
        if (Game.signups[channelIndex][1].fascist == 2 || (Game.signups[channelIndex][1].fascist == 1 && Game.signups[channelIndex][1].players.length > 8)){
          if (Game.signups[channelIndex][1].inOffice.length == 1){
            for (var i in Game.signups[channelIndex][1].players){
              if (Game.signups[channelIndex][1].players[i].id == message.author.id){
                if (Game.signups[channelIndex][1].players[i].office == "President"){
                  Game.signups[channelIndex][1].inOffice = [];
                  message.channel.send("The president has investigated "+message.mentions.members.first()+".")
                  client.users.cache.get(Game.signups[channelIndex][1].players[i].id).send("Your target\'s party membership is " + Game.signups[channelIndex][1].players[playerPos(message.mentions.members.first().id,channelIndex)].partyMembership)
                  nextRound(channelIndex)
                }
                return message.channel.send("You are not the President.")
              }
            }
          }
        }
        return message.channel.send("The President does not have enough power to investigate anyone.")
      }
      else if (message.guild === null){
        if (command == "info"){
          message.author.send(pendingVotes(message.author.id))//+"\nTo vote DM me /vote [Game #] [ja/nein]\nTo discard do /discard [Game #] [# next to card]")
        }
        else if (command == "donate"){
          message.channel.send("Please Consider Donating!\nhttps://www.patreon.com/MoustachioMario")
        }
        else if (command == "vote"){
          if (args[0] >= Game.signups.length || args[0] == null){
            return message.channel.send("That game does not exist")
          }
          if (args[1] != "nein" && args[1] != "ja"){
            return message.channel.send("Acceptable votes are: \"ja\" and \"nein\"")
          }
          if (Game.signups[args[0]][1].players[playerPos(message.author.id,args[0])].vote == "Maybe"){
            message.channel.send("You have voted " + args[1] + ".")
            Game.signups[args[0]][1].players[playerPos(message.author.id,args[0])].vote = args[1]
            everyoneVoted(args[0])
          }
          else {
            message.channel.send("You already voted!")
          }
        }
        else if (command == "discard"){
          if (args[0] >= Game.signups.length || args[0] == null){
            return message.channel.send("That game does not exist")
          }
          for (var i in Game.signups[args[0]][1].players){
            if (Game.signups[args[0]][1].players[i].id == message.author.id){
              if (Game.signups[args[0]][1].players[i].office != "President" && Game.signups[args[0]][1].inOffice.length == 3){
                return message.channel.send("YOU ARE NOT PRESIDENT");
              }
              else if (Game.signups[args[0]][1].players[i].office != "Chancellor" && Game.signups[args[0]][1].inOffice.length == 2){
                return message.channel.send("YOU ARE NOT CHANCELLOR");
              }
              else if (Game.signups[args[0]][1].inOffice.length == 1){
                return message.channel.send("There is nothing for you to do here.")
              }
            }
          }
          var discarding = "Error"
          if (args[1] == "L" || args[1] == "Liberal" || args[0] == "l"){
            discarding = "Liberal"
          }
          else if (args[1] == "F" || args[1] == "Fascist" || args[0] == "f"){
            discarding = "Fascist"
          }
          else{
            return message.channel.send("Acceptable Choices are: Liberal, Fascist, L or F")
          }
          
          var discardingComplete = false;
          for (var i in Game.signups[args[0]][1].inOffice){
            if (Game.signups[args[0]][1].inOffice[i] == discarding && discardingComplete == false){
              message.channel.send("You have discarded a " + Game.signups[args[0]][1].inOffice[i] + " policy");
              discardingComplete = true;
              Game.signups[args[0]][1].discarded.push(Game.signups[args[0]][1].inOffice[i])
              Game.signups[args[0]][1].inOffice.splice(i,1)
            }
          }
          if (discardingComplete == false){
              message.channel.send("You have discarded a " + Game.signups[args[0]][1].inOffice[0] + " policy");
              discardingComplete = true;
              Game.signups[args[0]][1].discarded.push(Game.signups[args[0]][1].inOffice[0])
              Game.signups[args[0]][1].inOffice.splice(0,1)
          }
          
          if (Game.signups[args[0]][1].inOffice.length == 2){
            for (var i = 0; i<Game.signups[args[0]][1].players.length;i++){
              if (Game.signups[args[0]][1].players[i].office == "Chancellor"){
                  client.users.cache.get(Game.signups[args[0]][1].players[i].id).send(new Discord.MessageEmbed().setTitle("Game " + args[0]).addField("Please discard a card","1: "+Game.signups[args[0]][1].inOffice[0]+"\n2: "+Game.signups[args[0]][1].inOffice[1]))
              }
            }
          }
          if (Game.signups[args[0]][1].inOffice.length == 1){
            if (Game.signups[args[0]][1].inOffice[0] == "Liberal"){
              passedLiberal(args[0])
            }
            else {
              passedFascist(args[0])
            }
          }
        }
      }
    }
    if (prefix != "sh."){}
    else if (command == "help"){
      var embed = new Discord.MessageEmbed();
      if (args[0] == null){
        embed.setTitle("Help")
        embed.addField("**Moderator Commands**","`sh.help moderator`",true)
        embed.addField("**Player Commands**","`sh.help player`",true)
      }
      else if (args[0] == "player"){
        embed.setTitle("Player Commands");
        embed.addField("**Voting**","[DM] `/vote [Game Number] [Ja/Nein]`")
        embed.addField("**Discarding**","[DM] `/discard [Game Number] [Liberal/Fascist]`")
        embed.addField("**Nominating**","`/nominate @mention`",true)
        embed.addField("**Executing**","`/execute @mention`",true)
        embed.addField("**Investigating**","`/investigate @mention`",true)
      }
      
      embed.setFooter("Made by MoustachioMario#2067")
      message.channel.send(embed)
    }
    else if (command == "break"){
      if (message.author.id == '642172417417936925'){
        Game.signups[10000000][1]
        //breakBot();
      }
    }
    else if (command == "allow"){
      if (!requiredRoles(message)){
        return message.channel.send("**ERROR**: Missing Permissions")
      }
      if (!args[0]) return;

      if (args[0].startsWith('<@') && args[0].endsWith('>')) {
        args[0] = args[0].slice(2, -1);
      
        if (args[0].startsWith('&')) {
          args[0] = args[0].slice(1);
        }
      }
      for (var i in Game.trustedRoles){
        if (Game.trustedRoles[i].id == message.guild.id){
          message.channel.send("Added")
          return Game.trustedRoles[i].trustedRoles.push(args[0])
          //return save();
        }
      }
      Game.trustedRoles.push(new Server(message.guild.id, args[0]))
    }
    else if (command == "donate"){
      message.channel.send("Please Consider Donating!\nhttps://www.patreon.com/MoustachioMario")
    }
    else if (message.author.id == 642172417417936925 && command == "bot"){
            message.channel.send("Attempting To Save Changes...")
            client.user.setStatus('dnd');
            setTimeout(function() {client.users.members.id},1000)
    }
    else if (message.guild === null){
      message.author.send(pendingVotes(message.author.id))
    }
    else if (command == "signups"){
      if (!requiredRoles(message)){
        return ;//message.channel.send("You do not have permission to do this.")
      }
      if (channelIndex != -1 && Game.signups[channelIndex][0][4] == "IN GAME"){
        return;
      }
      if (args[0] == null){
        return message.channel.send("You failed to provide arguments!\nArguements are: open, close and delete!")
      }
      if (args[0] == "open"){
        if (channelIndex == -1){
          //[[Channel ID  |  MESSAGE ID  |  PLAYERS  |  BACKUPS  | SINGUPS OPEN? | MAX LENGTH | GUILD] [GAME INFO] [CARDS]]
          Game.signups.push([[message.channel.id,null,[],[],true,-1,message.guild.id],[]])
          message.channel.send("```ini\nLOADING...\n```").then(msg => {
            Game.signups[Game.signups.length-1][0][1] = msg.id
            updatePlayerlist(message,Game.signups.length-1)
            msg.pin();
          })
          message.channel.send("This channel is now open to signups")
        }
        else {
          if (Game.signups[channelIndex][0][4]){
            //return message.author.send("Signups on this channel are already open!")
          }
          Game.signups[channelIndex][0][4] = true;
          message.channel.send("The signups on this channel have been reopened!")
        }
      }
      else if (args[0] == "close"){
        if (channelIndex == -1){
          message.author.send("The signups you were trying to close does not exist!")
        }
        Game.signups[channelIndex][0][4] = false;
        message.channel.send("The signups in this channel are now closed.")
      }
      else if (args[0] == "delete"){
        if (message.author.id != 387583392759283713){
          //return message.reply("You do not have permission to do this.")
        }
        if (channelIndex == -1){
          return message.channel.send("Signups in this channel have not been created yet. Try doing /signups open to create some.")
        }
        Game.signups.splice(channelIndex,1)
        message.channel.send("The signups on this channel have been deleted.")
      }
      }
    else if (command == "mute"){
        if (!requiredRoles(message)){
          return;
        }
        message.guild.channels.forEach(channel => {
        channel.overwritePermissions(channel.guild.defaultRole, { MENTION_EVERYONE: false });      
        })
    }
    else if (command == "start"){
      if (!requiredRoles(message)){
        return;
      }
      //COMMENT THIS OUT
      else if (channelIndex != -1){
        for (i in Game.signups[channelIndex][0][2]){
          message.guild.members.get(Game.signups[channelIndex][0][2][i]).addRole(message.guild.roles.get('671874921898442762'));
        }
        message.channel.send("Players now have the [Alive Line Special] role!")
      }
      if (Game.signups[channelIndex][0][2].length < 5){
        return message.channel.send("**ERROR** Too Few Players")
      }
      else if (Game.signups[channelIndex][0][2].length > 10){
        return message.channel.send("**ERROR** Too many Players")
      }

      setUpGame(message,channelIndex)
      Game.signups[channelIndex][0][4] = "IN GAME"
    }
    else if (command == "votecount" || command == "vc"){
      var mess = "```\n"
      for (var i in Game.signups[channelIndex][1].players){
        if (Game.signups[channelIndex][1].players[i].alive == true){
          if (Game.signups[channelIndex][1].players[i].vote == "Maybe")
          mess += client.users.cache.get(Game.signups[channelIndex][1].players[i].id).tag + " has not voted yet.\n"
        }
      else {
          mess += client.users.cache.get(Game.signups[channelIndex][1].players[i].id).tag + " is dead.\n"
        }
        if (Game.signups[channelIndex][1].players[i].office == "President" && Game.signups[channelIndex][1].inOffice.length == 3){
          mess += client.users.cache.get(Game.signups[channelIndex][1].players[i].id).tag + " needs to discard a policy.\n"
        }
        else if (Game.signups[channelIndex][1].players[i].office == "Chancellor" && Game.signups[channelIndex][1].inOffice.length == 2){
          mess += client.users.cache.get(Game.signups[channelIndex][1].players[i].id).tag + " needs to discard a policy.\n"
          }
        }
        message.channel.send(mess + "```")
      }
    else if (channelIndex == -1){
      if (command == "in" || command == "out" || command == "backup" || command == "unbackup") {}
      //message.channel.send("This channel not is accepting signups!")
    }
    else if (Game.signups[channelIndex][0][4] == false || Game.signups[channelIndex][0][4] == "IN GAME"){
      if (command == "in" || command == "out" || command == "backup" || command == "unbackup"){}
        //message.channel.send("The signups in this channel are closed.")
    }
    else {
      if (command == "in"){
        for (var x in Game.signups[channelIndex][0][2]){
          if (Game.signups[channelIndex][0][2][x] == message.author.id){
            return message.author.send("You have already joined that signup list.")
          }
        }
        message.react("✅")
        Game.signups[channelIndex][0][2].push(message.author.id)
        updatePlayerlist(message,channelIndex)
      }
      else if (command == "out"){
        for (var i in Game.signups[channelIndex][0][2]){
          if (Game.signups[channelIndex][0][2][i] == message.author.id){
            message.react("✅")
            Game.signups[channelIndex][0][2].splice(i,1)
            return updatePlayerlist(message,channelIndex)
          }
          }
        //message.channel.send("You were not in the game to begin with, " + message.author)
      }
      else if (command == "backup"){
        for (var x in Game.signups[channelIndex][0][3]){
          if (Game.signups[channelIndex][0][3][x] == message.author.id){
            //return message.author.send("You are already a backup.")
          }
        }
        //message.author.send("You are now a backup.")
        message.react("✅")
        Game.signups[channelIndex][0][3].push(message.author.id)
        updatePlayerlist(message,channelIndex)
      }
      else if (command == "unbackup"){
        for (var i in Game.signups[channelIndex][0][3]){
          if (Game.signups[channelIndex][0][3][i] == message.author.id){
            //message.author.send("you have been removed from backups.")
            message.react("✅")
            Game.signups[channelIndex][0][3].splice(i,1)
            return updatePlayerlist(message,channelIndex)
          }
        }
        //message.channel.send("You were never a backup to begin with, " + message.author)
      }
      else if (command == "replace"){
        if (!requiredRoles(message)){
          return;
        }
        if (args[0] == null){
          return message.author.send("Do /replace [the number next to the player]")
        }
        else {
          Game.signups[channelIndex][0][2][args[0]] = message.mentions.members.first().id
          message.mentions.members.first().send("You are " + Game.signups[channelIndex][1][args[0]][1])
          message.react("✅")
          updatePlayerlist(message,channelIndex)
        }
      }
      else if (command == "remove"){
        if (!requiredRoles(message)){
          return;
        }
        if (args[0] == null){
          return message.author.send("Do /remove [the number next to the player]")
        }
        else {
          Game.signups[channelIndex][0][2].splice(args[0]-1,1)
          message.react("✅")
          updatePlayerlist(message,channelIndex)
        }
      }
      //else if (command == "forceadd"){
        //if (!message.author.id == 642172417417936925){
          //return;
        //}
        //for (var x in Game.signups[channelIndex][2]){
          //if (Game.signups[channelIndex][2][x] == message.mentions.users.first().id){
            //return;
          //}
        //}
        //message.react("✅")
        //Game.signups[channelIndex][2].push(message.mentions.users.first().id)
        //updatePlayerlist(message,channelIndex)
      //}

      //else if (command == "reshuffle"){
        //shuffleDeck(channelIndex);
      //}
    }
    //save();
  }
  catch (err) {
    //message.channel.send("**ERROR**: " + err + "\nMoustachioMario has been notified.")
    client.users.cache.get('642172417417936925').send("**Full Error:** " + err.stack);
  }
});
*/
client.login(process.env.TOKEN);

/*
function isChannelOpen(channel){
  for (var i in Game.signups){
    if (channel == Game.signups[i][0][0]){
      return i;
    }
  }
  return -1;
}

function save() {
  var json = JSON.stringify(Game);

  fs.writeFile("database.json", json, function(err) {
    if (err) throw err;
  });
  var text = fs.readFileSync("database.json", "utf8");

}

function load() {
  var text = fs.readFileSync("database.json", "utf8");
  Game = JSON.parse(text);
}
function updatePlayerlist(message, index){
  message.channel.messages.fetch(Game.signups[index][0][1]).then(msg => {
      var update = "```ini\nPLAYERLIST:\n"
      if (Game.signups[index][0][5] == -1){
          for (var i in Game.signups[index][0][2]){
            update += "["+(i*1+1)+"] " + message.member.guild.members.cache.find(s => s.id == Game.signups[index][0][2][i]).displayName + "\n";
          }
      }
      else {
        
      }
      update += "\nBACKUPS\n\n"
      for (var i in Game.signups[index][0][3]){
      update += "["+(i*1+1)+"] " + message.member.guild.members.cache.find(s => s.id == Game.signups[index][0][3][i]).displayName + "\n";
      }
          msg.edit(update + "```")
  })
  
}

client.on('guildMemberRemove', user => {
   for (var i in Game.signups){
     for (var x in Game.signups[i][0][2]){
       if (user.id == Game.signups[i][0][2][x]){
         if (user.guild.id == Game.signups[i][0][6]){
            //Game.signups[i][0][2].splice(x,1)
         }
       }
     }
   }
});



function requiredRoles (message) {
  if (message.member.hasPermission("ADMINISTRATOR")) return true;
    for (var i in Game.trustedRoles){
      if (Game.trustedRoles[i].id == message.guild.id){
        for (var x in Game.trustedRoles[i].trustedRoles){
          if (message.member.roles.cache.some(role => role.id === Game.trustedRoles[i].trustedRoles[x])){
            return true;
          }
        }
        return false;
      }
    }
    return false;
}

function setUpGame(message, channelIndex){
  //[ID | Role | Alignment | Termlocked | President/Chancellor | Ja/Nien/Maybe]
  //------------------------------------------------------SETTING UP-----------------------------------------------------------
  var gameInfo = new Government();
  //----------------------------------------------------ADDING ROLES-------------------------------------------------------
  var rolelist = ["Hitler","Fascist","Liberal","Liberal","Liberal"]
  for (var i = 6; i<=Game.signups[channelIndex][0][2].length;i++){
    if (i == 6 || i == 8 || i == 10){
      rolelist.push("Liberal");
    }
    if (i == 7 || i == 9){
      rolelist.push("Fascist");
    }
  }
  //-------------------------------------------------ASSIGNING ROLES-------------------------------------------------------
  for (var i in Game.signups[channelIndex][0][2]){
    var index = Math.floor(Math.random()*rolelist.length);
    var role = rolelist[index]
    rolelist.splice(index,1)
    //gameInfo.push([Game.signups[channelIndex][0][2][i],role,align,false,false,null])
    gameInfo.players.push(new Player(Game.signups[channelIndex][0][2][i], role))
  }
  //-------------------------------------------------ANNOUCING ROLES-------------------------------------------------------
  var Fascists = []
  for (i in gameInfo.players){
    //FIND FASCISTS
    if (gameInfo.players[i].secretRole == "Fascist"){
      Fascists.push(i)
    }
    else if (gameInfo.players[i].secretRole == "Hitler"){
      Fascists.unshift(i)
    }
  }
  //create message
  var mess = "```diff\nYou are a\n-Fascist\n\nYou know that " + message.guild.members.cache.get(gameInfo.players[Fascists[0]].id).displayName + " is Hitler.\n\nYour fellow fascists are:\n";
  for (var i = 1; i < Fascists.length;i++){
    mess += message.guild.members.cache.get(gameInfo.players[Fascists[i]].id).displayName
    if (i < Fascists.length-2){
      mess += ", "
    }
    else if (i == Fascists.length-1){
      mess += "\n```"
    }
    else {
      mess += " and "
    }
  }
  //send Fascists Message
  for (var i = 1; i < Fascists.length;i++){
    message.guild.members.cache.get(gameInfo.players[Fascists[i]].id).send(mess)
  }
  //Send Hitler Message
  if (Fascists.length == 2){
    message.guild.members.cache.get(gameInfo.players[Fascists[0]].id).send("```diff\nYou are\n-Hitler\n\nYou know that " + message.guild.members.cache.get(gameInfo.players[Fascists[1]].id).displayName + " is your Fascist.\n```");
  }
  else {
    message.guild.members.cache.get(gameInfo.players[Fascists[0]].id).send("```diff\nYou are\n-Hitler\n\nYou do not know who the fascists are.\n```")
  }
  //Send Liberal Messages
  for (i in gameInfo.players){
    if (gameInfo.players[i].secretRole == "Liberal"){
      message.guild.members.cache.get(gameInfo.players[i].id).send("```diff\nYou are\n+Liberal\n```")
    }
  }
  //[[CARDS][DISCARDS][FASCISTS,LIBERALS][WAITING CARDS]]
  //----------------------------------------------------DONE ASSIGNING ROLES--------------------------------------------------
  //Game.signups[channelIndex][2] = [[],[],[0,0],[]]
  var setup = ["Liberal","Liberal","Liberal","Liberal","Liberal","Liberal","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist"]
  for (var i = 0; i<setup.length;){
    var index = Math.floor(Math.random()*setup.length)
    //Game.signups[channelIndex][2][0].push(setup[index])
    gameInfo.policy.push(setup[index])
    setup.splice(index,1)
  }
  var pres = Math.floor(Math.random()*gameInfo.players.length)
  gameInfo.players[pres].office = "President"
  message.channel.send(message.guild.members.cache.get(gameInfo.players[pres].id).displayName + " is the President and must nominate a chancellor.");
  Game.signups[channelIndex][1] = gameInfo
}

function passedFascist(channelIndex, topDeck = false){
  Game.signups[channelIndex][1].fascist++;
  var fas = Game.signups[channelIndex][1].fascist;
  var embed = new Discord.MessageEmbed().setTitle("A Fascist Policy has been enacted.").setColor("b22222").addField("Fascist Policies Passed","**"+Game.signups[channelIndex][1].fascist+"/6** until Fascist Victory")
  if (fas == 6){
    embed.addField("The fascist party has won.")
    endGame(channelIndex)
  }
  else if (topDeck == false){
    if (fas == 4 || fas == 5){
      embed.addField("Presidential Power","The president must execute another player.")
    }
    else if (fas == 3 && Game.signups[channelIndex][1].players.length > 6){
      embed.addField("Special Election","The president elect another player to be president. [WORK IN PROGRESS")
      nextRound(channelIndex)
    }
    else if (fas == 3 && Game.signups[channelIndex][1].players.length < 7){
      embed.addField("Policy Peek","The president will be shown the top 3 policies")
      for (var i in Game.signups[channelIndex][1].players){
        if (Game.signups[channelIndex][1].players[i].office == "President"){
            client.users.cache.get(Game.signups[channelIndex][1].players[i].id).send("Here are the top three cards:\n\n"+Game.signups[channelIndex][1].policy[0]+"\n"+Game.signups[channelIndex][1].policy[1]+"\n"+Game.signups[channelIndex][1].policy[0])
        }
      }
      nextRound(channelIndex)
    }
    else if (fas == 2  && Game.signups[channelIndex][1].players.length > 6){
      embed.addField("Investigate Loyalty","The president must investigate another player.")
    }
    else if (fas == 2  && Game.signups[channelIndex][1].players.length > 8){
      embed.addField("The president must investigate another player.")
    }
    else {
      nextRound(channelIndex)
    }
  }
  else {
    embed.addField("Top Deck","Any Executive Powers gained were lost.")
    nextRound(channelIndex)
  }
  embed.setFooter("Made by MoustachioMario#2067")
  client.channels.cache.get(Game.signups[channelIndex][0][0]).send(embed)
}
function passedLiberal(channelIndex){
  Game.signups[channelIndex][1].liberal++;
  var embed = new Discord.MessageEmbed().setTitle("A Liberal Policy has been enacted.").setColor("1167b1").addField("Liberal Policies Passed","**"+Game.signups[channelIndex][1].liberal+"/5** until Liberal Victory")
  if (Game.signups[channelIndex][1].liberal == 5){
    embed.addField("Game Over","The Liberal party has won.")
    endGame(channelIndex)
  }
  else {
    nextRound(channelIndex)
  }
  embed.setFooter("Made by MoustachioMario#2067")
  client.channels.cache.get(Game.signups[channelIndex][0][0]).send(embed)
}

function nominateChancellor(message, target){
  var channelIndex = isChannelOpen(message.channel.id)
  if (Game.signups[channelIndex][1].players[playerPos(target,channelIndex)].alive == false){
    return message.channel.send("The person you were trying to nominate is dead.")
  }
  Game.signups[channelIndex][1].players[playerPos(target,channelIndex)].office = "Chancellor"
  for (var i in Game.signups[channelIndex][1].players){
    if (Game.signups[channelIndex][1].players[i].alive == true){
      Game.signups[channelIndex][1].players[i].vote = "Maybe";
      client.users.cache.get(Game.signups[channelIndex][1].players[i].id).send("New Pending Vote! Do /info.")
    }
  }
  message.channel.send(message.guild.members.cache.get(target).displayName + " has been nominated chancellor!\nPlease DM me with your vote.")
}

function playerPos(player, channelIndex){
  for (var i in Game.signups[channelIndex][1].players){
    if (Game.signups[channelIndex][1].players[i].id == player){
      return i;
    }
  }
  return -1;
}

function pendingVotes(player){
  var embed = new Discord.MessageEmbed().setTitle("Pending Actions");
  for (var i in Game.signups){  
     var posPlayer = playerPos(player,i)
     if (posPlayer == -1){
     }
     else if (Game.signups[i][1].players[posPlayer].vote == "Maybe"){
   //    mess += "```\n[GAME " + i + "] You need to vote Ya or Nien for:\nPresident " + findPres(i) + "\nChancellor " + findChancellor(i)+"\n```"
       embed.addField("Game " + i, "You need to vote Ja or Nein for:\nPresident " + findPres(i) + "\nChancellor " + findChancellor(i))
     }
     else if (Game.signups[i][1].players[posPlayer].office == "President" && Game.signups[i][1].inOffice.length == 3){
 //      mess += "```\n[GAME " + i + "] You need to discard a card:\n1: "+Game.signups[i][2][3][0]+"\n2: "+Game.signups[i][2][3][1]+"\n3: "+Game.signups[i][2][3][2]+"\n```"
       embed.addField("Game " + i, "You need to discard a card:\n1: "+Game.signups[i][1].inOffice[0]+"\n2: "+Game.signups[i][1].inOffice[1]+"\n3: "+Game.signups[i][1].inOffice[2])
     }
     else if (Game.signups[i][1].players[posPlayer].office == "Chancellor" && Game.signups[i][1].inOffice.length == 2){
     //  mess += "```\n[GAME " + i + "] You need to discard a card:\n1: "+Game.signups[i][2][3][0]+"\n2: "+Game.signups[i][2][3][1]+"\n```"
      embed.addField("Game " + i, "You need to discard a card:\n1: "+Game.signups[i][1].inOffice[0]+"\n2: "+Game.signups[i][1].inOffice[1])
     }
  }
  return embed;
}

function findPres(channel){
  for (var i in Game.signups[channel][1].players){
    if (Game.signups[channel][1].players[i].office == "President"){
      return client.users.cache.get(Game.signups[channel][1].players[i].id).tag
    }
  }
  return "THERE IS NO PRESIDENT CURRENTLY"
}
function findChancellor(channel){
  for (var i in Game.signups[channel][1].players){
    if (Game.signups[channel][1].players[i].office == "Chancellor"){
      return client.users.cache.get(Game.signups[channel][1].players[i].id).tag
    }
  }
  return "THERE IS NO CHANCELLOR CURRENTLY";
}

function printVote(channel){
  var yes = 0;
  var no = 0;
  var embed = new Discord.MessageEmbed().setTitle("Votes");
  for (var i in Game.signups[channel][1].players){
    embed.addField(client.users.cache.get(Game.signups[channel][1].players[i].id).tag,"voted " + Game.signups[channel][1].players[i].vote)
    if (Game.signups[channel][1].players[i].vote == "ja"){
      yes++;
    }
    else {
      no++;
    }
  }
  if (yes<=no){
    embed.setColor('#b22222');
  }
  else {
    embed.setColor('#228b22')
  }
  return embed;
}

function everyoneVoted(channel){
  var ja = 0;
  var nein = 0;
  for (var i in Game.signups[channel][1].players){
    if (Game.signups[channel][1].players[i].alive == true){
      if (Game.signups[channel][1].players[i].vote == "Maybe"){
        return;
      }
      else if (Game.signups[channel][1].players[i].vote == "ja"){
        ja++;
      }
      else{
        nein++;
      }
    }
  }
  client.channels.cache.get(Game.signups[channel][0][0]).send(printVote(channel))
  if (ja > nein){
    for (var i in Game.signups[channel][1].players){
      if (Game.signups[channel][1].players[i].office == "Chancellor" && Game.signups[channel][1].players[i].secretRole == "Hitler" && Game.signups[channel][1].fascist >= 3){
        client.channels.cache.get(Game.signups[channel][0][0]).send(new Discord.MessageEmbed().setTitle("Fascists win").setColor('b22222').addField("Game Over","Hitler was elected as chancellor after 3 fascist policies were passed."))
        return endGame(channel)
      }
    }
    Game.signups[channel][1].failedElections = 0;
    client.channels.cache.get(Game.signups[channel][0][0]).send("The president will now discard a card")
    Game.signups[channel][1].inOffice.push(Game.signups[channel][1].policy.shift())
    Game.signups[channel][1].inOffice.push(Game.signups[channel][1].policy.shift())
    Game.signups[channel][1].inOffice.push(Game.signups[channel][1].policy.shift())
    for (var i = 0; i<Game.signups[channel][1].players.length;i++){
      if (Game.signups[channel][1].players[i].office == "President"){
        client.users.cache.get(Game.signups[channel][1].players[i].id).send((new Discord.MessageEmbed().setTitle("Game " + channel).addField("Please discard a card","1: "+Game.signups[channel][1].inOffice[0]+"\n2: "+Game.signups[channel][1].inOffice[1]+"\n3: "+Game.signups[channel][1].inOffice[2])))
      }
    }
  }
  else {
    Game.signups[channel][1].failedElections++;
    client.channels.cache.get(Game.signups[channel][0][0]).send(new Discord.MessageEmbed().setTitle("Failed Election").addField("Elections Failed","**" + Game.signups[channel][1].failedElections + " / 3** Failed Election in a row before the top policy gets enacted."))
    if (Game.signups[channel][1].failedElections == 3){
      var topDeck = Game.signups[channel][1].policy.shift();
      Game.signups[channel][1].failedElections = 0;
      if (topDeck == "Fascist"){
        passedFascist(channel,true)
      }
      else {
        passedLiberal(channel);
      }
    }
    else {
      nextRound(channel)
    }
  }
}

function nextRound(channel){
  //[ID | Role | Alignment | Termlocked | President/Chancellor | Ja/Nien/Maybe]
  Game.signups[channel][1].inOffice = []
  var tru = false;
  for (var i = 0; i<Game.signups[channel][1].players.length;i++){
    if (Game.signups[channel][1].players[i].office == "President" && !tru){
      if (i == Game.signups[channel][1].players.length-1){
        Game.signups[channel][1].players[0].office = "President";
        Game.signups[channel][1].players[i].office = false;
        client.channels.cache.get(Game.signups[channel][0][0]).send("<@"+Game.signups[channel][1].players[0].id + "> is now president.")
      }
      else {
        Game.signups[channel][1].players[i].office = false;
        Game.signups[channel][1].players[i+1].office = "President";
        client.channels.cache.get(Game.signups[channel][0][0]).send("<@"+Game.signups[channel][1].players[parseInt(i+1)].id+"> is now president.")
      }
    tru = true;      
    }
  }
  //---------------Erase Prev Pres & Chance
  for (var i in Game.signups[channel][1].players){
    if (Game.signups[channel][1].players[i].office != "President"){
      Game.signups[channel][1].players[i].office = false
    }
  }
  //---------------Shuffle Deck------------------
  //client.channels.cache.get(Game.signups[channel][0][0]).send(Game.signups[channel][1].policy)
  if (Game.signups[channel][1].policy.length < 3){
     shuffleDeck(channel)
  }
}


function Government(){
  this.policy = [];
  this.discarded = [];
  
  this.inOffice = [];
  this.failedElections = 0;
  
  this.liberal = 0;
  this.fascist = 0;
  
  this.players = [];
}

function Player(id, role){
  this.id = id;

  this.secretRole = role;
  if (role == "Liberal"){
    this.partyMembership = "Liberal";
  }
  else {
    this.partyMembership = "Fascist";
  }
  
  this.alive = true;
  this.office = null;
  
  this.vote = "nein"
  
}

function shuffleDeck(channel){
    while (Game.signups[channel][1].policy.length != 0){
      Game.signups[channel][1].discarded.push(Game.signups[channel][1].policy[0])
      Game.signups[channel][1].policy.splice(0,1)
    }
    while (Game.signups[channel][1].discarded.length != 0){
      var index = Math.floor(Math.random()*Game.signups[channel][1].discarded.length)
      Game.signups[channel][1].policy.push(Game.signups[channel][1].discarded[index])
      Game.signups[channel][1].discarded.splice(index,1)
    }
    var libCards = 0;
    var fasCards = 0;
    for (var x in Game.signups[channel][1].policy){
      if (Game.signups[channel][1].policy[x] == "Liberal"){
        libCards++;
      }
      else {
        fasCards++;
      }
    }
    client.channels.cache.get(Game.signups[channel][0][0]).send(new Discord.MessageEmbed().setTitle("Deck Reshuffled").addField("Liberal Policies Remaining",libCards).addField("Fascist Policies Remaining",fasCards))
}

function endGame(channel){
  console.log("present")
  var embed = new Discord.MessageEmbed()
  for (var i in Game.signups[channel][1].players){
    embed.addField(client.users.cache.get(Game.signups[channel][1].players[i].id).tag,Game.signups[channel][1].players[i].secretRole)
  }
  embed.setFooter("Made by MoustachioMario#2067")
  client.channels.cache.get(Game.signups[channel][0][0]).send(embed)
  Game.signups[channel][0][4] = false;
}

function breakBot(channel){
  Game.signups[10000][1].players;
}
*/
function patchEvent(query = null, newValue = null){
  if (query == null){
    return
  }
  else {
    var patchEvent = request('PATCH', process.env.EVENTURL + '/' + query, {
      headers: DBHeader,
      body : '{"testtest":"'+newValue+'"}'
    });
    var responseBody = Buffer.from(patchEvent.body).toString();
    console.log(responseBody)
  }
}

function getEvent(query = null){
  if (query == null){
    var getEvent = request('GET', process.env.EVENTURL, {
      headers: DBHeader
    });
  }
  else {
    var getEvent = request('GET', process.env.EVENTURL + '?q=' + query, {
      headers: DBHeader
    });
  }
  var responseBody = Buffer.from(getEvent.body).toString();
    gameID = JSON.parse(responseBody)[0]._id;
    testtest = JSON.parse(responseBody)[0].testtest;
    return gameID + "\n" + testtest
}
