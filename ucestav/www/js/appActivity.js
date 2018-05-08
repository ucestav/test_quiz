// Quiz App

     // Create a global variable to hold map 
	 // Define the coordinates for map view and set the zoom level
     var mymap = L.map('mapid').setView([51.505, -0.09], 13);
     // Insert map tiles
     L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {
	                  maxZoom: 18,
					  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '+
               					  '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '+ 
								  'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                      id: 'mapbox.streets'
                }).addTo(mymap);
				
	// Run the function to insert existing quiz data when the document is loaded
	document.addEventListener('DOMContentLoaded', function() {    
	getpois(); 
	}, false); 
				
	// Track location of user
	 function trackLocation() {     
            if (navigator.geolocation) {         
	        navigator.geolocation.watchPosition(showPosition);     
	            } 
				 else {
					    document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";     
	                  } 
            } 
  
    //Show the position of a user on the map
     function showPosition(position){
	 // Create an icon to mark the position of a user 
	 // Set the size of icon
	 var position_icon = L.icon({
         iconUrl: 'my-icon.png',
         iconSize: [25, 40],
         });
		 
	//Create a variable to hold bounds of user's position (longitude and latitude)
    bounds = new L.LatLngBounds();
	//Show the coordinates of a user in the 'showLocation' div which is located under the map
    document.getElementById('showLocation').innerHTML = "<b>Coordinates of Current Location</b>" + "<br>Latitude: " 
	                                                    + position.coords.latitude + "<br>Longitude: " + position.coords.longitude; 
    //Create an icon marker for a user's position														
	marker = L.marker([position.coords.latitude, position.coords.longitude], {icon: position_icon})
	//add marker to map
	.addTo(mymap)
	//extend boundary to get marker position
	bounds.extend(marker.getLatLng());
	//fit the map to the boundary
	mymap.fitBounds(bounds);
    }  
		 
    //Retrieve the quiz data from the database by using httpServer
    var poilayer;
    function getpois() {    
          client = new XMLHttpRequest();    
          client.open('GET','http://developer.cege.ucl.ac.uk:30268/getPOI'); 
          client.onreadystatechange = poiResponse;  
	      client.send(); 
    } 
        
    //Check if data is ready and process it
    function poiResponse() {      
         if (client.readyState == 4) {         
	     var poidata = client.responseText;     
	     loadPoilayer(poidata);     
	     } 
    } 
   
	
	//Load quiz data and parse it to retrieve quiz data values (e.g. question)
	 function loadPoilayer(poidata) {
         var poijson = JSON.parse(poidata);
		 //Get coordinates (latitude and longitude) of user 
	     navigator.geolocation.getCurrentPosition(
         function (position) {
         var lat1 = position.coords.latitude; //Latitude of user current position
	     var lon1 = position.coords.longitude; //Longitude of user current position
		 //Create a geojson layer 
	     poilayer = L.geoJson(poijson, {
		//For each feature, create a popup that generates the relevant question and optional answers
		 onEachFeature: function (feature, layer) {
			for(var i = 0; i < poijson[0].features.length; i++) {    
	        var ques = poijson[0].features[i].properties.question; //Retrieve the question
            var anslist = poijson[0].features[i].properties.answerlist; //Retrieve the answer list
			var corr_answer = poijson[0].features[i].properties.correctanswer; //Retrieve the correct answer
			var answers = anslist; //Assign the answer list to a variable
            var encoded = answers.split(","); // Split the data which is separated by a comma
			var ans1 = encoded[0] //Retrieve the first answer
			var ans2 = encoded[1] //Retrieve the second answer
			var ans3 = encoded[2] //Retrieve the third answer
		    var ans4 = encoded[3] //Retrieve the fourth answer
			var lat2 = poijson[0].features[i].geometry.coordinates[1]; //Retrieve the latitude of question location
			var lon2 = poijson[0].features[i].geometry.coordinates[0]; //Retrieve the longitude of question location
			//Calculate distance between user position and question location
			var radlat1 = Math.PI * lat1/180;
            var radlat2 = Math.PI * lat2/180;
            var radlon1 = Math.PI * lon1/180;
            var radlon2 = Math.PI * lon2/180;
			var theta = lon1-lon2;
            var radtheta = Math.PI * theta/180;
            var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                subAngle = Math.acos(subAngle);
                subAngle = subAngle * 180/Math.PI; 
            var dist = (subAngle/360) * 2 * Math.PI * 3956;
			//If distance is less than 5 metres, open a popup on map that has the relevant question and answers for that location
		    if (dist < 5) { pop = layer.addTo(mymap).bindPopup(  '<h5><p><div id="ques"></div>'+ ques +
		                  '<input type="checkbox" style="display: none;" name="correct_answer" id=correct value=' + corr_answer+ '/><br />'+
						  '</h5><h6><label for="check1"></label>'+ ans1 + '<input type="checkbox" name="answers"  onclick="return Correct_Answer_1()" id=check1 value=' + ans1+ '/><br />'+
						  '<label for="check2"></label>'+ ans2 + '<input type="checkbox" name="answers" onclick="return Correct_Answer_2()" id=check2 value='+ ans2+ '/><br />'+
						  '<label for="check3"></label>'+ ans3 + '<input type="checkbox" name="answers" onclick="return Correct_Answer_3()" id=check3 value='+ ans3+ '/><br />'+
						  '<label for="check4"></label>'+ ans4 +'<input type="checkbox" name="answers" onclick="return Correct_Answer_4()" id=check4 value='+ ans4 + '/><br />'+
						  '<br />Phone ID <input type="integer" size="25" id="phone_id"/>' + '<div id="dataUploadResult"></div>' + '<button style="margin:auto;display:block" id="startUpload" onclick="startDataUpload()">Submit Answer</button></p>').openPopup();}}}})})};
	  
	//Check that the answer of first checkbox is the same as the correct answer
	//Create an alert to notify user if they have selected the correct answer or wrong answer
	function Correct_Answer_1() { 
	  	  var answer = document.getElementById("check1").value;
		  var correct_answer = document.getElementById("correct").value;
		  if (answer ==correct_answer) {
	      alert("Correct");}
		  else{
          alert("Wrong")
          } }
		  
	//Check that the answer of second checkbox is the same as the correct answer
	//Create an alert to notify user if they have selected the correct answer or wrong answer
	function Correct_Answer_2() { 
	  	  var answer = document.getElementById("check2").value;
		  var correct_answer = document.getElementById("correct").value;
		  if (answer ==correct_answer) {
	      alert("Correct");}
		  else{
          alert("Wrong")
          } }
	
	//Check that the answer of third checkbox is the same as the correct answer
	//Create an alert to notify user if they have selected the correct answer or wrong answer	
	function Correct_Answer_3() { 
	  	  var answer = document.getElementById("check3").value;
		  var correct_answer = document.getElementById("correct").value;
		  if (answer ==correct_answer) {
	      alert("Correct");}
		  else{
          alert("Wrong")
          } }
		
    //Check that the answer of fourth checkbox is the same as the correct answer
	//Create an alert to notify user if they have selected the correct answer or wrong answer		
	function Correct_Answer_4() { 
	  	  var answer = document.getElementById("check4").value;
		  var correct_answer = document.getElementById("correct").value;
		  if (answer ==correct_answer) {
	      alert("Correct");}
		  else{
          alert("Wrong")
          } }
  