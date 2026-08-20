document.addEventListener("DOMContentLoaded", (event) => {
  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Animate navigation
  gsap.from("nav", {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
  });

  // Animate headers
  gsap.utils.toArray("h1, h2").forEach((header) => {
    gsap.from(header, {
      scrollTrigger: {
        trigger: header,
        start: "top 85%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });
  });

  // Animate boxes
  gsap.utils.toArray(".box").forEach((box, i) => {
    gsap.from(box, {
      scrollTrigger: {
        trigger: box,
        start: "top 85%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });
  });

  // Animate pro plan cards
  gsap.utils.toArray(".plan-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
      delay: i * 0.2
    });
  });
});
