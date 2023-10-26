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
        name: templateName,
        language: {
          code: "en_US",
        },
      },
    });
  }
  function getTemplateTextAndImageInput(recipient, templateName,imageLink) {
    return JSON.stringify({
      messaging_product: "whatsapp",
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "en",
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  link: imageLink
                }
              }
            ]
          }]
      },
    });
  }
  
  module.exports = { getCustomTextInput, getTemplateTextInput, getTemplateTextAndImageInput };
  