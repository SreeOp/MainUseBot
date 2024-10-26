const Discord = require('discord.js');
const canvas = require('@napi-rs/canvas');

module.exports = (client) => {
  
  const welcomeChannelId = '1297917830527979531';

  client.on('guildMemberAdd', async (member) => {
       
    const frame = canvas.createCanvas(2000, 647);
    const ctx = frame.getContext('2d');
const bg = await canvas.loadImage('https://cdn.discordapp.com/attachments/1056903195961610275/1299681884833579058/file.png?ex=671e1694&is=671cc514&hm=5564987c8d3d12ef38b25f381c10716c658a39d0e53cbc37a430b150ec6ba4a4&');
ctx.drawImage(bg, 0, 0, frame.width, frame.height);

      const username = member.user.username;
const avatar = await canvas.loadImage(member.user.displayAvatarURL({ format: 'png', size: 256 }));
 
const radius = 100;
  ctx.save();
  ctx.beginPath();
  ctx.arc(1598, 250, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 1598 - radius, 250 - radius, radius * 2, radius * 2);
  ctx.restore();

    ctx.fillStyle = 'white';
    ctx.font = '80px Ariel';
    ctx.fillText(username, 1425, 90);

    const attachment = new Discord.AttachmentBuilder(await frame.encode('png'), 'welcome-image.png');

    const welcomeChannel = client.channels.cache.get(welcomeChannelId);
    welcomeChannel.send({ content: `Welcome to tts, ${member}!`, files: [attachment]});
  });

};
