"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

export default function UploadDATEV() {
  const [file, setFile] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Uploading file:", file);
    if (!file) return;

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/upload-datev", { method: "POST", body });
    const json = await res.json();

    setMsg(json.message);

    setFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload a DATEV file</CardTitle>
        <CardDescription>
          Select a file to upload and click the submit button.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-datev-file"
              className="flex cursor-pointer flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">XLS</p>
              </div>
              <input
                id="dropzone-datev-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".xls,.XLS"
              />
            </label>
          </div>
          {file && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button type="submit">Upload</Button>
            </div>
          )}
          {msg && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{msg}</p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function UploadIcon() {
  return (
    <svg
      className="w-10 h-10 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
