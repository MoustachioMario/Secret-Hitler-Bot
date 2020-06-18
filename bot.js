const Discord = require('discord.js');

const { Database } = require('pg');

const database = new Database({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

database.connect();

database.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  database.end();
});

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
});

client.login(process.env.TOKEN);
