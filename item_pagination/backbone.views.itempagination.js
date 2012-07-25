$(function(){
    window.itemListView = Backbone.View.extend({
        
        events:{
            "click .page" : "load_page",
            "click .alpha_filter":"load_alpha_filtered_page",
            "keypress .goto":"bind_enter_key",
            "click .go":"go_to_page",
            "click .recent_filter" : 'load_recent_page',
            "change .company_user_filter" : 'load_company_user_filter_page'
        },
        
        initialize:function(options){
            this.model.bind('change',this.render,this);
            this.render();   
        },

        load_page:function(e){
            e.preventDefault();
            var page_num = $(e.target).data('page');
            this.model.set({'current_page':page_num});
            return this;
        },
        
        load_alpha_filtered_page:function(e){
            /*
             * sort by first letter
             */
            e.preventDefault();
            var sort_by = $(e.target).data('value');
            this.model.set({'start_with':sort_by,'current_page':1,'sort_type':'featured'});
            return this;
        },
        
        load_recent_page:function(e){
            /*
             * sort by recent
             */
            e.preventDefault();
            this.model.set({'sort_type':'RECENT','current_page':1,'start_with':''});
            return this;
        },
        load_company_user_filter_page:function(e){
            e.preventDefault();
            var search_for = $(e.target).val();
            this.model.set({'search_for':search_for, 'sort_type':'RECENT','current_page':1});
            return this;
        },
        
        bind_enter_key:function(e){
            
            if(e.keyCode === 13){
                $(e.target).parent().find('.go').click();
            }
            
        },
        
        go_to_page:function(e){

            var page_num = $(e.target).parent().parent().find('.goto').val();
            if (page_num && !isNaN(page_num)){
                if(page_num > this.model.get('total_page')){
                    page_num = this.model.get('total_page');
                } else if(page_num < 1){
                    page_num = 1;
                }
                
                this.model.set({'current_page':page_num});
            }
            return this;
        },

        get_lists:function(page){
            /*
             * Submit the page info and receives the rendered html from backend
             * */
            var params = {
                    
                    'num_per_list':this.model.get('num_per_list'),
                    'num_to_load':this.model.get('num_to_load'),
                    'asset_type':this.model.get('asset_type'),
                    'sort_type':this.model.get('sort_type'),
                    'filter':JSON.stringify(this.model.get('filter')),
                    'current_page':this.model.get('current_page'),
                    'start_with': this.model.get('start_with'),
                    'search_for': this.model.get('search_for')
            };
            
            var this_func = this;
            var url;
            if (params.asset_type === 'company_user'){
                url = '/company/ajax_company_user_listing';
             }
            else{
                url = '/'+this.model.get('asset_type')+'/ajax_item_listing';
            }
            $.ajax({
                url: url,
                data:params,
                type: 'POST',
                success: function (response) {
                    this_func.model.set({'html':response.success.list_html,'total_page':response.success.total_page,'total_loaded':response.success.total_loaded});
                },
                error: 'Querying for item list html'
            });
            
        },
        
        render: function(){
            var $el = this.$(this.el);
            this.get_lists();
            $el.find('.search_result').html(this.model.get('html'));
            $el.find('.pagination_control').html(this.get_pagination_control_html());
            $el.find('.top_link').html(this.get_top_link_html());
            return this;
        },
        
        get_top_link_html: function(){
            var html = '';
            var asset_name = this.model.get('asset_type');
            var search_for = this.model.get('search_for');
            
            var item_type_singular = asset_name; //special field for displaying the type of a company
            var item_type_plural = asset_name+'s';
            
            
            if(asset_name === 'company' || asset_name === 'company_user' && search_for === 'company'){
                if(this.model.get('filter').company_type_id){
                    item_type_singular = this.model.get('filter').company_type_id.split('-')[0].replace(/_/g," ");   
                    item_type_plural = this.model.get('filter').company_type_id.split('-')[0].replace(/_/g," ")+'s';
                }else{
                    item_type_singular = "Company"; //special field for displaying the type of a company
                    item_type_plural = "Companies";
                }
            }
            else if(asset_name === 'company_user'){
                if (search_for === 'user'){
                    item_type_singular = "Person";
                    item_type_plural = "People";
                }
                else{
                    item_type_singular = "Company/Person";
                    item_type_plural = "Companies/People";
                }
            }
            
            if(this.model.get('total_loaded') === -1 || this.model.get('allow_found') !== 'True'){
                html='<h2>';
            }else
            if(this.model.get('total_loaded') === 1){
                html = '<h2><div class="found">'+this.model.get('total_loaded')+' '+item_type_singular+' Found</div>';    
            }
            else{
                html = '<h2><div class="found">'+this.model.get('total_loaded')+' '+item_type_plural+' Found</div>';    
            }
            
            if(this.model.get('allow_search') === 'True' ){
                html+='<div class="keyword_search"><form method="get" action="/'+asset_name+'/search"><input type="text" name="keyword" class="" placeholder="Search"></form></div>';
            }
            if (asset_name !== 'company_user' || asset_name === 'company_user' && this.model.get('allow_alpha') !== 'True') {
                html+='</h2>';
            }
            if(this.model.get('allow_alpha') === 'True'){
                html+='<div class="sort_by"><span>Sort By: </span><a class="alpha_filter" href="#" data-value ="">Alphabetical</a>|';
                html+='<a class="recent_filter" href="#" data-value ="recent">Recent</a></div>';
                if (asset_name === 'company_user'){
                    html+='</h2>';
                    var selected_user = "";
                    var selected_company = "";
                    var selected_all = "";
                    var searching_for = this.model.get('search_for')
                    if (searching_for === 'user'){
                        selected_user = "selected";
                    }
                    else if (searching_for === 'company'){
                        selected_company = "selected";
                    }
                    else{
                        selected_all = "selected";
                    }
                    html+='<div class="filter_by"><span>Filter By: </span><select class="company_user_filter" href="#" data-value ="">' +
                          '<option value="" ' + selected_all + '>All</option><option value="user"' + selected_user + '>Person</option><option value="company" ' + selected_company + '>Company</option></select></div>';
                }
                html+='<div class="parent_alpha_filter_control">';
                for(var i = 'A'.charCodeAt(); i <= 'Z'.charCodeAt(); i++){
                  
                    html += '<div class="alpha_filter_control"><a class="alpha_filter" href="#" data-value ='+String.fromCharCode(i)+'>'+String.fromCharCode(i)+'</a>|';
    
                }
                html+='<a class="alpha_filter" href="#" data-value ="[0-9]">#</a></div>';
                html+='</div>';
            }
            
            return html;
              
        },
        
        get_pagination_control_html: function(){
            /*
             * Display the pagination control keys at the bottom
             * */
            var total_page = parseInt(this.model.get('total_page'));
            var current_page = parseInt(this.model.get('current_page'));
            var pagination_control_html='';
 
            if(current_page <= total_page && !(total_page === 0 || total_page === 1)){
                pagination_control_html+='<div class="button_group">';
                if(current_page !== 1 && current_page !== 0){
                    pagination_control_html +='<a class="button default small page" data-page="'+(current_page-1)+'">Prev </a>';
                }
                else{
                    pagination_control_html +='<a class="button default small page" data-page="'+current_page+'" disabled>Prev </a>';
                }
                pagination_control_html+='</div>';
                
                if(total_page < 10){
                    pagination_control_html+='<div class="button_group">';
                    for(var i = 1; i<=total_page; i++){
                       
                        if(i === current_page){
                            pagination_control_html+='<a class="button info small page" data-page="'+i+'">'+i+' </a>';   
                        }else{
                            pagination_control_html+='<a class="button default small page" data-page="'+i+'">'+i+' </a>';
                        }
                 
                    }   
                    pagination_control_html+='</div>';
                }else{ 
                    if(current_page>=5 && current_page <= total_page - 4){
                        pagination_control_html+='<div class="button_group">'
                        pagination_control_html+='<a class="button default small page" data-page="1">1... </a>';
                        pagination_control_html+='</div>';
                        pagination_control_html+='<div class="button_group">';
                        for(var page = current_page - 2; page<=current_page+2; page++){
                            
                            if(page === current_page){
                                pagination_control_html+='<a class="button info small page" data-page="'+page+'">'+page+' </a>';   
                            }else{
                                pagination_control_html+='<a class="button default small page" data-page="'+page+'">'+page+' </a>';
                            }
                     
                        } 
                        pagination_control_html+='</div>';
                        pagination_control_html+='<div class="button_group">'
                        pagination_control_html+='<a class="button default small page" data-page="'+total_page+'">...'+total_page+' </a>'; 
                        pagination_control_html+='</div>';
                    }else{
                        if(current_page<=5){
                            pagination_control_html+='<div class="button_group">';
                            for(page = 1; page <=6; page++){
                                if(page === current_page){
                                    pagination_control_html+='<a class="button info small page" data-page="'+page+'">'+page+' </a>';   
                                }else{
                                    pagination_control_html+='<a class="button default small page" data-page="'+page+'">'+page+' </a>';
                                }       
                            }
                            pagination_control_html+='</div>';
                            
                            pagination_control_html+='<div class="button_group">';
                            pagination_control_html+='<a class="button default small page" data-page="'+total_page+'">...'+total_page+' </a>';
                            pagination_control_html+='</div>';
                        }else if(current_page>=total_page - 4){
                            pagination_control_html+='<div class="button_group">';
                            pagination_control_html+='<a class="button default small page" data-page="1">1... </a>';
                            pagination_control_html+='</div>';
                            pagination_control_html+='<div class="button_group">';
                            for(page = total_page - 5; page <= total_page; page++){
                                if(page === current_page){
                                    pagination_control_html+='<a class="button info small page" data-page="'+page+'">'+page+' </a>';   
                                }else{
                                    pagination_control_html+='<a class="button default small page" data-page="'+page+'">'+page+' </a>';
                                }       
                            }
                            pagination_control_html+='</div>';
                            
                            
                        }
                        
                    }
                }
             
                pagination_control_html+='<div class="button_group">';
                if(current_page !== this.model.get('total_page')){
                    pagination_control_html+='<a class="button default small page" data-page="'+(current_page+1)+'">Next </a>';
                }else{
                    pagination_control_html+='<a class="button default small page" data-page="'+current_page+'"disabled>Next </a>';   
                }
                pagination_control_html+='</div>';
                
                pagination_control_html+='<div class="button_group"><a class="button default small go">Go</a></div><input type="text" class="goto">';
                    
            }
            
            
            return pagination_control_html;
               
        }
    
    });

});
