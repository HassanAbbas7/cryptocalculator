import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faLink, faEdit, faInfoCircle } from '@fortawesome/fontawesome-free-solid';



const ModalBody1 = ({data, modalTarget}) => {

    return <div>
    <p>
      {
        data?.map((row, index)=>{
          if (row.id == modalTarget.id) {
            return <pre>{row[modalTarget.column]}</pre>
          }
        })
      }
    </p>

    <div>
    { modalInputFocus? 
    <>
    {modalTarget.column != "dates"? ("[" + getTimestamp() + "]: "): (<input type='date'></input>)}
    <textarea autoFocus rows={10} style={{width: "100%"}} value={modalTarget.column == "notes"?notesCache:socialCache} onChange={(e)=>{onModalChange(e);}} type="text" onBlur={()=>{handleModalBlur(modalTarget.column == "notes"?notesCache:socialCache); }} />
    </>
    :
    ""
    }
    </div>
  <div style={{ cursor: 'pointer', padding: '0.5rem' }} onClick={()=>setModalInputFocus(true)} className="text-center"><FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem'}}  /></div>
    </div>


}

export default ModalBody1