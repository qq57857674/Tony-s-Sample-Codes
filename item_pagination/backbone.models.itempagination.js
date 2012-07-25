$(function(){
    window.itemListModel = Backbone.Model.extend({
        defaults: function(){
            return {
                'html':'',
                'current_page':1,
                'asset_type':'',
                'num_per_list':5,
                'num_to_load':0,
                'filter':{},
                'sort_type':'RECENT',
                'total_page':0,
                'start_with':'',
                'total_loaded':-1,
                'allow_search':'True',
                'allow_alpha' : 'True',
                'search_for' : '',
                'allow_found' : 'True'
            };
        }
    });
});