const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// Check if all necessary environment variables are set
if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN is not set in .env file.');
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error('CLIENT_ID is not set in .env file.');
  process.exit(1);
}

if (!process.env.PORT) {
  console.error('PORT is not set in .env file. Defaulting to 3000.');
}

// Import the setStatus function
const setStatus = require('./functions/setStatus');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Initialize commands collection
client.commands = new Collection();

// Command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Set commands to the collection
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Set the bot's status
  setStatus(client);
});

// Interaction create event
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
  }
});

// Login to Discord with your app's token from environment variables
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('Error logging in:', error);
});

// Set up an Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
