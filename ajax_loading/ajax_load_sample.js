ss.views.EventPageApp = Backbone.View.extend({
        events:{
            'click .section_filter' : 'render',
        },
        initialize:function(options){
        },
        render:function(event){
            /*
             * Render the main content depending on which tab is selected
             * */
            var context = this;
            var session_id = $(event.target).data('session_id');
            var tab_name = $(event.target).data('name');
            
            //make the selected tab with selected effect
            $(this.el).find('a.section_filter').parent().removeClass('selected');
            $(event.target).parent().addClass('selected');
            
            if(session_id){
                this.$('a.section_filter[data-session_id="'+session_id+'"][data-name="basic_information"]').parent().addClass('selected');
            }else{
                this.$('a.section_filter[data-session_id=""][data-name="'+tab_name+'"]').parent().addClass('selected');
            }
            
            //overwrite the content with loading effect before ajax returns anything
            $('#main_content').html('<div class="loading"></div>');
            $('#secondary_content').html('');
            
            $.ajax({
                url: ss_context.target_url+'/ajax_load_view_page_section',
                data:{'section_id': tab_name, 'session_id': session_id},
                type:'POST',
                success:function(response){
                    //update the content from response
                    $(context.el).find('#main_content').html(response.success.main_html);
                    $(context.el).find('#secondary_content').html(response.success.secondary_html);
                    
                }
            });
        }
});