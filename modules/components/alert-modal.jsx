import { Component } from "react"
import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import Button from "@mui/material/Button"
import Alert from "@mui/material/Alert"
import AlertTitle from "@mui/material/AlertTitle"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import { MdDescription } from "react-icons/md"
import { AiOutlineBarcode } from "react-icons/ai"
import { SiCoderwall } from "react-icons/si"
import { GiPriceTag } from "react-icons/gi"
import { getByBarcode } from "../net"
import { BiError } from "react-icons/bi"
import { status as statusChecker, priceFormatter } from "../utils"
import { RiSignalWifiErrorFill } from "react-icons/ri"
import { IoCloudOffline } from "react-icons/io5"

class AlertModal extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      open: false,
      content: {
        body: null,
        status: null,
      },
      netError: ""
    }
  }

  componentDidMount() {
    this.props.actionRef.current = {
      searchByBarcode: this.searchByBarcode.bind(this),
    }
  }

  searchByBarcode(barcode) {
    this.showLoading();
    getByBarcode(barcode)
      .then(({ body, status }) => {
        this.setContentBody(body);
        this.setContentStatus(status);
        if (statusChecker.isBadRequest(status)) {
          this.suppressLoading();
          this.props.showFieldError(body.violations)
          return;
        }
        this.setNetError("")
        this.openModal();
      })
      .catch(error => {
        if (error instanceof TypeError)
          this.setNetError("no-connection")
        else if (error instanceof DOMException)
          this.setNetError("no-server")
        this.suppressLoading();
        this.openModal();
      })
  }

  showLoading() {
    this.setState({ loading: true })
  }

  suppressLoading() {
    this.setState({ loading: false })
  }

  setContentBody(body) {
    this.setContentState({ body })
  }

  setContentStatus(status) {
    this.setContentState({ status })
  }

  setContentState(property)  {
    this.setState(prevState => {
      const [ key ] = Object.keys(property)
      return {
        content: {
          ...prevState.content,
          [key]: property[key],
        }
      }
    })
  }

  setNetError(netError) {
    this.setState({ netError })
  }

  openModal() {
    this.setState({ open: true });
  }

  closeModalAndSuppressLoading() {
    this.suppressLoading();
    this.setState({ open: false })
  }

  chooseSeverityByStatus() {
    const options = {
      200: {
        severity: "info",
        msg: "Product is already exist!"
      },
      201:  {
        severity: "success",
        msg: "Product created!"
      }
    }

    return options[this.state.content.status] ?? {
      severity: "error",
      msg: "Product not found!"
    }
  }

  render() {
    return (
      <>
        <Backdrop className="z-10" open={this.state.loading}>
          <CircularProgress/>
        </Backdrop>
        <Dialog
          fullWidth={true}
          maxWidth={"sm"}
          open={this.state.open}
          className="bg-transparent"
        >
          {
            !this.state.netError &&
            <DialogTitle>
              <Alert severity={this.chooseSeverityByStatus().severity} variant="filled">
                <AlertTitle>{this.chooseSeverityByStatus().msg}</AlertTitle>
              </Alert>
            </DialogTitle>
          }
          <DialogContent dividers={this.state.content.status !== 404}>
          {
            this.state.netError
              ? <ErrorBoard netError={this.state.netError}/>
              : this.state.content.status === 404
                ? <Box className="flex justify-center p-2">
                    <BiError className="text-9xl text-black"/>
                  </Box>
                : <ContentData body={this.state.content.body}/>
          }
          </DialogContent>
          <DialogActions>
            <Button className="float-right" onClick={this.closeModalAndSuppressLoading.bind(this)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }
}

function ErrorBoard({ netError }) {
  const alertOption = {
    "no-connection": [
      <RiSignalWifiErrorFill className="w-10 h-10 text-zinc-300"/>,
      "No connection"
    ],
    "no-server": [
      <IoCloudOffline className="w-10 h-10 text-zinc-300"/>,
      "Server is not responding"
    ]
  }

  return (
    <Box className="w-full h-full flex flex-col items-center">
      { alertOption[netError][0] }
      <span className="w-fit">
        { alertOption[netError][1] }
      </span>
    </Box>
  )
}

function ContentData(props) {
  return (
    <List>
      <ListItem className="flex flex-col md:flex-row justify-center gap-0 md:gap-5 mb-2">
        <Box className="basis-1/3">
          <MdDescription className="text-2xl mr-3 inline-block align-middle"/>
          <ListItemText className="inline-block align-middle" primary="Description:"/>
        </Box>
        <Box className="basis-1/3">
          <ListItemText primary={props.body?.description}></ListItemText>
        </Box>
      </ListItem>
      <ListItem className="flex flex-col md:flex-row justify-center gap-0 md:gap-5 mb-2">
        <Box className="basis-1/3">
          <AiOutlineBarcode className="text-2xl mr-3 inline-block align-middle"/>
          <ListItemText className="inline-block align-middle" primary="Barcode"/>
        </Box>
        <Box className="basis-1/3">
          <ListItemText primary={props.body?.barcode}></ListItemText>
        </Box>
      </ListItem>
      <ListItem className="flex flex-col md:flex-row justify-center gap-0 md:gap-5 mb-2">
        <Box className="basis-1/3">
          <SiCoderwall className="text-2xl mr-3 inline-block align-middle"/>
          <ListItemText className="inline-block align-middle" primary="Sequence code"/>
        </Box>
        <Box className="basis-1/3">
          <ListItemText primary={props.body?.sequenceCode}></ListItemText>
        </Box>
      </ListItem>
      <ListItem className="flex flex-col md:flex-row justify-center gap-0 md:gap-5">
        <Box className="basis-1/3">
          <GiPriceTag className="text-2xl mr-3 inline-block align-middle"/>
          <ListItemText className="inline-block align-middle" primary="Current price"/>
        </Box>
        <Box className="basis-1/3">
          <ListItemText primary={priceFormatter(props.body?.currentPrice)}></ListItemText>
        </Box>
      </ListItem>
    </List>
  )
}

export default AlertModal