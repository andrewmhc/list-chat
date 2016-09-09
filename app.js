// list-chat
var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');                     
var morgan = require('morgan');           
var bodyParser = require('body-parser');  
var methodOverride = require('method-override');

var mongoUsername = process.env.mongoUsername;
var mongoPassword = process.env.mongoPassword;
var database = process.env.database;

mongoose.connect('mongodb://' + mongoUsername + ':' + mongoPassword + database);

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

var Todo = mongoose.model('Todo', {
  text: String
});

// routes ======================================================================

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/todos', function(req, res) {
    Todo.find(function(err, todos) {
        if (err)
            res.send(err)
        res.json(todos);
    });
});

app.post('/api/todos', function(req, res) {
    Todo.create({
        text : req.body.text,
        done : false
    }, function(err, todo) {
        if (err)
            res.send(err);
        Todo.find(function(err, todos) {
            if (err)
                res.send(err)
            io.emit('add todo', "todo added");
            res.json(todos);
        });
    });
});

app.delete('/api/todos/:todo_id', function(req, res) {
    Todo.remove({
        _id : req.params.todo_id
    }, function(err, todo) {
        if (err)
            res.send(err);

        Todo.find(function(err, todos) {
            if (err)
                res.send(err)

            io.emit('delete todo', "todo deleted");
            res.json(todos);
        });
    });
});

// socket.io ======================================================================

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on localhost:3000');
});