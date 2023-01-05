import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { BiBarcodeReader } from "react-icons/bi"
import { Component } from "react"
import { isANumber, isPossibleToScanForBarcodes } from '../utils'

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: {
        error: false,
        value: "",
        errorContent: "",
      }
    }

    this.props.actions({ 
      showError: this.handleError.bind(this)
    })
  }

  handleError(violations) {
    const errorFeedback = violations
      .map(violation => <p>{violation.violationMessage}</p>)

    this.setInputErrorContent(errorFeedback);
    this.setInputError(true);
  }

  handleTextField({ target: { value } }) {
    if (this.state.input.error) {
      this.setInputErrorContent("");
      this.setInputError(false)
    }

    if (value.length <= 13 && isANumber(value)) this.setInputValue(value)
  }

  setInputError(error) {
    this.setInputState("error", error);
  }

  setInputErrorContent(errorContent) {
    this.setInputState("errorContent", errorContent);
  }

  setInputValue(value) {
    this.setInputState("value", value);
  }

  setInputState(key, value) {
    this.setState(prevState => {
      prevState.input[key] = value
      return {
        input: prevState.input
      }
    })
  }

  handleKeyUp({ key }) {
    if (key === "Enter") {
      if (this.state.input.value.length === 0) {
        this.handleError([{
            violationMessage: "barcode cannot be empty"
        }])
        return;
      }
      this.props.searchByBarcode(this.state.input.value)
    }
  }

  render() {
    return (
      <Box>
        <FormControl
          variant="outlined" className="w-full"
          error={this.state.input.error}
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
                  onClick={this.props.openScannerModal}
                />
              </InputAdornment>
            }
            onKeyUp={this.handleKeyUp.bind(this)}
            onChange={this.handleTextField.bind(this)}
            value={this.state.input.value}
          />
          {
            this.state.input.error &&
            <FormHelperText className="font-medium">
              {this.state.input.errorContent}
            </FormHelperText>
          }
        </FormControl>
      </Box>
    )
  }
}

export default SearchBar;