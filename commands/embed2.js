const { SlashCommandBuilder } = require('discord.js');

// Define the role IDs allowed to use the command
const AllowedRoleIDs = ['1007930481716760666', '1046786167644880946']; // Replace with actual role IDs

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embedimage')
    .setDescription('Send an embedded message')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description of the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image1')
        .setDescription('First image URL for the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image2')
        .setDescription('Second image URL for the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image3')
        .setDescription('Third image URL for the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer text for the embed')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Embed color in HEX format')
        .setRequired(false)),
  async execute(interaction) {
    // Check if user has any of the allowed roles by ID
    const memberRoles = interaction.member.roles.cache;
    const hasAllowedRole = memberRoles.some(role => AllowedRoleIDs.includes(role.id));

    if (!hasAllowedRole) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const title = interaction.options.getString('title') || '\u200B';
    const description = interaction.options.getString('description') || '\u200B';
    const image1 = interaction.options.getString('image1');
    const image2 = interaction.options.getString('image2');
    const image3 = interaction.options.getString('image3');
    const footer = interaction.options.getString('footer') || '\u200B';
    let color = interaction.options.getString('color');

    // Validate color format if provided
    if (color && !/^#([0-9a-fA-F]{6})$/.test(color)) {
      return interaction.reply({ content: 'Invalid color format. Please use HEX format (#RRGGBB).', ephemeral: true });
    }

    // Convert HEX color to integer
    if (color) {
      color = parseInt(color.replace('#', ''), 16);
    } else {
      color = 0x0099ff; // Default color if not provided or invalid
    }

    const embed = {
      color: color,
      title: title,
      description: description,
      footer: { text: footer },
      fields: []
    };

    // Add images to fields
    if (image1) {
      embed.fields.push({ name: 'Image 1', value: '\u200B', inline: false }, { name: '\u200B', value: `[⠀](${image1})`, inline: false });
    }
    if (image2) {
      embed.fields.push({ name: 'Image 2', value: '\u200B', inline: false }, { name: '\u200B', value: `[⠀](${image2})`, inline: false });
    }
    if (image3) {
      embed.fields.push({ name: 'Image 3', value: '\u200B', inline: false }, { name: '\u200B', value: `[⠀](${image3})`, inline: false });
    }

    try {
      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: 'Embed message sent!', ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Failed to send embed message.', ephemeral: true });
    }
  },
};
