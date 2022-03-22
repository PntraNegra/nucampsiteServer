const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate')
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({
        user: req.user._id
    })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'applications/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({
        user: req.user._id
    })
    .then(favorites => {
        console.log(favorites)
        if(favorites){
            for (let i = 0; i < req.body.length; i++){
                if (favorites.campsites.indexOf(req.body[i]._id) === -1){
                    favorites.campsites.push(req.body[i]._id);
                    console.log(favorites.campsites);
                    console.log(req.body[i]);
                }
            }
            favorites.save()
                .then(favorites => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch(err => next(err))
        } else {
            Favorite.create({
                user: req.user._id,
                campsites: req.body
            })
            .then(favorites => {
                console.log('Favorite Created ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
        }

    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({
        user: req.user._id
    })
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({
        user: req.user._id
    })
    .then(favorites => {
        if(favorites){
            //console.log(favorites.campsites)
            //console.log(req.params.campsiteId)
                //console.log(favorites.campsites)
            if (req.params.campsiteId.indexOf(favorites.campsites) === -1){
                Favorite.create({
                    user: req.user._id,
                    campsites: req.params.campsiteId
                })
                .then(favorites => {
                    console.log('Favorite Created ', favorites);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
            } else {
                res.statusCode = 403;
                res.end('That campsite is already in the list of favorites!')
            }
            
        } else {
            Favorite.create({
                user: req.user._id,
                campsites: req.params.campsiteId
            })
            .then(favorites => {
                console.log('Favorite Created ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
        }

    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({
        user: req.user._id
    })
    .then(favorite => {
        if (favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            if (index >= 0) {
                favorite.campsites.splice(index, 1);
            }
            favorite.campsites = favorite.campsites.filter(fav => fav.toString() !== req.params.campsiteId);
            favorite.save()
                .then(favorite => {
                    console.log("Favorite Campsite Deleted!", favorite);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                })
                .catch(err => next(err));
        } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end("You don't have any favorites to delete");
        }
    }).catch(err => next(err))
});

module.exports = favoriteRouter;