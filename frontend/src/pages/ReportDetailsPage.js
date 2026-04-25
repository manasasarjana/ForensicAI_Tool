import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import {
  FileText,
  Download,
  ArrowLeft,
  CheckCircle,
  Clock
} from "lucide-react";

import LoadingSpinner from "../components/UI/LoadingSpinner";
import { toast } from "react-toastify";

const ReportDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery(
    ["report", id],
    async () => {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    {
      refetchInterval: (data) => {
        if (data?.report?.status === "processing") return 3000;
        return false;
      }
    }
  );

  const report = data?.report;

  const handleDownload = async (format = "pdf") => {
    try {
      const token = localStorage.getItem("accessToken");
      const endpoint = format === 'pdf' ? `/api/reports/${id}/download` : `/api/reports/${id}/export/docx`;

      const response = await axios.get(endpoint, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `${report.reportId}.${format}`);

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  const getStatusDisplay = () => {
    const statusConfig = {
      draft: { icon: FileText, color: "text-gray-400", label: "Draft" },
      processing: { icon: Clock, color: "text-orange-400", label: "Processing" },
      completed: { icon: CheckCircle, color: "text-blue-400", label: "Completed" },
      finalized: { icon: CheckCircle, color: "text-green-400", label: "Finalized" }
    };

    const config = statusConfig[report?.status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <div className="flex items-center space-x-2">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <span className="text-dark-100 font-medium">{config.label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error loading report</p>
        <button onClick={() => refetch()} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400">Report not found</p>
        <button onClick={() => navigate("/reports")} className="btn-primary mt-4">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/reports")}
            className="text-primary-400 hover:text-primary-300 flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          <div>
            <h1 className="text-3xl font-bold text-dark-100">{report.title}</h1>
            <p className="text-dark-300 mt-1">
              Case: <span className="font-mono text-primary-400">{report.caseId?.caseId || "N/A"}</span>
            </p>
          </div>
        </div>

        {(report.status === "completed" || report.status === "finalized") && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownload('pdf')}
              className="btn-primary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </button>
            <button
              onClick={() => handleDownload('docx')}
              className="btn-secondary flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              DOCX
            </button>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-dark-400 text-xs mb-1 uppercase tracking-wider">Status</p>
          {getStatusDisplay()}
        </div>
        <div className="card p-4">
          <p className="text-dark-400 text-xs mb-1 uppercase tracking-wider">Investigator</p>
          <p className="text-dark-100 font-medium">
            {report.generatedBy?.firstName} {report.generatedBy?.lastName}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-dark-400 text-xs mb-1 uppercase tracking-wider">Generation Date</p>
          <p className="text-dark-100 font-medium">
            {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-dark-400 text-xs mb-1 uppercase tracking-wider">Integrity Type</p>
          <p className="text-dark-100 font-medium">
            {report.aiGenerated ? "AI-Powered Analysis" : "Manual Technical Entry"}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header border-b border-dark-700">
          <h2 className="text-xl font-semibold text-dark-100">Forensic Evidence Summary</h2>
        </div>

        <div className="card-body space-y-10 text-dark-300">
          {report.content && typeof report.content === 'object' && Object.keys(report.content).length > 0 ? (
            Object.entries(report.content).map(([key, value]) => {
              if (typeof value !== 'string') return null;
              return (
                <div key={key}>
                  <h3 className="text-lg font-bold text-dark-100 mb-3 border-b border-dark-700 pb-1 flex items-center">
                    <div className="h-4 w-1 bg-primary-500 mr-2 rounded-full"></div>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <p className="whitespace-pre-line leading-relaxed">{value}</p>
                </div>
              );
            })
          ) : report.content && typeof report.content === 'string' ? (
            <p className="whitespace-pre-line leading-relaxed">{report.content}</p>
          ) : (
            <div className="text-center py-10 opacity-50">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No technical content has been compiled for this report yet.</p>
            </div>
          )}
        </div>
      </div>

      {report.metadata && (
        <div className="bg-dark-800/50 p-4 rounded-lg border border-dark-700">
          <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-3">System Metadata</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            {report.metadata.processingTime && (
              <div>
                <span className="text-dark-500">Latency:</span>
                <span className="text-dark-200 ml-2">{(report.metadata.processingTime / 1000).toFixed(2)}s</span>
              </div>
            )}
            {report.metadata.wordCount && (
              <div>
                <span className="text-dark-500">Volume:</span>
                <span className="text-dark-200 ml-2">{report.metadata.wordCount} words</span>
              </div>
            )}
            <div>
              <span className="text-dark-500">Format:</span>
              <span className="text-dark-200 ml-2">Forensic-JSON-V1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailsPage;