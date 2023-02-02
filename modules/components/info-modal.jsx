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
import { BiError } from "react-icons/bi"
import { priceFormatter } from "../utils"
import { RiSignalWifiErrorFill } from "react-icons/ri"
import { IoCloudOffline } from "react-icons/io5"

export default function InfoModal(props) {

  const chooseSeverityByStatus = () => {
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
  
    return options[props.content.status] ?? {
      severity: "error",
      msg: "Product not found!"
    }
  }

  return (
    <>
      <Backdrop className="z-10" open={props.loading}>
        <CircularProgress/>
      </Backdrop>
      <Dialog
        keepMounted={true}
        fullWidth={true}
        maxWidth={"sm"}
        open={props.open}
        className="bg-transparent"
      >
        {
          !props.netError &&
          <DialogTitle>
            <Alert severity={chooseSeverityByStatus().severity} variant="filled">
              <AlertTitle>{chooseSeverityByStatus().msg}</AlertTitle>
            </Alert>
          </DialogTitle>
        }
        <DialogContent dividers={props.content.status !== 404}>
        {
          props.netError
            ? <ErrorBoard netError={props.netError}/>
            : props.content.status === 404
              ? <Box className="flex justify-center p-2">
                  <BiError className="text-9xl text-black"/>
                </Box>
              : <ContentData body={props.content.body}/>
        }
        </DialogContent>
        <DialogActions>
          <Button className="float-right" onClick={props.onCloseClick}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
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
  const iconStyleClasses = "text-2xl mr-3 inline-block align-middle";
  return (
    <List>
      <ListDataBlock value={props.body?.description} name="Description:">
        <MdDescription className={iconStyleClasses}/>
      </ListDataBlock>
      <ListDataBlock value={props.body?.barcode} name="Barcode">
        <AiOutlineBarcode className={iconStyleClasses}/>
      </ListDataBlock>
      <ListDataBlock value={props.body?.sequenceCode} name="Sequence Code">
        <SiCoderwall className={iconStyleClasses}/>
      </ListDataBlock>
      <ListDataBlock value={priceFormatter(props.body?.currentPrice)} name="Current Price">
        <GiPriceTag className={iconStyleClasses}/>
      </ListDataBlock>
    </List>
  )
}

function ListDataBlock({ children: icon, value, name}) {
  return (
    <ListItem className="flex flex-col md:flex-row justify-center gap-0 md:gap-5 mb-2">
      <Box className="basis-1/3">
        {icon}
        <ListItemText className="inline-block align-middle" primary={name}/>
      </Box>
      <Box className="basis-1/3">
        <ListItemText primary={value}></ListItemText>
      </Box>
    </ListItem>
  )
}