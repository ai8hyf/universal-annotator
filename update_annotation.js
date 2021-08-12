let cur_joke = null
let api_response
let item_per_page = 25
let image_cache = {}

// start-up preps
////////////////////////////
$(".tag-container").html('Loading... <i class="fa fa-spinner fa-spin fa-fw"></i>')

async function update_anno_api_response(){
    temp = await $.ajax({
        type: 'POST',
        url: 'get_possible_entry_api.php'
    });
    api_response = JSON.parse(temp)
}
update_anno_api_response()
////////////////////////////

function openBase64InNewTab (data, mimeType) {
    var byteCharacters = atob(image_cache[data]);
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var file = new Blob([byteArray], { type: mimeType + ';base64' });
    var fileURL = URL.createObjectURL(file);
    window.open(fileURL);
}

function V_center(){
    let container_height = $(".modal-left").outerHeight()
    let element_height = $(".modal-left>img").outerHeight();
    $(".modal-left>img").css("margin-top", (container_height-element_height)/2)
}

function show_anno_window(joke_id, img_url, img_type){
    
    $(".first-group-control").show()
    $(".second-group-control").hide()
    
    cur_joke = joke_id

    src='data:image/"+img_type+";base64,"+img_content+"'

    $(".annotation-block>div>select").html('')
    $(".annotation-block>div>select").append('<option value="" selected> -- </option>')

    $(".modal-left").html('')
    $(".modal-left").append('<a onclick="openBase64InNewTab(\''+img_url+'\', \'image/'+img_type+'\')" target="_blank"><img style="min-height:30px; max-height:450px;" src="data:image/'+img_type+';base64,'+image_cache[img_url]+'"  alt="'+img_url+'"></a>')
    
    api_response['FORMS'].forEach(function(item){
        $("#annotation_form").append('<option value="'+item+'">'+item+'</option>')
    })

    api_response['LANGUAGE'].forEach(function(item){
        $("#annotation_language").append('<option value="'+item+'">'+item+'</option>')
    })

    api_response['POLITICAL'].forEach(function(item){
        $("#annotation_politics").append('<option value="'+item+'">'+item+'</option>')
    })

    api_response['USERGENERATED'].forEach(function(item){
        $("#annotation_usergen").append('<option value="'+item+'">'+item+'</option>')
    })

    $("#workplace").fadeIn()
    $("#anno_error_msg").hide()
    $("#workplace").css("display","flex")
    V_center()
}

function go_to_review(){
    let language_anno = $("#annotation_language").val()
    let politics_anno = $("#annotation_politics").val()
    let form_anno = $("#annotation_form").val()
    let usergen_anno = $("#annotation_usergen").val()

    if(language_anno=="" && politics_anno=="" && form_anno=="" && usergen_anno==""){
        $("#anno_error_msg").fadeIn()
    }else{
        $("#anno_error_msg").fadeOut()

        $(".annotation-review>button").html('Not Provided&nbsp;&nbsp;<i class="fa fa-exclamation-circle" aria-hidden="true"></i>')
        $(".annotation-review>button").removeClass("is-success")
        $(".annotation-review>button").addClass("is-light")

        if(language_anno!=""){
            $("#review_language").removeClass("is-light")
            $("#review_language").addClass("is-success")
            $("#review_language").html(language_anno+'&nbsp;&nbsp;<i class="fa fa-check-circle" aria-hidden="true"></i>')
        }

        if(politics_anno!=""){
            $("#review_politics").removeClass("is-light")
            $("#review_politics").addClass("is-success")
            $("#review_politics").html(politics_anno+'&nbsp;&nbsp;<i class="fa fa-check-circle" aria-hidden="true"></i>')
        }

        if(form_anno!=""){
            $("#review_form").removeClass("is-light")
            $("#review_form").addClass("is-success")
            $("#review_form").html(form_anno+'&nbsp;&nbsp;<i class="fa fa-check-circle" aria-hidden="true"></i>')
        }

        if(usergen_anno!=""){
            $("#review_usergen").removeClass("is-light")
            $("#review_usergen").addClass("is-success")
            $("#review_usergen").html(usergen_anno+'&nbsp;&nbsp;<i class="fa fa-check-circle" aria-hidden="true"></i>')
        }
        
        $(".annotation-block").fadeOut(function(){
            $(".annotation-review").fadeIn()
        })

        $(".first-group-control").fadeOut(function(){
            $(".second-group-control").fadeIn()
        })
        
    }
}


function return_to_workplace(){
    $(".annotation-review").fadeOut(function(){
        $(".annotation-block").fadeIn()
    })
    

    $(".second-group-control").fadeOut(function(){
        $(".first-group-control").fadeIn()
    })
    
}


$("#submit_anno_button").click(function(){
    $("#go_back_button").fadeOut()
    $("#submit_anno_button").addClass("is-loading")

    let language_anno = $("#annotation_language").val()
    let politics_anno = $("#annotation_politics").val()
    let form_anno = $("#annotation_form").val()
    let usergen_anno = $("#annotation_usergen").val()

    let request_data = {"LANGUAGE": language_anno, "POLITICS":politics_anno, "FORM":form_anno, "USERGEN":usergen_anno, "JOKE_ID":cur_joke}

    $.ajax({
        type: 'POST',
        url: 'update_annotation_api.php',
        data: request_data,
        success: function(response){
            console.log("Success!")
            // alert(response)
            setTimeout(function(){
                $("#submit_anno_button").removeClass("is-loading")
                $("#submit_anno_button").html('<i class="fa fa-check-circle" aria-hidden="true"></i>')
            }, 1000)
        
            setTimeout(function(){
                review_modal.hide()

                if($("#all_new").prop('checked')){
                    $("#joke_id_"+cur_joke.toString()).hide()
                }
                
                cur_joke = null

            }, 1500)
        
            setTimeout(function(){
                $("#go_to_workplace").fadeIn()
                $("#submit_anno_button").show()
                $("#submit_button_loading").hide()
                $("#submit_button_success").hide()
            },2000)
        }
    });
})

function closeModal(){
    $("#workplace").fadeOut()
}

function smartPagination(total_item, each_page, max_button, container_id, cur_page){
    let total_page = Math.ceil (total_item / each_page)
    $(container_id).html("")
    $(container_id).append('<nav class="pagination is-rounded is-small" role="navigation" aria-label="pagination"><ul class="pagination-list"></ul></nav>')
    new_container_id = ".pagination-list"

    console.log("running1")

    let prev = cur_page - 1
    let next = cur_page + 1

    if(prev == 0){
        $(new_container_id).append('<li><a class="pagination-link  is-disabled"><i class="fa fa-angle-left" aria-hidden="true"></i></a></li>')
    }else{
        $(new_container_id).append('<li><a class="pagination-link" onclick="request_jokes('+prev.toString()+')"><i class="fa fa-angle-left" aria-hidden="true"></i></a></li>')
    }

    console.log("running2")

    if(total_page==1){
        $(new_container_id).append('<li><a class="pagination-link">1</a></li>')
    }else if(total_page <= max_button){

        let page_num = 1
        while(total_page >= page_num){
            if(page_num == cur_page){
                $(new_container_id).append('<li><a class="pagination-link is-current">'+page_num.toString()+'</a></li>')
            }else{
                $(new_container_id).append('<li><a class="pagination-link" onclick="request_jokes('+page_num.toString()+')">'+page_num.toString()+'</a></li>')
            }
            page_num+=1
        }

    }else{
        let render_list = [1,total_page]
        if(render_list.includes(cur_page-1) == false && cur_page-1 > 0){
            render_list.push(cur_page-1)
        }
        if(render_list.includes(cur_page) == false){
            render_list.push(cur_page)
        }
        if(render_list.includes(cur_page+1) == false && cur_page+1 <= total_page){
            render_list.push(cur_page+1)
        }
        render_list = render_list.sort(function (a, b) {  return a - b;  })

        for(let i=0;i<render_list.length;i++){
            if(i>0 && render_list[i]>render_list[i-1]+1){
                $(new_container_id).append('<li><span class="pagination-ellipsis">&hellip;</span></li>')
            }
            let page_num = render_list[i]
            if(page_num == cur_page){
                $(new_container_id).append('<li><a class="pagination-link is-current">'+page_num.toString()+'</a></li>')
            }else{
                $(new_container_id).append('<li><a class="pagination-link" onclick="request_jokes('+page_num.toString()+')">'+page_num.toString()+'</a></li>')
            }
        }
    }

    if(next > total_page){
        $(new_container_id).append('<li><a class="pagination-link is-disabled"><i class="fa fa-angle-right" aria-hidden="true"></i></a></li>')
    }else{
        $(new_container_id).append('<li><a class="pagination-link" onclick="request_jokes('+next.toString()+')"><i class="fa fa-angle-right" aria-hidden="true"></i></a></li>')
    }

    // $(new_container_id).append('<li class="pagination-link"><span class="page-link no-border">Total: '+total_item.toString()+'</span></li>')
}

function request_jokes(page_num){

    $(".not-found").hide()
    $("#masonry").html("")

    $(".main-loading-animation").show()
    $(".main-loading-animation").css("margin-top", "70px")

    let COUNTRY = $("#inputCOUNTRY>button").text().trim()
    let LANGUAGE = $("#inputLANGUAGE>button").text().trim()
    let POLITICS = $("#inputPOLITICS>button").text().trim()
    let FORM = $("#inputFORM>button").text().trim()
    let USERGEN = $("#inputUSERGEN>button").text().trim()
    let INCLUDE_ALL = $("#all_new").prop('checked')

    let request_data = {"COUNTRY":COUNTRY, "LANGUAGE": LANGUAGE, "POLITICS":POLITICS, "FORM":FORM, "USERGEN":USERGEN, "OFFSET": (page_num-1)*item_per_page, "ITEM_PER_PAGE":item_per_page, "INCLUDE_ALL": INCLUDE_ALL}

    $.ajax({
        type: 'POST',
        url: 'request_jokes_api.php',
        data: request_data,
        success: function(response){

            let res = JSON.parse(response)

            console.log(res)

            if (res['count'] == 0){
                $("#pagination-container").html("")
                $(".not-found").show()
            }else{
                // add pagination
                smartPagination(res['count'], item_per_page, 8, "#masonry-container", page_num)
                // add masonry
                $(".main-loading-animation").css("margin-top", "20px")

                let img_paths = []

                res['data'].forEach(function(item){
                    img_paths.push(item[0])
                })

                $.ajax({
                    type: 'POST',
                    url: 'get_image_api.php',
                    data: {"IMAGES":img_paths},
                    success: function(result){
                        
                        $(".main-loading-animation").hide()

                        image_cache = JSON.parse(result)

                        res['data'].forEach(function(item){

                            let pid = item[2]
                            let img_content = image_cache[item[0]]
                            let img_type = item[0].split(".")
                            img_type = img_type[img_type.length-1]

                            // if(item[0]==""){
                            //     $("#masonry").append("<div id='joke_id_"+pid+"' class='col-lg-3 mb-3' onclick='show_anno_window("+pid+", \""+item[0]+"\", \"jpg\")'><div class='joketext'>"+item[1]+"</div></div>")
                            // }else{
                            //     $("#masonry").append("<img id='joke_id_"+pid+"' onclick='show_anno_window("+pid+", \""+item[0]+"\", \""+img_type+"\")' src='data:image/"+img_type+";base64,"+img_content+"' alt='"+item[0]+"'>")
                            // }

                            $("#masonry").append("<img id='joke_id_"+pid+"' onclick='show_anno_window("+pid+", \""+item[0]+"\", \""+img_type+"\")' src='data:image/"+img_type+";base64,"+img_content+"' alt='"+item[0]+"'>")
                        })
                    }
                });
            }
        }
    });
}

function request_tags(tag_type){
    return $.ajax({
        type: 'POST',
        url: 'request_tags_api.php',
        data: "request_type="+tag_type
    });
}

async function get_tags(tag_type){
    try {
        let res = await request_tags(tag_type)
        res = JSON.parse(res)

        let container_id = "#" + tag_type.toLowerCase() + "_tags"
        $(container_id).html("")
        res.forEach(function(item){
            $(container_id).append("<button class='button is-rounded is-small' onclick=\"setTag('"+tag_type+"' ,'"+item+"')\">"+item+"</button>")
        })

    } catch(err) {
        console.log(err);
    }
}

get_tags("COUNTRY")
get_tags("LANGUAGE")
get_tags("POLITICS")
get_tags("FORM")
get_tags("USERGEN")

function setTag(tag_type, tag){
    tag = tag.split(' (')[0].trim()
    $("#input"+tag_type).html('<button onclick="clear_tag(\''+tag_type+'\')" class="button is-rounded is-small is-success">'+tag+' &nbsp;<i class="fa fa-close" aria-hidden="true"></i></button>')
}

function clear_tag(tag_type){
    $("#input"+tag_type).html("")
}

$('#all_new').change(function() {
    request_jokes(1)        
});