const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    const channelId = '1297917830527979531'; // Replace with your target channel ID
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) {
      console.error('Channel not found.');
      return;
    }

    try {
      // Load the custom background image
      const background = await Canvas.loadImage(path.join(__dirname, '../assets/background-image.png'));

      // Create a canvas with the background image dimensions
      const canvas = Canvas.createCanvas(background.width, background.height);
      const context = canvas.getContext('2d');

      // Draw the background image onto the canvas
      context.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Load the user's avatar as a PNG
      const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png', size: 128 }));

      // Draw the user's avatar
      const avatarWidth = 71.3; // Updated width
      const avatarHeight = 67.6; // Updated height
      const avatarX = 252.83; // Updated X-coordinate (left)
      const avatarY = 98.56; // Updated Y-coordinate (top)

      context.save();
      context.beginPath();
      context.arc(avatarX + avatarWidth / 2, avatarY + avatarHeight / 2, Math.min(avatarWidth, avatarHeight) / 2, 0, Math.PI * 2, true);
      context.closePath();
      context.clip();
      context.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);
      context.restore();

      // Add the user's name onto the image
      context.font = '21px sans-serif'; // Updated text size
      context.fillStyle = '#ffffff'; // White color for the text
      context.fillText(
        `${member.user.username}`,
        271.52,  // X-coordinate (left)
        121.89,  // Y-coordinate (top)
        199.06   // Max text width
      );

      // Convert the canvas to a buffer and send it as an attachment
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

      // Send the welcome message with the image, mentioning the user
      await channel.send({
        content: `<@${member.user.id}> has joined the server!`,
        files: [attachment],
      });
    } catch (error) {
      console.error('Error generating welcome image:', error);
    }
  });
};
