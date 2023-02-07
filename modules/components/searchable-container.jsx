import InfoModal from "./info-modal"
import SearchBar from "./searchbar"
import ScannerModal from "./scanner-modal"
import { getByBarcode } from "../net"
import { isPossibleToScanForBarcodes, status as statusChecker } from "../utils"
import { useEffect, useState } from "react"

export default function SearchableContainer() {
  const [scannerModalAvailable, setScannerModalAvailable] = useState(false);
  const [searchBarViolations, setSearchBarViolations] = useState([])
  const [infoModalState, setInfoModalState] = useState({
    status: "idle",
    content: {}
  });
  const [openScannerModal, setOpenScannerModal] = useState(false);

  useEffect(() => {
    if (isPossibleToScanForBarcodes()) setScannerModalAvailable(true)
  }, [])

  const setStatus = (newStatus) => {
    setInfoModalState({...infoModalState, status: newStatus})
  }

  const findProduct = barcode => {
    setStatus("loading")

    getByBarcode(barcode).then(({ body, status: statusCode}) => {
      const actions = {
        200: () => setInfoModalState({ status: "existing", content: body }),
        201: () => setInfoModalState({ status: "created", content: body }),
        400: () => {
          setStatus("bad_request")
          setSearchBarViolations(body.violations)
        },
        404: () => setInfoModalState({ status: "not_found", content: body })
      };
      actions[statusCode]()
    })
    .catch(error => {
      if (error instanceof TypeError) setStatus("no_connnection")
      else if (error instanceof DOMException) setStatus("no_server")
    })
  }

  return (<>
    <InfoModal
      status={infoModalState.status}
      content={infoModalState.content}
      onCloseClick={() => setStatus("idle")}
    />
    {
      scannerModalAvailable &&
      <ScannerModal
        open={openScannerModal}
        onCloseClick={() => setOpenScannerModal(false)}
        findProduct={findProduct}
      />
    }
    <SearchBar
      violations={searchBarViolations}
      scannerButtonAvailable={scannerModalAvailable}
      openScannerModal={() => setOpenScannerModal(true)}
      findProduct={findProduct}
      setViolations={setSearchBarViolations}
    />
  </>)
}