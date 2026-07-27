import React from "react";
import { useNavigate } from "react-router-dom";
import "./PageHeader.css";

const PageHeader = ({ title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <button
        type="button"
        className="page-header-back"
        aria-label="Go back"
        onClick={() => navigate(-1)}
      >
        ←
      </button>
      <div>
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHeader;
