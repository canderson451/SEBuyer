angular.module('orderCloud')

    .config(CategoryConfig)
    .controller('CategoryCtrl', CategoryController)

;

function CategoryConfig($stateProvider) {
    $stateProvider
        .state('catalog.category', {
            url: '/category/:categoryid',
            templateUrl: 'catalog/category/templates/category.tpl.html',
            controller: 'CategoryCtrl',
            controllerAs: 'category',
            resolve: {
                CategoryList: function(OrderCloud, $stateParams, $q) {
                    var dfd = $q.defer();
                    OrderCloud.Me.ListSubcategories(null, null, null, null, null, null, $stateParams.categoryid)
                        .then(function(categories){
                            dfd.resolve(categories.Items);
                        });
                    return dfd.promise;
                },
                ProductList: function(OrderCloud, $stateParams) {
                    return OrderCloud.Me.ListProducts(null, null, null, null, null, null, $stateParams.categoryid);

                },
                BannerGroup: function(OrderCloud, $q){
                    var dfd = $q.defer();
                    var queue = [];
                    OrderCloud.Me.ListUserGroups()
                        .then(function(data){
                            angular.forEach(data.Items, function(userGroup){
                                queue.push(userGroup.Name)
                            });
                            dfd.resolve(queue)
                        });
                    return dfd.promise;
                },
                BannerCategories: function(CategoryList, BannerGroup, $q){
                    var dfd = $q.defer();
                    var banners = [];
                    var nonBanners =[];
                    var AllCategories = {};
                    angular.forEach(CategoryList, function(category){
                        if(category.xp && category.xp.image && category.xp.image.Banner && (BannerGroup.indexOf(category.xp.image.Banner) > -1) ){
                            banners.push(category)
                        }else{
                            nonBanners.push(category)
                        }
                    });
                    AllCategories.banners = banners;
                    AllCategories.nonBanners = nonBanners;
                    dfd.resolve(AllCategories);
                    return dfd.promise;
                }
            }
        });
}

function CategoryController($rootScope, BannerCategories, ProductList) {
    var vm = this;
    vm.bannerCategories = BannerCategories.banners;
    vm.nonBannerCategories = BannerCategories.nonBanners;
    vm.products = ProductList;
    $rootScope.$on('OC:FacetsUpdated', function(e, productList) {
        productList ? vm.products = productList : vm.products = ProductList;
    })
}
