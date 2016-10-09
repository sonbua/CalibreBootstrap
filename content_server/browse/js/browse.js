$(document).ready(function() {
    eval(script);
    $('article').readmore({
        moreLink: "<a href='#' class='readMore'>Read More</a>",
        lessLink: "<a href='#' class='readMore'>Read Less</a>",
        collapsedHeight:190,
    });

    init();
    $(".loading").html('<div class="loading spinner"> <div class="bounce1"></div> <div class="bounce2"></div><div class="bounce3"></div></div>');

    // Selectors
    var $sort_combobox_container = $("#sort_combobox_container"),
    $sort_combobox = $("#sort_combobox");

    // Beautify our buttons
    $(".ui-button, .read").button().addClass("btn");
    //$(".navlink, .navleft a, .navright a").button().addClass("btn btn-primary btn-small");

    // Goto the first page
    goto_page();

    // I forget what this does.
    if (window.location.href.indexOf('category') !== -1) {
        if (window.location.href.indexOf('newest') === -1) {
            $sort_combobox_container.removeClass("hide");
        }
    }

    // When our sort order changes, resort and reload
    $sort_combobox.on("change",function() {
        cookie(sort_cookie_name, this.value);
        window.location.reload();
    });

    $(document).on("click","a.details",function() {
        show_details(this);
    });


    // Cookies {{{
    /**
     * Create a cookie with the given name and value and other optional parameters.
     *
     * @example $.cookie('the_cookie', 'the_value');
     * @desc Set the value of a cookie.
     * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
     * @desc Create a cookie with all available options.
     * @example $.cookie('the_cookie', 'the_value');
     * @desc Create a session cookie.
     * @example $.cookie('the_cookie', null);
     * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
     *       used when the cookie was set.
     *
     * @param String name The name of the cookie.
     * @param String value The value of the cookie.
     * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
     * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
     *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
     *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
     *                             when the the browser exits.
     * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
     * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
     * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
     *                        require a secure protocol (like HTTPS).
     * @type undefined
     *
     * @name $.cookie
     * @cat Plugins/Cookie
     * @author Klaus Hartl/klaus.hartl@stilbuero.de
     */

    function cookie(name, value, options) {
        if (typeof value != 'undefined') { // name and value given, set cookie
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
            }
            // CAUTION: Needed to parenthesize options.path and options.domain
            // in the following expressions, otherwise they evaluate to undefined
            // in the packed version for some reason...
            var path = options.path ? '; path=' + (options.path) : '';
            var domain = options.domain ? '; domain=' + (options.domain) : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        } else { // only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    };

    // }}}

    // Sort {{{

    /*
       function init_sort_combobox() {
       $("#sort_combobox").multiselect({
multiple: false,
header: sort_select_label,
noneSelectedText: sort_select_label,
selectedList: 1,
click: function(event, ui){
$(this).multiselect("close");
cookie(sort_cookie_name, ui.value);
alert(ui.value);
window.location.reload();
}
});
}
*/

    // }}}

    function init() {
        //init_sort_combobox();
        $("#search_box input:submit").button();
    }

    // Top-level feed {{{

    function toplevel_layout() {
        var last = $(".toplevel li").last();
        var title = $('.toplevel h3').first();
        if (title && title.position()) {
            var bottom = last.position().top + last.height() - title.position().top;
            $("#main").height(Math.max(200, bottom+75));
        }
    }

    function toplevel() {
        $(".sort_select").hide();

        $(".toplevel li").click(function() {
            var href = $(this).children("a").attr('href');
            window.location = href;
        });

        toplevel_layout();
        $(window).resize(toplevel_layout);

    }
    // }}}

    function render_error(msg) {
        var st = "";
        try {
            var st = printStackTrace();
            st = st.join('\n\n');
        } catch(e) {
        }
        return '<div class="ui-widget"><div class="ui-state-error ui-corner-all" style="padding: 0pt 0.7em"><p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: 0.3em">&nbsp;</span><strong>Error: </strong>'+msg+"<pre>"+st+"</pre></p></div></div>"
    }

    // Category feed {{{

    function category_clicked() {
        var href = $(this).find("a").attr('href');
        window.location = href;
    }

    function category() {  
        var $g = $("#groups");

        $(".category .category-item").click(category_clicked);

        $(".category a.navlink").button();


        //$g.find(".loading,.loaded").addClass("hide");
        $g.find("h3").each(function() {
            $(this).addClass("accordion-heading").button();
            $(this).next("div").addClass("accordion-inner collapse");
            $(this).on("click", function(event, ui) {
                var $t = $(this),
                $c = $t.next("div");
                $c.collapse('toggle');
                var href = $t.find("a.load_href").attr('href');
                if (href) {
                    $.ajax({
                        url:href,
                        cache: false,
                        data:{'sort':cookie(sort_cookie_name)},
                        success: function(data) {
                            $c.find(".loaded").html(data).removeClass('hide').show();
                            $c.find(".loading").addClass('hide');
                        }
                    });
                }
                event.preventDefault();
                return false;
            });
        });
        /*
           $("#groups").accordion({
collapsible: true,
active: false,
autoHeight: false,
clearStyle: true,
header: "h3",

change: function(event, ui) {
if (ui.newContent) {
var href = ui.newContent.prev().children("a.load_href").attr('href');
ui.newContent.children(".loading").show();
if (href) {
$.ajax({
url:href,
cache: false,
data:{'sort':cookie(sort_cookie_name)},
success: function(data) {
this.children(".loaded").html(data);
this.children(".loaded").show();
this.children(".loading").hide();
this.find('.category-item').click(category_clicked);
},
context: ui.newContent,
dataType: "json",
timeout: 600000, 
error: function(xhr, stat, err) {
this.children(".loaded").html(render_error(stat));
this.children(".loaded").show();
this.children(".loading").hide();
}
});
}
}
}
});*/
    }
    // }}}

    // Booklist {{{

    function first_page() {
        load_page($("#booklist #page0"));
    }

    function last_page() {
        load_page($("#booklist .page").last());
    }

    function next_page() {
        var elem = $("#booklist .page:visible").next('.page');
        if (elem.length > 0) load_page(elem);
        else first_page();
    }

    function previous_page() {
        var elem = $("#booklist .page:visible").prev('.page');
        if (elem.length > 0) load_page(elem);
        else last_page();
    }

    function goto_page_old() {
        var gp = $('#goto_page_dialog');
        var gp_body = gp.find(".modal-body");
        var pl = $('#booklist > #pagelist');
        pl.find("li").each(function() {
            alert($(this).find("a").attr("title"));
        });
        gp.find(".modal-title").html(pl.attr('title'));
        gp_body.html(pl.html());
        /*
           gp.dialog('option', 'title', pl.attr('title'));
           gp.dialog('option', 'height', $(window).height() - 100);
           gp.dialog('open');
           */
        gp.modal('show');

    }


    function hidesort() {$("#content > .sort_select").hide();}

    function booklist(hide_sort) {
        if (hide_sort) hidesort();
        var test = $("#booklist #page0").html();
        if (!test) {
            $("#booklist").html(render_error("No books found"));
            return;
        }
        /*
           $("#book_details_dialog").dialog({
autoOpen: false,
modal: true,
show: 'slide'
});
$("#goto_page_dialog").dialog({
autoOpen: false,
modal: true,
show: 'slide'
});
*/

        first_page(); 
    }

    function search_result() {
        var test = $("#booklist #page0").html();
        if (!test) {
            $("#booklist").html("No books found matching this query");
            return;
        }
        booklist();
    }

    function show_details(a_dom) {
        var book = $(a_dom).closest('div.summary');
        var bd = $('#book_details_dialog');
        var bd_body = bd.find(".modal-body");
        var bd_title = $("#modal_book_title");

        bd_title.html(book.find(".title").text());
        bd.modal('show');
        bd_body.html('<div class="loading spinner"> <div class="double-bounce1"></div> <div class="double-bounce2"></div> </div>');
        //bd_body.html('<span class="loading pull-center"><img src="'+url_prefix+'/static/loading.gif" alt="Loading" />Loading, please wait&hellip;</span>');
        /*bd.dialog('option', 'width', $(window).width() - 100);
          bd.dialog('option', 'height', $(window).height() - 100);
          bd.dialog('option', 'title', book.find('.title').text());
          */

        $.ajax({
            url: book.find('.details-href').attr('title'),
            context: bd,
            cache: false,
            dataType: "json",
            timeout: 600000, //milliseconds (10 minutes)
            error: function(xhr, stat, err) {
                bd_body.html(render_error(stat));
            },
            success: function(data) {
                bd_body.html(data);
            }
        });

        //bd.dialog('open');
    }

    // }}}

    function book() {
        hidesort();
        $('.details .left img').load(function() {
            var rb = $('#random_button');
            rb.button();
            var img = $('.details .left img');
            var height = $('#main').height();
            var bh = 0;
            if (rb.length > 0) {
                bh = rb.height();
            }
            height = Math.max(height, img.height() + bh + 100);
            $('#main').height(height);
        });
    }
});


/* This has to live outside ready() because it's called inline via the python binary */
function first_page() {
    load_page($("#booklist #page0"));
}

function last_page() {
    load_page($("#booklist .page").last());
}

function next_page() {
    var elem = $("#booklist .page:visible").next('.page');
    if (elem.length > 0) load_page(elem);
    else first_page();
}

function previous_page() {
    var elem = $("#booklist .page:visible").prev('.page');
    if (elem.length > 0) load_page(elem);
    else last_page();
}

function load_page(elem) {
    if (elem.is(":visible")) return;
    var ld = elem.find('.load_data');
    var ids = ld.attr('title');
    var href = ld.find(".url").attr('title');
    elem.children(".loaded").hide();

    $.ajax({
        url: href,
        context: elem,
        dataType: "json",
        cache : false,
        type: 'POST',
        timeout: 600000, //milliseconds (10 minutes)
        data: {'ids': ids},
        error: function(xhr, stat, err) {
            this.children(".loaded").html(render_error(stat)).show();
            this.children(".loading").hide();
        },
        success: function(data) {
            this.children(".loaded").html(data).fadeIn(1000);
            this.find(".left a.read").button();
            this.children(".loading").hide();
            this.parent().find('.navmiddle .start').html(this.find('.load_data .start').attr('title'));
            this.parent().find('.navmiddle .end').html(this.find('.load_data .end').attr('title'));
            goto_page();
            this.find('article').readmore({
                moreLink: "<a href='#' class='readMore'>Read More</a>",
                lessLink: "<a href='#' class='readMore'>Read Less</a>",
                collapsedHeight:190,
            });
            this.find(".ui-button, .read").button().addClass("btn btn-block btn-primary").html("Download");
            $.each(this.find("img"), function(i) {
                var src = $(this).attr("src").replace("90_120","180_240");
                $(this).attr("src", src);
            });
        }
    });
    $("#booklist .page:visible").hide();
    elem.children(".loaded").hide();
    elem.children(".loading").show();
    elem.show();
}
function gp_internal(id) {
    //var gp = $('#goto_page_dialog');
    //gp.modal('hide');
    var elem = $("#booklist #" + id);
    load_page(elem);
}

// this actually just builds the dropdown now... disliked a modal for it.
function goto_page() {
    var pl = $('#booklist > #pagelist');
    var dd = $(".navmiddle").find("select");
    var i = 0;
    var cur = $(".page:visible").eq(0).attr("id");
    if (dd.length) {
        dd.find("[value='"+cur+"']").attr('selected',true);
        return;
    }
    var html="<select onchange='gp_internal(this.value);return false;'>";
    pl.find("li").each(function() {
        var $link = $(this),
        title = $link.attr("title"),
        id = "page"+i;
        text = $link.text();

        if (id === cur) {
            html += "<option SELECTED value='"+id+"'>"+text+"</option>";
        } else {
            html += "<option value='"+id+"'>"+text+"</option>";
        }
        i++;
    });
    $(".navmiddle").children().hide();
    $(".navmiddle").prepend(html);
}


