import './user_trash_info.css'
import Trash_Details from '../trash_details_component/trash_details'

function User_Trash_Info(props) {

    return (
        <>
            <div id='user_trash_info_container'>
                <div id='summary_container'>
                    <div>
                        <p>Score</p>
                        <h2>120</h2>
                    </div>
                    <div>
                        <h2>23</h2>
                        <p>Ranking</p>
                    </div>
                    <div>
                        <p>Trash Cleaning</p>
                        <h2>12</h2>
                    </div>
                </div>
                <div id='trash_cleanings_container'>
                    <Trash_Details/>
                    <Trash_Details/>
                    <Trash_Details/>
                    <Trash_Details/>
                    <Trash_Details/>
                    <Trash_Details/>
                    <Trash_Details/>
                </div>
            </div>
        </>
    )
}

export default User_Trash_Info