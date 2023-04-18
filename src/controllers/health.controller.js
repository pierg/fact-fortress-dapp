async function healthController(
    req,
    res,
    next
) {
    res.sendStatus(200);
}

module.exports = { healthController }