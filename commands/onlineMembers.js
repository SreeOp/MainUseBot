// commands/onlineMembers.js

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onlinemembers')
    .setDescription('Displays an embed with a button to show online members of a specific role'),

  async execute(interaction) {
    // Check if the user has the required role
    const allowedRoleIDs = ['1007930481716760666', '1046786167644880946']; // Replace with actual role IDs
    const memberRoles = interaction.member.roles.cache;
    const hasPermission = memberRoles.some(role => allowedRoleIDs.includes(role.id));

    if (!hasPermission) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('Online Members')
      .setDescription('Click the button below to see online members with the specified role.');

    // Create the button
    const button = new ButtonBuilder()
      .setCustomId('show_online_members')
      .setLabel('Show Online Members')
      .setStyle(ButtonStyle.Primary);

    // Create an action row to hold the button
    const row = new ActionRowBuilder().addComponents(button);

    // Send the embed with the button
    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
