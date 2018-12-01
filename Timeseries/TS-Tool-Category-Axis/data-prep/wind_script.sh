#!/bin/sh

awk -F"," 'BEGIN { OFS = "," } {$3=$2/100.0; print}' 4710-wind.csv > 4710-wind-speed.csv

<body>
    <div id="container" style="width: 600px;"></div>

    <script>
        var configFile = "../data-files/config1.json";


        var myChart;
        $.ajax({
            url: configFile,
            async: false,
            dataType: 'json',
            error: function(error){
                console.log('issue')
            },
            success: function(data){
                console.log(data)
                
                $(function(){
                    //read json configuration properties
                    Highcharts.setOptions(data.Properties);
                    
                    var chartA = document.createElement('div');
                    chartA.className = 'chart';
                    document.getElementById('container').appendChild(chartA);

                    var chartB = document.createElement('div');
                    chartB.className = 'chart';
                    document.getElementById('container').appendChild(chartB);

                    // jQuery command to get/read file from csv
                    $.get('data-prep/4710-wind.csv', function(csvData) {
                        myChart = Highcharts.chart(chartA, {
                            data: {
                                csv: csvData    // data to be plotted
                            }
                        });

                        //get the maximum date from highcharts to determine how many plotbands need to be made for sunrise data
                        //Note:  Currently assumes data is recorded within a single month
                        var maxDate = new Date(myChart.xAxis[0].getExtremes().max);

                        //perform the request for sunrise/sunset data
                        var day;
                        for (day = 1; day <= maxDate.getDate(); day++){

                            var sunrise = "https://api.sunrise-sunset.org/json?lat=40.036380&lng=-105.543600&date=2016-1-" + day + "&formatted=0";

                            $.ajax({
                                url: sunrise,
                                async: false,
                                dataType: 'json',
                                error: function(error){
                                    console.log('issue in json')
                                    //Add plot bands for day/night cycles (default 7am-7pm)
                                    myChart.xAxis[0].addPlotBand({
                                        from: Date.UTC(2016,0,day,7),
                                        to: Date.UTC(2016,0,day,19),
                                        color: '#FCFFC5'
                                    });  
                                },
                                success: function(data){
                                    if (data.status != "OK"){
                                        console.log('data.status is not OK')
                                        //Add plot bands for day/night cycles (default 7am-7pm)
                                        myChart.xAxis[0].addPlotBand({
                                            from: Date.UTC(2016,0,day,7),
                                            to: Date.UTC(2016,0,day,19),
                                            color: '#FCFFC5'
                                        });
                                    }
                                    else {
                                        console.log('data.status is OK')
                                        var mySunrise = data.results.sunrise.substring(
                                            data.results.sunrise.indexOf("T") + 1, 
                                            data.results.sunrise.indexOf("+")
                                        );

                                        var mySunset = data.results.sunset.substring(
                                            data.results.sunset.indexOf("T") + 1, 
                                            data.results.sunset.indexOf("+")
                                        );

                                        var startTimes = mySunrise.split(':')
                                        var endTimes = mySunset.split(':')

                                        myChart.xAxis[0].addPlotBand({
                                            from: Date.UTC(2016,0,day,startTimes[0],startTimes[1],startTimes[2]),
                                            to: Date.UTC(2016,0,day,endTimes[0],endTimes[1],endTimes[2]),
                                            color: '#FCFFC5'
                                        }); 
                                    }

                                }
                            })
                        }
                        //update properties that depend on data
                        myChart.update(data.Properties_1);
                    });

                    $.get('data-prep/4710-wind-speed.csv', function(csvData) {
                        Highcharts.chart(chartB, {
                            data: {
                                csv: csvData,    // data to be plotted
                                startColumn: 3
                            }
                        }).update(data.Properties_2);
                    });

                });
            }
        })

    </script>
    
</body>