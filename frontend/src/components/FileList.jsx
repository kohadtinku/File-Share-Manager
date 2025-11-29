import React, { useState } from "react";
import SharePopup from "./SharePopup";

const FileList = ({ files, refresh }) => {
  const [fileToShare, setFileToShare] = useState(null);

  return (
    <div>
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Owner</th>
            <th className="border p-2">Download</th>
            <th className="border p-2">Share</th>
          </tr>
        </thead>

        <tbody>
          {files.map((f) => (
            <tr key={f._id}>
              <td className="border p-2">{f.originalName}</td>
              <td className="border p-2">{f.owner.username}</td>

              <td className="border p-2">
                
                 <a
                href={`http://localhost:5000/api/files/download/${f._id}?token=${localStorage.getItem(
                  "token"
                )}`}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Download
              </a>
              </td>

              <td className="border p-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => setFileToShare(f)}
                >
                  Share
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {fileToShare && (
        <SharePopup
          file={fileToShare}
          refresh={refresh}
          close={() => setFileToShare(null)}
        />
      )}
    </div>
  );
};

export default FileList;
