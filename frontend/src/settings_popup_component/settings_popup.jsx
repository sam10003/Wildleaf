import './settings_popup.css'
import cancel_icon from '../assets/x.svg'
import { useState } from 'react'

function Settings_Popup({ showHeatmap, onHeatmapToggle, showTrash, onTrashToggle, onClose }) {
    return (
        <div id='settings_popup_container' onClick={onClose}>
            <div id='settings_popup_content' onClick={(e) => e.stopPropagation()}>
                <button id='settings_close_button' onClick={onClose}>
                    <img src={cancel_icon} alt="close" />
                </button>
                
                <div id='settings_title'>
                    <h2>Settings</h2>
                </div>
                
                <div id='settings_options'>
                    <div className='settings_option'>
                        <label htmlFor='heatmap_toggle'>
                            <span>Show Heatmap</span>
                            <input
                                id='heatmap_toggle'
                                type='checkbox'
                                checked={showHeatmap}
                                onChange={(e) => onHeatmapToggle(e.target.checked)}
                            />
                        </label>
                        <p className='settings_description'>
                            Display the heatmap showing IUCN plant occurrence density
                        </p>
                    </div>
                    
                    <div className='settings_option'>
                        <label htmlFor='trash_toggle'>
                            <span>Show Trash Locations</span>
                            <input
                                id='trash_toggle'
                                type='checkbox'
                                checked={showTrash}
                                onChange={(e) => onTrashToggle(e.target.checked)}
                            />
                        </label>
                        <p className='settings_description'>
                            Display trash cleaning locations on the map
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings_Popup

