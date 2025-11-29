import React, { useState } from "react";
import API from "../api/axios";

const SharePopup = ({ file, close, refresh }) => {
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");

  const shareFile = async () => {
    try {
      await API.post(`/files/share/${file._id}`, {
        usernameToShare: username,
      });
      setMsg("File shared!");
      refresh();
    } catch (e) {
      setMsg(e.response?.data?.message || "Error");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-3xl  bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-80">
        <h3 className="text-lg font-bold mb-3">Share File</h3>

        <input
          type="text"
          placeholder="Enter username"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setUsername(e.target.value)}
        />

        <button
          onClick={shareFile}
          className="w-full bg-blue-600 text-white p-2 rounded mb-2"
        >
          Share
        </button>

        <button
          onClick={close}
          className="w-full bg-gray-500 text-white p-2 rounded"
        >
          Close
        </button>

        {msg && <p className="text-green-600 mt-2">{msg}</p>}
      </div>
    </div>
  );
};

export default SharePopup;
