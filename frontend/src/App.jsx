import { useState, useEffect } from 'react'
import './App.css'
import Map from './map_component/map'
import Leaderboard from './leaderboard_component/leaderboard'


function App() {
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
      <Map/>
      //<Leaderboard/>
    </>
  )
}

export default App
