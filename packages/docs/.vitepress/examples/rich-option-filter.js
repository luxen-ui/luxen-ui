// Filter used by the "Custom filter" demos of l-combobox and l-select: match the
// label and the text of a rich option's markup (title + description).
const textOf = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent;
};

export const titleAndDescriptionFilter = (item, query) =>
  `${item.label} ${item.html ? textOf(item.html) : ''}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());
