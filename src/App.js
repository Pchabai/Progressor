import React, { useState } from "react";

const App = () => {
  const [projects, setProjects] = useState([
    { name: "Project A", tasks: [{ name: "Task 1", progress: 30, effort: 5 }] },
    { name: "Project B", tasks: [{ name: "Task 2", progress: 70, effort: 3 }] },
  ]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg p-5">
        <h2 className="text-xl font-bold mb-4">Projects</h2>
        <ul>
          {projects.map((project, index) => (
            <li
              key={index}
              className={`p-2 rounded cursor-pointer ${
                selectedProject === project ? "bg-blue-200" : "hover:bg-gray-200"
              }`}
              onClick={() => setSelectedProject(project)}
            >
              {project.name}
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            const newProject = { name: `Project ${projects.length + 1}`, tasks: [] };
            setProjects([...projects, newProject]);
          }}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
        >
          + Add Project
        </button>
      </div>

      {/* Main Section */}
      <div className="w-3/4 p-5">
        <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
        <div className="mt-4">
          {selectedProject.tasks.length === 0 ? (
            <p>No tasks yet.</p>
          ) : (
            selectedProject.tasks.map((task, index) => (
              <div key={index} className="bg-white p-4 my-2 rounded shadow">
                <h3 className="text-lg font-semibold">{task.name}</h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={task.progress}
                  className="w-full"
                  onChange={(e) => {
                    let updatedTasks = [...selectedProject.tasks];
                    updatedTasks[index].progress = e.target.value;
                    let updatedProject = { ...selectedProject, tasks: updatedTasks };
                    let updatedProjects = projects.map((p) =>
                      p.name === selectedProject.name ? updatedProject : p
                    );
                    setProjects(updatedProjects);
                    setSelectedProject(updatedProject);
                  }}
                />
                <p className="text-sm">{task.progress}% Complete</p>
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => {
            const newTask = { name: `Task ${selectedProject.tasks.length + 1}`, progress: 0, effort: 1 };
            let updatedProject = {
              ...selectedProject,
              tasks: [...selectedProject.tasks, newTask],
            };
            let updatedProjects = projects.map((p) =>
              p.name === selectedProject.name ? updatedProject : p
            );
            setProjects(updatedProjects);
            setSelectedProject(updatedProject);
          }}
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded"
        >
          + Add Task
        </button>
      </div>
    </div>
  );
};

export default App;
