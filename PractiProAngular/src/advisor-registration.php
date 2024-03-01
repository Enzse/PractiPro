<?php



?>
<!--jade: separate file for styles and sht-->
<!--jade: non angular or any PHP framework sht-->

<html>
    <div class="container">
        <h3 style="font-weight: bold; text-align: center;">Practicum Advisor Registration</h3><hr><br>
        <form method="post" action="#'enctype="multipart/form-data">
        <div class="form-group">
        <div class="form-group">
            <label for="AdvisorID">Advisor ID:</label>
            <input type="AdvisorID" class="form-control" id="AdvisorID"placeholder="Enter Advisor ID" name="AdvisorID" required>
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
            <label for="Department">Department:</label>
            <select class="form-control" id="Program"placeholder="Select Department" name="Department" required>
                <option value="">--Select Your Department--</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIT">BSIT</option>
                <option value="BSEMC">BSEMC</option>
            </select>
      

        </div>

        </form>
        
    </div>


</html>