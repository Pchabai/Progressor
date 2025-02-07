import { useState, useEffect } from "react";
import { auth, googleProvider, db } from "./firebaseConfig";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  setPersistence, 
  browserLocalPersistence, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where 
} from "firebase/firestore";

const App = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [theme, setTheme] = useState("light"); // Light, Dark, Retro
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login & signup

  // Enable persistent login & Load user settings
  useEffect(() => {
    const enablePersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("Error enabling persistence:", error);
      }
    };

    enablePersistence();

    const fetchUserSettings = async (currentUser) => {
      if (!currentUser) return;

      fetchProjects(currentUser.uid);

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setTheme(userDoc.data().theme || "light");
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserSettings(currentUser);
      } else {
        setProjects([]);
        setTheme("light"); // Reset theme if no user is logged in
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch projects for the logged-in user
  const fetchProjects = async (userId) => {
    try {
      const querySnapshot = await getDocs(query(collection(db, "projects"), where("userId", "==", userId)));
      const projectsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsList);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Email & Password Authentication
  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Registration Error:", error.message);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login Error:", error.message);
    }
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
      setTheme("light");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Add a new project
  const handleAddProject = async () => {
    if (!user) {
      alert("You must be logged in to create a project!");
      return;
    }

    const newProject = {
      name: `Project ${projects.length + 1}`,
      tasks: [],
      userId: user.uid,
    };

    try {
      console.log("Adding project..."); // Debugging
      const docRef = await addDoc(collection(db, "projects"), newProject);
      console.log("Project added with ID:", docRef.id); // Debugging
      setProjects(prevProjects => [...prevProjects, { id: docRef.id, ...newProject }]);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  // Edit Project Name
  const handleEditProjectName = async (projectId, newName) => {
    if (!user) return;

    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, { name: newName });

      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === projectId ? { ...p, name: newName } : p))
      );
    } catch (error) {
      console.error("Error updating project name:", error);
    }
  };

  // Add a new task inside the selected project
  const handleAddTask = async () => {
    if (!selectedProject) return;

    const newTask = {
      name: `Task ${selectedProject.tasks.length + 1}`,
      progress: 0,
      effort: 1,
    };

    try {
      const projectRef = doc(db, "projects", selectedProject.id);
      const updatedTasks = [...selectedProject.tasks, newTask];

      await updateDoc(projectRef, { tasks: updatedTasks });

      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === selectedProject.id ? { ...p, tasks: updatedTasks } : p
        )
      );
      setSelectedProject(prev => ({ ...prev, tasks: updatedTasks }));
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <div className={`min-h-screen p-10 transition-all ${theme === "dark" ? "bg-gray-900 text-white" : theme === "retro" ? "bg-gray-300 text-black font-retro" : "bg-gray-100 text-black"}`}>
      {/* Theme Toggle Button */}
      <button className="absolute top-4 right-4 p-2 rounded transition" onClick={() => setTheme(theme === "light" ? "dark" : theme === "dark" ? "retro" : "light")}>
        {theme === "light" ? "🌙 Dark Mode" : theme === "dark" ? "🖥️ Retro Mode" : "☀️ Light Mode"}
      </button>

      {/* Authentication Section */}
      {!user ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-white p-6 shadow-md rounded text-center w-80">
            <h2 className="text-lg font-bold">{isRegistering ? "Register" : "Login"}</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded w-full mt-2"/>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded w-full mt-2"/>
            <button onClick={isRegistering ? handleRegister : handleEmailLogin} className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full">
              {isRegistering ? "Register" : "Login"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold text-center mb-6">Progressor Dashboard</h1>
          <button className="bg-green-500 text-white px-4 py-2 rounded mb-4" onClick={handleAddProject}>
            + Add Project
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <input key={index} type="text" className="text-xl font-semibold border-none bg-transparent w-full focus:outline-none" value={project.name} onChange={(e) => handleEditProjectName(project.id, e.target.value)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
