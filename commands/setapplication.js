const { SlashCommandBuilder } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setapplication')
    .setDescription('Set up the application menu in a specified channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to set up the application menu')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    // Create the application menu
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('apply_staff')
          .setLabel('Apply for Staff')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('apply_vehicle')
          .setLabel('Apply for Vehicle Developer')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('apply_developer')
          .setLabel('Apply for Developer')
          .setStyle('PRIMARY')
      );

    await channel.send({
      content: 'Click the button below to apply for a role:',
      components: [row],
    });

    await interaction.reply({ content: 'Application menu set up successfully!', ephemeral: true });
  },
};
