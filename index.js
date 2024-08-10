const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config(); // Load environment variables

// Import the setStatus function
const setStatus = require('./functions/setStatus');
// Import ticket functions
const { createTicketMenu, handleTicketInteraction } = require('./functions/ticket');

// Create a new client instance
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

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

// Deploy commands
const deployCommands = require('./deploy-commands');
deployCommands().catch(console.error);

// Ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Set the bot's status
  setStatus(client);

  // Create the ticket menu in a specified channel
  const ticketChannel = client.channels.cache.get(process.env.TICKET_CHANNEL_ID); // Ensure you have this ID set in .env
  if (ticketChannel) {
    createTicketMenu(ticketChannel).catch(console.error);
  } else {
    console.error('Ticket channel not found');
  }
});

// Interaction create event
client.on('interactionCreate', async interaction => {
  // Handle ticket interaction if it's a select menu
  if (interaction.isSelectMenu()) {
    return handleTicketInteraction(interaction);
  }

  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  // Check if ALLOWED_ROLES is defined
  const allowedRoles = process.env.ALLOWED_ROLES ? process.env.ALLOWED_ROLES.split(',') : [];
  const memberRoles = interaction.member.roles.cache;
  const hasPermission = allowedRoles.some(role => memberRoles.has(role));

  if (!hasPermission) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
    } else {
      await interaction.followUp({ content: 'There was an error executing that command!', ephemeral: true });
    }
  }
});

// Login to Discord with your app's token from environment variables
client.login(process.env.DISCORD_TOKEN);

// Set up an Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
