import { Box, InputAdornment, TextField } from "@mui/material"
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { BiBarcodeReader } from "react-icons/bi"
import { Component } from "react"

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      textFieldValue: "",
      textFieldError: false,
      textFieldErrorMsg: "",
    }

    this.props.actions({ 
      showError: this.handleError.bind(this)
    })
  }

  setTextFieldError(flag) {
    this.setState({ textFieldError: flag })
  }

  setTextFieldErrorMsg(msg) {
    this.setState({ textFieldErrorMsg: msg })
  }

  handleError(violations) {
    const errorFeedback = violations
      .map(violation => <p>{violation.violationMessage}</p>)

    this.setTextFieldErrorMsg(errorFeedback);
    this.setTextFieldError(true);
  }

  handleTextField(e) {
    this.setTextFieldErrorMsg("");
    this.setTextFieldError(false)
    if (e.target.value.length <= 13)
      this.setState({ textFieldValue: e.target.value })
  }

  handleKeyUp({ key }) {
    if (key === "Enter") {
      this.props.searchByBarcode(this.state.textFieldValue)
    }
  }

  render() {
    return (
      <Box>
        <FormControl
          variant="outlined" className="w-full"
          error={this.state.textFieldError}
          size="small"
        >
          <InputLabel htmlFor="my-input">Search by barcode</InputLabel>
          <OutlinedInput
            id="my-input"
            className="w-full"
            label="Search by barcode"
            endAdornment={
              <InputAdornment position="end">
                <BiBarcodeReader
                  className="text-2xl hover:text-black active:text-red-600 hover:cursor-pointer active:cursor-default"
                />
              </InputAdornment>
            }
            onKeyUp={this.handleKeyUp.bind(this)}
            onChange={this.handleTextField.bind(this)}
            value={this.state.textFieldValue}
          />
          {
            this.state.textFieldError &&
            <FormHelperText className="font-medium">
              {this.state.textFieldErrorMsg}
            </FormHelperText>
          }
        </FormControl>
      </Box>
    )
  }
}

export default SearchBar;