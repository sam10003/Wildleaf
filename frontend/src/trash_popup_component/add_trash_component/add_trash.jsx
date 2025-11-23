import './add_trash.css'
import camera_icon from '../../assets/camera-fill.svg'
import Button from '../../button_component/button'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function Add_Trash(props) {

    // define initialvalues
    const initialValues = {img_before:"", img_after:"", latitude:"", longitude:"", date:null}

    // validation schema
    const validationSchema = Yup.object().shape({
        img_before: Yup.mixed().required("Image before required"),
        img_after: Yup.mixed().required("Image after required"),
        latitude: Yup.string()
            .required('Latitude required'),
        longitude: Yup.string()
            .required('Longitude required'),
        date: Yup.date()
            .required("Date required")
    });

    const fileBeforeRef = useRef(null);
    const fileAfterRef = useRef(null);

    return (
        <>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={props.handleSubmit}>
                {({ values, setFieldValue }) => (
                    <Form>
                        <div id="form_container">
                            <h2>Add a trash cleaning</h2>
                            <div id="img_container">
                                <div>
                                    <label>Before:</label>
                                    <div class='image' onClick={() => fileBeforeRef.current.click()}>
                                        {values.img_before ? (
                                        <img src={URL.createObjectURL(values.img_before)} alt="Preview before"/>
                                        ) : (
                                        <img src={camera_icon} alt="Default before"/>)}
                                    </div>
                                    <ErrorMessage name="img_before" component="p" className="error" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileBeforeRef}
                                        onChange={(event) => {
                                            setFieldValue("img_before", event.currentTarget.files[0]);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label>After:</label>
                                    <div class='image' onClick={() => fileAfterRef.current.click()}>
                                        {values.img_after ? (
                                            <img src={URL.createObjectURL(values.img_after)} alt="Preview after"/>
                                            ) : (
                                            <img src={camera_icon} alt="Default after"/>)}
                                    </div>
                                    <ErrorMessage name="img_after" component="p" className="error" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileAfterRef}
                                        onChange={(event) => {
                                            setFieldValue("img_after", event.currentTarget.files[0]);
                                        }}
                                    />
                                </div>
                            </div>
                            <div id='coordinated_container'>
                                <div>
                                    <label for="latitude">Latitude:</label>
                                    <Field id="latitude" name="latitude" placeholder="45.98" />
                                    <ErrorMessage name="latitude" component="p" className="error" /> 
                                </div>
                                <div>
                                    <label for="longitude">Longitude:</label>
                                    <Field id="longitude" name="longitude" placeholder="-45.78" />
                                    <ErrorMessage name="longitude" component="p" className="error" />
                                </div>
                            </div>
                            <div id='date_container'>
                                <label for="date">Date of the cleaning:</label>
                                <DatePicker
                                    selected={values.date}
                                    onChange={(date) => setFieldValue("date", date)}
                                    dateFormat="dd/MM/yyyy"
                                />
                                <ErrorMessage name="date" component="p" className="error"/>
                            </div>
                        </div>
                        <div id="buttons_container">
                            <Button text="Cancel" type="button" onClick={props.onClick}/>
                            <Button text="Validate" type="submit"/>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
}

export default Add_Trash