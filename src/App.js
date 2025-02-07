import React, { useState } from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/solid";

const App = () => {
  const [projects, setProjects] = useState([
    { name: "Project A", tasks: [{ name: "Task 1", progress: 30, effort: 5, notes: "" }] },
    { name: "Project B", tasks: [{ name: "Task 2", progress: 70, effort: 3, notes: "" }] },
  ]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [theme, setTheme] = useState("light"); // Options: "light", "dark", "retro"

  // Toggle between themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : prevTheme === "dark" ? "retro" : "light"));
  };

  // Calculate project progress
  const calculateProjectProgress = (tasks) => {
    if (!tasks.length) return 0;
    const totalEffort = tasks.reduce((sum, task) => sum + task.effort, 0);
    const completedEffort = tasks.reduce((sum, task) => sum + (task.progress / 100) * task.effort, 0);
    return Math.round((completedEffort / totalEffort) * 100);
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
    <div
      className={`min-h-screen p-10 transition-all ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : theme === "retro"
          ? "bg-gray-300 text-black font-retro"
          : "bg-gray-100 text-black"
      }`}
    >
      {/* Theme Toggle Button */}
     <button
  className={`absolute top-4 right-4 p-2 rounded flex items-center space-x-2 transition ${
    theme === "retro"
      ? "bg-gray-700 text-white border-2 border-black"
      : "bg-gray-800 text-white dark:bg-gray-200 dark:text-black"
  }`}
  onClick={toggleTheme}
>
  {theme === "light" ? (
    <>
      <MoonIcon className="w-6 h-6 text-white dark:text-black" />
      <span className="hidden sm:inline">Dark Mode</span>
    </>
  ) : theme === "dark" ? (
    <>
      <ComputerDesktopIcon className="w-6 h-6 text-white dark:text-black" />
      <span className="hidden sm:inline">Retro Mode</span>
    </>
  ) : (
    <>
      <SunIcon className="w-6 h-6 text-white dark:text-black" />
      <span className="hidden sm:inline">Light Mode</span>
    </>
  )}
</button>

      <h1 className="text-3xl font-bold text-center mb-6">Project Dashboard</h1>

      {/* Grid Layout for Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={index}
            className={`p-5 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition duration-300 transform hover:scale-105 ${
              calculateProjectProgress(project.tasks) === 100 ? "animate-pulse" : ""
            } ${
              theme === "retro"
                ? "bg-gray-100 border-2 border-black text-black shadow-md font-retro"
                : theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-black"
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
            <p className="text-sm mt-1">{calculateProjectProgress(project.tasks)}% Complete</p>
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
        <div
          className={`mt-8 p-6 rounded-lg shadow-lg ${
            theme === "retro" ? "bg-gray-100 border-2 border-black font-retro" : theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
          <div className="mt-4">
            {selectedProject.tasks.length === 0 ? (
              <p>No tasks yet.</p>
            ) : (
              selectedProject.tasks.map((task, index) => (
                <div key={index} className={`p-4 my-2 rounded transition-all ${theme === "retro" ? "border-2 border-black" : ""}`}>
                  <h3 className="text-lg font-semibold">{task.name}</h3>
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
        </div>
      )}
    </div>
  );
};

export default App;
