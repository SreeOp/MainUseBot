const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Set the server status to Online or Under Maintenance'),
  async execute(interaction) {
    const roleId = '1046786167644880946'; // Replace with your role ID
    const onlineGif = 'https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=672ae3e9&is=67299269&hm=2ef583f9da3738c604d582db5d86f145815797880382c931b4b94f39f84d9522&'; // Replace with the URL of an animated GIF for online
    const maintenanceGif = 'https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=672ae3e9&is=67299269&hm=2ef583f9da3738c604d582db5d86f145815797880382c931b4b94f39f84d9522&'; // Replace with the URL of an animated GIF for maintenance

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
      let embed;
      
      if (i.values[0] === 'online') {
        // Server Online selected
        embed = new EmbedBuilder()
          .setTitle('ZyroniX Developments')
          .setColor('#00FF00') // Green color for online
          .setDescription(`Server Has Been Restarted <@&${roleId}>`)
          .setImage(onlineGif);
      } else if (i.values[0] === 'maintenance') {
        // Server Under Maintenance selected
        embed = new EmbedBuilder()
          .setTitle('ZyroniX Developments')
          .setColor('#FF0000') // Red color for maintenance
          .setDescription(`Server Under Maintenance. Please wait until maintenance is over. **Do not try to connect** <@&${roleId}>`)
          .setImage(maintenanceGif);
      }

      // Send the embed message to the channel
      await interaction.channel.send({ embeds: [embed] });
      
      // Acknowledge the selection by removing the menu (if desired)
      await i.deferUpdate(); // This removes the select menu without causing an error
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'No status selected.', components: [] });
      }
    });
  },
};
