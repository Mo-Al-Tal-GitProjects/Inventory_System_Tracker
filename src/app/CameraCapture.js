'use client';

import React, { useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Box, Button, Typography } from '@mui/material';

const videoConstraints = {
    width: 300,
    height: 300,
    facingMode: "user"
};

export default function CameraCapture() {
    const [imageSrc, setImageSrc] = useState(null);
    const [uploading, setUploading] = useState(false);

    const webcamRef = React.useRef(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);
    }, [webcamRef]);

    const uploadImage = async () => {
        if (!imageSrc) return;

        setUploading(true);

        // Convert data URL to Blob
        const response = await fetch(imageSrc);
        const blob = await response.blob();

        // Upload to Firebase Storage
        const storageRef = ref(storage, `images/${Date.now()}.jpg`);
        const snapshot = await uploadBytes(storageRef, blob);

        // Get the download URL and store it in Firestore
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Uploaded a blob or file!', downloadURL);
        setUploading(false);

        // You can now save the download URL in your Firestore collection
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="h4">Capture and Upload Image</Typography>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
            />
            <Button variant="contained" onClick={capture}>Capture</Button>
            {imageSrc && (
                <>
                    <img src={imageSrc} alt="Captured" style={{ width: '300px', height: '300px' }} />
                    <Button variant="contained" onClick={uploadImage} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </>
            )}
        </Box>
    );
}
