var app = angular.module('app', ['ui.router', 'ngStorage', 'ui.bootstrap', 'ngCookies']);
app.config(function ($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'public/views/home.html',
			data : { pageTitle: 'Home' }
		})
		.state('course', {
			url: '/course/:courseId',
			templateUrl: 'public/views/course.html',
			data : { pageTitle: '.....' }
		})
		.state('regist', {
			url: '/regist',
			templateUrl: 'public/views/regist.html',
			data : { pageTitle: 'Registration' }
		})
		.state('profile', {
			url: '/profile',
			templateUrl: 'public/views/profile.html',
			data : { pageTitle: 'Profile' }
		})
		.state('login', {
			url: '/login',
			templateUrl: 'public/views/login.html',
			data : { pageTitle: 'Login' }
		});
	$urlRouterProvider.otherwise('/');
});

app.run([ '$rootScope', '$state', '$stateParams',
function ($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}]);

app.directive('navbarView', function(){
    return {
        restrict: 'E',
        templateUrl: 'public/views/navbar.html'
      };
});

'use strict';

app.controller('courseCtrl', ['$scope', '$http', '$stateParams',
  function ($scope, $http, $stateParams) {
    var courseId = $stateParams.courseId;
    $scope.courseInfo = {};
    $http.get('https://whsatku.github.io/skecourses/'+ courseId +'.json')
    .success(function(data){
      $scope.courseInfo = data;
      console.log(data);
    })
    .error(function(data){
      console.log(data);
    });
}]);

app.controller('homeCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $scope.courses = [];
    $http.get('https://whsatku.github.io/skecourses/list.json')
    .success(function (data) {
        $scope.courses = data;
      })
      .error(function (data) {
        console.log(data);
      });
}]);

'use strict';

app.controller('loginCtrl', ['$scope', '$http', '$rootScope', '$localStorage', '$state',
    function($scope, $http, $rootScope, $localStorage, $state) {
      if ( $localStorage.studentId !== '') {
			     $state.go('home');
		  }
        $rootScope.studentId = '';
        $scope.id = '';

        $scope.login = function() {
          $rootScope.studentIdRoot = $scope.id;
          $localStorage.studentId = $scope.id;
        };
    }
]);

'use strict';

app.controller('mainCtrl', ['$scope', '$http', '$rootScope', '$localStorage',
    function($scope, $http, $rootScope, $localStorage) {
        $scope.courses = [];
        $rootScope.studentIdRoot = $localStorage.studentId || '';

        $http.get('https://whsatku.github.io/skecourses/list.json')
            .success(function(data) {
                $scope.courses = data;
            })
            .error(function(data) {
                console.log(data);
            });

        $scope.logout = function(){
          $rootScope.studentIdRoot = '';
          $localStorage.studentId = '';
        };

    }
]);

'use strict';

app.controller('navCtrl', ['$scope', '$http', '$rootScope',
    function($scope, $http, $rootScope) {
        $scope.courses = [];
        $scope.studentId = '';
        $scope.id = '';
        
        $scope.login = function() {
          $scope.studentId = $scope.id;
        };
    }
]);

'use strict';

app.controller('profileCtrl', ['$scope', '$http', '$rootScope',
  function ($scope, $http, $rootScope) {
    $scope.profile = {};
    var loginId = $rootScope.studentIdRoot;

    $http.get('http://52.37.98.127:3000/v1/5610545749/'+ loginId +'?pin=5647')
    .success(function(data){
      $scope.profile = data;
      console.log(data);
    })
    .error(function(data){
      console.log(data);
    });
}]);

'use strict';

app.controller('registCtrl', ['$scope', '$http', '$rootScope', '$localStorage', '$state',
    function($scope, $http, $rootScope, $localStorage, $state) {
        $scope.selected = [];
        $scope.search = false;
        $scope.course = {};
        $scope.courseCredit = 0;
        $scope.rType = 'C';
        $scope.checkEnroll = {};
        $scope.totalCredits = 0;

        var loginId = $rootScope.studentIdRoot;

        $scope.updateChecker = function(){
          $scope.totalCredits = 0;
          $http.get('http://52.37.98.127:3000/v1/5610545749/' + loginId + '?pin=5647')
              .success(function(data) {
                var totalEnroll = data.enrolls[0].courses;
    
                for(var i = 0; i < totalEnroll.length; i++){
                  var en = totalEnroll[i];
                  $scope.checkEnroll[en.courseId] = en.section.lecture || en.section.lab;
                  $scope.totalCredits += en.credit;
                }

                console.log($scope.checkEnroll);
                console.log($scope.totalCredits);
              });
        };

        if ( $localStorage.studentId === '') {
             $state.go('home');
        }
        else{
          $scope.updateChecker();
        }


        $scope.selectCourse = function(course) {
            $scope.course = course;

            $http.get('https://whsatku.github.io/skecourses/' + course.id + '.json')
                .success(function(data) {
                    $scope.courseCredit = data.credit.total;
                    console.log(data);
                });

            $http.get('https://whsatku.github.io/skecourses/sections/' + course.id + '.json')
                .success(function(data) {
                    $scope.selected = data;
                    //console.log(data);
                })
                .error(function(data) {
                    $scope.selected = [];
                    //console.log(data);
                });
            $scope.search = true;
        };

        $scope.selectSec = function(section){
          $scope.section = section;
          $scope.rType = 'C';
        };

        $scope.enroll = function() {
            //prepare enroll
            var name = $scope.course.name.en;
            var courseId = $scope.course.id;
            var lecSec = 0;
            var labSec = 0;
            var credit = $scope.courseCredit;
            if ($scope.section.type === 'Lecture') {
                lecSec = $scope.section.id;
            } else if ($scope.section.type === 'Lab') {
                labSec = $scope.section.id;
            }

            var enrollInfo = {
                'name': name,
                'courseId': courseId,
                'section': {
                    'lecture': lecSec,
                    'lab': labSec
                },
                'credit': credit,
                'rType': $scope.rType
            };

            var user = {};
            $http.get('http://52.37.98.127:3000/v1/5610545749/' + loginId + '?pin=5647')
                .success(function(data) {
                    user = data;
                    user.enrolls[0].courses.push(enrollInfo);
                    var jsonVar = {};
                    jsonVar[loginId] = user;
                    $http.post('http://52.37.98.127:3000/v1/5610545749/?pin=5647', jsonVar)
                        .success(function(data) {
                            console.log(data);
                            $scope.updateChecker();
                        })
                        .error(function(date) {
                            console.log(data);
                        });
                })
                .error(function(data) {
                    user = {
                        'stdId': loginId,
                        'enrolls': [{
                            'year': 2015,
                            'semester': 'Second',
                            'courses': [enrollInfo]
                        }]
                    };
                    var jsonVar = {};
                    jsonVar[loginId] = user;
                    $http.post('http://52.37.98.127:3000/v1/5610545749/?pin=5647', jsonVar)
                        .success(function(data) {
                            console.log(data);
                            $scope.updateChecker();
                        })
                        .error(function(date) {
                            console.log(data);
                        });
                });
        };
    }
]);
