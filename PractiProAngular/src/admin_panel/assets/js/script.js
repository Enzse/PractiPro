function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";  
  document.getElementById("main-content").style.marginLeft = "250px";
  document.getElementById("main").style.display="none";
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";  
  document.getElementById("main-content").style.marginLeft= "0";  // Adjusting margin for main content
  document.getElementById("main").style.width= "100%";  // Adjusting width for main content to fill screen
  document.getElementById("main").style.display="block";  
}
