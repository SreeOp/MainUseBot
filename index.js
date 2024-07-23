const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { exec } = require('child_process');
require('dotenv').config();

// Import the setStatus function
const setStatus = require('./functions/setStatus');
// Import the staff application function
const staffApplication = require('./functions/staffApplication');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

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
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Deploy commands
  exec('node deploy-commands.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error deploying commands: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error output: ${stderr}`);
      return;
    }
    console.log(`Deploy Commands Output: ${stdout}`);
  });

  // Set the bot's status
  setStatus(client);
});

// Interaction create event
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return;

  try {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      const memberRoles = interaction.member.roles.cache;
      const allowedRoles = process.env.ALLOWED_ROLES.split(',');
      const hasPermission = allowedRoles.some(role => memberRoles.has(role));

      if (!hasPermission) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      await command.execute(interaction);
    } else if (interaction.isButton() || interaction.isModalSubmit()) {
      await staffApplication(client, interaction);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
    } else if (!interaction.deferred) {
      await interaction.followUp({ content: 'There was an error processing your request.', ephemeral: true });
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
