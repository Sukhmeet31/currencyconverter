const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const form = document.getElementById("converter-form");
const resultDiv = document.getElementById("result");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");
const toggleDarkMode = document.getElementById("toggleDarkMode");

const API_KEY = "21638129ea8bd87242d7313f"; // Replace with your key

// Dark mode toggle
toggleDarkMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  toggleDarkMode.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Load currency codes
async function loadCurrencies() {
  const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/codes`);
  const data = await res.json();

  if (data.result !== "success") {
    resultDiv.textContent = "Failed to load currencies.";
    return;
  }

  const codes = data.supported_codes;

  codes.forEach(([code, name]) => {
    const option1 = new Option(`${code} - ${name}`, code);
    const option2 = option1.cloneNode(true);
    fromCurrency.add(option1);
    toCurrency.add(option2);
  });

  fromCurrency.value = "USD";
  toCurrency.value = "INR";
}

loadCurrencies();

// Load history from localStorage
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
  historyList.innerHTML = "";
  history.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = entry;
    historyList.appendChild(li);
  });
}

// Save to history
function saveToHistory(entry) {
  const history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
  history.unshift(entry); // Add to top
  localStorage.setItem("conversionHistory", JSON.stringify(history.slice(0, 10))); // Keep latest 10
  loadHistory();
}

// Clear history
clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("conversionHistory");
  loadHistory();
});

// Conversion logic
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("amount").value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount) || amount <= 0) {
    resultDiv.textContent = "Enter a valid amount.";
    return;
  }

  resultDiv.textContent = "Converting...";

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${from}/${to}/${amount}`);
    const data = await res.json();

    if (data.result === "success") {
      const converted = data.conversion_result.toFixed(2);
      const output = `${amount} ${from} = ${converted} ${to}`;
      resultDiv.textContent = output;
      saveToHistory(output);
    } else {
      resultDiv.textContent = "Conversion failed.";
    }
  } catch (err) {
    console.error(err);
    resultDiv.textContent = "Error fetching conversion.";
  }
});

// Load history on page load
loadHistory();
