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
  const [ user, setUser ] = useState("aluso");
  const [ displayUserPopup, setDisplayUserPopup ] = useState(false);
  const changeUser = (newUser) => {
    setUser(newUser);
  }

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
                                         changeCurrentPage={changeCurrentPage} 
                                         displayUserPopup={() => setDisplayUserPopup(true)}/>}
      {currentPage == "leaderboard" && <Page_Leaderboard user={user} 
                                                         changeCurrentPage={changeCurrentPage} 
                                                         displayUserPopup={() => setDisplayUserPopup(true)}/>}
      {currentPage == "user" && <Page_User user={user} 
                                           changeCurrentPage={changeCurrentPage}/>}
    </>
  );
}

export default App;
