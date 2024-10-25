const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    const channelId = '1297917830527979531'; // Replace with the channel ID where the welcome message should be sent
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) return console.error('Channel not found.');

    // Load the custom background image with the correct file path
    const background = await Canvas.loadImage(path.join(__dirname, '../assets/background-image.png'));

    // Create a canvas and set its dimensions (use the dimensions of your background image)
    const canvas = Canvas.createCanvas(background.width, background.height);
    const context = canvas.getContext('2d');

    // Draw the background image onto the canvas
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Load the user's avatar
    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png' }));

    // Updated avatar size and coordinates
    const avatarWidth = 400; // Width of the avatar
    const avatarHeight = 300; // Height of the avatar
    const avatarX = 1037; // X-coordinate for the avatar placement (left)
    const avatarY = 390; // Y-coordinate for the avatar placement (top)

    // Draw the user's avatar with updated coordinates and size
    context.save();
    context.beginPath();
    context.arc(avatarX + avatarWidth / 2, avatarY + avatarHeight / 2, Math.min(avatarWidth, avatarHeight) / 2, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();
    context.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);
    context.restore();

    // Add only the user's name onto the image
    context.font = '51px sans-serif'; // Updated text size
    context.fillStyle = '#ffffff'; // White color for the text
    context.fillText(
      `${member.user.username}`, 
      1433,  // X-coordinate (left)
      546,  // Y-coordinate (top)
      300   // Max text width
    );

    // Convert the canvas to a buffer and send it as an attachment in the channel
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

    // Send the welcome message with the image, mentioning the user
    await channel.send({
      content: `<@${member.user.id}> has joined the server!`,
      files: [attachment],
    });
  });
};
