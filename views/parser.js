;(function($) {

  const urlParser = require('./lib/url-parser')
  const jwtParser = require('./lib/jwt-parser')
  const jsonParser = require('./lib/json-parser')

  const ID = 'PARSER-PLUGIN'

  const createCopyBtn = text => {
    const $btn = $(`<button class="copy-btn">📝</button>`)
    $btn.attr('data-clipboard-text', text)
    return $btn
  }

  class Parser {
    constructor(element) {
      this.el = element
      this.$el = $(element)
      this.$text = null
      this.$results = null

      this.setup()
    }

    setup() {
      this.$text = $('<textarea rows="6" class="tab-focus"></textarea>')
      this.$text.bind('input propertychange', this.start.bind(this))
      this.$text.click(() => this.$text.select())

      this.$results = $('<div class="parser-results"></div>')

      this.$el.append(this.$text)
      this.$el.append(this.$results)
    }

    start() {
      const text = this.$text.val().trim()

      const urlFields = urlParser(text)
      if (urlFields) {
        return this.showUrl(urlFields)
      }

      const jwtFields = jwtParser(text)
      if (jwtFields) {
        return this.showJWT(jwtFields)
      }

      const json = jsonParser(text)
      if (json) {
        return this.showJSON(json, false)
      }
    }

    replaceResult($result) {
      this.$results.empty()
      this.$results.append($result)
      new Clipboard('.copy-btn')
    }

    generateTable(fields) {
      const $table = $('<table></table>')
      fields.forEach(f => {
        const $tr = $('<tr>')
        if (f.heading) {
          const $td = (`<td class="heading">${f.heading}</td>`)
          $tr.append($td)
        } else {
          const $td1 = $(`<td class="key">${f.name}</td>`)
          const $td2 = $(`<td class="copy"></td>`)
          $td2.append(createCopyBtn(f.val))
          const tooltip = f.tooltip ? `data-balloon="${f.tooltip}" data-balloon-pos="right"` : ''
          const $td3 = $(`<td class="val"><span ${tooltip}>${f.val}</span></td>`)
          $tr.append($td1)
          $tr.append($td2)
          $tr.append($td3)
        }
        $table.append($tr)
      })
      this.replaceResult($table)
    }

    showUrl(urlFields) {
      this.generateTable(urlFields)
    }

    showJWT(jwtFields) {
      this.generateTable(jwtFields)
    }

    showJSON(json, isCollapsed) {
      const $pre = '<pre id="json-renderer"></pre>'
      const btnLabel = isCollapsed ? 'Expand All' : 'Collapse All'
      const $btn = $(`<button>${btnLabel}</button>`)
      $btn.click(() => {
        this.showJSON(json, !isCollapsed)
      })

      this.$results.empty()
      this.$results.append($btn)
      this.$results.append($pre)

      $('#json-renderer').jsonViewer(json, { collapsed: isCollapsed })
    }
  }

  $.fn.parser = function() {

    return this.each(function() {
      const parser = $(this).data(ID)
      if (!parser) {
        $(this).data(ID, new Parser(this))
      }
    })

  }

}(jQuery));
