//define json URLs
var quakeURL ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var plateURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

//CREATEMAP start
//createMap with earthquakes, plates, and legend variables
function createMap(earthquakes, plates, legend) {
    // Create the tile layer that will be the light background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 10,
      id: "light-v10",
      accessToken: API_KEY
    });

    // Create the tile layer that will be the satellite background of our map
    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 10,
        id: "satellite-streets-v11",
        accessToken: API_KEY
        });

    // Create the tile layer that will be the outdoors background of our map
    var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 10,
        id: "outdoors-v11",
        accessToken: API_KEY
        });
  
//baseMaps contains all background map options
  var baseMaps = {
    "Satellite Map": satellitemap,
    "Grayscale": lightmap,
    "Outdoors": outdoorsmap
};
//overlayMaps contains all marker options
  var overlayMaps = {
      "Earthquakes": earthquakes,
      "Fault Lines": plates
  };

//myMap to combine layers
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    //start with lightmap and both earthquakes and plates checked on
    layers: [satellitemap, earthquakes, plates]
  });
 
  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap)
  legend.addTo(myMap)
};
//CREATEMAP end

//GET DATA start
//call json URLs nested
//first earthquakes
d3.json(quakeURL,function(responseQuake) {
          //nested fault lines
          d3.json(plateURL, function(data) {
              //variable for fault lines = plates
              var plates = L.geoJson(data, {
                  // Style each feature (in this case the fault lines)
                  style: function (feature) {
                      return {
                          color: "darkorange",
                          fillColor: "none",
                          weight: 1.5
                      };
                  }
              })
          
  //variable for quakeData features section = earthquakes
  var earthquakes = responseQuake.features
  // Initialize an array to hold earthquake markers
  var earthquakeMarkers = []

  //choose circle color based on mag
  function chooseColor(mag) {
    switch (true) {
    case mag < 1:
      return "green";
    case mag < 2:
      return "greenyellow";
    case mag < 3:
      return "yellow";
    case mag < 4:
      return "orange";
    case mag < 5:
      return "darkorange";
    default:
      return "red";
    }
   };

//Legend Time
  //REDUNDANT; edited legend to use chooseColor instead of getColor function to return legend colors; d variable is the passed mag from list below
//   function getColor(d) {
//     return d > 5 ? 'red' :
//            d > 4  ? 'darkorange' :
//            d > 3  ? 'orange' :
//            d > 2  ? 'yellow' :
//            d > 1   ? 'greenyellow' :
//                       'green';
// };
//control to add legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

//included supporting css for info, info h4, legend, and legend i; h/t https://leafletjs.com/examples/choropleth/
  var div = L.DomUtil.create('div', 'info legend'),
      mag = [0, 1, 2, 3, 4, 5],
      labels = [];

  // loop through our magnitude intervals and generate a label with a colored square for each interval
  for (var i = 0; i < mag.length; i++) {
      div.innerHTML +=
          '<i style="background:' + chooseColor(mag[i] ) + '"></i> ' +
          mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
  }

  return div;
};
//Legend Time done
//define earthquakes data 
        // Loop through the earthquakes features array
        for (var i = 0; i < earthquakes.length; i++) {
          var earthquake = earthquakes[i];
          //pull datetime
          var datetime = earthquakes[i].properties.time;
          //formate datetime as date for display in Popup
          var date = new Date(datetime);
          // For each earthquake, create a circle and bind a popup with the earthquake's place and magnitued (mag)
          var earthquakeMarker = L.circle([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]], {
              fillOpacity: 0.8,
            //set circle outline to thin black
              color: "black",//alternative to have full color circles: chooseColor(earthquake.properties.mag),
              weight: 1,
                //set the color based on the chooseColor function passing mag
              fillColor: chooseColor(earthquake.properties.mag),
              //set the radius to the magnitued times X for better display
              radius: (earthquake.properties.mag * 40000)
          })
          //tooltip popup includes href to URL with display name place, magnitude, and date
            .bindPopup("<h3>" + "<a href='" + earthquake.properties.url + "' target='_blank' style='text-decoration: none''>" + earthquake.properties.place + "</a>" + "</h3><h3>Magnitude: " + earthquake.properties.mag + "</h3> Date: " + date);
      
          // Add the marker to the earthquakeMarkers array
          earthquakeMarkers.push(earthquakeMarker);
        }
    //call createMap with layerGroup(earthquakeMarkers), var plates, and var legend
    createMap(L.layerGroup(earthquakeMarkers), plates, legend);


  })
});