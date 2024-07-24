const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setapplication')
    .setDescription('Set up the application menu in the current channel'),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ems')
        .setLabel('EMS')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('pd')
        .setLabel('PD')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.channel.send({
      content: 'Select Job Application:',
      components: [row]
    });

    await interaction.reply({ content: 'Application menu has been set up!', ephemeral: true });
  }
};
