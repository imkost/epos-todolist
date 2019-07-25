export default {
  preprocess ({ state, template }) {
    if (template.onCreate) {
      state.onCreate = template.onCreate
      delete template.onCreate
    }
  },

  postprocess ({ state, node }) {
    if (state.onCreate) {
      state.onCreate(node)
    }
  }
}
