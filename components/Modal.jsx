
import React from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ModalBody1 from "./ModalBody1";



const Modal_ = ({show, handleClose, data, modalTarget, isDates=false, ModalBody, ModalFooter}) => {

    return (
        <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit {modalTarget.column}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <ModalBody></ModalBody>
        </Modal.Body>
        <Modal.Footer>
            <ModalFooter></ModalFooter>
        </Modal.Footer>
      </Modal>
    </>
    )
}


export default Modal_