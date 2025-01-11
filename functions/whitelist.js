const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const handleWhitelistApplication = async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId, message, user } = interaction;
  const embed = message.embeds[0];

  if (!embed) return;

  // Channels for Accepted, Pending, and Rejected applications
  const acceptedChannelId = '1266779806582702171'; // Replace with the channel ID
  const pendingChannelId = '1313134410282962996'; // Replace with the channel ID
  const rejectedChannelId = '1316963699029704724'; // Replace with the channel ID

  // Roles
  const pendingRoleId = '1253347271718735882'; // Replace with pending role ID
  const acceptedRoleId = '1253347204601741342'; // Replace with accepted role ID

  const applicantUser = interaction.guild.members.cache.get(embed.fields.find(f => f.name === 'User').value);

  if (!applicantUser) {
    await interaction.reply({ content: 'Unable to find the user.', ephemeral: true });
    return;
  }

  if (customId === 'ACCEPT') {
    // Assign Accepted role and remove Pending role
    await applicantUser.roles.add(acceptedRoleId).catch(console.error);
    await applicantUser.roles.remove(pendingRoleId).catch(console.error);

    const acceptedEmbed = new MessageEmbed()
      .setColor('#00FF00')
      .setTitle('Whitelist Accepted')
      .setDescription(`User: ${applicantUser}\nWhitelist Manager: ${user}`)
      .setFooter('Done')
      .setTimestamp();

    const acceptedChannel = interaction.guild.channels.cache.get(acceptedChannelId);
    if (acceptedChannel) await acceptedChannel.send({ embeds: [acceptedEmbed] });

    // Update the original message
    await message.edit({ embeds: [embed.setFooter('Done')], components: [] });
    await interaction.reply({ content: 'Application accepted!', ephemeral: true });

  } else if (customId === 'REJECT') {
    const rejectedEmbed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('Whitelist Rejected')
      .setDescription(`User: ${applicantUser}\nWhitelist Manager: ${user}`)
      .setFooter('Done')
      .setTimestamp();

    const rejectedChannel = interaction.guild.channels.cache.get(rejectedChannelId);
    if (rejectedChannel) await rejectedChannel.send({ embeds: [rejectedEmbed] });

    // Update the original message
    await message.edit({ embeds: [embed.setFooter('Done')], components: [] });
    await interaction.reply({ content: 'Application rejected!', ephemeral: true });
  }
};
