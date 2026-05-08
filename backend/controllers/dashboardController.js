const { db } = require("../firebase/firebaseAdmin");

/** GET /api/dashboard/stats */
const getDashboardStats = async (req, res) => {
  try {
    const { uid, role } = req.user;
    const now = new Date();

    let projects = [];
    let tasks = [];
    let totalMembers = 0;

    if (role === "admin") {
      const [projectsSnap, tasksSnap, uSnap] = await Promise.all([
        db.collection("projects").get(),
        db.collection("tasks").get(),
        db.collection("users").get()
      ]);
      projects = projectsSnap.docs.map(d => d.data());
      tasks = tasksSnap.docs.map(d => d.data());
      totalMembers = uSnap.docs.length;
    } else {
      const memberSnap = await db.collection("projectMembers").where("userId", "==", uid).get();
      const projectIds = memberSnap.docs.map((d) => d.data().projectId);

      if (projectIds.length > 0) {
        // Fetch projects in chunks of 30
        const pChunks = [];
        for (let i = 0; i < projectIds.length; i += 30) pChunks.push(projectIds.slice(i, i + 30));
        
        for (const chunk of pChunks) {
          const [pSnap, tSnap] = await Promise.all([
            db.collection("projects").where("projectId", "in", chunk).get(),
            db.collection("tasks").where("projectId", "in", chunk).get()
          ]);
          pSnap.docs.forEach((d) => projects.push(d.data()));
          tSnap.docs.forEach((d) => tasks.push(d.data()));
        }
      }
    }

    // --- AGGREGATIONS ---
    const projectMap = {};
    projects.forEach(p => projectMap[p.projectId] = p.title);

    const overdue = tasks.filter((t) => t.status !== "Completed" && new Date(t.dueDate) < now);
    
    // Recent projects
    const recentProjects = [...projects]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    // Recent tasks
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Upcoming deadlines
    const upcomingTasks = tasks
      .filter(t => t.status !== "Completed" && new Date(t.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Project progress
    const projectProgress = Object.values(tasks.reduce((acc, t) => {
      if (!acc[t.projectId]) {
        acc[t.projectId] = { name: projectMap[t.projectId] || "Unknown Project", total: 0, completed: 0, progress: 0 };
      }
      acc[t.projectId].total++;
      if (t.status === "Completed") acc[t.projectId].completed++;
      acc[t.projectId].progress = Math.round((acc[t.projectId].completed / acc[t.projectId].total) * 100);
      return acc;
    }, {}));

    // Task Status Aggregation
    const statusCounts = {};
    tasks.forEach(t => statusCounts[t.status] = (statusCounts[t.status] || 0) + 1);
    const statusData = Object.keys(statusCounts).map(name => ({ name, value: statusCounts[name] }));

    // Priority Distribution
    const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    tasks.forEach(t => {
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
    });
    const priorityData = Object.keys(priorityCounts).map(name => ({ name, value: priorityCounts[name] }));

    // Team Workload Analysis
    const uniqueAssignees = [...new Set(tasks.map(t => t.assignedTo).filter(Boolean))];
    const userMap = {};
    if (uniqueAssignees.length > 0) {
      for (let i = 0; i < uniqueAssignees.length; i += 30) {
        const chunk = uniqueAssignees.slice(i, i + 30);
        const uSnap = await db.collection("users").where("userId", "in", chunk).get();
        uSnap.docs.forEach(d => {
          const u = d.data();
          userMap[u.userId] = u.name;
        });
      }
    }
    const memberCounts = {};
    tasks.forEach(t => {
      const userName = userMap[t.assignedTo] || "Unassigned";
      memberCounts[userName] = (memberCounts[userName] || 0) + 1;
    });
    const memberWorkload = Object.keys(memberCounts).map(name => ({ name, tasks: memberCounts[name] }));

    const teamSize = role === "admin" ? totalMembers : uniqueAssignees.length;

    return res.json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "Completed").length,
        pendingTasks: tasks.filter((t) => t.status === "Pending").length,
        inProgressTasks: tasks.filter((t) => t.status === "In Progress").length,
        blockedTasks: tasks.filter((t) => t.status === "Blocked").length,
        overdueTasks: overdue.length,
        progressPercentage: tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100) : 0,
        recentProjects,
        recentTasks,
        upcomingTasks,
        projectProgress, // Now an array formatted for Recharts
        statusData,
        priorityData,
        memberWorkload,
        teamSize
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats." });
  }
};

module.exports = { getDashboardStats };
