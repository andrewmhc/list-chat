var todoList = angular.module('todoList', []);

function mainController($scope, $http) {
    $scope.formData = {};

    // get todolist items from db
    $scope.getTodo = function() {
        $http.get('/api/todos')
        .success(function(data) {
            $scope.todos = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }


    $scope.createTodo = function() {
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
        $http.delete('/api/todos/' + id)
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

    $scope.getTodo();

}