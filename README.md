# owf-lib-viz-highchart
Open Water Foundation visualization library based on Highchart

## Getting Started

A standard development folder structure is recommended. The website development files can be set up as follows (Windows is assumed, but Linux would be similar):

```
> C:
> cd \Users\user
> mkdir Highchart-JS
> cd Highchart-JS
> mkdir git-repos
> cd git-repos
> git clone https://github.com/OpenWaterFoundation/owf-lib-viz-highcharts-js
```
The repository contains multiple folders that include time series examples using different sets of data.
## Additional Documentation

See also:
* [Highchart Documentation](https://www.highcharts.com/docs)
* [Highchart API Reference](http://api.highcharts.com/highcharts)
* [Highstock API Reference](http://api.highcharts.com/highstock/)
* [Highmaps API Reference](http://api.highcharts.com/highmaps/)

## Timeseries - examples graphing time series data
* TSTool-Large-Data-Example - example of graph for > 15,000 data points
* TSTool-Small-Data-Example - example of graph for < 150 data points


## Data Format RCC-ACIS Precipitation Time Series
|Date   |StationID 1   |StationID 2   |StationID 3   |StationID X   |
|:-:|---|---|---|---|
|1/01/2000   |0.0   |1.0   |0.0   |precipitation amount   |
|1/02/2000   |0.5   |1.73   |0.2   |precipitation amount   |
|1/03/2000   |0.26   |0.84   |0.64   |precipitation amount   |

** **Note** the data below each station is the amount of precipitation that occured that day.

## Data Format Heatmap
|X   |Y   |Value   |
|:-:|---|---|
|0   |0   |5   |   |
|1/1/2017   |0   |5   |   |
|0   |1/1/2017   |5   |   |

** **Note** X or Y values can be of type 'datetime' (A valid date of the calendar EX: 017-01-01).

## NOTES

* Requires small amount of code to implement
* Provides examples and documentation
* Open Source
* Free for non-profit and personal use
* Has a good release history
* Actively developed
* Handles large datasets extremely well
