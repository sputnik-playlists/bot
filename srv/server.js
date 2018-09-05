const fs = require("fs")
const express = require("express")
const auth = require("./auth")

const port = 8080
const app = express()
const authUrl = auth.auth()

app.get("/", (req, res) => res.send(authUrl))
app.get("/success", (req, res) => {
  const code = req.query.code
  fs.writeFileSync(".code", code)
  res.send("Success")
})

app.listen(port, () => console.log(`Listening on port ${port}...`))
