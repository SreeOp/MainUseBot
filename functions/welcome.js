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

    // Draw the user's avatar
    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png' }));
    const avatarSize = 128; // Define the size of the avatar
    const avatarX = 100; // X-coordinate for the avatar placement
    const avatarY = 100; // Y-coordinate for the avatar placement

    // Draw the user's avatar with a circular mask
    context.save();
    context.beginPath();
    context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();
    context.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    context.restore();

    // Add the user's name onto the image
    context.font = '40px sans-serif';
    context.fillStyle = '#ffffff'; // White color for the text
    context.fillText(`Welcome, ${member.user.username}!`, 280, 150); // Customize the text position

    // Convert the canvas to a buffer and send it as an attachment in the channel
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

    // Send the welcome message with the image, mentioning the user
    await channel.send({
      content: `Welcome to the server, <@${member.user.id}>!`,
      files: [attachment],
    });
  });
};
