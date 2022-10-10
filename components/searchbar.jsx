import { Box, InputAdornment, TextField } from "@mui/material"
import { BiBarcodeReader } from "react-icons/bi"
import { Component } from "react"

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      textFieldValue: "",
    }
  }

  handleTextField(e) {
    this.setState({ textFieldValue: e.target.value })
  }

  render() {
    return (
      <Box>
        <TextField
          id="outlined-basic"
          label="Search by barcode"
          variant="outlined"
          size="small"
          className="w-full"
          value={this.state.textFieldValue}
          onChange={this.handleTextField.bind(this)}
          InputProps={{
            endAdornment: <InputAdornment position="end">
              <BiBarcodeReader
                className="text-2xl hover:text-black active:text-red-600 hover:cursor-pointer active:cursor-default"
                onClick={this.props.handleOpenModal}
              />
            </InputAdornment>
          }}
        />
      </Box>
    )
  }
}

export default SearchBar;