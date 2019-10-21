var express = require('express')
var router = express.Router()
var request = require('request') // module request => générer une requête via une URL depuis son backend.
var mongoose = require('mongoose') // module mongoose => lien entre MLAB et NODE.JS

// CNNEXION A LA BDD
var options = {
  server: {
    socketOptions: {
      connectTimeoutMS: 30000
    }
  }
}                
mongoose.connect('mongodb://<dbuser>:<dbpassword>@ds239071.mlab.com:39071/mymovizapp', options, function (err) {
  console.log(err)
})

// CONSTRUCTION SCHEMA ET MODELE
var movieSchema = mongoose.Schema({ poster_path: String, overview: String, title: String, idMovieDB: Number })
var MovieModel = mongoose.model('movie', movieSchema)

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'route /' })
})

// LIRE L'INTEGRALITE DES FILMS 
// // On fait un JSON.PARSE pour convertir au format JSON le format de retour de l'API.
router.get('/movie', function (req, res, next) {
  request('https://api.themoviedb.org/3/discover/movie?<api_key=>&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=1', function (error, response, body) {
    body = JSON.parse(body)
    res.json(body)
  })
})

// LECTURE DES FILMS LIKES
router.get('/mymovies', function (req, res, next) {
  MovieModel.find(function (err, movies) {
    res.json({ movies })
  })
})

// SAUVEGARDER UN FILM LIKE : On enregistre le film et ses informations dans la BDD.
router.post('/mymovies', function (req, res, next) {
  var movie = new MovieModel({ poster_path: req.body.poster_path, overview: req.body.overview, title: req.body.title, idMovieDB: req.body.idMovieDB })
  movie.save(function (error, movie) {
    MovieModel.find(function (err, movies) {
      res.json({ movie })
    })
  })
})

// SUPPRIMER UN FILM LIKE : Utilisation de la valeur movieId présent dans l’URL, qui correspond à l’ID du film à supprimer.
router.delete('/mymovies/:idMovieDB', function (req, res, next) {
  MovieModel.remove({
    idMovieDB: req.params.idMovieDB
  }, function (error) {
    MovieModel.find(function (err, movies) {
      res.json({ movies })
    })
  })
})

module.exports = router
