# Simple Camera Service
This Project is a Simple Camera Service based on the MediaDevices-Api. The Service was extracted from one of my other projects. The other project is named [businesscardwallet](https://gitlab.com/businesscardwallet/bcw.git) and is a PWA for managing bussinesscards. 

For using the Service please have a look at [businesscardwallet](https://gitlab.com/businesscardwallet/bcw.git) or [Impfass-App](https://github.com/hschaeufler/impfpass-frontend)

## Using the Service
For Using the Service first install as dependency:

``npm install simple-camera-service``

```javascript
import CameraService from "simple-camera-service";

//Start Streaming and getting the Stream
const stream = await CameraService.getDefaultVideoStream();

//For Cleanup call
CameraService.stopStream();

//For Taking a Photo call
const dataURL = await CameraService.takePhoto()

//Switching Camera (there is currently a bug in the switchCamera-Function with Firefox)
const stream = await CameraService.switchCamera()

//You can also scan the Stream for a QRCode. The Scanning Stops, when the Stream is not active anymore
//For scanning the Stream jsQR is used. For the result-Object please see: https://github.com/cozmo/jsQR
function resultCallBack(code){
   console.log(code.data);
}

function streamEndedCallback(cause){
    console.log(cause);
}

CameraService.scanStreamForQRCode(resultCallBack,streamEndedCallback);            

```

## Support
Feel free to contact me when you have some improvements!
 