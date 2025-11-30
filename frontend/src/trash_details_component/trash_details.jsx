import './trash_details.css'

function Trash_Details(props) {

    console.log(props.trash)

    return (
        <>
            <div id='trash_container'>
                <div id='trash_detail_first_layer_container'>
                    <div id='after_img_container'>
                        <img src={props.trash.afterPhotoURL} alt="" />
                        <p>Before</p>
                    </div>
                    <div id='before_img_container'>
                        <img src={props.trash.beforePhotoURL} alt="" />
                        <p>After</p>
                    </div>
                </div>
                <div id='trash_detail_second_layer_container'>
                    <h3>Cleaned by {props.user.name}</h3>
                    <p>On the {props.trash.createdAt.slice(0, 10)} at {props.trash.latitude}, {props.trash.longitude}</p>
                </div>
            </div>
        </>
    )
}

export default Trash_Details