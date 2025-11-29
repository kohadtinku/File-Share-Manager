
import React, { useEffect, useState } from "react";
import API from "../api/axios";

const AdminDashboard = () => {
  const [files, setFiles] = useState([]);
  const [sharePopup, setSharePopup] = useState(null);
  const [shareUser, setShareUser] = useState("");

  const loadFiles = async () => {
    const res = await API.get("/files/all");
    setFiles(res.data.files);
  };

  const shareFile = async () => {
    if (!sharePopup) return;

    await API.post(`/files/admin/share/${sharePopup}`, {
      usernameToShare: shareUser,
    });

    alert("File shared successfully");
    setSharePopup(null);
    setShareUser("");
    loadFiles();
  };

  const remove = async (id) => {
    await API.delete(`/files/${id}`);
    loadFiles();
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <>
      {/* MAIN DASHBOARD */}
      <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex justify-center animate-fadeIn">
        <div className="w-full max-w-6xl bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/30 animate-slideUp">
          
          <h2 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
            Admin Dashboard
          </h2>

          <table className="w-full bg-white/40 backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-white/60">
                <th className="p-3 border text-gray-700">Filename</th>
                <th className="p-3 border text-gray-700">Owner</th>
                <th className="p-3 border text-gray-700">Download</th>
                <th className="p-3 border text-gray-700">Share</th>
                <th className="p-3 border text-gray-700">Delete</th>
              </tr>
            </thead>

            <tbody>
              {files.map((f) => (
                <tr
                  key={f._id}
                  className="bg-white/30 hover:bg-white/60 transition-all duration-300"
                >
                  <td className="border p-3">{f.originalName}</td>
                  <td className="border p-3 capitalize">{f.owner.username}</td>

                  <td className="border p-3">
                    <a
                      href={`http://localhost:5000/api/files/download/${f._id}?token=${localStorage.getItem(
                        "token"
                      )}`}
                      className="text-blue-700 font-semibold hover:underline"
                    >
                      Download
                    </a>
                  </td>

                  <td className="border p-3">
                    <button
                      onClick={() => setSharePopup(f._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg transition-all shadow-md"
                    >
                      Share
                    </button>
                  </td>

                  <td className="border p-3">
                    <button
                      onClick={() => remove(f._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg transition-all shadow-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SHARE POPUP */}
      {sharePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-80 animate-scaleUp">
            <h2 className="text-xl font-bold mb-3 text-gray-700">Share File</h2>

            <input
              type="text"
              className="w-full border p-2 mb-3 rounded-lg"
              placeholder="Enter username"
              value={shareUser}
              onChange={(e) => setShareUser(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSharePopup(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>

              <button
                onClick={shareFile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
