import { useState, useEffect } from 'react'
import './App.css'
import Page_Map from './page_map_component/page_map';
import Page_Leaderboard from './page_leaderboard_component/page_leaderboard';
import Page_User from './page_user_component/page_user';


function App() {

  // Change pages
  const [ currentPage, setCurrentPage ] = useState("map");
  const changeCurrentPage = (newPage) => {
    setCurrentPage(newPage);
  }

  // User (simple conf to begin userpage)
  const [ log, setLog ] = useState("");
  const append = (msg) => setLog((l) => l + "\n" + msg);
  const [ user, setUser ] = useState(null);
  const [ accessToken, setAccessToken ] = useState("");

  // REAL GOOGLE LOGIN, script needed for handleGoogleLogin
  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // 1. Test /auth/google
  const handleGoogleLogin = () => {
    // check if script is loaded
    if (!window.google) return append("Google script not loaded yet.");

    // Create an OAuth “code client” 
    window.google.accounts.oauth2.initCodeClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: "email profile",
      ux_mode: "popup",
      callback: async (response) => {
        append("Received Google code: " + response.code);
        
        // Send the real Google auth code to backend
        try {
          const res = await fetch("http://localhost:5000/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ code: response.code }),
          });

          // Get response from backend
          const data = await res.json();
          append("Backend /auth/google → " + JSON.stringify(data, null, 2));

          // Save access token and user info
          if (data.accessToken) {
            setAccessToken(data.accessToken);
            localStorage.setItem("accessToken", data.accessToken);
            setUser(data.user);
            append("Access Token Saved ✔");
          }
        } catch (err) {
          append("Google login error: " + err.message);
        }
      },
    }).requestCode();
  };

  const [canons,setCanons] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/IUCN/1')
      .then(res => res.json())
      .then(data => setCanons([data]))
      .catch(err => console.error(err));
  }, [])
  console.log(canons);

useEffect(() => {
  const fetchAllCanons = async () => {
    let index = 0;
    let allCanons = [];

    while (true) {
      try {
        const res = await fetch(`http://localhost:5000/IUCN/${index}`);
        if (res.status === 404) break; // no more species
        if (!res.ok) throw new Error('Network response was not ok');

        const data = await res.json();
        allCanons.push(data);
        index++;
      } catch (err) {
        console.error(err);
        break;
      }
    }

    setCanons(allCanons);
  };

  fetchAllCanons();
}, []);

console.log(canons);

  return (
    <>
      {currentPage == "map" && <Page_Map user={user} 
                                         accessToken={accessToken}
                                         changeCurrentPage={changeCurrentPage}
                                         handleGoogleLogin={handleGoogleLogin}/>}
      {currentPage == "leaderboard" && <Page_Leaderboard user={user} 
                                                         accessToken={accessToken}
                                                         changeCurrentPage={changeCurrentPage}/>}
      {currentPage == "user" && accessToken && <Page_User user={user} 
                                                          accessToken={accessToken}
                                                          changeCurrentPage={changeCurrentPage}/>}
    </>
  );
}

export default App;
