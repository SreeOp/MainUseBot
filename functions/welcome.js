const Discord = require('discord.js');
const canvas = require('@napi-rs/canvas');

module.exports = (client) => {
  
  const welcomeChannelId = '1297917830527979531';

  client.on('guildMemberAdd', async (member) => {
    // Create the canvas
    const frame = canvas.createCanvas(1080, 387);
    const ctx = frame.getContext('2d');

    // Load the background image
    const bg = await canvas.loadImage('https://i.ibb.co/YpFDX5c/welcome-image-1.png');
    ctx.drawImage(bg, 0, 0, frame.width, frame.height);

    // Member username and avatar
    const username = member.user.username;
    const avatar = await canvas.loadImage(
      member.user.displayAvatarURL({ format: 'png', size: 256 })
    );

    // Draw the circular avatar
    const radius = 150; // Adjusted radius for a better fit
    const avatarX = 220; // X-coordinate for avatar placement
    const avatarY = 200; // Y-coordinate for avatar placement

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX - radius, avatarY - radius, radius * 2, radius * 2);
    ctx.restore();

    // Add username text
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial'; // Adjust font size to fit the design
    ctx.fillText(username, 140, 340); // Adjusted position for the username

    // Create an image attachment
    const attachment = new Discord.AttachmentBuilder(await frame.encode('png'), {
      name: 'welcome-image.png',
    });

    // Send the image to the welcome channel
    const welcomeChannel = client.channels.cache.get(welcomeChannelId);
    welcomeChannel.send({
      content: `Welcome to NightCity Roleplay, ${member}!`,
      files: [attachment],
    });
  });
};
