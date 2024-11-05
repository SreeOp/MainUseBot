const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Set the server status to Online or Under Maintenance')
    .addStringOption(option => 
      option.setName('type')
        .setDescription('Select the server status')
        .setRequired(true)
        .addChoices(
          { name: 'Server Online', value: 'online' },
          { name: 'Server Under Maintenance', value: 'maintenance' }
        )
    ),
  async execute(interaction) {
    const roleId = '1046786167644880946'; // Replace with your role ID
    const onlineGif = 'https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=672ae3e9&is=67299269&hm=2ef583f9da3738c604d582db5d86f145815797880382c931b4b94f39f84d9522&'; // Replace with the URL of an animated GIF for online
    const maintenanceGif = 'https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=672ae3e9&is=67299269&hm=2ef583f9da3738c604d582db5d86f145815797880382c931b4b94f39f84d9522&'; // Replace with the URL of an animated GIF for maintenance

    // Retrieve the selected status
    const type = interaction.options.getString('type');

    let embed;

    if (type === 'online') {
      // Server Online selected
      embed = new EmbedBuilder()
        .setTitle('**ZyroniX Developments**')
        .setColor('#00FF00') // Green color for online
        .setDescription(`Server Has Been Restarted <@&${roleId}>`)
        .setImage(onlineGif);
    } else if (type === 'maintenance') {
      // Server Under Maintenance selected
      embed = new EmbedBuilder()
        .setTitle('**ZyroniX Developments**')
        .setColor('#FF0000') // Red color for maintenance
        .setDescription(`Server Under Maintenance. Please wait until maintenance is over. **Do not try to connect** <@&${roleId}>`)
        .setImage(maintenanceGif);
    }

    // Send the embed message to the channel
    await interaction.reply({ embeds: [embed] });
  },
};
