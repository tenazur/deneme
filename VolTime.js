function setFMS(i, text) {
  if (typeof fMotionStates[i] !== 'undefined') {
    setPreset(...fMotionStates[i], text);
  } else {
    console.log("fMotionStates with index " + i + " does not exist.");
  }
}
// adding draggable chart dependencies
document.head.appendChild(Object.assign(document.createElement("script2"),{src:"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.6.0/chart.min.js"}));
document.head.appendChild(Object.assign(document.createElement("script3"),{src:"https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.3/dist/chartjs-plugin-dragdata.min.js"}));
const tableData = [];

// Add initial time-volume pairs to the array
for (let i = 0; i <= 40; i += 5) {
  tableData.push({ time: i, volume: 0 });
}

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
