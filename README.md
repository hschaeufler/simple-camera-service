# Simple Camera Service
This Project is a Simple Camera Service based on the MediaDevices-Api. The Service was extracted from one of my other projects. The other project is named [businesscardwallet](https://gitlab.com/businesscardwallet/bcw.git) and is a PWA for managing bussinesscards. 

For using the Service please have a look at [businesscardwallet](https://gitlab.com/businesscardwallet/bcw.git) or [Impfass-App](https://github.com/hschaeufler/impfpass-frontend)

## Using the Service
For Using the Service first install as dependency:

``npm install simple-camera-service``

```
import CameraService from "simple-camera-service";

//Start Streaming and getting the Stream
const stream = await CameraService.getDefaultVideoStream();

//For Cleanup call
CameraService.stopStream();

//For Taking a Photo call
CameraService.takePhoto()

//Switching Camera (there is currently a bug in switch Camera with Firefox)
const stream = await CameraService.switchCamera()

```

## Support
Feel free to contact me when you have some improvements!
 