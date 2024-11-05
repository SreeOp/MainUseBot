const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Set server status to Online or Under Maintenance with a direct message to a channel')
    .addStringOption(option => 
      option.setName('status')
        .setDescription('Select the server status')
        .setRequired(true)
        .addChoices(
          { name: 'Server Online', value: 'online' },
          { name: 'Server Under Maintenance', value: 'maintenance' }
        )
    ),
  
  async execute(interaction) {
    const channelId = '1266779806582702171'; // Replace with your target channel ID
    const roleId = '1299270070534668324'; // Replace with your role ID
    const onlineGif = 'https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=672ae3e9&is=67299269&hm=2ef583f9da3738c604d582db5d86f145815797880382c931b4b94f39f84d9522&'; // Replace with the URL of an animated GIF for online
    const maintenanceGif = 'https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=672ae3e9&is=67299269&hm=2ef583f9da3738c604d582db5d86f145815797880382c931b4b94f39f84d9522&'; // Replace with the URL of an animated GIF for maintenance

    // Retrieve the selected server status
    const status = interaction.options.getString('status');

    // Embed setup based on status
    const embed = new EmbedBuilder()
      .setTitle('**ZyroniX Developments**');

    if (status === 'online') {
      embed
        .setColor('#00FF00') // Green for online
        .setDescription(`Server Has Been Restarted <@&${roleId}>`)
        .setImage(onlineGif);
    } else if (status === 'maintenance') {
      embed
        .setColor('#FF0000') // Red for maintenance
        .setDescription(`Server Under Maintenance. Please wait until maintenance is over. **Do not try to connect** <@&${roleId}>`)
        .setImage(maintenanceGif);
    }

    try {
      // Fetch the channel and send the message there
      const channel = await interaction.client.channels.fetch(channelId);
      if (channel) {
        await channel.send({ embeds: [embed] });
        await interaction.deferReply({ ephemeral: true });
      } else {
        console.error('Channel not found');
      }
    } catch (error) {
      console.error('Error sending the maintenance message:', error);
    }
  },
};
