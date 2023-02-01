import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import Button from "@mui/material/Button"
import { Component, createRef } from "react";

class ScannerModal extends Component {

  constructor(props) {
    super(props)

    this.videoStream = null;
    this.videoPlayer = createRef();
  }

  async componentDidMount() {
    try {
      this.videoStream = await this.askForMediaStreams();
      this.startScanning()
    }
    catch (err) {
      console.error(err)
    }
  }

  componentWillUnmount() {
    this.closeModalAndStopScanning();
  }

  async askForMediaStreams() {
    const devices =  await navigator.mediaDevices.enumerateDevices()
    const constraints = this.pickMediaDevice(devices);

    return await navigator.mediaDevices.getUserMedia({
      video: constraints,
      audio: false
    });
  }

  pickMediaDevice(mediaDevices) {
    let constraints = {}
    mediaDevices.forEach(device => {
      if (device.kind === "videoinput" && device.label.includes("0")) {
        constraints.deviceId = device.deviceId
      }
    })
    return constraints
  }

  async startScanning() {
    let baseMillis = Date.now();
    const barcodeDetector = new BarcodeDetector({ formats: ["upc_a", "upc_e", "ean_8", "ean_13"] });
    const close = this.props.onCloseClick
    const findProductAndOpenInfoModal = this.props.findProductAndOpenInfoModal
    const transformer = new TransformStream({
      async transform(videoFrame, controller) {
        if (Date.now() - baseMillis >= 500) {
          const bitmap = await createImageBitmap(videoFrame)
          const [barcode] = await barcodeDetector.detect(bitmap)
          if (barcode) {
            close();
            findProductAndOpenInfoModal(barcode.rawValue)
          }
          baseMillis = Date.now();
        }

        controller.enqueue(videoFrame)
      },
      flush(controller) {
        controller.terminate();
      }
    });

    const [videoTrack] = this.videoStream.getVideoTracks();
    const trackProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
    const trackGenerator = new MediaStreamTrackGenerator({ kind: "video" });

    trackProcessor.readable
      .pipeThrough(transformer)
      .pipeTo(trackGenerator.writable);

    const processedStream = new MediaStream();
    processedStream.addTrack(trackGenerator);

    const currentVideoPlayer = this.videoPlayer.current;
    currentVideoPlayer.addEventListener("loadedmetadata", () => {
      currentVideoPlayer.play();
    });
    currentVideoPlayer.srcObject = processedStream
  }

  closeModalAndStopScanning() {
    this.stopScanning()
    this.props.onCloseClick();
  }

  stopScanning() {
    this.videoStream.getTracks().forEach(track => track.stop());
  }

  render() {
    return (
      <>
        <Dialog
          fullWidth={true}
          maxWidth={"md"}
          keepMounted={true}
          open={this.props.open}
          className="bg-transparent"
        >
          <DialogContent className="p-0 m-0 md:flex md:justify-center">
            <video autoPlay={true} className="w-full md:w-11/12" ref={this.videoPlayer}/>
          </DialogContent>
          <DialogActions className="p-0 mt-0 md:p-2">
            <Button variant="outlined" className="float-right" onClick={this.props.onCloseClick}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }
}

export default ScannerModal;