import './leaderboard.css'
import Podium from '../podium_component/podium'

import { useState, useEffect } from "react"

function Leaderboard(props) {

    const [ log, setLog ] = useState("");
    const append = (msg) => setLog((l) => l + "\n" + msg);

    const [ leaderboard, setLeaderboard ] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch("http://localhost:5000/user/leaderboard");
                const data = await res.json();
                setLeaderboard(data.users);
                console.log(data.users)

                append("Leaderboard: " + JSON.stringify(data.users, null, 2));
            } catch (err) {
                append("Leaderboard fetch error: " + err.message);
            }
        };

        fetchLeaderboard();
    }, []); 

    return (
        <>
            <div id='leaderboard_container'>
                <h1>Trash Leaderboard</h1>
                {leaderboard && <Podium users={leaderboard.sort((a, b) => b.score - a.score).slice(0, 3)}/>}
                <div id='users_container'>
                    {leaderboard && leaderboard
                        .sort((a, b) => b.score - a.score)
                        .slice(3, leaderboard.length)
                        .map(user => {
                            return <h3 key={user._id}>{user.name} : {user.score}</h3>;
                    })}
                </div>
            </div>
        </>
    )
}

export default Leaderboard