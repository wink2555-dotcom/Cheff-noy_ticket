// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "password";

// Classroom list for dashboard statistics
const CLASSROOMS = ["ม.1/1", "ม.1/2", "ม.2/1", "ม.2/2", "ม.3/1", "ม.3/2"];

// Default Menus lookup
const DEFAULT_MENUS = {
    "A": { "name": "ข้าวผัดอเมริกันสูตรเชฟใหญ่", "desc": "ข้าวผัดซอสมะเขือเทศ เสิร์ฟพร้อมน่องไก่ทอด ไส้กรอก และไข่ดาวกรอบ" },
    "B": { "name": "บะหมี่เกี๊ยวหมูแดงอบน้ำผึ้ง", "desc": "บะหมี่ไข่เหนียวนุ่ม เกี๊ยวหมูคำโต และหมูแดงเนื้อฉ่ำอบน้ำผึ้งแท้" },
    "C": { "name": "แกงเขียวหวานไก่โรตี", "desc": "แกงเขียวหวานไก่รสเข้มข้น หอมกะทิสด ทานคู่กับแป้งโรตีนุ่มๆ" },
    "D": { "name": "ข้าวแกงกะหรี่เต้าหู้ทอด (มังสวิรัติ)", "desc": "แกงกะหรี่ผักรสชาติกลมกล่อม ท็อปด้วยเต้าหู้ทอดกรอบนอกนุ่มใน" }
};

// ==========================================
// APP INITIALIZATION & STATE
// ==========================================
let bookings = [];
let dailyMenus = {};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize DB (Local Storage)
    initDatabase();
    
    // 2. Setup Date Input limits for Student Form
    setupBookingDateLimits();

    // 3. Check Session
    checkSession();
    
    // 4. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// ==========================================
// DATABASE & MOCK DATA MANAGEMENT
// ==========================================
function initDatabase() {
    // Load daily menus configuration
    const storedMenus = localStorage.getItem("canteen_daily_menus");
    if (storedMenus) {
        dailyMenus = JSON.parse(storedMenus);
    } else {
        dailyMenus = {};
    }

    const storedBookings = localStorage.getItem("canteen_bookings");
    
    if (storedBookings) {
        bookings = JSON.parse(storedBookings);
    } else {
        // Generate Mock Data to populate Supervisor Dashboard
        bookings = generateMockBookings();
        localStorage.setItem("canteen_bookings", JSON.stringify(bookings));
    }
}

function saveBookingsToDB() {
    localStorage.setItem("canteen_bookings", JSON.stringify(bookings));
}

function saveDailyMenusToDB() {
    localStorage.setItem("canteen_daily_menus", JSON.stringify(dailyMenus));
}

// Generate about 25 realistic bookings spread across today, yesterday, and tomorrow
function generateMockBookings() {
    const mocks = [];
    const studentIds = [
        "STD1001", "STD1002", "STD1003", "STD1004", "STD1005",
        "STD2001", "STD2002", "STD2003", "STD2004",
        "STD3001", "STD3002", "STD3003", "STD3004", "STD3005"
    ];
    
    const menuKeys = ["A", "B", "C", "D"];
    
    // Get ISO date strings for Yesterday, Today, Tomorrow
    const todayStr = getLocalDateString(new Date());
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    // Seed mock data
    let ticketIndex = 100000;
    
    // Yesterday bookings (10 bookings)
    for (let i = 0; i < 10; i++) {
        const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
        const classroom = CLASSROOMS[Math.floor(Math.random() * CLASSROOMS.length)];
        const menuKey = menuKeys[Math.floor(Math.random() * menuKeys.length)];
        ticketIndex++;
        
        const dayMenus = getMenusForDate(yesterdayStr);
        mocks.push({
            id: `TKT-${ticketIndex}`,
            studentId: studentId,
            classroom: classroom,
            menu: `เมนู ${menuKey}: ${dayMenus[menuKey].name}`,
            date: yesterdayStr,
            createdAt: new Date(yesterday.getTime() - (Math.random() * 8 * 3600000)).toISOString()
        });
    }

    // Today bookings (12 bookings)
    for (let i = 0; i < 12; i++) {
        const studentId = `STD${1000 + i}`; 
        const classroom = CLASSROOMS[i % CLASSROOMS.length];
        const menuKey = menuKeys[Math.floor(Math.random() * menuKeys.length)];
        ticketIndex++;
        
        const dayMenus = getMenusForDate(todayStr);
        mocks.push({
            id: `TKT-${ticketIndex}`,
            studentId: studentId,
            classroom: classroom,
            menu: `เมนู ${menuKey}: ${dayMenus[menuKey].name}`,
            date: todayStr,
            createdAt: new Date().toISOString()
        });
    }

    // Tomorrow bookings (6 bookings)
    for (let i = 0; i < 6; i++) {
        const studentId = `STD${2000 + i}`;
        const classroom = CLASSROOMS[Math.floor(Math.random() * CLASSROOMS.length)];
        const menuKey = menuKeys[Math.floor(Math.random() * menuKeys.length)];
        ticketIndex++;
        
        const dayMenus = getMenusForDate(tomorrowStr);
        mocks.push({
            id: `TKT-${ticketIndex}`,
            studentId: studentId,
            classroom: classroom,
            menu: `เมนู ${menuKey}: ${dayMenus[menuKey].name}`,
            date: tomorrowStr,
            createdAt: new Date().toISOString()
        });
    }

    return mocks;
}

// Helper to get local date string YYYY-MM-DD
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date to local Thai style e.g., 16 ก.ค. 2026
function formatThaiDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const months = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

// Setup Booking Date limits for student form (Today to +7 days, excluding weekends if needed, but here simple 7 days ahead)
function setupBookingDateLimits() {
    const bookingDateInput = document.getElementById("booking-date");
    if (!bookingDateInput) return;
    
    const today = new Date();
    const todayStr = getLocalDateString(today);
    bookingDateInput.min = todayStr;
    
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7); // Allow booking up to 7 days in advance
    bookingDateInput.max = getLocalDateString(maxDate);
    
    // Set default value as today
    bookingDateInput.value = todayStr;
    
    // Render initial menus for default date
    renderDynamicMenusForDate(todayStr);
    
    // Re-render when date changes
    bookingDateInput.addEventListener("change", (e) => {
        renderDynamicMenusForDate(e.target.value);
    });
}

// ==========================================
// DAILY MENU CONFIGURATION HELPERS
// ==========================================
function getMenusForDate(date) {
    if (dailyMenus[date]) {
        return JSON.parse(JSON.stringify(dailyMenus[date]));
    }
    return JSON.parse(JSON.stringify(DEFAULT_MENUS));
}

function renderDynamicMenusForDate(date) {
    const container = document.getElementById("student-menu-options-container");
    if (!container) return;
    
    const dayMenus = getMenusForDate(date);
    
    container.innerHTML = `
        <!-- Menu Option A -->
        <label class="menu-card-label">
            <input type="radio" name="meal-menu" value="เมนู A: ${dayMenus.A.name}" checked required>
            <div class="menu-card-content">
                <div class="menu-tag red-tag">เมนูแนะนำ</div>
                <span class="menu-title">เมนู A: ${dayMenus.A.name}</span>
                <span class="menu-desc">${dayMenus.A.desc}</span>
            </div>
        </label>

        <!-- Menu Option B -->
        <label class="menu-card-label">
            <input type="radio" name="meal-menu" value="เมนู B: ${dayMenus.B.name}">
            <div class="menu-card-content">
                <div class="menu-tag blue-tag">เส้นนุ่ม</div>
                <span class="menu-title">เมนู B: ${dayMenus.B.name}</span>
                <span class="menu-desc">${dayMenus.B.desc}</span>
            </div>
        </label>

        <!-- Menu Option C -->
        <label class="menu-card-label">
            <input type="radio" name="meal-menu" value="เมนู C: ${dayMenus.C.name}">
            <div class="menu-card-content">
                <div class="menu-tag green-tag">ไทยแท้</div>
                <span class="menu-title">เมนู C: ${dayMenus.C.name}</span>
                <span class="menu-desc">${dayMenus.C.desc}</span>
            </div>
        </label>

        <!-- Menu Option D -->
        <label class="menu-card-label">
            <input type="radio" name="meal-menu" value="เมนู D: ${dayMenus.D.name}">
            <div class="menu-card-content">
                <div class="menu-tag white-tag">มังสวิรัติ</div>
                <span class="menu-title">เมนู D: ${dayMenus.D.name}</span>
                <span class="menu-desc">${dayMenus.D.desc}</span>
            </div>
        </label>
    `;
}

function loadMenuConfigForDate(date) {
    if (!date) return;
    
    const dayMenus = getMenusForDate(date);
    
    document.getElementById("config-menu-name-a").value = dayMenus.A.name;
    document.getElementById("config-menu-desc-a").value = dayMenus.A.desc;
    
    document.getElementById("config-menu-name-b").value = dayMenus.B.name;
    document.getElementById("config-menu-desc-b").value = dayMenus.B.desc;
    
    document.getElementById("config-menu-name-c").value = dayMenus.C.name;
    document.getElementById("config-menu-desc-c").value = dayMenus.C.desc;
    
    document.getElementById("config-menu-name-d").value = dayMenus.D.name;
    document.getElementById("config-menu-desc-d").value = dayMenus.D.desc;
}

function saveMenuConfig(event) {
    event.preventDefault();
    
    const date = document.getElementById("menu-config-date").value;
    if (!date) return;
    
    dailyMenus[date] = {
        "A": {
            "name": document.getElementById("config-menu-name-a").value.trim(),
            "desc": document.getElementById("config-menu-desc-a").value.trim()
        },
        "B": {
            "name": document.getElementById("config-menu-name-b").value.trim(),
            "desc": document.getElementById("config-menu-desc-b").value.trim()
        },
        "C": {
            "name": document.getElementById("config-menu-name-c").value.trim(),
            "desc": document.getElementById("config-menu-desc-c").value.trim()
        },
        "D": {
            "name": document.getElementById("config-menu-name-d").value.trim(),
            "desc": document.getElementById("config-menu-desc-d").value.trim()
        }
    };
    
    saveDailyMenusToDB();
    calculateDashboardStats();
    applyFilters();
    showToast(`บันทึกเมนูสำหรับวันที่ ${formatThaiDate(date)} เรียบร้อย!`);
}

function resetMenuToDefaultToday() {
    const date = document.getElementById("menu-config-date").value;
    if (!date) return;
    
    if (confirm(`คุณต้องการรีเซ็ตตารางเมนูของวันที่ ${formatThaiDate(date)} ให้เป็นเมนูเริ่มต้นของโรงเรียนใช่หรือไม่?`)) {
        delete dailyMenus[date];
        saveDailyMenusToDB();
        loadMenuConfigForDate(date);
        calculateDashboardStats();
        applyFilters();
        showToast("รีเซ็ตเป็นเมนูเริ่มต้นของโรงเรียนแล้ว");
    }
}

// ==========================================
// LOGIN & SESSION MANAGEMENT
// ==========================================
function switchLoginTab(role) {
    // Toggle active tab buttons
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`tab-${role}`).classList.add("active");
    
    // Toggle active forms
    document.querySelectorAll(".login-form").forEach(form => form.classList.remove("active"));
    document.getElementById(`${role}-login-form`).classList.add("active");
    
    // Clear errors
    document.getElementById("login-error-msg").style.display = "none";
}

function handleStudentLogin(event) {
    event.preventDefault();
    const studentId = document.getElementById("student-id").value.trim().toUpperCase();
    const classroom = document.getElementById("student-classroom").value;
    
    if (!studentId || !classroom) return;
    
    sessionStorage.setItem("user_role", "student");
    sessionStorage.setItem("student_id", studentId);
    sessionStorage.setItem("student_classroom", classroom);
    
    showToast(`ยินดีต้อนรับนักเรียนรหัส ${studentId}!`);
    loginAsStudent(studentId, classroom);
}

function handleSupervisorLogin(event) {
    event.preventDefault();
    const username = document.getElementById("supervisor-username").value.trim();
    const password = document.getElementById("supervisor-password").value;
    const errorMsg = document.getElementById("login-error-msg");
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem("user_role", "supervisor");
        errorMsg.style.display = "none";
        
        showToast("เข้าสู่ระบบผู้ดูแลเรียบร้อยแล้ว");
        loginAsSupervisor();
    } else {
        errorMsg.textContent = "ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง";
        errorMsg.style.display = "block";
    }
}

function checkSession() {
    const role = sessionStorage.getItem("user_role");
    
    if (role === "student") {
        const studentId = sessionStorage.getItem("student_id");
        const classroom = sessionStorage.getItem("student_classroom");
        loginAsStudent(studentId, classroom);
    } else if (role === "supervisor") {
        loginAsSupervisor();
    } else {
        // Show Login Screen
        showScreen("login-screen");
    }
}

function loginAsStudent(studentId, classroom) {
    // Populate header info
    document.getElementById("display-student-id").textContent = studentId;
    document.getElementById("display-student-class").textContent = `ห้องเรียน: ${classroom}`;
    
    // Clear forms
    document.getElementById("student-login-form").reset();
    
    // Make sure booking date is reset to today and menus are rendered for today
    const bookingDateInput = document.getElementById("booking-date");
    if (bookingDateInput) {
        const todayStr = getLocalDateString(new Date());
        bookingDateInput.value = todayStr;
        renderDynamicMenusForDate(todayStr);
    }
    
    // Render
    renderStudentTickets(studentId);
    showScreen("student-screen");
}

function loginAsSupervisor() {
    // Populate dashboard statistics
    calculateDashboardStats();
    
    // Render table
    renderBookingsTable(bookings);
    
    // Reset filters
    resetFiltersInputs();
    
    // Clear forms
    document.getElementById("supervisor-login-form").reset();
    
    // Setup and load daily menu config for today
    const menuConfigDateInput = document.getElementById("menu-config-date");
    if (menuConfigDateInput) {
        const todayStr = getLocalDateString(new Date());
        menuConfigDateInput.value = todayStr;
        loadMenuConfigForDate(todayStr);
    }
    
    showScreen("supervisor-screen");
}

function logout() {
    sessionStorage.clear();
    showScreen("login-screen");
    showToast("ออกจากระบบเรียบร้อยแล้ว", false);
}

function showScreen(screenId) {
    // Hide all
    document.querySelectorAll(".screen-section").forEach(sec => {
        sec.classList.remove("active");
        sec.style.display = "none";
    });
    
    // Show selected
    const targetScreen = document.getElementById(screenId);
    targetScreen.style.display = "flex";
    
    // Force reflow for CSS animations to kick in
    targetScreen.offsetHeight;
    targetScreen.classList.add("active");
    
    // Rerender Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ==========================================
// STUDENT VIEW: MEAL BOOKING & TICKETS
// ==========================================
function handleMealBooking(event) {
    event.preventDefault();
    
    const studentId = sessionStorage.getItem("student_id");
    const classroom = sessionStorage.getItem("student_classroom");
    const bookingDate = document.getElementById("booking-date").value;
    const selectedMenuVal = document.querySelector('input[name="meal-menu"]:checked').value;
    
    if (!studentId || !classroom || !bookingDate || !selectedMenuVal) return;
    
    // Check if already booked for this specific date
    const alreadyBooked = bookings.some(b => b.studentId === studentId && b.date === bookingDate);
    
    if (alreadyBooked) {
        showToast(`คุณได้ทำการจองตั๋วอาหารสำหรับวันที่ ${formatThaiDate(bookingDate)} ไปแล้ว!`, true);
        return;
    }
    
    // Generate new ticket
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking = {
        id: ticketId,
        studentId: studentId,
        classroom: classroom,
        menu: selectedMenuVal,
        date: bookingDate,
        createdAt: new Date().toISOString()
    };
    
    // Add to list and save
    bookings.push(newBooking);
    saveBookingsToDB();
    
    // Refresh UI
    renderStudentTickets(studentId);
    showToast("จองตั๋วอาหารสำเร็จเรียบร้อย!");
}

function renderStudentTickets(studentId) {
    const container = document.getElementById("student-tickets-container");
    
    // Filter bookings for this student
    const studentBookings = bookings.filter(b => b.studentId === studentId);
    
    // Sort: Future/Latest dates first
    studentBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (studentBookings.length === 0) {
        container.innerHTML = `
            <div class="no-tickets-placeholder">
                <i data-lucide="info" size="32"></i>
                <p>ยังไม่มีรายการจองตั๋วข้าวของคุณในระบบ</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    const todayStr = getLocalDateString(new Date());
    
    container.innerHTML = studentBookings.map(ticket => {
        // Can only cancel ticket if the meal date is in the future
        const canCancel = ticket.date >= todayStr;
        
        return `
            <div class="food-ticket fade-in">
                <div class="food-ticket-main">
                    <div class="ticket-details">
                        <div class="ticket-header">
                            <span class="ticket-tag">${getMenuShortLabel(ticket.menu)}</span>
                            <span class="ticket-date"><i data-lucide="calendar" style="width:12px; height:12px; display:inline; vertical-align:middle; margin-right:3px;"></i> วันที่ทาน: ${formatThaiDate(ticket.date)}</span>
                        </div>
                        <div class="ticket-menu-title">${ticket.menu}</div>
                        <div class="ticket-meta-row">
                            <span>รหัส: <strong>${ticket.studentId}</strong></span>
                            <span>ห้อง: <strong>${ticket.classroom}</strong></span>
                        </div>
                    </div>
                    ${canCancel ? `
                        <button class="ticket-delete-btn" onclick="cancelBooking('${ticket.id}')" title="ยกเลิกการจอง">
                            <i data-lucide="trash-2"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="food-ticket-barcode">
                    <div class="barcode-visual"></div>
                    <div class="barcode-text">${ticket.id}</div>
                </div>
            </div>
        `;
    }).join("");
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function cancelBooking(ticketId) {
    if (confirm("คุณต้องการยกเลิกการจองอาหารสำหรับตั๋วใบนี้ใช่หรือไม่?")) {
        bookings = bookings.filter(b => b.id !== ticketId);
        saveBookingsToDB();
        
        const studentId = sessionStorage.getItem("student_id");
        renderStudentTickets(studentId);
        showToast("ยกเลิกรายการจองอาหารเรียบร้อยแล้ว", false);
    }
}

// Get A, B, C, D from menu string
function getMenuShortLabel(menuStr) {
    if (menuStr.includes("เมนู A")) return "MENU A";
    if (menuStr.includes("เมนู B")) return "MENU B";
    if (menuStr.includes("เมนู C")) return "MENU C";
    if (menuStr.includes("เมนู D")) return "MENU D";
    return "TICKET";
}

// ==========================================
// SUPERVISOR VIEW: STATISTICS & MANAGEMENT
// ==========================================
function calculateDashboardStats() {
    const totalBookingsVal = bookings.length;
    document.getElementById("stat-total-bookings").textContent = totalBookingsVal;
    
    // Today's Date
    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    // Format for display
    document.getElementById("stat-today-date").textContent = formatThaiDate(todayStr);
    
    // Today's Bookings Count
    const todayBookings = bookings.filter(b => b.date === todayStr);
    document.getElementById("stat-today-bookings").textContent = todayBookings.length;
    
    // Menu counts & calculations
    const menuCounts = { A: 0, B: 0, C: 0, D: 0 };
    bookings.forEach(b => {
        if (b.menu.includes("เมนู A")) menuCounts.A++;
        else if (b.menu.includes("เมนู B")) menuCounts.B++;
        else if (b.menu.includes("เมนู C")) menuCounts.C++;
        else if (b.menu.includes("เมนู D")) menuCounts.D++;
    });
    
    // Update Menu Progress Bars
    const maxMenuCount = Math.max(menuCounts.A, menuCounts.B, menuCounts.C, menuCounts.D, 1);
    
    // Dynamically update breakdown labels based on today's menus
    const todayMenus = getMenusForDate(todayStr);
    
    const labelA = document.getElementById("breakdown-count-a").previousElementSibling;
    if (labelA) labelA.textContent = `เมนู A: ${todayMenus.A.name}`;
    
    const labelB = document.getElementById("breakdown-count-b").previousElementSibling;
    if (labelB) labelB.textContent = `เมนู B: ${todayMenus.B.name}`;
    
    const labelC = document.getElementById("breakdown-count-c").previousElementSibling;
    if (labelC) labelC.textContent = `เมนู C: ${todayMenus.C.name}`;
    
    const labelD = document.getElementById("breakdown-count-d").previousElementSibling;
    if (labelD) labelD.textContent = `เมนู D: ${todayMenus.D.name}`;

    document.getElementById("breakdown-count-a").textContent = `${menuCounts.A} กล่อง`;
    document.getElementById("progress-a").style.width = `${(menuCounts.A / maxMenuCount) * 100}%`;
    
    document.getElementById("breakdown-count-b").textContent = `${menuCounts.B} กล่อง`;
    document.getElementById("progress-b").style.width = `${(menuCounts.B / maxMenuCount) * 100}%`;
    
    document.getElementById("breakdown-count-c").textContent = `${menuCounts.C} กล่อง`;
    document.getElementById("progress-c").style.width = `${(menuCounts.C / maxMenuCount) * 100}%`;
    
    document.getElementById("breakdown-count-d").textContent = `${menuCounts.D} กล่อง`;
    document.getElementById("progress-d").style.width = `${(menuCounts.D / maxMenuCount) * 100}%`;
    
    // Popular Menu Title & Count
    let popularMenuName = "-";
    let maxMenuVal = 0;
    
    if (menuCounts.A > maxMenuVal) { popularMenuName = "ข้าวผัดอเมริกัน"; maxMenuVal = menuCounts.A; }
    if (menuCounts.B > maxMenuVal) { popularMenuName = "บะหมี่เกี๊ยวหมูแดง"; maxMenuVal = menuCounts.B; }
    if (menuCounts.C > maxMenuVal) { popularMenuName = "แกงเขียวหวานไก่"; maxMenuVal = menuCounts.C; }
    if (menuCounts.D > maxMenuVal) { popularMenuName = "แกงกะหรี่เต้าหู้ (มังสวิรัติ)"; maxMenuVal = menuCounts.D; }
    
    document.getElementById("stat-popular-menu").textContent = popularMenuName;
    document.getElementById("stat-popular-count").textContent = `${maxMenuVal} กล่อง`;
    
    // Classroom Stats Grid & Popular Classroom Calculation
    const classCounts = {};
    CLASSROOMS.forEach(c => classCounts[c] = 0);
    
    bookings.forEach(b => {
        if (classCounts[b.classroom] !== undefined) {
            classCounts[b.classroom]++;
        }
    });
    
    let popularClass = "-";
    let maxClassCount = 0;
    
    // Render Classroom stats
    const classroomGrid = document.getElementById("classroom-grid-stats");
    classroomGrid.innerHTML = CLASSROOMS.map(cls => {
        const count = classCounts[cls];
        if (count > maxClassCount) {
            maxClassCount = count;
            popularClass = cls;
        }
        
        return `
            <div class="class-stat-card">
                <span class="class-stat-name">${cls}</span>
                <span class="class-stat-count">${count}</span>
            </div>
        `;
    }).join("");
    
    document.getElementById("stat-popular-class").textContent = popularClass;
    document.getElementById("stat-popular-class-count").textContent = `${maxClassCount} รายการ`;
}

function renderBookingsTable(data) {
    const tbody = document.getElementById("bookings-table-body");
    const noDataMsg = document.getElementById("no-data-msg");
    
    // Sort: Date descending, then ID descending
    const sortedData = [...data].sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return b.id.localeCompare(a.id);
    });
    
    if (sortedData.length === 0) {
        tbody.innerHTML = "";
        noDataMsg.classList.remove("hidden");
        return;
    }
    
    noDataMsg.classList.add("hidden");
    tbody.innerHTML = sortedData.map(b => {
        const createdDate = new Date(b.createdAt);
        const createdTimeStr = `${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')} น.`;
        const createdDateStr = `${formatThaiDate(getLocalDateString(createdDate))} ${createdTimeStr}`;
        
        return `
            <tr>
                <td><strong>${b.studentId}</strong></td>
                <td>${b.classroom}</td>
                <td>${b.menu}</td>
                <td>${formatThaiDate(b.date)}</td>
                <td class="font-sm" style="color:var(--text-muted);">${createdDateStr}</td>
                <td>
                    <button class="btn btn-outline btn-logout btn-sm" onclick="adminDeleteBooking('${b.id}')" style="padding:6px 12px; font-size:0.85rem;" title="ลบการจอง">
                        <i data-lucide="trash-2" style="width:14px; height:14px;"></i> ลบรายการ
                    </button>
                </td>
            </tr>
        `;
    }).join("");
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function adminDeleteBooking(ticketId) {
    if (confirm(`คุณต้องการลบรายการจองตั๋วข้าวหมายเลข ${ticketId} หรือไม่? (การกระทำนี้จะลบรายการจองถาวร)`)) {
        bookings = bookings.filter(b => b.id !== ticketId);
        saveBookingsToDB();
        
        // Refresh Supervisor UI
        calculateDashboardStats();
        applyFilters(); // Apply filter to current state
        showToast("ลบข้อมูลสำเร็จ", false);
    }
}

// ==========================================
// SUPERVISOR DASHBOARD: FILTERING & EXPORT
// ==========================================
function resetFiltersInputs() {
    document.getElementById("filter-student-id").value = "";
    document.getElementById("filter-classroom").value = "all";
    document.getElementById("filter-menu").value = "all";
    document.getElementById("filter-date").value = "";
}

function resetFilters() {
    resetFiltersInputs();
    renderBookingsTable(bookings);
    showToast("รีเซ็ตตัวกรองแล้ว");
}

function applyFilters() {
    const studentSearchVal = document.getElementById("filter-student-id").value.trim().toUpperCase();
    const classroomFilterVal = document.getElementById("filter-classroom").value;
    const menuFilterVal = document.getElementById("filter-menu").value;
    const dateFilterVal = document.getElementById("filter-date").value;
    
    const filtered = bookings.filter(b => {
        // 1. Search student ID
        const matchesStudent = studentSearchVal === "" || b.studentId.includes(studentSearchVal);
        
        // 2. Filter classroom
        const matchesClassroom = classroomFilterVal === "all" || b.classroom === classroomFilterVal;
        
        // 3. Filter menu option
        let matchesMenu = true;
        if (menuFilterVal !== "all") {
            matchesMenu = b.menu.includes(`เมนู ${menuFilterVal}`);
        }
        
        // 4. Filter date
        const matchesDate = dateFilterVal === "" || b.date === dateFilterVal;
        
        return matchesStudent && matchesClassroom && matchesMenu && matchesDate;
    });
    
    renderBookingsTable(filtered);
}

// Export Filtered Table data to CSV
function exportToCSV() {
    // 1. Get filtered list of bookings
    const studentSearchVal = document.getElementById("filter-student-id").value.trim().toUpperCase();
    const classroomFilterVal = document.getElementById("filter-classroom").value;
    const menuFilterVal = document.getElementById("filter-menu").value;
    const dateFilterVal = document.getElementById("filter-date").value;
    
    const filteredBookings = bookings.filter(b => {
        const matchesStudent = studentSearchVal === "" || b.studentId.includes(studentSearchVal);
        const matchesClassroom = classroomFilterVal === "all" || b.classroom === classroomFilterVal;
        let matchesMenu = true;
        if (menuFilterVal !== "all") {
            matchesMenu = b.menu.includes(`เมนู ${menuFilterVal}`);
        }
        const matchesDate = dateFilterVal === "" || b.date === dateFilterVal;
        return matchesStudent && matchesClassroom && matchesMenu && matchesDate;
    });
    
    if (filteredBookings.length === 0) {
        showToast("ไม่มีข้อมูลให้ออกรายงาน", true);
        return;
    }

    // 2. Define Headers
    const headers = ["Ticket ID", "รหัสนักเรียน", "ห้องเรียน", "เมนูอาหาร", "วันที่รับอาหาร", "วันที่ทำรายการ"];
    
    // 3. Convert Rows
    const rows = filteredBookings.map(b => {
        const cleanMenu = b.menu.replace(/"/g, '""'); // escape quotes
        const createdDate = new Date(b.createdAt).toLocaleString('th-TH');
        return [
            b.id,
            b.studentId,
            b.classroom,
            `"${cleanMenu}"`,
            b.date,
            `"${createdDate}"`
        ];
    });
    
    // Join CSV data
    const csvContent = [headers.join(",")].concat(rows.map(r => r.join(","))).join("\n");
    
    // 4. Create Blob with UTF-8 BOM so MS Excel opens Thai characters correctly!
    const BOM = "\ufeff";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // 5. Generate dynamic name with timestamp
    const timestamp = new Date().toISOString().slice(0,10);
    const fileName = `Meal_Bookings_Report_${timestamp}.csv`;
    
    // 6. Trigger Download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`ดาวน์โหลดรายงาน ${fileName} สำเร็จ!`);
}

// ==========================================
// TOAST NOTIFICATIONS UTILITY
// ==========================================
let toastTimer = null;
function showToast(message, isDanger = false) {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toast-message");
    
    if (!toast || !toastMsg) return;
    
    clearTimeout(toastTimer);
    
    toastMsg.textContent = message;
    
    if (isDanger) {
        toast.classList.add("danger");
    } else {
        toast.classList.remove("danger");
    }
    
    toast.classList.add("active");
    
    toastTimer = setTimeout(() => {
        toast.classList.remove("active");
    }, 3000);
}
