import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import Button from "@mui/material/Button"
import { Component, createRef } from "react";
import { create } from "domain";

class ScannerModal extends Component {

  constructor(props) {
    super(props)

    this.state = {
      open: false,
    }

    this.videoStream = null;
    this.videoPlayer = createRef();

    this.props.actions({
      openModal: this.openModalAndStartScanning.bind(this)
    })
  }

  async openModalAndStartScanning() {
    try {
      this.videoStream = await this.askForMediaStreams();
      this.startScanning()
      this.setState({ open: true })
    }
    catch (err) {
      console.error(err)
    }
  }

  closeModalAndStopScanning() {
    this.stopScanning()
    this.setState({ open: false })
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

  stopScanning() {
    this.videoStream.getTracks().forEach(track => track.stop());
  }

  async startScanning() {
    let baseMillis = Date.now();
    const barcodeDetector = new BarcodeDetector({ formats: ["upc_a", "upc_e", "ean_8", "ean_13"] });
    const transformer = new TransformStream({
      async transform(videoFrame, controller) {
        if (Date.now() - baseMillis >= 1000) {
          const bitmap = await createImageBitmap(videoFrame)
          const [barcode] = await barcodeDetector.detect(bitmap)
          if (barcode) alert(barcode.rawValue);
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
  

  render() {

    return (
      <>
        <Dialog
          fullWidth={true}
          maxWidth={"md"}
          keepMounted={true}
          open={this.state.open}
          className="bg-transparent"
        >
          <DialogContent>
            <video autoPlay={true} className="w-full h-full -z-50" ref={this.videoPlayer}/>
          </DialogContent>
          <DialogActions>
            <Button className="float-right" onClick={this.closeModalAndStopScanning.bind(this)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }
}

export default ScannerModal;