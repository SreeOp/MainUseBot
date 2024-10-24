const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder, ChannelType } = require('discord.js');
const axios = require('axios'); // To fetch the background image and avatar

module.exports = async (client) => {
  const channelId = '1297917830527979531'; // Replace with the ID of your welcome channel
  const backgroundImageUrl = 'https://cdn.discordapp.com/attachments/1259527025446621224/1298972302117048350/Zyronix.png?ex=671b81ba&is=671a303a&hm=ad70ea80003aad088223297d312ecbb3cfd844272ded320f9a1fcb90c6dcb392&'; // Replace with your image URL

  client.on('guildMemberAdd', async (member) => {
    try {
      // Fetch the target channel
      const channel = await client.channels.fetch(channelId);

      if (!channel || channel.type !== ChannelType.GuildText) {
        console.error('Invalid channel or channel type.');
        return;
      }

      // Fetch the user's avatar
      const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
      const { data: avatarBuffer } = await axios.get(avatarUrl, { responseType: 'arraybuffer' });

      // Fetch the background image from URL
      const { data: backgroundBuffer } = await axios.get(backgroundImageUrl, { responseType: 'arraybuffer' });

      // Create canvas
      const canvas = createCanvas(564, 188); // Use your custom image size here
      const ctx = canvas.getContext('2d');

      // Load the background image
      const background = await loadImage(backgroundBuffer);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Load the user's avatar
      const avatar = await loadImage(avatarBuffer);
      ctx.save();
      // Draw circular avatar
      ctx.beginPath();
      ctx.arc(100, 94, 50, 0, Math.PI * 2, true); // Adjust coordinates to fit your design
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 50, 44, 100, 100); // Adjust dimensions as necessary
      ctx.restore();

      // Write the user's name
      ctx.font = '28px sans-serif'; // You can set a custom font if needed
      ctx.fillStyle = '#ffffff'; // Set the text color
      ctx.fillText(`Welcome, ${member.user.username}!`, 180, 94); // Adjust position to fit your design

      // Convert the canvas to a buffer
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

      // Send the welcome message with the image
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
