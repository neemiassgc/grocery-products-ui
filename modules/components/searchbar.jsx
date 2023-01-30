import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { BiBarcodeReader } from "react-icons/bi"
import { Component } from "react"
import { isANumber, isPossibleToScanForBarcodes, isZero } from '../utils'

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: {
        error: false,
        value: "",
        errorContent: "",
      },
      scannerButtonAvailable: false,
    }
  }

  componentDidMount() {
    if (isPossibleToScanForBarcodes())
      this.setScannerButtonAvailable(true)

    this.props.actionRef.current = {
      showError: this.handleError.bind(this)
    }
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
    this.setInputState({ error });
  }

  setInputErrorContent(errorContent) {
    this.setInputState({ errorContent });
  }

  setInputValue(value) {
    this.setInputState({ value });
  }

  setInputState(objectChunk) {
    this.setState(prevState => {
      const [key] = Object.keys(objectChunk)
      return {
        input: {
          ...prevState.input,
          [key]: objectChunk[key]
        }
      }
    })
  }

  setScannerButtonAvailable(bool) {
    this.setState({ scannerButtonAvailable: bool })
  }

  handleKeyUp({ key }) {
    if (key === "Enter") {
      if (isZero(this.state.input.value.length)) {
        this.handleError([{
            violationMessage: "barcode cannot be empty"
        }])
        return;
      }
      this.props.findByBarcodeAndOpenAlertModal(this.state.input.value)
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
              this.state.scannerButtonAvailable &&
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