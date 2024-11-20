package main

import (
	"encoding/json"
	"html/template"
	"math/rand"
	"net/http"
	"time"
)

type DataPoint struct {
	Time  string  `json:"time"`
	Value float64 `json:"value"`
}

type TemplateData struct {
	StartEndDelta float64
	CurrentState  float64
	DataPoints    []DataPoint
}

// generateTimeSeries generates a time series with 50 points
func generateTimeSeries() []DataPoint {
	rand.Seed(time.Now().UnixNano())
	series := make([]DataPoint, 0)
	startTime := time.Now()
	value := rand.Float64() * 10 // starting value

	for i := 0; i < 50; i++ {
		// generate relative values to maintain a trend
		delta := (rand.Float64() - 0.5) * 2
		value += delta
		series = append(series, DataPoint{
			Time:  startTime.Add(time.Duration(i) * time.Minute).Format("15:04"),
			Value: value,
		})
	}

	return series
}

// function for weather
func generateWeatherTimeSeries() []DataPoint {
	rand.Seed(time.Now().UnixNano())
	series := make([]DataPoint, 0)
	startTime := time.Now()
	temperature := 20.0 // starting temperature

	for i := 0; i < 50; i++ {
		delta := (rand.Float64() - 0.5) * 2
		temperature += delta
		series = append(series, DataPoint{
			Time:  startTime.Add(time.Duration(i) * time.Minute).Format("15:04"),
			Value: temperature,
		})
	}
	return series
}

// function for stock
func generateStockPricesTimeSeries() []DataPoint {
	rand.Seed(time.Now().UnixNano())
	series := make([]DataPoint, 0)
	startTime := time.Now()
	price := 100.0 // starting stock price

	for i := 0; i < 50; i++ {
		delta := (rand.Float64() - 0.5) * 5
		price += delta
		series = append(series, DataPoint{
			Time:  startTime.Add(time.Duration(i) * time.Minute).Format("15:04"),
			Value: price,
		})
	}
	return series
}

// function for energy consumption
func generateEnergyConsumptionTimeSeries() []DataPoint {
	rand.Seed(time.Now().UnixNano())
	series := make([]DataPoint, 0)
	startTime := time.Now()
	consumption := 50.0 // Starting energy consumption

	for i := 0; i < 50; i++ {
		delta := (rand.Float64() - 0.5) * 10
		consumption += delta
		series = append(series, DataPoint{
			Time:  startTime.Add(time.Duration(i) * time.Minute).Format("15:04"),
			Value: consumption,
		})
	}
	return series
}

// updateData serves dynamic updates
func updateData(w http.ResponseWriter, r *http.Request) {
	seriesType := r.URL.Query().Get("type") // get the "type" from the request
	if seriesType == "" {
		seriesType = "random"
	}

	var data []DataPoint
	var title string

	switch seriesType {
	case "weather":
		title = "Weather Time Series"
		data = generateWeatherTimeSeries()
	case "stock":
		title = "Stock Prices Time Series"
		data = generateStockPricesTimeSeries()
	case "energy":
		title = "Energy Consumption Time Series"
		data = generateEnergyConsumptionTimeSeries()
	default:
		title = "Random Time Series"
		data = generateTimeSeries()
	}

	response := map[string]interface{}{
		"title": title,
		"data":  data,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// renderPage handles the root route and renders the HTML page
func renderPage(w http.ResponseWriter, r *http.Request) {
	data := generateTimeSeries()
	startValue := data[0].Value
	endValue := data[len(data)-1].Value

	tmplData := TemplateData{
		StartEndDelta: endValue - startValue,
		CurrentState:  endValue,
		DataPoints:    data,
	}

	tmpl := template.Must(template.ParseFiles("templates/index.html"))
	tmpl.Execute(w, tmplData)
}

func main() {
	// static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	// updated data dynamically
	http.HandleFunc("/update-data", updateData)

	// Handle main route
	http.HandleFunc("/", renderPage)

	// Start server 8080
	http.ListenAndServe(":8080", nil)
}
