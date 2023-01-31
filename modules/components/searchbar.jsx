import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { BiBarcodeReader } from "react-icons/bi"
import { Component } from "react"

class SearchBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Box>
        <FormControl
          variant="outlined" className="w-full"
          error={this.props.error}
          size="small"
        >
          <InputLabel htmlFor="my-input">Search by barcode</InputLabel>
          <OutlinedInput
            id="my-input"
            className="w-full"
            label="Search by barcode"
            endAdornment={
              this.props.scannerButtonAvailable &&
              <InputAdornment position="end">
                <BiBarcodeReader
                  className="text-2xl hover:text-black active:text-red-600 hover:cursor-pointer active:cursor-default"
                  // onClick={this.props.openScannerModal}
                />
              </InputAdornment>
            }
            onKeyUp={this.props.onKeyUp}
            onChange={this.props.onChange}
            value={this.props.value}
          />
          {
            this.props.error &&
            <FormHelperText className="font-medium">
              {this.props.helperTextContent}
            </FormHelperText>
          }
        </FormControl>
      </Box>
    )
  }
}

export default SearchBar;