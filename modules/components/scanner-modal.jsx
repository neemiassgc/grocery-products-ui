import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import Button from "@mui/material/Button"
import { createRef, useEffect } from "react";


export default function ScannerModal(props) {
  const videoPlayer = createRef(null);
  let videoStream = null;

  useEffect(() => {
    askForMediaStreams()
      .then(stream => {
        videoStream = stream;
        startScanning();
      })
      .catch(console.error)
  }, [])


  const askForMediaStreams = async () => {
    const devices =  await navigator.mediaDevices.enumerateDevices()
    const constraints = pickMediaDevice(devices);

    return await navigator.mediaDevices.getUserMedia({
      video: constraints,
      audio: false
    });
  }

  const pickMediaDevice = mediaDevices => {
    let constraints = {}
    mediaDevices.forEach(device => {
      if (device.kind === "videoinput" && device.label.includes("0")) {
        constraints.deviceId = device.deviceId
      }
    })
    return constraints
  }

  const startScanning = async () => {
    let baseMilliseconds = Date.now();
    const barcodeDetector = new BarcodeDetector({ formats: ["upc_a", "upc_e", "ean_8", "ean_13"] });
    const transformer = new TransformStream({
      async transform(videoFrame, controller) {
        if (Date.now() - baseMilliseconds >= 500) {
          const bitmap = await createImageBitmap(videoFrame)
          const [barcode] = await barcodeDetector.detect(bitmap)
          if (barcode) {
            disposeResources();
            props.findProduct(barcode.rawValue);
          }
          baseMilliseconds = Date.now();
        }

        controller.enqueue(videoFrame)
      },
      flush(controller) {
        controller.terminate();
      }
    });

    const [videoTrack] = videoStream.getVideoTracks();
    const trackProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
    const trackGenerator = new MediaStreamTrackGenerator({ kind: "video" });

    trackProcessor.readable
      .pipeThrough(transformer)
      .pipeTo(trackGenerator.writable);

    const processedStream = new MediaStream();
    processedStream.addTrack(trackGenerator);

    const currentVideoPlayer = videoPlayer.current;
    currentVideoPlayer.srcObject = processedStream
  }

  const disposeResources = () => {
    videoPlayer.current.pause();
    videoPlayer.current.srcObject = null;
    videoStream.getTracks().forEach(track => track.stop())
    props.onCloseClick();
  }

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth={"md"}
        open={true}
        className="bg-transparent"
      >
        <DialogContent className="p-0 m-0 md:flex md:justify-center">
          <video autoPlay={true} className="w-full md:w-11/12" ref={videoPlayer}/>
        </DialogContent>
        <DialogActions className="p-0 mt-0 md:p-2">
          <Button variant="outlined" className="float-right" onClick={disposeResources}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}