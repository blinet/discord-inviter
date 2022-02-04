
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
const { Client, Intents } = require("discord.js"); // npm i discord.js
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_INVITES,
  ],
});

var { inviteTracker } = require("discord-inviter"), // npm i discord-inviter
  tracker = new inviteTracker(client);

client.on("ready", () => console.log("Bot Ready"));

// "guildMemberAdd"  event to get full invite data
tracker.on("guildMemberAdd", async (member, inviter, invite, error) => {
  // return when get error
  if(error) return console.error(error);
  // get the channel
  let channel = member.guild.channels.cache.get("939210311276306455"),
    Msg = `Welcome ${member.user}, invited by <@!${inviter.id}>, code ${invite.code}, invite count ${invite.count}`;
  // change welcome message when the member is bot
  if (member.user.bot)
    Msg = `Welcome ${member.user}, invited by <@!${inviter.id}>`;
  // send welcome message
  channel.send(Msg);
});

// "error" event to get any error
tracker.on("error", (guild, err) => {
  console.error(guild?.name, err);
});

client.on("messageCreate", async (message) => {
  // get member invites count
  if (message.content == "invites") {
    var invite = await inviteTracker.getMemberInvites(message.member);
    message.channel.send(
      `${message.author.tag} has ${invite.count} invite(s).`
    );
    // get server top invites
  } else if (message.content == "top-invites") {
    var top = await inviteTracker.getTopInvites(message.guild);
    message.channel.send(
      top
        .map((i, n) => `\`#${n + 1}\`- **${i.user.tag}** has __${i.count}__`)
        .join("\n")
    );
  }
});
```

## Examples of bots made with Discord Inviter

- **[Discord-welcomer](https://github.com/Zsl8/discord-welcomer)** by [Z.](https://github.com/Zsl8)
