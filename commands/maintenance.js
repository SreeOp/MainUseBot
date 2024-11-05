const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Set server status to Online or Under Maintenance in the current channel')
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
    const roleId = '1299270070534668324'; // Replace with the role ID to mention
    const onlineGif = 'https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=672ae3e9&is=67299269&hm=2ef583f9da3738c604d582db5d86f145815797880382c931b4b94f39f84d9522&'; // Replace with URL for online GIF
    const maintenanceGif = 'https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=672ae3e9&is=67299269&hm=2ef583f9da3738c604d582db5d86f145815797880382c931b4b94f39f84d9522&'; // Replace with URL for maintenance GIF

    const status = interaction.options.getString('status');
    const channel = interaction.channel;

    // Create the embed based on the selected status
    const embed = new EmbedBuilder()
      .setTitle('**ZyroniX Developments**');

    if (status === 'online') {
      embed
        .setColor('#00FF00') // Green color for online status
        .setDescription(`Server Has Been Restarted <@&${roleId}>`)
        .setImage(onlineGif);
    } else if (status === 'maintenance') {
      embed
        .setColor('#FF0000') // Red color for maintenance status
        .setDescription(`Server Under Maintenance. Please wait until maintenance is over. **Do not try to connect** <@&${roleId}>`)
        .setImage(maintenanceGif);
    }

    // Send the embed in the same channel where the command was used
    await channel.send({ embeds: [embed] });
    // Send an ephemeral reply to confirm the action without showing in public chat
    await interaction.reply({ content: 'Maintenance status updated in this channel.', ephemeral: true });
  },
};
