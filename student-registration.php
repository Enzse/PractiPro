<?php



?>
<html>
    <div class="container">
        <h3 style="font-weight: bold; text-align: center;">Student Registration</h3><hr><br>
        <form method="post" action="#'enctype="multipart/form-data">
        <div class="form-group">
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
        <!--Program and year level should be drop down option-->
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