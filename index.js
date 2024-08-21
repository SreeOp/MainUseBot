const { Client, GatewayIntentBits, Collection, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config(); // Load environment variables

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

// Deploy commands
const deployCommands = require('./deploy-commands');
deployCommands().catch(console.error);

// Ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Set the bot's status
  setStatus(client);
});

// Interaction create event for commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

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

// Interaction create event for buttons and modals
client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'apply_button') {
      const modal = new ModalBuilder()
          .setCustomId('staff_application')
          .setTitle('Staff Application');

      const realNameInput = new TextInputBuilder()
          .setCustomId('real_name')
          .setLabel('What is your Real Name?')
          .setStyle(TextInputStyle.Short);

      const characterNameInput = new TextInputBuilder()
          .setCustomId('character_name')
          .setLabel('What is your Character Name?')
          .setStyle(TextInputStyle.Short);

      const ageInput = new TextInputBuilder()
          .setCustomId('age')
          .setLabel('What is your Age?')
          .setStyle(TextInputStyle.Short);

      const emailInput = new TextInputBuilder()
          .setCustomId('email')
          .setLabel('What is your E-mail?')
          .setStyle(TextInputStyle.Short);

      const experienceInput = new TextInputBuilder()
          .setCustomId('experience')
          .setLabel('Explain Your STAFF-EXPERIENCE')
          .setStyle(TextInputStyle.Paragraph);

      modal.addComponents(
          new ActionRowBuilder().addComponents(realNameInput),
          new ActionRowBuilder().addComponents(characterNameInput),
          new ActionRowBuilder().addComponents(ageInput),
          new ActionRowBuilder().addComponents(emailInput),
          new ActionRowBuilder().addComponents(experienceInput)
      );

      await interaction.showModal(modal);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'staff_application') {
      const realName = interaction.fields.getTextInputValue('real_name');
      const characterName = interaction.fields.getTextInputValue('character_name');
      const age = interaction.fields.getTextInputValue('age');
      const email = interaction.fields.getTextInputValue('email');
      const experience = interaction.fields.getTextInputValue('experience');

      const applicationEmbed = new EmbedBuilder()
          .setTitle('New Staff Application')
          .addFields(
              { name: 'Real Name', value: realName },
              { name: 'Character Name', value: characterName },
              { name: 'Age', value: age },
              { name: 'E-mail', value: email },
              { name: 'Experience', value: experience }
          )
          .setColor('#FF4D00');

      const acceptButton = new ButtonBuilder()
          .setCustomId('accept_application')
          .setLabel('Accept')
          .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(acceptButton);

      const applicationChannel = interaction.guild.channels.cache.get('1255162116126539786'); // Replace with your channel ID
      await applicationChannel.send({ embeds: [applicationEmbed], components: [row] });

      await interaction.reply({ content: 'Application submitted!', ephemeral: true });
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === 'accept_application') {
      const userId = interaction.message.embeds[0].fields.find(field => field.name === 'User ID').value;
      const user = await client.users.fetch(userId);
      await user.send('Congratulations! Your staff application has been accepted.');
      await interaction.reply({ content: 'Application accepted and user notified.', ephemeral: true });
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
