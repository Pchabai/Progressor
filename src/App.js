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
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";

const App = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [theme, setTheme] = useState("light"); // Light, Dark, Retro
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login & signup

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

  // Email/Password Authentication
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
    } catch (error) {
      console.error("Logout Error", error);
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : prevTheme === "dark" ? "retro" : "light"));
  };

  return (
    <div className={`min-h-screen p-10 transition-all ${theme === "dark" ? "bg-gray-900 text-white" : theme === "retro" ? "bg-gray-300 text-black font-retro" : "bg-gray-100 text-black"}`}>
      {/* Theme Toggle Button */}
      <button className={`absolute top-4 right-4 p-2 rounded flex items-center space-x-2 transition`} onClick={toggleTheme}>
        {theme === "light" ? "🌙 Dark Mode" : theme === "dark" ? "🖥️ Retro Mode" : "☀️ Light Mode"}
      </button>

      {/* Authentication Section */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-6 shadow-md rounded text-center">
          {!user ? (
            <>
              <h2 className="text-lg font-bold">{isRegistering ? "Register" : "Login"}</h2>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full mt-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-full mt-2"
              />

              <button
                onClick={isRegistering ? handleRegister : handleEmailLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full"
              >
                {isRegistering ? "Register" : "Login"}
              </button>

              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-500 text-sm mt-2"
              >
                {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
              </button>

              <hr className="my-3" />

              <button
                onClick={handleGoogleLogin}
                className="bg-red-500 text-white px-4 py-2 rounded w-full"
              >
                Sign in with Google
              </button>
            </>
          ) : (
            <div>
              <p>Welcome, {user.email}!</p>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

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
      </div>
    </div>
  );
};

export default App;