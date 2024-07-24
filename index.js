// index.js

const { Client, GatewayIntentBits, Collection, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const config = require('./config'); // Import the config file
require('dotenv').config();

// Import the setStatus function and deployCommands function
const setStatus = require('./functions/setStatus');
const deployCommands = require('./deploy-commands');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

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

  // Deploy commands
  deployCommands().catch(console.error);
});

// Interaction create event
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() && !interaction.isButton()) return;

  // Handle command interactions
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const memberRoles = interaction.member.roles.cache;
    const hasPermission = config.allowedRoles.some(role => memberRoles.has(role));

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
  }

  // Handle button interactions
  if (interaction.isButton()) {
    const applicationType = interaction.customId.split('_')[1]; // Assuming customId contains the type
    const questions = config.questions[applicationType];

    if (!questions) {
      return interaction.reply({ content: 'Unknown application type.', ephemeral: true });
    }

    // Send questions via DM
    try {
      await interaction.user.send(`You have selected the ${applicationType} application. Please answer the following questions:\n`);
      
      for (const question of questions) {
        await interaction.user.send(question);
      }

      // Confirm receipt of the questions
      await interaction.reply({ content: 'I have sent you the questions in DM. Please reply there.', ephemeral: true });
    } catch (error) {
      console.error('Failed to send DM:', error);
      await interaction.reply({ content: 'I was unable to send you the questions. Please make sure you have DMs enabled.', ephemeral: true });
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
