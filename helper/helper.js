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
        code: "en",
      },
    },
  });
}
function getTemplateTextAndImageInput(recipient, templateName, imageLink) {
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
                link: imageLink,
              },
            },
            {
              type: "video",
              video: {
                link: imageLink,
              },
            },
          ],
        },
      ],
    },
  });
}

function getTemplateTextAndVideoInput(recipient, templateName, videoLink) {
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
              type: "video",
              video: {
                link: videoLink,
              },
            },
          ],
        },
      ],
    },
  });
}

module.exports = {
  getCustomTextInput,
  getTemplateTextInput,
  getTemplateTextAndImageInput,
  getTemplateTextAndVideoInput,
};
