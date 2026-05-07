const { db } = require("../firebase/firebaseAdmin");

/** GET /api/dashboard/stats */
const getDashboardStats = async (req, res) => {
  try {
    const { uid, role } = req.user;
    const now = new Date();

    let projectsQuery = db.collection("projects");
    let tasksQuery = db.collection("tasks");

    // Members only see their projects and tasks
    if (role !== "admin") {
      const memberSnap = await db
        .collection("projectMembers")
        .where("userId", "==", uid)
        .get();
      const projectIds = memberSnap.docs.map((d) => d.data().projectId);

      const [projectsSnap, tasksSnap] = await Promise.all([
        projectIds.length > 0
          ? db.collection("projects").where("projectId", "in", projectIds.slice(0, 30)).get()
          : Promise.resolve({ docs: [] }),
        db.collection("tasks").where("assignedTo", "==", uid).get(),
      ]);

      const tasks = tasksSnap.docs.map((d) => d.data());
      const overdue = tasks.filter(
        (t) => t.status !== "Completed" && new Date(t.dueDate) < now
      );

      // Recent tasks (last 5)
      const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Upcoming deadlines (next 5)
      const upcomingTasks = tasks
        .filter(t => t.status !== "Completed" && new Date(t.dueDate) >= now)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

      // Fetch project titles for progress mapping
      const pSnap = projectIds.length > 0
        ? await db.collection("projects").where("projectId", "in", projectIds.slice(0, 30)).get()
        : { docs: [] };
      const projectMap = {};
      pSnap.docs.forEach(d => {
        const p = d.data();
        projectMap[p.projectId] = p.title;
      });

      // Per-project task progress for member
      const projectProgress = {};
      tasks.forEach((t) => {
        if (!projectProgress[t.projectId]) {
          projectProgress[t.projectId] = { 
            total: 0, 
            completed: 0, 
            title: projectMap[t.projectId] || "Unknown Project" 
          };
        }
        projectProgress[t.projectId].total++;
        if (t.status === "Completed") projectProgress[t.projectId].completed++;
      });

      return res.json({
        success: true,
        data: {
          totalProjects: projectsSnap.docs.length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t) => t.status === "Completed").length,
          pendingTasks: tasks.filter((t) => t.status === "Pending").length,
          inProgressTasks: tasks.filter((t) => t.status === "In Progress").length,
          blockedTasks: tasks.filter((t) => t.status === "Blocked").length,
          overdueTasks: overdue.length,
          progressPercentage:
            tasks.length > 0
              ? Math.round(
                  (tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100
                )
              : 0,
          recentTasks,
          upcomingTasks,
          projectProgress
        },
      });
    }

    // Admin: aggregate everything
    const [projectsSnap, tasksSnap] = await Promise.all([
      db.collection("projects").get(),
      db.collection("tasks").get(),
    ]);

    const projects = projectsSnap.docs.map(d => d.data());
    const tasks = tasksSnap.docs.map((d) => d.data());
    
    // Project ID to Title mapping
    const projectMap = {};
    projects.forEach(p => projectMap[p.projectId] = p.title);

    const overdue = tasks.filter(
      (t) => t.status !== "Completed" && new Date(t.dueDate) < now
    );

    // Recent tasks (last 5)
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Upcoming deadlines (next 5)
    const upcomingTasks = tasks
      .filter(t => t.status !== "Completed" && new Date(t.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Per-project task progress for admin
    const projectProgress = {};
    tasks.forEach((t) => {
      if (!projectProgress[t.projectId]) {
        projectProgress[t.projectId] = { 
          total: 0, 
          completed: 0, 
          title: projectMap[t.projectId] || "Unknown Project" 
        };
      }
      projectProgress[t.projectId].total++;
      if (t.status === "Completed") projectProgress[t.projectId].completed++;
    });

    res.json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "Completed").length,
        pendingTasks: tasks.filter((t) => t.status === "Pending").length,
        inProgressTasks: tasks.filter((t) => t.status === "In Progress").length,
        blockedTasks: tasks.filter((t) => t.status === "Blocked").length,
        overdueTasks: overdue.length,
        progressPercentage:
          tasks.length > 0
            ? Math.round(
                (tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100
              )
            : 0,
        projectProgress,
        recentTasks,
        upcomingTasks
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats." });
  }
};

module.exports = { getDashboardStats };
