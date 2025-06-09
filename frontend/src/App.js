import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import QRCode from "react-qr-code";
import { Scanner } from '@yudiel/react-qr-scanner';
import FoodSupplyChain from "./FoodSupplyChain.json"

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [itemName, setItemName] = useState("");
  const [origin, setOrigin] = useState("");
  const [items, setItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRData, setCurrentQRData] = useState("");

  // Initialize provider and contract
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const prov = new BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await prov.getSigner();
        const cont = new Contract(CONTRACT_ADDRESS, FoodSupplyChain.abi, signer);
        setProvider(prov);
        setContract(cont);
        setAccount(await signer.getAddress());
      }
    };
    init();
  }, []);

  const addItem = async () => {
    if (!contract) return alert("Contract not loaded");
    const tx = await contract.addItem(itemName, origin);
    await tx.wait();
    alert(`Item added! TX Hash: ${tx.hash}`);
    setItemName("");
    setOrigin("");
    await loadItems();
  };

  const loadItems = async () => {
    if (!contract) return;
    const count = await contract.itemCount();
    const allItems = [];
    for (let i = 0; i < Number(count); i++) {
      const [name, origin, timestamp] = await contract.getItem(i);
      allItems.push({ 
        id: i, 
        name, 
        origin, 
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString() 
      });
    }
    setItems(allItems);
  };

  const generateQRCode = (item) => {
    setCurrentQRData(JSON.stringify({
      id: item.id,
      name: item.name,
      origin: item.origin,
      contractAddress: CONTRACT_ADDRESS
    }));
    setShowQRModal(true);
  };

  const handleScan = (data) => {
    if (data) {
      try {
        const parsed = JSON.parse(data.text);
        setScannedData(parsed);
        setShowScanner(false);
      } catch (e) {
        alert("Invalid QR code");
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">FoodChain Tracker</h1>
      <p className="mb-4">Connected account: {account}</p>

      {/* Add Item Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Add New Item</h2>
        <div className="flex flex-wrap gap-3">
          <input
            className="border p-2 flex-grow rounded"
            placeholder="Item name (e.g., Apple Batch #123)"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            className="border p-2 flex-grow rounded"
            placeholder="Origin (e.g., California, USA)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 px-4 rounded"
            onClick={addItem}
          >
            Add to Blockchain
          </button>
        </div>
      </div>

      {/* Item List Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tracked Items</h2>
          <div className="flex gap-2">
            <button 
              className="bg-green-600 hover:bg-green-700 text-white p-2 px-4 rounded"
              onClick={loadItems}
            >
              Refresh Items
            </button>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 px-4 rounded"
              onClick={() => setShowScanner(true)}
            >
              Scan QR Code
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-gray-600">From: {item.origin}</p>
                  <p className="text-sm text-gray-500">Added: {item.timestamp}</p>
                </div>
                <button 
                  onClick={() => generateQRCode(item)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 h-10 w-10 rounded-full"
                  title="Generate QR"
                >
                  QR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Scan Item QR Code</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <Scanner
    onDecode={handleScan}
    constraints={{ facingMode: "environment" }}
    className="qr-scanner"
  />

            </div>
            <button 
              className="mt-4 bg-red-500 hover:bg-red-600 text-white p-2 w-full rounded"
              onClick={() => setShowScanner(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* QR Display Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Item QR Code</h3>
            <div className="flex justify-center mb-4 p-4 bg-white">
              <QRCode 
                value={currentQRData} 
                size={200}
                level="H"
              />
            </div>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 w-full rounded"
              onClick={() => setShowQRModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Scanned Data Display */}
      {scannedData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Scanned Item Details</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {scannedData.name}</p>
              <p><strong>Origin:</strong> {scannedData.origin}</p>
              <p><strong>Contract:</strong> {scannedData.contractAddress}</p>
            </div>
            <button 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white p-2 w-full rounded"
              onClick={() => setScannedData(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
