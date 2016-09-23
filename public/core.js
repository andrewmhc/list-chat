var todoList = angular.module('todoList', []);

function mainController($scope, $http) {
    $scope.formData = {};
    angular.element(document).ready(function () {
        socket.emit('connection', window.location.pathname)
        $scope.getTodo()
    })

    $scope.getTodo = function() {
        $scope.formData.url = window.location.pathname
        $http.post('/api/getTodos', $scope.formData)
        .success(function(data) {
            $scope.todos = data
        })
        .error(function(data) {
            console.log('Error: ' + data)
        })
    }

    $scope.createTodo = function() {
        $scope.formData.url = window.location.pathname
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {}
                $scope.todos = data
            })
            .error(function(data) {
                console.log('Error: ' + data)
            })
    };

    $scope.deleteTodo = function(id) {
        $scope.formData.url = window.location.pathname
        $http.delete('/api/todos/' + id)
            .success(function(data) {
                $http.post('/api/getTodos', $scope.formData)
                .success(function(data) {
                })
                .error(function(data) {
                    console.log('Error: ' + data)
                })
            })
            .error(function(data) {
                console.log('Error: ' + data)
            })
    }

    socket.on('update todo', function(todos){
        console.log('hey')
        $scope.todos = todos
        $scope.$apply()
    })

    socket.on('share link', function() {
        socket.emit('share link', "Chatroom link: " + window.location)
    })

}

function indexController($scope, $http) {

    $scope.createChatroom = function() {
        console.log("inside chatroom")
        $http.get('/api/chatroom')
            .success(function(data) {
                if (data.redirect) {
                    document.location.href = data.redirect
                }
            })
            .error(function(data) {
                console.log('Error: ' + data)
            })
    }
}