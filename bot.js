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

        steamProfile(searchId, msg, integer)

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

// create Steam profile mesage or send to requested function
function steamProfile(id, msg, integer) {

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
      var personastate = (bodySteam2.response.players[0].personastate);
      var playerstatus = null;

      if (personastate == 0) {
        playerstatus = "Offline"
      } else if (personastate == 1){
        playerstatus = "Online"
      }
      else if (personastate == 2){
        playerstatus = "Busy"
      }
      else if (personastate == 3){
        playerstatus = "Away"
      }
      else if (personastate == 4){
        playerstatus = "Snoozing"
      }
      else if (personastate == 5){
        playerstatus = "Looking to trade"
      }
      else if (personastate == 6){
        playerstatus = "Looking to play"
      }

      // execute requested function
      if (integer == 2) {

        friends(id, msg, nickname, profileUrl, avatar, realName, playerstatus)

      }else if(integer == 3){

        recent(id, msg, nickname, profileUrl, avatar, realName)

      } else {

        // else only show profile
        msg.channel.send({
          "embed": {
            "title": realName,
            "description": "The player is: " + playerstatus,
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
      }
    })
  })
}

var friendList = []
var friendRealNameList = []

// function to gather and post friendslist
function PostFriendList(name, msg, bodySteam3, nickname, profileUrl, avatar, realName, playerstatus, friendRealName){

  //add nickname to list
  friendList.push(name)

  // if real name is null replace with /, otherwise add real name to list
  if (friendRealName == null){
    friendRealNameList.push("/")
  } else {
    friendRealNameList.push(friendRealName)
  }

  // send the message when list is completed
  if (friendList.length == bodySteam3.friendslist.friends.length){
    msg.channel.send({
      "embed": {
        "title": realName,
        "description": "The player is: " + playerstatus,
        "color": 640001,
        "timestamp": new Date(),
        "thumbnail": {
          "url": avatar
        },
        "author": {
          "name": nickname,
          "url": profileUrl,
          "icon_url": avatar
        },
        "fields": [
          {
            "name": "Friend Nickname",
            "value": friendList,
            "inline": true
          },
          {
            "name": "Real Name",
            "value": friendRealNameList ,
            "inline": true
          }
        ]
      }
    })
  }
}

// function for requesting fiendlist
function friends(id, msg, nickname, profileUrl, avatar, realName, playerstatus){
  
  //reset friendslist
  friendList = []
  friendRealNameList = []

  //get friendlist
  https.get("https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=" + process.env.STEAM_TOKEN + "&steamid=" + id + "&relationship=friend", res => {
    res.setEncoding("utf8");

    let bodySteam3 = "";

    res.on("data", steamData3 => {
      bodySteam3 += steamData3;
    });

    res.on("end", () => {
      bodySteam3 = JSON.parse(bodySteam3);

      //get names of friends and sent them to next function
      bodySteam3.friendslist.friends.forEach(item => {
        // console.log(item.steamid);

        https.get("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + process.env.STEAM_TOKEN + "&steamids=" + item.steamid, res => {
          res.setEncoding("utf8");
          let bodySteam31 = "";

          res.on("data", steamData31 => {
            bodySteam31 += steamData31;
          });

          res.on("end", () => {
          bodySteam31 = JSON.parse(bodySteam31)

          var friendName = bodySteam31.response.players[0].personaname
          var friendRealName = bodySteam31.response.players[0].realname

          // console.log(friendName)
          // console.log(friendRealName)

          PostFriendList(friendName, msg, bodySteam3, nickname, profileUrl, avatar, realName, playerstatus, friendRealName)

          })
        })
      });
    })
  });
}

// Convert time to minutes and hours
function timeConvert(n) {
  var num = n;
  var hours = (num / 60);
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  return rhours + " hours and " + rminutes + " minutes.";
  }

// 
function recent(id, msg, nickname, profileUrl, avatar, realName) {

  //Get recent list
  https.get("https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=" + process.env.STEAM_TOKEN + "&steamid=" + id, res => {
    res.setEncoding("utf8");

    let bodySteam4 = "";

    res.on("data", steamData4 => {
      bodySteam4 += steamData4;
    });

    res.on("end", () => {
      bodySteam4 = JSON.parse(bodySteam4);

      var recentCount = bodySteam4.response.total_count
      var recentNames = []
      var playTime = []

      // check if there are recent games
      if (bodySteam4.response.games == null){
        msg.channel.send({
          "embed": {
            "title": "❌ No recent played games :(",
            "color": 640001
          }
        });
      } else {
        //create recent lists
        bodySteam4.response.games.forEach(item => {
          recentNames.push(item.name)
        })
        bodySteam4.response.games.forEach(item => {
          playTime.push(timeConvert(item.playtime_2weeks))
        })
  
        //send message
        msg.channel.send({
          "embed": {
            "title": realName,
            "description": "The player recently played " + recentCount + " games!" ,
            "color": 640001,
            "timestamp": new Date(),
            "thumbnail": {
              "url": avatar
            },
            "author": {
              "name": nickname,
              "url": profileUrl,
              "icon_url": avatar
            },
            "fields": [
              {
                "name": "Recent Games:",
                "value": recentNames,
                "inline": true
              },
              {
                "name": "Recent Playtime:",
                "value": playTime,
                "inline": true
              }
            ]
          }
        })
      }
    })
  });
}

//
// Check if message starts with "!" and redirect
//
client.on('message', msg => {
  if (msg.content.substring(0, 1) == '!') {
    var args = msg.content.substring(1).split(' ');
    var cmd = args[0];
    var username = args[1]

    switch (cmd) {

      // !cat
      case 'cat':
        msg.react('👍')
        async function getCat() {
          const {
            file
          } = await fetch('https://aws.random.cat/meow').then(response => response.json());
          msg.channel.send(file)
        }

        getCat()
        break;

      case 'ping':
        msg.channel.send("pong")
        
        break;
      // !help
      case 'help':
        msg.react('👍')
        msg.channel.send(help)
        
        break;

      // !profile <Profilename>
      case 'profile':
        msg.react('👍')
        findSteamId(username, msg, 1)

        break;

      case 'friends':
        msg.react('👍')
        findSteamId(username, msg, 2)

        break;

      case 'recent':
        msg.react('👍')
        findSteamId(username, msg, 3)

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