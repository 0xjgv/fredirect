import { promises as dns } from "dns";
import crypto from "crypto";

const getDNSRecords = async host => {
  const records = new Set(["MX", "TXT", "SOA", "NS", "LOOKUP"]);
  const functions = Object.keys(dns).reduce((acc, key) => {
    const fn = key.toUpperCase();
    for (let record of records) {
      if (fn.endsWith(record)) {
        records.delete(record);
        acc.push([key, record]);
      }
    }
    return acc;
  }, []);
  const results = await Promise.all(
    functions.map(([fnName, recordName]) =>
      dns[fnName](host)
        .then(v => [recordName, v])
        .catch(() => [])
    )
  );
  return results.reduce((acc, [record, values]) => {
    if (record && values) {
      if (Array.isArray(values)) {
        acc[record] = [].concat(...values);
      } else {
        acc[record] = values;
      }
    }
    return acc;
  }, {});
};

const hashify = object => {
  const stack = Object.values(object);
  const values = [];

  while (stack.length) {
    const value = stack.pop();
    if (Array.isArray(value)) {
      value.forEach(val => stack.push(val));
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(val => stack.push(val));
    } else {
      values.push(value);
    }
  }

  return crypto.createHash("md5").update(values.sort().join("")).digest("hex");
};

const allowCors = fn => async (req, res) => {
  try {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Phisherman"
    );
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS,GET");
    res.setHeader("Access-Control-Allow-Credentials", true);
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    return await fn(req, res);
  } catch (error) {
    console.error({ error });
  }
};

const handler = async (req, res) => {
  try {
    const dnsRecords = await getDNSRecords(req.query.host);
    const hash = hashify(dnsRecords);
    return res.status(200).json({ dnsRecords, hash });
  } catch (error) {
    console.error({ error });
    return res.status(400).send(error);
  }
};

export default allowCors(handler);
