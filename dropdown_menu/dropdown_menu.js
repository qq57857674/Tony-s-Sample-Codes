$(function(){
    $(document).on('click', '.action_buttons .dropdown_botton', function(event){
                event.preventDefault(); // We don't want to try to submit a form
                var $target = $(event.target);
                var $container = $target.closest(".action_buttons");
                var $dropdown = $container.find(".dropdown_div");
                $dropdown.toggle();
                
                $target.closest(".dropdown_botton").toggleClass("menu_open");
                $dropdown.position({
                    of: $target,
                    my: "left top",
                    at: "left bottom"
                });
            });
            
    $(document).click(function(e){
        var current_dropdown_div = $(e.target).parent().closest('.action_buttons').find('.dropdown_div:visible')
        if(!$(e.target).closest('.action_buttons').find('.dropdown_action_div').length){
            $('.action_buttons .dropdown_div').hide();
            $('.action_buttons .dropdown_botton').removeClass("menu_open");
        }
    
        //hide other dropdown_divs that are visible
        $.each($('.action_buttons .dropdown_div:visible'), function(index,dropdown_div){
            var a = current_dropdown_div;
            if(a.get(0) !== dropdown_div){
                $(dropdown_div).hide();
            }
        });
                
    });
});