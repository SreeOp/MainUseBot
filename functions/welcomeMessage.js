const { registerFont, createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder, ChannelType } = require('discord.js');
const axios = require('axios'); // To fetch the user's avatar

// Load a custom font if needed
registerFont('./path-to-font/YourCustomFont.ttf', { family: 'CustomFont' });

module.exports = async (client) => {
  const channelId = '1259527025446621224'; // Replace with the ID of your welcome channel
  const backgroundImage = './Zyronix.png'; // Path to your custom background image

  client.on('guildMemberAdd', async (member) => {
    try {
      // Fetch the target channel
      const channel = await client.channels.fetch(channelId);

      if (!channel || channel.type !== ChannelType.GuildText) {
        console.error('Invalid channel or channel type.');
        return;
      }

      // Fetch user's avatar
      const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
      const { data: avatarBuffer } = await axios.get(avatarUrl, { responseType: 'arraybuffer' });

      // Create canvas
      const canvas = createCanvas(564, 188); // Use your custom image size here
      const ctx = canvas.getContext('2d');

      // Load background image
      const background = await loadImage(backgroundImage);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Load user's avatar
      const avatar = await loadImage(avatarBuffer);
      ctx.save();
      // Draw circular avatar
      ctx.beginPath();
      ctx.arc(100, 94, 50, 0, Math.PI * 2, true); // Adjust coordinates to fit your design
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 50, 44, 100, 100); // Adjust dimensions as necessary
      ctx.restore();

      // Write user name
      ctx.font = '28px CustomFont'; // Use the font you registered above
      ctx.fillStyle = '#ffffff'; // Set text color
      ctx.fillText(`Welcome, ${member.user.username}!`, 180, 94); // Adjust position to fit your design

      // Convert canvas to buffer
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

      // Send welcome message with the image
      await channel.send({
        content: `Welcome to the server, ${member.user}! 🎉`,
        files: [attachment],
      });

      console.log(`Welcome message sent to ${member.user.username}`);
    } catch (error) {
      console.error('Error sending the welcome message:', error);
    }
  });
};
