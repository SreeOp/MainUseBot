const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { setUserRoles } = require('../utils/roleUtils'); // Add a helper for role management

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { customId } = interaction;
    const whitelistChannelId = '1255162116126539786'; // Replace with your target channel ID
    const pendingRoleId = '1253347271718735882'; // Replace with your Pending role ID
    const acceptedRoleId = '1253347204601741342'; // Replace with your Accepted role ID
    const rejectedRoleId = '1254774082445115432'; // Replace with your Rejected role ID
    const whitelistManagerId = interaction.user.id;

    if (['accept-whitelist', 'reject-whitelist', 'pending-whitelist'].includes(customId)) {
      const embed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('Whitelist Status')
        .setDescription(`User: <@${interaction.message.embeds[0].description.split('-')[1].trim()}>\nWhitelist Manager: <@${whitelistManagerId}>`);

      const status = {
        'accept-whitelist': { text: 'Accepted', role: acceptedRoleId, color: '#00FF00' },
        'reject-whitelist': { text: 'Rejected', role: rejectedRoleId, color: '#FF0000' },
        'pending-whitelist': { text: 'Pending', role: pendingRoleId, color: '#FFA500' },
      };

      embed.setColor(status[customId].color).setDescription(
        `**Status:** ${status[customId].text}\n**Whitelist Manager:** <@${whitelistManagerId}>`
      );

      // Send the embed to the appropriate channel
      const logChannelId = {
        'accept-whitelist': '1266779806582702171',
        'reject-whitelist': '1303269751166079036',
        'pending-whitelist': '1313134410282962996',
      }[customId];
      const logChannel = interaction.client.channels.cache.get(logChannelId);
      await logChannel.send({ embeds: [embed] });

      // Assign roles as per the button clicked
      const userId = interaction.message.embeds[0].description.match(/User: <@(\d+)>/)[1];
      const member = await interaction.guild.members.fetch(userId);

      if (customId === 'pending-whitelist') {
        await setUserRoles(member, [pendingRoleId]);
      } else if (customId === 'accept-whitelist') {
        await setUserRoles(member, [acceptedRoleId], [pendingRoleId]);
      } else if (customId === 'reject-whitelist') {
        await setUserRoles(member, [rejectedRoleId], [pendingRoleId, acceptedRoleId]);
      }

      // Disable all buttons
      const updatedComponents = interaction.message.components.map((row) => {
        const updatedRow = ActionRowBuilder.from(row);
        updatedRow.components.forEach((button) => button.setDisabled(true));
        return updatedRow;
      });

      // Update the message
      await interaction.update({ components: updatedComponents });
    }
  },
};
