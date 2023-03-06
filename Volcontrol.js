//Download dependencies
document.head.appendChild(Object.assign(document.createElement("script"),{src:"https://cdnjs.cloudflare.com/ajax/libs/regression/2.0.1/regression.js"}));
document.head.appendChild(Object.assign(document.createElement("script"),{src:"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.6.0/chart.min.js"}));

var calparams = {done:0};


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

const $calibslide = $('<div>', {
    class: 'calibslide',
    style: 'height: 100%; display: flex;',
    flexDirection: 'row',
}).appendTo('#vcsection');

$('<div>', {
class: 'slidewrapper',
style: 'margin: 5px; justify-content: center;',
}).appendTo($calibslide)


////// slider settings /////
//slider functions
function sliderPower(sliderval){
    return (Math.pow(sliderval,3)/10000);
}
function sliderGain(sliderval) {
    return (Math.pow(sliderval/100,3));
}

// define sliderUpdate function
function sliderUpdate($slider, sliderval) {
    if (calparams['done'] == 1){
        handle.text(dbFromGain(sliderval));
    } else {
        handle.text(Math.round(sliderval));
    }
}

// slider part

const $vslider = $('<div>', {
  id: 'slider',
  class: 'ui-slider ui-corner-all ui-slider-vertical ui-widget ui-widget-content',
  'aria-label': 'Volume',
  role: 'slider',
}).appendTo('.slidewrapper');

$('<div>', {
  class: 'ui-slider-range ui-corner-all ui-widget-header ui-slider-range-min',
  style: 'height: 100%;',
}).appendTo($vslider);

//setting up handle
let handle ;

$vslider.slider({
  orientation: 'vertical',
  range: 'min',
  min: 1,
  max: 100,
  step: 0.25,
  value: 100,
  slide: function (event, ui) {
    var sliderval = sliderPower($vslider.slider('value'));
    masterGain.gain.value = sliderval/100;
    sliderUpdate($vslider, sliderval);
  },
  stop: function (event, ui) {
      sliderUpdate($vslider,sliderPower($vslider.slider('value')));
    if (calparams['done'] === 0) {
        var sliderval = sliderPower($vslider.slider('value'));
      getInput(sliderval, event, $vslider.slider('value'));
      return false;
    }

  },
  create: function(event, ui) {
      handle = $vslider.find('.ui-slider-handle');
      handle.text('100').css({'color': 'black', 'font-size': '10px', 'text-align': 'center'});
      // attach mouseover event to handle
      handle.on('mouseover', function(event) {
        var uivalue = $vslider.slider('value')
        var sliderval = sliderPower(uivalue);
        if (calparams['done'] === 0 && sliderval === 100 && typeof calparams['100'] === 'undefined') {
            if(context.state == 'suspended'){
                document.querySelector("#mute").focus();
                document.querySelector("#mute").click();
                setPreset(0.18, 0.21, 0.24, 0.27, 0.3, 0.34, 0.38, 0.42, 0.46, 0.5, "White");
                var offset= 0.99-Math.max(...currentLevel)
                for (var i = 0; i < iNUMBERBANDS; ++i) {
                    currentLevel[i] = Math.min(0.99, currentLevel[i] + offset);
                    randomCounter = 0; //anim
                    $("#s" + i).slider("value", currentLevel[i]);
                }
            }
                getInput(sliderval, event, uivalue);
        }
      });
  }

});

$('#inputSlider').on('input', function() {
  const val = $(this).val();
  if ($vslider.data('uiSlider')) { // check if slider has been initialized
        $vslider.slider('value', val);
        sliderUpdate(val);
  }
});


///////calibration inputbox//////

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
  });

  $inputContainer.css({
  position: 'absolute',
  left: '5px',
  whiteSpace: 'nowrap',
}).appendTo($inputWrapper);
$inputContainer.css({top: ((100 - uivalue) / 100) * $inputWrapper.height() - $inputContainer.height()/2 +'px',})
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

  $.when($.get('#s9')).done(inputBox.focus());

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
        $icon.css('height','100%')
    },
    function() {
        $donebutton.css('opacity', '0.3');
        $icon.css('filter', 'invert(1)');
    }
);

$donebutton.on('mousedown', function(){
    $icon.css('filter', 'invert(1) sepia(1) hue-rotate(280deg)');
    $icon.css('padding','10%')
    if (Object.keys(calparams).length > 4 ){
        calibrationstart();
    }else{
        msg('Daha fazla kalibrasyon değeri giriniz');
    }
});
$donebutton.on('mouseup', function(){
    $icon.css('filter', 'invert(1) sepia(1) hue-rotate(75deg)');
    $icon.css('padding','6px')
});


///calibration funvtions

function calibrationstart() {
        const pairsArray = Object.entries(calparams)
      .filter(([key]) => key !== "done")
      .map(([key, value]) => [parseFloat(key)/100, parseInt(value)]);


    const logarithmicc = regression.logarithmic(pairsArray,{presicion:5});
    const powerc = regression.power(pairsArray,{ precision:5});
    calibsec (logarithmicc,powerc);
}

function calibsec (logarithmicc,powerc) {
    const $dialog = $('<div>', {
      id: 'calibdialog',
      class: 'nestedSection large',
      margin: '4px',
      style: 'z-index: 999999 ;position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-image: linear-gradient(to bottom, rgba(20,23,26,0.8) 40%, #080808 80%);'
    }).appendTo('body');

    $('<h1>',{
        text: 'Calibrasyon Değerleri'
    }).appendTo($dialog);

    $('<p>',{
        html: "Varsayılan Gainden Db hesaplama Formülü:<b><br> Db = MaxDb + 20* log(Gain)</b> <br> 20 katsayısı 16-30 arasında değişebiliyor bu değişim ses sisteminin gücü ortamın büyüklüğünden etkilenebiliyor."
    }).appendTo($dialog);

    // Sçenekeleri Göster
    const $radiosWrapper = $('<div>', {
      class: 'radios-wrapper',
    }).appendTo($dialog);

    // Define the radio options as an array of objects
    const radioOptions = [
      { value: ['L',calparams[100],24, "?"] , label: "y= "+calparams[100] + "+ 24*log(x)" },
      { value: ['L',logarithmicc.equation[0], parseFloat(Math.log(10) *logarithmicc.equation[1]).toFixed(4), logarithmicc.r2], label: "y= "+logarithmicc.equation[0] + "+ "+  parseFloat(Math.log(10) *logarithmicc.equation[1]).toFixed(4) +"*log(x)" },
      { value: ['P',powerc.equation[0],powerc.equation[1],powerc.r2], label: powerc.string }
    ];

    // Loop through the radio options and create a div with a label and radio button for each
    radioOptions.forEach(option => {
      const $radioWrapper = $('<h1>', {
          text: option.label,
      }).appendTo($radiosWrapper);


        const $radioButton = $('<input>', {
          type: 'radio',
          id: option.value,
          name: 'radio-group',
          value: option.value,
      }).prependTo($radioWrapper).css({
          'transform': 'scale(1.5)', // Increase radio button size by 50%
          'margin-right': '8px', // Add spacing between radio button and label
          'margin-left': '4px'
        });

      const $radioLabel = $('<label>', {
        text: option.label,
        for: option.value,
    }).appendTo($radioButton);

        $('<span>',{
        html: "R<sup>2</sup> = " + option.value[3],
        style: 'float:right;'
    }).appendTo($radioWrapper);

    });

    // Add confirm button
    const $confirmButton = $('<button>', {
      text: 'Confirm',
    }).appendTo($dialog);

    // Add event listener to confirm button
    $confirmButton.on('click', () => {
      const selectedOption = $('input[name="radio-group"]:checked').val().split(',');
      $dialog.remove();
      console.log(selectedOption);
      calparams["done"]=1;
      calparams["eq"]=selectedOption;
      return(selectedOption);

    });
}
