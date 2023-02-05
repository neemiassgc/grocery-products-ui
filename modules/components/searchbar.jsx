import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { BiBarcodeReader } from "react-icons/bi"
import { isZero, isANumber, isEmpty } from "../utils"
import { useState } from "react"

export default function SearchBar(props) {
  const [value, setValue] = useState("");

  const hasViolation = () => {
    return !isEmpty(props.violations)
  }

  const handleKeyUp = ({ key }) => {
    if (key === "Enter") {
      if (isZero(value.length)) {
        props.setViolations([{ violationMessage: "barcode cannot be empty" }])
        return;
      }
      props.findProductAndOpenInfoModal(value)
    }
  }

  const handleChange = ({ target: { value: freshValue } }) => {
    if (hasViolation()) props.setViolations([])

    if (freshValue.length <= 13 && isANumber(freshValue))
      setValue(freshValue);
  }

  return (
    <Box>
      <FormControl
        variant="outlined" className="w-full"
        error={hasViolation()}
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
          onKeyUp={handleKeyUp}
          onChange={handleChange}
          value={value}
        />
        {
          hasViolation() &&
          <FormHelperText className="font-medium">
            {props.violations.map(it => <p>{it.violationMessage}</p>)}
          </FormHelperText>
        }
      </FormControl>
    </Box>
  )
}