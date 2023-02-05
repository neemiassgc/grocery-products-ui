import InfoModal from "./info-modal"
import SearchBar from "./searchbar"
import ScannerModal from "./scanner-modal"
import { getByBarcode } from "../net"
import { isPossibleToScanForBarcodes, status as statusChecker } from "../utils"
import { useEffect, useState } from "react"

export default function SearchableContainer() {
  const [scannerModalAvailable, setScannerModalAvailable] = useState(false);
  const [searchBarState, setSearchBarState] = useState({
    helperTextContent: ""
  })
  const [infoModalState, setInfoModalState] = useState({
    loading: false,
    open: false,
    content: {
      body: null,
      status: null,
    },
    netError: ""
  });
  const [openScannerModal, setOpenScannerModal] = useState(false);

  useEffect(() => {
    if (isPossibleToScanForBarcodes()) setScannerModalAvailable(true)
  }, [])

  const showViolationWarning = violations => {
    const violationFeedback = violations
      .map(violation => <p>{violation.violationMessage}</p>)

    setSearchBarState({
      ...searchBarState, helperTextContent: violationFeedback,
    });
  }

  const findProductAndOpenInfoModal = barcode => {
    setInfoModalState({...infoModalState, loading: true});
    getByBarcode(barcode).then(({ body, status }) => {
      if (statusChecker.isBadRequest(status)) {
        setInfoModalState({...infoModalState, loading: false});
        showViolationWarning(body.violations)
        return;
      }
      setInfoModalState({...infoModalState, netError: "", open: true, content: { body, status }});
    })
    .catch(error => {
      if (error instanceof TypeError)
        setInfoModalState({...infoModalState, netError: "no-connection"});
      else if (error instanceof DOMException)
        setInfoModalState({...infoModalState, netError: "no-server"});

      setInfoModalState({...infoModalState, loading: false, open: true});
    })
  }

  function closeInfoModalAndSuppressLoading() {
    setInfoModalState({...infoModalState, loading: false, open: false});
  }

  return (<>
    <InfoModal
      open={infoModalState.open}
      loading={infoModalState.loading}
      content={infoModalState.content}
      netError={infoModalState.netError}
      onCloseClick={closeInfoModalAndSuppressLoading}
    />
    {
      scannerModalAvailable &&
      <ScannerModal
        open={openScannerModal}
        onCloseClick={() => setOpenScannerModal(false)}
        findProductAndOpenInfoModal={findProductAndOpenInfoModal}
      />
    }
    <SearchBar
      helperTextContent={searchBarState.helperTextContent}
      scannerButtonAvailable={scannerModalAvailable}
      openScannerModal={() => setOpenScannerModal(true)}
      showViolationWarning={showViolationWarning}
      findProductAndOpenInfoModal={findProductAndOpenInfoModal}
      hideViolationWarning={
        () => setSearchBarState({...searchBarState, helperTextContent: ""})
      }
    />
  </>)
}