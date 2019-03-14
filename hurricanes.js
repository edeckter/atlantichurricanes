//Size map
var map_width=1000;
var map_height=600;

d3.select("#map")
  .style("width",map_width+"px")
  .style("height",map_height+"px")
          
//Create leaflet basemap using OpenStreet Maps
var map = L.map('map').setView([32.3078, -64.7505], 3);
mapLink = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.svg().addTo(map);

//Define svg variable
var svg=d3.select("#map")
          .select("svg");

// Define the div for the tooltip
var tooltip=d3.select("#map")
            .append("div")	
            .attr("class","tooltip")
            .style("opacity",0)
            .style("background-color", "white")
            .style("padding", "5px")
            .style("width","150px")
            .style("height","150px")
            .style("position","absolute")
            .style("z-index", "999");
            
//Initial comment text
var comment1="Hurricane season in the Atlantic basin officially runs from June 1st through November 30th.  The 2018 Atlantic basin hurricane season got started a little early, with the first tropical storm initially forming on May 25th."
var comment2="The season had 15 named storms, 8 of which because hurricanes.  Two of the hurricanes (Florence and Michael) were considered major hurricanes (hurricanes that achieved a Category 4 or 5 status).  This is above the average season of 11 named storms, 6 hurricanes and 2 major hurricanes."
            
//Add map legend
var legend=d3.select("#map")
             .append("div")
             .attr("class","legend")
             .style("left","10px")
             .style("top","400px")
             .style("background-color","white")
             .style("padding", "5px")
             .style("width","200px")
             .style("height","150px")
             .style("border", "solid")
             .style("border-width", "2px")
             .style("position","absolute")
             .style("z-index","998");
             
//Add legend icons
var legend_svg=legend.append("svg");
legend_svg.append("circle")
          .attr("class","EX_0")
          .attr("cx",10)
          .attr("cy",25)
          .attr("r",5)
          .style("stroke","black");
legend_svg.append("circle")
          .attr("class","SD_0")
          .attr("cx",10)
          .attr("cy",50)
          .attr("r",5)
          .style("stroke","black");
legend_svg.append("circle")
          .attr("class","TD_0")
          .attr("cx",10)
          .attr("cy",75)
          .attr("r",5)
          .style("stroke","black");
legend_svg.append("circle")
          .attr("class","HU_1")
          .attr("cx",10)
          .attr("cy",100)
          .attr("r",5)
          .style("stroke","black");  
legend_svg.append("circle")
          .attr("class","HU_4")
          .attr("cx",10)
          .attr("cy",125)
          .attr("r",5)
          .style("stroke","black");           
//Add legend labels
legend_svg.append("text")
          .text("Storm Type/Intensity")
          .attr("x",100)
          .attr("y",5)
          .attr("text-anchor","middle")
          .attr("dominant-baseline","central")
          .style("font-weight","bold");
legend_svg.append("text")
          .text("Extratropical Storm or Wave/Low")
          .attr("x",20)
          .attr("y",25)
          .attr("text-anchor","start")
          .attr("dominant-baseline","central");
legend_svg.append("text")
          .text("Subtropical Depression/Storm")
          .attr("x",20)
          .attr("y",50)
          .attr("text-anchor","start")
          .attr("dominant-baseline","central");
legend_svg.append("text")
          .text("Tropical Depression/Storm")
          .attr("x",20)
          .attr("y",75)
          .attr("text-anchor","start")
          .attr("dominant-baseline","central"); 
legend_svg.append("text")
          .text("Hurricane (Category 1, 2 or 3)")
          .attr("x",20)
          .attr("y",100)
          .attr("text-anchor","start")
          .attr("dominant-baseline","central"); 
legend_svg.append("text")
          .text("Major Hurricane (Category 4 or 5)")
          .attr("x",20)
          .attr("y",125)
          .attr("text-anchor","start")
          .attr("dominant-baseline","central");           
            
//Format date
var formatDate=d3.timeFormat("%a %b %d %I:%M %p");
var sliderDate=d3.timeFormat("%b %d");
var mapDate=d3.timeFormat("%A %B %d");

//Read in GeoJSON with hurricane location data
d3.json("2018/AL2018.json").then(function(pts) {
    var storm=pts.features;
    //Add parsed date to .properties object within pts.features for each point
    for (var i=0; i<storm.length; i++) {
        storm[i].properties.DATE=new Date(storm[i].properties.MONTH+' '+storm[i].properties.DAY+' '+storm[i].properties.YEAR+' '+storm[i].properties.HHMM.substring(0,2)+':00');
    }
    
    var seasonMinDate=d3.min(storm,function(d) {return d.properties.DATE;});
    var seasonMaxDate=d3.max(storm,function(d) {return d.properties.DATE;});
    //Add one day on each side of date range
    var sliderMinDate=d3.timeDay.offset(seasonMinDate,-1);
    var sliderMaxDate=d3.timeDay.offset(seasonMaxDate,1);
    var sliderTime=sliderMinDate;
       
    //Draw date slider
    var h=100;
    var w=1000;
    var xPad=50;
    var l=w-2*xPad;
    
    var svg_slider=d3.select("#slider")
                     .append("svg")
                     .attr("height",h)
                     .attr("width",w)
                     .append("g")
                     .attr("class","slider");
    
    svg_slider.append("rect")
                         .attr("x",xPad)
                         .attr("y",h/2)
                         .attr("width",l)
                         .attr("height",10)
                         .style("fill","white")
                         .style("stroke","gray");
                         
    var slide=svg_slider.append("rect")
                        .attr("x",xPad)
                        .attr("y",h/2-5)
                        .attr("width",20)
                        .attr("height",20)
                        .style("cursor","pointer")
                        .call(d3.drag().on("drag",function() {
                            var x=d3.event.x;
                            if (x<xPad) {x=xPad};
                            if (x>xPad+l) {x=xPad+l};
                            d3.select(this).attr("x",x);
                            sliderTime=d3.timeDay.round(sliderScale(x))
                            updatePoints();
                        }));
    
    //Create slider scale
    var sliderScale=d3.scaleLinear()
                      .domain([xPad,xPad+l])
                      .range([sliderMinDate,sliderMaxDate]);
    //Create slider axis
    for (var i=0; i<11; i++) {
        svg_slider.append("text")
                  .attr("x",i*(l/10)+xPad)
                  .attr("y",h/2+25)
                  .attr("text-anchor","middle")
                  .attr("dominant-baseline","central")
                  .text(sliderDate(sliderScale(i*(l/10)+xPad)));
    }

    //Create template for hurricane track points
    var track_points=svg.append("g")
                        .attr("class","track-points")
                        .selectAll("circle")
                        .data(pts.features)
                        .enter()
                        .append("circle")
                        .style("stroke","black")
                        .attr("class",function(d) {return d.properties.STORMTYPE+"_"+d.properties.SS;});
    
    //Calculate total number of storms in GeoJSON file (season)
    var maxStorms=d3.max(pts.features,function(d) {return d.properties.STORMNUM;});
    //Create line function
    var line=d3.line()
               .x(function(d) {
                   var coord=[d.geometry.coordinates[1],d.geometry.coordinates[0]]
                   return map.latLngToLayerPoint(coord).x;
                })
               .y(function(d) {
                   var coord=[d.geometry.coordinates[1],d.geometry.coordinates[0]]
                   return map.latLngToLayerPoint(coord).y;
                });
    
    var updatePoints=function() {
        //Get center position for map (used to calculate offsets for fixed position elements)
        var center_position=map.latLngToLayerPoint(map.getCenter());
        //Remove previous date
        svg.selectAll(".date").remove();
        //Display current date in corner of map
        svg.append("text")
           .attr("class","date")
           .text(mapDate(sliderTime))
           .attr("x",center_position.x)
           .attr("y",center_position.y-(map_height/2-10))
           .style("font-weight","bold")
           .style("font-size","16px")
           .style("color","black")
           .attr("text-anchor","middle")
          .attr("dominant-baseline","central");
        
        //Remove all previous paths
        svg.selectAll(".track-path").remove();
        //Draw path lines up to the slider date
        for (var i=1;i<=maxStorms;i++) {
            var storm=pts.features.filter(function(d) {
                if (d.properties.STORMNUM==i && d.properties.DATE<=sliderTime) {return d;}
            });
            svg.append("g")
                .attr("class","track-path")
                .append("path")
                .datum(storm)
                .attr("d",line)
                .style("fill","none")
                .style("stroke","black");
        }
        
        track_points.attr("cx",function(d) {
                        var coord=[d.geometry.coordinates[1],d.geometry.coordinates[0]]
                        return map.latLngToLayerPoint(coord).x;
                        })
                    .attr("cy",function(d) {
                        var coord=[d.geometry.coordinates[1],d.geometry.coordinates[0]]
                        return map.latLngToLayerPoint(coord).y;
                        })
                    .attr("r",map.getZoom())
                    .attr("pointer-events","none")
                    .style("opacity",0)
                    .on("mouseover",function(d) {
                        d3.select(this).style("opacity",1)
                                       .attr("r",2*map.getZoom());
                        tooltip.style("opacity",1)
                               .style("border", "solid")
                               .style("border-width", "2px")
                               .style("border-radius", "5px")
                               .style("left",(parseInt(d3.select(this).attr("cx"))-(center_position.x-map_width/2)+20)+"px")
                               .style("top",(parseInt(d3.select(this).attr("cy"))-(center_position.y-map_height/2)-10)+"px")
                               .style("pointer-events","none")
                               .html("<b>"+d.properties.STORMTYPE+" "+d.properties.STORMNAME+"</b><br>Atlantic Basin<br>"+d.properties.YEAR+" Storm No. "+d.properties.STORMNUM+"<br><b>"+formatDate(d.properties.DATE)+"</b><br>Category: "+d.properties.SS+"<br>Wind Speed (kt): "+d.properties.INTENSITY+"<br>Latitude: "+d.properties.LAT+"<br>Longitude: "+d.properties.LON);
                    })
                    .on("mouseout",function(d) {
                        d3.select(this).style("opacity",0.8)
                                       .attr("r",map.getZoom());
                        tooltip.style("opacity",0);
                    })
        track_points.filter(function(d) {return d.properties.DATE<=sliderTime;})
                    .style("opacity",0.8)
                    .attr("pointer-events","visible");
        track_points.filter(function(d) {return d.properties.DATE>sliderTime;})
                    .style("opacity",0)
                    .attr("pointer-events","none"); 
        //Add comments to comment div     
        var info=d3.select("#comments");
        info.select("html").remove();

        var info_text=comment1+"<br><br>"+comment2+"<br><br><span style='font-weight:bold;color:#006699;'>2018 Hurricane Season Highlights:</span>";
        if (sliderTime>=seasonMinDate) {info_text=info_text+("<ul><li>May 25: Tropical Storm Alberto forms east of the Yucatan Peninsula</li>");}
        if (sliderTime>=new Date("2018 05 28")) {info_text=info_text+("<li>May 28: Tropical Storm Alberto makes landfall on the Florida panhandle</li>");}
        if (sliderTime>=new Date("2018 07 06")) {info_text=info_text+("<li>July 6: Beryl reaches hurricane status</li>");}
        if (sliderTime>=new Date("2018 07 10")) {info_text=info_text+("<li>July 10: Chris reaches hurricane status</li>");}
        if (sliderTime>=new Date("2018 08 31")) {info_text=info_text+("<li>August 31: Hurricane Florence forms off the coast of Africa</li>");}
        if (sliderTime>=new Date("2018 09 05")) {info_text=info_text+("<li>September 5: Tropical Storm Gordon makes landfall on the Mississippi/Alabama border</li>");}
        if (sliderTime>=new Date("2018 09 06")) {info_text=info_text+("<li>September 6: Hurricane Florence briefly achieves major hurricane status</li>");}
        if (sliderTime>=new Date("2018 09 10")) {info_text=info_text+("<li>September 10: Hurricane Florence reaches Category 4 strength again</li>");}
        if (sliderTime>=new Date("2018 09 14")) {info_text=info_text+("<li>September 14: Florence makes landfall in North Carolina as a Category 1 storm</li>");}
        if (sliderTime>=new Date("2018 09 23")) {info_text=info_text+("<li>September 23: Hurricane Leslie becomes the 7th storm to form in the month of September</li>");}
        if (sliderTime>=new Date("2018 10 10")) {info_text=info_text+("<li>October 10: Hurricane Michael makes landfall in the panhandle of Florida as a Category 4 storm</li>");}
        if (sliderTime>=new Date("2018 10 31")) {info_text=info_text+("<li>October 31: Category 1 Hurricane Oscar transitions to an extratropical storm</li>");}
        if (sliderTime>=seasonMinDate) {info_text=info_text+"</ul>";}
        
        info.append("html")
            .html(info_text);        
    };
    
    //Call hurricane points and add to map
    updatePoints();
    
    //Update points when map is zoomed or dragged
    map.on("moveend",updatePoints);
})