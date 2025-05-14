import * as faceapi from "face-api.js";

const FaceDetection = ({videoRef}) => {

  const detectFaces = async () => {
    if (!videoRef.current) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    document.body.append(canvas);
    faceapi.matchDimensions(canvas, {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight
    });

    const resized = faceapi.resizeResults(detections, {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight
    });

    faceapi.draw.drawDetections(canvas, resized);
  };
  
  return (
    <div>
      <video ref={videoRef} autoPlay muted width="720" height="560" />
    </div>
  );
};

export default FaceDetection;
