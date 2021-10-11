import axios from "axios";
import React, { useState, useEffect, useRef, useContext } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import config from "../../config";
import { AppContext } from "../../contextStore/appContext";
import { MessageContext } from "../../contextStore/messageContext";
import { actions } from "../../reduxStore";
import styles from "./css/AccountSection.module.scss";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { dataURItoBlob } from "./getCroppedImage";
import isEqual from "lodash.isequal";
import cloneDeep from "clone-deep";
import deepEqual from "deep-equal";

let cropper;

function AccountSection(props) {
    const currentUser = useSelector(
        (state) => state.user.currentUser,
        shallowEqual
    );

    const [formState, setFormState] = useState("display");
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
    const [croppedImageUrl, setCroppedImageUrl] = useState(undefined);
    const [loadCount, setLoadCount] = useState(0);
    const [selectedImageUrl, setSelectedImageUrl] = useState(undefined);
    const dispatch = useDispatch();
    const history = useHistory();
    const messageCtx = useContext(MessageContext);
    const appCtx = useContext(AppContext);

    const nameRef = useRef();
    const emailRef = useRef();
    const descriptionRef = useRef();
    const passwordRef = useRef();
    const overlayRef = useRef();
    const cancelBtnRef = useRef();
    const passwordDeleteRef = useRef();
    const photoRef = useRef();
    const cropperRef = useRef();

    useEffect(() => {
        const fetchUserInfo = async function () {
            const res = await axios({
                withCredentials: true,
                method: "GET",
                url: `${config.url}/api/users/getUserDetails/${currentUser._id}`,
            });

            if (res.data.status === "success") {
                dispatch({ type: actions.SET_USER, user: res.data.user });
            } else throw new Error(res);
        };
        fetchUserInfo();
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (formState === "display" || loadCount === 0) return;
        if (cropper) cropper.destroy();
        cropper = new Cropper(cropperRef.current, {
            aspectRatio: 1,
            zoomable: false,
            scalable: false,
            crop: () => {
                const canvas = cropper.getCroppedCanvas();
                setCroppedImageUrl(canvas.toDataURL());
            },
        });
    }, [formState, loadCount]);

    function openEditForm(e) {
        e.preventDefault();
        setFormState("edit");
    }

    function cancelChanges(e) {
        e.preventDefault();
        if (cropper) cropper.destroy();
        setLoadCount(0);
        setFormState("display");
        setCroppedImageUrl(undefined);
        setSelectedImageUrl(undefined);
    }

    const sendFormData = async (formData) => {
        try {
            messageCtx.displayMessage("Updating...");
            const res = await axios({
                withCredentials: true,
                method: "PATCH",
                url: `${config.url}/api/users/editMyAccount`,
                data: formData,
            });
            if (cropper) cropper.destroy();
            setLoadCount(0);
            setFormState("display");
            setSelectedImageUrl(undefined);
            setCroppedImageUrl(undefined);

            if (res.data.status === "success") {
                messageCtx.displayMessage("Profile Updated");
                dispatch({ type: actions.SET_USER, user: res.data.user });
            } else throw new Error(res);
        } catch (e) {
            messageCtx.displayMessage(e.response.data.message, true);
        }
    };

    function sendEditData(e) {
        e.preventDefault();
        const form = new FormData();
        form.append("name", nameRef.current.value);
        form.append("email", emailRef.current.value);
        form.append("description", descriptionRef.current.value);
        form.append("password", passwordRef.current.value);
        if (croppedImageUrl)
            form.append("photo", dataURItoBlob(croppedImageUrl));
        sendFormData(form);
    }

    function photoChangeHandler() {
        if (!photoRef.current.files[0]?.type.startsWith("image"))
            return messageCtx.displayMessage(
                "Please just upload image files",
                true
            );
        const imageUrl = URL.createObjectURL(photoRef.current.files[0]);
        setCroppedImageUrl(imageUrl);
        setSelectedImageUrl(imageUrl);
    }

    function openDeleteForm() {
        setIsDeleteFormOpen(true);
    }

    function closeDeleteForm(e) {
        if (
            e.target === overlayRef.current ||
            e.target === cancelBtnRef.current
        )
            setIsDeleteFormOpen(false);
    }

    const deleteAccountHandler = async (e) => {
        try {
            e.preventDefault();

            await axios({
                withCredentials: true,
                method: "DELETE",
                url: `${config.url}/api/users/deleteAccount`,
                data: {
                    password: passwordDeleteRef.current.value,
                },
            });

            messageCtx.displayMessage("Account Deleted");
            dispatch({ type: actions.LOGOUT_USER });
            history.replace("/");
            appCtx.removeSocket();
        } catch (e) {
            messageCtx.displayMessage(e.response.data.message, true);
        }
    };

    function imageLoadHandler() {
        setLoadCount((p) => p + 1);
    }

    return (
        <div className={styles.AccountSection}>
            <div className={styles.heading}>Account Details</div>
            <div className={styles.content}>
                <div className={styles.detailField}>
                    <span>
                        <b>Profile Pic : </b>
                    </span>
                    <br />
                    {formState === "display" && (
                        <img
                            className={styles.profilePic}
                            src={currentUser.photo}
                            alt="Profile Pic"
                        />
                    )}
                    {formState === "edit" && (
                        <>
                            <img
                                className={styles.croppedPic}
                                src={croppedImageUrl}
                                alt="Cropped Preview"
                            />
                            <br />
                            <div className={styles.cropperContainer}>
                                <img
                                    ref={cropperRef}
                                    src={selectedImageUrl}
                                    alt="Nothing selected"
                                    className={styles.cropper}
                                    onLoad={imageLoadHandler}
                                />
                            </div>
                            <input
                                onChange={photoChangeHandler}
                                ref={photoRef}
                                accept="image/*"
                                type="file"
                            />
                        </>
                    )}
                </div>
                <div className={styles.detailField}>
                    <span>
                        <b>Name : </b>
                    </span>
                    {formState === "display" && currentUser.name}
                    {formState === "edit" && (
                        <input ref={nameRef} placeholder={currentUser.name} />
                    )}
                </div>
                <div className={styles.detailField}>
                    <span>
                        <b>Email : </b>
                    </span>
                    {formState === "display" && currentUser.email}
                    {formState === "edit" && (
                        <input ref={emailRef} placeholder={currentUser.email} />
                    )}
                </div>
                <div className={styles.detailField}>
                    <span>
                        <b>Description : </b>
                    </span>
                    {formState === "display" && currentUser.description}
                    {formState === "edit" && (
                        <input
                            ref={descriptionRef}
                            placeholder={currentUser.description}
                        />
                    )}
                </div>
                {formState === "edit" && (
                    <>
                        <div>
                            <span>
                                <b>Password </b>
                            </span>
                            <input
                                ref={passwordRef}
                                placeholder="Current Password required to edit profile"
                            />
                        </div>
                        <button onClick={cancelChanges}>Cancel</button>
                        <button onClick={sendEditData}>Save changes</button>
                    </>
                )}
                {formState === "display" && (
                    <button onClick={openEditForm}>Edit Account</button>
                )}

                {formState === "display" && (
                    <button onClick={openDeleteForm}>Delete Account</button>
                )}
                {isDeleteFormOpen && (
                    <div
                        ref={overlayRef}
                        onClick={closeDeleteForm}
                        className={styles.overlay}
                    >
                        <form
                            onSubmit={deleteAccountHandler}
                            className={styles.deleteForm}
                        >
                            Enter your password to confirm delete
                            <input
                                ref={passwordDeleteRef}
                                placeholder="Password required"
                            />
                            <button
                                className={styles.deleteFormBtn}
                                ref={cancelBtnRef}
                                onClick={closeDeleteForm}
                                type="button"
                            >
                                Cancel
                            </button>
                            <button type="submit">Confirm</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountSection;
