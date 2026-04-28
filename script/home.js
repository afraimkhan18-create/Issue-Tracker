let allIssues = [];
let currentFilter = "all";

// ====== Spinner ======
const manageSpinner = (status) => {
    const spinner = document.getElementById("spinner");
    const container = document.getElementById("issue-container");

    if (status) {
        spinner.classList.remove("hidden");
        container.classList.add("hidden");
    } else {
        spinner.classList.add("hidden");
        container.classList.remove("hidden");
    }
};

// ====== Active Tab Reset ======
const removeActive = () => {
    document.querySelectorAll("#tab-container button").forEach((btn) => {
        btn.classList.remove("bg-[#422AD5]", "text-white");
        btn.classList.add("bg-transparent", "text-gray-500");
    });
};

// ====== Load All Issues ======
const loadIssues = async () => {
    manageSpinner(true);

    try {
        const res = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
        const json = await res.json();

        allIssues = json?.data || [];

    } catch (error) {
        console.error("Data load failed:", error);
        allIssues = [];
    } finally {
        manageSpinner(false); 
        filterIssues("all"); 
    }
};

// ====== Display Issues ======
const displayIssues = (issues) => {
    const container = document.getElementById("issue-container");
    const countDisplay = document.getElementById("total-count");

    container.innerHTML = "";
    countDisplay.innerText = issues.length;

    if (!issues.length) {
        container.innerHTML = `
            <div class="text-center col-span-full py-16">
                <p class="text-gray-400 text-lg">No issues found</p>
            </div>
        `;
        return;
    }

    issues.forEach((issue) => {
        const isClosed = issue.status === "closed";

        const statusIcon = isClosed
            ? "./assets/Closed- Status .png"
            : "./assets/Open-Status.png";

        const borderColor = isClosed
            ? "border-t-purple-600"
            : "border-t-green-500";

        const priorityClass =
            issue.priority === "high"
                ? "bg-red-50 text-red-500"
                : issue.priority === "medium"
                ? "bg-orange-50 text-orange-500"
                : "bg-gray-50 text-gray-400";

        const card = document.createElement("div");
        card.className = `bg-white p-6 rounded-2xl border border-gray-100 border-t-4 ${borderColor} shadow-sm cursor-pointer hover:shadow-md transition-all`;

        card.onclick = () => loadSingleIssue(issue.id);

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <img src="${statusIcon}" class="w-5">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityClass}">
                    ${issue.priority}
                </span>
            </div>

            <h3 class="font-bold text-gray-800 text-[15px] mb-2 line-clamp-2">
                ${issue.title}
            </h3>

            <p class="text-xs text-gray-400 mb-6 line-clamp-2">
                ${issue.description}
            </p>

            <div class="flex gap-2 flex-wrap mb-6">
                ${(issue.labels || []).map(l => {
                    const label = l.toLowerCase();
                    const colorClass =
                        label.includes("bug")
                            ? "bg-red-50 text-red-400 border-red-200"
                            : label.includes("enhancement")
                            ? "bg-purple-50 text-purple-400 border-purple-200"
                            : label.includes("documentation")
                            ? "bg-blue-50 text-blue-400 border-blue-200"
                            : label.includes("help wanted")
                            ? "bg-green-50 text-green-500 border-green-200"
                            : label.includes("good first issue")
                            ? "bg-yellow-50 text-yellow-500 border-yellow-200"
                            : "bg-gray-100 text-gray-500 border-gray-200";
                    return `<span class="px-2 py-1 border text-[9px] font-bold rounded-full uppercase ${colorClass}"># ${l}</span>`;
                }).join("")}
            </div>

            <div class="pt-4 border-t border-gray-100 text-[11px] text-gray-400">
                <p class="font-medium text-gray-500">
                    #${issue.id} by @${issue.author}
                </p>
                <p>
                    ${new Date(issue.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    })}
                </p>
            </div>
        `;

        container.appendChild(card);
    });
};

// ====== Apply Filter ======
const applyFilter = () => {
    let filtered = [...allIssues];

    if (currentFilter !== "all") {
        filtered = filtered.filter(i => i.status === currentFilter);
    }

    displayIssues(filtered);
};

// ====== Filter Button Click ======
const filterIssues = (status) => {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    currentFilter = status;

    removeActive();

    const btn = document.getElementById(`btn-${status}`);
if (btn) {
    btn.classList.remove("bg-transparent", "text-gray-500");
    btn.classList.add("bg-[#422AD5]", "text-white");
}

    applyFilter();
};

// ====== Search Issues ======
const searchIssues = async (query) => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
        applyFilter();
        return;
    }

    manageSpinner(true);

    try {
        const res = await fetch(
            `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${cleanQuery}`
        );

        const json = await res.json();
        displayIssues(json?.data || []);

    } catch (err) {
        console.log("Search error:", err);
        displayIssues([]);
    } finally {
        manageSpinner(false);
    }
};

// ====== Single Issue Modal ======
const loadSingleIssue = async (id) => {
    try {
        const res = await fetch(
            `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`
        );

        const json = await res.json();
        const data = json?.data;

        if (!data) return;

        const statusClass =
            data.status === "closed" ? "bg-purple-500" : "bg-green-500";

        const priorityColor =
            data.priority === "high"
                ? "bg-red-500"
                : data.priority === "medium"
                ? "bg-orange-400"
                : "bg-gray-400";

        document.getElementById("modal-content").innerHTML = `
            <!-- Title -->
            <h2 class="text-2xl font-bold mb-3">${data.title}</h2>

            <!-- Status + Meta -->
            <div class="flex gap-3 mb-5 items-center text-xs flex-wrap">
                <span class="px-3 py-1 rounded-full ${statusClass} text-white font-bold text-xs">
                    ${data.status.toUpperCase()}
                </span>
                <span class="text-gray-400">
                    Opened by <strong class="text-gray-600">${data.author}</strong>
                    &bull;
                    ${new Date(data.createdAt).toLocaleDateString("en-US", {
                        weekday: "short", year: "numeric", month: "short", day: "numeric"
                    })}
                </span>
            </div>

            <!-- Labels -->
            <div class="flex gap-2 flex-wrap mb-5">
                ${(data.labels || []).map(l => `
                    <span class="px-3 py-1 bg-orange-50 text-orange-400 text-[10px] font-bold rounded-full border border-orange-200 uppercase">
                        # ${l}
                    </span>
                `).join("")}
            </div>

            <!-- Divider -->
            <hr class="mb-5 border-gray-100">

            <!-- Description -->
            <p class="text-gray-500 text-sm leading-relaxed mb-8">
                ${data.description}
            </p>

            <!-- Assignee + Priority row -->
            <div class="flex justify-between items-start mb-8">
                <div>
                    <p class="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Assignee</p>
                    <p class="font-bold text-gray-800">${data.assignee || "None"}</p>
                </div>
                <div class="text-right">
                    <p class="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Priority:</p>
                    <span class="px-3 py-1 rounded-full ${priorityColor} text-white text-[11px] font-bold uppercase">
                        ${data.priority.toUpperCase()}
                    </span>
                </div>
            </div>

            <!-- Close Button centered -->
            <div class="flex justify-center">
                <button onclick="document.getElementById('my_modal_5').close()" 
                    class="btn bg-[#422AD5] hover:bg-[#3621b0] text-white border-none px-12 rounded-xl">
                    Close
                </button>
            </div>
        `;

        document.getElementById("my_modal_5").showModal();

    } catch (err) {
        console.log("Modal error:", err);
    }
};

// ====== INIT ======
loadIssues();