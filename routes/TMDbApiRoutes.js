var request = require("request");
require("dotenv").config();
var env = require("dotenv").load();
var keys = require("../config/keys");
var news_api_key = keys.NEWS.api_key;

// function simplifies URL for calls to The Movie Database API
var TMDbUrl = function(query, additionalParameters) {
  var api_key = keys.TMDb.api_key;
  var baseUrl = "https://api.themoviedb.org/3/";
  var baseParameters = "?language=en-US&include_video=false&include_adult=false&api_key=" + api_key;
  return baseUrl + query + baseParameters + additionalParameters;
}

module.exports = function(app, passport) {

  // home page and popular current movies
  app.get("/", function(req, res) {

    var url = TMDbUrl("discover/movie", "&page=1&sort_by=popularity.desc");
    request(url, function(error, result, body) {
      if (error) { 
        return console.log(error); 
      }
      var email = req.user ? req.user.email : "";
      var response = JSON.parse(body);
      var popularMovies = response.results;
      var posters = [];
      
      popularMovies.forEach(function(item, index) {
        var posterUrl = "https://image.tmdb.org/t/p/w200" + item.poster_path;
        posters.push(posterUrl);
      });

      res.render("index", {
        posters: posters,
        authenticated: req.isAuthenticated(),
        email: email
      });

    });

  });

  // search page and movie news
  app.post("/api/search", function(req, res) {

    var url = TMDbUrl("search/movie", "&query=" + encodeURI(req.body.query));
    request(url, function(error, result, body) {
      if (error) { return console.log(error); }
      var response = JSON.parse(body);
      var searchResults = response.results;

      // REQUEST CALL FOR NEWS API
      var newsurl = "https://newsapi.org/v2/everything?q=movie&from=2018&to=2018&sortBy=relevancy&language=en&apiKey=" + news_api_key;

      request(newsurl, {json:true},function (error, response, body) {
        if (error) {
            return console.log(error);
        }
        var email = req.user ? req.user.email : "";

        res.render("index", {
          searchResults: searchResults,
          newsResults: body.articles,
          authenticated: req.isAuthenticated(),
          email: email
        });

      });

    });
    
  });

  // movie details
  app.get("/api/movie/:movie", function(req, res) {
    var url = TMDbUrl("movie/" + req.params.movie, "");
    request(url, function(error, result, body) {
      if (error) { return console.log(error); }
      var response = JSON.parse(body);
      res.json(response);
    });
  });

}