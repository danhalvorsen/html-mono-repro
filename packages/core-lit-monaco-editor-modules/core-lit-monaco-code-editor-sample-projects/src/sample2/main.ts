let count = 0;

const output = document.querySelector<HTMLSpanElement>("#count-value");
const button = document.querySelector<HTMLButtonElement>("#increment");

if (output && button) {
  button.addEventListener("click", () => {
    count += 1;
    output.textContent = String(count);
    console.log("count:", count);
  });
}
