const express = require('express');
const asyncHandler = require('../../middlewares/async');
const auth = require('../../middlewares/auth');
const Game = require('../../models/Game');
const Table = require('../../models/Table');
const User = require('../../models/User');
const ErrorResponse = require('../../utils/ErrorResponse');
const initBoard = require('../../utils/initBoard');
const isCorrectMove = require('../../utils/isCorrectMove');
const router = express.Router();



//route GET    api/games/
//description  get the game
//access       private
router.get('/:id', auth, asyncHandler( async(req, res, next) => {

    const game = await Game.findById(req.params.id)

    if (!game) {
        return next(new ErrorResponse('Game does not exist', 404)); 
    }

    res.json(game)
    
}));



//route POST   api/games/
//description  create the game
//access       private
router.post('/', auth, asyncHandler( async(req, res, next) => {

    const { players, tableid } = req.body;

    if (!players || !tableid) {
        return next(new ErrorResponse('Table does not exist', 422));
    }
    

    let user;

    if (req.user) {
        user = await User.findById(req.user.id)
    }
    if (players[0] === players[1]) {
        return next(new ErrorResponse('You cannot fight with yourself', 422));
    }
    let opponentid = players.filter(element => element.toString() !== user._id)

    let opponent = await User.findById(opponentid[0])


    if (!opponent) {
        return next(new ErrorResponse('Opponent not found', 422));
    }

    const table = await Table.findById(tableid).populate({ path: 'games = game', model: 'Game' })

    const allFinished = table.games.filter( i => i.finished === false )
    
    if (allFinished[0]) {
        console.log(`${allFinished.length} games are not finished`)
        return next(new ErrorResponse('Please wait for other game', 422));
    }


    const board = await initBoard(players[0], players[1])

    const game = new Game({
        players: players,
        board
    })
    await game.save();
    
    table.games = [ ...table.games, game]

    await table.save()

    res.json(game)
}));


//route PUT    api/games/:id
//description  game changes
//access       private
router.put('/:id', auth, asyncHandler( async(req, res, next) => {

    const { started } = req.body;

    let user;
    if (req.user) {
        user = await User.findById(req.user.id)
    } 

    if (!user) {
        return next(new ErrorResponse('User not authorized', 401)); 
    }

    const game = await Game.findById(req.params.id)

    if (!game) {
        return next(new ErrorResponse('Game does not exist', 404)); 
    }
    if (started) {
        game.started = true
    }

    if (req.body.selected && req.body.next) {

        players = req.body.players // [ white, black ]
        
        const selectedField = game.board[req.body.selected.position.x]
        const nextField = game.board[req.body.next.position.x]
        
        
        if (JSON.stringify(selectedField) !== JSON.stringify(req.body.selected) || JSON.stringify(nextField) !== JSON.stringify(req.body.next)) {
            
            return next(new ErrorResponse('Please refresh the page', 422)); 
        }

        if (game.finished) {
            return next(new ErrorResponse('The game is finished', 422)); 
        }

        const player = game.players.indexOf(user._id) + 1
        
        const isCorrect = await isCorrectMove(selectedField, nextField, game.board, user, player)
        if (!isCorrect) {
            return next(new ErrorResponse('Move not correct', 422));
        }

        game.board[req.body.next.position.x] = await { position: { y: nextField.position.y, x: nextField.position.x }, color: nextField.color, player: selectedField.player, type: selectedField.type }
        
        game.board[req.body.selected.position.x] = await { position: { y: selectedField.position.y, x: selectedField.position.x }, color: selectedField.color, player: null, type: null }

        /* if (req.body.next.type === 'King') {
            game.scoreA += 1
            game.finished = true
        } */

        await game.save()

        return res.json({ selected: selectedField, next: nextField })

    }

    await game.save()

    res.json(game)
    
}));

module.exports = router;