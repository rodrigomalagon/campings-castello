// -- GLOBAL VARIABLES --
let distanceKM;
let sites;
let currentSite;

// -- FUNCTIONS --
{

// Get location from device's navigator (https protocole needed in hosting) and execute location processing
function getLocation() {
    if (navigator.geolocation) { 
        navigator.geolocation.getCurrentPosition(processLocation, handleError); //using getCurrentPoisition W3C method
    } else {
      alert("Geolocation is not supported by this browser.");
    }
}

// Ouput error message
function handleError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        alert("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        alert("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        alert("An unknown error occurred.");
        break;
    }
}

// Process location retrieved into camping sites
function processLocation(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    console.log('Retrieved position:\nlat: ' + String(lat) + ' log: ' + String(lon)); //success message
    
    // Set value of search readius
    distanceKM = String(document.getElementById('radiusDistance').value);

    // Call function that processes lat-lon data
    getCampings(lat, lon, distanceKM);
}

// Retrieve campings data from API:
function getCampings(lat,lon,distance){

    // Construct API url
    let APIurl = 'https://datosabiertos.dipcas.es/api/explore/v2.1/catalog/datasets/campings/records'+
    '?where=within_distance(ubicacion%2Cgeom%27POINT('+
    String(lon) + '%20' + String(lat) + ')%27%2C' + String(distance) + 'km)&limit=50';
    
    /* Possible re-encoding for parentheses replacement to avoid request error
    YOURURL.replace(/\(/g, "%28").replace(/\)/g, "%29")
    */
    console.log('url constructed for the API call:\n' + APIurl);//informative message

    $.getJSON(APIurl,function(data){
        console.log('Campings data retrieved:\n'); //success messages
        console.log(data);

        // Populate DOM list containing camping sites
        populateCampingList(data);
    });
}

// Retrieve campings data from API:
function getAllCampings(){

    // Query setup variable
    let limitResults = 100;

    // Construct API url
    let APIurl = 'https://datosabiertos.dipcas.es/api/explore/v2.1/catalog/datasets/campings/records'+
    '?limit='+String(limitResults);
    
    console.log('url constructed for the API call:\n' + APIurl);//informative message

    $.getJSON(APIurl,function(data){
        console.log('Campings data retrieved:\n'); //success messages
        console.log(data);

        // Populate DOM list containing camping sites
        populateCampingList(data);
    });
}

// Populate list of camping sites
function populateCampingList(data){
    
    sites = data.results;

    // Clear list of sites
    $('#sitesList li').remove();
 
    // Add new stations to the list
    $.each(sites,function(index,site) {
        $('#sitesList').append('<li><a id="toDetails" href="#">' + processName(site.nombre) +
        '<span id="' + index + '" class="ui-li-count">'+ site.no_de_plazas +' places</span></a></li>');

    });

    // Refresh the listview jquery format for the elements added to the DOM
    $('#sitesList').listview('refresh');
}

// Transform name to addequate upper-lower case format
function processName(name){
    let result = '';
    name.split(" ").forEach(word => {
        result = result + word.charAt(0) + word.slice(1,word.length).toLowerCase() + ' ';
    });
    return result
}


}


// -- EVENT HANDLERS --
{
// Set event handler that gets current location and populates list of camping sites
$(document).on("click","#search",function(event) {
    //Prevent the usual behaviour 
    event.preventDefault;

    // Call function
    getLocation();
});

// Set event handler that retrieves all campings sites and populates list
$(document).on("click","#getAll",function(event) {
    //Prevent the usual behaviour 
    event.preventDefault;

    // Call function
    getAllCampings();
});

// Set click event handler (for each station) that executes navigation to the details page
$(document).on('pagebeforeshow','#home',function() {
    $(document).on('click','#toDetails',function(event) {
        //Stop the typical behaviour
        event.preventDefault();
        event.stopImmediatePropagation();
        
        //Reset current station variable
        currentSite = sites[event.target.children[0].id];
        
        //Change Page
        $.mobile.changePage("#details");
    });
});

// Set handler that resets current station data before displaying details page
$(document).on('pagebeforeshow','#details',function(event) {
    event.preventDefault();

    console.log(currentSite);
    
    // Update site info using previously-updated currentSite variable
    $('#nameSite').text(processName(currentSite.nombre));
    $('#numPlaces').text('Number of places: ' + currentSite.no_de_plazas);
    $('#municipality').text('Municipality: ' + currentSite.localidad);
    $('#address').text('Address: ' + currentSite.direccion);
    $('#phoneNum').text('Phone number: ' + currentSite.telefono);
    $('#email').text('Email: ' + currentSite.email);
    $('#lat').text('Latitude: ' + currentSite.ubicacion.lat);
    $('#lon').text('Longitude: ' + currentSite.ubicacion.lon);
  });


}