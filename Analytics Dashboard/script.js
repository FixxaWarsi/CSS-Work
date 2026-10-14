
// MOCK DATA INITIALIZATION
const initialEmployees = [
    { id: 1, name: "Alex Morgan", email: "alex.m@pulse.io", dept: "Engineering", role: "Senior Frontend Lead", perf: 94, goals: 90, status: "Active" },
    { id: 2, name: "Sarah Jenkins", email: "sarah.j@pulse.io", dept: "Marketing", role: "Growth Specialist", perf: 88, goals: 82, status: "Active" },
    { id: 3, name: "Michael Chen", email: "m.chen@pulse.io", dept: "Engineering", role: "Backend Architect", perf: 91, goals: 95, status: "Active" },
    { id: 4, name: "Emily Watson", email: "e.watson@pulse.io", dept: "HR", role: "HR Generalist", perf: 85, goals: 78, status: "Active" },
    { id: 5, name: "David Kim", email: "d.kim@pulse.io", dept: "Sales", role: "Enterprise AE", perf: 96, goals: 100, status: "Remote" },
    { id: 6, name: "Jessica Taylor", email: "j.taylor@pulse.io", dept: "Finance", role: "Financial Analyst", perf: 82, goals: 70, status: "Active" },
    { id: 7, name: "James Wilson", email: "j.wilson@pulse.io", dept: "Operations", role: "Operations Lead", perf: 79, goals: 75, status: "On Leave" },
    { id: 8, name: "Sophia Martinez", email: "s.martinez@pulse.io", dept: "Engineering", role: "UI Designer", perf: 92, goals: 88, status: "Active" },
    { id: 9, name: "Robert Taylor", email: "r.taylor@pulse.io", dept: "Sales", role: "Account Executive", perf: 84, goals: 80, status: "Active" },
    { id: 10, name: "Olivia Anderson", email: "o.anderson@pulse.io", dept: "Marketing", role: "Content Lead", perf: 89, goals: 85, status: "Remote" }
];

const initialGoals = [
    { id: 101, title: "Migration to Micro-frontends", owner: "Alex Morgan", dept: "Engineering", progress: 80, dueDate: "2026-08-15", priority: "High", status: "In Progress" },
    { id: 102, title: "Q3 Ad Campaign Scaling", owner: "Sarah Jenkins", dept: "Marketing", progress: 100, dueDate: "2026-07-30", priority: "Medium", status: "Completed" },
    { id: 103, title: "SOC2 Compliance Audit", owner: "James Wilson", dept: "Operations", progress: 45, dueDate: "2026-09-01", priority: "High", status: "At Risk" },
    { id: 104, title: "Revamp Enterprise Sales Funnel", owner: "David Kim", dept: "Sales", progress: 65, dueDate: "2026-08-30", priority: "High", status: "In Progress" }
];

const initialNotifications = [
    { id: 1, text: "Sarah Jenkins completed 'Q3 Ad Campaign'", time: "10m ago", unread: true },
    { id: 2, text: "Engineering perf score increased +3%", time: "1h ago", unread: true },
    { id: 3, text: "New team member onboarded", time: "1d ago", unread: false }
];

const initialReports = [
    { id: 201, name: 'Monthly Team Performance', type: 'Performance', frequency: 'Monthly', owner: 'Alex Morgan', status: 'Active' },
    { id: 202, name: 'Employee Engagement Summary', type: 'Engagement', frequency: 'Monthly', owner: 'HR Team', status: 'Active' },
    { id: 203, name: 'Attendance & Leave Audit', type: 'Attendance', frequency: 'Weekly', owner: 'HR Team', status: 'Draft' }
];

class DashboardApp {
    constructor() {
        this.employees = this.readStorage('pa_employees', initialEmployees);
        this.goals = this.readStorage('pa_goals', initialGoals)
            .filter(g => !(String(g.title).trim().toLowerCase() === 'hbj' && String(g.owner).trim().toLowerCase() === 'i56' && String(g.dept).trim().toLowerCase() === 'engineering'));
        this.notifications = this.readStorage('pa_notifications', initialNotifications);
        this.reports = this.readStorage('pa_reports', initialReports);
        this.theme = localStorage.getItem('pa_theme') || 'light';
        this.currentRole = localStorage.getItem('pa_role') || 'Admin';
        this.currentView = 'overview';
        this.charts = {};
        this.saveState();

        this.init();
    }

    readStorage(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return structuredClone(fallback);
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : structuredClone(fallback);
        } catch (error) {
            console.warn(`Storage read failed for ${key}`, error);
            return structuredClone(fallback);
        }
    }

    init() {
        this.setTheme(this.theme);
        this.bindEvents();
        this.updateRoleUI();
        this.renderAll();
    }

    saveState() {
        localStorage.setItem('pa_employees', JSON.stringify(this.employees));
        localStorage.setItem('pa_goals', JSON.stringify(this.goals));
        localStorage.setItem('pa_notifications', JSON.stringify(this.notifications));
        localStorage.setItem('pa_reports', JSON.stringify(this.reports));
        localStorage.setItem('pa_theme', this.theme);
        localStorage.setItem('pa_role', this.currentRole);
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                this.navigateTo(view);
            });
        });

        // Sidebar / responsive navigation
        const sidebar = document.getElementById('sidebar');
        const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
        const mobileToggleBtn = document.getElementById('mobileToggleBtn');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const isMobileViewport = () => window.innerWidth <= 768;

        // Restore the user's desktop collapse preference, but never let it
        // make the mobile drawer appear as an icon-only rail.
        const savedCollapsed = localStorage.getItem('pa_sidebar_collapsed') === '1';
        if (savedCollapsed && !isMobileViewport()) sidebar.classList.add('collapsed');

        const syncSidebarIcon = () => {
            const icon = sidebarToggleBtn?.querySelector('i');
            if (!icon) return;
            icon.className = sidebar.classList.contains('collapsed')
                ? 'fa-solid fa-chevron-right'
                : 'fa-solid fa-chevron-left';
        };
        syncSidebarIcon();

        sidebarToggleBtn?.addEventListener('click', () => {
            if (isMobileViewport()) return;
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('pa_sidebar_collapsed', sidebar.classList.contains('collapsed') ? '1' : '0');
            syncSidebarIcon();
        });

        const closeMobileMenu = () => {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';

            // Restore the desktop preference only after leaving the drawer.
            if (!isMobileViewport() && localStorage.getItem('pa_sidebar_collapsed') === '1') {
                sidebar.classList.add('collapsed');
            }
            syncSidebarIcon();
        };

        const openMobileMenu = () => {
            // A mobile drawer must ALWAYS open at full width, even when the
            // desktop sidebar was previously collapsed.
            sidebar.classList.remove('collapsed');
            sidebar.classList.add('mobile-open');
            mobileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        mobileToggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar.classList.contains('mobile-open')) closeMobileMenu();
            else openMobileMenu();
        });

        mobileOverlay.addEventListener('click', closeMobileMenu);

        // Escape should always close the mobile drawer.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
                closeMobileMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (!isMobileViewport()) {
                sidebar.classList.remove('mobile-open');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
                if (localStorage.getItem('pa_sidebar_collapsed') === '1') sidebar.classList.add('collapsed');
                syncSidebarIcon();
            }
        });

        // Profile Dropdown Toggle
        document.getElementById('userProfileBtn').addEventListener('click', () => {
            document.getElementById('userDropdown').classList.toggle('show');
        });

        // Notifications Toggle
        document.getElementById('notifBellBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('notificationDropdown').classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#userProfileBtn') && !e.target.closest('#userDropdown')) {
                document.getElementById('userDropdown').classList.remove('show');
            }
            if (!e.target.closest('#notifBellBtn') && !e.target.closest('#notificationDropdown')) {
                document.getElementById('notificationDropdown').classList.remove('show');
            }
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModal(overlay.id);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(m => this.closeModal(m.id));
                document.getElementById('notificationDropdown').classList.remove('show');
                document.getElementById('userDropdown').classList.remove('show');
            }
        });

        // Theme Toggle
        document.getElementById('themeToggleBtn').addEventListener('click', () => {
            this.setTheme(this.theme === 'light' ? 'dark' : 'light');
        });

        // Global Search
        document.getElementById('globalSearchInput').addEventListener('input', (e) => {
            e.currentTarget.classList.toggle('has-value', Boolean(e.currentTarget.value.trim()));
            this.handleGlobalSearch(e.currentTarget.value);
        });

        // Reports
        const addReportBtn = document.getElementById('addReportBtn');
        if (addReportBtn) {
            addReportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openReportModal();
            });
        }

        // Role Switcher
        document.getElementById('roleSelector').value = this.currentRole;
        document.getElementById('roleSelector').addEventListener('change', (e) => {
            this.currentRole = e.target.value;
            this.saveState();
            this.updateRoleUI();
            this.showToast(`Switched view to ${this.currentRole} role`, 'info');
        });

        // Filters
        document.getElementById('empSearchInput').addEventListener('input', () => this.renderEmployeesTable());
        document.getElementById('empDeptFilter').addEventListener('change', () => this.renderEmployeesTable());
        document.getElementById('empStatusFilter').addEventListener('change', () => this.renderEmployeesTable());
        document.getElementById('attendanceDeptFilter')?.addEventListener('change', () => this.renderAttendanceTable());
        document.getElementById('attendanceStatusFilter')?.addEventListener('change', () => this.renderAttendanceTable());
        document.getElementById('attendanceSearchInput')?.addEventListener('input', () => this.renderAttendanceTable());
        const attendanceClearBtn = document.getElementById('attendanceClearFilters');
        if (attendanceClearBtn) {
            attendanceClearBtn.addEventListener('click', () => this.clearAttendanceFilters());
        }
        const attendanceRefreshBtn = document.getElementById('attendanceRefreshBtn');
        if (attendanceRefreshBtn) {
            attendanceRefreshBtn.addEventListener('click', () => {
                attendanceRefreshBtn.classList.add('syncing');
                this.renderAttendanceTable();
                setTimeout(() => attendanceRefreshBtn.classList.remove('syncing'), 650);
                this.showToast('Attendance data refreshed', 'success');
            });
        }

        // Employee avatar upload + live preview.
        const avatarInput = document.getElementById('empFormAvatar');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file || !file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = () => {
                    document.getElementById('empFormAvatarPreview').src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        }
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        const btnIcon = document.querySelector('#themeToggleBtn i');
        if (theme === 'dark') {
            btnIcon.className = 'fa-solid fa-sun';
        } else {
            btnIcon.className = 'fa-solid fa-moon';
        }
        const select = document.getElementById('settingsThemeSelect');
        if (select) select.value = theme;
        this.saveState();
        this.renderCharts();
    }

    navigateTo(viewId) {
        this.currentView = viewId;
        document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.menu-link[data-view="${viewId}"]`);
        if (activeLink) activeLink.classList.add('active');

        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        const targetView = document.getElementById(`${viewId}-view`);
        if (targetView) targetView.classList.add('active');

        // Header update
        const titleMap = {
            'overview': 'Overview',
            'team-performance': 'Team Performance',
            'employees': 'Employees',
            'goals': 'Goals & KPIs',
            'attendance': 'Attendance',
            'reports': 'Reports',
            'settings': 'Settings'
        };
        document.getElementById('pageTitle').innerText = titleMap[viewId] || 'Dashboard';
        document.getElementById('breadcrumbCurrent').innerText = titleMap[viewId] || 'Overview';

        document.getElementById('sidebar').classList.remove('mobile-open');
        document.getElementById('mobileOverlay').classList.remove('active');
        document.body.style.overflow = '';
        if (window.innerWidth > 768 && localStorage.getItem('pa_sidebar_collapsed') === '1') {
            document.getElementById('sidebar').classList.add('collapsed');
        }
        this.renderCharts();
    }

    updateRoleUI() {
        document.getElementById('currentUserRoleLabel').innerText = this.currentRole;
        document.getElementById('userProfileModalRole').innerText = this.currentRole;
        const permissions = {
            'Admin': ['role-admin-hr', 'role-admin-mgr'],
            'HR Manager': ['role-admin-hr', 'role-admin-mgr'],
            'Department Manager': ['role-admin-mgr'],
            'Team Lead': [],
            'Employee': []
        };
        document.querySelectorAll('.role-admin-hr, .role-admin-mgr').forEach(el => {
            const allowed = permissions[this.currentRole] || [];
            const cls = el.classList.contains('role-admin-hr') ? 'role-admin-hr' : 'role-admin-mgr';
            el.style.display = allowed.includes(cls) ? '' : 'none';
        });
    }

    renderAll() {
        this.renderKPIs();
        this.renderEmployeesTable();
        this.renderDepartments();
        this.renderGoalsTable();
        this.renderAttendanceTable();
        this.renderNotifications();
        this.renderReportsTable();
        this.renderCharts();
    }

    renderKPIs() {
        const totalEmp = this.employees.length;
        const avgPerf = (this.employees.reduce((acc, curr) => acc + Number(curr.perf), 0) / (totalEmp || 1)).toFixed(1);
        const avgGoal = (this.employees.reduce((acc, curr) => acc + Number(curr.goals), 0) / (totalEmp || 1)).toFixed(1);

        this.animateValue('kpiTotalEmployees', 0, totalEmp, 600);
        this.animateValue('kpiAvgPerformance', 0, avgPerf, 600, '%');
        this.animateValue('kpiGoalCompletion', 0, avgGoal, 600, '%');
        this.animateValue('kpiEngagement', 0, 91.2, 600, '%');
    }

    animateValue(id, start, end, duration, suffix = '') {
        const obj = document.getElementById(id);
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const val = (progress * (end - start) + start).toFixed(suffix ? 1 : 0);
            obj.innerHTML = val + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    renderEmployeesTable() {
        const tbody = document.getElementById('employeeTableBody');
        const search = document.getElementById('empSearchInput').value.toLowerCase();
        const dept = document.getElementById('empDeptFilter').value;
        const status = document.getElementById('empStatusFilter').value;

        const filtered = this.employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(search) || emp.email.toLowerCase().includes(search);
            const matchesDept = dept === 'All' || emp.dept === dept;
            const matchesStatus = status === 'All' || emp.status === status;
            return matchesSearch && matchesDept && matchesStatus;
        });

        document.getElementById('empResultCount').innerText = `Showing ${filtered.length} employees`;

        tbody.innerHTML = filtered.length ? filtered.map(emp => `
                    <tr>
                        <td>
                            <div class="employee-cell">
                                <img src="${emp.avatar || `https://i.pravatar.cc/150?img=${(Number(emp.id) % 70) + 1}`}" class="employee-avatar" alt="${emp.name}" onerror="this.onerror=null;this.src='https://i.pravatar.cc/150?img=68';">
                                <div class="employee-info-text">
                                    <span class="emp-name">${emp.name}</span>
                                    <span class="emp-email">${emp.email}</span>
                                </div>
                            </div>
                        </td>
                        <td>${emp.dept}</td>
                        <td>${emp.role}</td>
                        <td>
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: ${emp.perf}%;"></div>
                            </div>
                            ${emp.perf}%
                        </td>
                        <td>${emp.goals}%</td>
                        <td><span class="status-badge status-${emp.status.toLowerCase().replace(' ', '-')}">${emp.status}</span></td>
                        <td>
                            <button class="btn btn-secondary" style="padding:0.25rem 0.5rem;" onclick="app.editEmployee(${emp.id})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-danger" style="padding:0.25rem 0.5rem;" onclick="app.deleteEmployee(${emp.id})"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('') : `<tr><td colspan="7" class="empty-state">No employees found.</td></tr>`;
    }

    resetEmpFilters() {
        document.getElementById('empSearchInput').value = '';
        document.getElementById('empDeptFilter').value = 'All';
        document.getElementById('empStatusFilter').value = 'All';
        this.renderEmployeesTable();
    }

    renderDepartments() {
        const container = document.getElementById('departmentCardsContainer');
        const depts = ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'];

        container.innerHTML = depts.map(d => {
            const deptEmps = this.employees.filter(e => e.dept === d);
            const avgPerf = (deptEmps.reduce((a, b) => a + Number(b.perf), 0) / (deptEmps.length || 1)).toFixed(1);
            return `
                        <div class="dept-card" onclick="app.showDepartmentDetails('${d}')">
                            <div class="dept-card-header">
                                <span class="dept-name">${d}</span>
                                <span class="status-badge status-active">${deptEmps.length} Members</span>
                            </div>
                            <div class="dept-stats">
                                <div class="dept-stat-item">
                                    <div style="font-size:0.75rem; color:var(--text-muted);">Avg. Performance</div>
                                    <div style="font-weight:700; font-size:1.1rem; color:var(--primary);">${avgPerf}%</div>
                                </div>
                                <div class="dept-stat-item">
                                    <div style="font-size:0.75rem; color:var(--text-muted);">Health Index</div>
                                    <div style="font-weight:700; font-size:1.1rem; color:var(--success);">Optimal</div>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('');
    }

    showDepartmentDetails(dept) {
        const members = this.employees.filter(e => e.dept === dept);
        const avgPerf = (members.reduce((a, b) => a + Number(b.perf), 0) / (members.length || 1)).toFixed(1);
        this.showToast(`${dept}: ${members.length} members, ${avgPerf}% average performance`, 'info');
    }

    renderGoalsTable() {
        const tbody = document.getElementById('goalsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.goals.length ? this.goals.map(g => {
            const progress = Math.max(0, Math.min(100, Number(g.progress) || 0));
            const status = g.status || 'In Progress';
            const statusClass = status.toLowerCase().replace(/\s+/g, '-');
            const priorityClass = g.priority === 'High' ? 'goal-priority-high' :
                g.priority === 'Medium' ? 'goal-priority-medium' : 'goal-priority-low';
            return `
                <tr>
                    <td style="font-weight:600;">${this.escapeHtml(g.title || '')}</td>
                    <td>${this.escapeHtml(g.owner || '')}</td>
                    <td>${this.escapeHtml(g.dept || '')}</td>
                    <td>
                        <div class="goal-progress-cell">
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width:${progress}%;"></div>
                            </div>
                            <span>${progress}%</span>
                        </div>
                    </td>
                    <td>${this.escapeHtml(g.dueDate || '')}</td>
                    <td><span class="goal-priority ${priorityClass}">${this.escapeHtml(g.priority || 'Low')}</span></td>
                    <td><span class="status-badge status-${statusClass}">${this.escapeHtml(status)}</span></td>
                    <td>
                        <div class="goal-actions">
                            <button type="button" class="btn btn-secondary role-admin-mgr" title="Edit goal" aria-label="Edit goal" onclick="app.editGoal(${g.id})">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button type="button" class="btn btn-danger role-admin-mgr" title="Delete goal" aria-label="Delete goal" onclick="app.deleteGoal(${g.id})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('') : `<tr><td colspan="8" class="empty-state">No goals found. Create your first goal using the button above.</td></tr>`;

        this.updateRoleUI();
    }


    clearAttendanceFilters() {
        const search = document.getElementById('attendanceSearchInput');
        const dept = document.getElementById('attendanceDeptFilter');
        const status = document.getElementById('attendanceStatusFilter');
        if (search) search.value = '';
        if (dept) dept.value = 'All';
        if (status) status.value = 'All';
        this.renderAttendanceTable();
        this.showToast('Attendance filters cleared', 'info');
    }

    renderAttendanceTable() {
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) return;
        const dept = document.getElementById('attendanceDeptFilter')?.value || 'All';
        const statusFilter = document.getElementById('attendanceStatusFilter')?.value || 'All';
        const search = (document.getElementById('attendanceSearchInput')?.value || '').trim().toLowerCase();

        const getAttendanceStatus = (e) => {
            const idx = Number(e.id) || 0;
            return idx % 9 === 0 ? 'Leave' : idx % 4 === 0 ? 'Late' : idx % 3 === 0 ? 'Remote' : 'Present';
        };

        const filtered = this.employees.filter(e => {
            const status = getAttendanceStatus(e);
            const matchesDept = dept === 'All' || e.dept === dept;
            const matchesStatus = statusFilter === 'All' || status === statusFilter;
            const matchesSearch = !search || String(e.name || '').toLowerCase().includes(search) || String(e.dept || '').toLowerCase().includes(search);
            return matchesDept && matchesStatus && matchesSearch;
        });

        const rows = filtered.map(e => {
            const idx = Number(e.id) || 0;
            const status = getAttendanceStatus(e);
            const mode = status === 'Remote' ? 'Remote' : status === 'Leave' ? '—' : 'On-site';
            const checkIn = status === 'Leave' ? '—' : status === 'Late' ? '09:' + String(15 + (idx % 18)).padStart(2, '0') : '08:' + String(35 + (idx % 20)).padStart(2, '0');
            const presentDays = status === 'Leave' ? 18 : 19 + (idx % 2);
            const rate = status === 'Leave' ? '90.0' : status === 'Late' ? '94.7' : status === 'Remote' ? '96.1' : '98.2';
            const rateClass = Number(rate) >= 97 ? 'var(--success)' : Number(rate) >= 94 ? 'var(--primary)' : 'var(--warning)';
            return `<tr>
                <td><div class="employee-cell"><span class="emp-name">${this.escapeHtml(e.name)}</span></div></td>
                <td>${this.escapeHtml(e.dept)}</td>
                <td><span class="attendance-status"><span class="attendance-status-dot ${status.toLowerCase()}"></span>${status}</span></td>
                <td><span class="attendance-mode">${mode}</span></td>
                <td>${checkIn}</td>
                <td>${presentDays} days</td>
                <td><span style="font-weight:700;color:${rateClass}">${rate}%</span></td>
            </tr>`;
        }).join('');
        tbody.innerHTML = rows || `<tr><td colspan="7" class="empty-state">No attendance records match the selected filters.</td></tr>`;

        const total = this.employees.length || 1;
        const statuses = this.employees.map(getAttendanceStatus);
        const present = statuses.filter(s => s === 'Present' || s === 'Late' || s === 'Remote').length;
        const remote = statuses.filter(s => s === 'Remote').length;
        const late = statuses.filter(s => s === 'Late').length;
        const absent = statuses.filter(s => s === 'Leave').length;
        const health = Math.round((present / total) * 100);
        const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
        setText('attPresentToday', present); setText('attRemoteToday', remote); setText('attLateToday', late); setText('attHealthRate', health + '%');
        setText('attPresentSub', `${Math.round((present / total) * 100)}% of workforce`); setText('attLegendPresent', present); setText('attLegendRemote', remote); setText('attLegendAbsent', absent);
        setText('attendanceRingValue', health + '%');
        setText('attendanceUpdatedText', 'Updated just now');
        const ring = document.getElementById('attendanceRing');
        if (ring) ring.style.background = `conic-gradient(var(--primary) ${health * 3.6}deg, var(--border-color) ${health * 3.6}deg)`;
        const liveTime = document.getElementById('attendanceLiveTime');
        if (liveTime) liveTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    renderNotifications() {
        const list = document.getElementById('notificationList');
        const badge = document.getElementById('notifBadge');
        const unreadCount = this.notifications.filter(n => n.unread).length;

        badge.style.display = unreadCount > 0 ? 'block' : 'none';

        list.innerHTML = this.notifications.map(n => `
                    <div class="notification-item ${n.unread ? 'unread' : ''}" onclick="app.readNotification(${n.id})">
                        <i class="fa-solid fa-circle-info" style="color:var(--primary); margin-top:3px;"></i>
                        <div>
                            <div>${n.text}</div>
                            <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">${n.time}</div>
                        </div>
                    </div>
                `).join('');
    }

    readNotification(id) {
        const target = this.notifications.find(n => n.id === id);
        if (target) target.unread = false;
        this.saveState();
        this.renderNotifications();
    }

    markAllNotificationsRead() {
        this.notifications.forEach(n => n.unread = false);
        this.saveState();
        this.renderNotifications();
    }

    handleGlobalSearch(query) {
        const dropdown = document.getElementById('searchResultsDropdown');
        if (!query.trim()) {
            dropdown.classList.remove('show');
            return;
        }

        const matches = this.employees.filter(e => e.name.toLowerCase().includes(query.toLowerCase()) || e.dept.toLowerCase().includes(query.toLowerCase()));
        if (matches.length === 0) {
            dropdown.innerHTML = `<div class="search-result-item"><span class="search-result-title">No results found</span></div>`;
        } else {
            dropdown.innerHTML = matches.map(m => `
                        <div class="search-result-item" onclick="app.navigateTo('employees'); document.getElementById('searchResultsDropdown').classList.remove('show');">
                            <div class="search-result-title">${m.name}</div>
                            <div class="search-result-type">${m.dept} • ${m.role}</div>
                        </div>
                    `).join('');
        }
        dropdown.classList.add('show');
    }

    /* CHARTS RENDERING */
    renderCharts() {
        const isDark = this.theme === 'dark';
        const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        // Chart 1: Trend Line
        const ctx1 = document.getElementById('overviewTrendChart')?.getContext('2d');
        if (ctx1) {
            if (this.charts.trend) this.charts.trend.destroy();
            this.charts.trend = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [
                        { label: 'Performance', data: [78, 82, 80, 85, 87, 89, 92], borderColor: '#4f46e5', tension: 0.4, fill: false },
                        { label: 'Goal Completion', data: [70, 72, 75, 78, 80, 82, 86], borderColor: '#10b981', tension: 0.4, fill: false }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { color: gridColor }, ticks: { color: textColor } },
                        y: { grid: { color: gridColor }, ticks: { color: textColor } }
                    },
                    plugins: { legend: { labels: { color: textColor } } }
                }
            });
        }

        // Chart 2: Distribution
        const ctx2 = document.getElementById('overviewDistributionChart')?.getContext('2d');
        if (ctx2) {
            if (this.charts.dist) this.charts.dist.destroy();
            this.charts.dist = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Outstanding', 'Strong', 'Average', 'Needs Improvement'],
                    datasets: [{
                        data: [35, 45, 15, 5],
                        backgroundColor: ['#10b981', '#4f46e5', '#f59e0b', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: textColor } } }
                }
            });
        }

        // Chart 3: Department Comparison
        const ctx3 = document.getElementById('departmentComparisonChart')?.getContext('2d');
        if (ctx3) {
            if (this.charts.dept) this.charts.dept.destroy();
            this.charts.dept = new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'],
                    datasets: [{
                        label: 'Average Score (%)',
                        data: [91, 86, 88, 82, 85, 79],
                        backgroundColor: '#4f46e5',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { display: false }, ticks: { color: textColor } },
                        y: { grid: { color: gridColor }, ticks: { color: textColor }, max: 100 }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }

        // Chart 4: Attendance Pulse
        const ctx4 = document.getElementById('attendanceChart')?.getContext('2d');
        if (ctx4) {
            if (this.charts.att) this.charts.att.destroy();
            this.charts.att = new Chart(ctx4, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    datasets: [
                        { label: 'On-site', data: [78, 82, 80, 86, 84], borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.10)', fill: true, tension: .4, pointRadius: 4 },
                        { label: 'Remote', data: [22, 18, 20, 14, 16], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)', fill: true, tension: .4, pointRadius: 4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: textColor } },
                        y: { beginAtZero: true, suggestedMax: 100, grid: { color: gridColor }, ticks: { color: textColor, callback: value => value + '%' } }
                    },
                    plugins: { legend: { labels: { color: textColor, usePointStyle: true } } }
                }
            });
        }
    }

    /* MODAL / ACTION HANDLERS */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        if (!document.querySelector('.modal-overlay.active')) document.body.style.overflow = '';
    }

    handleEmployeeFormSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('empFormId').value;
        const name = document.getElementById('empFormName').value.trim();
        const email = document.getElementById('empFormEmail').value.trim();
        const dept = document.getElementById('empFormDept').value;
        const role = document.getElementById('empFormRole').value.trim();
        const perf = Number(document.getElementById('empFormPerf').value);
        const goals = Number(document.getElementById('empFormGoals').value);
        const status = document.getElementById('empFormStatus').value;
        const avatar = document.getElementById('empFormAvatarPreview').src;

        if (id) {
            const emp = this.employees.find(x => x.id == id);
            if (emp) {
                emp.name = name;
                emp.email = email;
                emp.dept = dept;
                emp.role = role;
                emp.perf = perf;
                emp.goals = goals;
                emp.status = status;
                if (avatar) emp.avatar = avatar;
                this.showToast('Employee details updated');
            }
        } else {
            this.employees.push({
                id: Date.now(),
                name, email, dept, role, perf, goals, status,
                avatar: avatar || `https://i.pravatar.cc/150?img=${(Date.now() % 70) + 1}`
            });
            this.showToast('New employee added successfully');
        }

        this.saveState();
        this.renderAll();
        this.closeModal('addEmployeeModal');
        this.resetEmployeeForm();
    }

    resetEmployeeForm() {
        const form = document.getElementById('employeeForm');
        if (form) form.reset();
        document.getElementById('empFormId').value = '';
        document.getElementById('employeeModalTitle').innerText = 'Add New Employee';
        document.getElementById('empFormAvatarPreview').src = 'https://i.pravatar.cc/150?img=68';
    }

    removeEmployeeAvatar() {
        document.getElementById('empFormAvatar').value = '';
        document.getElementById('empFormAvatarPreview').src = 'https://i.pravatar.cc/150?img=68';
    }

    editEmployee(id) {
        const emp = this.employees.find(x => x.id === id);
        if (!emp) return;

        document.getElementById('empFormId').value = emp.id;
        document.getElementById('empFormName').value = emp.name;
        document.getElementById('empFormEmail').value = emp.email;
        document.getElementById('empFormDept').value = emp.dept;
        document.getElementById('empFormRole').value = emp.role;
        document.getElementById('empFormPerf').value = emp.perf;
        document.getElementById('empFormGoals').value = emp.goals;
        document.getElementById('empFormStatus').value = emp.status;
        document.getElementById('empFormAvatarPreview').src = emp.avatar || `https://i.pravatar.cc/150?img=${(Number(emp.id) % 70) + 1}`;
        document.getElementById('empFormAvatar').value = '';

        document.getElementById('employeeModalTitle').innerText = 'Edit Employee';
        this.openModal('addEmployeeModal');
    }

    deleteEmployee(id) {
        if (confirm('Are you sure you want to delete this employee?')) {
            this.employees = this.employees.filter(x => x.id !== id);
            this.saveState();
            this.renderAll();
            this.showToast('Employee removed', 'warning');
        }
    }

    openGoalModal(goal = null) {
        const form = document.getElementById('goalForm');
        if (!form) return;

        form.reset();
        document.getElementById('goalFormId').value = goal?.id ?? '';
        document.getElementById('goalTitle').value = goal?.title ?? '';
        document.getElementById('goalOwner').value = goal?.owner ?? '';
        document.getElementById('goalDept').value = goal?.dept ?? 'Engineering';
        document.getElementById('goalDueDate').value = goal?.dueDate ?? '';
        document.getElementById('goalPriority').value = goal?.priority ?? 'Low';
        document.getElementById('goalProgress').value = goal?.progress ?? 0;
        document.getElementById('goalStatus').value = goal?.status ?? 'In Progress';
        document.getElementById('goalModalTitle').innerText = goal ? 'Edit Goal' : 'Create New Goal';
        document.getElementById('goalSubmitBtn').innerHTML = goal ? '<i class="fa-solid fa-check"></i> Save Changes' : 'Create Target';

        this.openModal('addGoalModal');
        requestAnimationFrame(() => document.getElementById('goalTitle')?.focus());
    }

    editGoal(id) {
        const goal = this.goals.find(g => String(g.id) === String(id));
        if (!goal) {
            this.showToast('The selected goal no longer exists.', 'error');
            return;
        }
        this.openGoalModal(goal);
    }

    deleteGoal(id) {
        const goal = this.goals.find(g => String(g.id) === String(id));
        if (!goal) return;

        if (!confirm(`Are you sure you want to delete "${goal.title}"?`)) return;

        this.goals = this.goals.filter(g => String(g.id) !== String(id));
        this.saveState();
        this.renderGoalsTable();
        this.showToast('Goal deleted successfully', 'warning');
    }

    handleGoalFormSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const id = document.getElementById('goalFormId').value.trim();
        const data = {
            title: document.getElementById('goalTitle').value.trim(),
            owner: document.getElementById('goalOwner').value.trim(),
            dept: document.getElementById('goalDept').value,
            progress: Math.max(0, Math.min(100, Number(document.getElementById('goalProgress').value) || 0)),
            dueDate: document.getElementById('goalDueDate').value,
            priority: document.getElementById('goalPriority').value,
            status: document.getElementById('goalStatus').value
        };

        if (id) {
            const goal = this.goals.find(g => String(g.id) === id);
            if (!goal) {
                this.showToast('The selected goal no longer exists.', 'error');
                return;
            }
            Object.assign(goal, data);
            this.showToast('Goal updated successfully', 'success');
        } else {
            this.goals.push({ id: Date.now(), ...data });
            this.showToast('New goal created successfully', 'success');
        }

        this.saveState();
        this.renderGoalsTable();
        this.closeModal('addGoalModal');
        form.reset();
        document.getElementById('goalFormId').value = '';
        document.getElementById('goalModalTitle').innerText = 'Create New Goal';
        document.getElementById('goalSubmitBtn').innerHTML = 'Create Target';
    }


    renderReportsTable() {
        const tbody = document.getElementById('reportsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.reports.length ? this.reports.map(report => `
            <tr>
                <td style="font-weight:600;">${this.escapeHtml(report.name)}</td>
                <td>${this.escapeHtml(report.type)}</td>
                <td>${this.escapeHtml(report.frequency)}</td>
                <td>${this.escapeHtml(report.owner)}</td>
                <td><span class="status-badge status-${String(report.status || 'Draft').toLowerCase().replace(/\s+/g, '-')}">${this.escapeHtml(report.status || 'Draft')}</span></td>
                <td>
                    <div class="report-actions">
                        <button class="btn btn-secondary" title="Generate report" onclick="app.generateReport('${this.escapeJs(report.name)}')">
                            <i class="fa-solid fa-play"></i>
                        </button>
                        <button class="btn btn-secondary role-admin-hr" title="Edit report" onclick="app.editReport(${report.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-danger role-admin-hr" title="Delete report" onclick="app.deleteReport(${report.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') : `<tr><td colspan="6" class="empty-state">No saved reports found.</td></tr>`;

        this.updateRoleUI();
    }

    openReportModal(report = null) {
        const form = document.getElementById('reportForm');
        if (!form) return;

        // Reset first so a new report never inherits values from a previous edit.
        if (!report) form.reset();

        document.getElementById('reportFormId').value = report?.id ?? '';
        document.getElementById('reportFormName').value = report?.name ?? '';
        document.getElementById('reportFormType').value = report?.type ?? 'Performance';
        document.getElementById('reportFormFrequency').value = report?.frequency ?? 'Monthly';
        document.getElementById('reportFormOwner').value = report?.owner ?? '';
        document.getElementById('reportFormStatus').value = report?.status ?? 'Active';
        document.getElementById('reportModalTitle').innerText = report ? 'Edit Report' : 'Add Report';

        this.openModal('reportModal');

        // Focus the first field after the modal becomes visible.
        requestAnimationFrame(() => {
            document.getElementById('reportFormName')?.focus();
        });
    }

    editReport(id) {
        const report = this.reports.find(r => r.id === id);
        if (report) this.openReportModal(report);
    }

    deleteReport(id) {
        const report = this.reports.find(r => r.id === id);
        if (!report) return;
        if (!confirm(`Delete "${report.name}"?`)) return;
        this.reports = this.reports.filter(r => r.id !== id);
        this.saveState();
        this.renderReportsTable();
        this.showToast('Report deleted', 'warning');
    }

    handleReportFormSubmit(e) {
        e.preventDefault();

        const form = e.currentTarget;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const id = document.getElementById('reportFormId').value.trim();
        const data = {
            name: document.getElementById('reportFormName').value.trim(),
            type: document.getElementById('reportFormType').value,
            frequency: document.getElementById('reportFormFrequency').value,
            owner: document.getElementById('reportFormOwner').value.trim(),
            status: document.getElementById('reportFormStatus').value
        };

        if (!data.name || !data.owner) {
            this.showToast('Please complete all required fields.', 'error');
            return;
        }

        if (id) {
            const report = this.reports.find(r => String(r.id) === id);
            if (!report) {
                this.showToast('The selected report no longer exists.', 'error');
                return;
            }
            Object.assign(report, data);
            this.showToast('Report updated successfully', 'success');
        } else {
            this.reports.push({
                id: Date.now(),
                ...data
            });
            this.showToast('Report added successfully', 'success');
        }

        this.saveState();
        this.renderReportsTable();
        this.closeModal('reportModal');
        form.reset();
        document.getElementById('reportFormId').value = '';
    }

    escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[char]));
    }

    escapeJs(value) {
        return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    openExportModal() {
        this.openModal('exportModal');
    }

    executeExport() {
        const dataset = document.getElementById('exportDatasetSelect').value;
        const format = document.getElementById('exportFormatSelect').value;

        let dataToExport = this.employees;
        if (dataset === 'goals') dataToExport = this.goals;
        if (dataset === 'attendance') dataToExport = this.employees.map(e => ({
            employee: e.name, department: e.dept, presentDays: 20, lateDays: 1, absentDays: 0, attendanceRate: '95.2%'
        }));

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            this.triggerDownload(blob, `${dataset}_export.json`);
        } else if (format === 'csv') {
            const keys = dataToExport.length ? Object.keys(dataToExport[0]) : ['Message'];
            const csvEscape = value => `"${String(value ?? '').replaceAll('\"', '\"\"')}"`;
            const rows = dataToExport.length
                ? [keys.map(csvEscape).join(','), ...dataToExport.map(row => keys.map(k => csvEscape(row[k])).join(','))]
                : [csvEscape('No records found')];
            const csvContent = rows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            this.triggerDownload(blob, `${dataset}_export.csv`);
        } else if (format === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(`${dataset.toUpperCase()} REPORT`, 10, 10);
            let y = 20;
            dataToExport.forEach((item, index) => {
                doc.text(`${index + 1}. ${item.name || item.title || 'Entry'}`, 10, y);
                y += 10;
            });
            doc.save(`${dataset}_report.pdf`);
        }

        this.closeModal('exportModal');
        this.showToast(`Exported ${dataset} as ${format.toUpperCase()}`);
    }

    triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    generateReport(title) {
        this.showToast(`Generating ${title}...`, 'info');
        setTimeout(() => {
            this.showToast(`${title} generated!`, 'success');
        }, 1000);
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
        toast.innerHTML = `
                    <i class="fa-solid ${icons[type] || icons.success}"></i>
                    <span>${message}</span>
                `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    signOut() {
        document.getElementById('userDropdown')?.classList.remove('show');
        document.body.style.overflow = '';
        this.showToast('Signed out successfully', 'info');
    }

    resetAllData() {
        if (confirm('Reset all application state to initial mock data?')) {
            ['pa_employees', 'pa_goals', 'pa_notifications', 'pa_reports', 'pa_theme', 'pa_role', 'pa_sidebar_collapsed']
                .forEach(key => localStorage.removeItem(key));
            location.reload();
        }
    }
}

// INITIALIZE APP
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new DashboardApp();
    window.app = app;
});