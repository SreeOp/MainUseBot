const { PermissionFlagsBits, ChannelType } = require('discord.js');

async function handleTicket(interaction) {
  // Create a new channel in the guild for the ticket
  const category = interaction.guild.channels.cache.find(c => c.name === 'Tickets' && c.type === ChannelType.GuildCategory);
  const ticketChannel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: category ? category.id : null, // Use category if exists
    permissionOverwrites: [
      {
        id: interaction.guild.id, // Deny everyone else
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id, // Allow the user
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
    ],
  });

  await ticketChannel.send(`Welcome ${interaction.user}, how can we assist you today?`);

  await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
}

module.exports = { handleTicket };
