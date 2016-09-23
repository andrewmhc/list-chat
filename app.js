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
  room: String,
  text: String
});

var rooms = new Array()
var user = new Array()
var userCount = new Array()
// routes ======================================================================

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/chatroom', function(req, res) {
    var room = '/' + new Date().getTime()
    rooms.push(room)
    userCount[room] = 0;
    app.get(room, function(req, res) {
        res.sendFile(__dirname + '/public/chatroom.html')
    })
    res.json({"redirect": room})
});

app.post('/api/getTodos', function(req, res) {
    Todo.find({room : req.body.url}, function(err, todos) {
        if (err)
            res.send(err)
        io.in(req.body.url).emit('update todo', todos);
        res.json(todos);
    });
});

app.post('/api/todos', function(req, res) {
    Todo.create({
        text : req.body.text,
        done : false,
        room : req.body.url
    }, function(err, todo) {
        console.log(req.body.url)
        if (err)
            res.send(err);
            Todo.find({room : todo.room}, function(err, todos) {
            if (err)
                res.send(err)
            io.in(req.body.url).emit('update todo', todos);
            res.json(todos);
        });
    });
});

app.delete('/api/todos/:todo_id', function(req, res) {
    Todo.remove({
        _id : req.params.todo_id
    }, function(err, data) {
        if (err)
            res.send(err);
        res.json(data);
    });
});

function newName(number) {
    return 'User' + number
}

function getCurrentTime() {
    return new Date(new Date().getTime()).toLocaleTimeString()
}

io.on('connection', function(socket){

  socket.on('connection', function(room){
    if (rooms.indexOf(room) > -1) {
        socket.join(room)
        rooms[socket.id] = room
        user[socket.id] = newName(userCount[room])
        userCount[room]++
        if (user[socket.id] == "User0") {
            io.in(rooms[socket.id]).emit('share link');
        }
        io.in(rooms[socket.id]).emit('chat message', getCurrentTime() + " " + user[socket.id] + " connected")
    }
  })

  socket.on('disconnect', function(){
    io.in(rooms[socket.id]).emit('chat message', getCurrentTime() + " " + user[socket.id] + " disconnected")
  })

  socket.on('chat message', function(msg){
    io.in(rooms[socket.id]).emit('chat message', getCurrentTime() + " " + user[socket.id] + ": " + msg)
  })

  socket.on('share link', function(msg){
    io.in(rooms[socket.id]).emit('chat message', getCurrentTime() + " " + "Bot" + ": " + msg)
  })

})

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on localhost:3000')
});