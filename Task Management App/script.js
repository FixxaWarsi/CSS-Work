document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // I. STATE MANAGEMENT & DATA BLUEPRINTS
    // ==========================================
    let state = {
        boards: [],
        tasks: [],
        activeBoardId: null,
        theme: 'light',
        filters: {
            searchQuery: '',
            priority: 'All',
            deadline: 'All'
        }
    };

    const defaultBoards = [
        { id: 'b1', name: '💼 Work Tasks' },
        { id: 'b2', name: '🏠 Personal Routine' }
    ];

    const defaultTasks = [
        { id: 't1', boardId: 'b1', title: 'Setup System Project Board Architecture', desc: 'Deploy application wireframe shell, responsive flex properties using clean native framework assets structure.', priority: 'High', deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], status: 'To Do', created: new Date().toLocaleDateString() },
        { id: 't2', boardId: 'b1', title: 'Polish Component UX Theme Styling Layer', desc: 'Verify high level responsive break constraints on viewports scaling down across grid layers layout definitions.', priority: 'Medium', deadline: new Date().toISOString().split('T')[0], status: 'In Progress', created: new Date().toLocaleDateString() },
        { id: 't3', boardId: 'b2', title: 'Weekly Groceries Run Shopping Task', desc: 'Replenish organic greens inventory, stock dairy proteins units, check wholesale grains dry components inventory tracking.', priority: 'Low', deadline: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: 'To Do', created: new Date().toLocaleDateString() }
    ];

    // Bootstrap instances cache
    const boardModal = new bootstrap.Modal(document.getElementById('boardModal'));
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));

    // ==========================================
    // II. LOCAL STORAGE SYSTEM ENGINE FUNCTIONS
    // ==========================================
    function loadStateFromStorage() {
        try {
            const storedBoards = localStorage.getItem('taskflow_boards');
            const storedTasks = localStorage.getItem('taskflow_tasks');
            const storedTheme = localStorage.getItem('taskflow_theme');
            const storedActiveBoard = localStorage.getItem('taskflow_active_board_id');

            state.boards = storedBoards ? JSON.parse(storedBoards) : defaultBoards;
            state.tasks = storedTasks ? JSON.parse(storedTasks) : defaultTasks;
            state.theme = storedTheme ? storedTheme : 'light';

            if (storedActiveBoard && state.boards.some(b => b.id === storedActiveBoard)) {
                state.activeBoardId = storedActiveBoard;
            } else {
                state.activeBoardId = state.boards.length > 0 ? state.boards[0].id : null;
            }
        } catch (e) {
            console.error("Local storage allocation pipeline reading failure error context reset native states", e);
            state.boards = defaultBoards;
            state.tasks = defaultTasks;
            state.theme = 'light';
            state.activeBoardId = 'b1';
        }
        saveStateToStorage();
    }

    function saveStateToStorage() {
        localStorage.setItem('taskflow_boards', JSON.stringify(state.boards));
        localStorage.setItem('taskflow_tasks', JSON.stringify(state.tasks));
        localStorage.setItem('taskflow_theme', state.theme);
        localStorage.setItem('taskflow_active_board_id', state.activeBoardId);
    }

    // ==========================================
    // III. THEME MANAGEMENT INFRASTRUCTURE
    // ==========================================
    function initThemeEngine() {
        const htmlEl = document.documentElement;
        const themeIcon = document.getElementById('theme-icon');

        if (state.theme === 'dark') {
            htmlEl.setAttribute('data-bs-theme', 'dark');
            themeIcon.className = 'bi bi-sun';
        } else {
            htmlEl.setAttribute('data-bs-theme', 'light');
            themeIcon.className = 'bi bi-moon-stars';
        }
    }

    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        initThemeEngine();
        saveStateToStorage();
        showToastNotification(`Switched interface setting style layout framework layer tracking.`);
    });

    // ==========================================
    // IV. NOTIFICATIONS UTILITY PIPELINES
    // ==========================================
    function showToastNotification(message, type = 'success') {
        const toastWrapper = document.getElementById('toast-rendering-wrapper');
        const id = 'toast_' + Date.now();
        const iconMap = { success: 'bi-check-circle-fill text-success', danger: 'bi-exclamation-triangle-fill text-danger', warning: 'bi-exclamation-circle-fill text-warning' };

        const htmlString = `
                    <div id="${id}" class="toast align-items-center border-0 glass-card" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
                        <div class="d-flex">
                            <div class="toast-body d-flex align-items-center gap-2">
                                <i class="bi ${iconMap[type] || 'bi-info-circle-fill'}"></i>
                                <span class="fw-medium">${message}</span>
                            </div>
                            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                    </div>`;

        toastWrapper.insertAdjacentHTML('beforeend', htmlString);
        const element = document.getElementById(id);
        const bsToast = new bootstrap.Toast(element);
        bsToast.show();

        element.addEventListener('hidden.bs.toast', () => {
            element.remove();
        });
    }

    // ==========================================
    // V. COMPONENT MUTATION LIFECYCLE (CRUD)
    // ==========================================

    // Boards Engine CRUD Management mapping Logic processing
    document.getElementById('board-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('board-title');
        const name = titleInput.value.trim();
        if (!name) return;

        const isEditing = document.getElementById('boardModalLabel').hasAttribute('data-edit-id');

        if (isEditing) {
            const targetId = document.getElementById('boardModalLabel').getAttribute('data-edit-id');
            const targetBoard = state.boards.find(b => b.id === targetId);
            if (targetBoard) {
                targetBoard.name = name;
                showToastNotification(`Board title string reference updated.`);
            }
        } else {
            const newBoard = {
                id: 'board_' + Date.now(),
                name: name
            };
            state.boards.push(newBoard);
            state.activeBoardId = newBoard.id;
            showToastNotification(`Successfully cataloged new tracking project board.`);
        }

        boardModal.hide();
        titleInput.value = '';
        saveStateToStorage();
        renderAppLayoutView();
    });

    document.getElementById('btn-rename-board').addEventListener('click', () => {
        if (!state.activeBoardId) return;
        const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
        if (!activeBoard) return;

        document.getElementById('boardModalLabel').innerText = "Rename Current Workspace Board";
        document.getElementById('boardModalLabel').setAttribute('data-edit-id', activeBoard.id);
        document.getElementById('board-title').value = activeBoard.name;
        boardModal.show();
    });

    document.getElementById('btn-delete-board').addEventListener('click', () => {
        if (!state.activeBoardId) return;

        const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
        const confirmation = confirm(`Are you absolutely sure you want to delete board "${activeBoard?.name}"?\nAll embedded task entries will be lost forever.`);
        if (!confirmation) return;

        state.tasks = state.tasks.filter(t => t.boardId !== state.activeBoardId);
        state.boards = state.boards.filter(b => b.id !== state.activeBoardId);
        state.activeBoardId = state.boards.length > 0 ? state.boards[0].id : null;

        saveStateToStorage();
        showToastNotification(`Workspace deleted completely.`, 'danger');
        renderAppLayoutView();
    });

    // Tasks Engine CRUD Management Pipeline Implementation mapping
    document.getElementById('btn-create-task').addEventListener('click', () => {
        document.getElementById('task-form').classList.remove('was-validated');
        document.getElementById('task-form').reset();
        document.getElementById('task-edit-id').value = '';
        document.getElementById('taskModalLabel').innerHTML = '<i class="bi bi-plus-circle text-primary me-2"></i>Create Structural Task';
        document.getElementById('btn-task-form-submit').innerText = "Save Component Task";
    });

    document.getElementById('task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;

        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        if (!state.activeBoardId) {
            showToastNotification("Please select or build a tracking workspace board container wrapper before adding nodes.", "warning");
            taskModal.hide();
            return;
        }

        const editId = document.getElementById('task-edit-id').value;
        const title = document.getElementById('task-title').value.trim();
        const desc = document.getElementById('task-desc').value.trim();
        const priority = document.getElementById('task-priority').value;
        const deadline = document.getElementById('task-deadline').value;
        const status = document.getElementById('task-status').value;

        if (editId) {
            // Update Pipeline flow branch
            const currentTask = state.tasks.find(t => t.id === editId);
            if (currentTask) {
                currentTask.title = title;
                currentTask.desc = desc;
                currentTask.priority = priority;
                currentTask.deadline = deadline;
                currentTask.status = status;
                showToastNotification("Task instance mutated mapping updated successfully.");
            }
        } else {
            // Instantiation Creation pipeline context tracking block
            const newTask = {
                id: 'task_' + Date.now(),
                boardId: state.activeBoardId,
                title,
                desc,
                priority,
                deadline,
                status,
                created: new Date().toLocaleDateString()
            };
            state.tasks.push(newTask);
            showToastNotification("New task element successfully appends to workspace tracking frame pipelines.");
        }

        taskModal.hide();
        form.reset();
        form.classList.remove('was-validated');
        saveStateToStorage();
        renderAppLayoutView();
    });

    window.triggerEditTaskFlow = function (id) {
        const currentTask = state.tasks.find(t => t.id === id);
        if (!currentTask) return;

        document.getElementById('task-form').classList.remove('was-validated');
        document.getElementById('task-edit-id').value = currentTask.id;
        document.getElementById('task-title').value = currentTask.title;
        document.getElementById('task-desc').value = currentTask.desc;
        document.getElementById('task-priority').value = currentTask.priority;
        document.getElementById('task-deadline').value = currentTask.deadline || '';
        document.getElementById('task-status').value = currentTask.status;

        document.getElementById('taskModalLabel').innerHTML = '<i class="bi bi-pencil-square text-warning me-2"></i>Update Task State Parameters';
        document.getElementById('btn-task-form-submit').innerText = "Apply Updates";

        taskModal.show();
    };

    window.triggerDeleteTaskFlow = function (id) {
        const targetTask = state.tasks.find(t => t.id === id);
        if (!targetTask) return;

        if (confirm(`Remove tracking lifecycle context monitoring references targeting task: "${targetTask.title}"?`)) {
            state.tasks = state.tasks.filter(t => t.id !== id);
            saveStateToStorage();
            showToastNotification(`Task entry context permanently removed.`, 'warning');
            renderAppLayoutView();
        }
    };

    // Resetting Context Hooks on Modals hiding cycle events
    document.getElementById('boardModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('boardModalLabel').innerText = "Create New Board";
        document.getElementById('boardModalLabel').removeAttribute('data-edit-id');
        document.getElementById('board-form').reset();
    });


    // ==========================================
    // VI. DRAG AND DROP NATIVE WORKFLOW SYSTEM API
    // ==========================================
    function initDragAndDropEngineHooks() {
        const taskCards = document.querySelectorAll('.task-card');
        const dropzones = document.querySelectorAll('.kanban-column');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.getAttribute('data-task-id'));
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                dropzones.forEach(zone => zone.classList.remove('drag-over'));
            });
        });

        dropzones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const taskId = e.dataTransfer.getData('text/plain');
                const targetStatus = zone.getAttribute('data-status');

                const targetTask = state.tasks.find(t => t.id === taskId);
                if (targetTask && targetTask.status !== targetStatus) {
                    targetTask.status = targetStatus;
                    saveStateToStorage();
                    calculateStatisticsEngineMetrics();
                    renderAppLayoutView();
                    showToastNotification(`Pipeline context phase migrated status mapping to "${targetStatus}".`);
                }
            });
        });
    }

    // ==========================================
    // VII. CALCULATE DYNAMIC METRICS DASHBOARD
    // ==========================================
    function calculateStatisticsEngineMetrics() {
        const activeTasks = state.tasks.filter(t => t.boardId === state.activeBoardId);
        const total = activeTasks.length;
        const completed = activeTasks.filter(t => t.status === 'Done').length;
        const pending = activeTasks.filter(t => t.status !== 'Done').length;
        const highPriority = activeTasks.filter(t => t.priority === 'High').length;

        // Bind UI parameters tracking layout updates
        document.getElementById('stat-total').innerText = total;
        document.getElementById('stat-completed').innerText = completed;
        document.getElementById('stat-pending').innerText = pending;
        document.getElementById('stat-high').innerText = highPriority;
    }

    // ==========================================
    // VIII. DATA MATCHING ENGINE & QUERIES
    // ==========================================
    function getFilteredTasksCollection() {
        if (!state.activeBoardId) return [];

        return state.tasks.filter(task => {
            if (task.boardId !== state.activeBoardId) return false;

            // Match Text input parameters layout query logic metrics strings maps
            const matchesSearch = state.filters.searchQuery === '' ||
                task.title.toLowerCase().includes(state.filters.searchQuery.toLowerCase()) ||
                task.desc.toLowerCase().includes(state.filters.searchQuery.toLowerCase());

            // Match Target Priority Mapping properties logic parameter bounds
            const matchesPriority = state.filters.priority === 'All' || task.priority === state.filters.priority;

            // Match Target Deadlines timelines constraints checking calculations
            let matchesDeadline = true;
            if (state.filters.deadline !== 'All' && task.deadline) {
                const targetDate = new Date(task.deadline);
                targetDate.setHours(23, 59, 59, 999);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (state.filters.deadline === 'Overdue') {
                    matchesDeadline = targetDate < today && task.status !== 'Done';
                } else if (state.filters.deadline === 'Upcoming') {
                    matchesDeadline = targetDate >= today && task.status !== 'Done';
                }
            } else if (state.filters.deadline !== 'All' && !task.deadline) {
                matchesDeadline = false;
            }

            return matchesSearch && matchesPriority && matchesDeadline;
        });
    }

    // Bind Event Filtering Tracking Listeners Inputs
    document.getElementById('global-search').addEventListener('input', (e) => {
        state.filters.searchQuery = e.target.value.trim();
        renderFilteredTaskContainersLayoutOnly();
    });

    document.getElementById('filter-priority').addEventListener('change', (e) => {
        state.filters.priority = e.target.value;
        renderFilteredTaskContainersLayoutOnly();
    });

    document.getElementById('filter-deadline').addEventListener('change', (e) => {
        state.filters.deadline = e.target.value;
        renderFilteredTaskContainersLayoutOnly();
    });


    // ==========================================
    // IX. UI RENDERING FRAMEWORK LAYER VISUAL ENGINE
    // ==========================================

    function renderBoardNavigationPills() {
        const container = document.getElementById('boards-tabs-container');
        container.innerHTML = '';

        if (state.boards.length === 0) {
            container.innerHTML = `<span class="text-muted small px-2 py-1"><i class="bi bi-info-circle"></i> Create workspace board to begin tracking tasks.</span>`;
            return;
        }

        state.boards.forEach(board => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `btn btn-sm text-nowrap rounded-pill ${state.activeBoardId === board.id ? 'btn-primary' : 'btn-outline-secondary'}`;
            btn.innerHTML = `${board.name}`;
            btn.addEventListener('click', () => {
                state.activeBoardId = board.id;
                saveStateToStorage();
                // Flush runtime filters during active context switching layout shifts
                state.filters = { searchQuery: '', priority: 'All', deadline: 'All' };
                document.getElementById('global-search').value = '';
                document.getElementById('filter-priority').value = 'All';
                document.getElementById('filter-deadline').value = 'All';

                renderAppLayoutView();
            });
            container.appendChild(btn);
        });
    }

    function generateTaskHtmlNodeElement(task) {
        let badgeColor = 'bg-success';
        if (task.priority === 'Medium') badgeColor = 'bg-warning text-dark';
        if (task.priority === 'High') badgeColor = 'bg-danger';

        // Evaluate parameters mapping checking context processing date
        let deadlineBadgeHtml = '';
        if (task.deadline) {
            const dateObj = new Date(task.deadline);
            const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

            // Evaluate criteria context threshold if date constraint parameter violates timeline limits context
            const targetDate = new Date(task.deadline);
            targetDate.setHours(23, 59, 59, 999);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isOverdue = targetDate < today && task.status !== 'Done';

            deadlineBadgeHtml = `
                        <span class="badge ${isOverdue ? 'overdue-badge' : 'bg-body-secondary text-body-secondary'} d-inline-flex align-items-center gap-1 py-1.5 px-2 rounded">
                            <i class="bi bi-calendar-event"></i> ${formattedDate} ${isOverdue ? '[OVERDUE]' : ''}
                        </span>`;
        }

        return `
                    <div class="card glass-card task-card p-3 border-top-0 border-end-0 border-bottom-0 border-start border-4 border-secondary shadow-sm" 
                         draggable="true" 
                         data-task-id="${task.id}">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <h6 class="fw-bold mb-0 text-truncate-2-lines flex-grow-1">${task.title}</h6>
                            <span class="badge ${badgeColor} btn-sm small">${task.priority}</span>
                        </div>
                        <p class="text-muted small mb-3 text-truncate-3-lines">${task.desc || '<em class="opacity-50">No description documented details...</em>'}</p>
                        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 border-top pt-2">
                            <div class="d-flex flex-column gap-1">
                                ${deadlineBadgeHtml}
                                <span class="text-muted" style="font-size: 0.68rem;"><i class="bi bi-clock"></i> Created: ${task.created}</span>
                            </div>
                            <div class="d-flex gap-1 align-items-center">
                                <button type="button" onclick="triggerEditTaskFlow('${task.id}')" class="btn btn-sm btn-link p-1 text-muted hover-primary" title="Edit Properties Context Mutation"><i class="bi bi-pencil-square"></i></button>
                                <button type="button" onclick="triggerDeleteTaskFlow('${task.id}')" class="btn btn-sm btn-link p-1 text-muted hover-danger" title="Purge Sequence Destruction Record"><i class="bi bi-trash"></i></button>
                            </div>
                        </div>
                    </div>`;
    }

    function renderFilteredTaskContainersLayoutOnly() {
        const todoCol = document.getElementById('col-todo');
        const progressCol = document.getElementById('col-progress');
        const doneCol = document.getElementById('col-done');

        todoCol.innerHTML = '';
        progressCol.innerHTML = '';
        doneCol.innerHTML = '';

        const filteredDataset = getFilteredTasksCollection();

        let counts = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };

        if (filteredDataset.length === 0) {
            const emptyTemplate = `
                        <div class="text-center py-5 my-auto opacity-50 d-flex flex-column align-items-center justify-content-center">
                            <i class="bi bi-inbox fs-1 mb-2"></i>
                            <p class="small mb-0">No matching track records found.</p>
                        </div>`;

            todoCol.innerHTML = emptyTemplate;
            progressCol.innerHTML = emptyTemplate;
            doneCol.innerHTML = emptyTemplate;
        } else {
            filteredDataset.forEach(task => {
                const cardHtml = generateTaskHtmlNodeElement(task);
                if (task.status === 'To Do') {
                    todoCol.insertAdjacentHTML('beforeend', cardHtml);
                    counts['To Do']++;
                } else if (task.status === 'In Progress') {
                    progressCol.insertAdjacentHTML('beforeend', cardHtml);
                    counts['In Progress']++;
                } else if (task.status === 'Done') {
                    doneCol.insertAdjacentHTML('beforeend', cardHtml);
                    counts['Done']++;
                }
            });
        }

        // If any particular column structure viewport renders out blank context append local default elements space blocks
        Object.keys(counts).forEach(statusKey => {
            if (counts[statusKey] === 0 && filteredDataset.length > 0) {
                const targetDom = statusKey === 'To Do' ? todoCol : statusKey === 'In Progress' ? progressCol : doneCol;
                targetDom.innerHTML = `
                            <div class="text-center py-4 my-auto opacity-25 d-flex flex-column align-items-center justify-content-center border border-1 border-dashed rounded" style="min-height: 120px;">
                                <i class="bi bi-folder-plus fs-3 mb-1"></i>
                                <span class="small">Drop pipeline cards here...</span>
                            </div>`;
            }
        });

        // Set local counts badges headers fields update maps tracking
        document.getElementById('count-todo').innerText = counts['To Do'];
        document.getElementById('count-progress').innerText = counts['In Progress'];
        document.getElementById('count-done').innerText = counts['Done'];

        // Reactivate Drag and drop hooks attachments definitions targeting newly injected nodes elements blocks layout updates tracking
        initDragAndDropEngineHooks();
    }

    function renderAppLayoutView() {
        renderBoardNavigationPills();
        calculateStatisticsEngineMetrics();
        renderFilteredTaskContainersLayoutOnly();

        // Track availability condition to toggle accessibility features
        const controlsEnabled = state.activeBoardId !== null;
        document.getElementById('btn-create-task').disabled = !controlsEnabled;
        document.getElementById('btn-rename-board').disabled = !controlsEnabled;
        document.getElementById('btn-delete-board').disabled = !controlsEnabled;
        document.getElementById('global-search').disabled = !controlsEnabled;
        document.getElementById('filter-priority').disabled = !controlsEnabled;
        document.getElementById('filter-deadline').disabled = !controlsEnabled;
    }

    // ==========================================
    // X. SYSTEM STARTUP INITIALIZATION SEQUENCE
    // ==========================================
    function runBootstrapperSystemInitialization() {
        loadStateFromStorage();
        initThemeEngine();
        renderAppLayoutView();

        // Clear initialization overlay
        setTimeout(() => {
            const spinner = document.getElementById('app-spinner');
            if (spinner) {
                spinner.style.opacity = '0';
                setTimeout(() => spinner.remove(), 500);
            }
        }, 400);
    }

    runBootstrapperSystemInitialization();
});