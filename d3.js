// Reference for the parrallel plot: https://d3-graph-gallery.com/graph/parallel_custom.html
var margin = { top: 30, right: 10, bottom: 10, left: 0 },
  width = 800 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("/cleanedSpotify.csv")
  .then(function (data) {
    console.log(data);

    // List of columns to exclude
    const columnsToExclude = [
      "track_artist",
      "track_id",
      "track_name",
      "track_album_id",
      "track_album_name",
      "track_album_release_date",
      "playlist_name",
      "playlist_id",
      "playlist_subgenre",
      "playlist_genre",
      "key",
      "loudness",
      "mode",
      "instrumentalness",
      "duration_ms",
      "valence",
    ];

    dimensions = [
      "track_popularity",
      "energy",
      "tempo",
      "danceability",
      "liveness",
    ];

    console.log("Dimensions to plot:", dimensions);

    // Color scale for artists:
    // - Ed Sheeran: #e63946 (red)
    // - Tiesto: 00bbf9 (blue)
    // - Future: #70e000 (green)
    // - Enrique Iglesias: #f15bb5 (pink)
    const color = d3
      .scaleOrdinal()
      .domain(["Ed Sheeran", "Tiesto", "Future", "Enrique Iglesias"]) // Define categories (artists)
      .range(["#d90027", "#0077ff", "#36b000", "#e6007e"]); // Vibrant and bold shades

    // For each dimension, build a linear scale and store them in a y object
    var y = {};
    for (let i in dimensions) {
      let name = dimensions[i];
      y[name] = d3
        .scaleLinear()
        .domain(
          d3.extent(data, function (d) {
            return +d[name];
          })
        ) // Convert to number
        .range([height, 0]);
    }

    // Build the X scale -> it finds the best position for each Y axis
    var x = d3.scalePoint().range([0, width]).padding(0.4).domain(dimensions);

    // Highlight the specie that is hovered
    const highlight = function (event, d) {
      selected_artist = d.track_artist.replace(/\s+/g, "_"); // Replace spaces with underscores

      // first every group turns grey
      d3.selectAll(".line")
        .transition()
        .duration(200)
        .style("stroke", "lightgrey")
        .style("opacity", "0.2");

      // Second the hovered specie takes its color
      d3.selectAll("." + selected_artist)
        .transition()
        .duration(200)
        .style("stroke", color(d.track_artist)) // Use the original name to get the color
        .style("opacity", "1");
    };

    // Unhighlight
    const doNotHighlight = function (event, d) {
      d3.selectAll(".line")
        .transition()
        .duration(200)
        .delay(1000)
        .style("stroke", function (d) {
          return color(d.track_artist);
        })
        .style("opacity", "1");
    };

    // Function to draw the path for each line
    function path(d) {
      return d3.line()(
        dimensions.map(function (p) {
          return [x(p), y[p](d[p])];
        })
      );
    }

    // Assign class names with underscores instead of spaces
    svg
      .selectAll("myPath")
      .data(data)
      .join("path")
      .attr("class", function (d) {
        return "line " + d.track_artist.replace(/\s+/g, "_");
      }) // Replace spaces with underscores
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", function (d) {
        return color(d.track_artist);
      })
      .style("opacity", 0.5)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight);

    // Draw the axis
    svg
      .selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions)
      .enter()
      .append("g")
      .attr("class", "axis")
      // I translate this element to its right position on the x axis
      .attr("transform", function (d) {
        return `translate(${x(d)})`;
      })
      // And I build the axis with the call function
      .each(function (d) {
        d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]));
      })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function (d) {
        return d;
      })
      .style("fill", "white");
  })
  .catch(function (error) {
    console.error("Error loading the CSV file:", error);
  });

// Scatter plot code
const scatterMargin = { top: 30, right: 30, bottom: 50, left: 50 },
  scatterWidth = 500 - scatterMargin.left - scatterMargin.right,
  scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

const scatterSvg = d3
  .select("#scatter_plot")
  .append("svg")
  .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
  .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
  .append("g")
  .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`);

// Create tooltip div
const tooltip = d3
  .select("#scatter_plot")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Functions for tooltip behavior
const mouseover = function (event, d) {
  tooltip.style("opacity", 1);
  d3.select(this).style("stroke", "black").style("opacity", 1);
};

const mousemove = function (event, d) {
  tooltip
    .html(`${d.track_name} by ${d.track_artist}`)
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY + "px")
    .style("background-color", "#1DB954")
    .style("border", "1px solid #1DB954");
};

const mouseleave = function (event, d) {
  tooltip.style("opacity", 0);
  d3.select(this).style("stroke", "white").style("opacity", 0.7);
};

// Function to update the scatter plot
function updateScatterPlot(data, xAttribute, yAttribute) {
  // Helper function to determine domain based on attribute
  function getDomain(attribute) {
    if (attribute === "tempo") {
      return [0, Math.ceil(d3.max(data, (d) => +d[attribute]) / 10) * 10]; // Round to nearest 10
    } else if (attribute === "track_popularity") {
      return [0, 100];
    } else {
      return [0, 1];
    }
  }

  // Create scales with dynamic domains for both X and Y axes
  const x = d3
    .scaleLinear()
    .domain(getDomain(xAttribute))
    .range([0, scatterWidth]);

  const y = d3
    .scaleLinear()
    .domain(getDomain(yAttribute))
    .range([scatterHeight, 0]);

  // Update X axis
  scatterSvg.selectAll(".x-axis").remove();
  scatterSvg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${scatterHeight})`)
    .call(d3.axisBottom(x))
    .style("color", "white");

  // Update X axis label
  scatterSvg.selectAll(".x-label").remove();
  scatterSvg
    .append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 40)
    .text(xAttribute.charAt(0).toUpperCase() + xAttribute.slice(1))
    .style("fill", "white");

  // Update Y axis
  scatterSvg.selectAll(".y-axis").remove();
  scatterSvg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y))
    .style("color", "white");

  // Update Y axis label
  scatterSvg.selectAll(".y-label").remove();
  scatterSvg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -scatterHeight / 2)
    .text(yAttribute.charAt(0).toUpperCase() + yAttribute.slice(1))
    .style("fill", "white");

  // Color scale for artists
  const color = d3
    .scaleOrdinal()
    .domain(["Ed Sheeran", "Tiesto", "Future", "Enrique Iglesias"])
    .range(["#e63946", "#00bbf9", "#70e000", "#f15bb5"]);

  // Update dots
  const dots = scatterSvg.selectAll("circle").data(data);

  // Remove old dots
  dots.exit().remove();

  // Update existing dots
  dots
    .transition()
    .duration(1000)
    .attr("cx", (d) => x(d[xAttribute]))
    .attr("cy", (d) => y(d[yAttribute]));

  // Add new dots
  dots
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d[xAttribute]))
    .attr("cy", (d) => y(d[yAttribute]))
    .attr("r", 5)
    .style("fill", (d) => color(d.track_artist))
    .style("opacity", 0.7)
    .style("stroke", "white")
    .style("stroke-width", 0.5)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

// Load the data and initialize the plot
d3.csv("/cleanedSpotify.csv").then(function (data) {
  // Initial plot
  updateScatterPlot(data, "danceability", "track_popularity");

  // Add event listeners to dropdowns
  d3.select("#x-axis").on("change", function () {
    updateScatterPlot(data, this.value, d3.select("#y-axis").property("value"));
  });

  d3.select("#y-axis").on("change", function () {
    updateScatterPlot(data, d3.select("#x-axis").property("value"), this.value);
  });
});

// Bar Chart 1 code
const barMargin = { top: 30, right: 30, bottom: 70, left: 60 },
  barWidth = 700 - barMargin.left - barMargin.right,
  barHeight = 250 - barMargin.top - barMargin.bottom;

const barSvg = d3
  .select("#barchart1")
  .append("svg")
  .attr("width", barWidth + barMargin.left + barMargin.right)
  .attr("height", barHeight + barMargin.top + barMargin.bottom)
  .append("g")
  .attr("transform", `translate(${barMargin.left},${barMargin.top})`);

// Load the data
d3.csv("/cleanedSpotify.csv").then(function (data) {
  // Parse dates and convert duration to minutes
  data.forEach((d) => {
    d.track_album_release_date = new Date(d.track_album_release_date);
    d.duration_min = d.duration_ms / 60000;
  });

  // Sort data by date
  data.sort((a, b) => a.track_album_release_date - b.track_album_release_date);

  // X axis
  const x = d3
    .scaleBand()
    .range([0, barWidth])
    .domain(data.map((d) => d.track_album_release_date))
    .padding(0.2);

  barSvg
    .append("g")
    .attr("transform", `translate(0,${barHeight})`)
    .call(d3.axisBottom(x).tickFormat((d) => d3.timeFormat("%Y-%m")(d)))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("color", "white");

  // Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.duration_min)])
    .range([barHeight, 0]);

  barSvg.append("g").call(d3.axisLeft(y)).style("color", "white");

  // Add bars
  barSvg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d.track_album_release_date))
    .attr("y", (d) => y(d.duration_min))
    .attr("width", x.bandwidth())
    .attr("height", (d) => barHeight - y(d.duration_min))
    .attr("fill", "#1DB954") // Spotify green
    .style("opacity", 0.7)
    .on("mouseover", function (event, d) {
      d3.select(this).style("opacity", 1);
      tooltip
        .style("opacity", 1)
        .html(
          `Song: ${d.track_name}<br>Duration: ${d.duration_min.toFixed(
            2
          )} min<br>Date: ${d3.timeFormat("%Y-%m-%d")(
            d.track_album_release_date
          )}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + "px");
    })
    .on("mouseleave", function () {
      d3.select(this).style("opacity", 0.7);
      tooltip.style("opacity", 0);
    });

  // Add X axis label
  barSvg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", barWidth / 2)
    .attr("y", barHeight + barMargin.bottom - 5)
    .text("Release Date")
    .style("fill", "white");

  // Add Y axis label
  barSvg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -barMargin.left + 20)
    .attr("x", -barHeight / 2)
    .text("Duration (minutes)")
    .style("fill", "white");

  // Add title
  barSvg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", barWidth / 2)
    .attr("y", -10)
    .text("Song Duration Over Time")
    .style("fill", "white")
    .style("font-size", "14px");
});

// Radar Chart Code
d3.csv("/spotify_songs1.csv").then(function (data) {
  // Get unique artists
  const uniqueArtists = [...new Set(data.map((d) => d.track_artist))];
  const artistsPerPage = 27;
  let currentPage = 1;
  const totalPages = Math.ceil(uniqueArtists.length / artistsPerPage);

  function showArtistButtons(page) {
    // Calculate start and end index for current page
    const startIndex = (page - 1) * artistsPerPage;
    const endIndex = Math.min(
      startIndex + artistsPerPage,
      uniqueArtists.length
    );
    const currentArtists = uniqueArtists.slice(startIndex, endIndex);

    // Clear existing buttons
    const buttonContainer = d3.select("#artist-buttons");
    buttonContainer.html("");

    // Pagination feature
    const paginationDiv = buttonContainer
      .append("div")
      .attr("class", "pagination-controls");

    // Previous button
    paginationDiv
      .append("button")
      .attr("class", "pagination-btn")
      .text("Previous")
      .style("opacity", page === 1 ? 0.5 : 1)
      .on("click", () => {
        if (page > 1) {
          showArtistButtons(page - 1);
        }
      });

    // Pages
    paginationDiv
      .append("span")
      .attr("class", "page-indicator")
      .text(`Page ${page} of ${totalPages}`);

    // Next button
    paginationDiv
      .append("button")
      .attr("class", "pagination-btn")
      .text("Next")
      .style("opacity", page === totalPages ? 0.5 : 1)
      .on("click", () => {
        if (page < totalPages) {
          showArtistButtons(page + 1);
        }
      });

    // Create artist buttons for current page
    const artistButtonsDiv = buttonContainer
      .append("div")
      .attr("class", "artist-buttons-grid");

    artistButtonsDiv
      .selectAll("button")
      .data(currentArtists)
      .enter()
      .append("button")
      .attr("class", "artist-btn")
      .attr("data-artist", (d) => d)
      .text((d) => d)
      .on("click", function () {
        d3.selectAll(".artist-btn").classed("active", false);
        d3.select(this).classed("active", true);
        createRadarChart(this.dataset.artist);
      });
  }

  showArtistButtons(1);

  createRadarChart(uniqueArtists[0]);
});

function createRadarChart(artist) {
  d3.select("#radar-chart").html("");

  const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select("#radar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr(
      "transform",
      `translate(${width / 2 + margin.left},${height / 2 + margin.top})`
    );

  d3.csv("/spotify_songs1.csv").then(function (data) {
    // Filters for selected artist
    const artistSongs = data.filter((d) => d.track_artist === artist);
    const features = [
      "danceability",
      "energy",
      "valence",
      "acousticness",
      "speechiness",
      "liveness",
    ];

    // Calculates the mean values for each feature
    const artistData = {
      artist: artist,
      metrics: features.map((feature) => ({
        axis: feature,
        value: d3.mean(artistSongs, (d) => +d[feature]),
      })),
    };

    // Radar chart parameters
    const radius = Math.min(width, height) / 2;
    const angleSlice = (Math.PI * 2) / features.length;

    // Scale for radius
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]);

    // Circular grid
    const levels = 5;
    const gridCircles = svg
      .selectAll(".gridCircle")
      .data(d3.range(1, levels + 1).reverse())
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", (d) => (radius / levels) * d)
      .style("fill", "none")
      .style("stroke", "white")
      .style("opacity", 0.1);

    const axes = svg
      .selectAll(".axis")
      .data(features)
      .enter()
      .append("g")
      .attr("class", "axis");

    axes
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr(
        "x2",
        (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2)
      )
      .attr(
        "y2",
        (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2)
      )
      .style("stroke", "white")
      .style("opacity", 0.3);

    // Labels
    axes
      .append("text")
      .attr("class", "legend")
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => rScale(1.2) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => rScale(1.2) * Math.sin(angleSlice * i - Math.PI / 2))
      .text((d) => d.charAt(0).toUpperCase() + d.slice(1))
      .style("fill", "white");

    // The radar chart blobs
    const radarLine = d3
      .lineRadial()
      .radius((d) => rScale(d.value))
      .angle((d, i) => i * angleSlice);

    // The radar area
    svg
      .append("path")
      .datum(artistData.metrics)
      .attr("class", "radarArea")
      .attr("d", radarLine)
      .style("fill", "#1DB954")
      .style("opacity", 0.7)
      .style("stroke", "white")
      .style("stroke-width", "1px");
  });
}
