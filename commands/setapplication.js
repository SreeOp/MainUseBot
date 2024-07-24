const { SlashCommandBuilder, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setapplication')
    .setDescription('Sets up the application process.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the application form')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('staff')
          .setLabel('Staff Application')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('vehicle')
          .setLabel('Vehicle Application')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('developer')
          .setLabel('Developer Application')
          .setStyle('PRIMARY')
      );

    await channel.send({
      content: 'Click a button to start your application:',
      components: [row]
    });

    await interaction.reply({ content: 'Application setup complete!', ephemeral: true });
  },
};
