function setFMS(i, text) {
  if (typeof fMotionStates[i] !== 'undefined') {
    setPreset(...fMotionStates[i], text);
  } else {
    console.log("fMotionStates with index " + i + " does not exist.");
  }
}
// adding draggable chart dependencies
document.head.appendChild(Object.assign(document.createElement("script"),{src:"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.6.0/chart.min.js"}));
document.head.appendChild(Object.assign(document.createElement("script"),{src:"https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.3/dist/chartjs-plugin-dragdata.min.js"}));


//Create a volume slider
// create the slider element
var $slider = $('<div>', {
  id: 'v0',
  'aria-label': 'Volume',
  role: 'slider',
  class: 'ui-slider ui-corner-all ui-slider-vertical ui-widget ui-widget-content',
  style: 'opacity: 1;'
});

// create the slider range element
var $sliderRange = $('<div>', {
  class: 'ui-slider-range ui-corner-all ui-widget-header ui-slider-range-min',
  style: 'height: 100%;'
}).appendTo($slider);

// create the slider handle element
var $sliderHandle = $('<span>', {
  tabindex: '0',
  class: 'ui-slider-handle ui-corner-all ui-state-default',
  style: 'bottom: 100%;'
}).appendTo($slider);

// add the slider to the DOM as the first child of the description element
$('#description').prepend($slider);

// initialize the slider using jQuery UI library
$slider.slider({
  orientation: 'vertical',
  range: 'min',
  min: 0,
  max: 1,
  value: 50,
  slide: function(event, ui) {
    // set the value of the slider handle
    $sliderHandle.css('bottom', ui.value + '%');
  }
});

//////
const $slider = $('<div>', {
  id: 'slider',
  class: 'ui-slider ui-corner-all ui-slider-vertical ui-widget ui-widget-content',
  'aria-label': 'Volume',
  role: 'slider',
}).prependTo('#description');

$('<div>', {
  class: 'ui-slider-range ui-corner-all ui-widget-header ui-slider-range-min',
  style: 'height: 100%;',
}).appendTo($slider);

$('<span>', {
  class: 'ui-slider-handle ui-corner-all ui-state-default',
  tabindex: '0',
  style: 'bottom: 100%;',
}).appendTo($slider);

// set up event handlers
$slider.slider({
  orientation: 'vertical',
  range: 'min',
  min: 0,
  max: 100,
  step: 1,
  value: 100,
  slide: function (event, ui) {
    masterGain.gain.value = ui.value/100;
  },
});

$('#inputSlider').on('input', function() {
  const val = $(this).val();
  $slider.slider('value', val);
  masterGain.gain.value = val/100;
});

// set initial values
$slider.slider('value', 50);
masterGain.gain.value = 0.5;

const tableData = [];
// Add initial time-volume pairs to the array
for (let i = 0; i <= 40; i += 5) {
  tableData.push({ time: i, volume: 0 });
}

// Create the table element
let table = document.createElement("table");
table.style.width = "90%"; // Set the table width to 90% of the parent element
table.className = "keyb";
let headerRow = document.createElement("tr");
headerRow.style.backgroundColor = "rgba(222, 196, 255, 0.2)";
let timeHeader = document.createElement("th");
timeHeader.style.backgroundColor = "rgba(0, 196, 255, 0.2)"; // Set 20% transparent light blue background color
timeHeader.innerHTML = "Time";
headerRow.appendChild(timeHeader);
table.appendChild(headerRow);

// Create the first row (header row) with time values
for (let i = 0; i < tableData.length; i++) {
  let timeCell = document.createElement("th");
  timeCell.innerHTML = tableData[i].time;
  headerRow.appendChild(timeCell);
}

// Create the second row with volume values
let volumeRow = document.createElement("tr");
let volumeHeader = document.createElement("td");
volumeHeader.style.backgroundColor = "rgba(0, 196, 255, 0.2)"; // Set 20% transparent light blue background color
volumeHeader.innerHTML = "Volume";
volumeRow.appendChild(volumeHeader);
for (let i = 0; i < tableData.length; i++) {
  let volumeCell = document.createElement("td");
  volumeCell.setAttribute("contenteditable", "true");
  volumeCell.innerHTML = tableData[i].volume;
  volumeRow.appendChild(volumeCell);
}
table.appendChild(volumeRow);

// Set the width of the columns to be equal except for the first column
let headerCells = headerRow.querySelectorAll("th");
let volumeCells = volumeRow.querySelectorAll("td");
let cellWidth = (100 / (tableData.length + 1)) + "%";
headerCells.forEach((cell, index) => {
  if (index === 0) {
    cell.style.width = "";
  } else {
    cell.style.width = cellWidth;
  }
});
volumeCells.forEach((cell, index) => {
  if (index === 0) {
    cell.style.width = "";
  } else {
    cell.style.width = cellWidth;
  }
});

// Insert the table at the top of the #description element
let description = document.getElementById("description");
description.insertBefore(table, description.firstChild);

// Add event listeners to update the table data when cells are edited
volumeCells.forEach((cell, index) => {
  cell.addEventListener("input", (event) => {
    tableData[index-1].volume = parseInt(event.target.innerHTML);
  });
});

// Split time interval into smaller intervals and calculate volume values
function intervalChange(newIntervalSize){
const newIntervals = [];
const endTime = 40;
let currentIndex = 0;

while (currentIndex < tableData.length - 1) {
  const currentTime = tableData[currentIndex].time;
  const currentVolume = tableData[currentIndex].volume;
  const nextTime = tableData[currentIndex + 1].time;
  const nextVolume = tableData[currentIndex + 1].volume;

  if (nextTime - currentTime >= newIntervalSize) {
    // Insert new time points at regular intervals
    let newTime = currentTime + newIntervalSize;
    while (newTime < nextTime) {
      const timeDiff = newTime - currentTime;
      const timeInterval = nextTime - currentTime;
      const volumeInterval = nextVolume - currentVolume;
      const volumeDiff = (volumeInterval * timeDiff) / timeInterval;

      newIntervals.push({ time: newTime, volume: currentVolume + volumeDiff });
      newTime += newIntervalSize;
    }
  }

  currentIndex += 1;
}

// Add new time-volume pairs to the array
tableData.push(...newIntervals);

// Sort the array by time value
tableData.sort((a, b) => a.time - b.time);
}
//adding chart
var options = {
  type: 'line',
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [{
      data: [7, 11, 5, 8, 3, 7],
      fill: true,
      tension: 0.4,
      borderWidth: 1,
      pointHitRadius: 25
    }]
  },
  options: {
    scales: {
      y: {
        min: -1,
        max: 1
      }
    },
    onHover: function(e) {
      const point = e.chart.getElementsAtEventForMode(e, 'nearest', {
        intersect: true
      }, false)
      if (point.length) e.native.target.style.cursor = 'grab'
      else e.native.target.style.cursor = 'default'
    },
    plugins: {

      legend: {
        display: false
      },

      dragData: {
        round: 1,
        showTooltip: true,
        onDragStart: function(e, datasetIndex, index, value) {
          // console.log(e)
        },
        onDrag: function(e, datasetIndex, index, value) {
          e.target.style.cursor = 'grabbing'
          // console.log(e, datasetIndex, index, value)
        },
        onDragEnd: function(e, datasetIndex, index, value) {
          e.target.style.cursor = 'default'
          // console.log(datasetIndex, index, value)
        },
      }
    }
  }
}

var ctx = document.getElementById('chartJSContainer').getContext('2d');
window.test = new Chart(ctx, options);
