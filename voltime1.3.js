//version 1.4 18/07/2025
//load scripts in order
const scriptsOrdered = [
  {
    label: "chartJsUrl",
    url: "https://cdn.jsdelivr.net/npm/chart.js@4.2.1/dist/chart.umd.min.js",
  },
  {
    label: "chartDragUrl",
    url:
      "https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.3/dist/chartjs-plugin-dragdata.min.js",
  },
  {
    label: "luxonUrl",
    url: "https://cdn.jsdelivr.net/npm/luxon@3.3.0/build/global/luxon.min.js",
  },
  {
    label: "luxoadapterUrl",
    url:
      "https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.3.1/dist/chartjs-adapter-luxon.umd.min.js",
  },
  {
    label: "chartStreaming",
    url: "https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@2.0.0",
  },
];

//font for slider value
$("<link>", {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Orbitron&display=swap",
}).appendTo("head");

// Golbal Variables
let DateTime;
let Duration;
let tableDataArray;
let graphData;
let timepoints = [];
let calparams;
let $chartTime;
let dataStream = { db: "", gain: "", time: "" };
let $pslider;
let $playerValue;
let $precalibration;
let addRowTocTable2;
let $cdialog;
let maxDbval = 100.39;
let calfactor = 16.95;
//styles

$("<style>")
  .prop("type", "text/css")
  .html(
    `

    .slider-value-big {
    font-family: Orbitron;
    font-size: 3em;
    color: #FFA500;
    text-shadow: 2px 2px 2px rgba(0,0,0,0.5);
    opacity: 0.5;
    margin-top: 20px;
  }
    .slider-value-small {
    position: absolute;
    margin-top: 5px;
    margin-left: 12px;
    font-family: 'Orbitron Mono', monospace;
    font-size: 2em;
    color: #f0f0f0;
    text-shadow: 2px 2px 2px rgba(0,0,0,0.5);
    opacity: 0.8;
    transform: initial;
  }
    .content{
    text-align: left;
    margin: 0px 0px 10px 0px;
    padding: 10px 20px;
    border: solid 1px rgba(255,255,255,0.2);
    -webkit-border-radius: 8px;
    -moz-border-radius: 8px;
    border-radius: 8px;
    -webkit-box-shadow: 0px 0px 60px 0px black;
    -moz-box-shadow: 0px 0px 60px 0px black;
    box-shadow: 0px 0px 60px 0px black;
    background-color: rgba(0,0,0,0.5);
    width-min: 50%;
  }

  .ui-slider-horizontal, .ui-slider-horizontal_lowlight {
      background: rgba(255,255,255,0.1);
      display: flex;
      flex: 1;
      border: 0px solid #777;
      border-radius: 6px;
      align-items: center;
      text-align: center;
  }
  .ui-slider-vertical .ui-slider-handle {
    border: 2px solid #777 !important;
    width: 30px !important;
    height: 30px !important;
    outline: none;
    left: -9px !important;
    margin-bottom: -17px !important;
    border-radius: 50%;
    cursor: pointer !important;
    background-clip: content-box;
    padding: 4px;
    box-shadow: inset 0 0 0 4px rgb(25,27,29);
    transition: box-shadow 0.25s linear;
  }
  .ui-slider-horizontal .ui-slider-handle {
      top: auto !important;
      margin-left: 0px;
      /* border: 2px solid #777 !important; */
      /* width: 70px; */
      height: 38px;
      outline: none;
      cursor: pointer !important;
      background-clip: content-box;
      padding: 4px;
      /* box-shadow: inset 0 0 0 4px rgb(25,27,29); */
      /* transition: box-shadow 0.25s linear; */
      background: #12131a;
  }
  .ui-slider-horizontal .ui-slider-range{
  border: 1px solid #000000;
  background: #111111 url('https://download.jqueryui.com/themeroller/images/ui-bg_gloss-wave_20_111111_500x100.png') 50% top repeat-x;
  color: #d9d9d9
  }
  .ui-slider-horizontal:hover > .ui-slider-handle {
    border: 2px solid #aaa !important;
  }

  button.btnLogo {
    position: relative;
    vertical-align: top;
    display: inline-block;
    text-align: center;
    width: 44px;
    height: 44px;
    border: none;
    z-index: 20;
    cursor: pointer;
    background: transparent;
  }
  .mybtnImg{
    padding: 0;
    border-radius: 10%;
    width: 100%;
    background: transparent;
    filter:invert(1)
  }

myIMageButton{
  filter; invert(0.8) sepia(1) hue-rotate(45deg)brightness(0.8)
}
  `
  )
  .appendTo("head");

// default variables for testing
calparams = { done: 0 };
tableDataArray = [
  ["Dakika", "Desibel", "Fade"],
  [0, 40, "L"],
  [5, 60, "L"],
  [15, 95, "L"],
  [19, 45, "L"],
  [20.5, 45, "R"],
  [21, 90, "L"],
  [25, 95, "L"],
  [29, 95, "R"],
  [30, 60, "L"],
  [31, 40, ""],
];

//ordered loader
async function loadScripts(scripts) {
  const loadedScripts = [];
  for (const script of scripts) {
    try {
      const scriptElement = document.createElement("script");
      scriptElement.src = script.url;
      await new Promise((resolve, reject) => {
        scriptElement.onload = resolve;
        scriptElement.onerror = reject;
        document.head.appendChild(scriptElement);
      });
      loadedScripts.push(scriptElement);
      console.log(script.label + " Loaded");
    } catch (error) {
      console.error(`Error loading ${script.url}: ${error}`);
      throw error;
    }
  }
  return loadedScripts;
}

// definitions after script loaded
loadScripts(scriptsOrdered).then(() => {
  DateTime = luxon.DateTime.local();
  DateTime0 = luxon.DateTime;
  Duration = luxon.Duration;
  console.log("scripts loaded");
  graphData = createGraphData(tableDataArray);
  graphData = sortDatabyx(graphData);
  Chart.register(ChartStreaming);
  baslaPlayer();
  drawGraph();
});

//setup player (site yüklendiğinde state farklı oluyor bu durumdan kurtulmak için)
if (!!context.state) {
  masterGain.gain.value = 0.1;
  if (context.state == "suspended") {
    $("#mute").focus();
    $("#mute").mouseover();
    $("#mute").click();
  }
  setTimeout(() => {
    $("#mute").click();
    masterGain.gain.value = 1;
    Mousetrap.trigger("w");
  }, 1000);
}

// Create a wrapper div and insert it before the mixer element
const $wrapper = $("<div>", {
  class: "wrapper",
  style: "display: flex;",
}).appendTo("#player > div");

//Create left and right divs and insert them into the wrapper
const $left = $("<div>").appendTo($wrapper);
const $right = $("<div>").appendTo($wrapper);

// Move the mixer element and its supporters inside the right div
$(
  "#player > div > div.subTitle, #player > div > div.mixer.noselect, #player > div > div.controlers.noselect, #msg"
).appendTo($right);

// Add a new div for the volume control and insert it into the left div
const $voltimemanipulator = $("<div>", {
  id: "precalib",
  class: "nestedSection large",
  margin: "4px",
}).appendTo($left);

$left.css({
  flex: 1, // Make left div take up 1/2 of the wrapper
  margin: "auto", // Align volcontrol to center
  "text-align": "left",
  display: "flex", // Use flexbox for left div
  alignItems: "center",
  justifyContent: "center",
});

$right.css({
  flex: 1, // Make right div take up 1/2 of the wrapper
  margin: "auto", // Align mixer to center
  "text-align": "center", // Center content horizontally
});

$voltimemanipulator.css({
  flex: "0 1 content", // Allow volcontrol to expand horizontally with left div
  margin: "auto",
  display: "flex",
  height: "inherit",
  "align-items": "center",
});

const $sliderWrapper = $("<div>", {
  class: "slidewrapper",
  style:
    "margin: 5px; display: flex; justify-content: top; align-items: center;  flex-direction: column; width:35px; height: inherit;",
}).appendTo($voltimemanipulator);

//sağ flex
const $rightWrapper = $("<div>", {
  id: "maingraph",
  style:
    "margin: 5px; display: flex; flex: 1; justify-content: top;  align-self: flex-start; align-items: center; flex-direction: column;  height: inherit; padding: 4px;",
}).appendTo($voltimemanipulator);

//üst menü
const $bwidget = $("<div>", {
  //class: "hand",
  padding: "4px;",
  style:
    "lex: 1 1; display: flex; flex-direction: row; justify-content: space-evenly; padding: 4px; width: 100%; font-size: 1.5em;",
}).appendTo($rightWrapper);

$("<span>", {
  class: "actionlink",
  role: "button",
  margin: "2px",
  text: "Kalibrasyon",
  title: "Kalibrasyon işlemine başla",
  onclick: "if(!$precalibration){calibrationsection()}",
}).appendTo($bwidget);

$bwidget.append(" &nbsp;&#8226;&nbsp; ");

$("<span>", {
  class: "actionlink",
  role: "button",
  margin: "2px",
  text: "Slider MAX!!",
  title: "Tüm sliderları orantılı olarak artır",
  onclick: "slidersMaxx()",
}).appendTo($bwidget);

$bwidget.append(" &nbsp;&#8226;&nbsp; ");

$("<span>", {
  class: "actionlink",
  role: "button",
  margin: "2px",
  text: "Dışa Aktar",
  title: "Zaman volüm grafik verisini dışa aktar",
  onclick: "exportGraphData()",
}).appendTo($bwidget);

$bwidget.append(" &nbsp;&#8226;&nbsp; ");

$("<span>", {
  class: "actionlink",
  role: "button",
  margin: "2px",
  text: "İçe Aktar",
  title: "Zaman volüm grafik verisini dışa aktar",
  onclick: "importGraphData()",
}).appendTo($bwidget);

//slider value
const $sliderValue = $("<span>", {
  class: "slider-value-big",
});

// slider part
const $vslider = $("<div>", {
  id: "vslider",
  style: "position: relative; ",
  height: "16em",
  class:
    "ui-slider ui-corner-all ui-widget ui-widget-content ui-slider-vertical",
  role: "slider",
}).appendTo($sliderWrapper);

$(function () {
  $vslider.slider({
    orientation: "vertical",
    range: "min",
    min: 5,
    max: 99.4,
    step: 0.01,
    value: 5,
    animate: {
      step: function (now, fx) {
        // update the slider value span as it animates
        $sliderValue.text(Math.round(dbFromGain(Math.pow(now, 3) / 1000000)));
      },
    },
    slide: function (event, ui) {
      sliderUpdate(ui.value);
    },
    stop: function (event, ui) {
      sliderUpdate(ui.value);
    },
    change: function (event, ui) {},
    create: function (event) {
      $sliderValue.appendTo($vslider.parent());
      sliderUpdate(25);
      $vslider.slider("value", 100);
    },
  });
});


$sliderValue.hover(
  function () {
    $(this).fadeTo("slow", 1);
  },
  function () {
    $(this).fadeTo("slow", 0.5);
  }
);

// slider functions
function sliderUpdate(uivalue) {
  masterGain.gain.value = sliderPower(uivalue);
  $sliderValue.text(Math.round(dbFromGain(masterGain.gain.value)));
}

function sliderPower(sliderval) {
  return Math.pow(sliderval, 3) / 1000000;
}

function dbFromGain(gain) {
  return maxDbval + calfactor * Math.log10(gain);
}

function gainFromDb(db, maxDbval = 100, calfactor = 24) {
  return Math.pow(10, (db - maxDbval) / calfactor).toFixed(8);
}

function createGraphData(tempArray2) {
  return tempArray2.slice(1).map((item) => ({
    x: item[0] * 60000,
    y: item[1],
    seg: item[2] || false,
  }));
}

function calibrationsection() {
  // Add a new div for the volume control and insert it into the left div
  $precalibration = $("<div>", {
    id: "precalib",
    class: "content",
    margin: "4px",
  }).appendTo($rightWrapper);

  $precalibration.css({
    flex: "0.8 1", // Allow volcontrol to expand horizontally with left div
    margin: "auto",
    display: "flex",
    height: $right.height(),
    "align-items": "center",
  });

  const $calibinfo = $("<div>", {
    class: "calibinfo",
    style: "height: 100%; display: flex; flex-direction: column;",
  }).appendTo($precalibration);

  $("<h2>", {
    text: "Hazırlanın !",
  }).appendTo($calibinfo);

  $("<p>", {
    html:
      "Tüm seviyeleri istediğniz seviyeye getirin ve ses biçimini profilini ayarlayın.",
  }).appendTo($calibinfo);

  $("#controls > div:nth-child(7) > p").clone().appendTo($calibinfo);

  $("<span>", {
    html: "Bazı seçenekler:",
  }).prependTo($calibinfo.children().last());

  $("<p>", {
    text: "Kalibrasyon için en yüksek slider maximuma ulaştırılacak.",
  }).appendTo($calibinfo);

  $calibinfo.find("*").css("padding", "4px 0px");

  const $donebutton = $("<button>", {
    title: "YÜKSEK SES!!",
    class: "btnLogo",
    style:
      "opacity: 0.5; margin: 2px; box-sizing: border-box; border: none; display: flex; max-width:" +
      $precalibration.height() +
      "px; background: transparent;",
  }).appendTo($precalibration);
  $donebutton.powerTip();

  const $icon = $("<img>", {
    class: "btnImg",
    src: "https://www.svgrepo.com/show/457931/done-round.svg",
    alt: "done icon",
    style: "height: 100%; background: transparent; filter:invert(1)",
  }).appendTo($donebutton);

  $donebutton.hover(
    function () {
      $donebutton.css("opacity", "1");
      $icon.css("filter", "invert(1) sepia(1) hue-rotate(75deg)");
      $icon.css("height", "100%");
    },
    function () {
      $donebutton.css("opacity", "0.5");
      $icon.css("filter", "invert(1)");
    }
  );

  $donebutton.on("mousedown", function () {
    $icon.css("filter", "invert(1) sepia(1) hue-rotate(280deg)");
    $icon.css("padding", "10%");
  });

  $donebutton.on("mouseup", function () {
    $icon.css("filter", "invert(1) sepia(1) hue-rotate(75deg)");
    $icon.css("padding", "6px");
    calibrationDialog();
  });
}

function calibrationDialog() {
  document.head.appendChild(
    Object.assign(document.createElement("script"), {
      src:
        "https://cdnjs.cloudflare.com/ajax/libs/regression/2.0.1/regression.js",
    })
  );
  $cdialog = $("<div>", {
    id: "cdialog",
    class: "nestedSection large",
    style:
      "margin: auto; z-index: 99 ; display: flex; flex-direction: column; justify-content: flex-start; position: fixed; top: 5%; left:50%; transform: translate(-50%); background-image: linear-gradient(to bottom, rgba(20,23,26,0.8) 40%, #080808 80%); max-width: 40%;",
  }).appendTo("body");

  $("<h1>", {
    text: "Kalibrasyon",
  }).appendTo($cdialog);

  var $paragraph = $("<p>", {
    html:
      "Bu eklenti Bursa Uludağ Üniversitesi Tıbbi Farmakoloji Anabilim Dalı bilimsel çalışmaları için geliştirilmiştir.",
  }).appendTo($cdialog);

  const $calibslide = $("<div>", {
    class: "calibslide",
    style: "height: 100%; display: flex;",
    flexDirection: "row",
  }).appendTo($cdialog);

  // tamamlandı düğmesi
  const $ctamamlandı = $("<span>", {
    class: "actionlink",
    role: "button",
    text: "100 db Değerini Griniz",
    marginLeft: "4px",
    style: "font-size: 1,2em",
    onclick:
      "$vslider.slider('value',100); masterGain.gain.setTargetAtTime(1,context.currentTime+0.5);",
  }).appendTo($paragraph);

  const $stamamlandı = $("<span>", {
    class: "actionlink",
    role: "button",
    text: "Tamamlandı",
    marginLeft: "4px",
    style: "font-size: 1,2em",
    onclick: "calibrationstart()",
  }).appendTo($paragraph);
  $stamamlandı.hide();

  // sliderı düzenle
  $vslider.on("slidechange", (event, ui) => {
    $sliderValue.text(Math.round(dbFromGain(masterGain.gain.value)));
    addRowTocTable2(
      ui.value,
      masterGain.gain.value,
      dbFromGain(masterGain.gain.value)
    );
  });

  //calibration table

  var $tablecontainer = $("<div>", { class: "content" }).appendTo($calibslide);
  var $cdataTable = $("<table>", { class: "license" }).appendTo(
    $tablecontainer
  );
  $cdataTable.css({ border: "1px solid #333" });
  $("<tr>")
    .each(function () {
      var array1 = ["Slider", "Gain", "Db", "Ölçülen"];
      var $headerCells = array1.map((header) =>
        $("<th>", { text: header }).css({
          border: "1px solid #333",
          paddingLeft: "5px",
        })
      );
      $(this).append($headerCells);
    })
    .appendTo($cdataTable);

  function addRowTocTable2(sliderVal, gainVal, dbVal) {
    // create table row element
    var $row = $("<tr>").appendTo($cdataTable);
    console.log(sliderVal, gainVal, dbVal);
    // create table cells for slider, gain, and db values
    $("<td>", { text: sliderVal }).appendTo($row);
    $("<td>", { text: gainVal }).appendTo($row);
    $("<td>", { text: dbVal }).appendTo($row);

    // create input box for measured value
    var $measuredInput = $("<input>", { type: "text" }).appendTo(
      $("<td>").appendTo($row)
    );

    setTimeout($measuredInput.focus(), 100);

    var enterKeyPressed = false;

    $measuredInput.on("keydown", function (event) {
      if (event.keyCode === 13 && $measuredInput.val() !== "") {
        // enter key
        confirmValue();
        enterKeyPressed = true;
      } else if (event.keyCode === 27) {
        // esc key
        deleteRow();
      }
    });

    $measuredInput.on("blur", function () {
      if ($measuredInput.val() !== "" && !enterKeyPressed) {
        confirmValue();
      } else if ($measuredInput.val() === "" && !enterKeyPressed) {
        deleteRow();
      }

      enterKeyPressed = false;
    });

    // function to confirm the measured value and append the row to the table
    function confirmValue() {
      $row.appendTo($cdataTable);
      $measuredInput.attr("disabled", true); // disable input field after confirming value
      calparams[gainVal] = $measuredInput.val();
      if (dbVal >= 99) {
        $ctamamlandı.text("En az 6 Değer Ölçünüz");
        $ctamamlandı.click(function () {});
      }
      if (Object.keys(calparams).length > 7) {
        $ctamamlandı.remove();
        $stamamlandı.show();
      }
    }

    // function to delete the row when the user presses the esc key
    function deleteRow() {
      $row.remove();
    }
  }
}

function slidersMaxx() {
  var offset = 0.99 - Math.max(...currentLevel);
  for (var i = 0; i < iNUMBERBANDS; ++i) {
    currentLevel[i] = Math.min(0.99, currentLevel[i] + offset);
    randomCounter = 0; //anim
    $("#s" + i).slider("value", currentLevel[i]);
  }
}

function calibrationstart() {
  const pairsArray = Object.entries(calparams)
    .filter(([key]) => key !== "done")
    .map(([key, value]) => [parseFloat(key), parseInt(value)]);

  console.log(pairsArray);
  const logarithmicc = regression.logarithmic(pairsArray, { presicion: 5 });
  const powerc = regression.power(pairsArray, { precision: 5 });
  calibsec(logarithmicc, powerc);
}

function calibsec(logarithmicc, powerc) {
  console.log(logarithmicc);
  console.log(powerc);
  $("#cdialog > div > div").hide();
  $("<h1>", {
    text: "Kalibrasyon Değerleri",
  }).appendTo($cdialog);

  $("<p>", {
    html:
      "Varsayılan Gainden Db hesaplama Formülü:<b><br> Db = MaxDb + 20* log(Gain)</b> <br> 20 katsayısı 16-30 arasında değişebiliyor bu değişim ses sisteminin gücü ortamın büyüklüğünden etkilenebiliyor.",
  }).appendTo($cdialog);

  // Sçenekeleri Göster
  const $radiosWrapper = $("<div>", {
    class: "radios-wrapper",
  }).appendTo($cdialog);
  var maxvals = Math.max(...Object.values(calparams));
  // Define the radio options as an array of objects
  const radioOptions = [
    {
      value: ["L", maxvals, 24, "?"],
      label: "y= " + maxvals + "+ " + calfactor + "*log(x)",
    },
    {
      value: [
        "L",
        logarithmicc.equation[0],
        parseFloat(logarithmicc.equation[1] / Math.LOG10E).toFixed(4),
        logarithmicc.r2,
      ],
      label:
        "y= " +
        logarithmicc.equation[0] +
        "+ " +
        parseFloat(logarithmicc.equation[1] / Math.LOG10E).toFixed(4) +
        "*log(x)",
    },
    //{ value: ['P',powerc.equation[0],powerc.equation[1],powerc.r2], label: powerc.string }
  ];

  // Loop through the radio options and create a div with a label and radio button for each
  radioOptions.forEach((option) => {
    const $radioWrapper = $("<h1>", {
      text: option.label,
    }).appendTo($radiosWrapper);

    const $radioButton = $("<input>", {
      type: "radio",
      id: option.value,
      name: "radio-group",
      value: option.value,
    })
      .prependTo($radioWrapper)
      .css({
        transform: "scale(1.5)", // Increase radio button size by 50%
        "margin-right": "8px", // Add spacing between radio button and label
        "margin-left": "4px",
      });

    const $radioLabel = $("<label>", {
      text: option.label,
      for: option.value,
    }).appendTo($radioButton);

    $("<span>", {
      html: "R<sup>2</sup> = " + option.value[3],
      style: "float:right;",
    }).appendTo($radioWrapper);
  });

  // Add confirm button
  const $confirmButton = $("<button>", {
    text: "Confirm",
  }).appendTo($cdialog);

  // Add event listener to confirm button
  $confirmButton.on("click", () => {
    const selectedOption = $('input[name="radio-group"]:checked')
      .val()
      .split(",");
    $cdialog.remove();
    console.log(selectedOption);
    calparams["done"] = 1;
    calparams["eq"] = selectedOption;
    //sliderı eski haline getiri
    $vslider.on("slidechange", (event, ui) => {});
    maxDbval = parseFloat(calparams.eq[1]);
    calfactor = parseFloat(calparams.eq[2]);
    return selectedOption;
  });
}

function sortDatabyx(obj) {
  // Get an array of key-value pairs from the object
  var entries = Object.entries(obj);
  // Sort the array by the values of the key "x"
  entries.sort(function (a, b) {
    return a[1].x - b[1].x;
  });
  // Create a new object from the sorted array
  var sortedObj = [];
  timepoints = []; // Create an empty array for the timepoints
  for (var i = 0; i < entries.length; i++) {
    sortedObj[i] = entries[i][1];
    timepoints.push(entries[i][1].x); // Add the key to the timepoints array
  }
  return sortedObj; // Return the sorted object and the timepoints array
}

const $wrapper2 = $("<div>", {
  class: "wrapper",
  style:
    "display: flex; flex-direction: column; margin: 2em; margin-right: 5%; margin-left: 5%; width: auto;",
}).appendTo("#player");

//remove default ui handle style
Array.from(document.styleSheets).forEach((styleSheet) => {
  try {
    Array.from(styleSheet.cssRules).forEach((rule, j) => {
      if (rule.selectorText === ".ui-slider-handle") {
        styleSheet.deleteRule(j);
      }
    });
  } catch (e) {
    console.log(
      `Error while processing style sheet ${styleSheet.href}: ${e.message}`
    );
  }
});

const $playerBtn = $("<button>", {
  height: "3em",
  width: "2.4em",
  class: "btnLogo",
});

const $playSvgIcon = $("<img>", {
  src: "https://www.svgrepo.com/show/458010/play.svg",
  class: "btnImg mybtnImg",
  alt: "play svg icon",
}).appendTo($playerBtn);

const $stopSvgIcon = $("<img>", {
  src: "https://www.svgrepo.com/show/457808/stop.svg",
  class: "btnImg mybtnImg",
  alt: "stop svg icon",
});

$playerBtn.on("click", (event) => {
  if (bMUTE) {
    sortDatabyx(graphData);
    pSliderSnap($pslider.slider("value"));
    var startindex = timepoints.indexOf($pslider.slider("value"));
    $pslider.slider("disable");
    $vslider.slider("disable");
    $chartTime.data.datasets[0].dragData = false;
    masterGain.gain.value = gainFromDb(graphData[startindex].y);
    handleVolume(startindex);
    toggleMute();
    updateButtons();
    setTimeout(
      enableButton(
        [
          "reset",
          "anim",
          "mode",
          "speed",
          "timer",
          "calib",
          "bell",
          "fftCanvas",
        ],
        0
      ),
      500
    );
    mysinterval = setInterval(() => {
      dataStream.db = dbFromGain(masterGain.gain.value);
      dataStream.gain = masterGain.gain.value;
      dataStream.time = context.currentTime;
      if ($pslider.slider("value") + 70 > timepoints[startindex + 1]) {
        handleVolume(startindex + 1);
        startindex = startindex + 1;
      }
      console.log(dataStream);
      $vslider.slider("value", Math.cbrt(masterGain.gain.value) * 100);
      $pslider.slider("value", $pslider.slider("value") + 100);
      $sliderValue.text(Math.round(dataStream.db));
    }, 100);
  } else {
      myMutefunc();
  }
});


function myMutefunc(){
masterGain.gain.cancelScheduledValues(context.currentTime + 0.05);
toggleMute();
pSliderSnap($pslider.slider("value"));
$pslider.slider("enable");
$vslider.slider("enable");
$chartTime.data.datasets[0].dragData = true;
$vslider.slider("value", Math.cbrt(masterGain.gain.value) * 100);
setTimeout(() => {
  enableButton(
    [
      "reset",
      "anim",
      "mode",
      "speed",
      "timer",
      "calib",
      "bell",
      "mute",
      "fftCanvas",
    ],
    1
  );
  updateButtons();
}, 500);
clearInterval(mysinterval);
}



function handleVolume(i) {
  if (typeof graphData[i+1] == "undefined"){
    myMutefunc();
    $pslider.slider("value",0);
    return;
  }
  targetgain = gainFromDb(graphData[i + 1].y);
  targetime = (graphData[i + 1].x - graphData[i].x) / 1000;
  timecons = (graphData[i + 1].x - graphData[i].x) / 8000;

  if (graphData[i].seg == "R") {
    masterGain.gain.setTargetAtTime(
      targetgain,
      context.currentTime + 0.05,
      timecons
    );
    console.log(
      "masterGain.gain.setTargetAtTime(" +
        targetgain +
        " , " +
        (context.currentTime + 0.05) +
        "," +
        timecons +
        ");"
    );
  } else {
    masterGain.gain.linearRampToValueAtTime(
      targetgain,
      context.currentTime + targetime
    );
    console.log(
      "masterGain.gain.linearRampToValueAtTime(" +
        targetgain +
        " ," +
        (context.currentTime + targetime) +
        ");",
      targetime
    );
  }
}

function baslaPlayer() {
  $playerWrapper = $("<div>", {
    class: "slidewrapper",
    style:
      "border: 1px solid #333333; display: flex; flex: 1; justify-content: center; flex-direction: row;  max-width:100%;",
  }).appendTo($wrapper2);
  $playerBtn.appendTo($playerWrapper);
  console.log("baslaPlayer");
  //slider value
  $playerValue = $("<span>", {
    class: "slider-value-small",
  });

  // slider part
  $pslider = $("<div>", {
    id: "pslider",
    style:
      "position: relative;  height: 1.3em; background: #0b3e6f url('https://download.jqueryui.com/themeroller/images/ui-bg_diagonals-thick_15_0b3e6f_40x40.png') 50% 50% repeat; color: #f6f6f6; font-weight: bold;  margin-right: 20px; margin-top: auto; margin-bottom: auto;",
    //  class: "ui-corner-all ui-widget ui-widget-content",
    role: "slider",
  }).appendTo($playerWrapper);

  $(function () {
    $pslider.slider({
      orientation: "horizontal",
      min: 0,
      max: graphData[graphData.length - 1].x,
      step: 100,
      value: 0,
      range: "min",
      animate: true,
      slide: function (event, ui) {
        pSliderUpdate(ui.value);
      },
      stop: function (event, ui) {
        pSliderSnap(ui.value);
      },
      change: (event, ui) => {
        pSliderUpdate(ui.value);
      },
      create: (event) => {
        $playerValue.appendTo(event.target.lastChild);
        pSliderUpdate(0);
      },
    });
  });
}

function pSliderSnap(value) {
  var nearest = timepoints[0];
  console.log(value);
  for (var i = 1; i < timepoints.length; i++) {
    if (Math.abs(timepoints[i] - value) < Math.abs(nearest - value)) {
      nearest = timepoints[i];
    } else {
      pSliderUpdate(nearest);
      $pslider.slider("value", nearest);
      return nearest;
      break;
    }
  }
}

function pSliderUpdate(uivalue) {
  $playerValue.text(Duration.fromMillis(uivalue).toFormat("m':'ss"));
}

function drawGraph() {
  /// grafik çiz
  const $chartWrapper = $("<div>", {
    style: "flex: 1;  display:flex; width: 100%;",
  }).appendTo($wrapper2);

  const $chartcanvas = $("<canvas>", {
    id: "chartJSContainer",
    style:
      " background: gainsboro;  position: relative; height:40vh; width:100vw",
  }).appendTo($chartWrapper);
  //fcking special draw
  const specialDraw = {
    id: "specialDraw",
    beforeDatasetDraw: (chart, args, options) => {
      const dataset = chart.data.datasets[args.index];
      if (dataset.specialDraw === true) {
        args.cancel = true; // cancel the default drawing behavior
        // Custom line drawing logic
        var ctx = chart.ctx;
        var xAxis = chart.scales.x;
        var yAxis = chart.scales.y;
        dataset.data.forEach((value, index) => {
          if (index > 0) {
            var valueFrom = dataset.data[index - 1];
            var xFrom = xAxis.getPixelForValue(valueFrom.x);
            var yFrom = yAxis.getPixelForValue(valueFrom.y);
            var xTo = xAxis.getPixelForValue(value.x);
            var yTo = yAxis.getPixelForValue(value.y);
            ctx.save();
            ctx.strokeStyle = dataset.borderColor;
            ctx.lineWidth = dataset.borderWidth;
            if (valueFrom.seg == "R") {
              ctx.beginPath();
              ctx.moveTo(xFrom, yFrom);
              for (let i = 1; i <= 12; i++) {
                const x = xFrom + (i * (xTo - xFrom)) / 12;
                const y =
                  yFrom +
                  (yTo - yFrom) *
                    (1 - Math.exp(-(x - xFrom) / ((xTo - xFrom) / 8)));
                ctx.lineTo(x, y);
              }
              ctx.stroke();
              ctx.restore();
            } else {
              ctx.beginPath();
              ctx.moveTo(xFrom, yFrom);
              ctx.lineTo(xTo, yTo);
              ctx.stroke();
              ctx.restore();
            }
          }
        });
        //console.log(chart);
      }
    },
  };

  // Create dB-time chart using Chart.js
  const ctx = $chartcanvas[0].getContext("2d");
  $chartTime = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          data: [],
          backgroundColor: "rgba(255, 99, 132, 0.4)",
          borderColor: "rgb(255, 99, 132)",
          // backgroundColor: "rgb(255, 99, 132)",
          borderWidth: 4,
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHitRadius: 22,
          pointHoverRadius: 20,
          specialDraw: true,
        },
        {
          data: [{ x: 20000, y: 97, seg: "L" }],
          backgroundColor: "rgba(99, 220, 90, 0.8)",
          borderColor: "rgb(99, 200, 90)",
          // backgroundColor: "rgb(255, 99, 132)",
          borderWidth: 7,
          pointBorderWidth: 4,
          pointRadius: 12,
          pointHitRadius: 30,
          pointHoverRadius: 15,
          specialDraw: false,
          pointStyle: "cross",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "minute",
            displayFormats: {
              minute: "m",
              second: "ss",
              millisecond: "S",
            },
            adapters: {
              date: {
                locale: DateTime.loc.locale,
                zone: DateTime.zone.name,
              },
            },
          },
          ticks: {
            min: 0,
            beginAtZero: true,
            stepSize: 5,
          },
        },
        y: { type: "linear", ticks: { min: 50 } },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          usePointStyle: true,
          callbacks: {
            title: function (e) {
              const timeString = Duration.fromMillis(e[0].parsed.x).toFormat(
                "m':'ss'.'S"
              );
              return timeString;
            },
            label: (e) => {
              return " " + e.parsed.y + " Db";
            },
            footer: (e) => {
              return e[0].raw.seg;
            },
          },
        },
        dragData: {
          dragX: true,
          showTooltip: true,
          magnet: {
            to: function (value, axis) {
              value.x = Math.round(value.x / 1000) * 1000;
              value.y = Math.round(value.y * 4) / 4;
              return value;
            },
          },
          onDragStart: function (e, datasetIndex, index, value) {},
          onDrag: function (e, datasetIndex, index, value) {
            e.target.style.cursor = "grabbing";
            //console.log("Drag Value: ", value.x)
          },
          onDragEnd: function (e, datasetIndex, index, value) {
            e.target.style.cursor = "default";
            tooltipItems = e;
            if (datasetIndex == 1) {
              $chartTime.data.datasets[datasetIndex - 1].data.push(value);
              $chartTime.data.datasets[datasetIndex].data = [
                {
                  x: 20000,
                  y: 97,
                  seg: "L",
                },
              ];
              graphData = sortDatabyx ($chartTime.data.datasets[0].data);
              $chartTime.data.datasets[0].data = graphData;
              $chartTime.update();
            } else {
              var button = document.createElement("button");
              button.innerText = value.seg == "L" ? "R" : "L";
              button.onclick = function () {
                value.seg == "L" ? (value.seg = "R") : (value.seg = "L");
                button.parentNode.removeChild(button);
              };

              var xPos = e.offsetX;
              var yPos = e.offsetY;
              // Set the button styles
              button.style.position = "absolute";
              button.style.left = xPos - 30 + "px";
              button.style.top = yPos + 45 + "px";
              // Append the button to the chart wrapper element
              $chartWrapper.append(button);
              // Remove the button after a delay
              $chartTime.data.datasets[datasetIndex].data = sortDatabyx(
                $chartTime.data.datasets[datasetIndex].data
              );
              graphData = $chartTime.data.datasets[datasetIndex].data;
              setTimeout(function () {
                button.parentNode.removeChild(button);
              }, 5000);
              pSliderSnap($pslider.slider("value"));
              $chartTime.update();
              return "";
            }
          },
        },
        streaming: false,
        //specialDraw: true,
      },
    },
    plugins: [specialDraw],
  })
  $chartTime.update(()=>{$chartTime.data.datasets[0].data = graphData;});
}

function exportGraphData() {
  // Create an input element to hold the graphData
  input = JSON.stringify(graphData);
  // Alert the user that the text has been copied
  prompt("Zaman Ses Verisini Kopyalayın: ", input);
}

function importGraphData() {
  try {
    graphData = JSON.parse(prompt("Zaman Ses Verisini yapıştırın: "));
    $chartTime.data.datasets[0].data = sortDatabyx(graphData);
    $chartTime.update();
  } catch (error) {
    alert(JSON.stringify(error));
  }
}


// tooltip için
$("#north").powerTip({
  placement: "n",
  smartPlacement: true,
});
// tooltip için
$(".actionlink").powerTip({
  placement: "n",
  smartPlacement: true,
});

/*
  const $addData = $("<img>", {
    src: "https://www.svgrepo.com/show/498940/add-circle.svg",
    class: "smallbtnimage myIMageButton",
    alt: "add Data Point",
    style: 'position:fixe; marginLeft"4; 1.1 em;',
  }).appendTo($chartTime);

  const $editData = $("<img>", {
    src: "https://www.svgrepo.com/show/503019/edit.svg",
    class: "smallbtnimage",
    alt: "add Data Point",
  });

  const $removeData = $("<img>", {
    src: "https://www.svgrepo.com/show/498946/cancel-circle.svg",
    class: "smallbtnimage",
    alt: "add Data Point",
  });
}*/
