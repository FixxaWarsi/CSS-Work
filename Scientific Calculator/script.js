/**
 * Advanced Scientific Calculator Web Application Core Mechanics Engine
 * Architecture style: Modular Object-Oriented Functional Encapsulation
 */

document.addEventListener("DOMContentLoaded", () => {
    // Component Instance DOM Bindings
    const mainDisplay = document.getElementById("main-display");
    const historyLine = document.getElementById("history-line");
    const livePreview = document.getElementById("live-preview");
    const modeIndicator = document.getElementById("mode-indicator");
    const memIndicator = document.getElementById("mem-indicator");
    const themeToggle = document.getElementById("theme-toggle");
    const soundToggle = document.getElementById("sound-toggle");
    const toggleHistoryBtn = document.getElementById("toggle-history");
    const historyPanel = document.getElementById("history-panel");
    const historyList = document.getElementById("history-list");
    const clearHistoryBtn = document.getElementById("clear-history-btn");
    const exportHistoryBtn = document.getElementById("export-history-btn");
    const copyBtn = document.getElementById("copy-btn");

    // Internal State Machine Configuration Matrices
    let currentInput = "0";
    let calculationExpression = "";
    let isDegreeMode = true;
    let isSoundOn = true;
    let memoryValue = 0;
    let historyData = JSON.parse(localStorage.getItem("calc_history")) || [];
    let currentTheme = localStorage.getItem("calc_theme") || "dark";
    let implicitResetOnNextKey = false;

    // High Audio Performance Context Synthesis (Click Tones)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playClickTone(frequency = 520, duration = 0.04) {
        if (!isSoundOn) return;
        try {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) { console.error("Audio Context initialization deferred.", e); }
    }

    // Initialize Application Defaults
    initApp();

    function initApp() {
        setTheme(currentTheme);
        updateDisplay();
        renderHistory();
        if (localStorage.getItem("calc_memory")) {
            memoryValue = parseFloat(localStorage.getItem("calc_memory"));
            updateMemoryIndicator();
        }
    }

    // Theme Switch Engine Config
    function setTheme(theme) {
        document.documentElement.setAttribute("data-bs-theme", theme);
        localStorage.setItem("calc_theme", theme);
        currentTheme = theme;
        const sunIcon = document.getElementById("theme-sun");
        const moonIcon = document.getElementById("theme-moon");
        if (theme === "light") {
            sunIcon.classList.remove("d-none");
            moonIcon.classList.add("d-none");
        } else {
            sunIcon.classList.add("d-none");
            moonIcon.classList.remove("d-none");
        }
    }

    themeToggle.addEventListener("click", () => {
        playClickTone(640);
        setTheme(currentTheme === "dark" ? "light" : "dark");
    });

    soundToggle.addEventListener("click", () => {
        isSoundOn = !isSoundOn;
        soundToggle.className = isSoundOn ? "btn btn-ctrl text-success" : "btn btn-ctrl text-danger";
        document.getElementById("sound-icon").className = isSoundOn ? "bi bi-volume-up-fill" : "bi bi-volume-mute-fill";
        playClickTone(440);
    });

    modeIndicator.addEventListener("click", () => {
        playClickTone(580);
        isDegreeMode = !isDegreeMode;
        modeIndicator.innerText = isDegreeMode ? "DEG" : "RAD";
        processLivePreview();
    });

    toggleHistoryBtn.addEventListener("click", () => {
        playClickTone(500);
        historyPanel.classList.toggle("d-none");
    });

    // Core Interaction Handler Assignment Matrix
    document.querySelectorAll(".calculator-pad button").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const element = e.currentTarget;
            const action = element.dataset.action;
            const func = element.dataset.func;
            const char = element.dataset.char;

            playClickTone(520);

            if (action) handleAction(action);
            else if (func) handleFunction(func);
            else if (char) handleCharacter(char);
        });
    });

    // Character Input Engine
    function handleCharacter(char) {
        if (implicitResetOnNextKey) {
            if (!isOperator(char) && char !== "^" && char !== "^root") {
                currentInput = "0";
                calculationExpression = "";
            }
            implicitResetOnNextKey = false;
        }

        if (currentInput === "0" && !isOperator(char) && char !== "." && char !== ")") {
            if (char === "π" || char === "e") {
                currentInput = char;
            } else {
                currentInput = char;
            }
        } else {
            // Edge Case Validation Rules
            if (char === "." && currentInput.split(/[\+\-\×\÷\^\(\)]/).pop().includes(".")) return;
            currentInput += char;
        }
        updateDisplay();
    }

    // Custom Functional Direct Action Handler Rules
    function handleAction(action) {
        switch (action) {
            case "ac":
                currentInput = "0";
                calculationExpression = "";
                historyLine.innerText = "";
                livePreview.innerHTML = "&nbsp;";
                implicitResetOnNextKey = false;
                break;
            case "ce":
                currentInput = "0";
                break;
            case "backspace":
                if (currentInput.length > 1) {
                    currentInput = currentInput.slice(0, -1);
                } else {
                    currentInput = "0";
                }
                break;
            case "neg":
                if (currentInput !== "0") {
                    if (currentInput.startsWith("-")) currentInput = currentInput.slice(1);
                    else currentInput = "-" + currentInput;
                }
                break;
            case "rand":
                currentInput = Math.random().toFixed(8).toString();
                break;
            case "equals":
                executeEvaluation();
                break;
            // Memory Function Control Block Matrix
            case "mc": memoryValue = 0; localStorage.removeItem("calc_memory"); updateMemoryIndicator(); break;
            case "mr": currentInput = memoryValue.toString(); implicitResetOnNextKey = false; break;
            case "m+": evaluateMemoryAltering(1); break;
            case "m-": evaluateMemoryAltering(-1); break;
            case "ms":
                let computedVal = silentParseEvaluate(currentInput);
                if (!isNaN(computedVal)) {
                    memoryValue = computedVal;
                    localStorage.setItem("calc_memory", memoryValue);
                }
                updateMemoryIndicator();
                break;
        }
        updateDisplay();
    }

    // High Level Immediate Scientific Function Transform execution 
    function handleFunction(func) {
        let internalVal = silentParseEvaluate(currentInput);
        if (isNaN(internalVal) && func !== "rand") {
            currentInput = "Error";
            updateDisplay();
            return;
        }

        let evaluatedResult = 0;
        switch (func) {
            case "sin": evaluatedResult = isDegreeMode ? Math.sin(internalVal * Math.PI / 180) : Math.sin(internalVal); break;
            case "cos": evaluatedResult = isDegreeMode ? Math.cos(internalVal * Math.PI / 180) : Math.cos(internalVal); break;
            case "tan": evaluatedResult = isDegreeMode ? Math.tan(internalVal * Math.PI / 180) : Math.tan(internalVal); break;
            case "asin": evaluatedResult = isDegreeMode ? Math.asin(internalVal) * 180 / Math.PI : Math.asin(internalVal); break;
            case "acos": evaluatedResult = isDegreeMode ? Math.acos(internalVal) * 180 / Math.PI : Math.acos(internalVal); break;
            case "atan": evaluatedResult = isDegreeMode ? Math.atan(internalVal) * 180 / Math.PI : Math.atan(internalVal); break;
            case "log": evaluatedResult = Math.log10(internalVal); break;
            case "ln": evaluatedResult = Math.log(internalVal); break;
            case "sqr": evaluatedResult = Math.pow(internalVal, 2); break;
            case "cube": evaluatedResult = Math.pow(internalVal, 3); break;
            case "sqrt": evaluatedResult = Math.sqrt(internalVal); break;
            case "cbrt": evaluatedResult = Math.cbrt(internalVal); break;
            case "exp": evaluatedResult = Math.exp(internalVal); break;
            case "tenX": evaluatedResult = Math.pow(10, internalVal); break;
            case "abs": evaluatedResult = Math.abs(internalVal); break;
            case "fact":
                if (internalVal < 0 || !Number.isInteger(internalVal)) { evaluatedResult = NaN; }
                else { evaluatedResult = structuralFactorial(internalVal); }
                break;
        }

        if (isNaN(evaluatedResult) || !isFinite(evaluatedResult)) {
            currentInput = "Error";
        } else {
            currentInput = stripTrailingZeros(parseFloat(evaluatedResult.toFixed(10)));
            implicitResetOnNextKey = true;
        }
        updateDisplay();
    }

    // Helper Utility Math Logic Operations
    function structuralFactorial(n) {
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    function isOperator(c) {
        return ["+", "-", "×", "÷", "%"].includes(c);
    }

    function updateMemoryIndicator() {
        if (memoryValue !== 0) memIndicator.classList.remove("opacity-0");
        else memIndicator.classList.add("opacity-0");
    }

    function evaluateMemoryAltering(multiplier) {
        let computed = silentParseEvaluate(currentInput);
        if (!isNaN(computed)) {
            memoryValue += (computed * multiplier);
            localStorage.setItem("calc_memory", memoryValue);
        }
        updateMemoryIndicator();
    }

    function updateDisplay() {
        mainDisplay.innerText = currentInput;
        autoResizeText();
        processLivePreview();
    }

    function autoResizeText() {
        const len = mainDisplay.innerText.length;
        if (len > 25) { mainDisplay.className = "fs-5 fw-semibold text-wrap text-break"; }
        else if (len > 14) { mainDisplay.className = "fs-3 fw-semibold text-wrap text-break"; }
        else { mainDisplay.className = "fs-1 fw-semibold text-wrap text-break"; }
    }

    // Deep Lexical Syntactic Compiler Translation Engine
    function translateExpressionTokens(exprStr) {
        let intermediate = exprStr
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/π/g, Math.PI.toString())
            .replace(/e/g, Math.E.toString());

        // Evaluation Loop Parsing Rule Logic transformations for custom functional keys
        // Percentage Transformation
        intermediate = intermediate.replace(/([0-9.]+)\s*%/g, "($1/100)");

        // Powered Variable Exponential Notation Loops
        while (intermediate.includes("^")) {
            let matched = intermediate.match(/([0-9.]+)\s*\^\s*([0-9.]+)/);
            if (!matched) matched = intermediate.match(/\(([^)]+)\)\s*\^\s*([0-9.]+)/);
            if (!matched) matched = intermediate.match(/([0-9.]+)\s*\^\s*\(([^)]+)\)/);
            if (!matched) matched = intermediate.match(/\(([^)]+)\)\s*\^\s*\(([^)]+)\)/);

            if (matched) {
                intermediate = intermediate.replace(matched[0], `Math.pow(${matched[1]},${matched[2]})`);
            } else { break; }
        }

        // Custom y-root calculation processing
        while (intermediate.includes("^root")) {
            let matched = intermediate.match(/([0-9.]+)\s*\^root\s*([0-9.]+)/);
            if (matched) {
                intermediate = intermediate.replace(matched[0], `Math.pow(${matched[2]}, 1/${matched[1]})`);
            } else { break; }
        }

        return intermediate;
    }

    function silentParseEvaluate(strExpression) {
        try {
            let optimizedTokens = translateExpressionTokens(strExpression);
            let evaluationResult = new Function(`return (${optimizedTokens})`)();
            return evaluationResult;
        } catch (e) {
            return NaN;
        }
    }

    function processLivePreview() {
        if (isOperator(currentInput.slice(-1)) || currentInput.includes("(") || currentInput.includes("^")) {
            let val = silentParseEvaluate(currentInput);
            if (!isNaN(val) && isFinite(val) && val.toString() !== currentInput) {
                livePreview.innerText = "= " + stripTrailingZeros(parseFloat(val.toFixed(8)));
                return;
            }
        }
        livePreview.innerHTML = "&nbsp;";
    }

    // Formalized Production-Grade Safe Evaluation Strategy
    function executeEvaluation() {
        if (currentInput === "Error" || currentInput === "0") return;

        let trackingRawExpression = currentInput;
        let computedOutput = silentParseEvaluate(currentInput);

        if (isNaN(computedOutput) || !isFinite(computedOutput)) {
            currentInput = "Error";
            livePreview.innerHTML = "&nbsp;";
        } else {
            let formattedValue = stripTrailingZeros(parseFloat(computedOutput.toFixed(10)));
            historyLine.innerText = trackingRawExpression;
            currentInput = formattedValue;
            livePreview.innerHTML = "&nbsp;";
            implicitResetOnNextKey = true;

            // Save record transaction to calculation history stack logs
            pushToHistoryLogStack(trackingRawExpression, formattedValue);
        }
        updateDisplay();
    }

    function stripTrailingZeros(num) {
        return num.toString();
    }

    // Calculation History System Log Management Core Controls
    function pushToHistoryLogStack(expr, output) {
        const structuralRecord = { id: Date.now(), expression: expr, result: output };
        historyData.unshift(structuralRecord);
        if (historyData.length > 30) historyData.pop(); // Limit depth footprint size
        localStorage.setItem("calc_history", JSON.stringify(historyData));
        renderHistory();
    }

    function renderHistory() {
        if (historyData.length === 0) {
            historyList.innerHTML = `<div class="text-muted text-center py-4 empty-msg">No history records yet</div>`;
            return;
        }

        historyList.innerHTML = historyData.map(item => `
            <div class="history-item p-2 mb-2 text-end" data-expr="${item.expression}" data-res="${item.result}">
                <div class="text-muted small text-truncate">${item.expression}</div>
                <div class="fw-bold text-info">${item.result}</div>
            </div>
        `).join("");

        // Attach Reusability Event Interceptors dynamically
        document.querySelectorAll(".history-item").forEach(block => {
            block.addEventListener("click", (e) => {
                playClickTone(460);
                currentInput = e.currentTarget.dataset.expr;
                implicitResetOnNextKey = false;
                updateDisplay();
            });
        });
    }

    clearHistoryBtn.addEventListener("click", () => {
        playClickTone(300, 0.1);
        historyData = [];
        localStorage.removeItem("calc_history");
        renderHistory();
    });

    exportHistoryBtn.addEventListener("click", () => {
        playClickTone(600);
        if (historyData.length === 0) return;
        let stringContentStream = "PREMIUM SCIENTIFIC CALCULATOR - TRANSACTION LOG DATA\r\n";
        stringContentStream += "====================================================\r\n\r\n";
        historyData.forEach((element, orderIndex) => {
            stringContentStream += `[Record #${orderIndex + 1}]  Expression: ${element.expression}\r\n`;
            stringContentStream += `             Final Result: ${element.result}\r\n`;
            stringContentStream += "----------------------------------------------------\r\n";
        });

        const logicalBlob = new Blob([stringContentStream], { type: "text/plain;charset=utf-8" });
        const pseudoElementAnchor = document.createElement("a");
        pseudoElementAnchor.href = URL.createObjectURL(logicalBlob);
        pseudoElementAnchor.download = "calculator-history.txt";
        document.body.appendChild(pseudoElementAnchor);
        pseudoElementAnchor.click();
        document.body.removeChild(pseudoElementAnchor);
    });

    // Copy to Clipboard Engine Mechanics
    copyBtn.addEventListener("click", () => {
        playClickTone(700);
        if (currentInput === "Error") return;
        navigator.clipboard.writeText(currentInput).then(() => {
            const currentHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `<i class="bi bi-check-lg text-success"></i>`;
            setTimeout(() => { copyBtn.innerHTML = currentHTML; }, 1500);
        });
    });

    // Full Matrix Level Desktop Hardware Keyboard Interceptor Module System
    document.addEventListener("keydown", (event) => {
        const key = event.key;

        // Match specific conditions prevents default scrolling properties
        if (["/", "*", "-", "+", "Enter", "Backspace", "Escape"].includes(key)) {
            event.preventDefault();
        }

        // Direct evaluation bindings maps
        if (key >= "0" && key <= "9") handleCharacter(key);
        else if (key === ".") handleCharacter(".");
        else if (key === "+") handleCharacter("+");
        else if (key === "-") handleCharacter("-");
        else if (key === "*") handleCharacter("×");
        else if (key === "/") handleCharacter("÷");
        else if (key === "%") handleCharacter("%");
        else if (key === "(") handleCharacter("(");
        else if (key === ")") handleCharacter(")");
        else if (key === "Enter" || key === "=") { playClickTone(520); handleAction("equals"); }
        else if (key === "Backspace") { playClickTone(520); handleAction("backspace"); }
        else if (key === "Delete" || key === "Escape") { playClickTone(520); handleAction("ac"); }

        // Advanced Scientific Shortcut Interceptors Mapping Layout Structure
        else if (key === "S" || key === "s") handleFunction("sin");
        else if (key === "C" || key === "c") handleFunction("cos");
        else if (key === "T" || key === "t") handleFunction("tan");
        else if (key === "L" || key === "l") handleFunction("log");
        else if (key === "N" || key === "n") handleFunction("ln");
        else if (key === "P" || key === "p") handleCharacter("π");
    });
});