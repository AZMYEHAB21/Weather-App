document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const cityInput = document.getElementById("city-input")
  const searchBtn = document.getElementById("search-btn")
  const locationBtn = document.getElementById("location-btn")
  const langToggle = document.getElementById("lang-toggle")
  const unitToggle = document.getElementById("unit-toggle")
  const weatherContainer = document.getElementById("weather-container")
  const loader = document.getElementById("loader")
  const errorContainer = document.getElementById("error-container")
  const errorMessage = document.getElementById("error-message")
  const tempUnit = document.getElementById("temp-unit")

  // ======================================
  // API Key Options
  // ======================================
  const apiKeyOptions = [
    "7030778ec6be9d6a9741afb2b80db0ad", // المفتاح الذي قدمته
    "1d27e25e9c614b3f3aa7f39d2d32cc51", // مفتاح بديل للاختبار
    "4d8fb5b93d4af21d66a2948710284366", // مفتاح بديل آخر للاختبار
  ]

  let currentApiKeyIndex = 0
  let apiKey = apiKeyOptions[currentApiKeyIndex]
  // ======================================

  // App State
  let currentLanguage = "ar" // ar or en
  let currentUnit = "metric" // metric or imperial
  let currentCity = ""
  let currentCoords = null

  // Event listeners
  searchBtn.addEventListener("click", searchWeather)
  locationBtn.addEventListener("click", getLocationWeather)
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchWeather()
    }
  })

  langToggle.addEventListener("click", toggleLanguage)
  unitToggle.addEventListener("click", toggleUnit)

  // Initialize app
  initApp()

  /**
   * Initialize the app
   */
  function initApp() {
    // Load saved preferences
    loadPreferences()

    // Check if there's a saved city in localStorage
    if (currentCity) {
      cityInput.value = currentCity
      searchWeather()
    } else {
      // Try to get user's location on first load
      getLocationWeather()
    }
  }

  /**
   * Load user preferences from localStorage
   */
  function loadPreferences() {
    const savedLang = localStorage.getItem("weatherAppLang")
    const savedUnit = localStorage.getItem("weatherAppUnit")
    const savedCity = localStorage.getItem("weatherAppCity")

    if (savedLang) {
      currentLanguage = savedLang
      updateLanguageUI()
    }

    if (savedUnit) {
      currentUnit = savedUnit
      updateUnitUI()
    }

    if (savedCity) {
      currentCity = savedCity
    }
  }

  /**
   * Save user preferences to localStorage
   */
  function savePreferences() {
    localStorage.setItem("weatherAppLang", currentLanguage)
    localStorage.setItem("weatherAppUnit", currentUnit)
    if (currentCity) {
      localStorage.setItem("weatherAppCity", currentCity)
    }
  }

  /**
   * Toggle between Arabic and English
   */
  function toggleLanguage() {
    currentLanguage = currentLanguage === "ar" ? "en" : "ar"
    updateLanguageUI()
    savePreferences()

    // Refresh weather data with new language
    if (currentCity) {
      searchWeather()
    } else if (currentCoords) {
      fetchWeatherByCoords(currentCoords.lat, currentCoords.lon)
    }
  }

  /**
   * Update UI based on selected language
   */
  function updateLanguageUI() {
    const htmlElement = document.querySelector("html")
    htmlElement.lang = currentLanguage
    htmlElement.dir = currentLanguage === "ar" ? "rtl" : "ltr"

    langToggle.innerHTML =
      currentLanguage === "ar" ? '<i class="fas fa-language"></i> EN' : '<i class="fas fa-language"></i> عربي'

    // Update placeholders and button text based on language
    if (currentLanguage === "ar") {
      cityInput.placeholder = "أدخل اسم المدينة..."
      searchBtn.innerHTML = '<i class="fas fa-search"></i> بحث'
      document.querySelector(".loader p").textContent = "جاري تحميل بيانات الطقس..."
      document.querySelector(".forecast h3").innerHTML = '<i class="fas fa-calendar-alt"></i> توقعات الطقس لـ 5 أيام'
      document.querySelector(".hourly-forecast h3").innerHTML = '<i class="fas fa-clock"></i> توقعات الساعات القادمة'
      document.querySelector(".detail:nth-child(1) .label").textContent = "الإحساس:"
      document.querySelector(".detail:nth-child(2) .label").textContent = "الرطوبة:"
      document.querySelector(".detail:nth-child(3) .label").textContent = "الرياح:"
      document.querySelector(".detail:nth-child(4) .label").textContent = "الضغط:"
      document.querySelector(".sun-card:nth-child(1) .label").textContent = "شروق الشمس"
      document.querySelector(".sun-card:nth-child(2) .label").textContent = "غروب الشمس"
      document.querySelector("footer p:first-child").textContent = "© 2025 AZMY EHAB. جميع الحقوق محفوظة."
      document.querySelector("footer p:last-child").innerHTML =
        'البيانات مقدمة من <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>'
    } else {
      cityInput.placeholder = "Enter city name..."
      searchBtn.innerHTML = '<i class="fas fa-search"></i> Search'
      document.querySelector(".loader p").textContent = "Loading weather data..."
      document.querySelector(".forecast h3").innerHTML = '<i class="fas fa-calendar-alt"></i> 5-Day Forecast'
      document.querySelector(".hourly-forecast h3").innerHTML = '<i class="fas fa-clock"></i> Hourly Forecast'
      document.querySelector(".detail:nth-child(1) .label").textContent = "Feels like:"
      document.querySelector(".detail:nth-child(2) .label").textContent = "Humidity:"
      document.querySelector(".detail:nth-child(3) .label").textContent = "Wind:"
      document.querySelector(".detail:nth-child(4) .label").textContent = "Pressure:"
      document.querySelector(".sun-card:nth-child(1) .label").textContent = "Sunrise"
      document.querySelector(".sun-card:nth-child(2) .label").textContent = "Sunset"
      document.querySelector("footer p:first-child").textContent = "© 2025 AZMY EHAB. All Rights Reserved."
      document.querySelector("footer p:last-child").innerHTML =
        'Data provided by <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>'
    }
  }

  /**
   * Toggle between Celsius and Fahrenheit
   */
  function toggleUnit() {
    currentUnit = currentUnit === "metric" ? "imperial" : "metric"
    updateUnitUI()
    savePreferences()

    // Refresh weather data with new unit
    if (currentCity) {
      searchWeather()
    } else if (currentCoords) {
      fetchWeatherByCoords(currentCoords.lat, currentCoords.lon)
    }
  }

  /**
   * Update UI based on selected temperature unit
   */
  function updateUnitUI() {
    const isCelsius = currentUnit === "metric"

    unitToggle.innerHTML = isCelsius
      ? '<i class="fas fa-temperature-high"></i> °F'
      : '<i class="fas fa-temperature-high"></i> °C'

    tempUnit.textContent = isCelsius ? (currentLanguage === "ar" ? "°م" : "°C") : "°F"

    // Update all unit displays
    const unitElements = document.querySelectorAll(".unit")
    unitElements.forEach((el) => {
      if (el.parentElement.id === "feels-like" || el.parentElement.id === "temperature") {
        el.textContent = isCelsius ? (currentLanguage === "ar" ? "°م" : "°C") : "°F"
      }
    })
  }

  /**
   * Get weather based on user's geolocation
   */
  function getLocationWeather() {
    if (navigator.geolocation) {
      // Show loader
      loader.style.display = "flex"
      weatherContainer.classList.add("hidden")
      errorContainer.style.display = "none"

      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          currentCoords = { lat, lon }

          // Fetch weather using coordinates
          fetchWeatherByCoords(lat, lon)
        },
        // Error callback
        (error) => {
          loader.style.display = "none"
          let errorMsg = ""

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg =
                currentLanguage === "ar"
                  ? "تم رفض إذن تحديد الموقع. يرجى السماح بالوصول إلى موقعك أو البحث عن مدينة يدويًا."
                  : "Location permission denied. Please allow access to your location or search for a city manually."
              break
            case error.POSITION_UNAVAILABLE:
              errorMsg =
                currentLanguage === "ar"
                  ? "معلومات الموقع غير متاحة. يرجى البحث عن مدينة يدويًا."
                  : "Location information unavailable. Please search for a city manually."
              break
            case error.TIMEOUT:
              errorMsg =
                currentLanguage === "ar"
                  ? "انتهت مهلة طلب الموقع. يرجى المحاولة مرة أخرى."
                  : "Location request timed out. Please try again."
              break
            default:
              errorMsg =
                currentLanguage === "ar"
                  ? "حدث خطأ غير معروف. يرجى البحث عن مدينة يدويًا."
                  : "An unknown error occurred. Please search for a city manually."
          }

          showError(errorMsg)
        },
        // Options
        { timeout: 10000 },
      )
    } else {
      showError(
        currentLanguage === "ar"
          ? "تحديد الموقع الجغرافي غير مدعوم في متصفحك. يرجى البحث عن مدينة يدويًا."
          : "Geolocation is not supported by your browser. Please search for a city manually.",
      )
    }
  }

  /**
   * Fetch weather data using coordinates
   */
  async function fetchWeatherByCoords(lat, lon) {
    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}&lang=${currentLanguage}`,
      )

      if (!weatherResponse.ok) {
        handleApiError(weatherResponse)
        return
      }

      const weatherData = await weatherResponse.json()

      // Update city input with the detected city name
      cityInput.value = weatherData.name
      currentCity = weatherData.name
      savePreferences()

      // Display current weather
      displayCurrentWeather(weatherData)

      // Fetch and display forecast
      await fetchForecast(lat, lon)

      // Fetch and display hourly forecast
      await fetchHourlyForecast(lat, lon)

      // Hide loader and show weather container
      loader.style.display = "none"
      weatherContainer.classList.remove("hidden")
    } catch (error) {
      console.error("Error fetching weather by coordinates:", error)
      showError(
        currentLanguage === "ar"
          ? "حدث خطأ أثناء جلب بيانات الطقس. يرجى المحاولة مرة أخرى."
          : "Error fetching weather data. Please try again.",
      )
      loader.style.display = "none"
    }
  }

  /**
   * Initiates weather search based on user input
   */
  function searchWeather() {
    const city = cityInput.value.trim()

    if (!city) {
      showError(currentLanguage === "ar" ? "الرجاء إدخال اسم مدينة" : "Please enter a city name")
      return
    }

    currentCity = city
    savePreferences()

    // Show loader and hide other elements
    loader.style.display = "flex"
    weatherContainer.classList.add("hidden")
    errorContainer.style.display = "none"

    // Fetch current weather
    fetchCurrentWeather(city)
  }

  /**
   * Fetches current weather data for the specified city
   * @param {string} city - The city name to fetch weather for
   */
  async function fetchCurrentWeather(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}&lang=${currentLanguage}`,
      )

      if (!response.ok) {
        handleApiError(response)
        return
      }

      const data = await response.json()

      // Save coordinates for potential reuse
      currentCoords = { lat: data.coord.lat, lon: data.coord.lon }

      // Display current weather
      displayCurrentWeather(data)

      // Fetch and display forecast
      await fetchForecast(data.coord.lat, data.coord.lon)

      // Fetch and display hourly forecast
      await fetchHourlyForecast(data.coord.lat, data.coord.lon)

      // Hide loader and show weather container
      loader.style.display = "none"
      weatherContainer.classList.remove("hidden")
    } catch (error) {
      console.error("Error fetching current weather:", error)
      showError(
        currentLanguage === "ar"
          ? "حدث خطأ أثناء جلب بيانات الطقس. يرجى المحاولة مرة أخرى."
          : "Error fetching weather data. Please try again.",
      )
      loader.style.display = "none"
    }
  }

  /**
   * Handle API errors and try alternative API keys if needed
   */
  function handleApiError(response) {
    if (response.status === 401) {
      // Try next API key if current one is invalid
      currentApiKeyIndex++
      if (currentApiKeyIndex < apiKeyOptions.length) {
        apiKey = apiKeyOptions[currentApiKeyIndex]
        console.log("Trying alternative API key:", apiKey)

        // Retry with new API key
        if (currentCity) {
          fetchCurrentWeather(currentCity)
        } else if (currentCoords) {
          fetchWeatherByCoords(currentCoords.lat, currentCoords.lon)
        }
      } else {
        showError(
          currentLanguage === "ar"
            ? "جميع مفاتيح API غير صالحة. الرجاء الحصول على مفتاح API جديد من OpenWeatherMap."
            : "All API keys are invalid. Please get a new API key from OpenWeatherMap.",
        )
        loader.style.display = "none"
      }
    } else if (response.status === 404) {
      showError(
        currentLanguage === "ar"
          ? "لم يتم العثور على المدينة. الرجاء التحقق من التهجئة وإعادة المحاولة."
          : "City not found. Please check the spelling and try again.",
      )
      loader.style.display = "none"
    } else {
      showError(
        currentLanguage === "ar"
          ? `خطأ: ${response.status} - ${response.statusText}`
          : `Error: ${response.status} - ${response.statusText}`,
      )
      loader.style.display = "none"
    }
  }

  /**
   * Fetches 5-day forecast data for the specified coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  async function fetchForecast(lat, lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}&lang=${currentLanguage}`,
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()

      // Display forecast
      displayForecast(data)
    } catch (error) {
      console.error("Error fetching forecast:", error)
      // We'll continue showing the current weather even if forecast fails
    }
  }

  /**
   * Fetches hourly forecast data
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  async function fetchHourlyForecast(lat, lon) {
    try {
      // We'll use the same forecast API but filter for the next 24 hours
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}&lang=${currentLanguage}`,
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()

      // Display hourly forecast (first 8 items = 24 hours with 3-hour steps)
      displayHourlyForecast(data.list.slice(0, 8))
    } catch (error) {
      console.error("Error fetching hourly forecast:", error)
      // We'll continue showing the current weather even if hourly forecast fails
    }
  }

  /**
   * Displays current weather data in the UI
   * @param {Object} data - Current weather data from API
   */
  function displayCurrentWeather(data) {
    document.getElementById("city-name").textContent = `${data.name}, ${data.sys.country}`
    document.getElementById("current-date").textContent = formatDate(new Date(), currentLanguage)
    document.getElementById("temperature").textContent = Math.round(data.main.temp)
    document.getElementById("weather-description").textContent = data.weather[0].description
    document.getElementById("feels-like").textContent = Math.round(data.main.feels_like)
    document.getElementById("humidity").textContent = data.main.humidity
    document.getElementById("wind-speed").textContent =
      currentUnit === "metric"
        ? Math.round(data.wind.speed * 3.6)
        : // Convert m/s to km/h for metric
          Math.round(data.wind.speed) // mph for imperial
    document.getElementById("pressure").textContent = data.main.pressure

    // Set weather icon
    const iconCode = data.weather[0].icon
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`
    document.getElementById("weather-icon").src = iconUrl
    document.getElementById("weather-icon").alt = data.weather[0].description

    // Set sunrise and sunset times
    document.getElementById("sunrise-time").textContent = formatTime(new Date(data.sys.sunrise * 1000))
    document.getElementById("sunset-time").textContent = formatTime(new Date(data.sys.sunset * 1000))
  }

  /**
   * Displays 5-day forecast data in the UI
   * @param {Object} data - Forecast data from API
   */
  function displayForecast(data) {
    const forecastContainer = document.getElementById("forecast-container")
    forecastContainer.innerHTML = ""

    // Group forecast data by day (excluding today)
    const forecastByDay = {}
    const today = new Date().setHours(0, 0, 0, 0)

    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000)
      const day = date.setHours(0, 0, 0, 0)

      // Skip today's forecast
      if (day === today) return

      if (!forecastByDay[day] || date.getHours() === 12) {
        // Prefer data from noon (12:00) for each day
        forecastByDay[day] = item
      }
    })

    // Create forecast cards (limit to 5 days)
    Object.values(forecastByDay)
      .slice(0, 5)
      .forEach((item) => {
        const date = new Date(item.dt * 1000)
        const iconCode = item.weather[0].icon
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`

        const card = document.createElement("div")
        card.className = "forecast-card"
        card.innerHTML = `
          <div class="forecast-date">${formatDay(date, currentLanguage)}</div>
          <img class="forecast-icon" src="${iconUrl}" alt="${item.weather[0].description}">
          <div class="forecast-temp">${Math.round(item.main.temp)}${currentUnit === "metric" ? (currentLanguage === "ar" ? "°م" : "°C") : "°F"}</div>
          <div class="forecast-description">${item.weather[0].description}</div>
          <div class="forecast-details">
            <div><i class="fas fa-tint"></i> ${item.main.humidity}%</div>
            <div><i class="fas fa-wind"></i> ${currentUnit === "metric" ? Math.round(item.wind.speed * 3.6) : Math.round(item.wind.speed)} ${currentUnit === "metric" ? (currentLanguage === "ar" ? "كم/س" : "km/h") : "mph"}</div>
          </div>
        `

        forecastContainer.appendChild(card)
      })
  }

  /**
   * Displays hourly forecast data in the UI
   * @param {Array} hourlyData - Hourly forecast data
   */
  function displayHourlyForecast(hourlyData) {
    const hourlyContainer = document.getElementById("hourly-container")
    hourlyContainer.innerHTML = ""

    hourlyData.forEach((item) => {
      const time = new Date(item.dt * 1000)
      const iconCode = item.weather[0].icon
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`

      const card = document.createElement("div")
      card.className = "hourly-card"
      card.innerHTML = `
        <div class="hourly-time">${formatTime(time)}</div>
        <img class="hourly-icon" src="${iconUrl}" alt="${item.weather[0].description}">
        <div class="hourly-temp">${Math.round(item.main.temp)}${currentUnit === "metric" ? (currentLanguage === "ar" ? "°م" : "°C") : "°F"}</div>
        <div><i class="fas fa-tint"></i> ${item.main.humidity}%</div>
      `

      hourlyContainer.appendChild(card)
    })
  }

  /**
   * Formats a date object to a readable string based on language
   * @param {Date} date - Date object to format
   * @param {string} lang - Language code (ar or en)
   * @returns {string} Formatted date string
   */
  function formatDate(date, lang) {
    if (lang === "ar") {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      return date.toLocaleDateString("ar-EG", options)
    } else {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      return date.toLocaleDateString("en-US", options)
    }
  }

  /**
   * Formats a date object to a short day format based on language
   * @param {Date} date - Date object to format
   * @param {string} lang - Language code (ar or en)
   * @returns {string} Formatted day string
   */
  function formatDay(date, lang) {
    if (lang === "ar") {
      const options = { weekday: "long", day: "numeric", month: "long" }
      return date.toLocaleDateString("ar-EG", options)
    } else {
      const options = { weekday: "short", month: "short", day: "numeric" }
      return date.toLocaleDateString("en-US", options)
    }
  }

  /**
   * Formats a time object to a readable string (HH:MM)
   * @param {Date} date - Date object to format
   * @returns {string} Formatted time string
   */
  function formatTime(date) {
    return date.toLocaleTimeString(currentLanguage === "ar" ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: currentLanguage === "ar" ? true : false,
    })
  }

  /**
   * Displays an error message to the user
   * @param {string} message - Error message to display
   */
  function showError(message) {
    errorMessage.textContent = message
    errorContainer.style.display = "block"
    weatherContainer.classList.add("hidden")
  }
})
