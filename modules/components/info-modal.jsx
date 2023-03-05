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
import Skeleton from '@mui/material/Skeleton';
import { MdDescription } from "react-icons/md"
import { AiOutlineBarcode } from "react-icons/ai"
import { SiCoderwall } from "react-icons/si"
import { GiPriceTag } from "react-icons/gi"
import { BiError } from "react-icons/bi"
import { priceFormatter } from "../utils"
import { RiSignalWifiErrorFill } from "react-icons/ri"
import { IoCloudOffline } from "react-icons/io5"

export default function InfoModal(props) {
  const blockContent = <>
    <DialogHeader status={props.status}/>
    <DialogContent dividers={props.status !== "not_found"}>
      <MainContent {...props} />
    </DialogContent>
    <DialogActions>
      <Button className="float-right" onClick={props.onCloseClick}>Close</Button>
    </DialogActions>
  </>

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth={"sm"}
        open={true}
        className="bg-transparent"
      >
        {
          props.status === "loading" ? <PlaceHolder/> : blockContent
        }
      </Dialog>
    </>
  )
}

function PlaceHolder() {
  return (
    <>
      <DialogTitle>
        <Skeleton variant="rounded" animation="wave" className="w-full" height={60}/>
      </DialogTitle>
      <DialogContent>
        <Skeleton variant="rounded" animation="wave" className="w-full" height={400}/>
      </DialogContent>
      <DialogActions>
        <Skeleton variant="rounded" animation="wave">
          <Button className="float-right">Close</Button>
        </Skeleton>
      </DialogActions>
    </>
  )
}

function MainContent({ status, content }) {
  return {
    "no_connection": <ErrorBoard message={"No internet connection"}>
      <RiSignalWifiErrorFill className="w-10 h-10 text-zinc-300"/>
    </ErrorBoard>,
    "no_server": <ErrorBoard message={"Server is not responding"}>
      <IoCloudOffline className="w-10 h-10 text-zinc-300"/>
    </ErrorBoard>,
    "not_found": <Box className="flex justify-center p-2">
      <BiError className="text-9xl text-black"/>
    </Box>,
  }[status] || <ContentData body={content}/>
}

function DialogHeader({ status }) {
  if (!["created", "existing", "not_found"].includes(status)) return  null;

  const options = {
    "created": {
      severity: "success",
      msg: "Product created!"
    },
    "existing":  {
      severity: "info",
      msg: "Product is already exist!"
    },
    "not_found": {
      severity: "error",
      msg: "Product not found!"
    }
  }

  return (
    <DialogTitle>
      <Alert severity={options[status].severity} variant="filled">
        <AlertTitle>{options[status].msg}</AlertTitle>
      </Alert>
    </DialogTitle>
  );
}

function ErrorBoard({ children: icon, message }) {
  return (
    <Box className="w-full h-full flex flex-col items-center">
      { icon }
      <span className="w-fit">
        { message }
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