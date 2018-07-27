// Setup
require("dotenv").config();
var Spotify = require("node-spotify-api");
var Twitter = require("twitter");
var request = require("request");
var inquirer = require("inquirer");
var fs = require("fs");
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

// The Spotify and Twitter requests are both put into functions for
// readability of the code :)

// Spotify Search Function
var spotifySearch = (song) => {
    spotify.search({
        type: 'track',
        query: song,
        limit: 1    // Since the console only displays one song,
                    // limit is set to 1 for faster loading
    }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        // Setting variables for easier readability
        var name = data.tracks.items[0].name;
        var album = data.tracks.items[0].album.name;
        var artist = data.tracks.items[0].album.artists[0].name;
        var url = data.tracks.items[0].external_urls.spotify;
        
        console.log("\nSong: " + name +
            "\n\nAlbum: " + album +
            "\n\nArtist: " + artist +
            "\n\nPreview Link: " + url);
    })
}

var movieSearch = (movie) => {
    var url = "http://www.omdbapi.com/?t=" + movie + "&apikey=trilogy";
    request(url, null, function (err, data, body) {
        if (err) console.log(err);
        // Variables weren't set here since paths were shorter
        console.log("\nTitle: " + JSON.parse(body).Title +
            "\nRelease Date: " + JSON.parse(body).Released +
            "\nIMDB Rating: " + JSON.parse(body).Ratings[0].Value +
            "\nRotton Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value +
            "\nCountry: " + JSON.parse(body).Country +
            "\nLanguage: " + JSON.parse(body).Language +
            "\nPlot: " + JSON.parse(body).Plot +
            "\nActors: " + JSON.parse(body).Actors +
            "\n");
    });
}

// Failsafe if user enters arguments
if (process.argv[3]) {
    console.log("Please run this script without any arguments.");
} else {
    inquirer.prompt([{
        name: "command",
        type: "list",
        message: "What would you like to do?",
        choices: ["Search Spotify", "Search OMDB", "See Recent Tweets", "Surprise Me"],
    }]).then(response => {
        if (response.command == "Search Spotify" || response.command == "Search OMDB") {
            // Switch/Case was used here because they both require
            // secondary inputs
            switch (response.command) {
                case "Search Spotify":
                    inquirer.prompt([{
                        name: "song",
                        type: "input",
                        message: "Type in the song you're searching for.",
                    }]).then(answer => {
                        var song;
                        if (answer.song === "" || answer.song === null) {
                            song = "The Sign Ace of Base"
                        } else {
                            song = answer.song;
                        }
                        spotifySearch(song);
                    });
                    break;
                case "Search OMDB":
                    inquirer.prompt([{
                        name: "movie",
                        type: "input",
                        message: "Type in the movie you're searching for.",
                    }]).then(answer => {
                        movieSearch(encodeURI(answer.movie));
                    });

                    break;
            }
        } else if (response.command == "See Recent Tweets") {
            var params = {
                screen_name: 'nodejs'
            };
            client.get('statuses/user_timeline', params, function (error, tweets, response) {
                if (!error) {
                    // The Twitter search isn't displaying my
                    // dummy account tweets, it's displaying
                    // other tweets for somewhere else. I'm trying
                    // to figure it out but for now this is what
                    // I have :(
                    for (i = 0; i < 20; i++) {
                        console.log("\n----------------\n" + tweets[i].text + "\n----------------");
                    }
                }
            });

        } else if (response.command == "Surprise Me") {
            fs.readFile("./random.txt", "utf-8", function (err, data) {
                if (err) console.log(err);
                spotifySearch(data);
            });
        }
    });
}