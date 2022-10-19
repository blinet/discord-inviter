var Event = require("events");
///// Error log /////
var error = (err) => {
  throw new Error(err);
};

/////
class inviteTracker extends Event {
  ////
  constructor(client) {
    if (!client || typeof client != "object")
      return error("can't create tracker without discord client!");
    try {
      super();
      this.client = client;
      this.invites = new Map();
      this.invitesVanity = new Map();
      this.client.on("ready", () => this.ready());
      this.client.on("guildCreate", async (guild) => this.guildCreate(guild));
      this.client.on("guildDelete", async (guild) => this.guildDelete(guild));
      this.client.on("inviteCreate", async (invite) =>
        this.inviteUpdate(invite)
      );
      this.client.on("inviteDelete", async (invite) =>
        this.inviteUpdate(invite)
      );
      this.client.on("guildMemberAdd", async (member) =>
        this.memberAdd(member)
      );
    } catch (e) {
      try {
        this.emit("error", null, e);
      } catch {}
    }
  }

  ////
  static async getMemberInvites(member) {
    try {
      if (!member?.guild || !member?.user)
        return error("can't find guild member !");
      var guildInvites = await (member.guild?.invites
          ? member.guild.invites.fetch()
          : member.guild.fetchInvites()),
        invite = guildInvites
          ?.filter((i) => i?.inviter?.id == member?.user?.id)
          ?.map((i) => {
            return {
              code: i.code,
              uses: i.uses,
            };
          });
      return {
        count: invite?.reduce((p, v) => p + v.uses, 0),
        codes: invite?.map((i) => i.code),
      };
    } catch (e) {
      return error(e);
    }
  }

  ////
  static async getTopInvites(guild) {
    if (!guild?.id) return error("can't find the guild !");
    try {
      var guildInvites = await (guild?.invites
          ? guild.invites.fetch()
          : guild.fetchInvites()),
        memberInvites = [...new Set(guildInvites?.map((i) => i?.inviter?.id))],
        top = memberInvites
          .map((inv) => {
            var invite = guildInvites
              ?.filter((i) => i?.inviter?.id == inv)
              ?.map((i) => {
                return {
                  code: i.code,
                  uses: i.uses,
                  inviter: i.inviter,
                };
              });

            return {
              user: invite[0]?.inviter,
              count: invite?.reduce((p, v) => p + v.uses, 0),
              codes: invite?.map((i) => i.code),
            };
          })
          ?.sort((a, b) => b.count - a.count);
      return top;
    } catch (e) {
      return error(e);
    }
  }

  ////
  static async getInfo(client, code) {
    if (!client || typeof client != "object")
      return error("can't get info without discord client!");
    if (!code) return error("Invite code required");
    try {
      var invite = await client.api.invites(code).get();
      invite.url = `https://discord.gg/${invite.code}`;
      if (invite.inviter)
        invite.inviter.tag = `${invite.inviter.username}#${invite.inviter.discriminator}`;
      return invite;
    } catch (e) {
      return null;
    }
  }

  ////
  async resolveInvites(guild, invites) {
    try {
      if (invites) {
        invites = invites.map((i) => this.tempInvites(i));
        this.invites.set(guild.id, invites);
      }
      if (guild.features.includes("VANITY_URL")) {
        var vanityData = await guild.fetchVanityData();
        if (vanityData?.code)
          this.invitesVanity.set(guild.id, {
            code: vanityData.code,
            uses: vanityData.uses,
          });
      }
    } catch (e) {
      try {
        this.emit("error", guild, e);
      } catch {}
    }
  }

  ////
  tempInvites(invite) {
    return {
      code: invite.code,
      url: invite.url,
      uses: invite.uses,
      inviter: invite.inviter,
    };
  }

  ////
  async ready() {
    this.client.guilds.cache.map(async (g) => {
      try {
        var invites = await (g?.invites ? g.invites.fetch() : g.fetchInvites());
        this.resolveInvites(g, invites);
      } catch (e) {
        try {
          this.emit("error", g, e);
        } catch {}
      }
    });
  }

  ////
  async inviteUpdate(invite) {
    try {
      var invites = await (invite.guild?.invites
        ? invite.guild.invites.fetch()
        : invite.guild.fetchInvites());
      this.resolveInvites(invite.guild, invites);
    } catch (e) {
      try {
        this.emit("error", invite.guild, e);
      } catch {}
    }
  }

  ////
  async guildCreate(guild) {
    try {
      var invites = await (guild?.invites
        ? guild.invites.fetch()
        : guild.fetchInvites());
      this.resolveInvites(guild, invites);
    } catch (e) {
      try {
        this.emit("error", guild, e);
      } catch {}
    }
  }

  ////
  async guildDelete(guild) {
    return this.invites.delete(guild.id);
  }

  ////
  async memberAdd(member) {
    var resData;
    try {
      if (member.user.bot) {
        var log = await member.guild
            .fetchAuditLogs({ type: "BOT_ADD" })
            .then((audit) => audit.entries.first()),
          user = log?.executor,
          bot = log?.target;
        if (bot?.id == member?.user?.id) {
          resData = {
            invite: {
              code: "Unknown",
              url: "Unknown",
              count: "Unknown",
            },
            inviter: user,
            member: member,
          };
        }
      } else {
        var guildInvites = await (member.guild?.invites
            ? member.guild.invites.fetch()
            : member.guild.fetchInvites()),
          tempInvites = this.invites.get(member.guild.id),
          ///

          findInvite = await guildInvites?.find((invite) =>
            tempInvites?.find(
              (inv) => inv.code == invite.code && invite.uses > inv.uses
            )
          );
        ///
        if (!findInvite) {
          var current = await guildInvites.filter(
              (inv) => !tempInvites.find((c) => c.code == inv.code)
            ),
            res = await current.filter((c) =>
              guildInvites.find((inv) => inv.code == c.code)
            );
          findInvite = res.find((inv) => inv.uses == 1);
        }
        ///
        if (findInvite) {
          resData = {
            invite: {
              code: findInvite?.code,
              url: findInvite.url,
              count: guildInvites
                ?.filter((i) => i?.inviter?.id == findInvite?.inviter?.id)
                ?.reduce((p, v) => p + v.uses, 0),
            },
            inviter: findInvite.inviter,
            member: member,
          };
        } else if (
          !findInvite &&
          member.guild.features.includes("VANITY_URL")
        ) {
          var ownerId = member.guild?.ownerId ?? member.guild?.ownerID,
            owner = await member.guild.members.fetch(ownerId);
          findInvite = this.invitesVanity.get(member.guild.id);
          var vanityData = await member.guild.fetchVanityData();
          if (findInvite?.uses < vanityData?.uses) {
            this.invitesVanity.set(member.guild.id, {
              code: vanityData.code,
              uses: vanityData.uses,
            });
            resData = {
              invite: {
                code: vanityData?.code,
                url: `https://discord.gg/${vanityData?.code}`,
                count: vanityData?.uses,
              },
              inviter: owner.user,
              member: member,
            };
          }
        }
        this.resolveInvites(member.guild, guildInvites);
      }
      if (!resData) {
        var ownerId = member.guild?.ownerId ?? member.guild?.ownerID,
          owner = await member.guild.members.fetch(ownerId);
        resData = {
          invite: {
            code: "Unknown",
            url: "Unknown",
            count: guildInvites
              ?.filter((i) => i?.inviter?.id == owner?.user.id)
              ?.reduce((p, v) => p + v.uses, 0),
          },
          inviter: owner.user,
          member: member,
        };
      }
      
      resData.inviter.member = await member.guild.members.fetch(resData.inviter.id)
      
      this.emit(
        "guildMemberAdd",
        resData.member,
        resData.inviter,
        resData.invite,
        false
      );
      return;
    } catch (e) {
      this.emit("guildMemberAdd", member, null, null, e);
      try {
        this.emit("error", member.guild, e);
      } catch {}
    }
  }
}

module.exports = {
  inviteTracker,
};
