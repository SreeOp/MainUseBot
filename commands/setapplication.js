// Example button handler
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  data: {
    name: 'setapplication',
    description: 'Setup application menu',
  },
  async execute(interaction) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('apply_Staff')
          .setLabel('Apply for Staff')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('apply_Vehicle Developer')
          .setLabel('Apply as Vehicle Developer')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('apply_Developer')
          .setLabel('Apply as Developer')
          .setStyle('PRIMARY')
      );

    await interaction.reply({ content: 'Please choose your application type:', components: [row] });
  },
};
