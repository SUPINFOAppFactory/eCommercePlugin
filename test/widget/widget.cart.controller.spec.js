
describe('Unit : eCommercePluginWidget Plugin widget.cart.controller.js', function () {
  var WidgetCart, scope, $rootScope, $controller, Buildfire, ActionItems, TAG_NAMES, STATUS_CODE, LAYOUTS, STATUS_MESSAGES, CONTENT_TYPE, q;
  beforeEach(module('eCommercePluginWidget'));
  var editor;
  beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _TAG_NAMES_, _STATUS_CODE_, _LAYOUTS_, _STATUS_MESSAGES_) {
    $rootScope = _$rootScope_;
    q = _$q_;
    scope = $rootScope.$new();
    $controller = _$controller_;
    TAG_NAMES = _TAG_NAMES_;
    STATUS_CODE = _STATUS_CODE_;
    STATUS_MESSAGES = _STATUS_MESSAGES_;
    LAYOUTS = _LAYOUTS_;
    Buildfire = {
      components: {
        carousel: {
          editor: function (name) {
            return {}
          },
          viewer: function (name) {
            return {}
          }
        }
      },
      spinner: {
        show: function () {
        }
      },
      imagelib: {
        cropImage: function (url, setting) {

        }
      }
    };
    ActionItems = jasmine.createSpyObj('ActionItems', ['showDialog']);
    Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor', 'onAddItems']);

  }));

  beforeEach(function () {
    WidgetCart = $controller('WidgetCartCtrl', {
      $scope: scope,
      $q: q,
      Buildfire: Buildfire,
      TAG_NAMES: TAG_NAMES,
      ActionItems: ActionItems,
      STATUS_CODE: STATUS_CODE,
      CONTENT_TYPE: CONTENT_TYPE,
      LAYOUTS: LAYOUTS
    });
  });

  describe('Units: units should be Defined', function () {
  });

  describe('$destroy', function () {
    it('should invoke when get $destroy', function () {
      $rootScope.$broadcast('$destroy');
    });
  });

  describe('WidgetCart.updateCart', function () {
    it('should invoke when WidgetCart.updateCart() called', function () {
      $rootScope.cartItemToUpdate={
        variantId : "123",
        variant: "Default",
        quantity:1,
        data:{}
      };
      WidgetCart.updateCart($rootScope.cartItemToUpdate);
    });
  });

});