function createMap(significantEarthquakes) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 10,
      id: "light-v10",
      accessToken: API_KEY
    });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Significant Earthquakes": significantEarthquakes
  };

    // Create the map object with options
    var map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 2,
        layers: [lightmap, significantEarthquakes]
      });
    
      // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(map);
    }

    function createMarkers(response) {

        // Pull the "stations" property off of response.data
        var earthquakes = response.features;
      
        // Initialize an array to hold bike markers
        var earthquakeMarkers = [];
      
        // Loop through the stations array
        for (var index = 0; index < earthquakes.length; index++) {
          var earthquake = earthquakes[index];
      
          // For each station, create a marker and bind a popup with the station's name
          var earthquakeMarker = L.marker([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]])
            .bindPopup("<h3>" + earthquake.properties.title + "<h3><h3>MMI: " + earthquake.properties.mmi + "</h3>");
      
          // Add the marker to the bikeMarkers array
          earthquakeMarkers.push(earthquakeMarker);
        }
      
        // Create a layer group made from the bike markers array, pass it into the createMap function
        createMap(L.layerGroup(earthquakeMarkers));
      }

// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson", createMarkers);