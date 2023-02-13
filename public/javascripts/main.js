const timerDisplay = document.getElementById("timer");
let startTime;
let timerInterval;
let active = false;

const toggleBtn = document.getElementById("toggleBtn");

function startTimer() {
    if (active) return;
        startTime = Date.now();
        timerDisplay.style.display = "block";
        timerInterval = setInterval(function() {
            const elapsedTime = Date.now() - startTime;
            const elapsedSeconds = Math.floor(elapsedTime / 1000);
            const elapsedMinutes = Math.floor(elapsedSeconds / 60);
            const elapsedHours = Math.floor(elapsedMinutes / 60);
            const elapsedMilliseconds = elapsedTime % 1000;
            timerDisplay.innerHTML = `Total Log Time: ${pad(elapsedHours)}:${pad(elapsedMinutes % 60)}:${pad(elapsedSeconds % 60)}.${padMilliseconds(elapsedMilliseconds)}`;
        }, 1);
        toggleBtn.innerHTML = "Stop";
        $("#eventBtn").removeAttr("disabled")
        active = true;
    }

function stopTimer() {
    clearInterval(timerInterval);
    timerDisplay.innerHTML = "Total Log Time:";
    toggleBtn.innerHTML = "Start";
    active = false;
    const eventBtn = document.getElementById("eventBtn")
    eventBtn.setAttribute("disabled",true)
}

toggleBtn.addEventListener("click", function() {
    if (active) {
        stopTimer();
    } else {
        startTimer();
    }
});

function pad(num) {
    return num < 10 ? '0' + num : num;
    }
function padMilliseconds(num) {
    return num < 100 ? '0' + (num < 10 ? '0' + num : num) : num;
    }

let event
function createNewEvent(quickNote, quickCategory){
    const currentdate = new Date(); 
    const elapsedTime = Date.now() - startTime;
    const elapsedSeconds = Math.floor(elapsedTime / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if(!active) return
    if(quickNote && quickCategory){
      $("#dashboard tbody").append(`<tr><td>Total Time taken: ${elapsedHours.toString().padStart(2, '0')}:${(elapsedMinutes % 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')} <br> At time: ${currentdate.getHours()}:${pad(currentdate.getMinutes())}:${pad(currentdate.getSeconds())} </td><td contenteditable='true'>${quickNote}
      </td><td contenteditable='true'>${quickCategory}
      </td><td><button class="deleteBtn btn btn-danger">X</button></td></tr>`);
    }else{
        $("#dashboard tbody").append(`<tr><td>Total Time taken: ${elapsedHours.toString().padStart(2, '0')}:${(elapsedMinutes % 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}<br> At time: ${currentdate.getHours()}:${pad(currentdate.getMinutes())}:${pad(currentdate.getSeconds())}</td><td contenteditable='true'><td contenteditable='true'>
    </td><td><button class="deleteBtn btn btn-danger">X</button></td></tr>`);
    }
    $(".deleteBtn").click(function(){
        $(this).closest("tr").remove();
    });

}


$(document).ready(function() {
    var editMode = false;
    $("#quickBoard tbody tr").click(function() {
        var quickNote = $(this).find("td:first-child").text();
        var quickCategory = $(this).find("td:last-child").text();
        createNewEvent(quickNote,quickCategory)
      });
    $("#editBtn").click(function() {
      if (!editMode) {
        $("#quickBoard td").attr("contenteditable", "true");
        $("#quickBoard td").css("background-color", "lightblue");
        $(this).text("Save");
        $("#saveBtn").removeAttr("disabled");
        $("#quickBoard tbody tr").off("click");
        editMode = true;
      } else {
        $("#quickBoard td").removeAttr("contenteditable");
        $("#quickBoard td").css("background-color", "inherit");
        $(this).text("Edit list");
        $("#saveBtn").attr("disabled", "true");
        var updatedData = [];
        $("#quickBoard tbody tr").each(function() {
          var quickNote = $(this).find("td:first-child").text();
          var quickCategory = $(this).find("td:last-child").text();
          updatedData.push({ note: quickNote, category: quickCategory });
        });
        $.ajax({
            type: "POST",
            url: "/",
            data: JSON.stringify({ data: updatedData }),
            contentType: 'application/json',
            success: function(response) {
              console.log(response);
            },
            error: function(error) {
              console.error(error);
            }
          });
  
        editMode = false;

        $("#quickBoard tbody tr").click(function() {
          var quickNote = $(this).find("td:first-child").text();
          var quickCategory = $(this).find("td:last-child").text();
            startTimer(quickNote, quickCategory);
        });
      }
    });
});
$("#exportBtn").click(function () {
    var csv = "Timestamp:,Note:,Category:";
    $("#dashboardTable tr").each(function () {
      var timestamp = $(this).find("td").first().text();
      var note = $(this).find("td").eq(1).text().replace(/(\r\n|\n|\r)/gm, "");
      var category = $(this).find("td").eq(2).text().replace(/(\r\n|\n|\r)/gm, "");
      csv += timestamp + "," + note + "," + category + "\n";
    });
    var link = document.createElement("a");
    link.download = "events.csv";
    link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    link.click();
  });

  $("#importBtn").click(function () {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = function (e) {
        var file = e.target.files[0];
        var formData = new FormData();
        formData.append("file", file);
        $.ajax({
          url: '/import',
          method: "POST",
          data: formData,
          contentType: false,
          processData: false,
          success: function (data) {
            var lines = data.split("\n");
            for (var i = 1; i < lines.length -1; i++) {
              var cells = lines[i].split(",");
              var timestamp = cells[0];
              var note = cells[1];
              var category = cells[2];
              var parts = timestamp.split("At");
              var totalTime = parts[0];
              var date = "At " + parts[1];
              $("#dashboard tbody").append(`<tr><td>${totalTime}<br>${date}</td><td contenteditable='true'>${note}
      </td><td contenteditable='true'>${category}
      </td><td><button class="deleteBtn btn btn-danger">X</button></td></tr>`);
        
              $(".deleteBtn").click(function(){
                $(this).closest("tr").remove();
              });
            }
          }
        });
        
    };
    input.click();
});

$("#saveBtn").click(function () {
  var data = [];
  $("#dashboardTable tbody tr").each(function () {
    var timestamp = $(this).find("td:first").text();
    var note = $(this).find("td:nth-child(2)").text().trim();
    var category = $(this).find("td:nth-child(3)").text().trim();
    data.push({ timestamp, note, category });
  });
  $.ajax({
    url: "/save",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (response) {
      console.log("Data saved successfully!", response);
    },
    error: function (error) {
      console.error("Error saving data:", error);
    },
  });
});


function LoadCurrentTime() {
    const currentTimeDisplay = document.getElementById("localTime");
     setInterval(() => {
      currentTimeDisplay.innerHTML = `Current Time (local): ${new Date().toLocaleString()}`;
    }, 1000);
  }


document.addEventListener("keydown", function(event) {
  if(event.target.tagName === "TEXTAREA" || event.target.tagName === "TD") return;
  if (event.code === "Space" && event.target.tagName != "INPUT" || event.code === "Enter" && event.target.tagName != "INPUT") {
    event.preventDefault();
    toggleBtn.click();
  }
  if (event.ctrlKey && event.key === "e") {
    event.preventDefault();
    createNewEvent()
  }
    index = parseInt(event.code.replace("Digit", "")-1);
    let tableRow = $("#quickBoard tbody tr:eq(" + index + ")");
    tableRow.click();
});
  window.addEventListener("load", LoadCurrentTime);
  