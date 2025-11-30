import './user_trash_info.css'
import Trash_Details from '../trash_details_component/trash_details'
import { useState, useEffect } from 'react'

function User_Trash_Info(props) {

    const [ log, setLog ] = useState("");
    const append = (msg) => setLog((l) => l + "\n" + msg);

    const [ userTrashs, setUserTrashs ] = useState(null);
    const [ leaderboard, setLeaderboard ] = useState(null);

    useEffect(() => {
        const getTrash = async () => {
            if (!props.accessToken) return append("No access token.");

            try {
                const res = await fetch("http://localhost:5000/trash/all", {
                    headers: { Authorization: `Bearer ${props.accessToken}` },
                    credentials: "include",
                });

                const data = await res.json();
                setUserTrashs(data);
                append("GET /trash/all → " + JSON.stringify(data, null, 2));
            } catch (err) {
                append("Error fetching trash: " + err.message);
            }
        };

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

        getTrash();
        fetchLeaderboard();
    }, []);  

    return (
        <>
            <div id='user_trash_info_container'>
                <div id='summary_container'>
                    <div>
                        <p>Score</p>
                        <h2>{props.user.score}</h2>
                    </div>
                    <div>
                        {leaderboard && <h2>{
                            leaderboard
                                .sort((a, b) => b.score - a.score)
                                .findIndex(u => u.name === props.user.name) + 1
                            }</h2>}
                        {leaderboard && <p>over {leaderboard.length}</p>}
                    </div>
                    <div>
                        <p>Trash Cleaning</p>
                        {userTrashs && <h2>{userTrashs.length}</h2>}
                    </div>
                </div>
                <div id='trash_cleanings_container'>
                    {userTrashs && userTrashs.map((trash) => (
                        <Trash_Details key={trash.id} trash={trash} user={props.user}/>
                    ))}
                </div>
            </div>
        </>
    )
}

export default User_Trash_Info