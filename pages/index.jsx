import Table from 'react-bootstrap/Table';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faLink, faEdit, faInfoCircle } from '@fortawesome/fontawesome-free-solid';
import { updateData, getData } from '../components/constants';
import Linkify from '../components/Linkify';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { ModalTitle } from 'react-bootstrap';
import { CoinMarketRequest, DexScreenerRequest } from '../components/constants';

const Index = ({ username, password }) => {

  const [headers, setHeaders] = useState(["#", "PNN", "dexId", "PAD", "L.Type", "Chain", "API", "Contact addr", "E.Mcap", "E.Price", "B.Size", "free?", "G.fee", "Targets", "Socials", "Notes", "Dates", "apiPrice", "volume", "fullyDilutedMarketCap", "totalSupply", "liquidity", "circulatingSupply"])
  const [fullHeaders, setFullHeaders] = useState(["id", "Project Nick Name", "[API] dexId", "[API] pairAddressDex", "List Type", "Chain", "API Source", "Contact Address", "Entry MCAP", "Entry Price", "Bag Size", "is it Free?", "Gas Fee", "Targets (separated by /)", "Socials", "Notes", "Important Dates", "[API] apiPrice", "[API] volume", "[API] fullyDilutedMarketCap", "[API] totalSupply", "[API] liquidity", "[API] circulatingSupply"])

  const [apiOptions, setApiOptions] = useState(["CMC", "DS"])
  const [listType, setListType] = useState(["Active Trades", "Watch List", "Archived", "MoonBags list"])
  const [edit, setEdit] = useState({ rowId: null, column: null });
  const [data, setData] = useState();
  const latestData = useRef(data);
  const [targets, setTargets] = useState([{ "target1": "", "target2": "", "target3": "" }]);
  const [socialCache, setSocialCache] = useState();
  const [notesCache, setNotesCache] = useState();
  const [datesCache, setDatesCache] = useState();
  const [datesDate, setDatesDate] = useState();
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const handleClose = () => {setShow(false); setShow2(false)};
  const [modalTarget, setModalTarget] = useState({});
  const [modalInputFocus, setModalInputFocus] = useState(false);
  const [interval_, setInterval_] = useState();
  const [handleingApis, setHandleingApis] = useState(false);


  const handleShow = (id_, column_) => {
    setModalTarget({ id: id_, column: column_ });
    setShow(true);
  }

  useEffect(() => {
    const _ = async () => {
      const data_ = await getData(username, password);
      setData(data_);
    }
    _()
  }, [])


  useEffect(() => {
    latestData.current = data;
    if (data) {
      updateData(username, password, data)
    }
  }, [data])

  const populateApiFieldsCMC = async (datA) => {
    if (handleingApis) return
    if (!datA) return
    let selectedRows = datA.filter((row) => {
      if (row.symbolId && row.symbolId != "wrong address" && row.api == "CMC") {
        return [row.id, row.contact]
      }
    }).map((row) => [row.id, row.symbolId])
    console.log(selectedRows)
    if (selectedRows.length == 0) return


    let onlySymbols = selectedRows.map((value) => value[1])
    onlySymbols = [... new Set(onlySymbols)].join()
    let data_ = await CoinMarketRequest(null, onlySymbols);
    let newData = latestData.current.map((row) => {
      if ((row.symbolId == "wrong address") || (!row.symbolId) || row.api != "CMC") {
        return row
      }

      if (onlySymbols.split(",").includes(row.symbolId.toString())) {
        let rowAPIReturn = data_.filter((rowAPI) => Object.keys(rowAPI).includes(row.symbolId.toString()))[0][row.symbolId.toString()]
        console.log(rowAPIReturn)
        return { ...row, ["apiPrice"]: rowAPIReturn.price, ["volume"]: rowAPIReturn.volume, ["fullyDilutedMarketCap"]: rowAPIReturn.fullyDilutedMarketCap, ["totalSupply"]: rowAPIReturn.totalSupply, ["circulatingSupply"]: rowAPIReturn.circulatingSupply };
      }

      return row

    })
    console.log(newData)
    setData(newData);
  }

  const populateApiFieldsDS = async (datA) => {
    if (handleingApis) return
    if (!datA) return datA
    let selectedRows = datA.filter((row) => row.dexId && row.symbolId !== "wrong address" && row.api === "DS").map((row) => [row.id, row.contact]);
    if (selectedRows.length == 0) return datA;
    console.log(selectedRows)
    let onlyContacts = selectedRows.map((value) => value[1]);
    onlyContacts = [...new Set(onlyContacts)].join();
    let data_ = await DexScreenerRequest(onlyContacts);
    let updatedData = latestData.current.map((row) => {
      let result = data_.find((result) => (row.dexId === result.dexId) && (row.api === "DS") && (row.contact === result.baseToken.address) && (row.pairAddressDex === result.pairAddress));
      if (result) {
        return {
          ...row,
          apiPrice: result.priceUsd,
          volume: result.volume.h24,
          fullyDilutedMarketCap: result.fdv,
          liquidity: result.liquidity.usd,
        };
      }
      return row;
    });

    setData(updatedData);

    return updatedData;
  };



  const handleUpdate = (id, column, newValue, isMoney = false, allowSpecialChar = false) => {
    const updatedRows = data.map((row) => {
      if (row.id === id) {
        // Remove special characters, if needed
        if (!allowSpecialChar) {
          newValue = newValue.replace(/[^a-zA-Z0-9\s.]/g, '');
        }

        // Format as money: first ensure only numbers (and period for decimals) remain, then add commas
        if (isMoney) {
          // This regex ensures we keep digits and the period if not preceded by non-digits
          let numbers = newValue.replace(/(?!^\d+)\D/g, '');
          newValue = parseFloat(numbers).toLocaleString('en-US', { maximumFractionDigits: 2 });
        }

        return { ...row, [column]: newValue };
      }
      return row;
    });

    setData(updatedRows);
    updateTargets_(updatedRows);
  }


  const updateTargets_ = (data) => {
    if (data) {
      const updatedRows = data.map((row) => {
        return { ...row, ["target1"]: row.targets.split('/')[0], ["target2"]: row.targets.split('/')[1], ["target3"]: row.targets.split('/')[2] };
      });
      setData(updatedRows);
    }
  }






  const formatNumber = (num) => {
    if (!num) return 0
    num = num.toString().replaceAll(',', '')
    num = Number(num);

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  }

  const formatPrice = (str) => {
    const numberAfterZeroes = str.substring(str.search(/[1-9]/));
    const zeroesCount = str.substring(str.indexOf('.') + 1, str.search(/[1-9]/)).length;

    if (zeroesCount > 2) {
      return <span>0.0<sub>{zeroesCount}</sub>{numberAfterZeroes.slice(0, 4)}</span>
    }
  }

  const handleFocus = (id, column) => {
    setEdit({ rowId: id, column });
  };

  const handleBlur = () => {
    setEdit({ rowId: null, column: null });
  };

  const handleDelete = (id) => {
    const updatedRows = data.filter((row) => row.id !== id);
    setData(updatedRows);
  };



  useEffect(() => {
    const interval = setInterval(async () => {
      populateApiFieldsCMC(await populateApiFieldsDS(latestData.current));
    }, 1000)
    return () => clearInterval(interval);
  }, []);

  const handleModalBlurDates = (e) => {
    if (!datesDate) {
      e.preventDefault();
      return
    }
    setModalInputFocus(false);
    setDatesCache("");
    setDatesDate("");
    if (!datesCache) return;
    let column = modalTarget.column;
    let id = modalTarget.id;
    let newValue = datesCache;
    const updatedRows = data.map((row) => {
      if (row.id === id) {
        return { ...row, [column]: row[column] + datesDate + "---->  " + newValue + "\n" };
      }
      return row;
    });

    setData(updatedRows);
  };

  const handleModalBlur = (cache) => {


    setModalInputFocus(false);
    if (modalTarget.column == "socials") {
      setSocialCache("");
    }
    if (modalTarget.column == "notes") {
      setNotesCache("");
    }
    if (ModalTitle.column == "dates") {
      setDatesCache("");
    }

    if (!cache) return;
    let column = modalTarget.column;
    let id = modalTarget.id;
    let newValue = cache;
    const updatedRows = data.map((row) => {
      if (row.id === id) {
        return { ...row, [column]: row[column] + "\n" + "[" + getTimestamp() + "]" + ": " + "\n" + newValue + "\n" };
      }
      return row;
    });
    setData(updatedRows);
  };

  const setSymbolId = async (id, address) => {
    let currentSymbolId = latestData.current.filter(row => row.id === id && row.symbolId)
    if ((currentSymbolId !== "wrong address") && (currentSymbolId.length > 0)) return;
    let id_ = await CoinMarketRequest(address = address);
    const updatedRows = latestData.current.map((row) => {
      if (row.id === id) {
        return { ...row, symbolId: id_ };
      }
      return row;
    });
    setData(updatedRows);
  };

  const setDexId = async (id, address) => {
    if (latestData.current.filter(row => row.id === id && row.dexId).length > 0) return;
    let result = await DexScreenerRequest(address = address);

    let ids = result.map((row) => [row.dexId, row.pairAddress])

    console.log(`ids: ${ids}`)
    let cacheRow = {}
    const updatedRows = latestData.current.map((row) => {

      if (row.id === id) {
        cacheRow = row
        return { ...row, dexId: ids[0][0], pairAddressDex: ids[0][1] };
      }
      return row;
    });

    setData(updatedRows);
    ids.slice(1).forEach((item) => {
      setData((data) => [...data, { ...cacheRow, dexId: item[0], pairAddressDex: item[1], id: getNewId() }]);
    })

  };

  const getNewId = () => {
    // const ids = data.map(row => row.id);
    // let newId = 1;
    // while (ids.includes(newId)) {
    //   newId++;
    // }
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += Math.floor(Math.random() * 10); // Generate a random digit (0-9) and append it to the result
    }
    return result;
    // return newId
  }

  const handleAdd = () => {
    let newId = getNewId();
    // I want to add it to the top of the list
    const newRow = {
      id: newId,
      chainId: "",
      dexId: "",
      pairAddressDex: "",
      apiPrice: "",
      liquidity: "",
      volume: "",
      fullyDilutedMarketCap: "",
      totalSupply: "",
      circulatingSupply: "",
      name: "",
      listtype: "",
      chain: "",
      api: "select",
      contact: "",
      mcap: "",
      price: "",
      bag: "",
      free: "",
      targets: "",
      target1: "",
      target2: "",
      target3: "",
      socials: "",
      notes: "",
      dates: "",
    };
    setData([newRow, ...data]);
    return newId
  };

  const getTimestamp = () => {
    var currentDate = new Date();
    var formattedDate = currentDate.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
    console.log(formattedDate); // Outputs something like: "03/28/24, 2:16 PM"

    // If you specifically want "AM" or "PM" without commas, you can further manipulate the string
    formattedDate = formattedDate.replace(',', '')

    return formattedDate;
  }

  return (
    <div>
      <>
      <Modal show={show} onHide={handleClose}>

        <Modal.Header closeButton>
          <Modal.Title onClick={()=>{console.log(datesDate)}}>Edit {modalTarget.column}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
          
        {modalTarget.column != "dates" ?<p>
            {
              data?.map((row, index)=>{
                if (row.id == modalTarget.id) {
                  return <pre>{row[modalTarget.column]}</pre>
                }
              })
            }
          </p>:
          
          data?.map((row, index)=>{
            if (row.id == modalTarget.id) {
              return row[modalTarget.column].split('\n').map((date, index)=>{

                let otherDate = new Date(date.split("---->")[0])
                const currentDate = new Date();
                const differenceMs = otherDate - currentDate;
                const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24)) + 1;

                const strikeThrough = differenceDays <  0? true: false
                const boldAndGreen = differenceDays == 0? true: false
                const orange = (differenceDays > 0 && differenceDays < 5)? true: false

                return <p style={{fontWeight: boldAndGreen? "bold":"", backgroundColor: orange? "orange": boldAndGreen? "green": "", textDecoration: strikeThrough? "line-through": ""}} key={index}>{date}</p>
              
              })
            }
          })
          }

          <div>
        
          { modalInputFocus? 
          (modalTarget.column != "dates"? <>
          {"[" + getTimestamp() + "]: "}
          <textarea autoFocus rows={10} style={{width: "100%"}} value={modalTarget.column == "notes"?notesCache:socialCache} onChange={(e)=>{modalTarget.column == "notes"?setNotesCache(e.target.value): setSocialCache(e.target.value)}} type="text" onBlur={()=>{handleModalBlur(modalTarget.column == "notes"?notesCache:socialCache); }} />
          </>: <>

          <input type='date' className="form-control" value={datesDate} onChange={(e)=>{setDatesDate(e.target.value)}}></input>
          <textarea className='my-2' autoFocus rows={10} style={{width: "100%"}} value={datesCache} onChange={(e)=>{setDatesCache(e.target.value)}} type="text" onBlur={(e)=>{handleModalBlurDates(e);}} />
          </>)

          : 
          ""
          }
          

          </div>
          

        <div style={{ cursor: 'pointer', padding: '0.5rem' }} onClick={()=>setModalInputFocus(true)} className="text-center"><FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem'}}  /></div>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onDoubleClick={(e)=>{switch (e.detail){case 2: handleUpdate(modalTarget.id, modalTarget.column, "")}}}>
            Delete {modalTarget.column}!
          </Button>
        </Modal.Footer>
      </Modal>
    </>
      <>
        <Modal show={show2} onHide={()=>{setShow2(false)}}>

          <Modal.Header closeButton>
            <Modal.Title>Edit {modalTarget.column}</Modal.Title>
          </Modal.Header>
          
          <Modal.Body>
          <form>
            {/* <div style={{ display: 'flex' }} className="form-row"> */}
              <div className="form-group">
                <label htmlFor="inputName">Name</label>
                <input style={{width: "100%"}} value={data?.find(row=>row.id === modalTarget.id)?.name} onChange={(e)=>{handleUpdate(modalTarget.id, "name", e.target.value)}} type="text" className="form-control" id="inputName" placeholder="Name" />
              </div>
              {/* <div className="form-group col-md-6">
                <label htmlFor="inputDexId">DexId</label>
                <input value={data?.find(row=>row.id === modalTarget.id)?.dexId} onChange={(e)=>{handleUpdate(modalTarget.id, "dexId", e.target.value)}} type="text" className="form-control" id="inputDexId" placeholder="DexId" />
              </div> */}
            {/* </div> */}

            <div style={{ display: 'flex' }} className="form-row">
            <div className="form-group pe-4">
              <label htmlFor="inputLType">L.Type</label>
              <select id="inputLType" value={data?.find(row=>row.id === modalTarget.id)?.listtype} onChange={(e)=>{handleUpdate(modalTarget.id, "listtype", e.target.value)}} className="form-control">
                <option >Select</option>
                {listType.map((listType, index)=>{
                  return <option key={index}>{listType}</option>
                })}
              </select>
            </div>
            <div className="form-group" style={{ width: '100%' }}>
              <label htmlFor="inputChain">Chain</label>
              <input value={data?.find(row=>row.id === modalTarget.id)?.chain} onChange={(e)=>{handleUpdate(modalTarget.id, "chain", e.target.value)}} type="text" className="form-control" id="inputChain" placeholder="Chain" />
            </div>
            </div>


            <div style={{ display: 'flex' }} className="form-row">
            <div className="form-group pe-4">
              <label htmlFor="inputLType">API</label>
              <select id="inputLType" value={data?.find(row=>row.id === modalTarget.id)?.api} onChange={(e)=>{handleUpdate(modalTarget.id, "api", e.target.value)}} className="form-control">
                <option >Choose...</option>
                {apiOptions.map((api, index)=>{
                  return <option key={index}>{api}</option>
                })}
              </select>
            </div>
            <div className="form-group" style={{ width: '100%' }}>
              <label htmlFor="inputChain">Contact Address</label>
              <input value={data?.find(row=>row.id === modalTarget.id)?.contact} onBlur={()=>{setSymbolId(modalTarget.id, data?.find(row=>row.id === modalTarget.id)?.contact); setDexId(modalTarget.id, data?.find(row=>row.id === modalTarget.id)?.contact)}} onChange={(e)=>{handleUpdate(modalTarget.id, "contact", e.target.value)}} type="text" className="form-control" id="inputChain" placeholder="Chain" />
            </div>
            </div>


          <div className="form-row" style={{ display: 'flex' }}>
            <div className="form-group col-md-6 ">
              <label htmlFor="inputEMcap">E.Mcap</label>
              <input  value={(data?.find(row=>row.id === modalTarget.id)?.mcap)} onChange={(e)=>{handleUpdate(modalTarget.id, "mcap", e.target.value, true)}}  type="text" className="form-control" id="inputEMcap" placeholder="E.Mcap" />
            </div>

            <div className="form-group col-md-6">
              <label htmlFor="inputEPrice">E.Price</label>
              <input type="number" value={data?.find(row=>row.id === modalTarget.id)?.price} onChange={(e)=>{handleUpdate(modalTarget.id, "price", e.target.value)}} className="form-control" id="inputEPrice" placeholder="E.Price" />
            </div>
          </div>


            <div className="form-group">
              <label htmlFor="inputBSize">B.Size</label>
              <input  type="text" value={data?.find(row=>row.id === modalTarget.id)?.bag} onChange={(e)=>{handleUpdate(modalTarget.id, "bag", e.target.value, true)}} className="form-control" id="inputBSize" placeholder="B.Size" />
            </div>

            <div className="form-row" style={{ display: 'flex' }}>
            <div className="form-group col-md-6">
              <label htmlFor="inputFree">Free?</label>
              <select id="inputFree" className="form-control" value={data?.find(row=>row.id === modalTarget.id)?.free} onChange={(e)=>{handleUpdate(modalTarget.id, "free", e.target.value)}}>
                <option selected>Choose...</option>
                {["Yes", "No"].map((free, index)=>{
                  return <option key={index}>{free}</option>
                })}
                {/* Add options here */}
              </select>
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="inputGFee">G.fee</label>
              <input value={data?.find(row=>row.id === modalTarget.id)?.gfee} onChange={(e)=>{handleUpdate(modalTarget.id, "gfee", e.target.value)}} type="number" className="form-control" id="inputGFee" placeholder="G.fee" />
            </div>
            </div>


            <div className="form-group">
              <label htmlFor="inputTargets">Targets</label>
              <input value={data?.find(row=>row.id === modalTarget.id)?.targets} onChange={(e)=>{handleUpdate(modalTarget.id, "targets", e.target.value, false, true)}} type="text" className="form-control" id="inputTargets" placeholder="Targets" />
            </div>
          </form>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
      <h2 >Calculator</h2>
      <table className="table table-striped custom-table">
        <thead>
          <tr style={{ fontSize: "10px" }}>
            {
              headers.map((header, index) => <th style={{ backgroundColor: fullHeaders[index].includes("[API]") ? "orange" : "" }} key={index}>{header}  {index != 0 && <FontAwesomeIcon icon={faInfoCircle} title={fullHeaders[index]} style={{ fontSize: '0.6rem', cursor: 'pointer' }} />}</th>)
            }
          </tr>
        </thead>
        <tbody>
          {data?.map((row, index) => (
            <>
              <tr key={index}>
                <td >{index + 1}</td>

                <td>{row.name} </td>


                <td>{row.dexId} </td>

                <td >{row.pairAddressDex.slice(0, 3)} {row.pairAddressDex ? ".." : ""}{row.pairAddressDex.slice(-3)}</td>

                <td>{row.listtype}</td>


                <td>{row.chain}</td>


                <td>{row.api}</td>



                <td style={{ cursor: 'pointer', backgroundColor: row.symbolId == "wrong address" ? "red" : "" }}>{row.contact.slice(0, 3)}{row.contact ? ".." : ""}{row.contact.slice(-3)}</td>


                <td>${formatNumber(row.mcap)}</td>




                <td>{row.price ? "$" : ""}{formatPrice(row.price)}</td>



                <td>{row.bag}</td>



                <td>{row.free}</td>

                <td>${formatNumber(row.gfee)}</td>



                <td>{row.targets}</td>


                <td>{row.socials.slice(0, 10)}</td>


                {edit.rowId == row.id && edit.column == "notes" ? (<textarea
                  type="text"
                  value={row.notes}
                  spellCheck="false"
                  onChange={(e) => handleUpdate(row.id, 'notes', e.target.value, false, true)}
                  autoFocus
                  onBlur={handleBlur}
                />) : <td style={{ cursor: 'pointer' }} onClick={() => handleShow(row.id, "notes")}>{row.notes && row.notes.slice(0, 10)}</td>}


                {edit.rowId == row.id && edit.column == "dates" ? (<textarea
                  type="text"
                  value={row.dates}
                  spellCheck="false"
                  onChange={(e) => handleUpdate(row.id, 'dates', e.target.value, false, true)}
                  autoFocus
                  onBlur={handleBlur}
                />) : <td style={{ cursor: 'pointer' }} onClick={() => handleShow(row.id, "dates")}>{row.dates && row.dates.slice(0, 10)}</td>}

                <td>{row.apiPrice} </td>

                <td>{row.volume} </td>

                <td>{row.fullyDilutedMarketCap} </td>


                <td>{row.totalSupply} </td>

                <td>{row.liquidity} </td>

                <td>{row.circulatingSupply} </td>


                <td><FontAwesomeIcon icon={faEdit} onClick={() => {setModalTarget({id: row.id, column: "dates"}); setShow2(true)} } style={{ fontSize: '1rem', cursor: 'pointer' }}/></td>
                <td><FontAwesomeIcon icon={faTrash} onClick={() => handleDelete(row.id)} style={{ fontSize: '1rem', cursor: 'pointer' }} /></td>

              </tr>
            </>

          ))}
          <tr>
            <td colSpan="100%" style={{ cursor: 'pointer' }} onClick={() => { let newRow=handleAdd(); setModalTarget({id: newRow, column: "dates"}); setShow2(true)}} className="text-center"><FontAwesomeIcon icon={faPlus} style={{ fontSize: '1rem' }} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


export default Index