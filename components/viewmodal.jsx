import { Component } from "react"
import { Dialog, DialogContent, DialogTitle, DialogActions, Box, Typography, Button } from "@mui/material"

class DialogView extends Component {

  constructor(props) {
    super(props)
  }

  handleOpen() {
    this.props.open = true;
  }

  handleClose() {
    this.props.open = false;
  }

  render() {
    return (
      <Dialog
        onClose={this.handleClose.bind(this)}
        open={this.props.open}
      >
        <DialogTitle>
          <Button onClick={this.handleClose.bind(this)}>Close</Button>
        </DialogTitle>
        <DialogContent>This is the content</DialogContent>
        <DialogActions>Here should stay the actions</DialogActions>
      </Dialog>
    )
  }
}

export default DialogView