export default {
  string: {
    url: () => ({ key: 'invalid' }),
  },
  mixed: {
    required: () => ({ key: 'required' }),
    notOneOf: () => ({ key: 'alreadyExists' }),
  },
};
