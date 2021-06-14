import _ from 'lodash';
import jsQR from "jsqr";

const CameraService = (function () {


    let videoStream = null;
    let currentDeviceID = "";
    //prefer Rear-Camera: see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    const DEFAULT_MEDIA_CONSTRAINTS = {audio: false, video: {facingMode: "environment"}};
    const EXCACT_DEVICE_ID_MEDIA_CONSTRAINTS = {audio: false, video: {deviceId: ""}};
    const DEVICE_KIND_VIDEO = "videoinput";
    const DEVICE_KIND_FIELD = "kind";


    function supportsCamera() {
        return "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices;
    }

    function buildEXACTDEVIDCONSTRAINTS(deviceID) {
        let deviceConstraint = _.cloneDeep(EXCACT_DEVICE_ID_MEDIA_CONSTRAINTS);
        deviceConstraint.video.deviceId = deviceID;
        return deviceConstraint;
    }

    function supportsDeviceEnumeration() {
        let supportsDevices = "mediaDevices" in navigator && "enumerateDevices" in navigator.mediaDevices;
        return supportsDevices;
    }

    async function getDevices() {
        if (supportsDeviceEnumeration) {
            return await navigator.mediaDevices.enumerateDevices();
        }
        throw "Don't support Device-Enumeration!";
    }

    async function getFilteredDevices(filter) {
        const DEVICE_FILTER = {[DEVICE_KIND_FIELD]: DEVICE_KIND_VIDEO};
        let devices = await getDevices();
        let filteredDevices = _.filter(devices, DEVICE_FILTER);
        return filteredDevices;
    }

    async function getVideoDevices() {
        return getFilteredDevices(DEVICE_KIND_VIDEO)
    }

    async function getDefaultVideoStream() {
        return getVideoStream(DEFAULT_MEDIA_CONSTRAINTS);
    }

    async function getVideoStreamById(cameraID) {
        let constraints = buildEXACTDEVIDCONSTRAINTS(cameraID);
        return getVideoStream(constraints);
    }


    async function switchCamera() {
        if (supportsDeviceEnumeration()) {
            let deviceList = await getVideoDevices();
            let response = null;
            _.forEach(deviceList, function (device) {
                if (device && device.deviceId && (device.deviceId !== currentDeviceID)) {
                    response = getVideoStreamById(device.deviceId).then(
                        function (stream) {
                            currentDeviceID = device.deviceId;
                            return stream;
                        });
                    return false;
                }
            });
            return response;
        }
    }

    function stopStream() {
        //MediaDevices is a singelton
        //see: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if (videoStream && videoStream.active && videoStream.getTracks()) {
            let tracks = videoStream.getTracks();

            _.forEach(tracks, function (track) {
                if (track && track.enabled) {
                    track.stop();
                }
            })
        }
    }

    function isStreamActive() {
        return (videoStream && videoStream.active);
    }

    async function drawStreamImageOnCanvas() {
        if (isStreamActive()) {
            let video = document.createElement('video');
            video.autoplay = true;
            let canvas = document.createElement('canvas');

            video.srcObject = videoStream;

            video.play();

            let photoPromise = new Promise(function (resolve, reject) {
                video.addEventListener("playing", () => {
                    let width = video.videoWidth;
                    let height = video.videoHeight;
                    canvas.width = width;
                    canvas.height = height;
                    let context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, width, height);
                    resolve(canvas);
                });
            });
            return photoPromise;
        }
        throw "Stream is not Active!";
    }

    async function takePhoto() {
        const canvas = await drawStreamImageOnCanvas();
        const dataUrl = canvas.toDataURL("image/png");
        return dataUrl;
    }

    async function getImageDataOfStream() {
        const canvas = await drawStreamImageOnCanvas();
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const imageData = context.getImageData(0, 0, width, height);
        return imageData;
    }

    async function scanForQRCode() {
        let code = null;
        if (isStreamActive()) {
            const imageData = await getImageDataOfStream();

            const imageDataArray = imageData.data;
            const width = imageData.width;
            const height = imageData.height;

            const options = {
                inversionAttempts: "dontInvert",
            };

            code = jsQR(imageDataArray, width, height, options);
        } else {
            throw "Stream is not active!";
        }
        return code;
    }

    function scanStreamForQRCode(succesCallBack, streamEndedCallback) {
        if (!isStreamActive()) {
            if(streamEndedCallback){
                streamEndedCallback("Stream is not active!");
            }
            return;
        }
        window.requestAnimationFrame(async () => {
            try {
                const qrCode = await scanForQRCode();
                if (qrCode) {
                    succesCallBack(qrCode);
                }
                scanStreamForQRCode(succesCallBack, streamEndedCallback);
            } catch (exception){
                console.error(exception);
                if(streamEndedCallback){
                    streamEndedCallback(exception);
                }
            }
        });
    }


    async function getVideoStream(options) {
        if (videoStream) {
            stopStream();
        }
        if (supportsCamera()) {
            videoStream = await navigator.mediaDevices.getUserMedia(options);
            return videoStream;
        }
        throw "Does not support Camera!";
    }

    return {
        getVideoStream: getVideoStream,
        stopStream: stopStream,
        getDevices: getDevices,
        supportsCamera: supportsCamera,
        getDefaultVideoStream: getDefaultVideoStream,
        takePhoto: takePhoto,
        isStreamActive: isStreamActive,
        supportsDeviceEnumeration: supportsDeviceEnumeration,
        getVideoStreamById: getVideoStreamById,
        getVideoDevices: getVideoDevices,
        switchCamera: switchCamera,
        scanForQRCode: scanForQRCode,
        scanStreamForQRCode: scanStreamForQRCode
    }
})
();

export default CameraService;
