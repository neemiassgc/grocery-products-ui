import InfoModal from "./info-modal"
import SearchBar from "./searchbar"
import ScannerModal from "./scanner-modal"
import { getByBarcode } from "../net"
import { isPossibleToScanForBarcodes, status as statusChecker } from "../utils"
import { useEffect, useState } from "react"

export default function SearchableContainer() {
  const [data, setData] = useState({
    status: "idle",
    content: {}
  });
  const [openScannerModal, setOpenScannerModal] = useState(false);

  const setStatus = (newStatus) => {
    setData({...data, status: newStatus})
  }

  const findProduct = barcode => {
    setStatus("loading")

    getByBarcode(barcode).then(({ body, status: statusCode}) => {
      const actions = {
        200: () => setData({ status: "existing", content: body }),
        201: () => setData({ status: "created", content: body }),
        400: () => setData({ status: "bad_request", content: body.violations }),
        404: () => setData({ status: "not_found", content: body })
      };
      actions[statusCode]()
    })
    .catch(error => {
      if (error instanceof TypeError) setStatus("no_connection")
      else if (error instanceof DOMException) setStatus("no_server")
    })
  }

  const scannerModalAvailable = isPossibleToScanForBarcodes();
  return (<>
      {
        !["idle", "bad_request"].includes(data.status) &&
        <InfoModal
          status={data.status}
          content={data.content}
          onCloseClick={() => setStatus("idle")}
        />
      }
      {
        scannerModalAvailable && openScannerModal &&
        <ScannerModal
          onCloseClick={() => setOpenScannerModal(false)}
          findProduct={findProduct}
        /> || null
      }
      <SearchBar
        violations={data.status === "bad_request" ? data.content : []}
        scannerButtonAvailable={scannerModalAvailable}
        openScannerModal={() => setOpenScannerModal(true)}
        findProduct={findProduct}
        setViolations={violations => setData({status: "bad_request", content: violations})}
    />
  </>)
}