
// $(function () {
//     $('[data-tooltip="true"]').tooltip()
// })

// $(document).ready(function () {
//     $("body").tooltip({ selector: '[data-toggle=tooltip]' });
// });





// adding the map to the div 
// currently openstreetmap tiles are used
var mymap = L.map('map', { attributionControl: false }).setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
}).addTo(mymap);

// add leaflet-geoman controls with some options to the map
mymap.pm.addControls({
    position: 'topleft',
    drawCircle: false,
    drawRectangle: false,
    editMode: false,
    dragMode: false,
    cutPolygon: false,
    drawCircleMarker: false,
    drawMarker: false,
    drawPolyline: false,
    drawPolygon: false,
    removalMode: false,
});


mymap.pm.Toolbar.copyDrawControl('Marker',
    {
        name: 'Marker_custom',
        block: 'custom',
        title: 'Place a marker for notes.',
        actions: ['cancel']
    }
);

mymap.pm.Toolbar.copyDrawControl('Polyline',
    {
        name: 'Polyline:custom',
        block: 'custom',
        title: 'Draw path by clicking. \nAdd more waypoints by clicking on the intersections. \nWhen finished remove nodes by right-clicking.',
        actions: ['cancel', 'finish']
    }
);

mymap.pm.Toolbar.copyDrawControl('Polygon',
    {
        name: 'Polygon_custom',
        block: 'custom',
        title: 'Draw bounding box for polygon by clicking. \nAdd more nodes by clicking on the intersections.\nWhen finished remove nodes by right-clicking.',
        actions: ['cancel', 'finish']
    }
);

var test
var geojsonLayer = L.geoJSON()
var defaultParameters = {
    "speed": 0.5,
    "height": 5
}
geojsonLayer.addTo(mymap)

geojsonLayer.on('layeradd', (e) => {


    if (e.layer.feature["geometry"]["type"] === "Polygon") {
        e.layer.feature.properties["parameters"] = Array(e.layer._latlngs[0].length).fill(defaultParameters)
    } else if (e.layer.feature["geometry"]["type"] === "LineString") {
        e.layer.feature.properties["parameters"] = Array(e.layer._latlngs.length).fill(defaultParameters)
    }

    geojsonLayer.pm.enable()
    addPopup(geojsonLayer)

    e.layer.on('pm:vertexadded', e => {
        let idx
        if (e.layer.feature["geometry"]["type"] === "Polygon") {
            idx = e.indexPath[1]
            e.layer.feature.geometry.coordinates[0].splice(idx, 0, [e.marker._latlng["lng"], e.marker._latlng["lat"]])
        } else if (e.layer.feature["geometry"]["type"] === "LineString") {
            idx = e.indexPath[0]
            e.layer.feature.geometry.coordinates.splice(idx, 0, [e.marker._latlng["lng"], e.marker._latlng["lat"]])
            e.marker.bindPopup(template_popup)

        }


        e.layer.feature.properties.parameters.splice(idx, 0, defaultParameters)
    })
})


// Listen in on start of drawing
mymap.on('pm:drawstart', ({ workingLayer }) => {

    workingLayer.on('pm:vertexadded', e => {

    });
});


mymap.on('pm:create', e => {
    e.layer.pm.enable({
        allowSelfIntersection: false,
    });

    test = geojsonLayer.addData(e.layer.toGeoJSON())
    // geojsonLayer.pm.enable()
    e.layer.remove()




    e.layer.on('pm:vertexadded', e => {
        e.marker.on('click', function (e) {
        })

        e.marker.on('click', function () {

        })

    })
});


// for marker leaflet id get the corresponding layer
function getCorrespondingLayer(id) {

    for (let i = 0; i < geojsonLayer.getLayers().length; i++) {
        let markerArray = []
        if (geojsonLayer.getLayers()[i].feature["geometry"]["type"] === "Polygon") {
            markerArray = geojsonLayer.getLayers()[i].pm._markers[0]
        } else if (geojsonLayer.getLayers()[i].feature["geometry"]["type"] === "LineString") {
            markerArray = geojsonLayer.getLayers()[i].pm._markers
        }
        for (let j = 0; j < markerArray.length; j++) {
            if (markerArray[j]._leaflet_id == id) {
                return geojsonLayer.getLayers()[i]
            }
        }
    }
    return null
}


function addPopup(layerGroup) {


    layerGroup.getLayers().forEach(l => {
        console.log(l.feature)
        if (l.feature["geometry"]["type"] === "Polygon") {
            l.bindPopup(template_popup)
        } else if (l.feature["geometry"]["type"] === "LineString") {
            l.pm._markers.forEach(m => {
                m.bindPopup(template_popup)
            });

        }
    })


}

var template_popup = '<div class="container">\
    <div class="input-group input-group-sm mb-1">\
        <div class="input-group-prepend">\
            <span class="input-group-text" id="basic-addon1">Lat:</span>\
        </div>\
        <input type="text" class="form-control" placeholder="?_Loading" aria-label="Username"\
            aria-describedby="basic-addon1">\
</div>\
        <div class="input-group input-group-sm mb-1">\
            <div class="input-group-prepend">\
                <span class="input-group-text" id="basic-addon2">Lng:</span>\
            </div>\
            <input type="text" class="form-control" placeholder="?_Loading" aria-label="Age"\
                aria-describedby="basic-addon1">\
</div>\
            <div class="input-group input-group-sm mb-1">\
                <div class="input-group-prepend">\
                    <span class="input-group-text" id="basic-addon3">Speed:</span>\
                </div>\
                <input type="text" class="form-control" placeholder="?_Loading" aria-label="Stuff"\
                    aria-describedby="basic-addon1" onkeyup="formChanged()" onchange="formChanged()">\
</div>\
                <div class="input-group input-group-sm mb-1">\
                    <div class="input-group-prepend">\
                        <span class="input-group-text" id="basic-addon4">Height:</span>\
                    </div>\
                    <input type="text" class="form-control" placeholder="?_Loading" aria-label="Stuff"\
                        aria-describedby="basic-addon1" onkeyup="formChanged()" onchange="formChanged()">\
</div>\
                </div>';


