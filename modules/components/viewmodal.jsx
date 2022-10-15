import { Component } from "react"
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, Alert, AlertTitle } from "@mui/material"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import ListItemIcon from "@mui/material/ListItemIcon"
import { MdDescription } from "react-icons/md"
import { AiOutlineBarcode } from "react-icons/ai"
import { SiCoderwall } from "react-icons/si"
import { GiPriceTag } from "react-icons/gi"
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { getByBarcode } from "../net"

class DialogView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      open: false,
      content: {
        body: null,
        status: null,
      }
    }

    props.actions({
      searchByBarcode: this.searchByBarcode.bind(this),
    })
  }

  searchByBarcode(barcode) {
    this.setIsLoading(true);
    getByBarcode(barcode)
      .then(({ body, status}) => {
        this.setContentBody(body);
        this.setContentStatus(status);

        if (status === 400) {
          this.setIsLoading(false);
          this.props.showFieldError(body.violations)
        }
        else this.openModal();
      })
      .catch(console.error)
  }

  setIsLoading(flag) {
    this.setState({ isLoading: flag })
  }

  setContentBody(body) {
    this.setState(prev => {
      return {
        content: {
          body,
          status: prev.content.status,
        }
      }
    })
  }

  setContentStatus(status) {
    this.setState(prev => {
      return {
        content: {
          body: prev.content.body,
          status,
        }
      }
    })
  }

  openModal() {
    this.setIsLoading(false);
    this.setState({ open: true });
  }

  closeModal() {
    this.setState({ open: false })
  }

  chooseSeverityByStatus() {
    let object;
    switch (this.state.content.status) {
      case 200:
        object = {
          severity: "info",
          msg: "Product is already exist!"
        }
        break;
      case 201:
        object = {
          severity: "success",
          msg: "Product created!"
        }
        break;
      default:
        object = {
          severity: "error",
          msg: "Product not found!"
        }
    }
    return object;
  }

  render() {
    return (
      <>
        <Backdrop className="z-10" open={this.state.isLoading}>
          <CircularProgress/>
        </Backdrop>
        <Dialog
          fullWidth={true}
          maxWidth={"sm"}
          open={this.state.open}
          className="bg-transparent"
        >
          <DialogTitle>
            <Alert severity={this.chooseSeverityByStatus().severity} variant="filled">
              <AlertTitle>{this.chooseSeverityByStatus().msg}</AlertTitle>
            </Alert>
          </DialogTitle>
          <DialogContent dividers={true}>
            <List>
              <ListItem className="flex gap-0">
                <ListItemIcon className="shrink"><MdDescription className="text-2xl"/></ListItemIcon>
                <ListItemText className="basis-1/2" primary="Description"/>
                <ListItemText className="basis-1/2" primary={this.state.content.body?.description}/>
              </ListItem>
              <ListItem className="flex gap-0">
                <ListItemIcon className="shrink"><AiOutlineBarcode className="text-2xl"/></ListItemIcon>
                <ListItemText className="basis-1/2" primary="Barcode"/>
                <ListItemText className="basis-1/2" primary={this.state.content.body?.barcode}/>
              </ListItem>
              <ListItem className="flex gap-0">
                <ListItemIcon className="shrink"><SiCoderwall className="text-2xl"/></ListItemIcon>
                <ListItemText className="basis-1/2" primary="Sequence code"/>
                <ListItemText className="basis-1/2" primary={this.state.content.body?.sequenceCode}/>
              </ListItem>
              <ListItem className="flex gap-0">
                <ListItemIcon className="shrink"><GiPriceTag className="text-2xl"/></ListItemIcon>
                <ListItemText className="basis-1/2" primary="Price"/>
                <ListItemText className="basis-1/2" primary={this.state.content.body?.currentPrice}/>
              </ListItem>
            </List>
          }
          </DialogContent>
          <DialogActions>
            <Button className="float-right" onClick={this.closeModal.bind(this)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }
}

export default DialogView