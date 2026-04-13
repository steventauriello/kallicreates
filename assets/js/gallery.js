document.addEventListener("DOMContentLoaded", function () {
  const zoomContainers = document.querySelectorAll(".zoom-container");

  zoomContainers.forEach((container) => {
    const img = container.querySelector(".zoom-image");
    if (!img) return;

    container.addEventListener("mousemove", function (e) {
      const rect = container.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = "scale(2)";
    });

    container.addEventListener("mouseleave", function () {
      img.style.transformOrigin = "center center";
      img.style.transform = "scale(1)";
    });
  });
});