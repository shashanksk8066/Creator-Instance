export const buildButtonTemplate = (text: string, buttonTitle: string, buttonUrl: string) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: text,
        buttons: [
          {
            type: 'web_url',
            url: buttonUrl,
            title: buttonTitle
          }
        ]
      }
    }
  };
};

export const buildTextMessage = (text: string) => {
  return {
    text: text
  };
};
