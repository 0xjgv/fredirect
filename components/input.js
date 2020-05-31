import utilStyles from '../styles/utils.module.css'
import React, { useState } from 'react'
import axios from 'axios'

const initialState = {
  submitted: false,
  submitting: false,
  info: { error: false, message: "" }
};

export default () => {
  const [status, setStatus] = useState(initialState);
  const [redirects, setRedirects] = useState([])
  const [url, setUrl] = useState("")

  const handleError = (error) => {
    const { data: message } = error.response;
    setStatus({
      info: { error: true, message }
    });
    setUrl("")
    setTimeout(() => {
      setStatus({
        info: { error: false, message: "" }
      })
    }, 3000);
  }

  const handleResponse = (res) => {
    const { redirects, error } = res.data;
    if (error) {
      handleError(error);
      setUrl("")
    } else {
      setStatus({
        submitted: true,
        submitting: false,
        info: { error: false, message: ""}
      })
      setRedirects(redirects)
      setUrl("")
    }
  }

  const handleOnSubmit = e => {
    e.preventDefault()
    setStatus(prevStatus => ({ ...prevStatus, submitting: true }))
    axios.get('api/fredirect', { params: { url } })
      .then(handleResponse)
      .catch(handleError)
  }
  const handleOnChange = e => {
    const { value } = e.target
    setUrl(value);
  }

  return <>
    <form className={utilStyles.form} onSubmit={handleOnSubmit}>
      <span>URL</span>
      <input
        id="url"
        type="text"
        onChange={handleOnChange}
        required
        value={url}
      />
      <span type="submit" disabled={status.submitting} onClick={handleOnSubmit}>
        {status.submitting ? 'Submitting...' : 'Submit'}
      </span>
    </form>
    <div className={utilStyles.Error}>
      {status.info.error && (
        <div className="error"><strong>Error:</strong> {status.info.message}</div>
      )}
      {!status.info.error && status.info.msg && <p>{status.info.message}</p>}
    </div>
    {redirects.length > 0 && (
      <div className={utilStyles.Redirects}>
        {redirects.map(({ url, status }, i) =>
          <div key={i}><span>{i+1}.</span><a href={url}>{url}</a><span>{status}</span></div>
        )}
      </div>
    )}
  </>
}