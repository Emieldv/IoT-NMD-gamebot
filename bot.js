require('dotenv').config();

const Discord = require('discord.js');
const fetch = require('node-fetch');
const https = require("https");
var help = require("./help.json")
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//
//functions which need SteamID to function
//

// find steam id and redirect to right function
function findSteamId(username, msg, integer) {
  https.get("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + process.env.STEAM_TOKEN + "&vanityurl=" + username, res => {
          res.setEncoding("utf8");

          let bodySteam = "";

          res.on("data", steamData => {
            bodySteam += steamData;
          });

          res.on("end", () => {
            bodySteam = JSON.parse(bodySteam);

            if (bodySteam.response.success === 1) {
              searchId = (bodySteam.response.steamid)

              // function to redirect to right function
              if (integer === 1) {
                steamProfile(searchId, msg)
              }

              // Show error if no profile is available
            } else {
              msg.channel.send({
                "embed": {
                  "title": "❌ No such account exists :(",
                  "color": 640001
                }
              });
            }
          })
        });
}

// create Steam profile mesage
function steamProfile(id, msg) {

  https.get("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + process.env.STEAM_TOKEN + "&steamids=" + id, res => {
    res.setEncoding("utf8");
    let bodySteam2 = "";

    res.on("data", steamData2 => {
      bodySteam2 += steamData2;
    });

    res.on("end", () => {
      bodySteam2 = JSON.parse(bodySteam2)

      var nickname = (bodySteam2.response.players[0].personaname);
      var profileUrl = (bodySteam2.response.players[0].profileurl);
      var avatar = (bodySteam2.response.players[0].avatarmedium);
      var realName = (bodySteam2.response.players[0].realname);

      msg.channel.send({
        "embed": {
          "title": realName,
          "description": "info over gamer",
          "color": 640001,
          "timestamp": new Date(),
          "thumbnail": {
            "url": avatar
          },
          "author": {
            "name": nickname,
            "url": profileUrl,
            "icon_url": avatar
          }
        }
      })
    })
  })
}

//
// check if message starts with "!" and redirect
//
client.on('message', msg => {
  if (msg.content.substring(0, 1) == '!') {
    var args = msg.content.substring(1).split(' ');
    var cmd = args[0];
    var username = args[1]

    switch (cmd) {

      // !bert
      case 'bert':

        msg.channel.send({
          "embed": {
            "title": "Bert is een goeie gast!",
            "color": 640001,
            "timestamp": new Date(),
            "footer": {},
            "image": {
              "url": "https://scontent-bru2-1.xx.fbcdn.net/v/t1.0-9/58629941_2945068898851767_6537583791001567232_o.jpg?_nc_cat=103&_nc_sid=85a577&_nc_ohc=IgbPdhqac5sAX8spvCr&_nc_ht=scontent-bru2-1.xx&oh=da33fd88ff32dcc43709d926a47d5340&oe=5EC59808"
            },
            "author": {
              "name": "Emiel's Bot",
              "url": "https://www.facebook.com/photo.php?fbid=2945068895518434&set=a.157371010954917&type=3&theater",
              "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
            }
          }
        })
        break;

      // !cat
      case 'cat':

        async function getCat() {
          const {
            file
          } = await fetch('https://aws.random.cat/meow').then(response => response.json());
          msg.channel.send(file)
        }

        getCat()
        break;

      // !help
      case 'help':

        msg.channel.send(help)
        
        break;

      // !profile <Profilename>
      case 'profile':

        findSteamId(username, msg, 1)

        break;
      
      // Error message if command is not found
      default:
        msg.channel.send({
          "embed": {
            "title": "❌ Type !help to see the possible commands",
            "color": 640001
          }
        })
    }
  }
});

client.login(process.env.DISCORD_TOKEN);