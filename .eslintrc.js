module.exports = {
  root: true,
  env: {
    browser: true,
    node: true, // ✅ Add this line
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // add any custom rules if needed
  }
}
