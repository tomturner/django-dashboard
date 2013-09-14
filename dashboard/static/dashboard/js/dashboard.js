function changeHeight(obj) {
    obj.height=obj.contentWindow.document.body.scrollHeight;
}

var iDashboard = {
    
    jQuery : $,
    
    settings : {
        columns : '.column',
        gadgetSelector: '.gadget',
        handleSelector: '.gadget-head',
        contentSelector: '.gadget-content',
        csrf_token: '',
        update_url: '',
        fields: [],
        
        gadgetDefault : {
            movable: true,
            removable: true,
            collapsible: true,
            editable: true,
            icon: '',
            colorClasses : ['color-yellow', 'color-red', 'color-blue', 'color-white', 'color-orange', 'color-green', 'color-purple', 'color-cyan']
        },
        gadgetIndividual : function (id) {
            return mainGadgetIndividual(id);
           
        }
    },

    init : function (update_url, csrf_token, css_folder) {
        this.attachStylesheet(css_folder+'dashboard.js.css');
        this.sortGadgets();
        this.addGadgetControls();
        this.makeSortable();
        this.settings.csrf_token=csrf_token;
        this.settings.update_url=update_url;
    },
    
    getGadgetSettings : function (id) {
        var $ = this.jQuery,
            settings = this.settings;
            var gi = settings.gadgetIndividual(id);
        return (id && gi) ? $.extend({},settings.gadgetDefault,gi) : settings.gadgetDefault;
    },
    
    addGadgetControls : function () {
        var iDashboard = this,
            $ = this.jQuery,
            settings = this.settings;
            
        $(settings.gadgetSelector, $(settings.columns)).each(function () {
            var thisGadgetSettings = iDashboard.getGadgetSettings(this.id);
            var mainId = this.id;
            if (thisGadgetSettings.removable) {
                $('<a href="#" class="remove">CLOSE</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).click(function () {
                    if(confirm('This gadget will be removed, ok?')) {
                        $(this).parents(settings.gadgetSelector).animate({
                            opacity: 0    
                        },function () {
                            $(this).wrap('<div/>').parent().slideUp(function () {
                                $(this).remove();
                                iDashboard.savePreferences();
                            });
                        });
                    }
                    return false;
                }).appendTo($(settings.handleSelector, this));
            }
            
            if (thisGadgetSettings.collapsible) {
                $('<a href="#" class="collapse">COLLAPSE</a>').mousedown(function (e) {
                                /* STOP event bubbling */
                                e.stopPropagation();    
                    }).click(function(){
                        $(this).parents(settings.gadgetSelector).toggleClass('collapsed');
                        iDashboard.savePreferences();
                        return false;    
                    }).appendTo($(settings.handleSelector,this));
                }
            if (thisGadgetSettings.icon.length > 0) {
                $('<img src="'+thisGadgetSettings.icon+'" class="icon">').prependTo($(settings.handleSelector,this));
            }
            if (thisGadgetSettings.editable) {
                $('<a href="#" class="edit">EDIT</a>').mousedown(function (e) {
                    /* STOP event bubbling */
                    e.stopPropagation();    
                }).toggle(function () {
                    $(this).css({backgroundPosition: '-66px 0', width: '55px'})
                        .parents(settings.gadgetSelector)
                            .find('.edit-box').show().find('input').focus();
                    return false;
                },function () {
                    $(this).css({backgroundPosition: '', width: '24px'})
                        .parents(settings.gadgetSelector)
                            .find('.edit-box').hide();
                    return false;
                }).appendTo($(settings.handleSelector,this));
                
                $('<div class="edit-box" style="display:none;"/>')
                    .append('<ul><li class="item"><label>Change the title?</label><input name="gadgettitle" id="gadgettitle'+this.id+'" value="' + $('h3',this).text() + '"/></li>')
                    .append((function(){
                        var colorList = '<li class="item"><label>Available colours:</label><ul class="colors">';
                        $(thisGadgetSettings.colorClasses).each(function () {
                            colorList += '<li class="' + this + '"/>';
                        });
                        return colorList + '</ul>';
                    })())
                    .append((function(){
                        fieldList = '';
                        $(thisGadgetSettings.fields).each(function () {
                            if (this.type == 'text') {
                                fieldList += '<ul><li class="item"><label>'+this.title+'</label><input type="text" id="'+mainId+this.id+'" gadgetid="'+mainId+'" name="'+this.id+'" value="'+this.value+'"/></li>';
                            } else if (this.type == 'checkbox') {
                                checked = '';
                                if (this.value == '1') {
                                    checked = ' checked';
                                }
                                fieldList += '<ul><li class="item"><label>'+this.title+'</label><input type="checkbox" id="'+mainId+this.id+'" gadgetid="'+mainId+'" name="'+this.id+'"'+checked+'/></li>';
                            } else if(this.type == 'choice') {
                                fieldList += '<ul><li class="item"><label>'+this.title+'</label><select id="'+mainId+this.id+'" gadgetid="'+mainId+'">';
                                selected = this.value;
                                $(this.choices).each(function () {
                                    if (this[0] == selected) {
                                        fieldList += '<option value="'+this[0]+'" selected>'+this[1]+'</option>';
                                    } else {
                                        fieldList += '<option value="'+this[0]+'">'+this[1]+'</option>';
                                    }
                                });
                                fieldList += '</select></li>';
                            }
                        });
                        return fieldList;
                    })())
                    .append('<ul><li class="item"><label>&nbsp;</label><input type="button" value="Save" onclick="iDashboard.submitPreferences(\''+mainId+'\');"></input></li></ul></form>')
                    .insertAfter($(settings.handleSelector,this));
            }
        });
        $('.edit-box').each(function () {
            $('ul.colors li',this).click(function () {
                
                var colorStylePattern = /\bcolor-[\w]{1,}\b/,
                    thisGadgetColorClass = $(this).parents(settings.gadgetSelector).attr('class').match(colorStylePattern)
                if (thisGadgetColorClass) {
                    $(this).parents(settings.gadgetSelector)
                        .removeClass(thisGadgetColorClass[0])
                        .addClass($(this).attr('class').match(colorStylePattern)[0]);
                    iDashboard.savePreferences();
                }
                return false;
                
            });
        });
        
    },
    
    attachStylesheet : function (href) {
        var $ = this.jQuery;
        return $('<link href="' + href + '" rel="stylesheet" type="text/css" />').appendTo('head');
    },
    
    makeSortable : function () {
        var iDashboard = this,
            $ = this.jQuery,
            settings = this.settings,
            $sortableItems = (function () {
                var notSortable = '';
                $(settings.gadgetSelector,$(settings.columns)).each(function (i) {
                    if (!iDashboard.getGadgetSettings(this.id).movable) {
                        if(!this.id) {
                            this.id = 'gadget-no-id-' + i;
                        }
                        notSortable += '#' + this.id + ',';
                    }
                });
                return $('> li:not(' + notSortable + ')', settings.columns);
            })();
        
        $sortableItems.find(settings.handleSelector).css({
            cursor: 'move'
        }).mousedown(function (e) {
            $sortableItems.css({width:''});
            $(this).parent().css({
                width: $(this).parent().width() + 'px'
            });
        }).mouseup(function () {
            if(!$(this).parent().hasClass('dragging')) {
                $(this).parent().css({width:''});
            } else {
                $(settings.columns).sortable('disable');
            }
        });

        $(settings.columns).sortable({
            items: $sortableItems,
            connectWith: $(settings.columns),
            handle: settings.handleSelector,
            placeholder: 'gadget-placeholder',
            forcePlaceholderSize: true,
            revert: 300,
            delay: 100,
            opacity: 0.8,
            containment: 'document',
            start: function (e,ui) {
                $(ui.helper).addClass('dragging');
            },
            stop: function (e,ui) {
                $(ui.item).css({width:''}).removeClass('dragging');
                $(settings.columns).sortable('enable');
                iDashboard.savePreferences();
            }
        });
    },
    submitPreferences : function (gadgetId) {
        var iDashboard = this,
            $ = this.jQuery,
            settings = this.settings;
        $(settings.columns).each(function(i){
            column_number = i+1;
            $(settings.gadgetSelector,this).each(function(i){
               var title = $("#gadgettitle"+this.id);
               $(title).parents(settings.gadgetSelector).find('h3').text( $(title).val().length>20 ? $(title).val().substr(0,20)+'...' : $(title).val() );
            });
        });
        iDashboard.savePreferences(gadgetId);

        
    },
    savePreferences : function (gadgetId) {
        var iDashboard = this,
            $ = this.jQuery,
            settings = this.settings;
        xml_string="<xml>\r\n";
        $(settings.columns).each(function(i){
            column_number = i+1;
            xml_string+="<column id=\""+column_number+"\">\r\n";
            $(settings.gadgetSelector,this).each(function(i){
                collapse=$(settings.contentSelector,this).css('display') == 'none' ? "true" : "false";
                mainId = $(this).attr('id');
                xml_string+="<gadget id=\""+$(this).attr('dbid')+"\" ";
                xml_string+="colour=\""+$(this).attr('class').match(/\bcolor-[\w]{1,}\b/)+"\" ";
                xml_string+="title=\""+$('h3:eq(0)',this).text().replace(/\|/g,'[-PIPE-]').replace(/,/g,'[-COMMA-]')+"\" ";
                xml_string+="collapsed=\""+collapse+"\">";
                var thisGadgetSettings = iDashboard.getGadgetSettings($(this).attr('id'));
                $(thisGadgetSettings.fields).each(function () {
                    xml_string+="<"+this.id+">";
                    var docForm=document.getElementById(mainId+this.id);
                    if (this.type == 'text') {
                        xml_string+=docForm.value;
                    } else if(this.type == 'checkbox') {
                        if (docForm.checked) {
                            xml_string+='1';
                        } else {
                            xml_string+='0';
                        }
                    } else if(this.type == 'choice') {
                        xml_string+=docForm.options[docForm.selectedIndex].value;
                    }
                    
                    xml_string+="</"+this.id+">";
                });
                xml_string+="</gadget> \r\n";
            });
            xml_string+="</column>\r\n";
        });
        
        xml_string+="</xml>\r\n";
        $.post(this.settings.update_url, { xml: xml_string, csrfmiddlewaretoken: settings.csrf_token },function(data){
         if(gadgetId != undefined){
            $('#iframe'+gadgetId).attr("src", $('#iframe'+gadgetId).attr("src"));
            changeHeight(document.getElementById('iframe'+gadgetId));
         }
        
        });
    },
    sortGadgets : function () {
        var iDashboard = this,
            $ = this.jQuery,
            settings = this.settings;
        
        $(settings.columns).each(function(i){
        //alert('load here');
        });
        $(settings.columns).css({visibility:'visible'});
    }
};
