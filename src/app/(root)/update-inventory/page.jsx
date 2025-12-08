"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InventoryUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const inputRef = useRef();

  const handleFiles = (selectedFiles) => {
    const arr = Array.from(selectedFiles);
    setFiles(arr);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // get only base64
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");
    setProgress(0);

    try {
      const base64Files = await Promise.all(
        files.map(async (file) => ({
          fileName: file.name,
          fileBase64: await fileToBase64(file),
        }))
      );

      // Send one by one to track progress
      const results = [];
      for (let i = 0; i < base64Files.length; i++) {
        const { fileName, fileBase64 } = base64Files[i];
        const res = await axios.post("/api/inventory/upload", {
          fileName,
          fileBase64,
        });
        results.push(res.data);
        setProgress(Math.round(((i + 1) / base64Files.length) * 100));
      }

      setMessage("Files uploaded and parsed successfully!");
      console.log("Parsed results:", results);
      setFiles([]);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-10 p-4">
      <CardHeader>
        <CardTitle>Upload Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer hover:bg-gray-50 mb-4 relative"
          onClick={() => inputRef.current.click()}
        >
          <p>Drag & drop CSV / PDF / JPG / PNG here or click to select</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".csv,application/pdf,image/jpeg,image/png"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <ul className="mb-4 space-y-1">
            {files.map((file, i) => (
              <li key={i} className="text-sm text-gray-700">
                {file.name}
              </li>
            ))}
          </ul>
        )}

        {uploading && <Progress value={progress} className="mb-4" />}

        <Button onClick={handleSubmit} disabled={uploading} className="w-full">
          {uploading ? `Uploading ${progress}%...` : "Upload"}
        </Button>

        {message && (
          <Alert
            variant={message.includes("Error") ? "destructive" : "default"}
            className="mt-4"
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
