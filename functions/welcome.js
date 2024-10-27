const Discord = require('discord.js');
const canvas = require('@napi-rs/canvas');

module.exports = (client) => {
  
  const welcomeChannelId = '1297917830527979531';

  client.on('guildMemberAdd', async (member) => {
       
    const frame = canvas.createCanvas(2000, 932);
    const ctx = frame.getContext('2d');
const bg = await canvas.loadImage('https://cdn.discordapp.com/attachments/1056903195961610275/1300060993723830332/Welcome_20241027_170617_0000_upscaled.png?ex=671f77a6&is=671e2626&hm=ed3283666f8927d185333048776a1fabb1cd93abb7f7e278b3a0cef2011c78bc&');
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
    ctx.font = '70px Ariel';
    ctx.fillText(username, 1425, 90);

    const attachment = new Discord.AttachmentBuilder(await frame.encode('png'), 'welcome-image.png');

    const welcomeChannel = client.channels.cache.get(welcomeChannelId);
    welcomeChannel.send({ content: `Welcome to FarX, ${member}!`, files: [attachment]});
  });

};
