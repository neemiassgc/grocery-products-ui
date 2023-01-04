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
      openModal: this.openModal.bind(this)
    })
  }

  openModal() {
    this.setState({ open: true })
    this.recording()
  }

  closeModal() {
    this.setState({ open: false })
  }

  async recording() {
    // check compatibility

    // if (!isSecureContext) {
    //   return (location.protocol = "https:");
    // }
  
    // if (
    //   !("MediaStreamTrackProcessor" in window) ||
    //   !("MediaStreamTrackGenerator" in window)
    // ) {
    //   return alert("This demo is not supported on your browser. Your browser lacks support for `MediaStreamTrackProcessor` and `MediaStreamTrackGenerator`.");
    // }
    // if (!("BarcodeDetector" in window)) {
    //   return alert("This demo is not supported on your browser. Your browser lacks support for `BarcodeDetector`.");
    // }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        },
        audio: false
      });
      
      const videoTrack = stream.getVideoTracks()[0];
      const barcodeDetector = this.detectBarcode.bind(this);
      const transformer = new TransformStream({
        async transform(videoFrame, controller) {
          const bitmap = await createImageBitmap(videoFrame)
          const [barcode] = await barcodeDetector(bitmap)
          if (barcode) alert(barcode.rawValue);
          
          bitmap.close();
          controller.enqueue(videoFrame)
        },
        flush(controller) {
          controller.terminate();
        }
      });

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

      // setInterval(() => {
      //   this.detectBarcode(currentVideoPlayer)
      //   .then(([barcode]) => alert(barcode.rawValue))
      // }, 1000)

    }
    catch (err) {
      console.error(err.name, err.message);
    }
  }

  detectBarcode(stream) {
    const barcodeDetector = new BarcodeDetector({
      formats: ["upc_a", "upc_e", "ean_8", "ean_13", "qr_code"],
    });

    return barcodeDetector.detect(stream)
  }
  

  render() {

    return (
      <>
        <Dialog
          fullWidth={true}
          maxWidth={"md"}
          open={this.state.open}
          className="bg-transparent"
        >
          <DialogContent>
            <video autoPlay={true} className="w-full h-full -z-50" ref={this.videoPlayer}/>
          </DialogContent>
          <DialogActions>
            <Button className="float-right" onClick={this.closeModal.bind(this)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }
}

export default ScannerModal;