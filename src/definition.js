export default {
  type: "items",
  component: "accordion",
  items: {
    settings: {
      uses: "settings",
      items: {
        MyTextarea: {
          label:"Vega Specification",
          component: "textarea",
          rows: 30,
          maxlength: 63206,
          ref: "vegaspec"
        }
      }
    }
  }
}
