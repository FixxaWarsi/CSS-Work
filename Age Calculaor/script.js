document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dobInput = document.getElementById('dob');
    const ageForm = document.getElementById('ageForm');
    const resetBtn = document.getElementById('resetBtn');
    const errorText = document.getElementById('errorText');
    const errorMessageContent = document.getElementById('errorMessageContent');
    const resultsSection = document.getElementById('resultsSection');

    // Result Display Elements
    const yearsVal = document.getElementById('yearsVal');
    const monthsVal = document.getElementById('monthsVal');
    const daysVal = document.getElementById('daysVal');

    const nextBdaySub = document.getElementById('nextBdaySub');
    const nextBdayDays = document.getElementById('nextBdayDays');

    const totalMonths = document.getElementById('totalMonths');
    const totalWeeks = document.getElementById('totalWeeks');
    const totalDays = document.getElementById('totalDays');
    const totalHours = document.getElementById('totalHours');
    const totalMinutes = document.getElementById('totalMinutes');
    const totalSeconds = document.getElementById('totalSeconds');

    let timerInterval = null;
    let userBirthDate = null;

    // Restrict input date to today or past dates
    const todayDate = new Date();
    dobInput.max = todayDate.toISOString().split('T')[0];

    // Submit Event Handler
    ageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const inputValue = dobInput.value;

        // Validation: Check if input is empty
        if (!inputValue) {
            showError('Please select your date of birth.');
            return;
        }

        const birthDate = new Date(`${inputValue}T00:00:00`);
        const now = new Date();

        // Validation: Check if input is in the future
        if (birthDate > now) {
            showError('Date of birth cannot be in the future.');
            return;
        }

        // Hide error message if valid
        hideError();

        // Save selected birth date
        userBirthDate = birthDate;

        // Calculate & Display Age
        calculateAge(userBirthDate);
        resultsSection.classList.remove('hidden');

        // Start live update timer for total seconds
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (userBirthDate) {
                updateLiveTime(userBirthDate);
            }
        }, 1000);
    });

    // Reset Event Handler
    resetBtn.addEventListener('click', () => {
        ageForm.reset();
        hideError();
        resultsSection.classList.add('hidden');
        if (timerInterval) clearInterval(timerInterval);
        userBirthDate = null;
    });

    // Helper: Display Validation Error
    function showError(message) {
        errorMessageContent.textContent = message;
        errorText.classList.remove('hidden');
    }

    // Helper: Hide Validation Error
    function hideError() {
        errorText.classList.add('hidden');
    }

    // Accurate Age Calculation
    function calculateAge(birthDate) {
        const now = new Date();

        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();
        let days = now.getDate() - birthDate.getDate();

        // Handle days difference (taking last month's length)
        if (days < 0) {
            months--;
            const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            days += prevMonthDays;
        }

        // Handle months difference
        if (months < 0) {
            years--;
            months += 12;
        }

        // Render main age values
        yearsVal.textContent = years;
        monthsVal.textContent = months;
        daysVal.textContent = days;

        // Render next birthday & total statistics
        calculateNextBirthday(birthDate, now);
        updateLiveTime(birthDate);
    }

    // Calculate Next Birthday Countdown
    function calculateNextBirthday(birthDate, now) {
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();
        let nextYear = now.getFullYear();

        let nextBday = new Date(nextYear, birthMonth, birthDay);

        // Handle leap year Feb 29 birth dates
        if (birthMonth === 1 && birthDay === 29 && !isLeapYear(nextYear)) {
            nextBday = new Date(nextYear, 2, 1);
        }

        // Check if today is birthday
        if (now.getMonth() === birthMonth && now.getDate() === birthDay) {
            nextBdaySub.textContent = "🎉 Happy Birthday!";
            nextBdayDays.textContent = "0";
            return;
        }

        // If birthday has passed this year, get next year's date
        if (now > nextBday) {
            nextYear++;
            nextBday = new Date(nextYear, birthMonth, birthDay);
            if (birthMonth === 1 && birthDay === 29 && !isLeapYear(nextYear)) {
                nextBday = new Date(nextYear, 2, 1);
            }
        }

        const diffTime = nextBday - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = daysOfWeek[nextBday.getDay()];

        nextBdaySub.textContent = `Occurs on a ${dayName}`;
        nextBdayDays.textContent = diffDays;
    }

    // Calculate Total Units Lived & Update Live Seconds
    function updateLiveTime(birthDate) {
        const now = new Date();
        const diffMs = now - birthDate;

        if (diffMs < 0) return;

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);

        let months = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
        if (now.getDate() < birthDate.getDate()) months--;

        totalMonths.textContent = months.toLocaleString();
        totalWeeks.textContent = weeks.toLocaleString();
        totalDays.textContent = days.toLocaleString();
        totalHours.textContent = hours.toLocaleString();
        totalMinutes.textContent = minutes.toLocaleString();
        totalSeconds.textContent = seconds.toLocaleString();
    }

    // Helper: Check if a year is a leap year
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
});