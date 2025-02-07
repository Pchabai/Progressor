import { useState, useEffect } from "react";
import { auth, googleProvider, db } from "./firebaseConfig";
import { signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";

const App = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [theme, setTheme] = useState("light"); // Light, Dark, Retro
  const [user, setUser] = useState(null);

  // Enable persistent login
  useEffect(() => {
    const enablePersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("Error enabling persistence:", error);
      }
    };

    enablePersistence();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProjects(currentUser.uid);
      } else {
        setProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch projects for the logged-in user
  const fetchProjects = async (userId) => {
    const querySnapshot = await getDocs(query(collection(db, "projects"), where("userId", "==", userId)));
    const projectsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProjects(projectsList);
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      fetchProjects(result.user.uid);
    } catch (error) {
      console.error("Google Login Error", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProjects([]);
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : prevTheme === "dark" ? "retro" : "light"));
  };

  // Update task notes
  const updateTaskNotes = async (projectId, taskIndex, newNotes) => {
    const projectRef = doc(db, "projects", projectId);
    const updatedProjects = projects.map((p) =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.map((task, i) => (i === taskIndex ? { ...task, notes: newNotes } : task)) }
        : p
    );
    setProjects(updatedProjects);
    await updateDoc(projectRef, { tasks: updatedProjects.find(p => p.id === projectId).tasks });
  };

  return (
    <div className={`min-h-screen p-10 transition-all ${theme === "dark" ? "bg-gray-900 text-white" : theme === "retro" ? "bg-gray-300 text-black font-retro" : "bg-gray-100 text-black"}`}>
      {/* Theme Toggle Button */}
      <button className={`absolute top-4 right-4 p-2 rounded flex items-center space-x-2 transition`} onClick={toggleTheme}>
        {theme === "light" ? "🌙 Dark Mode" : theme === "dark" ? "🖥️ Retro Mode" : "☀️ Light Mode"}
      </button>

      {/* Authentication Buttons */}
      <div className="absolute top-4 left-4">
        {!user ? (
          <button onClick={handleGoogleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign in with Google
          </button>
        ) : (
          <div>
            <p>Welcome, {user.displayName}!</p>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded ml-2">
              Logout
            </button>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold text-center mb-6">Project Dashboard</h1>

      {/* Grid Layout for Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={index}
            className={`p-5 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition duration-300 transform hover:scale-105`}
            onClick={() => setSelectedProject(project)}
          >
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <div className="w-full bg-gray-200 h-3 rounded mt-2">
              <div className="bg-blue-500 h-3 rounded" style={{ width: `${project.progress || 0}%` }}></div>
            </div>
          </div>
        ))}

        {/* Add Project Tile */}
        {user && (
          <div
            className="bg-green-500 text-white p-5 rounded-lg shadow-lg cursor-pointer flex justify-center items-center hover:bg-green-600 transition"
            onClick={async () => {
              const newProject = { name: `Project ${projects.length + 1}`, tasks: [], userId: user.uid };
              const docRef = await addDoc(collection(db, "projects"), newProject);
              setProjects([...projects, { id: docRef.id, ...newProject }]);
            }}
          >
            <span className="text-xl font-semibold">+ Add Project</span>
          </div>
        )}
      </div>

      {/* Selected Project Section */}
      {selectedProject && (
        <div className={`mt-8 p-6 rounded-lg shadow-lg`}>
          <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
          <div className="mt-4">
            {selectedProject.tasks.length === 0 ? (
              <p>No tasks yet.</p>
            ) : (
              selectedProject.tasks.map((task, index) => (
                <div key={index} className={`p-4 my-2 rounded transition-all`}>
                  <h3 className="text-lg font-semibold">{task.name}</h3>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    className="w-full mt-2"
                    onChange={(e) => updateTaskNotes(selectedProject.id, index, parseInt(e.target.value))}
                  />
                  <p className="text-sm">{task.progress}% Complete</p>
                  <textarea
                    className="w-full mt-2 p-2 border rounded"
                    placeholder="Add notes for this task..."
                    value={task.notes}
                    onChange={(e) => updateTaskNotes(selectedProject.id, index, e.target.value)}
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
