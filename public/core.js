var todoList = angular.module('todoList', []);

function mainController($scope, $http) {
    $scope.formData = {};
    angular.element(document).ready(function () {
        socket.emit('connection', window.location.pathname)
        $scope.getTodo();
    })

    // get todolist items from db
    $scope.getTodo = function() {
        $scope.formData.url = window.location.pathname
        $http.post('/api/getTodos', $scope.formData)
        .success(function(data) {
            console.log(data)
            $scope.todos = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }

    $scope.createTodo = function() {
        $scope.formData.url = window.location.pathname
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.todos = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    $scope.deleteTodo = function(id) {
        $scope.formData.url = window.location.pathname
        $http.delete('/api/todos/' + id, $scope.formData)
            .success(function(data) {
                $scope.todos = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    socket.on('delete todo', function(msg){
        $scope.getTodo();
    })

    socket.on('add todo', function(msg){
        $scope.getTodo();
    })

    socket.on('update todo', function(todos){

    })


}

function indexController($scope, $http) {

    $scope.createChatroom = function() {
        console.log("inside chatroom")
        $http.get('/api/chatroom')
            .success(function(data) {
                if (data.redirect) {
                    document.location.href = data.redirect;
                }
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
}