(function renderSiteConfig(){
  const config = window.SITE_CONFIG;
  if (!config) return;
  const get = (path) => path.split(".").reduce((value, key) => value && value[key], config);
  document.querySelectorAll("[data-site-field]").forEach((node) => {
    const value = get(node.dataset.siteField);
    if (value !== undefined && value !== null) node.textContent = value;
  });
})();
