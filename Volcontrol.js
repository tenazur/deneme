//Download dependencies
document.head.appendChild(Object.assign(document.createElement("script"),{src:"https://cdnjs.cloudflare.com/ajax/libs/regression/2.0.1/regression.js"}));
document.head.appendChild(Object.assign(document.createElement("script"),{src:"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.6.0/chart.min.js"}));

// Create a wrapper div and insert it before the mixer element
const $wrapper = $('<div>').insertBefore('#player > div > div.mixer.noselect');

// Create left and right divs and insert them into the wrapper
const $left = $('<div>').appendTo($wrapper);
const $right = $('<div>').appendTo($wrapper);

// Move the mixer element inside the left div
$('#player > div > div.mixer.noselect').appendTo($right);
// Add a new div for the volume control and insert it into the left div
const $volcontrol = $('<div>', {
  id: 'vcsection',
  class: 'nestedSection large',
  margin: '4px',
}).appendTo($left);

// Add CSS to display the left and right divs side by side
$wrapper.css({
  display: 'flex',
});

$left.css({
  flex: 1, // Make left div take up 1/2 of the wrapper
  margin: 'auto', // Align volcontrol to center
  'text-align': 'center', // Center content horizontally
  display: 'flex', // Use flexbox for left div
  alignItems: 'center',
  justifyContent: 'center',
});

$right.css({
  flex: 1, // Make right div take up 1/2 of the wrapper
  margin: 'auto', // Align mixer to center
  'text-align': 'center', // Center content horizontally
});

$volcontrol.css({
  flex: '0 1 content', // Allow volcontrol to expand horizontally with left div
  margin: 'auto',
  display: 'flex',
  'align-items': 'center',
});


////// slider settings /////

var calparams = {done:0};

const $calibslide = $('<div>', {
    class: 'calibslide',
    style: 'height: 100%; display: flex;',
    flexDirection: 'row',
}).appendTo('#vcsection');

$('<div>', {
class: 'slidewrapper',
style: 'margin: 5px; justify-content: center;',
}).appendTo($calibslide)

const $vslider = $('<div>', {
  id: 'slider',
  class: 'ui-slider ui-corner-all ui-slider-vertical ui-widget ui-widget-content',
  'aria-label': 'Volume',
  role: 'slider',
}).appendTo('.slidewrapper');

//input done button
const $inputWrapper = $('<div>', {
    class: 'input-wrapper',
    style: 'position: relative; height: '+$calibslide.height()+'px; width: '+$calibslide.height()+'px;',
}).appendTo($calibslide);


const $donebutton = $('<button>', {
class: 'btnLogo',
style: 'opacity: 0.3; margin: 2px; box-sizing: border-box; border: none; display: flex; max-width:'+$calibslide.height()+'px; background: transparent;',
}).appendTo($inputWrapper)

const $icon = $('<img>', {
    class: 'btnImg',
    src: 'https://www.svgrepo.com/show/457931/done-round.svg',
    alt: 'done icon',
    style: 'height: 100%; background: transparent; filter:invert(1)',
}).appendTo($donebutton);

$donebutton.hover(
    function() {
        $donebutton.css('opacity', '1');
        $icon.css('filter', 'invert(1) sepia(1) hue-rotate(75deg)');
    },
    function() {
        $donebutton.css('opacity', '0.3');
        $icon.css('filter', 'invert(1)');
    }
);

// slider part
$('<div>', {
  class: 'ui-slider-range ui-corner-all ui-widget-header ui-slider-range-min',
  style: 'height: 100%;',
}).appendTo($vslider);
$vslider.slider({
  orientation: 'vertical',
  range: 'min',
  min: 1,
  max: 100,
  step: 0.25,
  value: 100,
  slide: function (event, ui) {
    var sliderval = Math.pow($vslider.slider('value')/100,3)*100;
    masterGain.gain.value = sliderval/100;
  },
  stop: function (event, ui) {
    if (calparams['done'] === 0) {
        var sliderval = Math.pow($vslider.slider('value')/100,3)*100;
      getInput(sliderval, event, $vslider.slider('value'));
      return false;
    }

  },
  create: function(event, ui) {
      // get handle element
      var handle = $(this).children('.ui-slider-handle');
      // attach mouseover event to handle
      handle.on('mouseover', function(event) {
        var sliderval = Math.pow($vslider.slider('value')/100,3)*100;
        if (calparams['done'] === 0 && sliderval === 100 && typeof calparams['100'] === 'undefined') {
            if(context.state == 'suspended'){document.querySelector("#mute").click()};
            setPreset(0.18, 0.21, 0.24, 0.27, 0.3, 0.34, 0.38, 0.42, 0.46, 0.5, "White");
            var offset= 0.99-Math.max(...currentLevel)
            for (var i = 0; i < iNUMBERBANDS; ++i) {
              currentLevel[i] = Math.min(0.99, currentLevel[i] + offset);
              randomCounter = 0; //anim
              $("#s" + i).slider("value", currentLevel[i]);
            }
          getInput(sliderval, event, $vslider.slider('value'));
        }
      });
  }

});


function getInput(sliderval, event, uivalue) {
  msg('Enter dB for ' + Math.round(sliderval) + '% volume');
  // check if there's already an input box on the page
  if ($('#inputBox').length > 0) {
    return;
  }

  var $inputContainer = $('<div>', {
    class: 'input-container',
    id: 'db'+sliderval,
    alignItems: 'center',
    text: Math.round(sliderval) + '% ⇒ ',
  }).appendTo($inputWrapper);

  $inputContainer.css({
  position: 'absolute',
  top: ((100 - uivalue) / 100) * $calibslide.height() - $inputContainer.height()/2 + 'px',
  left: '5px',
  whiteSpace: 'nowrap',
});

  var inputBox = $('<input>', {
    type: 'integer',
    id: 'inputBox',
  }).css({
    width: '40px',
    height: 'auto',
    backgroundColor: 'white',
    paddingLeft: '2px',
    animation: 'blink-caret .75s step-end infinite'
  }).appendTo($inputContainer);

  inputBox.focus();

  function updateDbValue() {
    var dbv = parseInt(inputBox.val());
    if (isNaN(dbv)) {
      msg('Please enter a valid number for the dB value.');
      inputBox.focus();
    } else {
      calparams[sliderval] = dbv;
      inputBox.remove();
      $inputContainer.text(Math.round(sliderval) + '% ⇒ ' + dbv + ' dB');
    }
  }

  inputBox.on('keydown', function (event) {
    if (event.keyCode === 13) {
        $inputContainer
      updateDbValue();
    }
    if (event.keyCode === 27) {
        $inputContainer.remove();
        return false;
    }
  });


  inputBox.on('blur', function () {
    updateDbValue();
  });
}


