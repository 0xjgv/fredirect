import utilStyles from "@/styles/utils.module.css";
import React, { useState } from "react";

const initialState = {
  submitted: false,
  submitting: false,
  info: { error: false, message: "" }
};

const Input = () => {
  const [status, setStatus] = useState(initialState);
  const [redirects, setRedirects] = useState([]);
  const [url, setUrl] = useState("");

  const handleError = error => {
    const { message } = error;
    setStatus({
      info: { error: true, message }
    });
    setUrl("");
    setTimeout(() => {
      setStatus({
        info: { error: false, message: "" }
      });
    }, 3000);
  };

  const handleResponse = res => {
    const { redirects, error } = res;
    const { urls } = redirects;
    if (error) {
      handleError(error);
      setUrl("");
    } else {
      setStatus({
        submitted: true,
        submitting: false,
        info: { error: false, message: "" }
      });
      setRedirects(urls);
      setUrl("");
    }
  };

  const handleOnSubmit = async e => {
    e.preventDefault();
    setStatus(prevStatus => ({ ...prevStatus, submitting: true }));
    try {
      const response = await fetch(`api/fredirect?url=${encodeURIComponent(url)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          origin: "self"
        }
      });
      const data = await response.json();
      handleResponse(data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleOnChange = e => {
    const { value } = e.target;
    setUrl(value);
  };

  const handleClick = ev => {
    ev.preventDefault();
    const { href } = ev.target;
    document.addEventListener(
      "copy",
      e => {
        e.clipboardData.setData("text/plain", href);
        e.preventDefault();
      },
      true
    );
    document.execCommand("copy");
    console.log("copied text : ", href);
    alert("copied text: " + href);
  };

  return (
    <>
      <form className={utilStyles.form} onSubmit={handleOnSubmit}>
        <span>URL</span>
        <input
          id="url"
          type="text"
          onChange={handleOnChange}
          required
          value={url}
        />
        <button
          type="submit"
          disabled={status.submitting}
        >
          {status.submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
      <div className={utilStyles.Error}>
        {status.info.error && (
          <div className="error">
            <strong>Error:</strong> {status.info.message}
          </div>
        )}
        {!status.info.error && status.info.msg && <p>{status.info.message}</p>}
      </div>
      {redirects.length > 0 && (
        <div className={utilStyles.Redirects}>
          {redirects.map(({ url, status, ip }, i) => {
            if (ip) {
              return (
                <div key={i}>
                  <span>
                    <b>{i + 1}</b>.
                  </span>
                  <a onClick={handleClick} href={url}>
                    {url}
                  </a>
                  <span>
                    <b>IP:</b> {ip}
                  </span>
                  <span>
                    <b>Status:</b> {status}
                  </span>
                </div>
              );
            }
            return (
              <div key={i}>
                <span>
                  <b>{i + 1}</b>.
                </span>
                <a onClick={handleClick} href={url}>
                  {url}
                </a>
                <span>
                  <b>IP:</b> 0.0.0.0
                </span>
                <span>
                  <b>Status:</b> {status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Input;
