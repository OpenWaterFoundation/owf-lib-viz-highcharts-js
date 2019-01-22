import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { DataLayerService } from './data-layer.service';
import { StationDetailsService } from './station-details.service';
import { getSymbolIterator } from 'rxjs/internal/symbol/iterator';

// this allows access to jquery references such as $("body")
declare var $;
declare var require: any;
const Highcharts = require('highcharts');


@Component({
	selector: 'station-dashboard-component',
	templateUrl: 'station-dashboard.component.html',
	styleUrls: ['station-dashboard.component.css'],
	providers: [StationDetailsService]
})
export class StationDashboardComponent implements OnInit, AfterContentInit {
	dataLayerService: DataLayerService;
	stationID: string;
	stationList = [];
	stationNovaScores = [];
	currentStation = { stationName: '', stationElevation: '' };
	tzName = '';

	periodOfRecordList = [
		{ label: '1 week', value: '7' },
		{ label: '1 month', value: '30' },
		{ label: '3 months', value: '90' },
		{ label: '6 months', value: '180' },
		{ label: '1 year', value: '365' },
		{ label: '10 years', value: '3650' }];

	// stationTSArray defines the graph content as well as issues concerning novascore, including
	// the pulldown station list,
	stationTSArray: any[] = [
	{
		dataType: 'Precip-Total',	// used in graph
		color: 'cyan',			// used in graph
		chartType: 'column', 		// used in graph
		stationDataType: 'Precip',	// used for novascore
		statisticType: 'Total',		// used for novascore
		duration: '1Hour'		// used for novascore
	},
	{
		dataType: 'WaterLevelRiver',
		color: 'blue',
		chartType: 'line',
		stationDataType: 'WaterLevelRiver',
		statisticType: 'Max',
		duration: '1Day'
	},
	{
		dataType: 'DischargeRiver',
		color: 'blue',
		chartType: 'line',
		stationDataType: 'DischargeRiver',
		statisticType: 'Last',
		duration: '1Day'
	},
	{
		dataType: 'VoltageBattery',
		color: 'yellow',
		chartType: 'column',
		stationDataType: 'VoltageBattery',
		statisticType: 'Max',
		duration: '1Hour'
	},
	{
		dataType: 'WindSpeed',
		color: 'olive',
		chartType: 'line',
		stationDataType: 'WindSpeed',
		statisticType: 'Max',
		duration: '1Hour'
	}];

	constructor(dataLayerService: DataLayerService,
		private stationDetailsService: StationDetailsService,
		private route: ActivatedRoute ) {
		this.dataLayerService = dataLayerService;
	}

	ngOnInit() {
		console.log('in ngOnInit');
		// let id = +this.routeParams.get('id');  // this id is a number
		this.route.params.forEach((params: Params) => {
			this.stationID = params['id'];  // this stationID is a string
		});
		// console.log(this.stationID);

		// fill the pulldown with the id and name of the available stations
		this.populateStationSelection();

		// this allows the x-axis and tooltip to display the date in the local browser time zone
		Highcharts.setOptions({
			global: {
				useUTC: false
			}
		});

		// set the local time zone string
		const d = new Date();
		this.tzName = d.toLocaleString('en', {timeZoneName: 'short'}).split(' ').pop();
		console.log(this.tzName);

		this.displayGraphsForStationID();
		this.bindMouseEvents();


	}

	ngAfterContentInit() {
	}

	bindMouseEvents() {
		/**  http://www.highcharts.com/demo/synchronized-charts
		 * In order to synchronize tooltips and crosshairs, override the
		 * built-in events with handlers defined on the parent element.
		 *
		 * see https://stackoverflow.com/questions/11966286/highcharts-tooltip-always-on-right-side-of-cursor
		 */
		$('#container').bind('mousemove touchmove touchstart', function (e) {
			let chart,
				point,
				i,
				event;

			for (i = 0; i < Highcharts.charts.length; i = i + 1) {
				chart = Highcharts.charts[i];
				event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
				point = chart.series[0].searchPoint(event, true); // Get the hovered point

				if (point) {
					point.highlight(e);
				}
			}
		});
		/**
		 * Override the reset function, we don't need to hide the tooltips and crosshairs.
		 */
		Highcharts.Pointer.prototype.reset = function () {
			return undefined;
		};

		/**
		 * Highlight a point by showing tooltip, setting hover state and draw crosshair
		 */
		Highcharts.Point.prototype.highlight = function (event) {
			this.onMouseOver(); // Show the hover marker
			this.series.chart.tooltip.refresh(this); // Show the tooltip
			this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
		};
		/* */
	}

	// Displays graphs for a given station id.  Also calls
	displayGraphsForStationID () {
		// -999 is used when there is no stationID yet - no graphs to display
		if ( this.stationID === '-999' ) {
			return;
		}

		this.displayStationInformation ();

		const filename = 'stationSummaries_' + this.stationID + '.json';
		this.stationDetailsService.getStationDetails(filename)
			.subscribe (
				tsfile => {
					// console.log(tsfile);

					// first get all the ts data
					let lastGraphFound = false;

					for ( let i = this.stationTSArray.length - 1; i >= 0; i-- ) {
						// tsfile.stationSummaries[0] always works because there is only 1 station in each ts file
						this.stationTSArray[i].ts = tsfile.stationSummaries[0].ts.filter(
							currentTS => currentTS.dataType === this.stationTSArray[i].dataType)[0];
						this.stationTSArray[i].showXAxisLabels = false;

						// If this is wind speed, grab wind direction now as well
						if ( this.stationTSArray[i].dataType === 'WindSpeed') {
							this.stationTSArray[i]['WindDir'] = tsfile.stationSummaries[0].ts.filter(
								currentTS => currentTS.dataType === 'WindDir');
							// console.log(this.stationTSArray[i]);
						}

						// figure out which graph is the last one to have data.  This is the one that will show the x-axis
						if ( this.stationTSArray[i].ts != null && !lastGraphFound ) {
							this.stationTSArray[i].showXAxisLabels = true;
							lastGraphFound = true;
							console.log('Last graph is ' + i);
						}
					}

					// data has been gathered, now build the graphs
					this.displayStationTimeSeries ( tsfile );

				},
				error => console.log (error)
			);

	}

	getWindSymbol ( date, windDirArray ) {
		const windDirArraySingle = windDirArray[0].data.filter( windDir => windDir.dt === date);
		if ( windDirArraySingle == null || windDirArraySingle.length === 0 ) {
			console.log( 'Unable to find wind direction for ' + date );
			return 'url(assets/images/arrows/arrow2-N.png)';
		}

		const windDir = windDirArraySingle[0].v;

		if ( windDir >= 22.5 && windDir <= 67.5 ) {
			return 'url(assets/images/arrows/arrow2-NE.png)';
		} else if ( windDir > 67.5 && windDir <= 112.5 ) {
			return 'url(assets/images/arrows/arrow2-E.png)';
		} else if ( windDir > 112.5 && windDir <= 157.5 ) {
			return 'url(assets/images/arrows/arrow2-SE.png)';
		} else if ( windDir > 157.5 && windDir <= 202.5 ) {
			return 'url(assets/images/arrows/arrow2-S.png)';
		} else if ( windDir > 202.5 && windDir <= 247.5 ) {
			return 'url(assets/images/arrows/arrow2-SW.png)';
		} else if ( windDir > 247.5 && windDir <= 292.5 ) {
			return 'url(assets/images/arrows/arrow2-W.png)';
		} else if ( windDir > 292.5 && windDir <= 337.5 ) {
			return 'url(assets/images/arrows/arrow2-NW.png)';
		} else {
			return 'url(assets/images/arrows/arrow2-N.png)';
		}
	}

	// displayStationTimeSeries
	displayStationTimeSeries ( tsfile: any ) {
		// console.log(tsfile);

		// get the time series
		for ( let i = 0; i < this.stationTSArray.length; i++ ) {

			const dataType = this.stationTSArray[i].dataType;
			const ts = this.stationTSArray[i].ts;
			if ( ts != null ) {
				const seriesArray = [];
				const annotationArray = [];
				const color = this.stationTSArray[i].color;
				const chartType = this.stationTSArray[i].chartType;
				const units = ts.units;

				// create the yAxisLabel, which is also the legend
				// show the data type and then data interval (unless it includes the word irreg)
				const yAxisLabel = dataType + (( ts.dataInterval.toUpperCase().includes('IRREG')) ? ''  : ('.' + ts.dataInterval));
				const showXAxisLabels = this.stationTSArray[i].showXAxisLabels;
				const lineColor = ( showXAxisLabels ) ? '#ccd6eb' : 'transparent';
				const tickLength = ( showXAxisLabels ) ? 10 : 0;

				const isPrecip = dataType.toUpperCase().includes('PRECIP') ? true : false;  // precip should be displayed from the top of the graph

				// data
				/* This was acceptable when specifying only x and y but not adequate now that sybol is also specified.
				const tsData = ts.data.map(function(obj) {
					const newArray = [];
					//  no processing of time zones necessary because Highcharts.setOptions{global-useUTC} handles internally

					const localDate = new Date(Date.parse(obj.dt));
					newArray.push(localDate.valueOf());

					// value (y axis)
					newArray.push(obj.v);
					// console.log(newArray);
					return newArray;
				});*/

				const tsData = [];
				ts.data.forEach(element => {
					const newObj = {};
					newObj['x'] = (new Date(Date.parse(element.dt))).valueOf();
					newObj['y'] = element.v;

					if ( dataType === 'WindSpeed') {
						newObj['marker'] = {
							'symbol': this.getWindSymbol(element.dt, this.stationTSArray[i]['WindDir']),
							'enabled': true
						};
					} else {
						newObj['marker'] = {
							'enabled': false
						};
					}
					tsData.push(newObj);
				}, this);

				// alarm triggers
				// this is cheesy, only for stage and only for type=upper - improve when precip alarms gets added by making more abstract
				let alarmTrigger = null;
				if ( dataType === 'WaterLevelRiver' ) {
					const dataTypesInfo = tsfile.stationSummaries[0].dataTypes.filter(currentTS => currentTS.name === dataType)[0];
					if ( dataTypesInfo != null ) {
						const alarmTriggerIds = dataTypesInfo.alarmTriggerIds;
						// console.log(alarmTriggerIds);
						alarmTriggerIds.forEach(function(element) {
							const tmpAlarmTrigger = tsfile.alarmTriggers.filter(currentAlarm => currentAlarm.id === element)[0];
							if ( tmpAlarmTrigger.type === 'upper' ) {
								alarmTrigger = tmpAlarmTrigger;
							}
						});
					}
				}


				seriesArray.push (
				{
					data: tsData,
					name: yAxisLabel,  // displays data type in the legend
					type: chartType, // defaults to line but we could use "area", etc.
					color: color,
					fillOpacity: 0.3,
					/*
					marker: {
						enabled: markerEnabled,
						// symbol: 'triangle'  // this works; symbol doesn't do anything if enabled is false
						symbol: symbol // 'triangle'  // symbol doesn't do anything if enabled is false
					},
					*/
					tooltip: {
						valueSuffix: ' ' + units, // station.properties["point_type_units_plural"]
						valueDecimals: 2  // yuck - hard coded - fix
					},
					pointRange: .5 * 3600 * 1000
					// sets column width to 30 minute data ... otherwise defaults to smallest time (5 minute data because of stage)
				});

				// alarms
				const alarmTriggerTS = [];
				if ( alarmTrigger != null ) {
					const leftP = [];
					leftP.push(tsData[0].x);
					leftP.push(alarmTrigger.limitValue);
					alarmTriggerTS.push(leftP);

					const rightP = [];
					rightP.push(tsData[tsData.length - 1].x);
					rightP.push(alarmTrigger.limitValue);
					alarmTriggerTS.push(rightP);
				}

				if ( alarmTrigger != null ) {
					// if we don't have a series displayed, the chart doesn't scale to display the annotation.
					seriesArray.push ({
						data: alarmTriggerTS,
						name: 'Alarm',
						color: 'red',
						marker: { enabled: false },
						showInLegend: false,
						tooltip: {
							enableMouseTracking: false
						}
					});

					let alarmTitle = alarmTrigger.name;
					if ( alarmTitle === '' || alarmTitle == null ) {
						alarmTitle = alarmTrigger.description;
					}

					annotationArray.push ({
						xValue: alarmTriggerTS[0][0],
						yValue: alarmTriggerTS[0][1],
						enabledButtons: false,
						anchorX: 'left',
						anchorY: 'top',
						title: alarmTitle,
						shape: {
							type: 'path',
							params: {
								d: ['M', 0, 0, 'L', 180, 0], // Refer to link for further doc: https://www.w3.org/TR/SVG/paths.html#PathData
								stroke: 'red'
							}
						},
					});

				}

				// http://jsfiddle.net/VgCQV/
				// http://jsfiddle.net/gh/get/jquery/1.9.1/highslide-software/highcharts.com/tree/master/samples/highcharts/demo/synchronized-charts/
				// console.log(Highcharts.charts);

				$('<div class="chart">')
					.appendTo('#container')
					.highcharts({
						chart: {
							marginLeft: 80, // Keep all charts left aligned
							zoomType: 'x',
							spacingTop: 20,
							spacingBottom: 20,
							height: 200
						},
						title: {
							text: '',
							align: 'left',
							margin: 0,
							x: 30
						},
						credits: {
							enabled: false
						},
						xAxis: {
							crosshair: true,
							events: {
								setExtremes: this.syncExtremes
							},
							lineColor: lineColor,
							tickLength: tickLength,
							lineWidth: 3,
							labels: {
								enabled: showXAxisLabels,
								align: 'center',
								/*
								formatter: function() {
									var d = new Date(this.value);
												console.log(d);
												console.log(d.toLocaleDateString());
									return d.toLocaleDateString();
								}
								*/
								format: '{value:%b %d}'
							},
							offset: 10,
							tickInterval: 24 * 3600 * 1000,  // 1 day tick interval
							type: 'datetime'
						},
						yAxis: {
							title: {
								text: yAxisLabel
							},
							reversed: isPrecip,
							labels: {
								formatter: function () {
									return this.value.toFixed(1) + ' ' + units;
								}
							},
							lineWidth: 3
						},
						tooltip: {
							borderWidth: 0,
							pointFormat: '{point.y}',
							headerFormat: '{point.x:%l:%M%p} ' + this.tzName + '<br>',  // see http://pubs.opengroup.org/onlinepubs/007908799/xsh/strftime.html
							style: {
								fontSize: '12px'
							}
							// valueDecimals: dataset.valueDecimals
						},
						legend: {
							layout: 'horizontal',
							align: 'right',
							// x: 60,
							verticalAlign: 'top',
							y: -25,
							floating: true
						},
						annotations: annotationArray,
						annotationsOptions: { enabledButtons: false },
						series: seriesArray
					});
			}
		}
	}

	// displayStationInformation displays information about the station in the
	displayStationInformation (  ) {

		const id = +this.stationID;  // create a numerical value of stationID
		this.dataLayerService.getDataLayerDetails('allStations').then(dataLayer => {
			const stations = dataLayer.value.stationSummaries;
			const station_id = dataLayer.stationID;
			const novaScoresDictionary = dataLayer.value.novaScores;


			const station = stations.filter(dl => dl[station_id] === id)[0];
			// console.log(station);
			if ( station != null ) {
				const novaScores = this.getNovaScores(station, novaScoresDictionary);
				this.stationNovaScores = novaScores;

				for ( let i = 0; i < novaScores.length; i++) {
					this.stationNovaScores[i]['novaScoreClass'] = 'novaScore' + novaScores[i].novaScoreGroup;
				}

				this.currentStation.stationName = station[dataLayer.stationName];
				this.currentStation.stationElevation = station.elevation;

			}
		});
	}


	//
	// clearGraphs removes the series from CombinedChart
	//
	clearGraphs() {
		const div = document.getElementById('container');

		// remove all existing charts
		while (div.hasChildNodes()) {
			div.removeChild(div.lastChild);
		}
	}


	newStationSelected (newStation) {
		this.stationID = newStation;
		this.clearGraphs();
		this.displayGraphsForStationID();
	}

	// Given a groupScoreOrder, return the description.
	//
	convertGroupNovaScoreToDescription ( novaScores: any[], groupScoreOrder ) {  // may need to add scoreGroup
		const nsArray = novaScores.filter(function(stat) {
			return stat.groupScoreOrder === groupScoreOrder; });

		if ( nsArray.length > 0 ) {
			return nsArray[0].description;
		} else { return ''; }
	}

	// Convert a novascore from novascore to groupScoreOrder.
	//
	convertNovaScore ( novaScores: any[], novascore ) {  // may need to add scoreGroup
		const nsArray = novaScores.filter(function(stat) {
									return stat.id === novascore; });

		if ( nsArray.length > 0 ) {
			return nsArray[0].groupScoreOrder;
		} else { return 1; }
	}

	// get novascores takes a station and uses the specs in stationTSArray to retrieve the novascore for each data type
	// as well as set an overall novascore (max value of all novascores)
	// an array is returned [{dataType: "Precip", novaScoreGroup": 3, "novaScoreDescription": "Significant hydrologic activity"}, {...}]
	getNovaScores (station: any, novaScoresDictionary) {
		const novaScores = [];
		const statisticsArray = station.statistics;

		for ( let i = 0; i < this.stationTSArray.length; i++) {

			const novaScoreValue = statisticsArray.filter( stat =>
				stat.dataType === this.stationTSArray[i].stationDataType &&
				stat.duration.toUpperCase() === this.stationTSArray[i].duration.toUpperCase() &&
				stat.statisticType.toUpperCase() === this.stationTSArray[i].statisticType.toUpperCase() );
			// console.log(novaScoreValue);
			if ( novaScoreValue.length > 0 ) {
				const novaScoreValueGroup = this.convertNovaScore ( novaScoresDictionary, novaScoreValue[0].novaScore );
				const novaScoreDescription = this.convertGroupNovaScoreToDescription ( novaScoresDictionary, novaScoreValueGroup );


				const novaScoreObject = {};
				novaScoreObject['dataType'] = this.stationTSArray[i].dataType;
				novaScoreObject['novaScoreGroup'] = novaScoreValueGroup;
				novaScoreObject['novaScoreDescription'] = novaScoreDescription;
				// console.log(novaScoreObject);
				novaScores.push( novaScoreObject );
			}
		}
		return novaScores;
	}

	// given an array of novaScoreobjects from getNovaScores, return the highest
	getMaxNovaScore ( novaScores ) {
		let maxNovaScore = 1;
		for ( let i = 0; i < novaScores.length; i++) {
			maxNovaScore = Math.max(maxNovaScore, novaScores[i].novaScoreGroup);
		}
		return maxNovaScore;
	}

	// given a novaScore group number, return the corresponding color
	// these match the color use on the map
	getNovaScoreClass(maxNovaScore) {
		let novaScoreClass = '';
		switch (maxNovaScore) {
			case 5: novaScoreClass = 'novaScore5'; break;
			case 4: novaScoreClass = 'novaScore4'; break;
			case 3: novaScoreClass = 'novaScore3'; break;
			case 2: novaScoreClass = 'novaScore2'; break;
			default: novaScoreClass = 'novaScore1'; break;
		}
		return novaScoreClass;
	}

	// this populates the station selection pulldown
	populateStationSelection() {

		this.dataLayerService.getDataLayerDetails('allStations').then(dataLayer => {
			const stations = dataLayer.value.stationSummaries;
			const station_id = dataLayer.stationID;
			const station_name = dataLayer.stationName;
			const novaScoresDictionary = dataLayer.value.novaScores;

			// tslint:disable-next-line:forin
			for ( let i in stations ) {
				let newStation: any; // StationData;
				const novaScores = this.getNovaScores(stations[i], novaScoresDictionary);
				// console.log(novaScores);
				const maxNovaScore = this.getMaxNovaScore(novaScores);
				const novaScoreClass = this.getNovaScoreClass(maxNovaScore);
				// console.log( stations[i][station_name] + ": " + maxNovaScore + ": " + novaScoreClass );
				newStation = {
						id: stations[i][station_id],
						name: stations[i][station_name],
						label: stations[i][station_id] + ' - ' + stations[i][station_name] + ' (' + maxNovaScore + ')',
						value: stations[i][station_id],
						novaScore: maxNovaScore,
						novaScoreClass:  novaScoreClass};

				this.binaryInsertByNovaScore( newStation, this.stationList, undefined, undefined );
			}

			console.log('Number of stations before/after sort ' + stations.length + '/' + this.stationList.length );
			// if the user arrived here by clicking on "Station Dashboard" rather than by selecting an individual station,
			// a reasonable default must be selected.
			if ( this.stationID === '-999' && this.stationList.length > 0) {
				this.setDefaultStation();
			}
		});
	}

	// setDefaultStation sets the dashboard to display the first station in the station selection
	// list if no previous stations have been viewed.
	setDefaultStation() {
		this.stationID = this.stationList[0].id;
		this.newStationSelected(this.stationID);
	}

	// utility function for populateStationSelection
	// orders list by id only
	binaryInsert(newStation, array, startVal, endVal) {
		const length = array.length;
		const start = typeof(startVal) !== 'undefined' ? startVal : 0;
		const end = typeof(endVal) !== 'undefined' ? endVal : length - 1; // !! endVal could be 0 don't use || syntax
		const m = start + Math.floor((end - start) / 2);

		if (length === 0) {
			array.push(newStation);
			return;
		}

		if (newStation.id > array[end].id) {
			array.splice(end + 1, 0, newStation);
			return;
		}

		if (newStation.id < array[start].id) {
			array.splice(start, 0, newStation);
			return;
		}

		if (start >= end) {
			return;
		}

		if (newStation.id < array[m].id) {
			this.binaryInsert(newStation, array, start, m - 1);
			return;
		}

		if (newStation.id > array[m].id) {
			this.binaryInsert(newStation, array, m + 1, end);
			return;
		}

		// don't insert duplicates
	}

	// utility function for populateStationSelection
	// orders list by id and novaScore
	binaryInsertByNovaScore(newStation, array, startVal, endVal) {
		const length = array.length;
		const start = typeof(startVal) !== 'undefined' ? startVal : 0;
		const end = typeof(endVal) !== 'undefined' ? endVal : length - 1; // !! endVal could be 0 don't use || syntax
		const m = start + Math.floor((end - start) / 2);

		if (length === 0) {
			array.push(newStation);
			return;
		}

		if (newStation.novaScore < array[end].novaScore || (newStation.novaScore === array[end].novaScore && newStation.id > array[end].id)) {
			array.splice(end + 1, 0, newStation);
			return;
		}

		if (newStation.novaScore > array[start].novaScore ||
			(newStation.novaScore === array[start].novaScore && newStation.id < array[start].id)) {
			array.splice(start, 0, newStation);
			return;
		}

		if (start >= end) {
			return;
		}

		if (newStation.novaScore > array[m].novaScore || (newStation.novaScore === array[m].novaScore && newStation.id < array[m].id)) {
			this.binaryInsertByNovaScore(newStation, array, start, m - 1);
			return;
		} else {
			// if(newStation.novaScore < array[m].novaScore || (newStation.novaScore == array[m].novaScore && newStation.id > array[m].id)){
			this.binaryInsertByNovaScore(newStation, array, m + 1, end);
			return;
		}

		// don't insert duplicates
	}


	/**
     * Synchronize zooming through the setExtremes event handler.
     */

	syncExtremes(e) {

		if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
			Highcharts.each(Highcharts.charts, function (chart) {
				if (chart.xAxis[0].setExtremes) { // It is null while updating
					chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
				}
			});
		}
	}

}
