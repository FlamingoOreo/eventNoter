const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn")
const timerDisplay = document.getElementById("timer");
let startTime;
let timerInterval;
let active = false;


function startTimer(quickNote, quickCategory) {
    if(active) return
    if(quickNote && quickCategory){
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
        startBtn.setAttribute("disabled",true);
        stopBtn.removeAttribute("disabled");
        active = true;
        createNewEvent(quickNote, quickCategory);
    }     else{
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
            startBtn.setAttribute("disabled",true);
            stopBtn.removeAttribute("disabled");
            active = true;
            createNewEvent();
        }
    }
$("#startBtn").click(function() {
        startTimer();
    });
stopBtn.addEventListener('click',function(){
    clearInterval(timerInterval);
    timerDisplay.innerHTML = "Total Log Time:";
    startBtn.removeAttribute("disabled");
    stopBtn.setAttribute("disabled",true)
    stopEvent()
})
function pad(num) {
    return num < 10 ? '0' + num : num;
    }
function padMilliseconds(num) {
    return num < 100 ? '0' + (num < 10 ? '0' + num : num) : num;
    }
function createNewEvent(quickNote, quickCategory){
    if(quickNote && quickCategory){
        $("#dashboard tbody").prepend(`<tr><td>Awaiting time...</td><td class="displayText">${quickNote}
        </td><td class="displayText">${quickCategory}
        </td></tr>`);
    }else{
        $("#dashboard tbody").prepend(`<tr><td>Awaiting time...</td><td><input type="text" placeholder="Enter Event Notes">
    </td><td><input type="text" placeholder="Enter Event Category">
    </td></tr>`);
    }

}

function stopEvent() {
    active = false;
    const newestRow = $("#dashboard tbody tr:first-child");
    const elapsedTime = Date.now() - startTime;
    const elapsedSeconds = Math.floor(elapsedTime / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    newestRow.find("td").first().html(`Total Time taken: ${elapsedHours.toString().padStart(2, '0')}:${(elapsedMinutes % 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}<br>Date: ${new Date().toLocaleString().replace(",", "")}`);
    newestRow.append(`<td><button class="deleteBtn btn btn-danger">X</button></td>`)
    newestRow.find("td input[type='text']").replaceWith(function() {
        return $("<div>", {
            html: $(this).val(),
            class: "displayText"
        });
    });
    $(".deleteBtn").click(function(){
        $(this).closest("tr").remove();
    });
}

$(document).ready(function() {
    var editMode = false;
    $("#quickBoard tbody tr").click(function() {
        var quickNote = $(this).find("td:first-child").text();
        var quickCategory = $(this).find("td:last-child").text();
        startTimer(quickNote,quickCategory)
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
    link.href = "data:text/csv," + encodeURI(csv);
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
        
              var parts = timestamp.split("Date:");
              var totalTime = parts[0];
              var date = "Date: " + parts[1];
        
              $("#dashboard tbody").prepend(`<tr><td>${totalTime}<br>${date}</td><td class="displayText">${note}
              </td><td class="displayText">${category}
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
    if (!window.isTimerRunning) {
      startBtn.click();
      window.isTimerRunning = true;
    } else {
      clearInterval(timerInterval);
      timerDisplay.innerHTML = "Total Log Time:";
      startBtn.removeAttribute("disabled");
      stopBtn.setAttribute("disabled",true)
      stopEvent()
      window.isTimerRunning = false;
    }
  }

  if(event.target.tagName === "INPUT"){
    if(event.code === "Enter"){
      clearInterval(timerInterval);
      timerDisplay.innerHTML = "Total Log Time:";
      startBtn.removeAttribute("disabled");
      stopBtn.setAttribute("disabled",true)
      stopEvent()
      window.isTimerRunning = false;
    }
  }
    index = parseInt(event.code.replace("Digit", ""));
    let tableRow = $("#quickBoard tbody tr:eq(" + index + ")");
    tableRow.click();
});

  window.addEventListener("load", LoadCurrentTime);
  