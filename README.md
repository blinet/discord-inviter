# Discord-inviter
<div align="center">
  <p>
 <a href="https://github.com/arosteam"><img src="https://img.shields.io/static/v1?label=powered%20by&message=Aros&color=000636&style=for-the-badge&logo=Windows%20Terminal&logoColor=fff"/></a>
 <a href="https://www.npmjs.com/package/discord-inviter"><img src="https://img.shields.io/npm/v/discord-inviter.svg?style=for-the-badge" alt="NPM version" /></a>
 <a href="https://www.npmjs.com/package/discord-inviter"><img src="https://img.shields.io/npm/dt/discord-inviter.svg?maxAge=3600&style=for-the-badge" alt="NPM downloads" /></a>
     <a href="https://paypal.me/arosteam?country.x=SA&locale.x=ar_EG"><img src="https://img.shields.io/badge/-donate-blue.svg?logo=paypal&style=for-the-badge" alt="NPM downloads" /></a>

  </p>
  
</div>

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
    // get info of any invite code
  } else if (message.content == "invite-info") {
    var invite = await inviteTracker.getInfo(client, "VwTxJaqjsJ");
    if (!invite) return;
    
    message.channel.send(
      `Guild: ${invite.guild.name},\nInviter: ${
        invite?.inviter
          ? `${invite.inviter.tag}`
          : "Owner"
      },\nLink: ${invite.url}`
    );
  }
});
```
## Thanks.
