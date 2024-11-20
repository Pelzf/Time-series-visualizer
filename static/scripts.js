document.addEventListener("DOMContentLoaded", () => {
    // Dark/Light Mode Toggle
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    themeToggle.addEventListener("click", () => {
        const body = document.body;

        // Toggle the dark mode class
        body.classList.toggle("darkbody-color");

        // Update the icon dynamically
        if (body.classList.contains("darkbody-color")) {
            themeIcon.classList.replace("bi-moon-fill", "bi-sun-fill");
        } else {
            themeIcon.classList.replace("bi-sun-fill", "bi-moon-fill");
        }
    });

    // Sidebar Handling
    const sidebar = document.getElementById("sidePanel");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const closeSidebar = document.getElementById("closeSidebar");

    // Open sidebar on toggle button click
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
    });

    // Close sidebar on close button click
    closeSidebar.addEventListener("click", () => {
        sidebar.classList.remove("show");
    });

    // Close sidebar when clicking outside
    document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove("show");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const chartContainer = document.getElementById("chart-container");
    const chartHeading = document.getElementById("chartHeading");
    let currentType = chartContainer.dataset.currentType || "random"; // Default type

    // Function to update the `hx-get` attribute and sync the type
    const updateHxGetAttribute = (type) => {
        currentType = type;
        chartContainer.setAttribute("hx-get", `/update-data?type=${currentType}`);
        chartContainer.dataset.currentType = currentType; // Keep in sync
    };

    // Initialize the Chart.js chart
    let chart;
    const ctx = document.getElementById("timeSeriesChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [], // Start with empty labels
            datasets: [{
                label: "Measured Quantity", // Default dataset label
                data: [], // Start with empty data
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.1,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Value" } },
            },
        },
    });

    // Function to update the chart dynamically
    const updateChart = (newData, title) => {
        console.log("Updating chart with title:", title);
        console.log("Updating chart with new data:", newData);

        // Extract labels and values from new data
        const labels = newData.map(point => point.time);
        const values = newData.map(point => point.value);

        // Update the chart's dataset
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;

        // Refresh the chart with updated data
        chart.update();
    };

    // Event listener for navigation links
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default link behavior
            const type = link.getAttribute("hx-get").split("type=")[1];
            updateHxGetAttribute(type);
        });
    });

    // HTMX listener for automatic updates
    document.addEventListener("htmx:afterOnLoad", (event) => {
        if (event.detail.xhr.responseURL) {
            const urlParams = new URL(event.detail.xhr.responseURL).searchParams;
            const type = urlParams.get("type") || "random";

            // Update `hx-get` and `data-current-type` if there's a mismatch
            if (type !== currentType) {
                updateHxGetAttribute(type);
            }

            // Update the chart heading dynamically
            if (event.detail.xhr.responseText) {
                const response = JSON.parse(event.detail.xhr.responseText);
                if (response.title) {
                    chartHeading.innerText = response.title;
                }
                if (response.data) {
                    updateChart(response.data, response.title);
                }
            }
        }
    });

    // Export chart data as CSV
    document.getElementById("exportCsv").addEventListener("click", () => {
        const labels = chart.data.labels;
        const values = chart.data.datasets[0].data;

        let csvContent = "Time,Value\n"; // CSV headers
        labels.forEach((label, index) => {
            csvContent += `${label},${values[index]}\n`;
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "chart-data.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // Export chart as PNG
    document.getElementById("exportPng").addEventListener("click", () => {
        const canvas = document.getElementById("timeSeriesChart");
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "chart-image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});