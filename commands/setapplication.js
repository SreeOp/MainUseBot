const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setapplication')
    .setDescription('Set up the job application buttons.'),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply_ems')
        .setLabel('EMS')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('apply_pd')
        .setLabel('PD')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: 'Click the button below to apply for a staff position.',
      components: [row],
    });
  },
};
