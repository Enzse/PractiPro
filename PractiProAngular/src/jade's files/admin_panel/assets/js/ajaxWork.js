//SA SIDEBAR ITO connected to AJAXWORK.JS

function showDocuments(){  
    $.ajax({
        url:"./adminView/viewDocuments.php",
        method:"post",
        data:{record:1},
        success:function(data){
            $('.allContent-section').html(data);
        }
    });
}
function showAdmin(){  
    $.ajax({
        url:"./adminView/viewAdmin_Profiles.php",
        method:"post",
        data:{record:1},
        success:function(data){
            $('.allContent-section').html(data);
        }
    });
}
function showActive_Students(){  
    $.ajax({
        url:"./adminView/viewActive_Students.php",
        method:"post",
        data:{record:1},
        success:function(data){
            $('.allContent-section').html(data);
        }
    });
}

function showStudent_Profile(){
    $.ajax({
        url:"./adminView/viewStudent_Profiles.php",
        method:"post",
        data:{record:1},
        success:function(data){
            $('.allContent-section').html(data);
        }
    });
}

function showOrders(){
    $.ajax({
        url:"./adminView/viewAllOrders.php",
        method:"post",
        data:{record:1},
        success:function(data){
            $('.allContent-section').html(data);
        }
    });
}













