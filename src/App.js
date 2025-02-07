import React, { useState } from "react";

const App = () => {
  const [projects, setProjects] = useState([
    { name: "Project A", tasks: [{ name: "Task 1", progress: 30, effort: 5, notes: "" }] },
    { name: "Project B", tasks: [{ name: "Task 2", progress: 70, effort: 3, notes: "" }] },
  ]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Calculate project progress based on weighted tasks
  const calculateProjectProgress = (tasks) => {
    if (!tasks.length) return 0;
    const totalEffort = tasks.reduce((sum, task) => sum + task.effort, 0);
    const completedEffort = tasks.reduce((sum, task) => sum + (task.progress / 100) * task.effort, 0);
    return Math.round((completedEffort / totalEffort) * 100);
  };

  // Update task name
  const updateTaskName = (taskIndex, newName) => {
    let updatedTasks = selectedProject.tasks.map((task, i) =>
      i === taskIndex ? { ...task, name: newName } : task
    );
    let updatedProject = { ...selectedProject, tasks: updatedTasks };
    let updatedProjects = projects.map((p) =>
      p.name === selectedProject.name ? updatedProject : p
    );
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
    setEditingTask(null);
  };

  // Update task notes
  const updateTaskNotes = (taskIndex, newNotes) => {
    let updatedTasks = selectedProject.tasks.map((task, i) =>
      i === taskIndex ? { ...task, notes: newNotes } : task
    );
    let updatedProject = { ...selectedProject, tasks: updatedTasks };
    let updatedProjects = projects.map((p) =>
      p.name === selectedProject.name ? updatedProject : p
    );
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-6">Project Dashboard</h1>

      {/* Grid Layout for Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={index}
            className={`bg-white p-5 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition duration-300 transform hover:scale-105 ${
              calculateProjectProgress(project.tasks) === 100 ? "animate-pulse" : ""
            }`}
            onClick={() => setSelectedProject(project)}
          >
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <div className="w-full bg-gray-200 h-3 rounded mt-2">
              <div
                className="bg-blue-500 h-3 rounded"
                style={{ width: `${calculateProjectProgress(project.tasks)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {calculateProjectProgress(project.tasks)}% Complete
            </p>
          </div>
        ))}

        {/* Add Project Tile */}
        <div
          className="bg-green-500 text-white p-5 rounded-lg shadow-lg cursor-pointer flex justify-center items-center hover:bg-green-600 transition"
          onClick={() => {
            const newProject = { name: `Project ${projects.length + 1}`, tasks: [] };
            setProjects([...projects, newProject]);
          }}
        >
          <span className="text-xl font-semibold">+ Add Project</span>
        </div>
      </div>

      {/* Selected Project Section */}
      {selectedProject && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
          <div className="mt-4">
            {selectedProject.tasks.length === 0 ? (
              <p>No tasks yet.</p>
            ) : (
              selectedProject.tasks.map((task, index) => (
                <div key={index} className="bg-gray-100 p-4 my-2 rounded transition-all">
                  {editingTask === index ? (
                    <input
                      type="text"
                      defaultValue={task.name}
                      autoFocus
                      className="w-full border p-2 rounded"
                      onBlur={(e) => updateTaskName(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateTaskName(index, e.target.value);
                      }}
                    />
                  ) : (
                    <h3
                      className="text-lg font-semibold"
                      onDoubleClick={() => setEditingTask(index)}
                    >
                      {task.name}
                    </h3>
                  )}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    className="w-full mt-2"
                    onChange={(e) => {
                      let updatedTasks = selectedProject.tasks.map((t, i) =>
                        i === index ? { ...t, progress: parseInt(e.target.value) } : t
                      );
                      let updatedProject = { ...selectedProject, tasks: updatedTasks };
                      setProjects(projects.map((p) => (p.name === selectedProject.name ? updatedProject : p)));
                      setSelectedProject(updatedProject);
                    }}
                  />
                  <p className="text-sm">{task.progress}% Complete</p>

                  {/* Notes Section */}
                  <textarea
                    className="w-full mt-2 p-2 border rounded"
                    placeholder="Add notes for this task..."
                    value={task.notes}
                    onChange={(e) => updateTaskNotes(index, e.target.value)}
                  ></textarea>
                </div>
              ))
            )}
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => {
              const newTask = { name: `Task ${selectedProject.tasks.length + 1}`, progress: 0, effort: 1, notes: "" };
              let updatedProject = { ...selectedProject, tasks: [...selectedProject.tasks, newTask] };
              setProjects(projects.map((p) => (p.name === selectedProject.name ? updatedProject : p)));
              setSelectedProject(updatedProject);
            }}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            + Add Task
          </button>

          {/* Close Button */}
          <button
            className="mt-4 ml-4 bg-red-500 text-white py-2 px-4 rounded"
            onClick={() => setSelectedProject(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
