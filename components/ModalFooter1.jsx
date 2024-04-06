import React from "react";
import Button from 'react-bootstrap/Button';


const ModalFooter1 = ({handleClose, handleUpdate, modalTarget}) => {
    return (<><Button variant="secondary" onClick={handleClose}>
    Close
  </Button>
  <Button variant="danger" onDoubleClick={(e)=>{switch (e.detail){case 2: handleUpdate(modalTarget.id, modalTarget.column, "")}}}>
    Delete {modalTarget.column}!
  </Button></>)
}



export default ModalFooter1