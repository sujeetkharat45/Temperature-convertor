document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const temperatureInput = document.getElementById("temperature")
  const errorMessage = document.getElementById("error-message")
  const convertBtn = document.getElementById("convert-btn")
  const resultValue = document.getElementById("result-value")
  const resultUnit = document.getElementById("result-unit")
  const resultInfo = document.getElementById("result-info")
  const temperatureCategory = document.getElementById("temperature-category")
  const weatherIcon = document.getElementById("weather-icon")
  const thermometerMercury = document.getElementById("thermometer-mercury")
  const thermometerBulb = document.getElementById("thermometer-bulb")
  const themeToggle = document.getElementById("theme-toggle")
  const swapUnits = document.getElementById("swap-units")
  const historyContainer = document.getElementById("history-container")
  const historyList = document.getElementById("history-list")

  // Initialize theme from localStorage or default to light
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme")
  }

  // Set initial result unit based on default selection
  updateResultUnit()

  // Conversion history array
  const conversionHistory = []

  // Add event listeners
  convertBtn.addEventListener("click", convertTemperature)
  themeToggle.addEventListener("click", toggleTheme)
  swapUnits.addEventListener("click", swapUnitSelections)

  // Only validate on input, clear result to show user needs to convert
  temperatureInput.addEventListener("input", () => {
    validateInput()
    clearResult()
  })

  // Add event listeners to update result unit when "to" unit changes
  document.querySelectorAll('input[name="to-unit"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      updateResultUnit()
      clearResult()
    })
  })

  // Add event listeners to from unit changes
  document.querySelectorAll('input[name="from-unit"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      clearResult()
    })
  })

  function validateInput() {
    const value = temperatureInput.value.trim()

    // Clear previous error
    errorMessage.textContent = ""

    // Check if input is empty
    if (value === "") {
      errorMessage.textContent = "Please enter a temperature"
      return false
    }

    // Check if input is a valid number
    if (isNaN(Number.parseFloat(value))) {
      errorMessage.textContent = "Please enter a valid number"
      return false
    }

    // Check for Kelvin validation (must be ≥ 0)
    const fromUnit = document.querySelector('input[name="from-unit"]:checked').value
    if (fromUnit === "kelvin" && Number.parseFloat(value) < 0) {
      errorMessage.textContent = "Kelvin cannot be negative"
      return false
    }

    return true
  }

  function updateResultUnit() {
    const toUnit = document.querySelector('input[name="to-unit"]:checked').value

    switch (toUnit) {
      case "celsius":
        resultUnit.textContent = "°C"
        break
      case "fahrenheit":
        resultUnit.textContent = "°F"
        break
      case "kelvin":
        resultUnit.textContent = "K"
        break
    }
  }

  function clearResult() {
    resultValue.textContent = "--"
    resultInfo.textContent = ""
    temperatureCategory.textContent = ""
    temperatureCategory.className = "temperature-category"
    weatherIcon.textContent = "🌡️"

    // Reset thermometer to default state
    thermometerMercury.style.height = "20%"
    thermometerMercury.style.background = "linear-gradient(to top, var(--hot-color), var(--warm-color))"
    thermometerBulb.style.background = "var(--hot-color)"
  }

  function updateThermometer(temperature, unit) {
    // Convert to Celsius for thermometer display
    let tempInCelsius = temperature
    if (unit === "fahrenheit") {
      tempInCelsius = ((temperature - 32) * 5) / 9
    } else if (unit === "kelvin") {
      tempInCelsius = temperature - 273.15
    }

    // Calculate height percentage (range from -50°C to 100°C)
    const minTemp = -50
    const maxTemp = 100
    const percentage = Math.max(0, Math.min(100, ((tempInCelsius - minTemp) / (maxTemp - minTemp)) * 100))

    thermometerMercury.style.height = `${percentage}%`

    // Update colors based on temperature
    let mercuryColor, bulbColor
    if (tempInCelsius < 0) {
      mercuryColor = "linear-gradient(to top, #70a1ff, #5352ed)"
      bulbColor = "#70a1ff"
    } else if (tempInCelsius < 20) {
      mercuryColor = "linear-gradient(to top, #3742fa, #70a1ff)"
      bulbColor = "#3742fa"
    } else if (tempInCelsius < 40) {
      mercuryColor = "linear-gradient(to top, #ffa502, #ff9500)"
      bulbColor = "#ffa502"
    } else {
      mercuryColor = "linear-gradient(to top, #ff4757, #ff3742)"
      bulbColor = "#ff4757"
    }

    thermometerMercury.style.background = mercuryColor
    thermometerBulb.style.background = bulbColor
  }

  function updateWeatherIcon(temperature, unit) {
    // Convert to Celsius for consistent comparison
    let tempInCelsius = temperature
    if (unit === "fahrenheit") {
      tempInCelsius = ((temperature - 32) * 5) / 9
    } else if (unit === "kelvin") {
      tempInCelsius = temperature - 273.15
    }

    let icon, category, categoryClass
    if (tempInCelsius < -10) {
      icon = "🥶"
      category = "Freezing"
      categoryClass = "category-cold"
    } else if (tempInCelsius < 0) {
      icon = "❄️"
      category = "Very Cold"
      categoryClass = "category-cold"
    } else if (tempInCelsius < 10) {
      icon = "🧊"
      category = "Cold"
      categoryClass = "category-cool"
    } else if (tempInCelsius < 20) {
      icon = "😊"
      category = "Cool"
      categoryClass = "category-cool"
    } else if (tempInCelsius < 30) {
      icon = "🌤️"
      category = "Warm"
      categoryClass = "category-warm"
    } else if (tempInCelsius < 40) {
      icon = "☀️"
      category = "Hot"
      categoryClass = "category-hot"
    } else {
      icon = "🔥"
      category = "Very Hot"
      categoryClass = "category-hot"
    }

    weatherIcon.textContent = icon
    temperatureCategory.textContent = category
    temperatureCategory.className = `temperature-category ${categoryClass}`
  }

  function convertTemperature() {
    // Validate input first
    if (!validateInput()) {
      return
    }

    // Get input values
    const temperature = Number.parseFloat(temperatureInput.value)
    const fromUnit = document.querySelector('input[name="from-unit"]:checked').value
    const toUnit = document.querySelector('input[name="to-unit"]:checked').value

    // If from and to units are the same, no conversion needed
    if (fromUnit === toUnit) {
      resultValue.textContent = temperature.toFixed(2)
      resultInfo.textContent = "No conversion needed"
      updateThermometer(temperature, toUnit)
      updateWeatherIcon(temperature, toUnit)
      return
    }

    // Perform conversion
    let result

    // First convert to Celsius as an intermediate step if needed
    let tempInCelsius

    switch (fromUnit) {
      case "celsius":
        tempInCelsius = temperature
        break
      case "fahrenheit":
        tempInCelsius = ((temperature - 32) * 5) / 9
        break
      case "kelvin":
        tempInCelsius = temperature - 273.15
        break
    }

    // Then convert from Celsius to target unit
    switch (toUnit) {
      case "celsius":
        result = tempInCelsius
        break
      case "fahrenheit":
        result = (tempInCelsius * 9) / 5 + 32
        break
      case "kelvin":
        result = tempInCelsius + 273.15
        break
    }

    // Add animation to result
    const resultElement = document.getElementById("result")
    resultElement.classList.remove("pulse")
    void resultElement.offsetWidth // Trigger reflow
    resultElement.classList.add("pulse")

    // Add glow effect to convert button
    convertBtn.classList.add("glow")
    setTimeout(() => {
      convertBtn.classList.remove("glow")
    }, 2000)

    // Display the result
    resultValue.textContent = result.toFixed(2)

    // Update visual elements
    updateThermometer(result, toUnit)
    updateWeatherIcon(result, toUnit)

    // Add contextual information
    addContextualInfo(result, toUnit)

    // Add to history
    addToHistory(temperature, fromUnit, result, toUnit)
  }

  function addContextualInfo(temperature, unit) {
    let info = ""

    // Add contextual information based on the temperature and unit
    if (unit === "celsius") {
      if (temperature <= 0) info = "Water freezes at 0°C ❄️"
      else if (temperature >= 100) info = "Water boils at 100°C 💨"
      else if (temperature >= 36.5 && temperature <= 37.5) info = "Normal human body temperature 🌡️"
      else if (temperature >= 20 && temperature <= 25) info = "Comfortable room temperature 🏠"
    } else if (unit === "fahrenheit") {
      if (temperature <= 32) info = "Water freezes at 32°F ❄️"
      else if (temperature >= 212) info = "Water boils at 212°F 💨"
      else if (temperature >= 97 && temperature <= 99) info = "Normal human body temperature 🌡️"
      else if (temperature >= 68 && temperature <= 77) info = "Comfortable room temperature 🏠"
    } else if (unit === "kelvin") {
      if (temperature <= 273.15) info = "Water freezes at 273.15K ❄️"
      else if (temperature >= 373.15) info = "Water boils at 373.15K 💨"
      else if (temperature >= 309.65 && temperature <= 310.65) info = "Normal human body temperature 🌡️"
      else if (temperature >= 293.15 && temperature <= 298.15) info = "Comfortable room temperature 🏠"
    }

    resultInfo.textContent = info
  }

  function addToHistory(fromTemp, fromUnit, toTemp, toUnit) {
    // Create history item
    const historyItem = {
      fromTemp: fromTemp.toFixed(2),
      fromUnit: getUnitSymbol(fromUnit),
      toTemp: toTemp.toFixed(2),
      toUnit: getUnitSymbol(toUnit),
      timestamp: new Date(),
    }

    // Add to history array (limit to 5 items)
    conversionHistory.unshift(historyItem)
    if (conversionHistory.length > 5) {
      conversionHistory.pop()
    }

    // Update history UI
    updateHistoryUI()
  }

  function updateHistoryUI() {
    // Show history container if we have items
    if (conversionHistory.length > 0) {
      historyContainer.style.display = "block"

      // Clear current history list
      historyList.innerHTML = ""

      // Add each history item
      conversionHistory.forEach((item, index) => {
        const historyElement = document.createElement("div")
        historyElement.className = "history-item fade-in"
        historyElement.style.animationDelay = `${index * 0.1}s`

        historyElement.innerHTML = `
          <span>${item.fromTemp} ${item.fromUnit} → ${item.toTemp} ${item.toUnit}</span>
          <span>${formatTime(item.timestamp)}</span>
        `

        historyList.appendChild(historyElement)
      })
    }
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  function getUnitSymbol(unit) {
    switch (unit) {
      case "celsius":
        return "°C"
      case "fahrenheit":
        return "°F"
      case "kelvin":
        return "K"
      default:
        return ""
    }
  }

  function toggleTheme() {
    document.body.classList.toggle("dark-theme")
    localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light")
  }

  function swapUnitSelections() {
    // Get current selections
    const fromUnit = document.querySelector('input[name="from-unit"]:checked').value
    const toUnit = document.querySelector('input[name="to-unit"]:checked').value

    // Swap selections
    document.querySelector(`input[name="from-unit"][value="${toUnit}"]`).checked = true
    document.querySelector(`input[name="to-unit"][value="${fromUnit}"]`).checked = true

    // Update result unit and clear result
    updateResultUnit()
    clearResult()

    // Add animation to swap icon
    swapUnits.classList.add("pulse")
    setTimeout(() => {
      swapUnits.classList.remove("pulse")
    }, 500)
  }

  // Focus input field on load
  temperatureInput.focus()
})
