import React, { useState, useEffect , useRef } from "react";
import axios from "axios";
import { Trash } from "react-feather";
import { PageHeading } from "widgets";
import Select from "react-select"; 
import {
  Col,
  Row,
  Card,
  Alert,
  Tabs,
  Tab,
  Container,
} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import jwt_decode from "jwt-decode";
import $ from "jquery";
import { CurrencyRupee } from "react-bootstrap-icons";
import { useRouter } from "next/router";
import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style";
import { CSVLink } from "react-csv";
import { Store } from 'react-notifications-component';
let ws;

const Trading = () => {

  // Filters Start
    const [filterByStatusOrder,setFilterByStatusOrder] = useState('');
    const [filterByAccountOrder,setFilterByAccountOrder] = useState('');

    const [filterByStatusPosition,setFilterByStatusPosition] = useState('');
    const [filterByAccountPosition,setFilterByAccountPosition] = useState('');
    const [filterBySymbolPosition,setFilterBySymbolPosition] = useState($("#positionSymbol").val() || '');

    const [filterByAccounSummary,setFilterByAccountSummary] = useState('');
    const [filterByAccountMargin,setFilterByAccountMargin] = useState('');
  // Filters End

  // Order Tabs Start
  const socket = useRef();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("watch_market");
  const [filterType, setFilterType] = useState(0);
  const [orders, setOrders] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [funds, setFunds] = useState([]);
  const [loader, setLoader] = useState(true);
  const [positions, setPositions] = useState([]);
  const [subscribeActive,setSubscribeActive] = useState(false);

  const [latestdata, setLatestData] = useState("");
  const [symbols, setSymbols] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [boxtype, setBoxtype] = useState(0);
  const [symbol, setSymbol] = useState("");
  const [socketInfo, setSocketInfo] = useState("");
  const [buyboxShow, setBuyboxShow] = useState(false);


  // ORDER VARIABLES
  const [trigPriceTemp, setTrigPriceTemp] = useState(true);
  const [targetBox, setTargetBox] = useState(false);
  const [day_ioc_box, setDayIocBox] = useState(false);
  const [productTypeBox, setproductTypeBox] = useState(false);
  const [productType, setProductType] = useState("INTRADAY");
  const [type, setType] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [pquantity,setPQuantity] = useState(0);
  const [orgPrice, setOrgPrice] = useState(0);
  const [stopPrice, setStopPrice] = useState(0);
  const [discQuantity, setDiscQuantity] = useState(0);
  const [targetPrice, setTargetPrice] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);
  const [validity, setValidity] = useState("DAY");
  const [trailStoploss, setTrailStoploss] = useState(0);
  const [offlineOrder, setOfflineOrder] = useState("false");
  const [OrgPriceTemp, setOrgPriceTemp] = useState(false);
  const [StopLossTemp, setStopLossTemp] = useState(false);
  const [SlMarketTemp, setSlMarketTemp] = useState(false);
  const [groupAcc, setGroupAcc] = useState("");
  const [diffQty, setDiffQty] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [groupAccount, setGroupAccount] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState([]);
  const [selectedGroupAccountId, setSelectedGroupAccountId] = useState([]);
  const decodedNew = jwt_decode(localStorage.getItem("userToken"));
  const [tradingActivekey, setTradingActiveKey] = useState('watch_market');
  const defaultQty = 1;

  useEffect(() => {
    setTimeout(() => {
      getWatchlistss();
    },200);
   newSocketHandler();
  },[]);

  useEffect(() => {
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    axios
      .get(`/api/watchmarket/getAccountGroup/${decoded.user_id}`)
      .then((result) => {
        setGroupAccount(result.data.groupAccount);
    })
      .catch((error) => {
        console.log("Symbols List Error", error);
    });
  },[]);

  useEffect(() => {
    if(localStorage.getItem("acToken")) {
        Store.addNotification({
          title: "Success!",
          message: `Access token is generated Successfully!`,
          type: "success",
          insert: "top",
          width: '0px',
          container: "top-left",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"],
          dismiss: {
            duration: 7800,
            onScreen: true
          }
        })
     localStorage.removeItem("acToken");
    }
    getSymbolsList();
    getAccountList();
   }, []);

  const exportToExcel = async () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ftype = filterType === "0" ? "allAccounts" : filterType;
    const fileName = `fundSheet_${ftype}`;
    const ws = XLSX.utils.json_to_sheet(funds);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  const exportOrdersToExcel = async () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ftype = filterType === "0" ? "allAccounts" : filterType;
    const fileName = `OrdersSheet_${ftype}`;
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  const exportPositionsToExcel = async () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ftype = filterType === "0" ? "allAccounts" : filterType;
    const fileName = `PositionSheet_${ftype}`;
    const ws = XLSX.utils.json_to_sheet(positions);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  function getOrders(filter) {
    setTimeout(() => {
      axios
        .get(`/api/orders/getNewOrders/${orderActive}/${filterType}`)
        .then((result) => {
        setLoader(false);
        if (result.data.viewData) {
          setOrders(result.data.viewData);
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
    }, 100);
  }

  async function getaGainOrders() {
    setLoader(true);
      axios
        .get(`/api/orders/getOrders`)
        .then((result) => {
          setLoader(false);
          if (result.data.viewData) {
            getFilterOrders();
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
      });
  }

  async function getaGainOrdersUser() {
    setLoader(true);
    setTimeout(() => {
      axios
        .get(`/api/orders/getOrders`)
        .then((result) => {
          setLoader(false);
          if (result.data.viewData) {
            getFilterOrdersUser();
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
      });
     }, 100);
  }

  async function getFilterOrders() {
    setLoader(true);
    setTimeout(() => {
      axios
        .get(`/api/orders/getFilterOrders?status=${filterByStatusOrder}&account=${filterByAccountOrder}`)
        .then((result) => {
          setLoader(false);
          if (result.data.viewData) {
            setOrders(result.data.viewData);
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
      });
     }, 600);
  }

  async function getFilterOrdersUser() {
    setLoader(true);
    setTimeout(() => {
      axios
        .get(`/api/orders/getFilterOrdersNew?status=${filterByStatusOrder}&account=${decodedNew.user_id}`)
        .then((result) => {
          setLoader(false);
          if (result.data.viewData) {
            setOrders(result.data.viewData);
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
      });
     }, 100);
  }

  const getFilterPositionsUser = () => {
    setFilterByStatusPosition('1');
    setLoader(true);
    axios
      .get(`/api/positions/getDetails/${decodedNew.user_id}`)
      .then((result) => {
        setTimeout(() => {
          axios
            .get(
              `/api/positions/getPositionsDetailsNewUser?status=1&account=${decodedNew.user_id}&symbol=${filterBySymbolPosition}`
            )
            .then((result) => {
              setLoader(false);
              if (result.data.viewData) {
                setPositions(result.data.viewData);
                setPositionsViewData(result.data.viewData);
                setOverallPositionsData(result.data.Overallpositions);
              }
            })
            .catch((err) => {
              setLoader(false);
              console.log("Error", err);
            });
        }, 1200);
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
  };

  const getFilterPositions = () => {
    setFilterByStatusPosition('1');
    setLoader(true);
    axios
      .get(`/api/positions/getDetails/${decodedNew.user_id}`)
      .then((result) => {
        setTimeout(() => {
          axios
            .get(
              `/api/positions/getPositionsDetails?status=1&account=${filterByAccountPosition}&symbol=${filterBySymbolPosition}`
            )
            .then((result) => {
              setLoader(false);
              if (result.data.viewData) {
                 if(filterByStatusPosition == "" && filterByAccountPosition == "" && filterBySymbolPosition == "") {
                  setPositions(result.data.viewData);
                 }
                setPositionsViewData(result.data.viewData);
                setOverallPositionsData(result.data.Overallpositions);
              }
            })
            .catch((err) => {
              setLoader(false);
              console.log("Error", err);
            });
        }, 700);
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
  };

  // const getFilterPositions = () => {
  //   setLoader(true);
  //   axios
  //     .get(`/api/positions/getDetails/${decodedNew.user_id}`)
  //     .then((result) => {
  //       if(result.data.positionsArray) {

  //       }
  //       setLoader(false);
  //     })
  //     .catch((err) => {
  //       setLoader(false);
  //       console.log("Error", err);
  //     });
  // };

  const getHoldings = () => {
    setLoader(true);
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    axios
      .get(`/api/orders/getHoldings/${decoded.user_id}`)
      .then((result) => {
        setTimeout(() => {
          axios
            .get(`/api/orders/getHoldingsData/${filterType}`)
            .then((result) => {
              setLoader(false);
              if (result.data.viewHoldingData) {
                setHoldings(result.data.viewHoldingData);
              }
            })
            .catch((err) => {
              setLoader(false);
              console.log("Error", err);
            });
        }, 600);
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
  };

  const [Overallpositions, setOverallPositionsData] = useState([]);
  const [PositionsViewData,setPositionsViewData] = useState([]);

  const getFundsMargin = () => {
    setLoader(true);
    setFunds([]);
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    const userType = decodedNew?.role_id == "1" ? 'admin' : 'userwise';
    axios
      .get(`/api/orders/getFunds/${decoded.user_id}`)
      .then((result) => {
        setLoader(true);
        setTimeout(() => {
          axios
            .get(`/api/orders/getfundsData?account=${filterByAccountMargin}&user_type=${userType}&user_id=${decodedNew.user_id}`)
            .then((result) => {
              setLoader(false);
              if (result.data.viewFundsData) {
                setFunds(result.data.viewFundsData);
              }
            })
            .catch((err) => {
              setLoader(false);
              console.log("Error", err);
            });
        }, 1000);
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
  };

  const getFundsUserWiseMargin = () => {
    setLoader(true);
    setFunds([]);
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    const userType = decodedNew?.role_id == "1" ? 'admin' : 'userwise';
    axios
      .get(`/api/orders/getFundsUserWise/${decoded.user_id}`)
      .then((result) => {
        setLoader(true);
        setTimeout(() => {
          axios
            .get(`/api/orders/getfundsData?account=${filterByAccountMargin}&user_type=${userType}&user_id=${decodedNew.user_id}`)
            .then((result) => {
              setLoader(false);
              if (result.data.viewFundsData) {
                setFunds(result.data.viewFundsData);
              }
            })
            .catch((err) => {
              setLoader(false);
              console.log("Error", err);
            });
        }, 1000);
    })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
    });
  }

  const getFundsSummary = () => {
    setLoader(true);
    setFunds([]);
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    const userType = decodedNew?.role_id == "1" ? 'admin' : 'userwise';
    axios
      .get(`/api/orders/getFunds/${decoded.user_id}`)
      .then((result) => {
        setLoader(true);
        setTimeout(() => {
          axios
            .get(`/api/orders/getfundsData?account=${filterByAccounSummary}&user_type=${userType}&user_id=${decodedNew.user_id}`)
            .then((result) => {
              setLoader(false);
              if (result.data.viewFundsData) {
                setFunds(result.data.viewFundsData);
              }
            })
            .catch((err) => {
              setLoader(false);
              console.log("Error", err);
            });
        }, 1000);
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
  };

  const getFundsUserWiseSummary = () => {
    setLoader(true);
    setFunds([]);
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    const userType = decodedNew?.role_id == "1" ? 'admin' : 'userwise';
    axios
      .get(`/api/orders/getFundsUserWise/${decoded.user_id}`)
      .then((result) => {
        setLoader(true);
        setTimeout(() => {
          axios
            .get(`/api/orders/getfundsData?account=${filterByAccounSummary}&user_type=${userType}&user_id=${decodedNew.user_id}`)
            .then((result) => {
              setLoader(false);
              if (result.data.viewFundsData) {
                setFunds(result.data.viewFundsData);
              }
            })
            .catch((err) => {
              setLoader(false);
              console.log("Error", err);
            });
        }, 1000);
    })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
    });
  }

  const getPositions = (sts,acct,syb,grp='account') => {
    setLoader(true);
    if(decodedNew.role_id == '1') {
       axios
         .get(`/api/positions/getPositionsDetails?status=${sts}&account=${acct}&symbol=${syb}&accountType=${grp}`)
         .then((result) => {
           setLoader(false);
           if(result.data.viewData) {
            setPositionsViewData(result.data.viewData);
            setOverallPositionsData(result.data.Overallpositions);
           }
          })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
       });
    } else {
      axios
      .get(`/api/positions/getPositionsDetailsNewUser?status=${sts}&account=${acct}&symbol=${syb}&accountType=${grp}`)
      .then((result) => {
        setLoader(false);
        if(result.data.viewData) {
          setPositionsViewData(result.data.viewData);
          setOverallPositionsData(result.data.Overallpositions);
        }
       })
     .catch((err) => {
       setLoader(false);
       console.log("Error", err);
      });
    }
  };

  const [notifications, setNotifications] = useState([]);

  const getNotifications = () => {
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    //var ciphertext = CryptoJS.AES.encrypt(String(decoded.user_id), process.env.NEXT_PUBLIC_CRYPTO_SECRET).toString();
    setLoader(true);
    axios
      .get(`/api/orders/getNotifications/${decoded.user_id}`)
      .then((result) => {
        setLoader(false);
        if (result.data.viewNotiData) {
          setNotifications(result.data.viewNotiData);
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
  };

  const HandleClose = () => {
    setLoader(false);
    setSubscribeActive(false);
    // setOrderTypeExec("REGULAR");
  };

  const [stopLossBox,setstopLossBox] = useState(false);
  const [OrderTypeExec,setOrderTypeExec] = useState("INTRADAY");

  const handleValidity = (e) => {
    setValidity(e);
  }

  const HandleProductType = (e) => {
    if (e.target.value === "CO") {
      setOrderTypeExec("CO");
      // setTrigPriceTemp(true);
      setTrigPriceTemp(false);
      setTargetBox(false);
      setDayIocBox(true);
      setproductTypeBox(true);
      setStopLossTemp(true);
      setSlMarketTemp(true);
      setstopLossBox(true);
      setTargetPrice(0);
      setValidity("DAY");
      // setOrderTypeExec("INTRADAY");
      setProductType(e.target.value);
    } else if (e.target.value === "BO") {
      setOrderTypeExec("BO");
      setTargetBox(true);
      // setTrigPriceTemp(true);
      setTrigPriceTemp(false);
      setDayIocBox(true);
      setproductTypeBox(true);
      setStopLossTemp(false);
      setSlMarketTemp(false);
      setstopLossBox(true);
      setStopPrice(0);
      setValidity("DAY");
      setProductType(e.target.value);
      // setOrderTypeExec("INTRADAY");
    } else {
      setOrderTypeExec("INTRADAY");
      setTargetBox(false);
      // setTrigPriceTemp(true);
      setTrigPriceTemp(true);
      setDayIocBox(false);
      setproductTypeBox(false);
      setStopLossTemp(false);
      setSlMarketTemp(false);
      setstopLossBox(false);
      setTargetPrice(0);
      setStopLoss(0);
      setProductType("INTRADAY");
    }
  };

  const Handletype = (e) => {
    if (e.target.value == "2") {
      setOrgPriceTemp(true);
      //setTrigPriceTemp(true);
      setTrigPriceTemp(false);
      setOrgPrice(0);
      setType(e.target.value);
    } else if (e.target.value == "3") {
      setOrgPriceTemp(true);
      setTrigPriceTemp(false);
      setOrgPrice(0);
      setType(3);
    } else if (e.target.value == "4") {
      setOrgPriceTemp(false);
      setTrigPriceTemp(false);
      setType(4);
    } else if (e.target.value == "1") {
       if(productType == "BO" || productType == "CO") {
        setTrigPriceTemp(false);
       } else {
        setTrigPriceTemp(true);
       }
        setOrgPriceTemp(false);
        setTargetPrice(0);
        setStopPrice(0);
        setType(1);
    }
  };

  const getAccountList = () => {
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    axios
      .get(`/api/watchmarket/getaccountslistNew/${decoded.user_id}`)
      .then((result) => {
        setAccounts(result.data.accounts);
      })
      .catch((error) => {
        console.log("Symbols List Error", error);
    });
  }

    const newSocketHandler = async () => {
      try {
        var response = await fetch(
          `/api/socket`
        );
            console.log("response", response);
            if (!response.ok) {
              Store.addNotification({
                  title: "Warning!",
                  message: `Token is expired, redirecting to generate token`,
                  type: "warning",
                  insert: "top",
                  width: '0px',
                  container: "top-left",
                  animationIn: ["animate__animated", "animate__fadeIn"],
                  animationOut: ["animate__animated", "animate__fadeOut"],
                  dismiss: {
                    duration: 7800,
                    onScreen: true
                  }
                })
                localStorage.setItem("generateToken", true);
                setTimeout(() => {
                 router.push("/pages/secrets");
                }, 1000);
              } else {
                 ws = new WebSocket(`ws://localhost:3000/api/socket?token=${localStorage.getItem('userToken')}`);
                 //ws = new WebSocket(`wss://tuliptechnicals.com/websocket/fyers?token=${localStorage.getItem('userToken')}`);
                 ws.addEventListener("message", (event) => {
                  const comingData = JSON.parse(event.data);
                  if(comingData.type === 'latestInfo') {
                    console.log("SYMBOL NAME:", comingData.symbol);
                    console.log("SYMBOL DATA", comingData.info);
                    localStorage.setItem(`${comingData.symbol}`, JSON.stringify(comingData.info));
                    //if(comingData.symbol !== 'BSE:SENSEX-INDEX' || comingData.symbol !== 'NSE:NIFTY50-INDEX' || comingData.symbol !== 'NSE:BANKNIFTY-INDEX') {
                      setLatestData(comingData.info);
                      setLoader(false);
                    //}
                    setLoader(false);
                  }
                  if(comingData.type === 'socketinfo') {
                    //console.log("SOCKET INFO RECEIVED", comingData.info.symbol);
                    if (comingData.info.symbol) {
                      if (localStorage.getItem("buysellitem") === comingData.info.symbol) {
                        localStorage.setItem("symbolPrice", comingData.info.ltp);
                        setSocketInfo(comingData.info);
                      }
                    }
                  }
                  if(comingData.type === 'removeItem') {
                    getWatchlistss();
                  }
                });

                ws.addEventListener('close', (event) => {
                  console.log('WebSocket connection closed:', event.code, event.reason);
                });

                return () => {
                  ws.close();
                };

        }
      } catch (error) {
        console.log("New SocketConnected Catch Error", error);
      }
    }

  var marketSymbols = [];
  symbols?.map((item) => {
    marketSymbols.push({
      value: item.id,
      label: item.symbol,
    });
  });

  var accountsOption = [];
  accounts?.map((item) => {
    accountsOption.push({
      value: item.id,
      label: `${item.name} : ${item.client_id}` ,
    });
  });

  var groupAccountOption = [];
  groupAccount?.map((item) => {
    groupAccountOption.push({
      value: item.id,
      label: item.name,
    });
  });

  console.log("groupAccount",groupAccount);

  const getSymbolsList = () => {
    axios
      .get(`/api/watchmarket/getsymbolslist`)
      .then((result) => {
        setSymbols(result.data.symbols);
      })
      .catch((error) => {
        console.log("Symbols List Error", error);
      });
  };

  const [watchList, setWatchList] = useState([]);

  const getWatchlistss = (e) => {
    setLoader(true);
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    axios
      .get(`/api/watchmarket/getWatchlist/${decoded.user_id}`)
      .then((result) => {
        setWatchList(result.data.watchlist);
        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
        console.log("Get Watchlist List Error", error);
      });
  };

  const HandleAddWatchlistItem = (e) => {
    setLoader(true);
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    axios
      .get(`/api/watchmarket/getWatchlist/${decoded.user_id}`)
      .then((result) => {
              Store.addNotification({
                  title: "Message!",
                  message:`Symbol : ${e.label} is added successfully from your watchlist`,
                  type: "success",
                  insert: "top",
                  width: '0px',
                  container: "top-left",
                  animationIn: ["animate__animated", "animate__fadeIn"],
                  animationOut: ["animate__animated", "animate__fadeOut"],
                  dismiss: {
                    duration: 7800,
                    onScreen: true
                  }
                })

        setSubscribeActive(e.label);
        setLoader(false);
        ws.send(JSON.stringify({
          'type': 'subscribe', 
          'symbol': e.label,   
          'userId': decoded.user_id
        }));
      }).catch((error) => {
        setLoader(false);
        console.log("Get Watchlist List Error", error);
      });
  };

  const HandleSelectAccount = async (selected, selectaction) => {
    const { action } = selectaction;
    if (action === "clear") {
    } else if (action === "select-option") {
    } else if (action === "remove-value") {
    }
    setSelectedAccountId(selected);
  };

  const HandleSelectGroupAccount = async (selected, selectaction) => {
    const { action } = selectaction;
    if (action === "clear") {
    } else if (action === "select-option") {
    } else if (action === "remove-value") {
    }
    setSelectedGroupAccountId(selected);
  };

  const SearchWatchlistItem = (e) => {
    setSymbol(e.label);
    localStorage.setItem("buysellitem", e.label);
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    ws.send(JSON.stringify({
      'type': 'singleSubscribe', 
      'symbol': e.label,   
      'userId': decoded.user_id
    }));
    console.log("subscribe symbol", e.label);
  };

  const HandleDeleteSymbol = (symb, id) => {
    setLoader(true);
    var result = confirm("Want to delete?");
    if (result == true) {
      setLoader(false);
       Store.addNotification({
                  title: "Message!",
                  message:`Symbol : ${symb} is deleted successfully from your watchlist`,
                  type: "success",
                  insert: "top",
                  width: '0px',
                  container: "top-left",
                  animationIn: ["animate__animated", "animate__fadeIn"],
                  animationOut: ["animate__animated", "animate__fadeOut"],
                  dismiss: {
                    duration: 7800,
                    onScreen: true
                  }
                })
      var decoded = jwt_decode(localStorage.getItem("userToken"));
      ws.send(JSON.stringify({
        'type': 'unsubscribe', 
        'symbol': symb,   
        'userId': decoded.user_id
      }));
    } else {
      setLoader(false);
      return false;
    }
  };

  const [partialQty,setPartialQty] = useState(false);

  const buysellBox = (type, symbol, qty = 0, account_id = '', partial = '') => {
    if(account_id !== '') {
      setPartialQty(true);
      axios
      .get(`/api/watchmarket/getAccount/${account_id}`)
      .then((result) => {
        if(result.data.singleaccount) {
          setSelectedAccountId([{value: result.data.singleaccount[0]['id'],label: result.data.singleaccount[0]['name']}]);
          setBuyboxShow(true);
          setBoxtype(type);
          setSymbol(symbol);
           Math.sign(qty) == "-1" ? setQuantity(Math.abs(qty)) : setQuantity(qty);
          localStorage.setItem("buysellitem", symbol);
        }
      })
      .catch((error) => {
        setLoader(false);
      });
    } else {
      setPartialQty(false);
      setBuyboxShow(true);
      setBoxtype(type);
      setSymbol(symbol);
      setQuantity(qty);
      localStorage.setItem("buysellitem", symbol);
      var decoded = jwt_decode(localStorage.getItem("userToken"));
      ws.send(JSON.stringify({
        'type': 'singleSubscribe', 
        'symbol': symbol,   
        'userId': decoded.user_id
      }));
    }
  };

  const backtowatch = () => {
    setOrderTypeExec("INTRADAY");
    setProductType('INTRADAY');
    setBuyboxShow(false);
    setQuantity(1);
    setOrgPrice(0);
    setStopPrice(0);
    setDiscQuantity(0);
    setTargetPrice(0);
    setStopLoss(0);
    setOfflineOrder("false");
    setOrgPriceTemp(false);
    setStopLossTemp(false);
    setSlMarketTemp(false);
    setTrigPriceTemp(true);
    setGroupAcc("");
    setDiffQty("");
    setMultiplier("");
    setQtyCheckbox([]);
    setDiffQtyAdd([]);
    setproductTypeBox(false);
  };

  const [qtyCheckbox, setQtyCheckbox] = useState([]);
  const [diffQtyAdd, setDiffQtyAdd] = useState([]);
  const qtycheckhandle = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      localStorage.removeItem(`checkqty${value}`);
      setQtyCheckbox([...qtyCheckbox, value]);
    } else {
      setQtyCheckbox(qtyCheckbox.filter((e) => e !== value));
    }
  };

  const HandleGroupAcc = (e) => {
    setGroupAcc(e.target.checked);
    setQtyCheckbox([]);
    setSelectedAccountId('');
    if (e.target.checked === true) {
      var decoded = jwt_decode(localStorage.getItem("userToken"));
      axios
        .get(`/api/watchmarket/getAccountGroup/${decoded.user_id}`)
        .then((result) => {
          setGroupAccount(result.data.groupAccount);
      })
        .catch((error) => {
          console.log("Symbols List Error", error);
      });
    }
  };

  const [groupPositionAcc, setGroupPositionAcc] = useState(false);

  const HandlePositionGroupAcc = (e) => {
    setGroupPositionAcc(e.target.checked);
    if (e.target.checked === true) {
      setSelectedAccountId([]);
      var decoded = jwt_decode(localStorage.getItem("userToken"));
      axios
        .get(`/api/watchmarket/getAccountGroup/${decoded.user_id}`)
        .then((result) => {
          setGroupAccount(result.data.groupAccount);
        })
        .catch((error) => {
          console.log("Symbols List Error", error);
        });
    } else {
      setSelectedGroupAccountId([]);
    }
  };

  const diffQuantityCheck = (e, qtty) => {
    if (e) {
      localStorage.setItem(`checkqty${qtty}`, e);
      $("#checkqty" + qtty).val(e);
    }
  };

  const getValll = () => {
    var ll = [];
    if (qtyCheckbox) {
      qtyCheckbox?.map((im) => {
        ll.push({
          id: im,
          value: `${localStorage.getItem("checkqty" + im)}`,
        });
      });
    }
    return ll;
  };

  const HandleOrder = async () => {
    var tquantity = quantity;
    setLoader(true);
    if(partialQty) {
      tquantity = Math.ceil((quantity * pquantity) / 100) ;
    }

    if(tquantity == 0 && !diffQty) {
        Store.addNotification({
          title: "Warning!",
          message: "Quantity should not be zero",
          type: "warning",
          insert: "top",
          width: '0px',
          container: "top-left",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"],
          dismiss: {
            duration: 7800,
            onScreen: true
          }
        })
      setLoader(false);
      return;
    }
    else if (!groupAcc && !diffQty) {
      if (selectedAccountId.length === 0) {
              Store.addNotification({
                title: "Warning!",
                message: "Please select Account in order to trade!",
                type: "warning",
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })
        setLoader(false);
        return;
      } else {
        orderPlacedresult(tquantity);
      }
    } else if (groupAcc && diffQty === "") {
      if (selectedGroupAccountId.length === 0) {
            Store.addNotification({
                title: "Warning!",
                message: "Please select Group Account in order to trade!",
                type: "warning",
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })
        setLoader(false);
        return;
      } else {
        orderPlacedresult(tquantity);
      }
    } else if (groupAcc && diffQty) {
      if (qtyCheckbox.length == 0) {
              Store.addNotification({
                title: "Warning!",
                message: "Please select Group Account in order to trade!",
                type: "warning",
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })
        setLoader(false);
        return;
      } else {
        orderPlacedresult(tquantity);
      }
    } else {
      setLoader(true);
      orderPlacedresult(tquantity);
    }
  };

  const orderPlacedresult = async (tquantity) => {
    setLoader(true);
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    var kl = [];
    if (selectedAccountId !== "") {
      selectedAccountId?.map((itm) => {
        kl.push(itm.value);
      });
    }

    var kl2 = [];
    if (selectedGroupAccountId !== "") {
      selectedGroupAccountId?.map((itm) => {
        kl2.push(itm.value);
      });
    }

    const uniqueCheckBoxTags = [];
    qtyCheckbox.map((item) => {
      var findItem = uniqueCheckBoxTags.find((x) => x === item);
      if (!findItem) uniqueCheckBoxTags.push(item);
    });

    const uniqueCheckBoxTags2 = [];
    getValll().map((item) => {
      var findItem = uniqueCheckBoxTags2.find((x) => x.id === item.id);
      if (!findItem) uniqueCheckBoxTags2.push(item);
    });

      var stopLossCal = 0;
      var takeProfitVal = 0;
      if(productType == "CO") {
        if(type == "1") {
          stopLossCal = parseFloat(orgPrice) - parseFloat(stopLoss);
        } else if(type == "2") {
          const buysllItem = localStorage.getItem('buysellitem');
          stopLossCal = JSON.parse(localStorage.getItem(`${buysllItem}`)).ltp - parseFloat(stopLoss);
        } 
      } else if(productType == "BO") { 
        if(type == "1") {
          stopLossCal = parseFloat(orgPrice) - parseFloat(stopLoss);
          takeProfitVal = parseFloat(targetPrice) - parseFloat(orgPrice);
        } else if(type == "2") {
          const buysllItem = localStorage.getItem('buysellitem');
          stopLossCal = JSON.parse(localStorage.getItem(`${buysllItem}`)).ltp - parseFloat(stopLoss);
          takeProfitVal = parseFloat(targetPrice) - JSON.parse(localStorage.getItem(`${buysllItem}`)).ltp
        } else if(type == "3") {
          const buysllItem = localStorage.getItem('buysellitem');
          stopLossCal = JSON.parse(localStorage.getItem(`${buysllItem}`)).ltp - parseFloat(stopLoss);
          takeProfitVal = parseFloat(targetPrice) - JSON.parse(localStorage.getItem(`${buysllItem}`)).ltp
        } else if(type == "4") {
          stopLossCal = parseFloat(orgPrice) - parseFloat(stopLoss);
          takeProfitVal = parseFloat(targetPrice) - parseFloat(orgPrice);
        }
      } else {
        stopLossCal = 0;
        takeProfitVal = 0;
      }

    if(Math.sign(stopLossCal) == -1) {
       // alert("StopLoss should be below than LTP");
              Store.addNotification({
                title: "Warning!",
                message: "StopLoss should be below than LTP!",
                type: "warning",
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })
       setLoader(false);
    } else if(Math.sign(takeProfitVal) == -1) {
        Store.addNotification({
          title: "Warning!",
          message: "Target price should be above than LTP!",
          type: "warning",
          insert: "top",
          width: '0px',
          container: "top-left",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"],
          dismiss: {
            duration: 7800,
            onScreen: true
          }
      })
      setLoader(false);
    } else {
      await axios
      .post(`/api/watchmarket/createOrder`, {
        id: decoded.user_id,
        symbol: symbol,
        qty: parseInt(tquantity),
        type: parseInt(type),
        side: parseInt(boxtype),
        productType: productType,
        limitPrice: parseFloat(orgPrice),
        stopPrice: parseFloat(stopPrice),
        disclosedQty: parseInt(discQuantity),
        validity: validity,
        offlineOrder: offlineOrder,
        stopLoss: parseFloat(Math.floor(stopLossCal)),
        takeProfit: parseFloat(Math.floor(takeProfitVal)),
        groupAcc: groupAcc,
        diffQty: diffQty,
        multiplier: multiplier,
        checkboxAccountid: uniqueCheckBoxTags,
        checkboxAccountval: uniqueCheckBoxTags2,
        selectedAccountId: kl,
        selectedGroupAccountId: kl2,
      })
      .then((res) => {
          setLoader(false);
          var tempCheck = false;
          res.data.OrdersData?.map(item => {
            if(item.status === "error") {
              tempCheck = true;
              return;
            }
          });

          if(tempCheck) {
            setBuyboxShow(true);
          } else {
            setSelectedGroupAccountId([]);
            setSelectedAccountId([]);
            setBuyboxShow(false);
            setProductType('INTRADAY');
            setDiffQty("");
            setGroupAcc("");
            setOrderTypeExec("INTRADAY");
            setQuantity(1);
            setOrgPrice(0);
            setStopPrice(0);
            setDiscQuantity(0);
            setTargetPrice(0);
            setStopLoss(0);
            setOfflineOrder("false");
            setOrgPriceTemp(false);
            setStopLossTemp(false);
            setSlMarketTemp(false);
            setTrigPriceTemp(true);
            setMultiplier("");
            setQtyCheckbox([]);
            setDiffQtyAdd([]);
            setproductTypeBox(false);
            setTradingActiveKey('watch_market');
          }

          if(res.data.OrdersData) {
            res.data.OrdersData?.map(item => {
              Store.addNotification({
                title: `${item.client}`,
                message: `${item.message}`,
                type: `${item.status === "error" ? "danger": "success"}`,
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
              })
            })
          }
        
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
    }   
  };

  const getAnyErrors = () => {
    var decoded = jwt_decode(localStorage.getItem("userToken"));
    axios
      .get(`/api/watchmarket/getAnyErrors/${decoded.user_id}`)
      .then((result) => {
        if (result.data.errors) {
          setLoader(false);
          setBuyboxShow(true);
          //setErrorsMsg(result.data.errors);
          result.data.errors?.map(item => {
            Store.addNotification({
                title: `${item.name}`,
                message: item.message,
                type: `${item.status === "error" ? "Danger": "Success"}`,
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })
          })

          decodedNew.role_id == "1" ? getFilterPositions() : getFilterPositionsUser();
        } else {
          decodedNew.role_id == "1" ? getFilterPositions() : getFilterPositionsUser();
          setLoader(false);
        }
      })
      .catch((error) => {
        setLoader(false);
        console.log("Symbols List Error", error);
      });
  };

  const [OrderOpen, setOrderOpen] = useState("0");
  const [OrderTotal, setOrderTotal] = useState("0");
  const [OrderCancel, setOrderCancel] = useState("0");
  const [OrderReject, setOrderReject] = useState("0");
  const [OrderCompleted, setOrderCompleted] = useState("0");

  const test = async (e) => {
    setModifyBox(false);
    SetGroupAccountSquareOff(false);
    setCheckedModelList([]);
    setCheckedPosModelList([]);
    if (e === "order") {
      setTradingActiveKey("order");
      setFilterType(0)
      setActiveTab(e);
      decodedNew.role_id == "1" ? await getFilterOrders() : await getFilterOrdersUser()
    } else if (e === "position") {
      setTradingActiveKey("position");
      setActiveTab(e);
      setFilterType(0);
      decodedNew.role_id == '1' ? await getFilterPositions() : await getFilterPositionsUser()
    } else if (e === "holdings") {
      setTradingActiveKey("holdings");
      getHoldings();
      setActiveTab(e);
      setFilterType(0);
    } else if (e === "margin") {
      setTradingActiveKey("margin");
      setActiveTab(e);
      setFilterType(0);
      decodedNew.role_id == '1' ? await getFundsMargin() : await getFundsUserWiseMargin()
    } else if (e === "notifications") {
      setTradingActiveKey("notifications");
      setActiveTab(e);
      setFilterType(0);
      getNotifications();
    } else if (e === "summary") {
      setTradingActiveKey("summary");
      setActiveTab(e);
      setFilterType(0);
      decodedNew.role_id == '1' ? await getFundsSummary() : await getFundsUserWiseSummary()
      axios
        .get(`/api/orders/orderSummarry/${filterType}`)
        .then((result) => {
          setLoader(false);
          setOrderOpen(result.data.open);
          setOrderTotal(result.data.total);
          setOrderReject(result.data.reject);
          setOrderCancel(result.data.cancel);
          setOrderCompleted(result.data.completed);
          decodedNew.role_id == '1' ? getFilterPositions() : getFilterPositionsUser()
         })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
        });
        
    } else {
      setTradingActiveKey("watch_market");
      setFilterType(0);
      setActiveTab("watch_market");
    }
  };

  const cancelOrder = async (orderId, Client_id) => {
    await axios
      .post(`/api/orders/cancelOrder`, {
        orderId: orderId,
        Client_id: Client_id,
      })
      .then((response) => {
        getOrders();
        Store.addNotification({
                title: `Order Message`,
                message: 'Order is canceled Successfully',
                type: `Success`,
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
        })
      });
  };

  const checklists = [];
  orders?.map((item) => {
    checklists.push(item.order_id);
  });

  const [checkedModelList, setCheckedModelList] = useState([]);
  const onChangeModel = (e) => {
    const ischecked = e.target.checked;
    const dataid = e.target.dataset.id;
    if (dataid === "checkall") {
      if (ischecked === true) {
        setCheckedModelList(checklists);
      } else if (ischecked === undefined) {
        setCheckedModelList(checklists);
      } else {
        setCheckedModelList([]);
      }
    } else if (dataid == "uncheckall") {
      setCheckedModelList([]);
    } else {
      if (ischecked === true) {
        setCheckedModelList((prevalue) => [...prevalue, dataid]);
      } else {
        const resultfilter = checkedModelList.filter((d, index) => {
          return d !== dataid;
        });
        setCheckedModelList(resultfilter);
      }
    }
  };

  const poschecklists = [];
  PositionsViewData?.map((item) => {
    poschecklists.push(item.id);
  });

  const [checkedPosModelList, setCheckedPosModelList] = useState([]);

  const onChangePositionModel = (e) => {
    const ischecked = e.target.checked;
    const dataid = e.target.dataset.id;
    if (dataid === "checkall") {
      if (ischecked === true) {
        setCheckedPosModelList(poschecklists);
      } else if (ischecked === undefined) {
        setCheckedPosModelList(poschecklists);
      } else {
        setCheckedPosModelList([]);
      }
    } else if (dataid == "uncheckall") {
      setCheckedPosModelList([]);
    } else {
      if (ischecked === true) {
        setCheckedPosModelList((prevalue) => [
          ...prevalue,
          parseInt(e.target.dataset.id),
        ]);
      } else {
        const resultfilter = checkedPosModelList.filter((d, index) => {
          return d !== parseInt(e.target.dataset.id);
        });
        setCheckedPosModelList(resultfilter);
      }
    }
  };

  const [orderActive, setOrderActive] = useState("0");

  const filterOrder = (e) => {
    setLoader(true);
    setOrders([]);
    setFilterByStatusOrder(e.target.value);
    setOrderActive(e.target.value);
    if(decodedNew.role_id == '1') {
      axios
      .get(`/api/orders/getFilterOrders?status=${e.target.value}&account=${filterByAccountOrder}`)
      .then((result) => {
        setLoader(false);
        if (result.data.viewData) {
          setOrders(result.data.viewData);
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
    } else {
      axios
      .get(`/api/orders/getNewOrdersUserNew?status=${e.target.value}&account=${filterByAccountOrder}`)
      .then((result) => {
        setLoader(false);
        if (result.data.viewData) {
          setOrders(result.data.viewData);
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log("Error", err);
      });
    }
  };

  const [positionActive, setPositionActive] = useState("all");

  const filterPosition = (e) => {
    setLoader(true);
    setFilterByStatusPosition(e.target.value);
    if(decodedNew.role_id == '1') {
      getPositions(e.target.value,filterByAccountPosition,filterBySymbolPosition);
    } else {
      getPositions(e.target.value,decodedNew.user_id,filterBySymbolPosition)
    }
  };

  const filterBySymbol = (e) => {
    setFilterBySymbolPosition(e.target.value);
    if(decodedNew.role_id == '1') {
      getPositions(filterByStatusPosition,filterByAccountPosition,e.target.value);
    } else {
      getPositions(filterByStatusPosition,decodedNew.user_id,e.target.value)
    }
  }

  const resetPosition = () => {
    setPositionActive("all");
    setLoader(true);
    setPositions([]);
    getPositions(filterByStatusPosition,filterByAccountPosition,filterBySymbolPosition);
  };

  const [modifyBox, setModifyBox] = useState(false);

  const onChangeModifyBox = () => {
    setModifyBox(false);
  };

  const HandleCancel = async () => {
    setLoader(true);
    if (checkedModelList.length == 0) {
          Store.addNotification({
                title: `Order Message`,
                message: `No order selected`,
                type: `danger`,
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
          })
          setLoader(false);
    } else {
      setLoader(true);
      const uniqueTags = [];
      checkedModelList.map((item) => {
          var findItem = uniqueTags.find((x) => x === item);
          if (!findItem) uniqueTags.push(item);
        });
        axios
          .post(`/api/orders/cancelOrders`, { Orders: checkedModelList })
          .then((response) => {
              setLoader(false);
              if (response.data.resultMultiOrders) {
                setCheckedModelList([]);
                response.data.resultMultiOrders?.map(item => {
                  Store.addNotification({
                  title: `Order Message`,
                  message: `${item.client}:${item.message}`,
                  type: `${item.status === "error" ? "danger": "success"}`,
                  insert: "top",
                  width: '0px',
                  container: "top-left",
                  animationIn: ["animate__animated", "animate__fadeIn"],
                  animationOut: ["animate__animated", "animate__fadeOut"],
                  dismiss: {
                    duration: 7800,
                    onScreen: true
                  }
               })
                })
                decodedNew.user_id == "1" ? getaGainOrders() : getaGainOrdersUser();
              }
            
            
          }).catch(error => {
            setLoader(false);
          })
    }
  };

  const onChangeAccount = (e) => {
    setFilterType(e.target.value);
    if (activeTab === "margin") {
      const userType = decodedNew.role_id == "1" ? 'admin' : 'userwise'
      setLoader(true);
      axios
        .get(`/api/orders/getfundsData?account=${e.target.value}&user_type=${userType}&user_id=${decodedNew.user_id}`)
        .then((result) => {
          setLoader(false);
          if (result.data.viewFundsData) {
            setFunds(result.data.viewFundsData);
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
        });
    } else if (activeTab === "order") {
      setFilterByAccountOrder(e.target.value);
      setLoader(true);
      axios
        .get(`/api/orders/getFilterOrders?status=${filterByStatusOrder}&account=${e.target.value}`)
        .then((result) => {
          setLoader(false);
          if (result.data.viewData) {
            setOrders(result.data.viewData);
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
        });
    } else if (activeTab === "position") {
      const actualVal = e.target.value.split('-');
      const actualValue = actualVal[1] === "act" ? 'account' : 'group';
      setFilterByAccountPosition(actualVal[0]);
      setLoader(true);
      getPositions(filterByStatusPosition,actualVal[0],filterBySymbolPosition,actualValue);
    } else if(activeTab === "summary") { 
      
      setFilterByAccountSummary(e.target.value);
      setLoader(true);
      axios
        .get(`/api/positions/getPositionsDetails?status=&account=${e.target.value}&symbol=`)
        .then((result) => {
          setLoader(false);
          if (result.data.viewData) {
            setPositions(result.data.viewData);
            setOverallPositionsData(result.data.Overallpositions);
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
        });
    
      const userTypee = e.target.value == "" ? '0' : e.target.value;
      axios
        .get(`/api/orders/orderSummarry/${userTypee}`)
        .then((result) => {
          setLoader(false);
          setOrderOpen(result.data.open);
          setOrderTotal(result.data.total);
          setOrderReject(result.data.reject);
          setOrderCancel(result.data.cancel);
          setOrderCompleted(result.data.completed);
        })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
        });

        setLoader(true);
        setFunds([]);
        const userType = decodedNew.role_id == "1" ? 'admin' : 'userwise'
        axios
          .get(`/api/orders/getfundsData?account=${e.target.value}&user_type=${userType}&user_id=${decodedNew.user_id}`)
          .then((result) => {
            if (result.data.viewFundsData) {
              setFunds(result.data.viewFundsData);
            }
            setLoader(true);
          })
          .catch((err) => {
            setLoader(false);
            console.log("Error", err);
          });
        }
        const actualVal = e.target.value.split('-');
        axios
            .get(`/api/orders/getHoldingsData/${actualVal[0]}`)
            .then((result) => {
              setLoader(false);
              if (result.data.viewHoldingData) {
                setHoldings(result.data.viewHoldingData);
              }
            })
            .catch((err) => {
              setLoader(false);
              console.log("Error", err);
         });
  };

  const [modifyId, setModifyId] = useState("");
  const [modifyClient, setModifyClient] = useState("");
  const [modifyQty, setModifyQty] = useState("");
  const [modifyType, setModifyType] = useState("");
  const [modifyLimitPrice, setModifyLimitPrice] = useState("");
  const [modifyStopPrice, setModifyStopPrice] = useState("");

  const HandleOrderModify = () => {
    if (checkedModelList.length == 0) {
            Store.addNotification({
                  title: "Warning!",
                  message: `No OPEN orders selected`,
                  type: "warning",
                  insert: "top",
                  width: '0px',
                  container: "top-left",
                  animationIn: ["animate__animated", "animate__fadeIn"],
                  animationOut: ["animate__animated", "animate__fadeOut"],
                  dismiss: {
                    duration: 7800,
                    onScreen: true
                  }
                })
    } else if(checkedModelList.length == 1) {
      checkedModelList?.map((item) => {
        axios
          .get(`/api/orders/checkStatus/${item}`)
          .then((result) => {
            if (result.data.status > 0) {
              setSymbol(result.data.modifySymbol);
              setModifyBox(true);
              setModifyId(item);
              setModifyClient(result.data.activeClient);
              setModifyQty(result.data.modifyQty);
              setModifyType(result.data.modifyType);
              setModifyLimitPrice(result.data.modifyLimitPrice);
              setModifyStopPrice(result.data.modifyStopPrice);
            } else if(result.data.modifyErrorReport) {
              Store.addNotification({
                title: `Order Message`,
                message: `${result.data.modifyErrorReport}`,
                type: `Success`,
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })
            } else {
              Store.addNotification({
                title: `Order Message`,
                message: 'Order is not pending',
                type: `danger`,
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })

            }
          })
          .catch((err) => {
            setLoader(false);
            console.log("Error", err);
          });
      });
    } else {
            Store.addNotification({
                title: `Order Message`,
                message: `Only one order can be modified in single time`,
                type: `danger`,
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })
    }
  };

  const modifyOrderinitiate = (orderid, client) => {
    setLoader(true);
    checkedModelList?.map((item) => {
      axios
        .post(`/api/orders/initiateModifyOrder`, {
          orderid: item,
          client: client,
          qty: modifyQty,
          type: modifyType,
          limitPrice: modifyLimitPrice,
          stopPrice: modifyStopPrice,
        })
        .then((result) => {
          if (result.data.modify[0].s === "ok") {
            result.data.modify(item => {
                Store.addNotification({
                  title: `${item.status === "error" ? "error" : "success"}`,
                  message: `${item.id}:${item.message}`,
                  type: `${item.status === "error" ? "danger": "success"}`,
                  insert: "top",
                  width: '0px',
                  container: "top-left",
                  animationIn: ["animate__animated", "animate__fadeIn"],
                  animationOut: ["animate__animated", "animate__fadeOut"],
                  dismiss: {
                    duration: 7800,
                    onScreen: true
                  }
                })
            })
            setModifyBox(false);
            setLoader(false);
            decodedNew.user_id == "1" ? getaGainOrders() : getaGainOrdersUser();
          } else {
            result.data.modify(item => {
                Store.addNotification({
                  title: `${item.status === "error" ? "error" : "success"}`,
                  message: `${item.id}:${item.message}`,
                  type: `${item.status === "error" ? "danger": "success"}`,
                  insert: "top",
                  width: '0px',
                  container: "top-left",
                  animationIn: ["animate__animated", "animate__fadeIn"],
                  animationOut: ["animate__animated", "animate__fadeOut"],
                  dismiss: {
                    duration: 7800,
                    onScreen: true
                  }
                })
            })
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          console.log("Error", err);
        });
    });
  };

    const HandlePositionExit = async () => {
      setLoader(true);
      if (checkedPosModelList.length > 0) {
        const uniqueTags = [];
        checkedPosModelList.map((item) => {
          var findItem = uniqueTags.find((x) => x === item);
          if (!findItem) uniqueTags.push(item);
        });
         
        await axios
        .post(`/api/orders/exitMultiPositions`, {
          positions: uniqueTags
        })
        .then((response) => {
            setLoader(false);
            if (response.data.position) {
            setCheckedPosModelList([]);
            response.data.resultMultiPositions?.map(item => {
              Store.addNotification({
                title: `Notification Message`,
                message: `${item.client}:${item.message}`,
                type: `${item.status === "error" ? "danger" : "success"}`,
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })
            })
            decodedNew.user_id == "1" ? getFilterPositions() : getFilterPositionsUser();
          }          
        });
      } else {
            Store.addNotification({
                title: `Message`,
                message: `No Open Position selected`,
                type: `warning`,
                insert: "top",
                width: '0px',
                container: "top-left",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 7800,
                  onScreen: true
                }
             })
      }
    }

  const [GroupAccountSquareOff, SetGroupAccountSquareOff] = useState(false);

  const HandleGroupAccount = () => {
     setLoader(true);
     setSelectedAccountId([]);
     if(checkedPosModelList.length > 0 ) {
      const uniqueTags = [];
      checkedPosModelList.map((item) => {
        var findItem = uniqueTags.find((x) => x === item);
        if (!findItem) uniqueTags.push(item);
      });
        axios
        .post(`/api/watchmarket/getAccountPosition`, {selectedVal:uniqueTags})
        .then((result) => {
          if(result.data.newSelectedVal) {
             result.data.newSelectedVal?.map(item => {
              setSelectedAccountId(prevState => [...prevState,{value: item[0].id,label: item[0].name }])
             })
          }
        })
        .catch((error) => {
          setLoader(false);
        })
     } 

     setTimeout(() => {
      setLoader(false);
      SetGroupAccountSquareOff(true);
     },1000);
  };

  const BacktoPositions = () => {
    setSelectedGroupAccountId([]);
    setGroupPositionAcc(false);
    SetGroupAccountSquareOff(false);
  };

   const SquareOffinitiate = async () => {
    if (groupPositionAcc) {
      if (selectedGroupAccountId !== "") {
        selectedGroupAccountId?.map((itm) => {
          axios
            .post(`/api/orders/exitGroupAccountPosition`, { id: itm.value })
            .then((response) => {
              SetGroupAccountSquareOff(false);
              decodedNew.user_id == "1" ? getFilterPositions() : getFilterPositionsUser();
            });
        });
      }
    } else {
      if (selectedAccountId !== "") {
        selectedAccountId?.map((itm) => {
          axios
            .post(`/api/orders/exitAccountPosition`, { id: itm.value })
            .then((response) => {
              if (response.data.Accountposition) {
                response.data.Accountposition?.map(item => {
                   Store.addNotification({
                      title: `Account Message`,
                      message: `${item.message}`,
                      type: `${item.status === "error" ? "danger" : "success"}`,
                      insert: "top",
                      width: '0px',
                      container: "top-left",
                      animationIn: ["animate__animated", "animate__fadeIn"],
                      animationOut: ["animate__animated", "animate__fadeOut"],
                      dismiss: {
                        duration: 7800,
                        onScreen: true
                      }
                  })
                 })
                decodedNew.user_id == "1" ? getFilterPositions() : getFilterPositionsUser();
              }
            });
        });
      }
    }
  };


 const [sortName,setSortName] = useState(false);
 const HandleSort = (action,sort1Type) => {
    if(action == '') {
      setSortName(action);
      var decoded = jwt_decode(localStorage.getItem("userToken"));
      axios.get(`/api/watchmarket/getWatchlist/${decoded.user_id}`).then(result => {
        setWatchList(result.data.symbols);
      }).catch(err => {
        console.log("Error", err);
      })
    } else {
      var decoded = jwt_decode(localStorage.getItem("userToken"));
      setSortName(sort1Type);
      axios.get(`/api/watchmarket/getSortsymbolslist/${decoded.user_id}/${action}/${sort1Type}`).then(result => {
        setWatchList(result.data.symbols);
      }).catch(err => {
        console.log("Error", err);
      })
    } 
  }

  const HandleOrderRefresh = () => {
    decodedNew.user_id == "1" ? getaGainOrders() : getaGainOrdersUser();
  }

  var filterSymbolPos = [];
  //var uniqueSymbolsTags = [];

  positions?.map(item => {
    filterSymbolPos.push(item.symbol);
  })

  var uniqueSymbolsTags = [...new Set(filterSymbolPos)];

  return (
    <Container fluid className="p-6">
                <PageHeading heading="Trading" />
                <Row className="mt-6">
                {         
                          buyboxShow && (
                            <>
                              <div className="modal show" id="TradeBox" style={{display: 'block',background: 'black' , opacity: '1.9' , zIndex: 1}}>
                              <div className="modal-dialog modal-xl modal-dialog-centered">
                                <div className="modal-content" style={{marginLeft: '20%'}}>
                                    <div className="modal-body">
                                      <div
                                      className={`container-fluid ${
                                        boxtype == 1 ? "buy_box" : "sell_box"
                                      }`}
                                    >
                                      <div class="row space_margin">
                                        <div class="col">
                                          {boxtype == 1 ? (
                                            <input
                                              type="radio"
                                              className="radio_pointer"
                                              onChange={(e) => setBoxtype(e.target.value)}
                                              name="side"
                                              value="1"
                                              defaultChecked
                                            />
                                          ) : (
                                            <input
                                              type="radio"
                                              className="radio_pointer"
                                              onChange={(e) => setBoxtype(e.target.value)}
                                              name="side"
                                              value="1"
                                            />
                                          )}
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">BUY</span>
                                          </label>
                                          {boxtype == -1 ? (
                                            <input
                                              type="radio"
                                              id="radio-button-1"
                                              className="space_margin_row1 radio_pointer"
                                              onChange={(e) => setBoxtype(e.target.value)}
                                              name="side"
                                              value="-1"
                                              defaultChecked
                                            />
                                          ) : (
                                            <input
                                              type="radio"
                                              id="radio-button-1"
                                              className="space_margin_row1 radio_pointer"
                                              onChange={(e) => setBoxtype(e.target.value)}
                                              name="side"
                                              value="-1"
                                            />
                                          )}
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">SELL</span>
                                          </label>
                                        </div>
                                        <div class="col">
                                          <Select
                                            options={marketSymbols}
                                            placeholder="Select Symbol"
                                            onChange={SearchWatchlistItem}
                                            defaultValue={{ label: symbol }}
                                          />
                                        </div>
                                        <div className="col">
                                          <button
                                            type="button"
                                            className="btn"
                                            style={{ background: 'black' , color: 'white' }}
                                            onClick={backtowatch}
                                          >
                                            CLOSE TRADE BOX
                                          </button>
                                        </div>
                                        <div className="col">
                                          <button
                                            type="button"
                                            className="btn"
                                            style={{ float:'right',background: 'black' , color: 'white' }}
                                            onClick={backtowatch}
                                          >
                                            X
                                          </button>
                                        </div>
                                      </div>
                                      <div class="row space_margin" style={{ marginBottom: '2%' , marginTop: '2%' }}>
                                        <div class="col">
                                          <input
                                            type="radio"
                                            name="variety"
                                            className="radio_pointer"
                                            onChange={HandleProductType}
                                            value="REGULAR"
                                            defaultChecked
                                          />
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">REGULAR</span>
                                          </label>
                                        
                                          <input
                                            type="radio"
                                            className="space_margin_row1 radio_pointer"
                                            onChange={HandleProductType}
                                            name="variety"
                                            value="BO"
                                          />
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">BO</span>
                                          </label>
                                          <input
                                            type="radio"
                                            className="space_margin_row1 radio_pointer"
                                            onChange={HandleProductType}
                                            name="variety"
                                            value="CO"
                                          />
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">CO</span>
                                          </label>
                                        </div>
                                      </div>
                                      <div class="row space_margin">
                                        <div class="col">
                                        {
                                          productType == "BO" || productType == "CO" ?
                                          <input
                                            type="radio"
                                            name="productType"
                                            className="radio_pointer"
                                            onChange={(e) => setProductType(e.target.value)}
                                            value="INTRADAY"
                                            checked="true"
                                          />
                                        :
                                          <input
                                            type="radio"
                                            name="productType"
                                            className="radio_pointer"
                                            onChange={(e) => setProductType(e.target.value)}
                                            value="INTRADAY"
                                            defaultChecked
                                          />
                                        }
                                         
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">INTRADAY</span>
                                          </label>
                                          {productTypeBox ? (
                                            <input
                                              type="radio"
                                              className="space_margin_row1 radio_pointer"
                                              name="productType"
                                              onChange={(e) => setProductType(e.target.value)}
                                              value="MARGIN"
                                              disabled
                                            />
                                          ) : (
                                            <input
                                              type="radio"
                                              className="space_margin_row1 radio_pointer"
                                              name="productType"
                                              onChange={(e) => setProductType(e.target.value)}
                                              value="MARGIN"
                                            />
                                          )}
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">DELIVERY</span>
                                          </label>
                                          {productTypeBox ? (
                                            <input
                                              type="radio"
                                              className="space_margin_row1 radio_pointer"
                                              name="productType"
                                              onChange={(e) => setProductType(e.target.value)}
                                              value="CNC"
                                              disabled
                                            />
                                          ) : (
                                            <input
                                              type="radio"
                                              className="space_margin_row1 radio_pointer"
                                              name="productType"
                                              onChange={(e) => setProductType(e.target.value)}
                                              value="CNC"
                                            />
                                          )}
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">NORMAL</span>
                                          </label>
                                        </div>
                                        <div class="col">
                                          <input
                                            type="radio"
                                            name="orderTypeLimit"
                                            className="radio_pointer"
                                            value="1"
                                            onChange={Handletype}
                                            defaultChecked
                                          />
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">LIMIT</span>
                                          </label>
                                          <input
                                            type="radio"
                                            className="space_margin_row1 radio_pointer"
                                            onChange={Handletype}
                                            name="orderTypeLimit"
                                            value="2"
                                          />
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">MARKET</span>
                                          </label>
                                          {StopLossTemp ? (
                                            <input
                                              type="radio"
                                              className="space_margin_row1 radio_pointer"
                                              onChange={Handletype}
                                              name="orderTypeLimit"
                                              value="4"
                                              disabled
                                            />
                                          ) : (
                                            <input
                                              type="radio"
                                              className="space_margin_row1 radio_pointer"
                                              onChange={Handletype}
                                              name="orderTypeLimit"
                                              value="4"
                                            />
                                          )}

                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">STOP LOSS</span>
                                          </label>
                                          {SlMarketTemp ? (
                                            <input
                                              type="radio"
                                              className="space_margin_row1 radio_pointer"
                                              onChange={Handletype}
                                              name="orderTypeLimit"
                                              value="3"
                                              disabled
                                            />
                                          ) : (
                                            <input
                                              type="radio"
                                              className="space_margin_row1 radio_pointer"
                                              onChange={Handletype}
                                              name="orderTypeLimit"
                                              value="3"
                                            />
                                          )}
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">SL MARKET</span>
                                          </label>
                                        </div>
                                        
                                      </div>
                                      <div class="row space_margin">
                                        <div class="col">
                                          <label for="radio-button-0">
                                            <span class="frb-title">QTY</span>
                                          </label>
                                          {diffQty ? (
                                            <input
                                              type="number"
                                              className="space_margin_row1 form-control disabled_textbox"
                                              id="orgQuantity"
                                              min="1"
                                              name="quantity"
                                              onChange={(e) => setQuantity(e.target.value)}
                                              value={quantity}
                                              disabled
                                            />
                                          ) : (

                                            <>
                                              {
                                                partialQty ?
                                                <>
                                                  {`(${quantity})`}
                                                 
                                                  <select 
                                                    className="space_margin_row1 form-control" 
                                                    onChange={(e) => setPQuantity(e.target.value)}
                                                  >
                                                    <option value="0">Select</option>
                                                    <option value="10">10%</option>
                                                    <option value="20">20%</option>
                                                    <option value="30">30%</option>
                                                    <option value="40">40%</option>
                                                    <option value="50">50%</option>
                                                    <option value="60">60%</option>
                                                    <option value="70">70%</option>
                                                    <option value="80">80%</option>
                                                    <option value="90">90%</option>
                                                    <option value="100">100%</option>
                                                  </select>
                                                </>
                                                
                                                 : 
                                                <input
                                                  type="number"
                                                  className="space_margin_row1 form-control"
                                                  id="orgQuantity"
                                                  min="1"
                                                  name="quantity"
                                                  onChange={(e) => setQuantity(e.target.value)}
                                                  value={quantity}
                                                />

                                              }
                                            </>
                                            
                                          )}
                                        </div>
                                        <div class="col">
                                          <label
                                            for="radio-button-0"
                                            style={{
                                              display: "flex",
                                              flexDirection: "row",
                                              justifyContent: "space-between",
                                              fontWeight: "700",
                                            }}
                                          >
                                            <span class="frb-title">PRICE</span>
                                            <span style={{ color: "blue", float: "right" }}>
                                              [
                                              {symbol === socketInfo?.symbol
                                                ? socketInfo?.ltp
                                                : localStorage.getItem("symbolPrice")}
                                              ]
                                            </span>
                                          </label>
                                          {OrgPriceTemp ? (
                                            <input
                                              type="number"
                                              id="orgPrice"
                                              className="form-control disabled_textbox"
                                              name="price"
                                              value={orgPrice}
                                              onChange={(e) => setOrgPrice(e.target.value)}
                                              disabled
                                            />
                                          ) : (
                                            <input
                                              type="number"
                                              id="orgPrice"
                                              className="form-control"
                                              name="price"
                                              value={orgPrice}
                                              onChange={(e) => setOrgPrice(e.target.value)}
                                            />
                                          )}
                                        </div>
                                        <div class="col">
                                          <label for="radio-button-0">
                                            <span>TRIG. PRICE</span>
                                          </label>
                                          {trigPriceTemp ? (
                                            <input
                                              type="number"
                                              className="form-control disabled_textbox"
                                              name="tprice"
                                              value={stopPrice}
                                              onChange={(e) => setStopPrice(e.target.value)}
                                              disabled
                                            />
                                          ) : (
                                            <input
                                              type="number"
                                              className="form-control"
                                              name="tprice"
                                              value={stopPrice}
                                              onChange={(e) => setStopPrice(e.target.value)}
                                            />
                                          )}
                                        </div>
                                        <div class="col">
                                          <label for="radio-button-0">
                                            <span class="frb-title">DISCLOSED QTY</span>
                                          </label>
                                          <input
                                            type="number"
                                            id="discQuantity"
                                            className="form-control"
                                            name="dqty"
                                            value={discQuantity}
                                            onChange={(e) => setDiscQuantity(e.target.value)}
                                          />
                                        </div>
                                      </div>

                                    {
                                      OrderTypeExec && OrderTypeExec == 'INTRADAY' 
                                       &&
                                       <>
                                         <div class="row space_margin">
                                          <div class="col">
                                            {!diffQty && (
                                              <>
                                                <label>Accounts</label>
                                                {groupAcc && (
                                                  <Select
                                                    options={groupAccountOption}
                                                    placeholder="Select Group"
                                                    isMulti
                                                    onChange={HandleSelectGroupAccount}
                                                    styles={{width: '50%'}}
                                                  />
                                                ) }
                                                
                                                {!groupAcc && (
                                                  <Select
                                                    options={accountsOption}
                                                    isMulti
                                                    placeholder="Select Account"
                                                    styles={{width: '50%'}}
                                                    onChange={HandleSelectAccount}
                                                    defaultValue={selectedAccountId}
                                                  />
                                                )}
                                                {
                                                  selectedAccountId.label
                                                }
                                              </>
                                            )}
                                            </div>   
                                          </div>
                                        </>
                                    }  

                                    {
                                      OrderTypeExec && OrderTypeExec == 'BO' 
                                       &&
                                       <>
                                         <div class="row space_margin">
                                          <div class="col">
                                            <label for="radio-button-0"><span class="frb-title">TARGET</span></label>
                                            <input
                                              type="number"
                                              className="form-control"
                                              name="tprice"
                                              value={targetPrice}
                                              onChange={(e) => setTargetPrice(e.target.value)}
                                            />  
                                          </div>
                                          <div class="col">
                                            <label for="radio-button-0"><span class="frb-title">STOP LOSS</span></label>
                                              <input
                                                type="number"
                                                id="discQuantity"
                                                className="form-control"
                                                name="dqty"
                                                value={stopLoss}
                                                onChange={(e) => setStopLoss(e.target.value)}
                                              />
                                          </div>
                                          <div class="col">
                                            {!diffQty && (
                                              <>
                                                <label>Accounts</label>
                                                {groupAcc && (
                                                  <Select
                                                    options={groupAccountOption}
                                                    placeholder="Select Group"
                                                    isMulti
                                                    onChange={HandleSelectGroupAccount}
                                                    styles={{width: '50%'}}
                                                  />
                                                ) }
                                                
                                                {!groupAcc && (
                                                  <Select
                                                    options={accountsOption}
                                                    isMulti
                                                    placeholder="Select Account"
                                                    styles={{width: '50%'}}
                                                    onChange={HandleSelectAccount}
                                                    defaultValue={selectedAccountId}
                                                  />
                                                )}
                                              </>
                                            )}
                                            </div>   
                                          </div>
                                        </>
                                    }   

                                    {
                                      OrderTypeExec && OrderTypeExec == 'CO' 
                                       &&
                                       <>
                                         <div class="row space_margin">
                                           <div class="col">
                                            <label for="radio-button-0"><span class="frb-title">STOP LOSS</span></label>
                                              <input
                                                type="number"
                                                id="discQuantity"
                                                className="form-control"
                                                name="dqty"
                                                value={stopLoss}
                                                onChange={(e) => setStopLoss(e.target.value)}
                                              />
                                          </div>
                                          <div class="col">
                                            {!diffQty && (
                                              <>
                                                <label>Accounts</label>
                                                {groupAcc && (
                                                  <Select
                                                    options={groupAccountOption}
                                                    placeholder="Select Group"
                                                    isMulti
                                                    onChange={HandleSelectGroupAccount}
                                                    styles={{width: '50%'}}
                                                  />
                                                ) }
                                                
                                                {!groupAcc && (
                                                  <Select
                                                    options={accountsOption}
                                                    isMulti
                                                    placeholder="Select Account"
                                                    styles={{width: '50%'}}
                                                    onChange={HandleSelectAccount}
                                                    defaultValue={selectedAccountId}
                                                  />
                                                )}
                                              </>
                                            )}
                                            </div>   
                                          </div>
                                        </>
                                    }        
                                     
                                      <div class="row space_margin" style={{ marginTop: '3%' }}>
                                        {day_ioc_box ? (
                                          <>
                                            <div class="col">
                                              <input
                                                type="radio"
                                                name="validity"
                                                className="radio_pointer"
                                                value="DAY"
                                                onChange={(e) => handleValidity(e.target.value)}
                                                defaultChecked
                                                disabled
                                              />
                                              <label
                                                for="radio-button-0"
                                                className="space_margin_row1"
                                              >
                                                <span class="frb-title">DAY</span>
                                              </label>
                                              <input
                                                type="radio"
                                                className="space_margin_row1 radio_pointer"
                                                name="validity"
                                                style={{marginLeft: '8%'}}
                                                onChange={(e) => handleValidity(e.target.value)}
                                                value="IOC"
                                                disabled
                                              />
                                              <label
                                                for="radio-button-0"
                                                className="space_margin_row1"
                                              >
                                                <span class="frb-title">IOC</span>
                                              </label>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div class="col">
                                              <input
                                                type="radio"
                                                name="validity"
                                                className="radio_pointer"
                                                onChange={(e) => handleValidity(e.target.value)}
                                                value="DAY"
                                                defaultChecked
                                              />
                                              <label
                                                for="radio-button-0"
                                                className="space_margin_row1"
                                              >
                                                <span class="frb-title">DAY</span>
                                              </label>
                                              <input
                                                type="radio"
                                                className="space_margin_row1 radio_pointer"
                                                name="validity"
                                                onChange={(e) => handleValidity(e.target.value)}
                                                style={{marginLeft: '8%'}}
                                                value="IOC"
                                              />
                                              <label
                                                for="radio-button-0"
                                                className="space_margin_row1"
                                              >
                                                <span class="frb-title">IOC</span>
                                              </label>
                                            </div>
                                          </>
                                        )}

                                        <div class="col">
                                          <input
                                            type="checkbox"
                                            id="amo"
                                            name="amo"
                                            value="AMO"
                                            onChange={(e) => setOfflineOrder(e.target.value)}
                                          />
                                          <label
                                            for="radio-button-0"
                                            className="space_margin_row1"
                                          >
                                            <span class="frb-title">AMO</span>
                                          </label>
                                        </div>

                                        <div class="col"></div>
                                      </div>

                                      <div class="row space_margin" style={{ marginTop: '3%' }}>
                                       <div class="col">
                                        <div class="form-check form-switch mb-2">
                                          <input
                                            class="form-check-input"
                                            type="checkbox"
                                            onChange={HandleGroupAcc}
                                            role="switch"
                                            id="groupAcc"
                                            style={{ cursor: "pointer" }}
                                          />
                                          <label class="form-check-label" for="groupAcc" style={{ marginLeft: '2%' }}>
                                            Group Acc
                                          </label>
                                          
                                        </div>

                                        <div class="form-check form-switch mb-2">
                                          <input
                                            class="form-check-input"
                                            type="checkbox"
                                            onChange={(e) => setDiffQty(e.target.checked)}
                                            role="switch"
                                            id="diffQty"
                                            style={{ cursor: "pointer" }}
                                          />
                                          <label class="form-check-label" for="diffQty" style={{ marginLeft: '2%' }}>
                                            Diff. Qty
                                          </label>
                                        </div>

                                        <div class="form-check form-switch mb-2">
                                          {
                                            groupAcc ? 
                                              <input
                                                class="form-check-input"
                                                type="checkbox"
                                                onChange={(e) => setMultiplier(e.target.checked)}
                                                role="switch"
                                                id="multiplier"
                                                style={{ cursor: "pointer" }}
                                             />
                                             :
                                              <input
                                                class="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                id="multiplier"
                                                style={{ cursor: "pointer" }}
                                                disabled
                                              />
                                          }
                                          
                                          <label class="form-check-label" for="multiplier" style={{ marginLeft: '2%' }}>
                                            Multiplier
                                          </label>
                                        </div>
                                      </div>
                                      </div>

                                      {diffQty && diffQty === true && (
                                        <>
                                          <div class="col">
                                            <table class="table">
                                              <thead>
                                                <tr>
                                                  <th scope="col">
                                                    <input type="checkbox" />
                                                  </th>
                                                  <th scope="col">Account</th>
                                                  {groupAcc && diffQty && multiplier && (
                                                    <th scope="col">Multiplier</th>
                                                  )}
                                                  <th scope="col">Qty</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {groupAcc && diffQty
                                                  ? groupAccount?.map((item, index) => (
                                                      <tr key={index}>
                                                        <th scope="row">
                                                          <input
                                                            type="checkbox"
                                                            onChange={qtycheckhandle}
                                                            id={`checkqty${item.id}`}
                                                            value={item.id}
                                                          />
                                                        </th>
                                                        <td>{item.name}</td>
                                                        {groupAcc && diffQty && multiplier && (
                                                          <td>{item.multiplier}</td>
                                                        )}
                                                        <td>
                                                          <input
                                                            type="number"
                                                            name={`quantities[${item.id}]`}
                                                            onChange={(e) =>
                                                              diffQuantityCheck(
                                                                e.target.value,
                                                                item.id
                                                              )
                                                            }
                                                            class={`form-control col-lg-4 ${
                                                              qtyCheckbox.includes(
                                                                String(item.id)
                                                              ) == true
                                                                ? "getqty"
                                                                : "disabled_textbox"
                                                            }`}
                                                            placeholder={defaultQty}
                                                            min="1"
                                                          />
                                                        </td>
                                                      </tr>
                                                    ))
                                                  : accounts?.map((item, index) => (
                                                      <tr key={index}>
                                                        <th scope="row">
                                                          <input
                                                            type="checkbox"
                                                            id={`checkqty${item.id}`}
                                                            onChange={qtycheckhandle}
                                                            value={item.id}
                                                            data-keyvalue={item.api_key}
                                                          />
                                                        </th>
                                                        <td>{item.name}</td>
                                                        <td>
                                                          <input
                                                            type="number"
                                                            name={`quantities[${item.id}]`}
                                                            onChange={(e) =>
                                                              diffQuantityCheck(
                                                                e.target.value,
                                                                item.id
                                                              )
                                                            }
                                                            class={`form-control col-lg-4 ${
                                                              qtyCheckbox.includes(
                                                                String(item.id)
                                                              ) == true
                                                                ? "getqty"
                                                                : "disabled_textbox"
                                                            }`}
                                                            placeholder={defaultQty}
                                                            min="1"
                                                          />
                                                        </td>
                                                      </tr>
                                                    ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </>
                                      )}

                                      <div class="row justify-content-between">
                                        <div class="col-4"></div>
                                        <div class="col-4">
                                          {boxtype == 1 ? (
                                            <>
                                              <button
                                                type="button"
                                                onClick={HandleOrder}
                                                className="btn btn-success space_margin_row2"
                                              >
                                                BUY
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                type="button"
                                                onClick={HandleOrder}
                                                className="btn btn-danger space_margin_row2"
                                              >
                                                SELL
                                              </button>
                                            </>
                                          )}
                                          &nbsp;
                                          <button
                                            type="button"
                                            className="btn space_margin_row2"
                                            style={{
                                              background: "#637381",
                                              color: "white",
                                            }}
                                          >
                                            RESET
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    </div>
                                </div>
                              </div>
                            </div>
                            </>
                          )
                        }
        {/* <select class="form-control" style={{ width: '20%' , marginBottom: '2%' }} onChange={onChangeAccount}>
        <optgroup label="ALL" id="ALL">All
         <option value="0">All Accounts</option>
        </optgroup>
        {
          accounts.length > 0 && <>
           <optgroup label="PSEUDO" id="PSEUDO">PSEUDO
           {
              accounts?.map(item => (
                <>
                  <option value={item.client_id}>{item.name}</option>
                </>
              ))
            }
            </optgroup>
          </>
        }

         {
          groupAccount.length > 0 && <>
           <optgroup label="GROUP ACCOUNT" id="GROUPACCOUNT">PSEUDO
            {
              groupAccount?.map(item => (
                <>
                  <option value={item.id}>{item.name}</option>
                </>
              ))
            }
            </optgroup>
          </>
        } 
      </select> */}

        {/* <button type="button" class="btn btn-success" data-bs-toggle="tooltip" data-placement="bottom" title="Refresh the contents"  style={{ width: '100px' , height: '45px', marginLeft: '10px', marginBottom: '10px' }}>Refresh</button> */}

        <Col
          xl={{ span: 12, offset: 0 }}
          lg={{ span: 10, offset: 1 }}
          md={12}
          xs={12}
        >
          <Row>
            <Tabs
              defaultActiveKey="watch_market"
              activeKey={tradingActivekey}
              id="uncontrolled-tab-example"
              className="mb-3"
              onSelect={test}
            >
              <Tab eventKey="watch_market" title="WATCH MARKET">
                <Row className="mt-6">
                  <Col
                    xl={{ span: 12, offset: 0 }}
                    lg={{ span: 10, offset: 1 }}
                    md={12}
                    xs={12}
                  >
                    <Row>
                      <Card className="h-100">
                        {!buyboxShow && (
                          <Select
                            options={marketSymbols}
                            onChange={HandleAddWatchlistItem}
                          />
                        )}
                        {loader && (
                          <div class="loading">Loading&#8230;</div>
                        )}
                        {!buyboxShow && (
                          <Table responsive className="text-nowrap">
                            <thead>
                              <tr>
                                <th scope="col">
                                {
                                  sortName && sortName != 'ASC' ? <a href="#" onClick={() => HandleSort('symbol','ASC')}>Symbol ⬆️</a> 
                                  : <a  href="#" onClick={() => HandleSort('symbol','DESC')}>Symbol ⬇️</a>
                                }
                                </th>
                                <th scope="col">LTP</th>
                                <th scope="col">Buy</th>
                                <th scope="col">Sell</th>
                                <th scope="col">Change Price</th>
                                <th scope="col">Change %</th>
                                <th scope="col">Ask</th>
                                <th scope="col">Bid</th>
                                <th scope="col">Open Price</th>
                                <th scope="col">High Price</th>
                                <th scope="col">Low Price</th>
                                <th scope="col">Volume</th>
                                <th scope="col">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {watchList?.map((data, index) => (
                                <>
                                   <tr jk={data.symbol} key={index} className={subscribeActive == data.symbol && `activeWatchlistSymbolbgColor`}>
                                      <td>
                                        <h6
                                          style={{
                                            color: "blue",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {data.symbol === latestdata.symbol
                                            ?  latestdata.symbol
                                            : localStorage.getItem(
                                                `${data.symbol}`
                                              ) &&
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).symbol}
                                        </h6>
                                      </td>
                                      <td>
                                        <h4
                                          style={{
                                            color: "black",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {data.symbol === latestdata.symbol
                                            ? latestdata.ltp
                                            : localStorage.getItem(
                                                `${data.symbol}`
                                              ) &&
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).ltp}
                                        </h4>
                                      </td>
                                      <td>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            buysellBox(1, data.symbol)
                                          }
                                          style={{
                                            background: "green",
                                            color: "white",
                                            padding: "10%",
                                            width: "54px",
                                            borderRadius: "14%",
                                            border: "1px solid green",
                                          }}
                                        >
                                          BUY
                                        </button>
                                      </td>
                                      <td>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            buysellBox(-1, data.symbol)
                                          }
                                          style={{
                                            background: "red",
                                            color: "white",
                                            padding: "10%",
                                            width: "54px",
                                            borderRadius: "14%",
                                            border: "1px solid red",
                                          }}
                                        >
                                          SELL
                                        </button>
                                      </td>
                                      <td>
                                        <h4
                                          style={{
                                            color: "black",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {data.symbol === latestdata.symbol
                                            ? latestdata.ch
                                            : localStorage.getItem(
                                                `${data.symbol}`
                                              ) &&
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).ch}
                                        </h4>
                                      </td>
                                      <td>
                                        {data.symbol === latestdata.symbol ? (
                                          <>
                                            {Math.sign(latestdata.chp) == -1 ? (
                                              <h4
                                                style={{
                                                  color: "red",
                                                  fontSize: "14px",
                                                  fontWeight: "700",
                                                }}
                                              >
                                                {latestdata.chp}%
                                              </h4>
                                            ) : (
                                              <h4
                                                style={{
                                                  color: "green",
                                                  fontSize: "14px",
                                                  fontWeight: "700",
                                                }}
                                              >
                                                {latestdata.chp}%
                                              </h4>
                                            )}
                                          </>
                                        ) : (
                                          <>
                                            {localStorage.getItem(
                                              `${data.symbol}`
                                            ) &&
                                            Math.sign(
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).chp
                                            ) == -1 ? (
                                              <h4
                                                style={{
                                                  color: "red",
                                                  fontSize: "14px",
                                                  fontWeight: "700",
                                                }}
                                              >
                                                {
                                                  JSON.parse(
                                                    localStorage.getItem(
                                                      `${data.symbol}`
                                                    )
                                                  ).chp
                                                }
                                                %
                                              </h4>
                                            ) : (
                                              <h4
                                                style={{
                                                  color: "green",
                                                  fontSize: "14px",
                                                  fontWeight: "700",
                                                }}
                                              >
                                                {localStorage.getItem(
                                                  `${data.symbol}`
                                                ) &&
                                                  JSON.parse(
                                                    localStorage.getItem(
                                                      `${data.symbol}`
                                                    )
                                                  ).chp}
                                                %
                                              </h4>
                                            )}
                                          </>
                                        )}
                                      </td>
                                      <td>
                                        <h4
                                          style={{
                                            color: "black",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {data.symbol === latestdata.symbol
                                            ? latestdata.ask_price
                                            : localStorage.getItem(
                                                `${data.symbol}`
                                              ) &&
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).ask_price}
                                        </h4>
                                      </td>
                                      <td>
                                        <h4
                                          style={{
                                            color: "black",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {data.symbol === latestdata.symbol
                                            ? latestdata.bid_price
                                            : localStorage.getItem(
                                                `${data.symbol}`
                                              ) &&
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).bid_price}
                                        </h4>
                                      </td>
                                      <td>
                                        <h4
                                          style={{
                                            color: "black",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {data.symbol === latestdata.symbol
                                            ? latestdata.open_price
                                            : localStorage.getItem(
                                                `${data.symbol}`
                                              ) &&
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).open_price}
                                        </h4>
                                      </td>
                                      <td>
                                        <h4
                                          style={{
                                            color: "black",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {data.symbol === latestdata.symbol
                                            ? latestdata.high_price
                                            : localStorage.getItem(
                                                `${data.symbol}`
                                              ) &&
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).high_price}
                                        </h4>
                                      </td>
                                      <td>
                                        <h4
                                          style={{
                                            color: "black",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {data.symbol === latestdata.symbol
                                            ? latestdata.low_price
                                            : localStorage.getItem(
                                                `${data.symbol}`
                                              ) &&
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).low_price}
                                        </h4>
                                      </td>
                                      <td>
                                        <h4
                                          style={{
                                            color: "purple",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                          }}
                                        >
                                          {data.symbol === latestdata.symbol
                                            ? latestdata.vol_traded_today
                                            : localStorage.getItem(
                                                `${data.symbol}`
                                              ) &&
                                              JSON.parse(
                                                localStorage.getItem(
                                                  `${data.symbol}`
                                                )
                                              ).vol_traded_today}
                                        </h4>
                                      </td>
                                      <td>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            HandleDeleteSymbol(
                                              data.symbol,
                                              data.id
                                            )
                                          }
                                          style={{
                                            background: "red",
                                            color: "white",
                                            padding: "10%",
                                            width: "40px",
                                            border: "1px solid red",
                                          }}
                                        >
                                          <Trash size="18px" />
                                        </button>
                                      </td>
                                    </tr>
                                 
                                </>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      
                      </Card>
                    </Row>
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="order" title="ORDERS">
                {loader && (
                 <div class="loading">Loading&#8230;</div>
                )}
                {!modifyBox && (
                  <Card className="h-100">
                    <Col>
                      <div>
                        <select
                          style={{
                            width: "300px",
                            height: "39px",
                            marginBottom: "2%",
                            cursor: 'pointer',
                            borderRadius: '5%',
                            border: '2px solid #39b8cd',
                            color: 'blue'
                          }}
                          onChange={filterOrder}
                        >
                          <option value="" style={{cursor: 'pointer' }}>ALL</option>
                          <option value="6" style={{cursor: 'pointer' }}>OPEN</option>
                          <option value="2" style={{cursor: 'pointer' }}>COMPLETE</option>
                          <option value="1" style={{cursor: 'pointer' }}>CANCELLED</option>
                          <option value="5" style={{cursor: 'pointer' }}>REJECTED</option>
                        </select>
                
                          <select
                            style={{
                              width: "300px",
                              height: "39px",
                              marginBottom: "2%",
                              marginLeft: "2%",
                              borderRadius: '5%',
                              border: '2px solid #39b8cd',
                              color: 'blue'
                            }}
                            onChange={onChangeAccount}
                          >
                            {
                              decodedNew?.role_id == '1' &&
                              <optgroup label="ALL" id="ALL">
                                All
                                <option value="">All Accounts</option>
                              </optgroup>
                            }
                           
                            {accounts.length > 0 && (
                              <>
                                <optgroup label="PSEUDO" id="PSEUDO">
                                  PSEUDO
                                  {accounts?.map((item) => (
                                    <> 
                                      {
                                        <option value={item.client_id}>{item.name}</option>
                                      }
                                    </>
                                  ))}
                                </optgroup>
                              </>
                            )}
                          </select>
                       
                      </div>

                      <button
                        class="btn btn-info"
                        style={{
                          width: "100px",
                          marginRight: "10px",
                          background: "#637381",
                          color: "white",
                          marginBottom: "10px",
                        }}
                      >
                        RESET
                      </button>
                      <button
                        class="btn btn-info"
                        data-id="checkall"
                        value="checkall"
                        onClick={onChangeModel}
                        style={{
                          width: "100px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        ALL
                      </button>
                      <button
                        class="btn btn-info"
                        data-id="uncheckall"
                        value="uncheckall"
                        onClick={onChangeModel}
                        style={{
                          width: "100px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        NONE
                      </button>
                      <button
                        class="btn btn-info"
                        onClick={HandleOrderModify}
                        style={{
                          width: "100px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        MODIFY
                      </button>
                      <button
                        class="btn btn-success"
                        style={{ width: "100px", marginRight: "10px",marginBottom: "10px" }}
                        onClick={HandleCancel}
                      >
                        CANCEL
                      </button>
                      <button
                        class="btn btn-warning"
                        style={{ width: "110px",marginRight: "10px", marginBottom: "10px" }}
                        onClick={HandleOrderRefresh}
                      >
                        REFRESH
                      </button>
                    </Col>
                    <div>
                      <button
                        class="btn"
                        onClick={exportOrdersToExcel}
                        data-bs-toggle="tooltip"
                        data-placement="bottom"
                        title="Download in Excel format"
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          width: "100px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        EXCEL
                      </button>
                      <CSVLink
                        class="btn"
                        data-bs-toggle="tooltip"
                        data-placement="bottom"
                        title="Download in CSV format"
                        data={orders}
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          width: "100px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        CSV
                      </CSVLink>
                    </div>
                   
                    <Table responsive className="text-nowrap">
                      <thead className="table-light" style={{width:'100px'}}>
                        <tr>
                          <th scope="col">
                            <input
                              style={{
                                width: "60px",
                                height: "21px",
                                cursor: "pointer",
                              }}
                              type="checkbox"
                              className="custom-control-input checkbox-input"
                              data-id="checkall"
                              id="checkall"
                              value="checkall"
                              onChange={onChangeModel}
                              checked={
                                checkedModelList.length === checklists.length
                              }
                            />
                          </th>
                          <th scope="col">Symbols</th>
                          <th scope="col">Client Id</th>
                          <th scope="col">Order Id</th>
                          <th scope="col">Type Order</th>
                          <th scope="col">Traded Price</th>
                          <th scope="col">Source</th>
                          <th scope="col">Quantity</th>
                          <th scope="col">Status</th>
                          <th scope="col">Order Date Time</th>
                          <th scope="col"><div style={{ width: '100px' }}>Message</div></th>
                        </tr>
                      </thead>
                      <tbody>
                        {loader ? (
                          <>
                           <div class="loading">Loading&#8230;</div>
                          </>
                        ) : (
                          orders?.map((packageItem, index) => {
                            return (
                              <tr key={index} className={`${packageItem.status == "6" ? 'table-info' : ''}`}>
                                <td>
                                 <input
                                  style={{
                                    width: "60px",
                                    height: "21px",
                                    cursor: "pointer",
                                  }}
                                    type="checkbox"
                                    className="custom-control-input checkbox-input"
                                    data-id={packageItem.order_id}
                                    data-client_id={packageItem.client_id}
                                    id={packageItem.order_id}
                                    value={packageItem.order_id}
                                    onChange={onChangeModel}
                                    checked={checkedModelList.includes(
                                      packageItem.order_id
                                    )}
                                  />
                                </td>
                                <td className="align-middle">
                                  {packageItem.symbol}
                                </td>
                                <td className="align-middle">
                                  {packageItem.Client_id}
                                </td>
                                <td className="align-middle">
                                  {packageItem.order_id}
                                </td>
                                <td className="align-middle">
                                  {packageItem.type == "1" && `Limit Order (${packageItem.product_type})`}
                                  {packageItem.type == "2" && `Market Order (${packageItem.product_type})`}
                                  {packageItem.type == "3" &&
                                    `Stop Order (SL-M) (${packageItem.product_type})`}
                                  {packageItem.type == "4" &&
                                    `Stoplimit Order (SL-L) (${packageItem.product_type})`}
                                </td>
                                <td className="align-middle">
                                  {
                                    packageItem.status === "6" ?
                                    packageItem.limit_price
                                    :
                                    packageItem.traded_price
                                  }
                                </td>
                                <td className="align-middle">
                                  {packageItem.source === "API"
                                    ? "API"
                                    : "MOBILE"}
                                </td>
                                <td className="align-middle">
                                  {packageItem.qty}
                                </td>
                                <td className="align-middle">
                                  {packageItem.status == 1 && "Canceled"}
                                  <h5
                                    style={{
                                      marginLeft: "10px",
                                      color: "green",
                                      fontFamily: "monospace",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {packageItem.side == 1 && "Buy"}
                                  </h5>
                                  <h5
                                    style={{
                                      marginLeft: "10px",
                                      color: "red",
                                      fontFamily: "monospace",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {packageItem.side == -1 && "Sell"}
                                  </h5>
                                  {packageItem.status == 3 &&
                                    "Not used currently"}
                                  {packageItem.status == 4 && "Transit"}
                                  <h5
                                    style={{
                                      marginLeft: "10px",
                                      color: "black",
                                      fontFamily: "monospace",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {packageItem.status == 5 && "Rejected"}
                                  </h5>
                                  {packageItem.status == 6 && "Pending"}
                                  {packageItem.status == 7 && "Expired"}
                                </td>
                                <td>{packageItem.order_date_time}</td>
                                <td className="">
                                  {packageItem.message}
                                </td>
                              </tr>
                            );
                          })
                        )}
                        {loader ? (
                          <>
                           <div class="loading">Loading&#8230;</div>
                          </>
                        ) : (
                          orders.length == 0 && (
                            <>
                              <tr>
                                <td colSpan="10">No result found</td>
                              </tr>
                            </>
                          )
                        )}
                      </tbody>
                    </Table>
                   
                  </Card>
                )}
                {modifyBox && (
                  <>
                    <div>Modify Box  {symbol ===
                        JSON.parse(
                          localStorage.getItem(`${symbol}`)
                        ).symbol && (
                        <>
                          <h4 style={{color: 'blue'}}>{symbol}: {JSON.parse(localStorage.getItem(`${symbol}`)).ltp}</h4>
                        </>
                      )}</div>
                    
                      
                    <div class="modal-body">
                      <div class="mb-3">
                        <label for="recipient-name" class="col-form-label">
                          Price:
                        </label>
                        <input
                          type="number"
                          class="form-control"
                          id="recipient-price"
                          onChange={(e) => setModifyLimitPrice(e.target.value)}
                        />
                      </div>
                      <div class="mb-3">
                        <label for="message-text" class="col-form-label">
                          Quantity:
                        </label>
                        <input
                          type="number"
                          class="form-control"
                          id="recipient-qty"
                          onChange={(e) => setModifyQty(e.target.value)}
                        />
                      </div>
                      <div class="mb-3">
                        <label for="recipient-name" class="col-form-label">
                          Trig. Price:
                        </label>
                        <input
                          type="number"
                          class="form-control"
                          id="recipient-tprice"
                          onChange={(e) => setModifyStopPrice(e.target.value)}
                        />
                      </div>
                      <div class="mb-3">
                        <label for="recipient-name" class="col-form-label">
                          Order Type:
                        </label>
                        <select
                          name="orderType"
                          id="modifyOrderType"
                          onChange={(e) => setModifyType(e.target.value)}
                          class="form-control form-control-primary"
                        >
                          <option value="" selected="">
                            NO_CHANGE
                          </option>
                          <option value="1">LIMIT</option>
                          <option value="2">MARKET</option>
                          <option value="4">STOP_LOSS</option>
                          <option value="3">SL_MARKET</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <button
                          type="button"
                          class="btn btn-primary"
                          onClick={onChangeModifyBox}
                        >
                          cancel
                        </button>{" "}
                        &nbsp;
                        <button
                          type="button"
                          class="btn btn-primary"
                          onClick={() =>
                            modifyOrderinitiate(modifyId, modifyClient)
                          }
                        >
                          Modify
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </Tab>
              <Tab eventKey="position" title="POSITIONS">
                <Card className="h-100">
                  {loader && (
                    <div class="loading">Loading&#8230;</div>
                  )}
                  <Col>
                    <div>
                      <select
                        style={{
                          width: "300px",
                          height: "39px",
                          marginBottom: "10px",
                          borderRadius: '5%',
                          border: '2px solid #39b8cd',
                          color: 'blue'
                        }}
                        onChange={filterPosition}
                      >
                        <option value="" selected={filterByStatusPosition === ""}>
                          ALL
                        </option>
                        <option value="1" selected={"1" === filterByStatusPosition}>
                          OPEN
                        </option>
                        <option value="0" selected={"0" === filterByStatusPosition}>
                          CLOSED
                        </option>
                      </select>   
                      <select
                        style={{
                          width: "300px",
                          height: "39px",
                          marginBottom: "2%",
                          marginLeft: "2%",
                          borderRadius: '5%',
                          border: '2px solid #39b8cd',
                          color: 'blue'
                        }}
                        onChange={onChangeAccount}
                      >
                        {
                          decodedNew?.role_id == '1' &&
                          <optgroup label="ALL" id="ALL">
                            All
                           <option value="">All Accounts</option>
                          </optgroup>
                        }
                        {accounts.length > 0 && (
                          <>
                            <optgroup label="PSEUDO" id="PSEUDO">
                              PSEUDO
                              {accounts?.map((item) => (
                                <>
                                  <option value={`${item.client_id}-act`}>
                                    {item.name}
                                  </option>
                                </>
                              ))}
                            </optgroup>
                          </>
                        )}
                        {groupAccount.length > 0 && (
                          <>
                            <optgroup label="GROUP" id="GROUP">
                              GROUP ACCOUNT
                              {groupAccount?.map((item) => (
                                <>
                                  <option value={`${item.id}-grp`}>
                                    {item.name}
                                  </option>
                                </>
                              ))}
                            </optgroup>
                          </>
                        )}
                      </select>
                      <select
                        style={{
                          width: "300px",
                          height: "39px",
                          marginBottom: "10px",
                          marginLeft:'2%',
                          borderRadius: '5%',
                          border: '2px solid #39b8cd',
                          color: 'blue'
                        }}
                        id="positionSymbol"
                        onChange={filterBySymbol}
                        defaultValue={filterBySymbolPosition}
                      >
                        <option value="">ALL SYMBOLS</option>
                        {
                          uniqueSymbolsTags?.map((item,inde) => (
                            <option key={inde} value={item}>{item}</option>
                          ))
                        }
                      </select>

                    </div>

                    {/* <button
                      class="btn btn-info"
                      onClick={resetPosition}
                      data-bs-toggle="tooltip"
                      data-placement="bottom"
                      title="Reset positions filter!"
                      style={{
                        width: "100px",
                        marginRight: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      RESET
                    </button> */}

                    <button
                      class="btn btn-info"
                      data-id="checkall"
                      value="checkall"
                      data-bs-toggle="tooltip"
                      data-placement="bottom"
                      title="Select all positions (If you have filtered the table, then only the filtered positions will be selected.)"
                      onClick={onChangePositionModel}
                      style={{
                        width: "100px",
                        marginRight: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      ALL
                    </button>
                    <button
                      class="btn btn-info"
                      data-id="uncheckall"
                      data-bs-toggle="tooltip"
                      data-placement="bottom"
                      title="Deselect all positions"
                      value="uncheckall"
                      onClick={onChangePositionModel}
                      style={{
                        width: "100px",
                        marginRight: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      NONE
                    </button>
                    <button
                      class="btn btn-info"
                      data-bs-toggle="tooltip"
                      data-placement="bottom"
                      title="Square-off one or more positions at market rate!"
                      onClick={HandlePositionExit}
                      style={{
                        width: "160px",
                        marginRight: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      SQ. POS. MKT.
                    </button>
                    <button
                      class="btn btn-success"
                      data-bs-toggle="tooltip"
                      data-placement="bottom"
                      title="Square-off one or more accounts (portfolios) with a single click!"
                      style={{ width: "140px", marginBottom: "10px" }}
                      onClick={HandleGroupAccount}
                    >
                      SQ. ACCOUNT
                    </button>
                    <button
                      class="btn btn-success"
                      data-bs-toggle="tooltip"
                      data-placement="bottom"
                      title="Square-off one or more accounts (portfolios) with a single click!"
                      style={{ marginLeft: '10px',width: '200px', marginBottom: "10px" }}
                     
                    >
                      PARTIAL SQUARE OFF
                    </button>
                  </Col>
                  <div>
                    <button
                      class="btn"
                      onClick={exportPositionsToExcel}
                      data-bs-toggle="tooltip"
                      data-placement="bottom"
                      title="Download in Excel format"
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        width: "100px",
                        marginRight: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      EXCEL
                    </button>
                    <CSVLink
                      class="btn"
                      data-bs-toggle="tooltip"
                      data-placement="bottom"
                      title="Download in CSV format"
                      data={positions}
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        width: "100px",
                        marginRight: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      CSV
                    </CSVLink>
                  </div>
                  {!GroupAccountSquareOff && (
                    <Table responsive striped>
                      <thead>
                        {Overallpositions.length > 0 && (
                          <tr>
                            <td>
                              Total Scripts :{" "}
                              {parseFloat(
                                Overallpositions[0].totalCount
                              ).toFixed(2)}
                            </td>
                            <td>
                              Open:{" "}
                              {parseFloat(
                                Overallpositions[0].totalopen
                              ).toFixed(2)}
                            </td>
                            <td>
                              Total PL:
                              {Overallpositions[0].totalPnl > 0 ? (
                                <span style={{ color: "green" }}>
                                  ₹
                                  {parseFloat(
                                    Overallpositions[0].totalPnl
                                  ).toFixed(2)}
                                </span>
                              ) : (
                                <span style={{ color: "red" }}>
                                  ₹
                                  {parseFloat(
                                    Overallpositions[0].totalPnl
                                  ).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td>
                              PL Realized:
                              {Overallpositions[0].totalRpnl > 0 ? (
                                <span style={{ color: "green" }}>
                                  ₹
                                  {parseFloat(
                                    Overallpositions[0].totalRpnl
                                  ).toFixed(2)}
                                </span>
                              ) : (
                                <span style={{ color: "red" }}>
                                  ₹
                                  {parseFloat(
                                    Overallpositions[0].totalRpnl
                                  ).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td>
                              PL UnRealized:
                              {Overallpositions[0].totalUPnl >= 0 ? (
                                <span style={{ color: "green" }}>
                                  ₹
                                  {parseFloat(
                                    Overallpositions[0].totalUPnl
                                  ).toFixed(2)}
                                </span>
                              ) : (
                                <span style={{ color: "red" }}>
                                  ₹
                                  {parseFloat(
                                    Overallpositions[0].totalUPnl
                                  ).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td colSpan={9}></td>
                          </tr>
                        )}

                        <tr>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                           
                            <input
                              style={{
                                width: "100%",
                                height: "21px",
                                cursor: "pointer",
                              }}
                              type="checkbox"
                              className="custom-control-input checkbox-input"
                              data-id="checkall"
                              id="checkall"
                              value="checkall"
                              onChange={onChangePositionModel}
                              kl={poschecklists.length == 0 ? 'false': 'true'}
                              checked={checkedPosModelList.length === poschecklists.length}
                            />
                            
                            &nbsp;&nbsp;
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Symbol
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            ACC. ID
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Product
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Status
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Net Qty
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Avg. Price
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Ltp
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Real P&L
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Unreal P&L
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Total P&L
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            (%Ch)
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Buy Qty
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Buy Avg.
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Sell Qty
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Sell Avg.
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Net Qty
                          </th>
                          <th
                            className="align-middle"
                            style={{ color: "black", fontWeight: "700" }}
                          >
                            Net Avg.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {PositionsViewData?.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td className="align-middle">
                                {checkedPosModelList.length ===
                                poschecklists.length ? (
                                  <input
                                    style={{
                                      width: "100%",
                                      height: "21px",
                                      cursor: "pointer",
                                    }}
                                    type="checkbox"
                                    className="custom-control-input checkbox-input"
                                    data-id={item.id}
                                    data-client_id={item.client_id}
                                    id={item.id}
                                    value={item.id}
                                    onChange={onChangePositionModel}
                                    checked={checkedPosModelList.includes(item.id)}
                                  />
                                ) : (
                                  <input
                                    style={{
                                      width: "100%",
                                      height: "21px",
                                      cursor: "pointer",
                                    }}
                                    type="checkbox"
                                    className="custom-control-input checkbox-input"
                                    data-id={item.id}
                                    data-client_id={item.client_id}
                                    id={item.id}
                                    value={item.id}
                                    checked={checkedPosModelList.includes(item.id)}
                                    onChange={onChangePositionModel}
                                  />
                                )}
                              </td>
                              <td className="align-middle">{item.symbol}</td>
                              <td className="align-middle">
                                {item.account_id}
                              </td>
                              <td className="align-middle">
                                {item.product_type}
                              </td>
                              <td className="align-middle">
                                {item.side == 0 && 
                                  <>
                                    <h5 style={{background: '#10abdd', padding: '10%', color: 'white', fontWeight: '700'}}>CLOSED</h5> 
                                  </>
                                }
                                {item.side == -1 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        buysellBox(1, item.symbol, item.net_qty, item.account_id,'partial')
                                      }
                                      style={{
                                        background: "green",
                                        color: "white",
                                        padding: "10%",
                                        width: "60px",
                                        borderRadius: "14%",
                                        border: "1px solid green",
                                      }}
                                    >
                                      BUY
                                    </button>
                                  </>
                                )}
                                {item.side == 1 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        buysellBox(
                                          -1,
                                          item.symbol,
                                          item.net_qty,
                                          item.account_id,
                                          'partial'
                                        )
                                      }
                                      style={{
                                        background: "red",
                                        color: "white",
                                        padding: "10%",
                                        width: "60px",
                                        borderRadius: "14%",
                                        border: "1px solid red",
                                      }}
                                    >
                                      SELL
                                    </button>
                                  </>
                                )}
                              </td>
                              <td className="align-middle">{item.net_qty}</td>
                              <td className="align-middle">{item.side == "-1" ? item.sell_avg : item.buy_avg}</td>
                              <td className="align-middle">
                                {item.symbol ===
                                  JSON.parse(
                                    localStorage.getItem(`${item.symbol}`)
                                  ).symbol && (
                                  <>
                                    {
                                      JSON.parse(
                                        localStorage.getItem(`${item.symbol}`)
                                      ).ltp
                                    }
                                  </>
                                )}
                              </td>
                              <td className="align-middle">
                                {/* Realized P&L: */}
                                {item.side == 0 ? (
                                  item.realized_profit > 0 ? (
                                    <span style={{ color: "green" }}>
                                      {" "}
                                      {parseFloat(item.realized_profit).toFixed(
                                        2
                                      )}
                                    </span>
                                  ) : (
                                    <span style={{ color: "red" }}>
                                      {" "}
                                      {parseFloat(item.realized_profit).toFixed(
                                        2
                                      )}
                                    </span>
                                  )
                                ) : item.symbol ===
                                    JSON.parse(
                                      localStorage.getItem(`${item.symbol}`)
                                    ).symbol &&

                                    <>
                                      {
                                            item.side == "-1" ?
                                              <>
                                                {
                                                  item.buy_avg == "0" ?
                                                  <span style={{ color: "green" }}>{parseFloat(0).toFixed(2)}</span>
                                                   :
                                                    (item.sell_avg - item.buy_avg) *
                                                      item.sell_qty >
                                                      0 ? (
                                                    <span style={{ color: "green" }}>
                                                      {" "}
                                                      {parseFloat(
                                                        (item.sell_avg - item.buy_avg) *
                                                          item.sell_qty
                                                      ).toFixed(2)}
                                                    </span>
                                                  ) : (
                                                    <span style={{ color: "red" }}>
                                                      {" "}
                                                      {parseFloat(
                                                        (item.sell_avg - item.buy_avg) *
                                                          item.sell_qty
                                                      ).toFixed(2)}
                                                    </span>
                                                  )
                                                }
                                              </>
                                      :
                                      
                                        (item.sell_avg - item.buy_avg) *
                                            item.sell_qty >
                                            0 ? (
                                          <span style={{ color: "green" }}>
                                            {" "}
                                            {parseFloat(
                                              (item.sell_avg - JSON.parse(
                                                localStorage.getItem(`${item.symbol}`)
                                              ).ltp) *
                                                item.sell_qty
                                            ).toFixed(2)}
                                          </span>
                                        ) : (
                                          <span style={{ color: "red" }}>
                                            {" "}
                                            {parseFloat(
                                              (item.sell_avg - item.buy_avg) *
                                                item.sell_qty
                                            ).toFixed(2)}
                                          </span>
                                        )
                                      }
                                  </>
                                 }
                              </td>
                              <td className="align-middle">
                                {/* UnRealized P&L: */}
                                {item.side == 0 ? (
                                  parseFloat(0).toFixed(2)
                                ) : item.symbol ===
                                    JSON.parse(
                                      localStorage.getItem(`${item.symbol}`)
                                    ).symbol &&

                                    <>
                                      {
                                        item.side == "-1" 
                                        ?
                                        (JSON.parse(
                                          localStorage.getItem(`${item.symbol}`)
                                        ).ltp -
                                          item.sell_avg) *
                                          item.net_qty >
                                          0 ? (
                                        <span style={{ color: "green" }}>
                                          {" "}
                                          {parseFloat(
                                            (JSON.parse(
                                              localStorage.getItem(`${item.symbol}`)
                                            ).ltp -
                                              item.sell_avg) *
                                              item.net_qty
                                          ).toFixed(2)}{" "}
                                        </span>
                                      ) : (
                                        <span style={{ color: "red" }}>
                                          {" "}
                                          {parseFloat(
                                            (JSON.parse(
                                              localStorage.getItem(`${item.symbol}`)
                                            ).ltp -
                                              item.sell_avg) *
                                              item.net_qty
                                          ).toFixed(2)}{" "}
                                        </span>
                                      )
                                      :
                                      (JSON.parse(
                                        localStorage.getItem(`${item.symbol}`)
                                      ).ltp -
                                        item.buy_avg) *
                                        item.net_qty >
                                        0 ? (
                                      <span style={{ color: "green" }}>
                                        {" "}
                                        {parseFloat(
                                          (JSON.parse(
                                            localStorage.getItem(`${item.symbol}`)
                                          ).ltp -
                                            item.buy_avg) *
                                            item.net_qty
                                        ).toFixed(2)}{" "}
                                      </span>
                                    ) : (
                                      <span style={{ color: "red" }}>
                                        {" "}
                                        {parseFloat(
                                          (JSON.parse(
                                            localStorage.getItem(`${item.symbol}`)
                                          ).ltp -
                                            item.buy_avg) *
                                            item.net_qty
                                        ).toFixed(2)}{" "}
                                      </span>
                                    )
                                      }
                                    </>
                                 }
                              </td>
                              <td className="align-middle">
                                {/* Total P&L */}
                                {item.side != 0 &&
                                  ((item.sell_avg - item.buy_avg) *
                                    item.sell_qty +
                                    (JSON.parse(
                                      localStorage.getItem(`${item.symbol}`)
                                    ).ltp -
                                      item.buy_avg) *
                                      item.net_qty >
                                  0 ? (
                                    <span style={{ color: "green" }}>
                                      {" "}
                                      {parseFloat(
                                        (item.sell_avg - item.buy_avg) *
                                          item.sell_qty +
                                          (JSON.parse(
                                            localStorage.getItem(
                                              `${item.symbol}`
                                            )
                                          ).ltp -
                                            item.buy_avg) *
                                            item.net_qty
                                      ).toFixed(2)}
                                    </span>
                                  ) : (
                                    <span style={{ color: "red" }}>
                                      {"  "}
                                      {parseFloat(
                                        (item.sell_avg - item.buy_avg) *
                                          item.sell_qty +
                                          (JSON.parse(
                                            localStorage.getItem(
                                              `${item.symbol}`
                                            )
                                          ).ltp -
                                            item.buy_avg) *
                                            item.net_qty
                                      ).toFixed(2)}
                                    </span>
                                  ))}
                                {item.side == 0 &&
                                  (item.realized_profit > 0 ? (
                                    <span style={{ color: "green" }}>
                                      {" "}
                                      {parseFloat(item.realized_profit).toFixed(
                                        2
                                      )}
                                    </span>
                                  ) : (
                                    <span style={{ color: "red" }}>
                                      {" "}
                                      {parseFloat(item.realized_profit).toFixed(
                                        2
                                      )}
                                    </span>
                                  ))}
                                <br />
                              </td>
                              <td>
                                {item.side != 0 &&
                                  item.symbol ===
                                    JSON.parse(
                                      localStorage.getItem(`${item.symbol}`)
                                    ).symbol &&
                                    <>
                                      {item.side == "-1" 
                                        ?
                                        parseFloat(
                                          ((item.sell_avg - JSON.parse(localStorage.getItem(`${item.symbol}`)).ltp) * 100) / item.sell_avg).toFixed(2)
                                        :
                                        parseFloat(
                                          ((JSON.parse(
                                            localStorage.getItem(`${item.symbol}`)
                                          ).ltp -
                                            item.buy_avg) *
                                            100) /
                                            item.buy_avg
                                        ).toFixed(2)
                                      }
                                    </>
                                  }
                                {item.side == 0 && <>--</>}
                              </td>

                              <td className="align-middle">{item.buy_qty}</td>
                              <td className="align-middle">{item.buy_avg}</td>
                              <td className="align-middle">{item.sell_qty}</td>
                              <td className="align-middle">
                                {parseFloat(item.sell_avg).toFixed(2)}
                              </td>
                              <td className="align-middle">
                                {parseFloat(item.net_qty).toFixed(2)}
                              </td>
                              <td className="align-middle">
                                {parseFloat(item.net_avg).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                        {positions.length == 0 && (
                          <>
                            <tr>
                              <td colSpan="10">No result found</td>
                            </tr>
                          </>
                        )}
                        {loader && (
                          <div class="loading">Loading&#8230;</div>
                        )}
                      </tbody>
                    </Table>
                  )}
                </Card>

                {GroupAccountSquareOff && (
                  <>
                    <h3 style={{ color: "black", fontWeight: 700 }}>
                      GROUP ACCOUNT
                    </h3>
                    <div class="modal-body">
                      <div class="mb-3">
                        <div class="form-check form-switch mb-2">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            onChange={HandlePositionGroupAcc}
                            role="switch"
                            id="groupAcc"
                            style={{ cursor: "pointer" }}
                          />
                          <label class="form-check-label" for="groupAcc">
                            Group Acc
                          </label>
                        </div>
                      </div>
                      <div class="mb-3">
                        <div class="col">
                          <label>Accounts</label>
                          {groupPositionAcc ? (
                            <Select
                              options={groupAccountOption}
                              placeholder="Select Group"
                              isMulti
                              onChange={HandleSelectGroupAccount}
                            />
                          ) : (
                            <Select
                              options={accountsOption}
                              isMulti
                              placeholder="Select Account"
                              onChange={HandleSelectAccount}
                              defaultValue={selectedAccountId}
                            />
                          )}
                        </div>
                      </div>
                      <div class="mb-3">
                        <button
                          type="button"
                          class="btn btn-primary"
                          onClick={BacktoPositions}
                        >
                          cancel
                        </button>{" "}
                        &nbsp;
                        <button
                          type="button"
                          class="btn btn-primary"
                          onClick={SquareOffinitiate}
                        >
                          Square Off
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </Tab>
              <Tab eventKey="summary" title="SUMMARY">
              <div>
                  <select
                    style={{
                      width: "300px",
                      height: "39px",
                      marginBottom: "2%",
                      marginLeft: "2%",
                      borderRadius: '5%',
                      border: '2px solid #39b8cd',
                      color: 'blue'
                    }}
                    onChange={onChangeAccount}
                  >
                  {
                    decodedNew?.role_id == '1' &&
                      <optgroup label="ALL" id="ALL">
                        All
                        <option value="">All Accounts</option>
                      </optgroup>
                  }
                  {accounts.length > 0 && (
                  <>
                    <optgroup label="PSEUDO" id="PSEUDO">
                      PSEUDO
                      {accounts?.map((item) => (
                      <>
                        <option value={item.client_id}>
                          {item.name}
                        </option>
                      </>
                    ))}
                    </optgroup>
                  </>
                )}
              </select>  
              </div>
                <Card className="h-100">
                {loader && (
                   <div class="loading">Loading&#8230;</div>
                  )}
                  <div class="card">
                    <div class="card-header">Orders Analytics</div>
                    <div style={{ display: "flex" }}>
                      <div class="card-body">
                        <h5 class="card-title">Total</h5>
                        <a href="#" class="btn btn-primary">
                          {OrderTotal}
                        </a>
                      </div>
                      <div class="card-body">
                        <h5 class="card-title">Open</h5>
                        <a href="#" class="btn btn-primary">
                          {OrderOpen}
                        </a>
                      </div>
                      <div class="card-body">
                        <h5 class="card-title">Complete</h5>
                        <a href="#" class="btn btn-primary">
                          {OrderCompleted}
                        </a>
                      </div>
                      <div class="card-body">
                        <h5 class="card-title">Cancelled</h5>
                        <a href="#" class="btn btn-primary">
                          {OrderCancel}
                        </a>
                      </div>
                      <div class="card-body">
                        <h5 class="card-title">Rejected</h5>
                        <a href="#" class="btn btn-primary">
                          {OrderReject}
                        </a>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div class="card">
                    <div class="card-header">Positions Analytics [NET]</div>
                    <div style={{ display: "flex" }}>
                      {Overallpositions.length > 0 && (
                        <>
                          <div class="card-body">
                            <h5 class="card-title">Total Scripts :</h5>
                            <a href="#" class="btn btn-primary">
                              
                              {parseFloat(
                                Overallpositions[0].totalCount
                              ).toFixed(2)}
                            </a>
                          </div>

                          <div class="card-body">
                            <h5 class="card-title">Open :</h5>
                            <a href="#" class="btn btn-primary">
                              
                              {parseFloat(
                                Overallpositions[0].totalopen
                              ).toFixed(2)}
                            </a>
                          </div>

                          <div class="card-body">
                            <h5 class="card-title">Total PL :</h5>
                              {Overallpositions[0].totalPnl >= 0 ? (
                                <>
                                 <a href="#" class="btn btn-success">
                                    <CurrencyRupee size={18} />{parseFloat(
                                    Overallpositions[0].totalPnl
                                  ).toFixed(2)}
                                   </a>
                                </>
                              ) : (
                                <>
                                  <a href="#" class="btn btn-danger">
                                    <CurrencyRupee size={18} /> 
                                    {parseFloat(
                                    Overallpositions[0].totalPnl
                                  ).toFixed(2)}
                                   </a>
                                </>
                              )}
                          </div>

                          <div class="card-body">
                            <h5 class="card-title">PL UnRealized:</h5>
                            {Overallpositions[0].totalUPnl > 0 ? (
                            <>
                              <a href="#" class="btn btn-success">
                                <CurrencyRupee size={18} />
                                {parseFloat(Overallpositions[0].totalUPnl).toFixed(2)}
                              </a>
                            </>
                            ) : (
                            <>
                              <a href="#" class="btn btn-success">
                                <CurrencyRupee size={18} />
                                {parseFloat(Overallpositions[0].totalUPnl).toFixed(2)}
                              </a>
                            </>
                           )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <hr />

                  <div class="card">
                    <div class="card-header">Positions Analytics [DAY]</div>
                    <Table responsive className="text-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Symbol</th>
                          <th>Total Qty</th>
                          <th>LTP</th>
                          <th>Curr. Val.</th>
                          <th>T1 Qty.</th>
                          <th>PnL</th>
                          <th>Product</th>
                          <th>ISIN</th>
                          <th>Collateral Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings?.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td className="align-middle">{item.symbol}</td>
                              <td className="align-middle">{item.quantity}</td>
                              <td className="align-middle">{item.ltp}</td>
                              <td className="align-middle">{item.marketVal}</td>
                              <td className="align-middle">{item.qty_t1}</td>
                              <td className="align-middle">{item.pl}</td>
                              <td className="align-middle">
                                {item.side == 10 && "Capital Market"}
                                {item.side == 11 && "Equity Derivatives"}
                                {item.side == 12 && "Currency Derivatives"}
                                {item.side == 20 && "Commodity Derivatives"}
                              </td>
                              <td className="align-middle">{item.isin}</td>
                              <td className="align-middle">
                                {item.collateralQuantity}
                              </td>
                            </tr>
                          );
                        })}
                        {holdings.length == 0 && (
                          <>
                            <tr>
                              <td colSpan="10">No result found</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  <hr />

                  <div class="card">
                    <div class="card-header">Margin Analytics</div>

                    <Table responsive className="text-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Account ID</th>
                          <th>Clear Balance</th>
                          <th>Total Balance</th>
                          <th>Equity Amount</th>
                          <th>Realized PNL</th>
                          <th>Utilized Amount</th>
                          <th>Collaterals</th>
                          <th>Available Balance</th>
                          <th>Fund Transfer</th>
                          <th>Limit at start of the day</th>
                        </tr>
                      </thead>
                      <tbody>
                        {funds?.map((item, index) => {
                          return (
                            <>
                              {item.message === "Success" ? (
                                <tr key={index}>
                                  <td className="align-middle">
                                    {item.user_id}
                                  </td>
                                  <td className="align-middle">
                                    ₹{item.clear_balance}
                                  </td>
                                  <td className="align-middle">
                                    ₹{item.total_balance}
                                  </td>
                                  <td className="align-middle">
                                    ₹{item.equity_amount}
                                  </td>
                                  <td className="align-middle">
                                    ₹{item.r_pnl}
                                  </td>
                                  <td className="align-middle">
                                    ₹{item.utilized_amount}
                                  </td>
                                  <td className="align-middle">
                                    ₹{item.collaterals}
                                  </td>
                                  <td className="align-middle">
                                    ₹{item.available_balance}
                                  </td>
                                  <td className="align-middle">
                                    ₹{item.fund_transfer}
                                  </td>
                                  <td className="align-middle">
                                    ₹{item.limit_start}
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td className="align-middle">
                                    {item.user_id}
                                  </td>
                                  <td colSpan="10" className="align-middle">
                                  {item.message === 'ERR_HTTP_INVALID_HEADER_VALUE' ? 'Please generate token' : item.message}
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                        {funds.length == 0 && (
                          <>
                            <tr>
                              <td colSpan="10">No result found</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              </Tab>
              <Tab eventKey="margin" title="MARGINS">
                <div>
                    
                          <select
                            style={{
                              width: "300px",
                              height: "39px",
                              marginBottom: "2%",
                              marginLeft: "2%",
                              borderRadius: '5%',
                              border: '2px solid #39b8cd',
                              color: 'blue'
                            }}
                            onChange={onChangeAccount}
                          >
                            {
                              decodedNew?.role_id == '1' &&
                              <optgroup label="ALL" id="ALL">
                                All
                                <option value="">All Accounts</option>
                              </optgroup>
                            }
                            {accounts.length > 0 && (
                              <>
                                <optgroup label="PSEUDO" id="PSEUDO">
                                  PSEUDO
                                  {accounts?.map((item) => (
                                    <>
                                      <option value={item.client_id}>
                                        {item.name}
                                      </option>
                                    </>
                                  ))}
                                </optgroup>
                              </>
                            )}
                          </select>
                   
                  <button
                    class="btn"
                    onClick={exportToExcel}
                    data-bs-toggle="tooltip"
                    data-placement="bottom"
                    title="Download in Excel format"
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      width: "100px",
                      marginRight: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    EXCEl
                  </button>
                  <CSVLink
                    class="btn"
                    data-bs-toggle="tooltip"
                    data-placement="bottom"
                    title="Download in CSV format"
                    data={funds}
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      width: "100px",
                      marginRight: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    CSV
                  </CSVLink>
                </div>

                <Card className="h-100">
                  {loader && (
                    <div class="loading">Loading&#8230;</div>
                  )}
                  <Table responsive className="text-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Account ID</th>
                        <th>Clear Balance</th>
                        <th>Total Balance</th>
                        <th>Equity Amount</th>
                        <th>Realized PNL</th>
                        <th>Utilized Amount</th>
                        <th>Collaterals</th>
                        <th>Available Balance</th>
                        <th>Fund Transfer</th>
                        <th>Limit at start of the day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funds?.map((item, index) => {
                        return (
                          <>
                            {item.message === "Success" ? (
                              <tr key={index}>
                                <td className="align-middle">{item.user_id}</td>
                                <td className="align-middle">
                                 ₹{item.clear_balance}
                                </td>
                                <td className="align-middle">
                                  ₹{item.total_balance}
                                </td>
                                <td className="align-middle">
                                  ₹{item.equity_amount}
                                </td>
                                <td className="align-middle">₹{item.r_pnl}</td>
                                <td className="align-middle">
                                  ₹{item.utilized_amount}
                                </td>
                                <td className="align-middle">
                                  ₹{item.collaterals}
                                </td>
                                <td className="align-middle">
                                  ₹{item.available_balance}
                                </td>
                                <td className="align-middle">
                                  ₹{item.fund_transfer}
                                </td>
                                <td className="align-middle">
                                  ₹{item.limit_start}
                                </td>
                              </tr>
                            ) : (
                              <tr>
                                <td className="align-middle">{item.user_id}</td>
                                <td colSpan="10" className="align-middle">
                                  {item.message === 'ERR_HTTP_INVALID_HEADER_VALUE' ? 'Please generate token' : item.message}
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                      {funds.length == 0 && (
                        <>
                          <tr>
                            <td colSpan="10">No result found</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </Table>
                </Card>
              </Tab>
              <Tab eventKey="holdings" title="HOLDINGS">
                <Card className="h-100">
                  {loader && (
                    <div class="loading">Loading&#8230;</div>
                  )}
                  <Col>
                      <button
                        class="btn btn-info"
                        style={{
                          width: "100px",
                          marginRight: "10px",
                          background: "#637381",
                          color: "white",
                          marginBottom: "10px",
                        }}
                      >
                        RESET
                      </button>
                      <button
                        class="btn btn-info"
                        data-id="checkall"
                        value="checkall"
                        
                        style={{
                          width: "100px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        ALL
                      </button>
                      <button
                        class="btn btn-info"
                        data-id="uncheckall"
                        value="uncheckall"
                       
                        style={{
                          width: "100px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        NONE
                      </button>
                      <button
                        class="btn btn-info"
                        
                        style={{
                          width: "160px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        SQUARE OFF
                      </button>
                      <button
                        class="btn btn-success"
                        style={{ width: "140px", marginBottom: "10px" }}
                        
                      >
                        INCREASE
                      </button>
                    </Col>
                    <div>
                      <button
                        class="btn"
                        onClick={exportOrdersToExcel}
                        data-bs-toggle="tooltip"
                        data-placement="bottom"
                        title="Download in Excel format"
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          width: "100px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        EXCEL
                      </button>
                      <CSVLink
                        class="btn"
                        data-bs-toggle="tooltip"
                        data-placement="bottom"
                        title="Download in CSV format"
                        data={holdings}
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          width: "100px",
                          marginRight: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        CSV
                      </CSVLink>
                    </div>
                  <Table responsive className="text-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Symbol</th>
                        <th>Total Qty</th>
                        <th>LTP</th>
                        <th>Curr. Val.</th>
                        <th>T1 Qty.</th>
                        <th>PnL</th>
                        <th>Product</th>
                        <th>ISIN</th>
                        <th>Collateral Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings?.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td className="align-middle">{item.symbol}</td>
                            <td className="align-middle">{item.quantity}</td>
                            <td className="align-middle">{item.ltp}</td>
                            <td className="align-middle">{item.marketVal}</td>
                            <td className="align-middle">{item.qty_t1}</td>
                            <td className="align-middle">{item.pl}</td>
                            <td className="align-middle">
                              {item.side == 10 && "Capital Market"}
                              {item.side == 11 && "Equity Derivatives"}
                              {item.side == 12 && "Currency Derivatives"}
                              {item.side == 20 && "Commodity Derivatives"}
                            </td>
                            <td className="align-middle">{item.isin}</td>
                            <td className="align-middle">
                              {item.collateralQuantity}
                            </td>
                          </tr>
                        );
                      })}
                      {holdings.length == 0 && (
                        <>
                          <tr>
                            <td colSpan="10">No result found</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </Table>
                </Card>
              </Tab>
              <Tab eventKey="notifications" title="NOTIFICATIONS">
                {/* {
                  buyboxShow &&
                  <>
                    <div className="modal show" id="TradeBox" style={{display: 'block'}}>
                      <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                          <div className="modal-header text-left">
                            <button type="button" onClick={CloseTradeBox} className="close" data-dismiss="modal"><i className='bi bi-x-lg text-xl'></i></button>
                          </div>
                        <div className="modal-body"></div>
                        </div>
                      </div>
                    </div>
                  </>
                } */}
                <Card className="h-100">
                  <Table responsive className="text-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>Symbols</th>
                        <th>Client Id</th>
                        <th>Type Order</th>
                        <th>LTP</th>
                        <th>Limit Price / Market Price</th>
                        <th>Quantity</th>
                        <th>Order Date Time</th>
                        <th>Message</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loader ? (
                         <div class="loading">Loading&#8230;</div>
                      ) : (
                        notifications?.map((packageItem, index) => {
                          return (
                            <tr key={index}>
                              <td className="align-middle">
                                {packageItem.symbol}
                              </td>
                              <td className="align-middle">
                                {packageItem.account_id}
                              </td>
                              <td className="align-middle">
                                {packageItem.type == "1" && "Limit Order"}
                                {packageItem.type == "2" && "Market Order"}
                                {packageItem.type == "3" && "Stop Order (SL-M)"}
                                {packageItem.type == "4" &&
                                  "Stoplimit Order (SL-L)"}
                              </td>
                              <td className="align-middle">{packageItem.lp}</td>
                              <td className="align-middle">
                                {packageItem.limit_price}
                              </td>
                              <td className="align-middle">
                                {packageItem.qty}
                              </td>
                              <td className="align-middle">
                                {packageItem.orderDateTime}
                              </td>
                              <td className="align-middle">
                                {packageItem.message}
                              </td>
                              <td className="align-middle">
                                {packageItem.status == 1 && "Canceled"}
                                <h5
                                  style={{
                                    marginLeft: "10px",
                                    color: "green",
                                    fontFamily: "monospace",
                                    fontWeight: 700,
                                  }}
                                >
                                  {packageItem.side == 1 && "Buy"}
                                </h5>
                                <h5
                                  style={{
                                    marginLeft: "10px",
                                    color: "red",
                                    fontFamily: "monospace",
                                    fontWeight: 700,
                                  }}
                                >
                                  {packageItem.side == -1 && "Sell"}
                                </h5>
                                {packageItem.status == 3 &&
                                  "Not used currently"}
                                {packageItem.status == 4 && "Transit"}
                                <h5
                                  style={{
                                    marginLeft: "10px",
                                    color: "black",
                                    fontFamily: "monospace",
                                    fontWeight: 700,
                                  }}
                                >
                                  {packageItem.status == 5 && "Rejected"}
                                </h5>
                                {packageItem.status == 6 && "Pending"}
                                {packageItem.status == 7 && "Expired"}
                                {packageItem.status == 6 && (
                                  <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() =>
                                      cancelOrder(
                                        packageItem.order_id,
                                        packageItem.Client_id
                                      )
                                    }
                                  >
                                    Cancel Order
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                      {orders.length == 0 && (
                        <>
                          <tr>
                            <td colSpan="10">No result found</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </Table>
                </Card>
              </Tab>
            </Tabs>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Trading;
