<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="shortcut icon" type="x-icon" href="logo.png">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="./assets/css/style.css">
</head>
<body>
  <!-- Your content goes here -->
</body>
</html>

<?php



?>
<!--jade: separate file for styles and sht-->
<!--jade: non angular or any PHP framework sht-->

<html>
    <div class="container">
        <h3 style="font-weight: bold; text-align: center;">Student Registration</h3><hr><br>
        <form method="post" action="#'enctype="multipart/form-data">
        <div class="form-group">
        <div class="form-group">
            <label for="StudentID">Student ID:</label>
            <input type="StudentID" class="form-control" id="StudentID"placeholder="Enter Student ID" name="StudentID" required>
        </div>
            <label for="FirstName">First Name:</label>
            <input type="text" class="form-control" id="FirstName"placeholder="Enter Fisrt Name" name="FisrtName" required>
        </div>
        <div class="form-group">
            <label for="LastName">Last Name:</label>
            <input type="text" class="form-control" id="LastName"placeholder="Enter Last Name" name="LastName" required>
        </div>   
        <div class="form-group">
            <label for="Email">Email:</label>
            <input type="email" class="form-control" id="Email"placeholder="Enter Domain Email" name="Email" required>
        </div>
        <div class="form-group">
            <label for="Password1">Password:</label>
            <input type="Password" class="form-control" id="Password1"placeholder="Enter Password" name="Password" required>
        </div>
        <div class="form-group">
            <label for="Password2">Confirm Password:</label>
            <input type="Password" class="form-control" id="Password2"placeholder="Enter Password Again" name="Password" required>
        </div>
        
        <!--Jade: Program and year level should be drop down (or whatever you call em) option-->
        <div class="form-group">
            <label for="Program">Program:</label>
            <select class="form-control" id="Program"placeholder="Select Program" name="Program" required>
                <option value="">--Select Your Program--</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIT">BSIT</option>
                <option value="BSEMC">BSEMC</option>
            </select>
            <div class="form-group">
            <label for="YearLevel">Year Level:</label>
            <select class="form-control" id="YearLevel"placeholder="Select Year Level" name="YearLevel" required>
                <option value="">--Select Year Level--</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>

        </div>


        </form>
        
    </div>


</html>