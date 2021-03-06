const ERROR_MESSAGES = window.nexioErrorMessages || { default_error: 'Something went wrong' };

const toErrorMessage = (attr, err) => {
  // handle case when translated error is set
  if (err && err.includes(' ')) {
    return err;
  }

  return ERROR_MESSAGES[attr] && ERROR_MESSAGES[attr][err] ||
          ERROR_MESSAGES.base && ERROR_MESSAGES.base[err] ||
          ERROR_MESSAGES.default_error;
}

const toErrorLabel = (attr, err) => {
  let node = document.createElement('label');
  node.setAttribute('data-nexio-error', attr);
  node.classList.add('error', 'nexio-error');
  node.innerHTML = toErrorMessage(attr, err);
  return node;
}

export const showError = (fields, attr, err, input) => {
  let label = toErrorLabel(attr, err);

  if (attr === 'base') {
    fields.appendChild(label);
  } else {
    if (input) {
      input.classList.add('error');
      input.parentNode.appendChild(label);
    }
  }
}

export const hideErrors = form => form.querySelectorAll(`[data-nexio-error]`).forEach(node => {
  let parentNode = node.parentNode;
  parentNode.removeChild(node);
  let input = parentNode.querySelector('[name].error');
  if (input) {
    input.classList.remove('error');
  }
});

export const injectScript = src => new Promise(resolve => {
  let fraudScripNode = document.createElement('script');
  fraudScripNode.onload = resolve;
  fraudScripNode.src = src;
  document.body.appendChild(fraudScripNode);
});

const FIELDS = {
  number: 'card_number',
  cc_type: 'card_type',
  name: 'card_name',
  expiry: 'card_expiration',
  verification_value: 'card_code'
};

export const setCardValue = (fields, attr, value) => {
  let selector = FIELDS[attr] || attr;
  let node = fields.querySelector(`[data-hook="${selector}"]`);
  if (node) {
    node.value = value;
    return true
  } else {
    return false;
  }
}

export const getCardData = fields => {
  return Object.entries(FIELDS).reduce((acc, [key, selector]) => {
    let field = fields.querySelector(`[data-hook="${selector}"]`);
    if (field) {
      if (['INPUT', 'SELECT'].includes(field.nodeName)) {
        acc[key] = field.value;
      } else {
        let node = field.querySelector('input[name], select[name]');
        if (node) {
          acc[key] = node.value;
        }
      }
    }
    return acc;
  }, {});
}
