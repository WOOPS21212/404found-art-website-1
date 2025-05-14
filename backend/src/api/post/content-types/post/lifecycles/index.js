const slugify = require('slugify');

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    if (data.title && !data.slug) {
      data.slug = slugify(data.title, {
        lower: true,     // convert to lower case
        strict: true,    // strip special characters
        trim: true       // trim leading and trailing replacement chars
      });
    }
  },
  beforeUpdate(event) {
    const { data } = event.params;
    if (data.title) {
      data.slug = slugify(data.title, {
        lower: true,
        strict: true,
        trim: true
      });
    }
  },
}; 