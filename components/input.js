import utilStyles from '../styles/utils.module.css'
import React, { useState } from 'react'
import axios from 'axios'

export default () => {
  const [redirects, setRedirects] = useState([])
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null }
  })
  const [url, setUrl] = useState("")

  const handleResponse = (res) => {
    const { redirects, error } = res.data;
    if (error) {
      setStatus({
        info: { error: true, msg: error.message }
      })
    } else {
      setStatus({
        submitted: true,
        submitting: false,
        info: { error: false, msg: ""}
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
      .catch(error => {
        setStatus({
          info: { error: true, msg: error.message }
        })
      })
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
        <div className="error">Error: {status.info.msg}</div>
      )}
      {!status.info.error && status.info.msg && <p>{status.info.msg}</p>}
    </div>
    <div className={utilStyles.Redirects}>
      {redirects && (
        redirects.map((url, i) =>
          <div key={i}><span>{i+1}.</span> <a href={url}>{url}</a></div>
        )
      )}
    </div>
  </>
}