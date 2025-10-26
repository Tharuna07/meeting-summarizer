import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000/api";

function App() {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
    // Auto-refresh meetings every 5 seconds to show updated status
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/meetings`);
        setMeetings(response.data.meetings);
        // If there's a selected meeting, update it too
        if (selectedMeeting) {
          const updatedMeeting = response.data.meetings.find(
            (m) => m._id === selectedMeeting._id
          );
          if (updatedMeeting) {
            setSelectedMeeting(updatedMeeting);
          }
        }
      } catch (error) {
        console.error("Error auto-refreshing meetings:", error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedMeeting?._id]);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings`);
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingClick = async (meeting) => {
    setSelectedMeeting(meeting);
    // Refresh meetings to get latest data
    await fetchMeetings();
    // Re-select the same meeting with updated data
    const updatedMeetings = await axios.get(`${API_BASE_URL}/meetings`);
    const updatedMeeting = updatedMeetings.data.meetings.find(
      (m) => m._id === meeting._id
    );
    if (updatedMeeting) {
      setSelectedMeeting(updatedMeeting);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

    try {
      const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload successful:", response.data);
      fetchMeetings(); // Refresh the list
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      event.target.value = ""; // Reset file input
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "transcribing":
        return "status-transcribing";
      case "failed":
        return "status-failed";
      default:
        return "status-uploaded";
    }
  };

  const formatDate = (dateString) => {
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString()
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="loading"></div>
          <p>Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1>🎙️ Meeting Summarizer</h1>
          <p>
            Upload audio files and get AI-generated summaries with action items
          </p>
        </div>
      </header>

      <main className="container">
        {/* Upload Section */}
        <div className="card">
          <h2>Upload Meeting Audio</h2>
          <div className="upload-section">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="file-input"
            />
            {uploading && (
              <div className="upload-status">
                <div className="loading"></div>
                <span>Uploading and processing...</span>
              </div>
            )}
          </div>
          <p className="upload-help">
            Supported formats: MP3, MP4, M4A, WAV, OGG (Max 25MB)
          </p>
        </div>

        {/* Meetings List */}
        <div className="card">
          <h2>Your Meetings</h2>
          {meetings.length === 0 ? (
            <p>
              No meetings uploaded yet. Upload your first meeting audio above!
            </p>
          ) : (
            <div className="meetings-list">
              {meetings.map((meeting) => (
                <div
                  key={meeting._id}
                  className={`meeting-item ${
                    selectedMeeting?._id === meeting._id ? "selected" : ""
                  }`}
                  onClick={() => handleMeetingClick(meeting)}
                >
                  <div className="meeting-header">
                    <h3>{meeting.title || "Untitled Meeting"}</h3>
                    <span
                      className={`status-badge ${getStatusColor(
                        meeting.status
                      )}`}
                    >
                      {meeting.status}
                    </span>
                  </div>
                  <p className="meeting-date">
                    {formatDate(meeting.uploadDate)}
                  </p>
                  {meeting.metadata?.duration && (
                    <p className="meeting-duration">
                      Duration: {Math.round(meeting.metadata.duration / 60)}{" "}
                      minutes
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meeting Details */}
        {selectedMeeting && (
          <div className="card">
            <h2>Meeting Details: {selectedMeeting.title}</h2>

            {selectedMeeting.status === "failed" && (
              <div className="error-message">
                <strong>Processing Failed:</strong> {selectedMeeting.error}
              </div>
            )}

            {selectedMeeting.status === "completed" && (
              <>
                {/* Summary */}
                {selectedMeeting.summary && (
                  <div className="summary-section">
                    <h3>📝 Summary</h3>
                    <div className="summary-content">
                      {selectedMeeting.summary}
                    </div>
                  </div>
                )}

                {/* Key Decisions */}
                {selectedMeeting.decisions?.length > 0 && (
                  <div className="decisions-section">
                    <h3>🎯 Key Decisions</h3>
                    <ul>
                      {selectedMeeting.decisions.map((decision, index) => (
                        <li key={index}>{decision}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {selectedMeeting.actionItems?.length > 0 && (
                  <div className="action-items-section">
                    <h3>✅ Action Items</h3>
                    <div className="action-items-list">
                      {selectedMeeting.actionItems.map((item, index) => (
                        <div
                          key={index}
                          className={`action-item ${
                            item.completed ? "completed" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={async (e) => {
                              try {
                                await axios.put(
                                  `${API_BASE_URL}/meetings/${selectedMeeting._id}/action-items/${item._id}`,
                                  { completed: e.target.checked }
                                );
                                fetchMeetings();
                                setSelectedMeeting({
                                  ...selectedMeeting,
                                  actionItems: selectedMeeting.actionItems.map(
                                    (ai) =>
                                      ai._id === item._id
                                        ? { ...ai, completed: e.target.checked }
                                        : ai
                                  ),
                                });
                              } catch (error) {
                                console.error(
                                  "Error updating action item:",
                                  error
                                );
                              }
                            }}
                          />
                          <span className="action-text">{item.text}</span>
                          {item.owner && (
                            <span className="action-owner">
                              Owner: {item.owner}
                            </span>
                          )}
                          {item.dueDate && (
                            <span className="action-due">
                              Due: {formatDate(item.dueDate)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {selectedMeeting.transcript && (
                  <div className="transcript-section">
                    <h3>📄 Full Transcript</h3>
                    <div className="transcript-content">
                      {selectedMeeting.transcript}
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedMeeting.status === "transcribing" && (
              <div className="processing-status">
                <div className="loading"></div>
                <p>Transcribing audio... This may take a few minutes.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
