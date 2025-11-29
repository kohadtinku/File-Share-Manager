
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import FileList from "../components/FileList";

const Dashboard = ({ user }) => {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    const res = await API.get("/files/my");
    setFiles(res.data.files);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    await API.post("/files/upload", fd);
    fetchFiles();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/10 animate-fadeIn">

        {/* USER HEADER */}
        <h2 className="text-3xl font-bold text-white mb-6">
          Welcome, <span className="text-blue-400 uppercase">{user.username}</span>
        </h2>

        {/* UPLOAD CARD */}
        <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg mb-6 hover:shadow-blue-500/20 transition-all duration-300">
          <label className="block text-white font-semibold mb-3 text-lg">
            Upload a File
          </label>

          <input
            type="file"
            onChange={upload}
            className="w-full text-white file:bg-blue-600 file:px-4 file:py-2 file:rounded-lg file:hover:bg-blue-700 file:border-none file:text-white cursor-pointer"
          />
        </div>

        {/* FILES HEADER */}
        <h3 className="text-2xl font-semibold text-white mb-4">
          Your Files
        </h3>

        {/* FILE LIST COMPONENT */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg p-4 animate-slideUp">
          <FileList files={files} refresh={fetchFiles} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

