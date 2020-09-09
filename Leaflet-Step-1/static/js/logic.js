//set USGS GeoJSON Earthquake URL from https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function createMap(quakeData) {

    // Create the tile layer that will be the light background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 10,
      minZoom: 0,
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

  // Create a baseMaps object to hold the lightmap and satellitemap layers
  var baseMaps = {
    "Light Map": lightmap,
    "Satellite Map": satellitemap
  };

  // Create an overlayMaps object to hold the quakeData layer
  var overlayMaps = {
    "7 Days of Earthquakes": quakeData
  };

    // Create the map object with options
    var map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [lightmap, quakeData]
      });
    
      // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(map);

//Legend Time
  //function to return legend colors; d variable is the passed mag from list below
      function getColor(d) {
        return d > 5 ? 'red' :
               d > 4  ? 'darkorange' :
               d > 3  ? 'orange' :
               d > 2  ? 'yellow' :
               d > 1   ? 'greenyellow' :
                          'green';
    };

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
          '<i style="background:' + getColor(mag[i] + 1) + '"></i> ' +
          mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(map);
    };
//end Legend Time

    function createMarkers(response) {

        // Pull the "features" property off of response
        var earthquakes = response.features;
      
        // Initialize an array to hold earthquake markers
        var earthquakeMarkers = [];
      
        // Loop through the features array
        for (var i = 0; i < earthquakes.length; i++) {
          var earthquake = earthquakes[i];

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
            .bindPopup("<h3>" + "<a href='" + earthquake.properties.url + "' target='_blank' style='text-decoration: none''>" + earthquake.properties.place + "</a>" + "<h3><h3>Magnitude: " + earthquake.properties.mag + "</h3>");
      
          // Add the marker to the bikeMarkers array
          earthquakeMarkers.push(earthquakeMarker);
        }
      
        // Create a layer group made from the bike markers array, pass it into the createMap function
        createMap(L.layerGroup(earthquakeMarkers));
      };

// Perform an API call to the Earthquake API to get station information. Call createMarkers when complete
d3.json(quakeURL, createMarkers);