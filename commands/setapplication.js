// commands/setapplication.js
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setapplication')
    .setDescription('Set the application form in the current channel'),
  async execute(interaction) {
    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('selectJob')
          .setPlaceholder('Select Job Application')
          .addOptions([
            {
              label: 'Staff',
              description: 'Support Staff',
              value: 'staff',
            },
            {
              label: 'Vehicle Developer',
              description: 'Vehicle Artist',
              value: 'vd',
            },
          ]),
      );

    await interaction.reply({ content: 'Job Applications:', components: [row] });
  },
};
