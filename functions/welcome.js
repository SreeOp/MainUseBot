const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    const channelId = '1297917830527979531'; // Replace with the channel ID where the welcome message should be sent
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) return console.error('Channel not found.');

    // Define the URL for the background image (Discord media URL)
    const backgroundUrl = 'https://cdn.discordapp.com/attachments/1056903195961610275/1299665226802663465/background-image.png?ex=671e0710&is=671cb590&hm=d9c5f4a746caca90a2b37d1522fb6c0f1175312224df3b0abe7a34daccb86dac&'; // Replace with your image URL

    // Load the custom background image from the URL
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    const response = await fetch(backgroundUrl);
    const buffer = await response.buffer();
    const background = await Canvas.loadImage(buffer);

    // Create a canvas and set its dimensions (use the dimensions of your background image)
    const canvas = Canvas.createCanvas(background.width, background.height);
    const context = canvas.getContext('2d');

    // Draw the background image onto the canvas
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Load the user's avatar
    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'png' }));

    // Updated avatar size and coordinates
    const avatarWidth = 71.3;
    const avatarHeight = 67.6;
    const avatarX = 252.83; // X-coordinate for the avatar placement (left)
    const avatarY = 98.56; // Y-coordinate for the avatar placement (top)

    // Draw the user's avatar with updated coordinates and size
    context.save();
    context.beginPath();
    context.arc(
      avatarX + avatarWidth / 2,
      avatarY + avatarHeight / 2,
      Math.min(avatarWidth, avatarHeight) / 2,
      0,
      Math.PI * 2,
      true
    );
    context.closePath();
    context.clip();
    context.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);
    context.restore();

    // Add only the user's name onto the image
    context.font = '21px sans-serif'; // Updated text size
    context.fillStyle = '#ffffff'; // White color for the text
    context.fillText(
      `${member.user.username}`, 
      271.52,  // X-coordinate (left)
      121.89,  // Y-coordinate (top)
      199.06   // Max text width
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
