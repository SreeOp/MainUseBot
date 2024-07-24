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
    const user = interaction.user;
    const questionType = interaction.customId; // Assuming customId represents question type

    try {
      // Send DM with questions
      await user.send('Please answer the following questions:\n1. What is your name?\n2. What is your experience with this role?');

      // Acknowledge the interaction
      await interaction.reply({ content: 'I have sent you a DM with the questions.', ephemeral: true });

      // Collect answers (this will be done in a separate handler)
    } catch (error) {
      console.error('Error sending DM:', error);
      await interaction.reply({ content: 'There was an error sending you the DM. Please ensure you have DMs enabled.', ephemeral: true });
    }
  }
});

// Collect responses from users (example implementation)
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  // Check if the message is a response to the DM questions
  if (message.channel.type === 'DM') {
    // Process the responses (e.g., save to a database or channel)
    console.log(`Received response from ${message.author.tag}: ${message.content}`);

    // Optionally, let the user know their response was received
    await message.reply('Thank you for your response! Your application has been submitted.');
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
