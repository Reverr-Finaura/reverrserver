function getCustomTextInput(recipient, text) {
    return JSON.stringify({
      messaging_product: "whatsapp",
      preview_url: false,
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: {
        body: text,
      },
    });
  }
  
  function getTemplateTextInput(recipient, templateName) {
    return JSON.stringify({
      messaging_product: "whatsapp",
      to: recipient,
      type: "template",
      template: {
        name: "hello_world",
        language: {
          code: "en_US",
        },
      },
    });
  }
  
  module.exports = { getCustomTextInput, getTemplateTextInput };
  