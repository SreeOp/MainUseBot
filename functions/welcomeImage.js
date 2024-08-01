const { createCanvas, loadImage } = require('canvas');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

const WELCOME_IMAGE_URL = 'https://cdn.discordapp.com/attachments/1188478795850723479/1268551427966632018/UCHIHA_1.png?ex=66acd614&is=66ab8494&hm=4fb4f1883fd002a5ec49e30417e7bfaa14f0512c81d0c41a87ea94cbbc651820&'; // Replace with your image URL
const CHANNEL_ID = process.env.CHANNEL_ID; // Ensure you have CHANNEL_ID in your environment variables

async function welcomeImage(member, channel) {
    try {
        const canvas = createCanvas(564, 188);
        const ctx = canvas.getContext('2d');

        // Load the custom background image from URL
        const background = await loadImage(WELCOME_IMAGE_URL);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Set styles for the user name
        ctx.font = '28px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Welcome', 200, 60); // Adjusted positioning for new dimensions
        ctx.font = '24px sans-serif';
        ctx.fillText(member.user.tag, 200, 100); // Adjusted positioning for new dimensions

        // Draw the user's avatar
        const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png' }));
        ctx.drawImage(avatar, 20, 20, 140, 140); // Adjusted dimensions and positioning for new dimensions

        // Convert canvas to a buffer and attach to embed
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });

        // Create an embed
        const embed = new EmbedBuilder()
            .setTitle(`Welcome to the server, ${member.displayName}!`)
            .setColor(0x00AE86)
            .setImage('attachment://welcome-image.png')
            .setDescription(`Hello ${member.displayName}, welcome to our server! We are glad to have you here.`)
            .setTimestamp();

        // Send the embed to the specified channel
        const targetChannel = await member.client.channels.fetch(CHANNEL_ID);
        if (targetChannel) {
            await targetChannel.send({ embeds: [embed], files: [attachment] });
        } else {
            console.error('Channel not found');
        }
    } catch (error) {
        console.error('Error creating or sending welcome image:', error);
    }
}

module.exports = { welcomeImage };
