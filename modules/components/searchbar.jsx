import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { BiBarcodeReader } from "react-icons/bi"

export default function SearchBar(props) {
  return (
    <Box>
      <FormControl
        variant="outlined" className="w-full"
        error={props.error}
        size="small"
      >
        <InputLabel htmlFor="my-input">Search by barcode</InputLabel>
        <OutlinedInput
          id="my-input"
          className="w-full"
          label="Search by barcode"
          endAdornment={
            props.scannerButtonAvailable &&
            <InputAdornment position="end">
              <BiBarcodeReader
                className="text-2xl hover:text-black active:text-red-600 hover:cursor-pointer active:cursor-default"
                onClick={props.openScannerModal}
              />
            </InputAdornment>
          }
          onKeyUp={props.onKeyUp}
          onChange={props.onChange}
          value={props.value}
        />
        {
          props.error &&
          <FormHelperText className="font-medium">
            {props.helperTextContent}
          </FormHelperText>
        }
      </FormControl>
    </Box>
  )
}