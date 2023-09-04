angular.module('favoriteApp', []) // favoriteApp lie au Html
  .controller('FavoritesController', function ($scope, $http, $timeout) {

    $scope.categories = [];
    $scope.realCategories = [];
    $scope.favorites = [];

    $scope.isInvalidLink = false;
    $scope.selectAll = false;
    //selected criterion for filtering favorites list
    $scope.categoryFilter = 0;
    $scope.selectedCategory = 0;

    $scope.showToast = false;
    $scope.toastMessage = '';

    //ids list of favorite want to delete
    $scope.idsToDelete = [];
    //selected criterion for sorting favorites list
    $scope.selectedSortCriteria = 'all';
    //sorting options
    $scope.sortCriteriaOptions = [
      { label: 'Sort by ...', value: 'all' },
      { label: 'Sort by Category', value: 'category' },
      { label: 'Sort by Date', value: 'date' }
    ];

    $scope.mode = 'view';

    $scope.favorite = {};

    $scope.setMode = function (text) {
      if (text === 'creation') {

        $scope.realCategories = $scope.categories.filter(function (c) { return c.id !== 0 });
        console.log($scope.realCategories);
        //$scope.realCategories.unshift({id:0, label:'Choose one ...', selected: true});
        var idx = $scope.realCategories.map(function (c) { return c.id }).indexOf($scope.categoryFilter);

        if (idx < 0) idx = 0;

        $scope.favorite = {
          link: '',
          category: $scope.realCategories[idx].id
        }
      }
      $scope.mode = text;
    }

    $scope.cancel = function () {
      $scope.setMode('view');
    }

    $scope.verifyLink = function (link) {

    }

    const root = "http://localhost:8080";

    $scope.validate = function (id, link) {

      // Check if the link is valid
      //if it's starts with "http://" or "https://" => isInvalidLink = false
      var isValidLink = /^https?:\/\//.test(link);

      $scope.isInvalidLink = !isValidLink;
      if (!isValidLink) {
        // isValidLink.test(link);
        alert('Invalid link. Please enter a valid link.');
        $scope.isInvalidLink = true;
      }
      else {
        $scope.isInvalidLink = false
        console.log(id);
        $http.post(root + '/api/favorites/' + id + '/favorite',
          { id: null, link: $scope.favorite.link }).then(
            function () {
              $scope.refresh();
              $scope.setMode('view');
            }, function (error) {
              alert(error.data.message);
            }
          )
        // Show toast & Hide it after a 3 seconds
        Toastify({
          text: "Favorite added successfully!", 
          duration: 3000  
          }).showToast(); 
      }
    }

    $scope.refresh = function () {
      $http.get(root + '/api/favorites/categories').then(
        function (response) {
          $scope.categories = [{ id: 0, label: "Everything", references: 0 }];
          response.data.forEach(d => {
            $scope.categories.push(d);
          })

          $http.get(root + '/api/favorites').then(
            function (response) {
              $scope.favorites = response.data.filter(f => $scope.categoryFilter === 0 || f.category.id === $scope.selectedCategory || $scope.selectedSortCriteria === 'all');
            }
          )
        })
    }

    //if the global checkbox is checked check all individual checkboxes
    $scope.toggleSelectAll = function () {
      angular.forEach($scope.favorites, function (f) {
        f.selected = $scope.selectAll;
      });
      //update the IdsToDelete list to add all favorites
      $scope.updateIdsToDelete();
      console.log($scope.idsToDelete);
    };

    //add the selected id to idsToDelete list, 
    //and check the global checkbox if all the individual checkboxes are checked
    $scope.updateSelection = function (f) {
      if (f.selected) {
        $scope.idsToDelete.push(f.id);
        console.log($scope.idsToDelete);
      } else {
        const index = $scope.idsToDelete.indexOf(f.id);
        if (index !== -1) {
          $scope.idsToDelete.splice(index, 1);
          console.log($scope.idsToDelete);
        }
      }
      //call updateSelectAll() method to check if all individual checkboxes are checked
      $scope.updateSelectAll();
    };

    //this method is used to check if all the individual checkboxes 
    //are checked/unchecked to check/uncheck the global one
    $scope.updateSelectAll = function () {
      $scope.selectAll = $scope.favorites.every(function (f) {
        return f.selected;
      });
    };

    //update the ids list by adding/removing ids depending on the checkbox state
    $scope.updateIdsToDelete = function () {
      $scope.idsToDelete = $scope.favorites.filter(f => f.selected).map(f => f.id);
    };

    //filter the favorites list according to selected category
    $scope.filterFavorites = function (categoryId) {
      if (categoryId != 0) {
        const url = root + '/api/favorites/' + $scope.categories[categoryId].label;
        $http.get(url).then(function (response) {
          console.log(categoryId);
          $scope.favorites = response.data;
        }).catch(function (error) {
          console.error('Error when filtering by category', error);
        });
      } else {
        $scope.refresh();
      }
    };


    $scope.deleteSelected = function () {
      console.log($scope.idsToDelete);

      $http.delete(root + '/api/favorites/' + $scope.idsToDelete)
        .then(function () {
          console.log('Selected favorites deleted successfully');
          $scope.refresh();
          $scope.idsToDelete = [];
        }).catch(function (error) {
          console.error('Error during removing the selected favorites', error);
        });
    };

    $scope.sortFavorites = function (selectedSortCriteria) {
      console.log(selectedSortCriteria);
      if (selectedSortCriteria === 'category') {
        const url = root + '/api/favorites/sortedByCat';
        $http.get(url).then(function (response) {
          $scope.favorites = response.data;
        }).catch(function (error) {
          console.error('Error when sorting by category', error);
        });
      } else if (selectedSortCriteria === 'date') {
        const url = root + '/api/favorites/sortedByDate';
        $http.get(url).then(function (response) {
          $scope.favorites = response.data;
        }).catch(function (error) {
          console.error('Error when sorting by date', error);
        });
      }
      else {
        $scope.refresh();
      }
    }

    $scope.refresh();
  });