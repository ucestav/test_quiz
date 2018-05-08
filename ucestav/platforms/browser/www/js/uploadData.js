//Upload Data for Quiz App

//Create an AJAX call for inserting data into database
var client; 
 function processData(postString) {    
   client = new XMLHttpRequest();    
   client.open('POST','http://developer.cege.ucl.ac.uk:30268/uploadData',true);    
   client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");    
   client.onreadystatechange = dataUploaded;      
   client.send(postString); 
 } 

 //Once data is ready, show the response data in the 'datauploadResult' div which is located in the popup
 function dataUploaded() {   
   if (client.readyState == 4) {     
   document.getElementById("dataUploadResult").innerHTML = client.responseText;    
   }
  }
 
  function startDataUpload() { 
   //Retrieve the inputs of the quiz popup 
  var phone_id = document.getElementById("phone_id").value;  
  //Assign phone id input to postString variable
  var postString = "phone_id="+phone_id; 
  var checkString = "";  
  for (var i = 1;i< 5;i++){   
  if (document.getElementById("check"+i).checked === true) {    
  checkString = checkString + document.getElementById("check"+i).value + ","   } 
  }  
  //Update postString variable to include answers
  postString = postString + "&answerlist="+checkString; 
  //Process the postString variable that contains the relevant quiz inputs
  processData(postString); }
 