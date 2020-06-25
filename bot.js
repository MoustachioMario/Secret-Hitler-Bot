const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('sync-request')

client.on('ready', () => {
    try {
      load();
    } catch (err) {}
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('online')
});

const prefixes = ["sh.",'/'];

const GUILD = "663616368389652480";

var Game = {};

function load(){
  var database = JSON.parse(getEvent());
  if (database.length == 0){
    Game = {}
  }
  else {
  for (var i in database){
    Game[database[i].GameID] = new Government(database[i])
  }
  }
  //console.log(Game)
}

function Government(saved){
  this.id = saved._id;
  this.gameID = saved.GameID;
  this.channel = saved.ChannelID;

  this.alive = saved.Alive;
  this.roles = saved.Roles;
  this.votes = saved.Votes;

  this.office = saved.Office;
  this.policy = saved.Policies;
  this.passed = saved.Passed;
  this.failedElections = saved.ElectionsFailed;

  this.status = saved.ActionDone;
}

client.on('message', message => {
    let prefix = false;
    for(const thisPrefix of prefixes) {
      if(message.content.startsWith(thisPrefix)) prefix = thisPrefix;
    }
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    if (command == "stop"){
        if (message.author.id == "642172417417936925"){
            message.channel.send("Goodbye!");
            Game.signups.push(message.user.id.tag);
        }
    }
    try{
      if (command == "ping"){
        message.channel.send("pong")
      }
      else if (command == "pong"){
        message.channel.send("sh.ping")
      }

      else if (command == "in"){
        var open = gameFromChannel(message.channel.id)
        if (open == null){
          message.channel.send("There is no open game here :/")
        }
        else if (Game[open].alive.indexOf(message.author.id) != -1){
          message.channel.send("You\'ve already joined!")
        }
        else {
          Game[open].alive.push(message.author.id)
          message.channel.send("You are now in the game!")
          updateDB(Game[open].id, JSON.stringify({"Alive":Game[open].alive}))
        }
      }
      else if (command == "out"){
        var open = gameFromChannel(message.channel.id)
        if (open == null)message.channel.send("There is no open game here :/")
        console.log(Game[open].alive)
        for (var i = 0;i< Game[open].alive.length;i++){
          console.log(Game[open].alive[i] + " " + message.author.id)
          if (Game[open].alive[i] == message.author.id){
            Game[open].alive.splice(i,1)
            i--;
          }
        }
        updateDB(Game[open].id, JSON.stringify({"Alive":Game[open].alive}))
      }
      else if (command == "print"){
        var open = gameFromChannel(message.channel.id)
        message.channel.send("Working " + open)
        if (open == null){
          //createGame(message.channel.id)
          message.channel.send("There is no open game here :/")
        }
        else {
          message.channel.send(Game[open].alive)
        }
      }
      else if (command == "create"){
        createGame(message.channel.id)
        message.channel.send("These signups are now open!")
      }
      else if (command == "load"){
          if (message.author.id == 642172417417936925){
            console.log(Game["89"])
              load();
          }
      }
      else if (command == "votecount" || command == "vc"){
        var channelIndex = gameFromChannel(message.channel.id);
        if (channelIndex == null) return message.channel.send("There is no game in this channel.")
        var mess = "```\n"
        for (var i in Game[channelIndex].votes){
            if (Game[channelIndex].votes[i] == "Maybe"){
                mess += client.users.cache.get(i).tag + " has not voted yet.\n"
            }
        }
          /*
        if (Game[channelIndex].office["President"] == i && Game[channelIndex].policy["InOffice"].length == 3){
             mess += client.users.cache.get(i).tag + " needs to discard a policy.\n"
        }
        else if (Game[channelIndex].office["Chancellor"] == i && Game[channelIndex].policy["InOffice"].length == 2){
          mess += client.users.cache.get(i).tag + " needs to discard a policy.\n"
        }
        */
        message.channel.send(mess + "```")
      }
      else if (command == "president"){
        var open = gameFromChannel(message.channel.id)
        message.channel.send("Working " + open)
        if (open == null){
          message.channel.send("There is no open game here :/")
        }
        else {
          console.log(Game[open].office)
          Game[open].office["President"] = message.mentions.users.first().id;
          Game[open].office["Chancellor"] = null;
          }
          updateDB(Game[open].id, JSON.stringify({"Office":Game[open].office}))
      }
      else if (command == "nominate"){
        var chance = message.mentions.users.first().id;
        var open = gameFromChannel(message.channel.id)
        if (open == null) return message.channel.send("There is no open game here :/")
        if (Game[open].office["President"] != message.author.id) return message.channel.send("You are not the president.")
        if (Game[open].office["Chancellor"] != null) return message.channel.send("You already nominated someone.")
        if (Game[open].alive.indexOf(chance) == -1) return message.channel.send("The person you nominated is dead or not in the game.")
        if (Game[open].office["Term Locked"].indexOf(chance) != -1) return message.channel.send("The person you nominated is term locked!")
        Game[open].office["Chancellor"] = message.mentions.users.first().id;
        for (var i in Game[open].alive){
            Game[open].votes[Game[open].alive[i]] = "Maybe";
            client.users.cache.get(Game[open].alive[i]).send("New Pending Vote! Do /info.")
        }
        message.channel.send(message.guild.members.cache.get(chance).displayName + " has been nominated chancellor!\nPlease DM me with your vote.")
        Game[open].status = "Voting"
        updateDB(Game[open].id, JSON.stringify({"Office":Game[open].office,"Votes":Game[open].votes,"ActionDone":Game[open].status}))
      }
      else if (command == "shoot" || command == "execute"){
        var open = gameFromChannel(message.channel.id)
        if (Game[open].status != "Execution") return message.channel.send("There are no scheduled executions at this moment.")
        if (Game[open].office["President"] != message.author.id) return message.reply(" you are not the president")
        if (Game[open].alive.indexOf(message.mentions.members.first().id) == -1) return message.reply(" the person you attempted to shoot is already dead, or not in the game!")
        Game[open].alive.splice(Game[open].alive.indexOf(message.mentions.members.first().id),1)
        message.channel.send("The president has executed "+client.users.cache.get(message.mentions.members.first())+".")
        for (var i in Game[open].roles){
          if (Game[open].roles[i][0] == message.mentions.members.first().id){
            if (Game[open].roles[i][1] == "Hitler"){
              message.channel.send("The Liberals have executed Hitler.")
              return endGame(channelIndex)
            }
          }
        }
        message.channel.send("They were not hitler.")
        nextRound(open);
      }
      else if (command == "investigate" || command == "inv"){
        var open = gameFromChannel(message.channel.id)
        if (Game[open].status != "Investigation") return message.channel.send("There are no scheduled investigations at this moment.")
        if (Game[open].office["President"] != message.author.id) return message.reply(" you are not the president")
        if (Game[open].alive.indexOf(message.mentions.members.first().id) == -1) return message.reply(" the person you attempted to investigate is not in the game!")
        Game[open].alive.splice(Game[open].alive.indexOf(message.mentions.members.first().id),1)
        message.channel.send("The president has investigated "+client.users.cache.get(message.mentions.members.first())+".")
        var membership = null
        for (var i in Game[open].roles){
          if (Game[open].roles[i][0] == message.mentions.members.first().id){
             if (Game[open].roles[i][1] == "Liberal"){
               membership = "Liberals"
             }
             else {
               membership = "Fascists"
             }
          }
        }
        client.users.cache.get(Game[open].office["President"]).send(client.users.cache.get(message.mentions.members.first().id).tag + "\'s party membership is aligned with the " + membership)
        nextRound(open);
      }
    
      else if (command == "start"){
        setUpGame(message)
      }
      //----------------------------------------YOU MUST DM PAST THIS POINT---------------------------------------
      else if (message.guild != null){
        if (command == "vote" || command == "discard" || command == "info"){
          return message.reply("those commands can only be done in DMs!")
        }
      }
      else if (command == "info"){
          message.channel.send(pendingVotes(message.author.id))
      }
      else if (command == "vote"){
        try {
          console.log(Game[args[0]].status)
          if (Game[args[0]].status != "Voting"){
            return message.channel.send("It is currently not the voting phase!")
          }
        }
        catch (err){
          return message.channel.send("That game does not exist!")
        }
        var vote = "Maybe"
        if (args[1] == "Ja" || args[1] == "Yes" || args[1] == "yes" || args[1] == "ja"){
          vote = "ja"
        }
        else if (args[1] == "nein" || args[1] == "Nein" || args[1] == "no" || args[1] == "No"){
          vote = "nein"
        }
        else {
          vote = "Maybe"
        }
        Game[args[0]].votes[message.author.id] = vote
        message.channel.send("You have voted " + vote + "!")
        updateDB(Game[args[0]].id, JSON.stringify({"Votes":Game[args[0]].votes}))
        everyoneVoted(args[0])
      }
      else if (command == "discard"){
          if (Game[args[0]].policy["InOffice"].length == 3 && Game[args[0]].office["President"] != message.author.id){
            return message.channel.send("YOU ARE NOT PRESIDENT");
          }
          else if (Game[args[0]].policy["InOffice"].length == 2 && Game[args[0]].office["Chancellor"] != message.author.id){
            return message.channel.send("YOU ARE NOT CHANCELLOR");
          }
          else if (Game[args[0]].policy["InOffice"].length == 1 || Game[args[0]].policy["InOffice"].length == 0){
            return message.channel.send("There is nothing for you to do here.")
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
          for (var i in Game[args[0]].policy["InOffice"]){
            if (Game[args[0]].policy["InOffice"][i] == discarding && discardingComplete == false){
              message.channel.send("You have discarded a " + Game[args[0]].policy["InOffice"][i] + " policy");
              discardingComplete = true;
              Game[args[0]].policy["Discard"].push(Game[args[0]].policy["InOffice"][i])
              Game[args[0]].policy["InOffice"].splice(i,1)
            }
          }
          if (discardingComplete == false){
              message.channel.send("You don\'t have a "+discarding+", so you discarded a " + Game[args[0]].policy["InOffice"][0] + " policy");
              discardingComplete = true;
            Game[args[0]].policy["Discard"].push(Game[args[0]].policy["InOffice"][0])
              Game[args[0]].policy["InOffice"].splice(0,1)
        }
        updateDB(Game[args[0]].id, JSON.stringify({"Policies":Game[args[0]].policy}))
        if (Game[args[0]].policy["InOffice"].length == 2){
                  client.users.cache.get(Game[args[0]].office["Chancellor"]).send(new Discord.MessageEmbed().setTitle("Game " + args[0]).addField("Please discard a card","1: "+Game[args[0]].policy["InOffice"][0]+"\n2: "+Game[args[0]].policy["InOffice"][1]))
        }
        if (Game[args[0]].policy["InOffice"].length == 1){
          if (Game[args[0]].policy["InOffice"][0] == "Liberal"){
            passedLiberal(args[0])
          }
          else {
            passedFascist(args[0])
          }
          updateDB(Game[args[0]].id, JSON.stringify({"Passed":Game[args[0]].passed}))
        }
      }
    }
    catch (error){
      try{
          client.users.cache.get("642172417417936925").send("**ERROR**: " + error.stack)
            message.channel.send("**An Error has occured!** MoustachioMario is already aware and will be fixing it asap!")
      }
      catch (err){
        message.channel.send("**An Error has occured!** MoustachioMario might not know, so DM them and tell them to check logs!")
        console.log("Main Error: "+ error.stack)
        console.log("Secondary Error:"+err.stack);
      }
    }
});
function everyoneVoted(channel){
  var ja = 0;
  var nein = 0;
  for (var i in Game[channel].votes){
    if (Game[channel].votes[i] == "Maybe"){
      return false;
    }
    else if (Game[channel].votes[i] == "ja"){
      ja++;
    }
    else{
      nein++;
    }
  }
  console.log(Game[channel].channel)//
  client.channels.cache.get(Game[channel].channel).send(printVote(channel))
  if (ja > nein){
    for (var i in Game[channel].roles){
      if (Game[channel].roles[i][0] == Game[channel].office["Chancellor"] && Game[channel].roles[i][0] == "Hitler" && Game[channel].passed["Fascist"] >= 3){
        client.channels.cache.get(Game[channel].channel).send(new Discord.MessageEmbed().setTitle("Fascists win").setColor('b22222').addField("Game Over","Hitler was elected as chancellor after 3 fascist policies were passed."))
        //return endGame(channel)
      }
    }
    Game[channel].failedElections = 0;
    Game[channel].office["Term Locked"] = []
    if (Game[channel].alive.length > 5){
      Game[channel].office["Term Locked"].push(Game[channel].office["President"])
    }
    Game[channel].office["Term Locked"].push(Game[channel].office["Chancellor"])
    client.channels.cache.get(Game[channel].channel).send("The president will now discard a card")
    Game[channel].status = "President Discarding"
    Game[channel].policy["InOffice"].push(Game[channel].policy["Deck"].shift())
    Game[channel].policy["InOffice"].push(Game[channel].policy["Deck"].shift())
    Game[channel].policy["InOffice"].push(Game[channel].policy["Deck"].shift())
    client.users.cache.get(Game[channel].office["President"]).send((new Discord.MessageEmbed().setTitle("Game " + channel).addField("Please discard a card","1: "+Game[channel].policy["InOffice"][0]+"\n2: "+Game[channel].policy["InOffice"][1]+"\n3: "+Game[channel].policy["InOffice"][2])))
    updateDB(Game[channel].id, JSON.stringify({"Policies":Game[channel].policy, "ActionDone":"President Discarding"}))
  }
  else {
    Game[channel].failedElections++;
    client.channels.cache.get(Game[channel].channel).send(new Discord.MessageEmbed().setTitle("Failed Election").addField("Elections Failed","**" + Game[channel].failedElections + " / 3** Failed Election in a row before the top policy gets enacted."))
    if (Game[channel].failedElections == 3){
      var topDeck = Game[channel].policy["Deck"].shift();
      Game[channel].failedElections = 0;
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

function pendingVotes(player){
    console.log("GATE TWO")
  var embed = new Discord.MessageEmbed().setTitle("Pending Actions");
    console.log("GATE ONE")
  for (var i in Game){
      console.log(i)
     if (Game[i].votes[player] == "Maybe"){
       embed.addField("Game " + i, "You need to vote Ja or Nein for:\nPresident " + client.users.cache.get(Game[i].office["President"]).tag + "\nChancellor " + client.users.cache.get(Game[i].office["Chancellor"]).tag)
     }
     else if (Game[i].office["President"] == player && Game[i].policy["InOffice"].length == 3){
       embed.addField("Game " + i, "You need to discard a card:\n1: "+Game[i].policy["InOffice"][0]+"\n2: "+Game[i].policy["InOffice"][1]+"\n3: "+Game[i].policy["InOffice"][2])
     }
     else if (Game[i].office["Chancellor"] == player && Game[i].policy["InOffice"].length == 2){
      embed.addField("Game " + i, "You need to discard a card:\n1: "+Game[i].policy["InOffice"][0]+"\n2: "+Game[i].policy["InOffice"][1])
     }
  }
  return embed;
}

function nextRound(channel){
  //[ID | Role | Alignment | Termlocked | President/Chancellor | Ja/Nien/Maybe]
  Game[channel].policy["InOffice"] = []
  var tru = false;
  var index = Game[channel].alive.indexOf(Game[channel].office["President"])
  if (index == Game[channel].alive.length-1){
    Game[channel].office["President"] = Game[channel].alive[0]
  }
  else {
    Game[channel].office["President"] = Game[channel].alive[index+1]
  }
  client.channels.cache.get(Game[channel].channel).send("<@"+Game[channel].office["President"] + "> is now president.")
  //---------------Erase Prev Pres & Chance
  Game[channel].office["Chancellor"] = null
  //---------------Shuffle Deck------------------
  if (Game[channel].policy["Deck"].length < 3){
     shuffleDeck(channel)
  }
  updateDB(Game[channel].id, JSON.stringify({"Office":Game[channel].office}))
}

function shuffleDeck(channel){
    while (Game[channel].policy["Deck"].length != 0){
     Game[channel].policy["Discard"].push(Game[channel].policy["Deck"][0])
      Game[channel].policy["Deck"].splice(0,1)
    }
    while (Game[channel].policy["Discard"].length != 0){
      var index = Math.floor(Math.random()*Game[channel].policy["Discard"].length)
      Game[channel].policy["Deck"].push(Game[channel].policy["Discard"][index])
      Game[channel].policy["Discard"].splice(index,1)
    }
    var libCards = 0;
    var fasCards = 0;
    for (var x in Game[channel].policy["Deck"]){
      if (Game[channel].policy["Deck"][x] == "Liberal"){
        libCards++;
      }
      else {
        fasCards++;
      }
    }
    client.channels.cache.get(Game[channel].channel).send(new Discord.MessageEmbed().setTitle("Deck Reshuffled").addField("Liberal Policies Remaining",libCards).addField("Fascist Policies Remaining",fasCards))
    updateDB(Game[channel].id, JSON.stringify({"Policies":Game[channel].policy}))
}

function passedFascist(channelIndex, topDeck = false){
  Game[channelIndex].passed["Fascist"]++;
  var fas = Game[channelIndex].passed["Fascist"];
  var embed = new Discord.MessageEmbed().setTitle("A Fascist Policy has been enacted.").setColor("b22222").addField("Fascist Policies Passed","**"+Game[channelIndex].passed["Fascist"]+"/6** until Fascist Victory")
  if (fas == 6){
    embed.addField("The fascist party has won.")
    endGame(channelIndex)
  }
  else if (topDeck == false){
    if (fas == 4 || fas == 5){
      embed.addField("Presidential Power","The president must execute another player.")
      Game[channelIndex].status = "Execution"
    }
    else if (fas == 3 && Game[channelIndex].alive.length > 6){
      embed.addField("Special Election","The president elect another player to be president. [WORK IN PROGRESS")
      nextRound(channelIndex)
    }
    else if (fas == 3 && Game[channelIndex].alive.length < 7){
      embed.addField("Policy Peek","The president will be shown the top 3 policies")
      client.users.cache.get(Game[channelIndex].office["President"]).send("Here are the top three cards:\n\n"+Game[channelIndex].policy["InOffice"][0]+"\n"+Game[channelIndex].policy["InOffice"][1]+"\n"+Game[channelIndex].policy["InOffice"][2])
      nextRound(channelIndex)
    }
    else if (fas == 2  && Game[channelIndex].alive.length > 6){
      embed.addField("Investigate Loyalty","The president must investigate another player.")
      Game[channelIndex].status = "Investigation"
    }
    else if (fas == 2  && Game[channelIndex].alive.length > 8){
      embed.addField("The president must investigate another player.")
    }
    else {
      nextRound(channelIndex)
    }
    updateDB(Game[channelIndex].id, JSON.stringify({"ActionDone":Game[channelIndex].status}))
  }
  else {
    embed.addField("Top Deck","Any Executive Powers gained were lost.")
    nextRound(channelIndex)
  }
  embed.setFooter("Made by MoustachioMario#2067")
  client.channels.cache.get(Game[channelIndex].channel).send(embed)
}
function passedLiberal(channelIndex){
  Game[channelIndex].passed["Liberal"]++;
  var embed = new Discord.MessageEmbed().setTitle("A Liberal Policy has been enacted.").setColor("1167b1").addField("Liberal Policies Passed","**"+ Game[channelIndex].passed["Liberal"]+"/5** until Liberal Victory")
  if (Game[channelIndex].passed["Liberal"] == 5){
    embed.addField("Game Over","The Liberal party has won.")
    endGame(channelIndex)
  }
  else {
    nextRound(channelIndex)
  }
  embed.setFooter("Made by MoustachioMario#2067")
  client.channels.cache.get(Game[channelIndex].channel).send(embed)
}

function printVote(channel){
  var yes = 0;
  var no = 0;
  var embed = new Discord.MessageEmbed().setTitle("Votes");
  for (var i in Game[channel].alive){
    embed.addField(client.users.cache.get(Game[channel].alive[i]).tag,"voted " + Game[channel].votes[Game[channel].alive[i]])
    if (Game[channel].votes[Game[channel].alive[i]] == "ja"){
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
function setUpGame(message){
  //[ID | Role | Alignment | Termlocked | President/Chancellor | Ja/Nien/Maybe]
  //------------------------------------------------------SETTING UP-----------------------------------------------------------
  var open = gameFromChannel(message.channel.id)
  var gameInfo = Game[open]
  gameInfo.roles = [];
  //----------------------------------------------------ADDING ROLES-------------------------------------------------------
  var rolelist = ["Hitler","Liberal"]
  for (var i = 6; i<=gameInfo.alive.length;i++){
    if (i == 6 || i == 8 || i == 10){
      rolelist.push("Liberal");
    }
    if (i == 7 || i == 9){
      rolelist.push("Fascist");
    }
  }
  console.log(gameInfo.alive)
  var shuffle = gameInfo.alive;
  gameInfo.alive = [];
  while (shuffle.length != 0){
    var index = Math.floor(Math.random() * shuffle.length)
    gameInfo.alive.push(shuffle[index])
    shuffle.splice(index,1)
  }
  console.log(gameInfo.alive)
  //-------------------------------------------------ASSIGNING ROLES-------------------------------------------------------
  for (var i in gameInfo.alive){
    var index = Math.floor(Math.random()*rolelist.length);
    var role = rolelist[index]
    rolelist.splice(index,1)
    gameInfo.roles.push([gameInfo.alive[i], role])
  }
  //-------------------------------------------------ANNOUCING ROLES-------------------------------------------------------
  var Fascists = []
  for (i in gameInfo.roles){
    console.log("roles:"+gameInfo.roles[i])
    //FIND FASCISTS
    if (gameInfo.roles[i][1] == "Fascist"){
      Fascists.push(gameInfo.roles[i][0])
    }
    else if (gameInfo.roles[i][1] == "Hitler"){
      Fascists.unshift(gameInfo.roles[i][0])
    }
  }
  //create message
  var mess = "```diff\nYou are a\n-Fascist\n\nYou know that " + message.guild.members.cache.get(Fascists[0]).displayName + " is Hitler.\n\nYour fellow fascists are:\n";
  for (var i in Fascists){
    mess += message.guild.members.cache.get(Fascists[i]).displayName + ", ";
  }
  //send Fascists Message
  for (var i = 1; i < Fascists.length;i++){
    message.guild.members.cache.get(Fascists[i]).send(mess)
  }
  //Send Hitler Message
  if (Fascists.length == 2){
    message.guild.members.cache.get(Fascists[0]).send("```diff\nYou are\n-Hitler\n\nYou know that " + message.guild.members.cache.get(Fascists[1]).displayName + " is your Fascist.\n```");
  }
  else {
    message.guild.members.cache.get(Fascists[0]).send("```diff\nYou are\n-Hitler\n\nYou do not know who the fascists are.\n```")
  }
  //Send Liberal Messages
  for (i in gameInfo.roles){
    if (gameInfo.roles[i][1] == "Liberal"){
      message.guild.members.cache.get(gameInfo.roles[i][0]).send("```diff\nYou are\n+Liberal\n```")
    }
  }
  //----------------------------------------------------DONE ASSIGNING ROLES--------------------------------------------------
  var setup = ["Liberal","Liberal","Liberal","Liberal","Liberal","Liberal","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist","Fascist"]
  gameInfo.policy["Deck"] = []
  for (var i = 0; i<setup.length;){
    var index = Math.floor(Math.random()*setup.length)
    gameInfo.policy["Deck"].push(setup[index])
    setup.splice(index,1)
  }
  gameInfo.office = {}
  gameInfo.office["President"] = gameInfo.alive[0]
  gameInfo.office["Chancellor"] = null
  gameInfo.office["Special Election"] = null
  gameInfo.office["Term Locked"] = []
  message.channel.send(message.guild.members.cache.get(gameInfo.alive[0]).displayName + " is the President and must nominate a chancellor.");
  console.log(gameInfo.roles) // <-- i don't need office xd i need roles office works
  updateDB(Game[open].id, JSON.stringify({"ElectionsFailed":0,"ActionDone":"Nomination","Office":gameInfo.office,"Roles":gameInfo.roles,"Policies":{"Deck":gameInfo.policy["Deck"],"Discard":[],"InOffice":[]},"Passed":{"Fascist":0,"Liberal":0}})) //save it xd
}

function endGame(channel){
  console.log("present")
  var embed = new Discord.MessageEmbed()
  for (var i in Game[channel].roles){
    embed.addField(client.users.cache.get(Game[channel].roles[i][0].id).tag,Game[channel].roles[i][1])
  }
  embed.setFooter("Made by MoustachioMario#2067")
  client.channels.cache.get(Game[channel].channel).send(embed)
  Game[channel].status = "Signups";
}

function createGame(channelID){
  console.log("CREATEGAME")
  var postEvent = request('POST', process.env.EVENTURL, {
      headers: DBHeader,
      body : '{"GameID":"78","ChannelID":"'+channelID+'","Alive":[],"Policies":{"Deck":[],"Discard":[],"InOffice":[]},"Passed":{"Fascist":0,"Liberal":0},"ActionDone":"Signups","Votes":{},"Office":{}}'
    });
    //responseBody = Buffer.from(postEvent.body).toString();
    //console.log(responseBody)
  load()
}

function gameFromChannel(channelID){
  try {
    var getEvent = request('GET', process.env.EVENTURL + '?q={"ChannelID":"'+channelID+'"}', {
        headers: DBHeader
      });
    var responseBody = Buffer.from(getEvent.body).toString();
    //console.log(responseBody)
    return JSON.parse(responseBody)[0].GameID
  }
  catch (err){
      return null;
  }
}

client.login(process.env.TOKEN)


var DBHeader = { "Content-Type": "application/json; charset=utf-8", "x-apikey": process.env.APIKEY }


function getEvent(col = null, query = null){
  //console.log("Start")
  if (col == null || query == null){
    var getEvent = request('GET', process.env.EVENTURL, {
      headers: DBHeader
    });
  }
  else {
    var getEvent = request('GET', process.env.EVENTURL + '?q={"'+col+'":"'+query+'"}', {
      headers: DBHeader
    });
  }
  var responseBody = Buffer.from(getEvent.body).toString();
  //console.log(responseBody)
  //db = responseBody;
    //gameID = JSON.parse(responseBody)[0]._id;
    //testtest = JSON.parse(responseBody)[0].testtest;
    return responseBody
}

function updateDB(id = null, update = null){
  if (id == null || update == null) return;
  var patchEvent = request('PATCH', process.env.EVENTURL + '/' + id, {
    headers: DBHeader,
    body : update
  });
  var responseBody = Buffer.from(patchEvent.body).toString();
}

function postEvent(newValue = null){
    console.log("HI")
    var postEvent = request('POST', process.env.EVENTURL, {
      headers: DBHeader,
      body : '{"testtest":'+newValue+'}'
    });
    var responseBody = Buffer.from(postEvent.body).toString();
    console.log(responseBody)
}
