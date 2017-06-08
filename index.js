
	var forcastUrl = "http://api.openweathermap.org/data/2.5/forecast?q=Bangalore,IN&appid=558a0ba97dde6871d8bc86e77a6e3993";
	//var weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=Bangalore,IN&appid=558a0ba97dde6871d8bc86e77a6e3993";


	// utility functions

	function convertUTCDateToLocalDate(ts) {
		return new Date(ts*1000);
	}

	function toCelciusFromKelvin(temp){
		return (temp - 273.15).toFixed(2);
	}

	function deepCloneArray(arr){
		var clonedArray = JSON.parse(JSON.stringify(arr));
		return clonedArray;
	}

	function tempComparator(a, b){
		return (a.main.temp - b.main.temp);
	}

	function extractTimeFromDateString(dateStr){
		return dateStr.substring(dateStr.indexOf(" "), dateStr.lastIndexOf(":"));
	}


	// error response
	function noDataAvailable(){
		resetValues();
		alert('No data available !');
	}

	// success response
	function populateTodaysData(data){

		var duration = 3;	// api
		var totalHours = 24;
		var totalInterval = totalHours / duration;
		var list = deepCloneArray(data.list.slice(0, totalInterval));

		for (var i = 0, len = list.length; i < len; i++) {
			list[i].main.temp = toCelciusFromKelvin(list[i].main.temp);
		}

		var unsorted = deepCloneArray(list);

		list.sort(tempComparator);

		var minTemp = (list[0].main.temp) + " &#8451;";
		var maxTemp = (list[totalInterval - 1].main.temp) + " &#8451;";
		var minTempTime  = list[0].dt_txt;
		var maxTempTime  = list[totalInterval - 1].dt_txt;

		setValues(minTemp, maxTemp, minTempTime, maxTempTime);

		return unsorted;
	}

	function resetValues(){
		setValues("-", "-", "-", "-");
	}

	function setValues(minTemp, maxTemp, minTempTime, maxTempTime){
		document.getElementById('minTemp').innerHTML = minTemp;
		document.getElementById('maxTemp').innerHTML = maxTemp;
		document.getElementById('minTempTime').innerHTML = minTempTime;
		document.getElementById('maxTempTime').innerHTML = maxTempTime;
	}

	function constructTable(list){

		var unsorted = deepCloneArray(list);
		var date =  list[0].dt_txt;
		var th = "<th>"+ date.substring(0, date.indexOf(" ")).split("-").reverse().join("-"); +"</th>";
		var td="<td> Temp (Sorted) </td>";

		list.sort(tempComparator);

		for (var i = 0, len = list.length; i < len; i++) {
			th += "<th>" + extractTimeFromDateString(list[i].dt_txt) + "</th>";
			td += "<td>" + (list[i].main.temp) + " &#8451; </td>";
		}

		document.getElementById('tempListHour').innerHTML =(th);
		document.getElementById('tempListValue').innerHTML =(td);

		return unsorted;
	}

	function constructGraph(list){

		var dataPoints = [];
		// convert time to integer for plot

		for(var i=0, n = list.length; i< n; i++){
			list[i].dt_txt = parseInt(extractTimeFromDateString(list[i].dt_txt));
		}

		list.sort(function(a, b){
		   return a.dt_txt - b.dt_txt;
		});

		for(var i=0, n = list.length; i< n; i++){
			// X : temp
			// Y : time
			var temp = [];
			temp.push(list[i].main.temp);
			temp.push(list[i].dt_txt);

			dataPoints.push(temp);
		}

		console.log(dataPoints);

		var dataPlot = {
				label : "&nbsp; X : Temp (Cel) <br>&nbsp; Y : Time (Hrs) ",
				data : dataPoints,
				color : "green",
				hoverable : true
		};

		var options = {
		    series: {
		        lines: { show: true },
		        points: { show: true }
		    }
		};

		$.plot($("#temperatureGraph"), [dataPlot], options);

	}


	// Driver function
	function requestTodaysData(){

		resetValues();
		var xhttpreq = new XMLHttpRequest();

		xhttpreq.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		    	result = JSON.parse(this.responseText);
		    	if(result !== null && typeof result === 'object'){
					 if(result.cod == 401){
						 noDataAvailable();
					 }
					 else{
						 var list = populateTodaysData(result);
						 list = constructTable(list);
						 constructGraph(list);
					 }
				 }else{
					 noDataAvailable();
				 }
		    }
		  };

		  xhttpreq.open("GET", forcastUrl, true);
		  xhttpreq.send();

	}
