import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const calibrationPointRef = useRef<HTMLDivElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cursorActive, setCursorActive] = useState(false);
  const [initialNosePosition, setInitialNosePosition] = useState<{ x: number; y: number } | null>(null);
  const [eyesClosedStartTime, setEyesClosedStartTime] = useState<number | null>(null);
  const [calibrationStartTime, setCalibrationStartTime] = useState<number | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Função para carregar os modelos do face-api.js
  const loadModels = async () => {
    const MODELS_URL = "/models"; // ajuste conforme o caminho dos modelos
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL);
    setModelsLoaded(true);
  };

  useEffect(() => {
    loadModels();

    // Captura de vídeo/inicia video
    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        (videoRef.current as HTMLVideoElement).srcObject = stream;
      }
    };

    startVideo();
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;

    const interval = setInterval(async () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks();

        if (detections) {
          const { landmarks } = detections;
          const eyeLeft = landmarks.getLeftEye();
          const eyeRight = landmarks.getRightEye();
          const mouth = landmarks.getMouth();
          const nose = landmarks.getNose();

          // const width = videoRef.current.videoWidth;
          // const height = videoRef.current.videoHeight;
          const [noseX, noseY] = [nose[3].x, nose[3].y];

          if (isCalibrating) {
            const calibrationPoint = calibrationPointRef.current;
            if (!calibrationPoint) return;
            const rect = calibrationPoint.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2;

            const distance = Math.sqrt(
              Math.pow(noseX - targetX, 2) + Math.pow(noseY - targetY, 2)
            );

            if (distance < 50) {
              // Tolerância para considerar que está olhando para o ponto
              if (!calibrationStartTime) {
                setCalibrationStartTime(Date.now());
              } else if (Date.now() - calibrationStartTime >= 3000) {
                setIsCalibrating(false);
                setCalibrationStartTime(null);
                setCursorActive(true);
                setInitialNosePosition({ x: noseX, y: noseY });
                speakInstruction(
                  "Calibração concluída. O cursor agora segue o movimento dos seus olhos."
                );
              }
            } else {
              setCalibrationStartTime(null);
            }
          } else {
            if (initialNosePosition) {
              // Calcula a nova posição do cursor visual
              const moveX = (noseX - initialNosePosition.x) * 500;
              const moveY = (noseY - initialNosePosition.y) * 500;

              if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
              }
            }
          }

          // Define os limites para determinar se a boca está aberta
          const mouthOpen = mouth[6].y - mouth[3].y > 5;
          const eyeLeftClosed = eyeLeft[1].y - eyeLeft[5].y <= 10;
          const eyeRightClosed = eyeRight[1].y - eyeRight[5].y <= 10;

          // cliques e movimentos
          if (mouthOpen && eyeLeftClosed && !eyeRightClosed && cursorActive) {
            // clique com botão esquerdo no navegador
            document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            await sleep(500);
          }
          if (mouthOpen && eyeRightClosed && !eyeLeftClosed && cursorActive) {
            // clique com botão direito no navegador
            document.dispatchEvent(
              new MouseEvent("contextmenu", { bubbles: true })
            );
            await sleep(500);
          }

          if (eyeLeftClosed && eyeRightClosed) {
            if (!eyesClosedStartTime) {
              setEyesClosedStartTime(Date.now());
            } else if (Date.now() - eyesClosedStartTime >= 2000) {
              setCursorActive(false);
            }
          } else {
            setEyesClosedStartTime(null);
            setCursorActive(true);
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    modelsLoaded,
    cursorActive,
    eyesClosedStartTime,
    initialNosePosition,
    isCalibrating,
  ]);

  useEffect(() => {
    if (isCalibrating) {
      moveCalibrationPoint();

      const calibrationInterval = setInterval(() => {
        moveCalibrationPoint();
      }, 1000); // Move a esfera constantemente

      setTimeout(() => {
        setIsCalibrating(false);
        setCursorActive(true);
        speakInstruction(
          "Calibração concluída. O cursor agora segue o movimento dos seus olhos."
        );
      }, 10000); // Dura 10 segundos a calibração

      return () => clearInterval(calibrationInterval);
    }
  }, [isCalibrating]);

  const startCalibrationEyes = () => {
    setIsCalibrating(true);
    speakInstruction(
      "Apenas com movimento dos olhos, Siga a esfera azul por todo seu percurso."
    );
    moveCalibrationPoint(); // Move a esfera imediatamente ao iniciar a calibração
  };

  const startCalibrationHead = () => {
    setIsCalibrating(true);
    speakInstruction(
      "Apenas apenas com movimento de cabeça, Siga a esfera azul por todo seu percurso."
    );
    moveCalibrationPoint(); // Move a esfera imediatamente ao iniciar a calibração
  }

  const moveCalibrationPoint = () => {
    const calibrationPoint = calibrationPointRef.current;
    const width = window.innerWidth - 20; // Ajuste conforme o tamanho da esfera
    const height = window.innerHeight - 20; // Ajuste conforme o tamanho da esfera

    const randomX = Math.random() * width;
    const randomY = Math.random() * height;

    if (calibrationPoint) {
      calibrationPoint.style.transition = "transform 0.05s linear";
      calibrationPoint.style.transform = `translate(${randomX}px, ${randomY}px)`;
    }
  };

  const speakInstruction = (text: string | undefined) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const sleep = (ms: number | undefined) => new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <div className="App">
      {!isCalibrating && !cursorActive && (
        <button onClick={startCalibrationEyes}>Iniciar Calibração</button>
      )}
      {isCalibrating && (
        <div ref={calibrationPointRef} className="calibration-point"></div>
      )}
      {isCalibrating && (
        <div ref={startCalibrationHead} className="App"></div>
      )}
     
      <video ref={videoRef} autoPlay muted width="720" height="560" />
      <div ref={cursorRef} className="cursor"></div>
    </div>
  );
};

export default App;
