const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Set the server status to Online or Under Maintenance'),
  async execute(interaction) {
    const roleId = '1046786167644880946'; // Replace with your role ID
    const onlineGif = 'https://imgur.com/SCTFORu'; // Replace with the URL of an animated GIF for online
    const maintenanceGif = 'https://imgur.com/SCTFORu'; // Replace with the URL of an animated GIF for maintenance

    // Create a select menu for choosing server status
    const statusSelectMenu = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('statusSelect')
          .setPlaceholder('Choose Server Status')
          .addOptions([
            {
              label: 'Server Online',
              description: 'Set the server status to Online',
              value: 'online',
            },
            {
              label: 'Server Under Maintenance',
              description: 'Set the server status to Under Maintenance',
              value: 'maintenance',
            },
          ])
      );

    await interaction.reply({
      content: 'Select the server status:',
      components: [statusSelectMenu],
      ephemeral: true, // Only visible to the user who used the command
    });

    // Set up a collector to handle the selection
    const filter = i => i.customId === 'statusSelect' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.values[0] === 'online') {
        // Server Online selected
        const onlineEmbed = new EmbedBuilder()
          .setColor('#00FF00') // Green color for online
          .setDescription(`Server Has Been Restarted <@&${roleId}>`)
          .setImage(onlineGif);

        await interaction.channel.send({ embeds: [onlineEmbed] });
        await i.update({ content: 'Server status set to Online!', components: [] });
      } else if (i.values[0] === 'maintenance') {
        // Server Under Maintenance selected
        const maintenanceEmbed = new EmbedBuilder()
          .setColor('#FF0000') // Red color for maintenance
          .setDescription(`Server Under Maintenance Please Wait Until Maintenance Is Over. **Do Not Try To Connect** <@&${roleId}>`)
          .setImage(maintenanceGif);

        await interaction.channel.send({ embeds: [maintenanceEmbed] });
        await i.update({ content: 'Server status set to Under Maintenance!', components: [] });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'No status selected.', components: [] });
      }
    });
  },
};
