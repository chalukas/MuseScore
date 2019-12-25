// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

var ctx;
var keys = {
  0: "C",
  1: "C#/D♭",
  2: "D",
  3: "D#/E♭",
  4: "E",
  5: "F",
  6: "F#/G♭",
  7: "G",
  8: "G#/A♭",
  9: "A",
  10: "A#/B♭",
  11: "B"
  
}
function resetCanvas() {
  $('#features-chart').remove(); // this is my <canvas> element
  $('#features-chart-container').append('<canvas id="features-chart"><canvas>');
  ctx = document.querySelector('#features-chart');
};

function getFeatures(id) {

var modes = {
  0: "minor",
  1: "Major"
}

  let query = '/features?id=' + id;
  
  $.get(query, function(data) {
    //let labels = ["keys", "tempo", "time signature"];
    var key = data["key"];
    var tempo = data["tempo"];
    var mode = data["mode"];
    var time_signature = data["time_signature"];
    
  document.getElementById("key").innerHTML = "Key: " + keys[key] + " " + modes[mode];
  document.getElementById("tempo").innerHTML = "Tempo: " + tempo + " BPM";
  document.getElementById("time_sign").innerHTML = "Time Signature: " + time_signature + " beats per measure";
    
  });
}

function getAnalysis(id) {
  
  resetCanvas();

  let a_query = '/analysis?id=' + id;

  $.get(a_query, function(data) {
    
    console.log(data)
    
    let max_labels = [];
    let max1_indices = [];
    let max1_values = [];
    let max2_indices = [];
    let max2_values = [];
    let max3_indices = [];
    let max3_values = [];
    let duration = [];
    
    var feature = data["segments"];

    for (var i = 0; i < 50; i++) {
      max_labels.push(i);
      let seg_list = feature[i]["pitches"];
      var max1_index = seg_list.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      max1_indices.push(max1_index);
      max1_values.push(seg_list[max1_index]);
      seg_list[max1_index] = 0;
      var max2_index = seg_list.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      max2_indices.push(max2_index);
      max2_values.push(seg_list[max2_index]);
      seg_list[max2_index] = 0;
      var max3_index = seg_list.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      max3_indices.push(max3_index);
      max3_values.push(seg_list[max3_index]);
    }
    
    let bubble_data1 = []
    let bubble_data2 = []
  
    var k = 15;
    for (var i = 0; i < max_labels.length; i++) {
      var dict = {};
      dict.x = i;
      dict.y = max1_indices[i];
      dict.r = Math.sqrt(max1_values[i]) * k;
      bubble_data1.push(dict);
    }
    
    for (var i = 0; i < max_labels.length; i++) {
      var dict = {};
      dict.x = i;
      dict.y = max2_indices[i];
      dict.r = Math.sqrt(max2_values[i]) * k;
      bubble_data2.push(dict);
    }
    
    for (var i = 0; i < max_labels.length; i++) {
      var dict = {};
      dict.x = i;
      dict.y = max3_indices[i];
      dict.r = Math.sqrt(max3_values[i]) * k;
      bubble_data2.push(dict);
    }
    
    var options = {responsive: true, // Instruct chart js to respond nicely.
      };
    
    var myChart = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
                label: "Leading Notes",
                data: bubble_data1, // Specify the data values array
                borderColor: '#4e7eef', // Add custom color border            
                backgroundColor: '#6e96f2', // Add custom color background (Points and Fill)
            }, {
                label: "Accompanying Notes",
                data: bubble_data2, 
                borderColor: '#eb9e24',            
                backgroundColor: '#efb557', 
            }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {     
            
                callback: function(value, index, values) {
                    // for a value (tick) equals to 8
                    return keys[value];
                    // 'junior-dev' will be returned instead and displayed on your chart
                }
            }
          }]
        }
    }
  });
});
}
    /*
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: max_labels,
        datasets: [{
            label: "max1",
            type: "bar",
            borderColor: "#000000",
            data: max1_values,
          }, {
            label: "max2",
            type: "bar",
            borderColor: "#3e95cd",
            data: max2_values,
          }, {
            label: "max3",
            type: "bar",
            borderColor: "#8e5ea2",
            data: max3_values,
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Top Three Notes in the Segments'
        },
        legend: { display: false }
      }
    });
  });
}
*/
        
$(function() {
  //console.log('hello world :o');
  
  let trackID = '';
  let searchQuery = '';
  let resultIDs = [];
  
  $('form').submit(function(event) {
    
    event.preventDefault();
    
    searchQuery = '/search?query=' + $('input').val();
    
    $.get(searchQuery, function(data) {
      
      $('#results').empty();

    
      data.tracks.items.forEach(function(track, index) {
        resultIDs.push(track.id);
        let newEl1 = $('<p class="text-salmon"></p>').text(track.name + '   |   ' + track.artists[0].name);
        let newEl2 = $('<li class="text-salmon" onClick="getFeatures(&apos;' + track.id + '&apos;)"></li>').text('Basic Track Overview');
        let newEl3 = $('<li class="text-salmon" onClick="getAnalysis(&apos;' + track.id + '&apos;)"></li>').text('Chord Progressions');
        $('#results').append(newEl1);
        $('#results').append(newEl2);
        $('#results').append(newEl3);
        
      }); 
      
    });
    
  });

});
