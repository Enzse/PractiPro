<?php
   session_start();
   include_once "./config/dbconnect.php";

?>
        
       <nav class="navbar navbar-expand-lg navbar-light px-5" style="background-color: #f0f0f0;">
           
           <div style="display: flex; align-items: center;">
    <img src="./assets/images/logo.png" width="80" height="80" alt="Swiss Collection">
    <h5 class="resizable" style="margin-left: 10px;">Admin Panel</h5>
</div>

</div>

    </a>
    <ul class="navbar-nav mr-auto mt-2 mt-lg-0"></ul>
    <div class="user-cart">  
        <?php           
        if(isset($_SESSION['user_id'])){
        ?>
            <a href="" style="text-decoration:none;">
                <i class="fa fa-user mr-5" style="font-size:30px; color:#3B3131;" aria-hidden="true"></i>
            </a>
        <?php
        } else {
        ?>
           <a href="adminlogin.php" style="text-decoration:none;">
    <i class="fa fa-sign-in mr-5" style="font-size:30px; color:#3B3131;" aria-hidden="true"></i>
</a>
        <?php
        } ?>
    </div>  
</nav>
