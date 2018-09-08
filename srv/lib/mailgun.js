const mailgun = require("mailgun-js")

/**
 * Send mail via mailgun API.
 *
 * @param html - Mail body.
 */
exports.send = html => {
  let config = require("../config.json")
  let local = {}

  try {
    local = require("../config.local.json")
  } catch (e) {}

  config = { ...config, ...local }

  // Exit early if mail config is not specified.
  if (!config || !config.mail || !config.mail.enable) return
  const { apiKey, domain, from, to, subject } = config.mail
  const client = mailgun({ apiKey, domain })
  const data = { from, to, subject, html }
  client.messages().send(data, (error, body) => {
    if (error) console.log(error)
    if (body) console.log(body.message)
  })
}
