'use strict';

(function (angular, buildfire) {
  angular
    .module('eCommercePluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'DataStore', 'TAG_NAMES', 'ECommerceSDK', '$sce', 'LAYOUTS', '$rootScope', 'PAGINATION', 'Buildfire', 'ViewStack',
      function ($scope, DataStore, TAG_NAMES, ECommerceSDK, $sce, LAYOUTS, $rootScope, PAGINATION, Buildfire, ViewStack) {
        var WidgetHome = this;
        WidgetHome.data = null;
        WidgetHome.sections = [];
        WidgetHome.busy = false;
        WidgetHome.pageNumber = 1;
        //create new instance of buildfire carousel viewer
        WidgetHome.view = null;
        WidgetHome.safeHtml = function (html) {
          if (html) {
            var $html = $('<div />', {html: html});
            $html.find('iframe').each(function (index, element) {
              var src = element.src;
              console.log('element is: ', src, src.indexOf('http'));
              src = src && src.indexOf('file://') != -1 ? src.replace('file://', 'http://') : src;
              element.src = src && src.indexOf('http') != -1 ? src : 'http:' + src;
            });
            return $sce.trustAsHtml($html.html());
          }
        };

        //Refresh list of items on pulling the tile bar

        buildfire.datastore.onRefresh(function () {
          init(function (err) {
            if (!err) {
              if (!WidgetHome.view) {
                WidgetHome.view = new Buildfire.components.carousel.view("#carousel", []);
              }
              if (WidgetHome.data.content && WidgetHome.data.content.carouselImages) {
                WidgetHome.view.loadItems(WidgetHome.data.content.carouselImages);
              } else {
                WidgetHome.view.loadItems([]);
              }
              WidgetHome.sections = [];
              WidgetHome.busy = false;
              WidgetHome.pageNumber = 1;
              WidgetHome.loadMore();
            }
          });
        });

        WidgetHome.showDescription = function (description) {
          var _retVal = false;
          if (description) {
            description = description.trim();
            if ((description !== '<p>&nbsp;<br></p>') && (description !== '<p><br data-mce-bogus="1"></p>')) {
              _retVal = true;
            }
          }
          return _retVal;
        };
        $rootScope.deviceHeight = window.innerHeight;
        $rootScope.deviceWidth = window.innerWidth || 320;
        $rootScope.backgroundImage = "";
        WidgetHome.loadMore = function () {
          if (WidgetHome.busy) return;
          WidgetHome.busy = true;
          if (WidgetHome.data.content.storeName)
            getSections(WidgetHome.data.content.storeName);
          else
            WidgetHome.sections = [];
        };

        WidgetHome.showItems = function (handle) {
          if (WidgetHome.data.design.itemListLayout)
            ViewStack.push({
              template: WidgetHome.data.design.itemListLayout,
              params: {
                handle: handle,
                controller: "WidgetItemsCtrl as WidgetItems",
                shouldUpdateTemplate: true
              }
            });
        };

        WidgetHome.goToCart = function () {
          ViewStack.push({
            template: 'Shopping_Cart'
          });
        };

        var currentStoreName = "";

        var getSections = function (storeName) {
          Buildfire.spinner.show();
          var success = function (result) {
              Buildfire.spinner.hide();
              console.log("********************************", result);
              WidgetHome.sections = WidgetHome.sections.length ? WidgetHome.sections.concat(result) : result;
              WidgetHome.pageNumber = WidgetHome.pageNumber + 1;
              if (result.length == PAGINATION.sectionsCount) {
                WidgetHome.busy = false;
              }
            }
            , error = function (err) {
              Buildfire.spinner.hide();
              console.error('Error In Fetching category list', err);
            };
          ECommerceSDK.getSections(storeName, WidgetHome.pageNumber).then(success, error);
        };

        /*
         * Fetch user's data from datastore
         */

        var init = function (cb) {
          var success = function (result) {
              WidgetHome.data = result.data;
              if (!WidgetHome.data.design)
                WidgetHome.data.design = {};
              if (!WidgetHome.data.content)
                WidgetHome.data.content = {};
              if (!WidgetHome.data.settings)
                WidgetHome.data.settings = {};
              if (WidgetHome.data.content.storeName) {
                currentStoreName = WidgetHome.data.content.storeName;
              }
              if (!WidgetHome.data.design.sectionListLayout) {
                WidgetHome.data.design.sectionListLayout = LAYOUTS.sectionListLayout[0].name;
              }
              if (!WidgetHome.data.design.itemListLayout) {
                WidgetHome.data.design.itemListLayout = LAYOUTS.itemListLayout[0].name;
              }
              if (!result.id) {
                WidgetHome.data.content.storeName = TAG_NAMES.DEFAULT_STORE_NAME;
              }
              console.log("WidgetHome.data.design.backgroundImage", WidgetHome.data.design.itemDetailsBgImage);
              if (!WidgetHome.data.design.itemDetailsBgImage) {
                $rootScope.backgroundImage = "";
              } else {
                $rootScope.backgroundImage = WidgetHome.data.design.itemDetailsBgImage;
              }
              cb();
            }
            , error = function (err) {
              console.error('Error while getting data', err);
              cb(err);
            };
          DataStore.get(TAG_NAMES.SHOPIFY_INFO).then(success, error);
        };

        var onUpdateCallback = function (event) {
          setTimeout(function () {
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.SHOPIFY_INFO:
                  WidgetHome.data = event.data;
                  if (!WidgetHome.data.design)
                    WidgetHome.data.design = {};
                  if (!WidgetHome.data.design.sectionListLayout) {
                    WidgetHome.data.design.sectionListLayout = LAYOUTS.sectionListLayout[0].name;
                  }
                  if (!WidgetHome.data.design.itemListLayout) {
                    WidgetHome.data.design.itemListLayout = LAYOUTS.itemListLayout[0].name;
                  }
                  if (!WidgetHome.data.content.storeName) {
                    WidgetHome.sections = [];
                    currentStoreName = "";
                    WidgetHome.busy = false;
                  }
                  if (!WidgetHome.data.design.itemDetailsBgImage) {
                    $rootScope.backgroundImage = "";
                  } else {
                    $rootScope.backgroundImage = WidgetHome.data.design.itemDetailsBgImage;
                  }
                  if (WidgetHome.data.content.storeName && currentStoreName != WidgetHome.data.content.storeName) {
                    WidgetHome.sections = [];
                    WidgetHome.busy = false;
                    WidgetHome.pageNumber = 1;
                    WidgetHome.loadMore();
                  }
                  if (WidgetHome.view) {
                    WidgetHome.view.loadItems(WidgetHome.data.content.carouselImages);
                  }

                  break;
              }
              $scope.$digest();
              $rootScope.$digest();
            }
          }, 0);
        };

        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        DataStore.onUpdate().then(null, null, onUpdateCallback);


        $rootScope.$on("Carousel:LOADED", function () {
          WidgetHome.view = null;
          if (!WidgetHome.view) {
            WidgetHome.view = new buildfire.components.carousel.view("#carousel", [], "WideScreen");
          }
          if (WidgetHome.data && WidgetHome.data.content.carouselImages) {
            WidgetHome.view.loadItems(WidgetHome.data.content.carouselImages, null, "WideScreen");
          } else {
            WidgetHome.view.loadItems([]);
          }
        });

        $scope.$on("$destroy", function () {
          DataStore.clearListener();
        });

        $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
          if (type === 'POPALL') {
            WidgetHome.data.content.storeName = null;
            WidgetHome.sections = [];
            WidgetHome.busy = false;
            WidgetHome.pageNumber = 1;
            $scope.$digest();
          }
          if (type === 'POP') {
            DataStore.onUpdate().then(null, null, onUpdateCallback);
          }
          console.log("????????????????",ViewStack.hasViews());
          if (!ViewStack.hasViews()) {
            console.log("?????????????vvvvvvvvvvv");
            // bind on refresh again
            buildfire.datastore.onRefresh(function () {
              init(function (err) {
                if (!err) {
                  if (!WidgetHome.view) {
                    WidgetHome.view = new Buildfire.components.carousel.view("#carousel", []);
                  }
                  if (WidgetHome.data.content && WidgetHome.data.content.carouselImages) {
                    WidgetHome.view.loadItems(WidgetHome.data.content.carouselImages);
                  } else {
                    WidgetHome.view.loadItems([]);
                  }
                  WidgetHome.sections = [];
                  WidgetHome.busy = false;
                  WidgetHome.pageNumber = 1;
                  WidgetHome.loadMore();
                }
              });
            });
          }
        });

        init(function(){});
      }]);
})(window.angular, window.buildfire);