// On stacked layouts the detail panel sits below the list, out of view after a tap.
export default function reveal(el) {
  if (el && el.getBoundingClientRect().top > window.innerHeight * 0.6) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
