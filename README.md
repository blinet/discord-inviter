# Discord-inviter

[![downloadsBadge](https://img.shields.io/npm/dt/discord-inviter)](https://npmjs.com/discord-inviter)

[![versionBadge](https://img.shields.io/npm/v/discord-inviter)](https://npmjs.com/discord-inviter)

[![discordBadge](https://img.shields.io/discord/828240195236266005?color=7289da)](https://discord.gg/VwTxJaqjsJ)

## Installation

### Install **[discord-inviter](https://npmjs.com/package/discord-inviter)**

```sh

$ npm install discord-inviter

```

### Install **[discord.js](https://npmjs.com/package/discord.js)**

```sh

$ npm install discord.js

```

# Features

- Simple & easy to use 🎗️

- Support vanity urls 🔗

- Returns full object with invite data 📡

## Getting Started

At first install the [discord-inviter](https://npmjs.com/discord-inviter) package

```js

const { Client, Intents } = require("discord.js");

const client = new Client({

  intents: [

    Intents.FLAGS.GUILDS,

    Intents.FLAGS.GUILD_MESSAGES,

    Intents.FLAGS.GUILD_MEMBERS,

    Intents.FLAGS.GUILD_INVITES,

  ],

});

const tracker = require("discord-inviter");

const inviteTracker = new tracker.inviteTracker(client);

// "memberAdd" client event to get full invite data

client.on("memberAdd", async (member, inviter, invite, error) => {

  let channel = member.guild.channels.cache.get("0000000000000000");

  // Get the channel to send

  channel.send(

    `Welcome ${member.user}, invited by <@!${inviter.id}>, code ${invite.code}, invite count ${invite.count}`

  );

  // Send the welcome message

});

// "error" event to get any error

inviteTracker.on("error", (guild, err) => {

  console.log(err);

});

```

## Examples of bots made with Discord Inviter

- **[Discord-welcomer](https://github.com/Zsl8/discord-welcomer)** by [Z.](https://github.com/Zsl8)
