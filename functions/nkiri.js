const rp = require('request-promise')
const cheerio = require('cheerio')
const nkiriDB = require('../models/nkiri')

const nkiriFetch = async (dt, bot) => {
    try {
        let url = 'http://nkiri.com/'
        let html = await rp(url)
        let $ = cheerio.load(html)

        let dramas = $('#eael-post-grid-7643917 article')

        dramas.each(async (i, el) => {
            if (i < 3) {
                let dramaName = $('.eael-entry-header h2 a', el).text()
                let link = $('.eael-entry-header h2 a', el).attr('href')
                let id = $(el).attr('data-id')

                //check if notified
                let ch = await nkiriDB.findOne({ id, dramaName })
                if (!ch) {
                    await nkiriDB.create({ id, dramaName })
                    let txt = `<b>🆕 ${dramaName}</b>`
                    await bot.telegram.sendMessage(-1002079073174, txt, { parse_mode: 'HTML', reply_markup: {inline_keyboard: [[{text: 'Home', url}, {text: 'Drama', url: link}]]} })
                } else {
                    console.log('No new drama found')
                    await bot.telegram.sendMessage(dt.shd, 'No new drama', {disable_notification: true})
                }
            }
        })

    } catch (err) {
        console.log(err.message, err)
        await bot.telegram.sendMessage(-1002079073174, err.message)
    }
}

module.exports = {
    nkiriFetch
}